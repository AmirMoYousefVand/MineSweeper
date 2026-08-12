document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const minesCountElement = document.getElementById('mines-count');
    const timerElement = document.getElementById('timer');
    const resetBtn = document.getElementById('reset-btn');
    const difficultySelect = document.getElementById('difficulty');
    const gameMessage = document.getElementById('game-message');
    const messageText = document.getElementById('message-text');

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
            if (win) {
                messageText.innerHTML = '<span class="win"><i class="fas fa-trophy"></i> شما برنده شدید!</span><br><span style="font-size: 1rem; color: white;">زمان: ' + seconds + ' ثانیه</span>';
            } else {
                messageText.innerHTML = '<span class="lose"><i class="fas fa-skull"></i> باختی!</span>';
            }

            // Add a small restart button inside message
            const restartBtn = document.createElement('button');
            restartBtn.innerHTML = '<i class="fas fa-redo"></i> دوباره';
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