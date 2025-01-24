let questionURL = 'https://opentdb.com/api_config.php';

        // Game variables
        let level = 1;
        let questionCount = 0;


        // Check if answer is correct
        function checkAnswer(button, rightAnswer) {
            // Disable all buttons
            let buttons = document.querySelectorAll('#answers button');
            buttons.forEach(btn => {
                btn.disabled = true;
               
                // Show right and wrong answers
                if(btn.innerHTML === rightAnswer) {
                    btn.style.backgroundColor = '#2ecc71';  // Nicer green
                } else {
                    btn.style.backgroundColor = '#e74c3c';  // Nicer red
                }
            });


            if(button.innerHTML === rightAnswer) {
                if(questionCount % 10 === 9) {
                    level++;
                    alert('You beat the challenge! Level ' + level);
                }
                questionCount++;
            } else {
                if(questionCount % 10 === 9) {
                    alert('Challenge failed! Try again!');
                    questionCount = (level - 1) * 10;
                }
            }


            // Update info
            document.getElementById('level').innerHTML = level;
            document.getElementById('until-challenge').innerHTML = 10 - (questionCount % 10);
           
            // Show next button
            document.getElementById('next-btn').style.display = 'block';
        }


        // Get new question
        async function getQuestion() {
            // Check if it's challenge question
            let isChallenge = (questionCount % 10 === 9);
            let difficulty = isChallenge ? 'hard' : 'easy';


            // Hide next button
            document.getElementById('next-btn').style.display = 'none';


            // Get question from API
            let response = await fetch('https://opentdb.com/api.php?amount=1&difficulty=' + difficulty);
            let data = await response.json();
            let question = data.results[0];


            // Get image
            let imageResponse = await fetch("https://api.pexels.com/v1/search?per_page=1&query=" + question.category, {
                headers: {
                    "Authorization": "b7BNU08kvp8NLPcOdymXHfoiCuXMIF6nNaYnZNtYIzjoWERPQglJ5w8z"
                }
            });
            let imageData = await imageResponse.json();


            // Show category
            document.getElementById('category').innerHTML =
                isChallenge ? "CHALLENGE QUESTION! - " + question.category : question.category;


            // Show question
            document.getElementById('question').innerHTML = question.question;


            // Show image
            if(imageData.photos && imageData.photos.length > 0) {
                document.getElementById('question-image').src = imageData.photos[0].src.medium;
            }


            // Mix up answers
            let answers = [...question.incorrect_answers, question.correct_answer];
            for(let i = answers.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [answers[i], answers[j]] = [answers[j], answers[i]];
            }


            // Show answer buttons
            let buttonClass = isChallenge ? 'hard-question' : 'normal-question';
            document.getElementById('answers').innerHTML = answers.map(answer =>
                `<button class="${buttonClass}" onclick="checkAnswer(this, '${question.correct_answer}')">${answer}</button>`
            ).join('');
        }


        // Start game
        getQuestion();
        