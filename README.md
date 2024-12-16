# このアプリケーションについて
これは"YouTubeExtension"のクリップを個別(自身のPCストレージ)に保存・管理することのできるアプリです。機能は以下の通りです。
- 擬似クリップ情報保存機能
  - "YouTubeExtension"から擬似クリップの情報を受け取り、保存できます。
- 擬似クリップ情報管理機能
  - 保存した擬似クリップ情報の一覧を確認できます。
  - 擬似クリップ情報の編集ができます。主に保存された内容の書き換えや削除ができます。
- 動画視聴機能
  - 保存した擬似クリップを視聴することができます。視聴するには"YouTubeExtension"の拡張機能をあらかじめインストールしておく必要があります。
  - 擬似クリップの動画(全編)を視聴することができます。
  - 視聴する際はYouTubeページ上からの視聴となります。
※状況に応じて、機能をアップデートしていく予定です。

# 事前準備
## Node.jsのインストール
[Node公式サイト](https://nodejs.org/en)からv22.11.0をインストールしてください。v22.11.0である理由は、開発時点でv22.11.0のバージョンを利用していたためです。

## LocalTubeのファイルをダウンロード
GitHubから拡張ファイルをダウンロードしてください。

または以下のコマンドを実行し、LocalTubeをクローンしてください。
```
git clone https://github.com/portfoliokns/LocalTube.git
```

「LocalTube」フォルダの中に、以下のファイルがあればダウンロード完了となります。
- public
- uploads
- views
- server.js

## "YouTubeExtension"のインストール
設定等は[YouTubeExtensionのReadMe](https://github.com/portfoliokns/YoutubeExtension)をご確認ください。

# 使い方
## ローカルサーバーの起動
ターミナル上から以下のプロンプトで実行することができます。
```:起動プロンプト
nodemon server.js
```
「サーバーが起動しました/データベースへの接続に成功しました」が表示されれば、ローカルサーバーの起動が成功になります。

## Webページの表示
chromeのアドレスバーに以下のアドレスを入力して、ローカルサーバーにアクセスしてください。
```:アドレス
http://localhost:6789/
```
擬似クリップ情報の一覧が表示されます。

## 擬似クリップの視聴
ローカルサーバーを起動した状態で視聴ボタンをクリックしてください。YouTubeのページが開き、"YouTubeExtension"の制御によって擬似クリップの視聴ができます。

## 動画の視聴
videoIDをクリックしてください。YouTubeのページが開き、その動画を視聴することができます。

## 擬似クリップ情報の編集
編集ボタンをクリックすると、編集ページが表示されます。詳細を編集後、保存ボタンをクリックすると、編集した内容が保存されます。

## 擬似クリップの削除
削除ボタンをクリックすると、メッセージが表示されます。メッセージの案内に従い、削除を続行すると、擬似クリップ情報が削除されます。なお一度削除してしまった場合、復旧することはできません。

# 免責事項
- この拡張機能はGitHub上で公開されています。この拡張機能を使用したことにより発生した被害や損害について、このアプリの開発者は一切関与致しません。
- YouTubeページ側の仕様変更や運営方針の変更などにより、正しく拡張機能が起動しなくなる場合があります。
