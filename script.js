// Load today's challenge
fetch('challenges.json')
  .then(res => res.json())
  .then(data => {
    const todayIndex = new Date().getDate() % data.length;
    document.getElementById('challenge-text').textContent = data[todayIndex];
  });

// Track progress
let completedCount = localStorage.getItem('completedCount') || 0;
document.getElementById('completed-count').textContent = completedCount;

document.getElementById('complete-btn').addEventListener('click', () => {
  completedCount++;
  localStorage.setItem('completedCount', completedCount);
  document.getElementById('completed-count').textContent = completedCount;
  alert('Great! You’ve completed today’s challenge 🎉');
});
