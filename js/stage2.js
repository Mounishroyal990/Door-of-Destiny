const Stage2 = {
    levelData: null,
    doors: [],
    timerInterval: null,
    timeLeft: 0,
    currentMiniGame: null,
    startTime: 0,
    
    // Continuous scoring variables
    mgSolvedCount: 0,
    mgCurrentWords: [], // For word search

    init(levelData) {
        this.levelData = levelData;
        
        let availableGames = [...MINI_GAMES];
        this.doors = [];
        for(let i=0; i<3; i++) {
            const idx = Math.floor(Math.random() * availableGames.length);
            this.doors.push(availableGames[idx]);
            availableGames.splice(idx, 1);
            if(availableGames.length === 0) availableGames = [...MINI_GAMES];
        }

        const doorEls = document.querySelectorAll('.s2-wrapper');
        doorEls.forEach((doorWrapper, index) => {
            const doorEl = doorWrapper.querySelector('.s2-door');
            doorEl.classList.remove('opened');
            
            const newWrapper = doorWrapper.cloneNode(true);
            doorWrapper.parentNode.replaceChild(newWrapper, doorWrapper);
            
            newWrapper.addEventListener('click', () => this.handleDoorClick(index, newWrapper.querySelector('.s2-door')));
        });

        UI.showScreen('stage2');
    },

    handleDoorClick(index, doorEl) {
        if (doorEl.classList.contains('opened')) return;
        
        AudioSys.playDoorOpen();
        doorEl.classList.add('opened');
        
        const gameType = this.doors[index];
        
        setTimeout(() => {
            this.startMiniGame(gameType);
        }, 800);
    },

    startMiniGame(type) {
        this.currentMiniGame = type;
        this.timeLeft = this.levelData.mgTime;
        this.startTime = Date.now();
        this.mgSolvedCount = 0;
        
        UI.showScreen('minigame');
        UI.showTimer(true);
        UI.updateTimer(this.timeLeft, this.levelData.mgTime);
        
        document.getElementById('mg-score-display').innerText = `Solved: 0`;
        document.getElementById('mg-title').innerText = "Mini-Game";
        document.getElementById('mg-title').style.color = "white";

        const container = document.getElementById('mg-container');
        container.innerHTML = '';
        
        if (type === 'math') this.initMathGame(container);
        else if (type === 'word_search') this.initWordSearch(container);
        else if (type === 'sliding_puzzle') this.initSlidingPuzzle(container);
        else if (type === 'memory') this.initMemoryGame(container);

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            UI.updateTimer(this.timeLeft, this.levelData.mgTime);
            AudioSys.playTick();
            
            if (this.timeLeft <= 0) {
                this.endContinuousMiniGame();
            }
        }, 1000);
    },

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        UI.showTimer(false);
    },

    endContinuousMiniGame() {
        this.stopTimer();
        AudioSys.playCorrect();
        
        const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Base points + points per solved item
        let totalPoints = 50 + (this.mgSolvedCount * 50);
        
        // If sliding puzzle is complete
        if (this.currentMiniGame === 'sliding_puzzle' && this.mgSolvedCount > 0) {
            totalPoints = 200; // Big bonus for sliding puzzle completion
        } else if (this.currentMiniGame === 'sliding_puzzle' && this.mgSolvedCount === 0) {
            // failed to solve in time
            this.failMiniGame();
            return;
        }

        // if it's continuous and they got 0, it's a fail
        if (this.mgSolvedCount === 0 && ['math', 'word_search', 'memory'].includes(this.currentMiniGame)) {
            this.failMiniGame();
            return;
        }

        Game.addScore(totalPoints);

        document.getElementById('mg-title').innerText = `Time's Up! +${totalPoints} Pts`;
        document.getElementById('mg-title').style.color = "var(--success-green)";
        
        setTimeout(() => {
            Game.levelComplete(timeTaken);
        }, 2000);
    },

    failMiniGame() {
        this.stopTimer();
        AudioSys.playWrong();
        Game.loseLife();
        
        document.getElementById('mg-title').innerText = "Failed!";
        document.getElementById('mg-title').style.color = "var(--danger-red)";
        
        if (Game.lives > 0) {
            setTimeout(() => {
                Stage2.init(this.levelData);
            }, 1500);
        }
    },

    incrementScore() {
        this.mgSolvedCount++;
        document.getElementById('mg-score-display').innerText = `Solved: ${this.mgSolvedCount}`;
        AudioSys.playTone(800, 'sine', 0.1);
    },

    // --- Continuous Math ---
    initMathGame(container) {
        document.getElementById('mg-title').innerText = "Quick Math (As many as possible!)";
        
        container.innerHTML = `
            <div style="text-align: center;">
                <div class="mg-math" id="math-problem"></div>
                <input type="number" id="mg-math-input" class="mg-math-input" autofocus>
            </div>
        `;
        
        const input = document.getElementById('mg-math-input');
        let currentAnswer = 0;

        const nextProblem = () => {
            const a = Math.floor(Math.random() * 20) + 5;
            const b = Math.floor(Math.random() * 20) + 5;
            currentAnswer = a + b;
            document.getElementById('math-problem').innerText = `${a} + ${b} = ?`;
            input.value = '';
            input.focus();
        };

        nextProblem();

        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                if (parseInt(input.value) === currentAnswer) {
                    this.incrementScore();
                    nextProblem();
                } else {
                    AudioSys.playWrong();
                    input.value = '';
                }
            }
        });
    },

    // --- Typing Word Search ---
    initWordSearch(container) {
        document.getElementById('mg-title').innerText = "Find & Type Hidden Words";
        
        const dictionary = ["GOLD", "DOOR", "BOMB", "RISK", "STAR", "TIME", "LIFE", "PLAY", "GAME", "WINS"];
        // Pick 4 random words
        this.mgCurrentWords = [];
        let tempDict = [...dictionary];
        for(let i=0; i<4; i++) {
            const idx = Math.floor(Math.random() * tempDict.length);
            this.mgCurrentWords.push(tempDict[idx]);
            tempDict.splice(idx, 1);
        }

        // Generate a simple 10x5 grid and inject the words horizontally or vertically roughly
        let grid = [];
        for(let i=0; i<5; i++) {
            grid[i] = Array.from({length: 10}, () => String.fromCharCode(65 + Math.floor(Math.random() * 26)));
        }

        // Place words (super simple horizontal placement for prototype)
        this.mgCurrentWords.forEach((word, idx) => {
            const row = idx % 5;
            const startCol = Math.floor(Math.random() * (10 - word.length + 1));
            for(let i=0; i<word.length; i++) {
                grid[row][startCol + i] = word[i];
            }
        });

        // shuffle rows
        grid.sort(() => 0.5 - Math.random());

        const gridString = grid.map(row => row.join(' ')).join('\n');

        container.innerHTML = `
            <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
                <div class="mg-word-grid">${gridString}</div>
                <input type="text" id="mg-ws-input" class="mg-word-input" placeholder="Type word here..." autofocus>
                <div style="margin-top: 10px; color: #888;">Hint: Look horizontally</div>
            </div>
        `;

        const input = document.getElementById('mg-ws-input');
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const val = input.value.toUpperCase();
                const wIdx = this.mgCurrentWords.indexOf(val);
                if (wIdx > -1) {
                    this.incrementScore();
                    this.mgCurrentWords.splice(wIdx, 1); // remove found word
                    input.value = '';
                    if (this.mgCurrentWords.length === 0) {
                        // Found all
                        this.endContinuousMiniGame();
                    }
                } else {
                    AudioSys.playWrong();
                    input.value = '';
                }
            }
        });
    },

    // --- Sliding Puzzle (3x3) ---
    initSlidingPuzzle(container) {
        document.getElementById('mg-title').innerText = "Sliding Puzzle (Solve to win)";
        
        let tiles = [1, 2, 3, 4, 5, 6, 7, 8, null];
        
        // Shuffle (perform valid moves to ensure solvability)
        let emptyIdx = 8;
        for(let i=0; i<50; i++) {
            const possibleMoves = [];
            const row = Math.floor(emptyIdx / 3);
            const col = emptyIdx % 3;
            if (row > 0) possibleMoves.push(emptyIdx - 3); // up
            if (row < 2) possibleMoves.push(emptyIdx + 3); // down
            if (col > 0) possibleMoves.push(emptyIdx - 1); // left
            if (col < 2) possibleMoves.push(emptyIdx + 1); // right
            
            const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            [tiles[emptyIdx], tiles[move]] = [tiles[move], tiles[emptyIdx]];
            emptyIdx = move;
        }

        container.innerHTML = `<div class="mg-sliding-grid" id="sliding-grid"></div>`;
        const gridEl = document.getElementById('sliding-grid');

        const renderGrid = () => {
            gridEl.innerHTML = '';
            tiles.forEach((val, idx) => {
                const tileEl = document.createElement('div');
                tileEl.className = 'mg-sliding-tile' + (val === null ? ' empty' : '');
                tileEl.innerText = val === null ? '' : val;
                
                if (val !== null) {
                    tileEl.addEventListener('click', () => {
                        const row = Math.floor(idx / 3);
                        const col = idx % 3;
                        const emptyR = Math.floor(emptyIdx / 3);
                        const emptyC = emptyIdx % 3;
                        
                        // Check if adjacent
                        if ((Math.abs(row - emptyR) === 1 && col === emptyC) || 
                            (Math.abs(col - emptyC) === 1 && row === emptyR)) {
                            
                            // Swap
                            [tiles[idx], tiles[emptyIdx]] = [tiles[emptyIdx], tiles[idx]];
                            emptyIdx = idx;
                            AudioSys.playTone(300, 'square', 0.05);
                            renderGrid();
                            checkWin();
                        }
                    });
                }
                gridEl.appendChild(tileEl);
            });
        };

        const checkWin = () => {
            let isWin = true;
            for(let i=0; i<8; i++) {
                if (tiles[i] !== i+1) isWin = false;
            }
            if (isWin) {
                this.incrementScore();
                setTimeout(() => this.endContinuousMiniGame(), 500);
            }
        };

        renderGrid();
    },

    // --- Memory (Refactored to be continuous/scored) ---
    initMemoryGame(container) {
        document.getElementById('mg-title').innerText = "Memory Match (Match as many as you can)";
        const symbols = ['☀️','🌙','⭐','☁️', '⚡', '❄️'];
        let deck = [...symbols, ...symbols];
        deck.sort(() => 0.5 - Math.random());

        // Adjust grid for 12 cards
        container.innerHTML = `<div class="mg-memory-grid" id="memory-grid" style="grid-template-columns: repeat(4, 1fr);"></div>`;
        const grid = document.getElementById('memory-grid');
        
        let flippedCards = [];
        let matchedPairs = 0;

        deck.forEach((sym, idx) => {
            const card = document.createElement('div');
            card.className = 'mg-memory-card';
            card.dataset.sym = sym;
            card.dataset.idx = idx;
            
            card.addEventListener('click', () => {
                if (card.classList.contains('flipped') || flippedCards.length >= 2) return;
                
                card.classList.add('flipped');
                card.innerText = sym;
                flippedCards.push(card);

                if (flippedCards.length === 2) {
                    if (flippedCards[0].dataset.sym === flippedCards[1].dataset.sym) {
                        matchedPairs++;
                        this.incrementScore(); // Add to continuous score
                        flippedCards = [];
                        
                        if (matchedPairs === deck.length / 2) {
                            setTimeout(() => this.endContinuousMiniGame(), 500);
                        }
                    } else {
                        setTimeout(() => {
                            flippedCards[0].classList.remove('flipped');
                            flippedCards[0].innerText = '';
                            flippedCards[1].classList.remove('flipped');
                            flippedCards[1].innerText = '';
                            flippedCards = [];
                            AudioSys.playTone(150, 'sawtooth', 0.1);
                        }, 500);
                    }
                }
            });
            grid.appendChild(card);
        });
    }
};
