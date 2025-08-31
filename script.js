const mainVideo = document.getElementById('mainVideo');
const videoTitle = document.getElementById('videoTitle');
const playlistItems = document.querySelectorAll('.playlist-item');

playlistItems.forEach(item => {
  item.addEventListener('click', () => {
    const src = item.getAttribute('data-src');
    const title = item.getAttribute('data-title');
    const poster = item.getAttribute('data-poster');

    // Change main video source
    mainVideo.pause();
    mainVideo.setAttribute('poster', poster);
    mainVideo.querySelectorAll('source').forEach(s => s.remove());

    const source = document.createElement('source');
    source.src = src;
    source.type = 'video/mp4';
    mainVideo.appendChild(source);

    mainVideo.load();
    mainVideo.play();

    // Update title
    videoTitle.textContent = title;
  });
});
