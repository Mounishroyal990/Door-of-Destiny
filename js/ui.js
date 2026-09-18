const UI = {
    screens: {
        menu: document.getElementById('screen-menu'),
        levels: document.getElementById('screen-levels'),
        stage1: document.getElementById('screen-stage1'),
        stage2: document.getElementById('screen-stage2'),
        minigame: document.getElementById('screen-minigame'),
        results: document.getElementById('screen-results'),
        gameover: document.getElementById('screen-gameover')
    },
    
    hud: document.getElementById('hud'),
    hudLevel: document.getElementById('hud-level'),
    hudScore: document.getElementById('hud-score'),
    hudTimer: document.getElementById('hud-timer'),
    timeText: document.getElementById('time-text'),
    timerBar: document.getElementById('timer-bar'),
    livesContainer: document.getElementById('hud-lives'),

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
            setTimeout(() => {
                if(!screen.classList.contains('active')) {
                    screen.classList.add('hidden');
                }
            }, 500); // Wait for opacity transition
        });

        const target = this.screens[screenName];
        target.classList.remove('hidden');
        // Small timeout to allow display:block to apply before opacity transition
        setTimeout(() => {
            target.classList.add('active');
        }, 50);
    },

    updateHUD(level, score, lives) {
        this.hudLevel.innerText = `Level: ${level}`;
        this.hudScore.innerText = score;
        
        const lifeEls = this.livesContainer.querySelectorAll('.life');
        lifeEls.forEach((el, index) => {
            if (index < lives) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    },

    showHUD(show) {
        if (show) {
            this.hud.classList.remove('hidden');
        } else {
            this.hud.classList.add('hidden');
        }
    },

    showTimer(show) {
        if (show) {
            this.hudTimer.classList.remove('hidden');
        } else {
            this.hudTimer.classList.add('hidden');
        }
    },

    updateTimer(secondsLeft, totalSeconds) {
        this.timeText.innerText = `00:${secondsLeft < 10 ? '0'+secondsLeft : secondsLeft}`;
        const pct = (secondsLeft / totalSeconds) * 100;
        this.timerBar.style.width = `${pct}%`;
        
        if (pct < 25) {
            this.timerBar.style.backgroundColor = 'var(--danger-red)';
            this.timeText.style.color = 'var(--danger-red)';
        } else if (pct < 50) {
            this.timerBar.style.backgroundColor = 'var(--danger-orange)';
            this.timeText.style.color = 'var(--danger-orange)';
        } else {
            this.timerBar.style.backgroundColor = 'var(--success-green)';
            this.timeText.style.color = 'var(--success-green)';
        }
    },

    shakeScreen() {
        document.getElementById('app').classList.add('screen-shake');
        setTimeout(() => {
            document.getElementById('app').classList.remove('screen-shake');
        }, 500);
    }
};
