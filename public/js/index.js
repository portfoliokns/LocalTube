document.querySelectorAll('.watch-btn').forEach(button => {
  button.addEventListener('click', (event) => {
    event.preventDefault();

    const videoID = event.target.getAttribute('videoID');
    const startTime = event.target.getAttribute('start');
    const endTime = event.target.getAttribute('end');

    const url =  `/clip_redirect?videoID=${videoID}&start=${startTime}&end=${endTime}`;
    window.open(url, '_blank');
  });
});

document.querySelectorAll('.edit-btn').forEach(button => {
  button.addEventListener('click', (event) => {
    event.preventDefault();

    const id = event.target.getAttribute('id');
    window.location.href = `/edit/${id}`; 
  })
})

document.querySelectorAll('.delete-btn').forEach(button => {
  button.addEventListener('click', (event) => {
    event.preventDefault();

    const id = event.target.getAttribute('id');
    if (confirm('本当に削除してもよろしいですか？')) {
      fetch(`/clips/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('削除が完了しました。');
          const clipElement = event.target.closest('.clip');
          if (clipElement) {
            clipElement.remove();
          }
        } else {
          alert('削除に失敗しました。');
        }
      })
      .catch(error => {
        console.error('エラー:', error);
        alert('削除処理中にエラーが発生しました。');
      });
    }
  });
});


