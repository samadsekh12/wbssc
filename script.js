// আজকের চ্যালেঞ্জ লোড করা
fetch('challenges.json')
  .then(res => res.json())
  .then(data => {
    const todayIndex = new Date().getDate() % data.length;
    document.getElementById('challenge-text').textContent = data[todayIndex];
  });

// প্রগ্রেস ট্র্যাক করা
let completedCount = localStorage.getItem('completedCount') || 0;
document.getElementById('completed-count').textContent = completedCount;

document.getElementById('complete-btn').addEventListener('click', () => {
  completedCount++;
  localStorage.setItem('completedCount', completedCount);
  document.getElementById('completed-count').textContent = completedCount;
  alert('দারুণ! তুমি আজকের চ্যালেঞ্জ সম্পন্ন করেছো 🎉');
});
