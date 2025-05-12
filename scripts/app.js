const questionLimit = 10;
let questions = [];
let currentQuestion = 0;
let discipline = '';
let score = 0;
let username = '';

const questionText = document.getElementById('question-text');
const optionsDiv = document.getElementById('options');
const progressBar = document.getElementById('progress-bar');
const feedbackGif = document.getElementById('feedback-gif');
const nextBtn = document.getElementById('next-btn');

const nameScreen = document.getElementById('name-screen');
const menuScreen = document.getElementById('menu');
const quizScreen = document.getElementById('quiz');
const userDisplay = document.getElementById('user-display');
const historyModal = document.getElementById('history-modal');
const historyContent = document.getElementById('history-content');

window.onload = () => {
  const saved = localStorage.getItem('username');
  if (saved) {
    username = saved;
    showMenu();
  } else {
    nameScreen.classList.remove('hidden');
  }
};

function saveName() {
  const input = document.getElementById('username').value.trim();
  if (input) {
    username = input;
    localStorage.setItem('username', username);
    showMenu();
  }
}

function showMenu() {
  nameScreen.classList.add('hidden');
  menuScreen.classList.remove('hidden');
  userDisplay.textContent = username;
}

function loadQuiz(selectedDiscipline) {
  discipline = selectedDiscipline;
  fetch(`data/${discipline}.json`)
    .then(res => res.json())
    .then(data => {
      questions = shuffle([...data]).slice(0, questionLimit);
      currentQuestion = 0;
      score = 0;
      menuScreen.classList.add('hidden');
      quizScreen.classList.remove('hidden');
      buildProgressBar();
      showQuestion();
    });
}

function buildProgressBar() {
  progressBar.innerHTML = '';
  for (let i = 0; i < questionLimit; i++) {
    const span = document.createElement('span');
    progressBar.appendChild(span);
  }
}

function showQuestion() {
  const q = questions[currentQuestion];
  questionText.textContent = q.pergunta;
  optionsDiv.innerHTML = '';
  feedbackGif.innerHTML = '';
  nextBtn.classList.add('hidden');

  q.alternativas.forEach((alt, index) => {
    const btn = document.createElement('button');
    btn.textContent = alt;
    btn.onclick = () => selectAnswer(btn, index);
    optionsDiv.appendChild(btn);
  });
}

function selectAnswer(button, index) {
  const q = questions[currentQuestion];
  const allButtons = optionsDiv.querySelectorAll('button');
  const audioElement = document.getElementById('answer-audio');

  allButtons.forEach((btn, i) => {
    btn.disabled = true;

    if (i === q.correta) {
      btn.classList.add('correct');
    }

    if (i === index && i !== q.correta) {
      btn.classList.add('incorrect');
    }
  });

  if (index === q.correta) {
    audioElement.src = 'audio/acertou.mp3';
  } else {
    audioElement.src = 'audio/errou.mp3';
  }

  audioElement.play();


  if (index === q.correta) score++;

  showGif(index === q.correta);
  updateProgress();
  nextBtn.classList.remove('hidden');
}

function showGif(isCorrect) {
  const num = Math.floor(Math.random() * 3) + 1;
  const path = `assets/gifs/${isCorrect ? 'correto' : 'errado'}${num}.gif`;
  feedbackGif.innerHTML = `<img src="${path}" alt="Resposta ${isCorrect ? 'correta' : 'errada'}">`;
}

function updateProgress() {
  const spans = progressBar.querySelectorAll('span');
  if (spans[currentQuestion]) spans[currentQuestion].classList.add('filled');
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < questionLimit) {
    showQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  quizScreen.classList.add('hidden');

  const finalScreen = document.getElementById('final-screen');
  const finalScore = document.getElementById('final-score');
  const finalGif = document.getElementById('final-gif');
  const finalAudio = document.getElementById('final-audio');

  let count = 0;
  const interval = setInterval(() => {
    if (count <= score) {
      finalScore.textContent = count;
      count++;
    } else {
      clearInterval(interval);
    }
  }, 80);

  const isGood = score >= 5;
  const gif = `assets/gifs/${isGood ? 'final_bom' : 'final_ruim'}.gif`;
  const audio = `audio/${isGood ? 'final_bom' : 'final_ruim'}.mp3`;

  finalGif.innerHTML = `<img src="${gif}" alt="Resultado final">`;
  finalAudio.src = audio;

  finalScreen.classList.remove('hidden');

  saveProgress(); 
}

function backToMenu() {
  document.getElementById('final-screen').classList.add('hidden');
  menuScreen.classList.remove('hidden');
  document.getElementById('final-gif').innerHTML = '';
  document.getElementById('final-audio').src = '';

  currentQuestion = 0;
  questions = [];
}

function saveProgress() {
  const key = `progresso_${discipline}`;
  const data = JSON.parse(localStorage.getItem(key)) || [];


  data.unshift({
    data: new Date().toLocaleString(),
    acertos: score,
    usuario: username
  });


  localStorage.setItem(key, JSON.stringify(data.slice(0, 5)));
}

function showHistory() {
    historyContent.innerHTML = '';
  
    const disciplinas = [
      'administracao-geral',
      'matematica-discreta',
      'informatica-negocios',
      'comunicacao-expressao',
      'espanhol',
      'ingles',
      'sociedade-tecnologia-inovacao',
      'metodologia-pesquisa'
    ];
  
    disciplinas.forEach(disc => {
      const hist = JSON.parse(localStorage.getItem(`progresso_${disc}`)) || [];
      const nomeFormatado = disc
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
  
      historyContent.innerHTML += `<h3>${nomeFormatado}</h3>`;
      
      if (hist.length === 0) {
        historyContent.innerHTML += `<p>Sem histórico ainda.</p>`;
      } else {
        hist.forEach(entry => {
          historyContent.innerHTML += `<p>${entry.data}: ${entry.acertos} acertos</p>`;
        });
      }
    });
  
    historyModal.classList.remove('hidden');
  }
  

function closeHistory() {
  historyModal.classList.add('hidden');
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}


document.getElementById('profile-pic').addEventListener('click', () => {
  document.getElementById('image-selector').classList.remove('hidden');
});


function selectProfileImage(filename) {
  const fullPath = `./assets/img/${filename}`;
  localStorage.setItem('profileImage', fullPath);
  document.getElementById('profile-pic').src = fullPath;
  closeImageSelector();
}


function closeImageSelector() {
  document.getElementById('image-selector').classList.add('hidden');
}


window.addEventListener('DOMContentLoaded', () => {
  const savedImage = localStorage.getItem('profileImage');
  if (savedImage) {
    document.getElementById('profile-pic').src = savedImage;
  }
});





document.querySelectorAll('.locked').forEach(button => {
  button.addEventListener('click', function (e) {
    e.preventDefault();
    Swal.fire({
      icon: 'info',
      title: 'Conteúdo bloqueado!',
      text: 'Está em desenvolvimento...',
      confirmButtonText: 'Entendi',
    });
  });
});
