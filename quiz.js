(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

  function formatTime(sec){
    const m = Math.floor(sec/60).toString().padStart(2,'0');
    const s = (sec%60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }

  function initQuiz(config){
    if(!config || !Array.isArray(config.questions) || config.questions.length===0){
      document.body.innerHTML = '<div style="padding:20px">কোনো প্রশ্ন পাওয়া যায়নি।</div>';
      return;
    }

    const state = {
      idx: 0,
      selected: Array(config.questions.length).fill(null),
      checked: Array(config.questions.length).fill(false),
      correct: Array(config.questions.length).fill(false),
      start: Date.now(),
      elapsedSec: 0,
      submitted: false
    };

    document.title = `${config.title} | WBSSC Prep`;

    const root = document.createElement('div');
    root.className = 'container';

    const topbar = document.createElement('div');
    topbar.className = 'topbar';
    topbar.innerHTML = `
      <div class="badge">ক্যাটেগরি: <strong>${config.title}</strong></div>
      <div class="badge">প্রশ্ন: <span id="qpos">1/${config.questions.length}</span></div>
      <div class="badge timer">সময়: <span id="timer">00:00</span></div>
      <div class="badge">স্কোর: <span id="score">0</span></div>
      <div class="progress" style="flex:1 1 100%;"><div id="progbar"></div></div>
    `;

    const quizCard = document.createElement('div');
    quizCard.className = 'quiz-card';
    quizCard.innerHTML = `
      <p id="qtext" class="q-text"></p>
      <ul id="opts" class="options"></ul>
      <div id="explain" class="explain" style="display:none;"></div>
      <div class="controls">
        <button id="prevBtn">← আগের</button>
        <button id="checkBtn" class="primary">চেক করুন</button>
        <button id="nextBtn">পরের →</button>
        <button id="submitBtn" class="success">সাবমিট</button>
      </div>
    `;

    const summary = document.createElement('div');
    summary.className = 'summary';
    summary.style.display = 'none';
    summary.innerHTML = `
      <h3>ফলাফল</h3>
      <div class="kpi">
        <div class="pill">মোট প্রশ্ন: <strong>${config.questions.length}</strong></div>
        <div class="pill">সঠিক: <strong id="sumCorrect">0</strong></div>
        <div class="pill">ভুল/ফাঁকা: <strong id="sumWrong">0</strong></div>
        <div class="pill">সময়: <strong id="sumTime">00:00</strong></div>
      </div>
      <div style="margin-top:8px">
        স্কোর: <strong id="sumScore" class="score-good">0</strong> /
        <strong>${config.questions.length}</strong>
      </div>
      <div style="margin-top:10px">
        <button id="reviewBtn">রিভিউ মোড</button>
        <button id="restartBtn">পুনরায় দিন</button>
      </div>
    `;

    root.appendChild(topbar);
    root.appendChild(quizCard);
    root.appendChild(summary);
    document.body.innerHTML = '';
    document.body.appendChild(root);

    const qpos = $('#qpos', topbar);
    const timerEl = $('#timer', topbar);
    const scoreEl = $('#score', topbar);
    const progbar = $('#progbar', topbar);

    const qtext = $('#qtext', quizCard);
    const optsEl = $('#opts', quizCard);
    const explainEl = $('#explain', quizCard);
    const prevBtn = $('#prevBtn', quizCard);
    const nextBtn = $('#nextBtn', quizCard);
    const checkBtn = $('#checkBtn', quizCard);
    const submitBtn = $('#submitBtn', quizCard);

    const sumCorrect = $('#sumCorrect', summary);
    const sumWrong = $('#sumWrong', summary);
    const sumTime = $('#sumTime', summary);
    const sumScore = $('#sumScore', summary);
    const reviewBtn = $('#reviewBtn', summary);
    const restartBtn = $('#restartBtn', summary);

    const timer = setInterval(()=>{
      if(state.submitted) return;
      state.elapsedSec = Math.floor((Date.now() - state.start)/1000);
      timerEl.textContent = formatTime(state.elapsedSec);
    }, 1000);

    function updateProgress(){
      const answered = state.selected.filter(v=>v!==null).length;
      const pct = Math.round((answered / config.questions.length) * 100);
      progbar.style.width = pct + '%';
    }

    function renderQuestion(){
      const i = state.idx;
      const q = config.questions[i];

      qpos.textContent = `${i+1}/${config.questions.length}`;
      qtext.textContent = q.q;

      optsEl.innerHTML = '';
      q.options.forEach((opt, idx)=>{
        const li = document.createElement('li');
        li.className = 'option';
        if(state.checked[i]){
          if(idx === q.answer) li.classList.add('correct');
          if(state.selected[i] === idx && state.selected[i] !== q.answer) li.classList.add('incorrect');
        }
        const id = `opt_${i}_${idx}`;
        li.innerHTML = `
          <label for="${id}">
            <input type="radio" id="${id}" name="opt" ${state.selected[i]===idx?'checked':''} />
            <span>${String.fromCharCode(65+idx)}. ${opt}</span>
          </label>
        `;
        li.querySelector('input').addEventListener('change', ()=>{
          state.selected[i] = idx;
          updateProgress();
        });
        optsEl.appendChild(li);
      });

      if(state.checked[i]){
        explainEl.style.display = 'block';
        explainEl.innerHTML = `<strong>ব্যাখ্যা:</strong> ${q.explanation || '—'}`;
      }else{
        explainEl.style.display = 'none';
        explainEl.innerHTML = '';
      }

      prevBtn.disabled = (i===0);
      nextBtn.disabled = (i===config.questions.length-1);
      scoreEl.textContent = state.correct.filter(Boolean).length.toString();
      updateProgress();
    }

    function checkCurrent(){
      const i = state.idx;
      const q = config.questions[i];
      const sel = state.selected[i];
      if(sel===null){
        alert('একটি অপশন নির্বাচন করুন।');
        return;
      }
      state.checked[i] = true;
      const isRight = sel === q.answer;
      state.correct[i] = isRight;

      $$('.option', optsEl).forEach((node, idx)=>{
        node.classList.remove('correct','incorrect');
        if(idx === q.answer) node.classList.add('correct');
        if(sel === idx && sel !== q.answer) node.classList.add('incorrect');
      });

      explainEl.style.display = 'block';
      explainEl.innerHTML = `<strong>ব্যাখ্যা:</strong> ${q.explanation || '—'}`;
      scoreEl.textContent = state.correct.filter(Boolean).length.toString();
    }

    function submitAll(){
      state.submitted = true;
      clearInterval(timer);
      config.questions.forEach((q, i)=>{
        if(state.selected[i]===null){ state.selected[i] = -1; }
        state.checked[i] = true;
        state.correct[i] = state.selected[i] === q.answer;
      });
      const total = config.questions.length;
      const right = state.correct.filter(Boolean).length;
      const wrong = total - right;

      sumCorrect.textContent = right.toString();
      sumWrong.textContent = wrong.toString();
      sumTime.textContent = formatTime(state.elapsedSec);
      sumScore.textContent = right.toString();
      sumScore.className = 'score-' + (right/total >= 0.5 ? 'good' : 'bad');

      summary.style.display = 'block';
      renderQuestion();
      submitBtn.disabled = true;
      checkBtn.disabled = true;
    }

    prevBtn.addEventListener('click', ()=>{ state.idx--; renderQuestion(); });
    nextBtn.addEventListener('click', ()=>{ state.idx++; renderQuestion(); });
    checkBtn.addEventListener('click', checkCurrent);
    submitBtn.addEventListener('click', submitAll);

    reviewBtn.addEventListener('click', ()=>{
      alert('রিভিউ মোডে আপনি প্রশ্নগুলো স্ক্রল করে সঠিক/ভুল দেখতে পারবেন। পেজ ন্যাভিগেশন বাটন দিয়ে চলুন।');
    });
    restartBtn.addEventListener('click', ()=>{ location.reload(); });

    renderQuestion();
  }

  window.addEventListener('DOMContentLoaded', ()=>{
    if(window.quizConfig){
      initQuiz(window.quizConfig);
    }
  });
})();