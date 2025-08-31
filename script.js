// Idle timer
let seconds = 0;
const idleEl = document.getElementById('idleTimer');

function updateTimer() {
  seconds++;
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  idleEl.textContent = `${hrs}:${mins}:${secs}`;
}

setInterval(updateTimer, 1000);
