const express = require('express');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 6789;

// データベースの接続
const db = new sqlite3.Database('./youtube.db', (err) => {
  if (err) {
    console.error('データベース接続エラー:', err);
  } else {
    console.log('データベースへの接続に成功しました');
  }
});

// テーブル作成
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS clips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    videoID TEXT NOT NULL,
    start_time INTEGER NOT NULL,
    end_time INTEGER NOT NULL,
    image_url TEXT
  )`);
});

// `multer` の設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // 画像ファイルを保存するディレクトリ
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // ファイル名にタイムスタンプを追加
  }
});

const upload = multer({ storage: storage });

// CORS設定（chrome-extension:// のみを許可）
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin.startsWith('chrome-extension://') || origin === `http://localhost:${port}`) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy error: Origin not allowed'), false);
    }
  },
  methods: ['POST','DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// JSONボディを解析するためのミドルウェア
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// `POST` リクエストを受け取るエンドポイント
app.post('/images', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json('画像ファイルが送信されていません。');
  }

  const title = req.body.title;
  const videoID = req.body.videoID;
  const start_time = req.body.start_time;
  const end_time = req.body.end_time;

  // タイトル、開始時刻、終了時刻が欠けている場合
  if (!title || !videoID || !start_time || !end_time) {
    return res.status(400).json('タイトル、開始時刻、終了時刻は必須です。');
  }

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // アップロードされた画像のURL

  // データをデータベースに挿入
  const stmt = db.prepare("INSERT INTO clips (title, videoID, start_time, end_time, image_url) VALUES (?, ?, ?, ?, ?)");
  stmt.run(title, videoID, start_time, end_time, imageUrl, (err) => {
    if (err) {
      console.error('データ挿入エラー:', err);
      res.status(500).json('データベースへの登録にエラーが生じています。');
    } else {
      console.log('データが挿入されました');
      res.status(201).json('画像が登録されました。');
    }
  });
  stmt.finalize();
});

// クリップ削除処理
app.delete('/clips/:id', (req, res) => {
  const clipId = req.params.id;  // URLパラメータからIDを取得
  
  // トランザクションの開始
  db.serialize(() => {
    // トランザクション開始
    db.run('BEGIN TRANSACTION');

    // データベースでIDに基づいて画像のパスを取得する
    db.get('SELECT image_url FROM clips WHERE id = ?', [clipId], (err, row) => {
      if (err) {
        // エラーが発生した場合はロールバック
        db.run('ROLLBACK');
        console.error('データベースエラー:', err);
        return res.status(500).json({ success: false, message: '削除に失敗しました。' });
      }

      if (!row) {
        // クリップが見つからない場合もロールバック
        db.run('ROLLBACK');
        return res.status(404).json({ success: false, message: '指定されたIDのクリップが見つかりません。' });
      }

      console.log(row)

      const imagePath = row.image_url;  // 画像のパスを取得

      // 画像ファイルを削除
      console.log(imagePath)
      fs.unlink(path.join(__dirname, imagePath), (err) => {
        if (err) {
          // 画像削除に失敗した場合もロールバック
          db.run('ROLLBACK');
          console.error('画像削除エラー:', err);
          return res.status(500).json({ success: false, message: '画像削除に失敗しました。' });
        }

        console.log(`画像ファイル (${imagePath}) が削除されました`);

        // 画像削除が成功したら、データベースからクリップを削除
        db.run('DELETE FROM clips WHERE id = ?', [clipId], (err) => {
          if (err) {
            // レコード削除に失敗した場合もロールバック
            db.run('ROLLBACK');
            console.error('レコード削除エラー:', err);
            return res.status(500).json({ success: false, message: 'クリップ削除に失敗しました。' });
          }

          // 両方の操作が成功したらコミット
          db.run('COMMIT');
          console.log(`ID: ${clipId} のクリップが削除されました`);
          return res.json({ success: true, message: 'クリップが削除され、画像も削除されました。' });
        });
      });
    });
  });
});


app.use('/uploads', express.static('uploads'));

// 静的ファイルを提供する
app.use(express.static(path.join(__dirname, 'public')));

// テンプレートエンジンとしてEJSを設定
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // viewsフォルダの指定

// ルートパスでレスポンス
app.get('/', (req, res) => {
  db.all("SELECT * FROM clips ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).send('データベースエラー');
    }

    const formattedClips = rows.map(clip => ({
      ...clip, // 既存のデータを保持
      youtube_url: `https://www.youtube.com/watch?v=${clip.videoID}`, //URLリンク
      original_start_time: clip.start_time, // フォーマット前の開始時刻
      original_end_time: clip.end_time, // フォーマット前の終了時刻
      start_time: formatTime(clip.start_time), // 開始時刻をフォーマット
      end_time: formatTime(clip.end_time), // 終了時刻をフォーマット
    }));

    // EJSテンプレートにデータを渡してHTMLを返す
    res.render('index', { clips: formattedClips });
  });
});

app.get('/clip_redirect', (req, res) => {
    res.render('clip_redirect');
});

// サーバー起動
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
  console.log("サーバーが起動しました")
});

// 秒を "MM:SS" フォーマットに変換する関数
function formatTime(seconds) {
  // 秒数の整数部分と小数部分を分ける
  const totalSeconds = Math.floor(seconds); // 整数部分 (秒)
  const milliseconds = Math.round((seconds - totalSeconds) * 1000); // 小数部分をミリ秒に変換

  // 時間、分、秒を計算
  const hours = Math.floor(totalSeconds / 3600); // 時間
  const minutes = Math.floor((totalSeconds % 3600) / 60); // 分
  const remainingSeconds = totalSeconds % 60; // 秒

  // 各部分を2桁、ミリ秒は3桁にする
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  const formattedMilliseconds = String(milliseconds).padStart(3, '0');

  // フォーマットした時間を「H:MM:SS:SSS」として返す
  return `${hours}:${formattedMinutes}:${formattedSeconds}:${formattedMilliseconds}`;
}
