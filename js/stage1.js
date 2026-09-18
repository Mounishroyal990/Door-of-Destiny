const Stage1 = {
    levelData: null,
    currentQuestionData: null,
    doors: [], // 'clue', 'clue', 'bomb'
    cluesRevealed: 0,
    doorElements: [],
    
    init(levelData) {
        this.levelData = levelData;
        this.pickRandomQuestion();
        this.resetStage();
        UI.showScreen('stage1');
    },

    pickRandomQuestion() {
        const pool = this.levelData.pool;
        this.currentQuestionData = pool[Math.floor(Math.random() * pool.length)];
    },

    resetStage() {
        this.cluesRevealed = 0;
        this.doors = ['clue', 'clue', 'bomb'];
        // Shuffle doors
        for (let i = this.doors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.doors[i], this.doors[j]] = [this.doors[j], this.doors[i]];
        }

        // Reset UI
        document.getElementById('clue-count').innerText = '0';
        document.getElementById('clue-list').innerHTML = '';
        document.getElementById('s1-narrator').innerText = "Choose wisely. One hides a bomb.";
        
        // Question UI
        document.getElementById('s1-question-text').innerText = this.currentQuestionData.question;
        const answerInput = document.getElementById('s1-answer-input');
        answerInput.value = '';
        const feedback = document.getElementById('answer-feedback');
        feedback.classList.add('hidden');
        feedback.className = 'feedback hidden';

        // Bind answer submit
        const btnSubmit = document.getElementById('btn-submit-answer');
        const newBtnSubmit = btnSubmit.cloneNode(true);
        btnSubmit.parentNode.replaceChild(newBtnSubmit, btnSubmit);
        newBtnSubmit.addEventListener('click', () => this.checkAnswer());
        
        answerInput.onkeyup = (e) => {
            if(e.key === 'Enter') this.checkAnswer();
        };

        // Bind doors
        this.doorElements = document.querySelectorAll('.s1-door');
        this.doorElements.forEach((doorEl, index) => {
            doorEl.classList.remove('opened', 'bomb');
            doorEl.querySelector('.door-number').innerText = index + 1;
            
            // Remove old listeners
            const newDoor = doorEl.cloneNode(true);
            doorEl.parentNode.replaceChild(newDoor, doorEl);
            
            newDoor.addEventListener('click', () => this.handleDoorClick(index, newDoor));
        });
    },

    handleDoorClick(index, doorEl) {
        if (doorEl.classList.contains('opened')) return;

        const type = this.doors[index];
        doorEl.classList.add('opened');

        if (type === 'clue') {
            AudioSys.playDoorOpen();
            this.revealClue();
            document.getElementById('s1-narrator').innerText = "A clue is revealed. Risk another or answer now?";
        } else if (type === 'bomb') {
            doorEl.classList.add('bomb');
            AudioSys.playBomb();
            UI.shakeScreen();
            
            // Check if it's the first try
            if (this.cluesRevealed === 0) {
                document.getElementById('s1-narrator').innerText = "Bomb on the first try! Lives lost, question resetting...";
                Game.loseLife();
                if (Game.lives > 0) {
                    setTimeout(() => {
                        this.pickRandomQuestion();
                        this.resetStage();
                    }, 2000);
                }
            } else {
                document.getElementById('s1-narrator').innerText = "It's a BOMB!";
                Game.loseLife();
            }
        }
    },

    revealClue() {
        if (this.cluesRevealed >= this.currentQuestionData.clues.length) return;
        
        const clueText = this.currentQuestionData.clues[this.cluesRevealed];
        this.cluesRevealed++;
        
        document.getElementById('clue-count').innerText = this.cluesRevealed;
        
        const li = document.createElement('li');
        li.innerText = `• ${clueText}`;
        document.getElementById('clue-list').appendChild(li);
    },

    checkAnswer() {
        const input = document.getElementById('s1-answer-input').value.trim().toLowerCase();
        const feedback = document.getElementById('answer-feedback');
        feedback.classList.remove('hidden', 'correct', 'wrong');

        if (input === this.currentQuestionData.answer.toLowerCase()) {
            AudioSys.playCorrect();
            feedback.innerText = "Correct!";
            feedback.classList.add('correct');
            
            // Calculate score
            let points = 100;
            if (this.cluesRevealed === 0) points += 100;
            else if (this.cluesRevealed === 1) points += 50;
            Game.addScore(points);

            setTimeout(() => {
                Stage2.init(this.levelData);
            }, 1500);
        } else {
            AudioSys.playWrong();
            feedback.innerText = "Incorrect!";
            feedback.classList.add('wrong');
            Game.loseLife();

            if (Game.lives > 0) {
                setTimeout(() => {
                    document.getElementById('s1-answer-input').value = '';
                    feedback.classList.add('hidden');
                }, 1500);
            }
        }
    }
};
