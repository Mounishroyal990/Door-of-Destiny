const Game = {
    lives: 3,
    score: 0,
    currentLevelId: 1,
    unlockedLevels: 1,
    levelStartTime: 0,

    init() {
        this.bindMenuEvents();
        UI.showScreen('menu');
        this.generateLevelGrid();
    },

    bindMenuEvents() {
        document.getElementById('btn-play').addEventListener('click', () => {
            UI.showScreen('levels');
        });
        document.getElementById('btn-back-menu').addEventListener('click', () => {
            UI.showScreen('menu');
        });
        document.getElementById('btn-next-level').addEventListener('click', () => {
            this.startLevel(this.currentLevelId + 1);
        });
        document.getElementById('btn-results-menu').addEventListener('click', () => {
            UI.showScreen('menu');
            UI.showHUD(false);
            this.generateLevelGrid();
        });
        document.getElementById('btn-retry-level').addEventListener('click', () => {
            this.startLevel(this.currentLevelId);
        });
        document.getElementById('btn-gameover-menu').addEventListener('click', () => {
            UI.showScreen('menu');
            UI.showHUD(false);
        });
    },

    generateLevelGrid() {
        const grid = document.getElementById('level-grid');
        grid.innerHTML = '';
        
        LEVELS.forEach(level => {
            const btn = document.createElement('div');
            btn.className = 'level-btn';
            if (level.id <= this.unlockedLevels) {
                btn.innerText = level.id;
                btn.addEventListener('click', () => this.startLevel(level.id));
                
                // completed state
                if (level.id < this.unlockedLevels) {
                    btn.classList.add('completed');
                    btn.innerHTML += `<div class="level-stars">★★★</div>`;
                }
            } else {
                btn.classList.add('locked');
                btn.innerHTML = '🔒';
            }
            grid.appendChild(btn);
        });
    },

    startLevel(id) {
        if (id > LEVELS.length) {
            alert("More levels coming soon!");
            UI.showScreen('menu');
            UI.showHUD(false);
            return;
        }

        this.currentLevelId = id;
        this.lives = 3;
        this.score = 0;
        this.levelStartTime = Date.now();
        
        UI.updateHUD(this.currentLevelId, this.score, this.lives);
        UI.showHUD(true);
        
        const levelData = LEVELS.find(l => l.id === id);
        Stage1.init(levelData);
    },

    loseLife() {
        this.lives--;
        UI.updateHUD(this.currentLevelId, this.score, this.lives);
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    },

    addScore(points) {
        this.score += points;
        UI.updateHUD(this.currentLevelId, this.score, this.lives);
        
        // Anim effect
        const scoreEl = document.getElementById('hud-score');
        scoreEl.style.transform = 'scale(1.5)';
        scoreEl.style.color = '#fff';
        setTimeout(() => {
            scoreEl.style.transform = 'scale(1)';
            scoreEl.style.color = 'var(--accent-gold)';
        }, 300);
    },

    gameOver() {
        Stage2.stopTimer();
        AudioSys.playTone(100, 'sawtooth', 1, 0.3); // Game over sound
        UI.showScreen('gameover');
    },

    levelComplete(timeTaken) {
        Stage2.stopTimer();
        AudioSys.playVictory();
        
        // Perfect bonus
        if (this.lives === 3) {
            this.addScore(150);
        }

        if (this.currentLevelId === this.unlockedLevels) {
            this.unlockedLevels++;
        }

        document.getElementById('res-score').innerText = this.score;
        document.getElementById('res-lives').innerText = this.lives;
        document.getElementById('res-time').innerText = timeTaken + 's';
        
        // Stars calculation
        let stars = 1;
        if (this.lives === 3) stars = 3;
        else if (this.lives === 2) stars = 2;

        for(let i=1; i<=3; i++) {
            const starEl = document.getElementById(`star-${i}`);
            starEl.classList.remove('earned');
            if (i <= stars) {
                setTimeout(() => {
                    starEl.classList.add('earned');
                    AudioSys.playTone(800 + i*100, 'sine', 0.1);
                }, i * 500);
            }
        }

        UI.showScreen('results');
    }
};

window.onload = () => {
    Game.init();
};
