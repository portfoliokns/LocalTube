// モーダルを表示する処理
document.querySelectorAll('.lightbox').forEach(item => {
  item.addEventListener('click', (event) => {
    event.preventDefault(); // デフォルトのリンク動作を防ぐ

    // モーダルを表示
    let modal = document.createElement('div');
    modal.classList.add('modal');

    // モーダル内に画像を挿入
    let img = document.createElement('img');
    img.src = item.href; // クリックした画像のリンク先
    modal.appendChild(img);
    
    // 閉じるボタンを追加
    let closeBtn = document.createElement('span');
    closeBtn.classList.add('close-btn');
    closeBtn.innerHTML = '&times;';
    modal.appendChild(closeBtn);

    // モーダルをページに追加
    document.body.appendChild(modal);

    // 閉じるボタンをクリックしたときの処理
    closeBtn.addEventListener('click', () => {
      modal.remove(); // モーダルを削除
    });

    // モーダルの外側をクリックした場合にモーダルを閉じる処理
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove(); // モーダルを削除
      }
    });

    modal.style.display = 'flex';  // モーダルを表示する
  });
});

document.querySelectorAll('.save_btn').forEach(button => {
  button.addEventListener('click', (event) => {
    event.preventDefault();

    const id = event.target.getAttribute('id');
    const form = event.target.closest('form');
    const title = form.querySelector('#title').value;
    const videoID = form.querySelector('#videoID').value;
    const startInput = form.querySelectorAll('.start_time');
    const startTime = Array.from(startInput).map(input => input.value).join(":");
    const endInput = form.querySelectorAll('.end_time');
    const endTime = Array.from(endInput).map(input => input.value).join(":");

    if (confirm('保存してもよろしいですか？')) {
      fetch(`/clips/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          videoID: videoID,
          start_time: startTime,
          end_time: endTime
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('保存が完了しました。');
          const clipElement = event.target.closest('.clip');
          if (clipElement) {
            clipElement.remove();
          }
        } else {
          alert('保存に失敗しました。');
        }
      })
      .catch(error => {
        console.error('エラー:', error);
        alert('保存処理中にエラーが発生しました。');
      });
    }

  });
});