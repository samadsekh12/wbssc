const display = document.getElementById('display');
const buttons = document.querySelectorAll('.buttons button');
const calculator = document.getElementById('calculator');
const vault = document.getElementById('vault');
const logoutBtn = document.getElementById('logout');

const SECRET_PIN = "1234"; // Change this to your secret code

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const value = btn.textContent;

    if (value === 'C') {
      display.value = '';
    } else if (value === 'OK') {
      if (display.value === SECRET_PIN) {
        calculator.classList.add('hidden');
        vault.classList.remove('hidden');
      } else {
        try {
          display.value = eval(display.value) || '';
        } catch {
          display.value = 'Error';
        }
      }
    } else {
      display.value += value;
    }
  });
});

logoutBtn.addEventListener('click', () => {
  vault.classList.add('hidden');
  calculator.classList.remove('hidden');
  display.value = '';
});
