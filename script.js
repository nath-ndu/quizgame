const PEXELS_API_KEY = 'b7BNU08kvp8NLPcOdymXHfoiCuXMIF6nNaYnZNtYIzjoWERPQglJ5w8z';


let level = 1;
let questionCount = 0;

// handle install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installButton = document.getElementById('installButton');
  installButton.style.display = 'block';

  installButton.addEventListener('click', () => {
    installButton.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  });
});  

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('sw.js').then(function(registration) {
        console.log('Service Worker registered with scope:', registration.scope);
      }, function(error) {
        console.log('Service Worker registration failed:', error);
      });
    });
  }        

function checkAnswer(button, rightAnswer) {
    const buttons = document.querySelectorAll('#answers button');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.backgroundColor = btn.innerHTML === rightAnswer ? '#2ecc71' : '#e74c3c';
    });


    if (button.innerHTML === rightAnswer) {
        if (questionCount % 10 === 9) {
            level++;
            alert(`Level ${level}`);
        }
        questionCount++;
    } else {
        if (questionCount % 10 === 9) {
            alert('Challenge failed!');
            questionCount = (level - 1) * 10;
        }
    }


    document.getElementById('level').innerHTML = level;
    document.getElementById('until-challenge').innerHTML = 10 - (questionCount % 10);
    document.getElementById('next-btn').style.display = 'block';
}


async function getQuestion() {
    try {
        const isChallenge = (questionCount % 10 === 9);
        const difficulty = isChallenge ? 'hard' : 'easy';


        document.getElementById('next-btn').style.display = 'none';


        const response = await fetch(`https://opentdb.com/api.php?amount=1&difficulty=${difficulty}`);
        const data = await response.json();
        const question = data.results[0];


        document.getElementById('category').innerHTML =
            isChallenge ? `CHALLENGE: ${question.category}` : question.category;
        document.getElementById('question').innerHTML = question.question;


        try {
            const imageResponse = await fetch(`https://api.pexels.com/v1/search?per_page=1&query=${encodeURIComponent(question.category)}`, {
                headers: { "Authorization": PEXELS_API_KEY }
            });
            const imageData = await imageResponse.json();
            if (imageData.photos && imageData.photos.length) {
                document.getElementById('question-image').src = imageData.photos[0].src.medium;
                document.getElementById('question-image').style.display = 'block';
            } else {
                document.getElementById('question-image').style.display = 'none';
            }
        } catch {
            document.getElementById('question-image').style.display = 'none';
        }


        const answers = [...question.incorrect_answers, question.correct_answer];
        answers.sort(() => Math.random() - 0.5);


        const buttonClass = isChallenge ? 'hard-question' : 'normal-question';
        document.getElementById('answers').innerHTML = answers.map(answer =>
            `<button class="${buttonClass}" onclick="checkAnswer(this, '${answer}')">${answer}</button>`
        ).join('');
    } catch (error) {
        console.error('Question fetch error:', error);
        alert('Failed to load question');
    }
}


document.addEventListener('DOMContentLoaded', getQuestion);
