document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const minesCountElement = document.getElementById('mines-count');
    const timerElement = document.getElementById('timer');
    const resetBtn = document.getElementById('reset-btn');
    const difficultySelect = document.getElementById('difficulty');
    const gameMessage = document.getElementById('game-message');
    const messageText = document.getElementById('message-text');

    // Settings elements
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');
    const themeToggle = document.getElementById('theme-toggle');
    const langToggle = document.getElementById('lang-toggle');

    // i18n Translations
    const translations = {
        fa: {
            appTitle: "بازی مین‌روب | Minesweeper",
            title: "مین‌روب",
            easy: "آسان (۹×۹ - ۱۰ مین)",
            medium: "متوسط (۱۶×۱۶ - ۴۰ مین)",
            hard: "سخت (۳۰×۱۶ - ۹۹ مین)",
            reset: "بازی مجدد",
            settingsTitle: "تنظیمات",
            theme: "پوسته:",
            language: "زبان:",
            close: "بستن",
            winMessage: "شما برنده شدید!",
            loseMessage: "باختی!",
            timeText: "زمان:",
            secondsText: "ثانیه",
            playAgain: "دوباره"
        },
        en: {
            appTitle: "Minesweeper Game",
            title: "Minesweeper",
            easy: "Easy (9x9 - 10 mines)",
            medium: "Medium (16x16 - 40 mines)",
            hard: "Hard (30x16 - 99 mines)",
            reset: "Restart",
            settingsTitle: "Settings",
            theme: "Theme:",
            language: "Language:",
            close: "Close",
            winMessage: "You won!",
            loseMessage: "Game Over!",
            timeText: "Time:",
            secondsText: "seconds",
            playAgain: "Play Again"
        }
    };

    let currentLang = localStorage.getItem('language') || 'fa';
    let currentTheme = localStorage.getItem('theme') || 'dark';

    // Difficulty settings
    const difficulties = {
        easy: { rows: 9, cols: 9, mines: 10 },
        medium: { rows: 16, cols: 16, mines: 40 },
        hard: { rows: 16, cols: 30, mines: 99 }
    };

    let currentDifficulty = 'easy';
    let board = [];
    let rows, cols, totalMines;
    let flagsCount = 0;
    let revealedCount = 0;
    let isGameOver = false;
    let isFirstClick = true;
    let timerInterval;
    let seconds = 0;

    const MINE = -1;

    // Apply saved preferences
    applyLanguage(currentLang);
    applyTheme(currentTheme);

    // Set initial toggle states
    themeToggle.checked = currentTheme === 'light';
    langToggle.checked = currentLang === 'en';

    // Initialize the game
    function initGame() {
        clearInterval(timerInterval);
        seconds = 0;
        timerElement.textContent = '0';
        isGameOver = false;
        isFirstClick = true;
        flagsCount = 0;
        revealedCount = 0;
        gameMessage.classList.add('hidden');

        currentDifficulty = difficultySelect.value;
        const diff = difficulties[currentDifficulty];
        rows = diff.rows;
        cols = diff.cols;
        totalMines = diff.mines;

        minesCountElement.textContent = totalMines;

        // Setup CSS grid
        boardElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        boardElement.innerHTML = '';

        createBoard();
        renderBoard();
    }

    // Settings Logic
    function applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
        localStorage.setItem('theme', theme);
        currentTheme = theme;
    }

    function applyLanguage(lang) {
        const dict = translations[lang];
        if (!dict) return;

        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';

        // Update title
        document.title = dict.appTitle;

        // Update all elements with data-i18n
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                el.textContent = dict[key];
            }
        });

        // Update difficulty select options
        const options = difficultySelect.querySelectorAll('option');
        options.forEach(opt => {
            const key = opt.value; // easy, medium, hard
            if (dict[key]) {
                opt.textContent = dict[key];
            }
        });

        // Update specific titles
        settingsBtn.title = dict.settingsTitle;

        localStorage.setItem('language', lang);
        currentLang = lang;

        // Re-render win/lose message if visible
        if (!gameMessage.classList.contains('hidden')) {
            const win = !messageText.querySelector('.lose');
            showMessage(win);
        }
    }

    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });

    themeToggle.addEventListener('change', (e) => {
        applyTheme(e.target.checked ? 'light' : 'dark');
    });

    langToggle.addEventListener('change', (e) => {
        applyLanguage(e.target.checked ? 'en' : 'fa');
    });

    // Create the logical board (without mines initially)
    function createBoard() {
        board = Array(rows).fill().map(() => Array(cols).fill(0));
    }

    // Place mines randomly, avoiding the first clicked cell
    function placeMines(firstRow, firstCol) {
        let minesPlaced = 0;
        while (minesPlaced < totalMines) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);

            // Don't place mine on the first clicked cell or if already a mine
            if (board[r][c] !== MINE && !(r === firstRow && c === firstCol)) {
                board[r][c] = MINE;
                minesPlaced++;
            }
        }
        calculateNumbers();
    }

    // Calculate numbers for adjacent cells
    function calculateNumbers() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c] === MINE) continue;

                let count = 0;
                // Check all 8 adjacent cells
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (r + i >= 0 && r + i < rows && c + j >= 0 && c + j < cols) {
                            if (board[r + i][c + j] === MINE) count++;
                        }
                    }
                }
                board[r][c] = count;
            }
        }
    }

    // Render the board to HTML
    function renderBoard() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = r;
                cell.dataset.col = c;

                // Left click
                cell.addEventListener('click', () => handleCellClick(r, c));
                // Right click
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    handleRightClick(r, c);
                });

                boardElement.appendChild(cell);
            }
        }
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            seconds++;
            timerElement.textContent = seconds;
        }, 1000);
    }

    function handleCellClick(r, c) {
        if (isGameOver) return;

        const cellElement = getCellElement(r, c);
        if (cellElement.classList.contains('revealed') || cellElement.classList.contains('flagged')) return;

        if (isFirstClick) {
            isFirstClick = false;
            placeMines(r, c);
            startTimer();
        }

        if (board[r][c] === MINE) {
            gameOver(false);
            return;
        }

        revealCell(r, c);
        checkWin();
    }

    function handleRightClick(r, c) {
        if (isGameOver || isFirstClick) return;

        const cellElement = getCellElement(r, c);
        if (cellElement.classList.contains('revealed')) return;

        if (cellElement.classList.contains('flagged')) {
            cellElement.classList.remove('flagged');
            cellElement.innerHTML = '';
            flagsCount--;
        } else {
            if (flagsCount < totalMines) {
                cellElement.classList.add('flagged');
                cellElement.innerHTML = '<i class="fas fa-flag text-danger"></i>';
                flagsCount++;
            }
        }

        minesCountElement.textContent = totalMines - flagsCount;
    }

    function revealCell(r, c) {
        const cellElement = getCellElement(r, c);
        if (cellElement.classList.contains('revealed') || cellElement.classList.contains('flagged')) return;

        cellElement.classList.add('revealed');
        revealedCount++;

        const value = board[r][c];
        if (value > 0) {
            cellElement.textContent = value;
            cellElement.dataset.value = value;
        } else if (value === 0) {
            // Empty cell, reveal adjacent cells (Flood fill)
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (r + i >= 0 && r + i < rows && c + j >= 0 && c + j < cols) {
                        revealCell(r + i, c + j);
                    }
                }
            }
        }
    }

    function getCellElement(r, c) {
        return boardElement.children[r * cols + c];
    }

    function gameOver(win) {
        isGameOver = true;
        clearInterval(timerInterval);

        // Reveal all mines
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cellElement = getCellElement(r, c);
                if (board[r][c] === MINE) {
                    if (!cellElement.classList.contains('flagged')) {
                        cellElement.classList.add('revealed', 'mine');
                        cellElement.innerHTML = '<i class="fas fa-bomb"></i>';
                    }
                } else if (cellElement.classList.contains('flagged')) {
                    // Wrong flag
                    cellElement.innerHTML = '<i class="fas fa-times" style="color: red;"></i>';
                }
            }
        }

        showMessage(win);
    }

    function checkWin() {
        if (revealedCount === (rows * cols) - totalMines) {
            gameOver(true);
        }
    }

    function showMessage(win) {
        setTimeout(() => {
            gameMessage.classList.remove('hidden');
            const dict = translations[currentLang];

            if (win) {
                messageText.innerHTML = `<span class="win"><i class="fas fa-trophy"></i> ${dict.winMessage}</span><br><span style="font-size: 1rem; color: var(--text-light);">${dict.timeText} ${seconds} ${dict.secondsText}</span>`;
            } else {
                messageText.innerHTML = `<span class="lose"><i class="fas fa-skull"></i> ${dict.loseMessage}</span>`;
            }

            // Add a small restart button inside message
            const restartBtn = document.createElement('button');
            restartBtn.innerHTML = `<i class="fas fa-redo"></i> ${dict.playAgain}`;
            restartBtn.style.marginTop = '20px';
            restartBtn.onclick = initGame;

            // Clear previous buttons if any
            while (gameMessage.children.length > 1) {
                gameMessage.removeChild(gameMessage.lastChild);
            }
            gameMessage.appendChild(restartBtn);

        }, 500);
    }

    // Event Listeners
    resetBtn.addEventListener('click', initGame);
    difficultySelect.addEventListener('change', initGame);

    // Prevent context menu on board
    boardElement.addEventListener('contextmenu', e => e.preventDefault());

    // Start game
    initGame();
});