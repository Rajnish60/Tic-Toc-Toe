let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;
let scores = { X: 0, O: 0, draws: 0 };
let gameMode = 'pvp'; 
let aiDifficulty = 'easy'; 
let isAiTurn = false;

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]             
];

const boxes = document.querySelectorAll('.box');
const currentPlayerElement = document.getElementById('current-player');
const currentSymbolElement = document.getElementById('current-symbol');
const scoreXElement = document.getElementById('score-x');
const scoreOElement = document.getElementById('score-o');
const scoreDrawsElement = document.getElementById('score-draws');
const resetGameBtn = document.getElementById('reset-game');
const resetScoresBtn = document.getElementById('reset-scores');
const changeModeBtn = document.getElementById('change-mode');
const modalOverlay = document.getElementById('modal-overlay');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const playAgainBtn = document.getElementById('play-again');

const gameModeSelector = document.getElementById('game-mode-selector');
const difficultySelector = document.getElementById('difficulty-selector');
const modeButtons = document.querySelectorAll('.mode-btn');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const playerXName = document.getElementById('player-x-name');
const playerOName = document.getElementById('player-o-name');
const gameBoard = document.querySelector('.game-board');

function smoothScrollToElement(element, callback = null) {
    element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
    });
    
    element.style.transform = 'scale(1.02)';
    element.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
        if (callback) callback();
    }, 300);
}

function initGame() {
    boxes.forEach((box, index) => {
        box.addEventListener('click', () => handleBoxClick(index));
    });
    
    resetGameBtn.addEventListener('click', resetGame);
    resetScoresBtn.addEventListener('click', resetScores);
    changeModeBtn.addEventListener('click', showModeSelector);
    playAgainBtn.addEventListener('click', closeModalAndReset);
    
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => selectGameMode(btn.dataset.mode));
    });
    
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => selectDifficulty(btn.dataset.difficulty));
    });
    
    updateCurrentPlayerDisplay();
    updateScoreDisplay();
    updatePlayerNames();
}

function selectGameMode(mode) {
    gameMode = mode;
    
    modeButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    if (mode === 'ai') {
        difficultySelector.style.display = 'block';
        setTimeout(() => {
            smoothScrollToElement(difficultySelector);
        }, 100);
    } else {
        difficultySelector.style.display = 'none';
        gameModeSelector.style.display = 'none';
        setTimeout(() => {
            smoothScrollToElement(gameBoard);
        }, 100);
    }
    
    updatePlayerNames();
    
    if (mode === 'pvp') {
        resetGame();
    }
}

function selectDifficulty(difficulty) {
    aiDifficulty = difficulty;
    
    difficultyButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
    
    gameModeSelector.style.display = 'none';
    difficultySelector.style.display = 'none';
    
    setTimeout(() => {
        smoothScrollToElement(gameBoard, () => {
            gameBoard.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.3)';
            setTimeout(() => {
                gameBoard.style.boxShadow = '';
            }, 1000);
        });
    }, 100);
    
    resetGame();
}

function showModeSelector() {
    gameModeSelector.style.display = 'block';
    if (gameMode === 'ai') {
        difficultySelector.style.display = 'block';
    }
    
    setTimeout(() => {
        smoothScrollToElement(gameModeSelector);
    }, 100);
}

function updatePlayerNames() {
    if (gameMode === 'ai') {
        playerXName.textContent = 'You';
        playerOName.textContent = `AI (${aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)})`;
    } else {
        playerXName.textContent = 'Player X';
        playerOName.textContent = 'Player O';
    }
}

function handleBoxClick(index) {
    if (board[index] || !gameActive || isAiTurn) return;
    
    makeMove(index, currentPlayer);
}

function makeMove(index, player) {
    board[index] = player;
    
    const box = boxes[index];
    box.textContent = player;
    box.classList.add(player.toLowerCase());
    box.classList.add('symbol-appear');
    box.classList.add('disabled');
    
    playSound(800, 0.1);
    
    const result = checkGameResult();
    
    if (result.winner) {
        handleWin(result.winner, result.pattern);
    } else if (result.draw) {
        handleDraw();
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateCurrentPlayerDisplay();
        
        if (gameMode === 'ai' && currentPlayer === 'O') {
            setTimeout(makeAiMove, 500); 
        }
    }
}

function makeAiMove() {
    if (!gameActive) return;
    
    isAiTurn = true;
    
    const availableMoves = getAvailableMoves();
    availableMoves.forEach(index => {
        boxes[index].classList.add('ai-thinking');
    });
    
    let moveIndex;
    
    switch (aiDifficulty) {
        case 'easy':
            moveIndex = getRandomMove();
            break;
        case 'medium':
            moveIndex = getMediumMove();
            break;
        case 'hard':
            moveIndex = getHardMove();
            break;
    }
    
    setTimeout(() => {
        availableMoves.forEach(index => {
            boxes[index].classList.remove('ai-thinking');
        });
        
        if (moveIndex !== -1) {
            makeMove(moveIndex, 'O');
        }
        
        isAiTurn = false;
    }, 1000);
}

function getAvailableMoves() {
    return board.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
}

function getRandomMove() {
    const availableMoves = getAvailableMoves();
    return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
}

function getMediumMove() {
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = 'O';
            if (checkWinner(board)) {
                board[i] = null;
                return i;
            }
            board[i] = null;
        }
    }
    
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = 'X';
            if (checkWinner(board)) {
                board[i] = null;
                return i;
            }
            board[i] = null;
        }
    }
    
    return getRandomMove();
}

function getHardMove() {
    const bestMove = minimax(board, 'O');
    return bestMove.index;
}

function minimax(currentBoard, player) {
    const availableMoves = currentBoard.map((cell, index) => cell === null ? index : null).filter(val => val !== null);

    const winner = checkWinner(currentBoard);
    if (winner === 'X') return { score: -10 };
    if (winner === 'O') return { score: 10 };
    if (availableMoves.length === 0) return { score: 0 };
    
    const moves = [];
    
    for (let i = 0; i < availableMoves.length; i++) {
        const move = {};
        move.index = availableMoves[i];
        
        currentBoard[availableMoves[i]] = player;
        
        if (player === 'O') {
            const result = minimax(currentBoard, 'X');
            move.score = result.score;
        } else {
            const result = minimax(currentBoard, 'O');
            move.score = result.score;
        }
        
        currentBoard[availableMoves[i]] = null;
        moves.push(move);
    }
    
    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    
    return moves[bestMove];
}

function checkWinner(currentBoard) {
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
            return currentBoard[a];
        }
    }
    return null;
}

function checkGameResult() {
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], pattern };
        }
    }

    if (board.every(cell => cell !== null)) {
        return { draw: true };
    }
    
    return { winner: null, draw: false };
}

function handleWin(winner, pattern) {
    gameActive = false;
    scores[winner]++;

    pattern.forEach(index => {
        boxes[index].classList.add('winning');
    });

    updateScoreDisplay();

    setTimeout(() => playSound(523, 0.2), 100);
    setTimeout(() => playSound(659, 0.2), 300);
    setTimeout(() => playSound(784, 0.4), 500);

    setTimeout(() => {
        showModal(winner, 'win');
    }, 1000);
}

function handleDraw() {
    gameActive = false;
    scores.draws++;

    updateScoreDisplay();

    setTimeout(() => {
        showModal(null, 'draw');
    }, 500);
}

function showModal(winner, type) {
    if (type === 'win') {
        modalIcon.textContent = '🏆';
        modalTitle.textContent = '🎉 Victory!';
        
        if (gameMode === 'ai') {
            if (winner === 'X') {
                modalMessage.textContent = 'Congratulations! You won!';
                modalMessage.style.color = '#ff6b6b';
            } else {
                modalMessage.textContent = 'AI wins! Better luck next time!';
                modalMessage.style.color = '#4ecdc4';
            }
        } else {
            modalMessage.textContent = `Player ${winner} wins!`;
            modalMessage.style.color = winner === 'X' ? '#ff6b6b' : '#4ecdc4';
        }
    } else {
        modalIcon.textContent = '🤝';
        modalTitle.textContent = "It's a Draw!";
        modalMessage.textContent = 'Great game!';
        modalMessage.style.color = '#666';
    }
    
    modalOverlay.classList.add('show');
}

function closeModalAndReset() {
    modalOverlay.classList.remove('show');
    setTimeout(resetGame, 300);
}

function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = true;
    isAiTurn = false;
    
    boxes.forEach(box => {
        box.textContent = '';
        box.className = 'box';
    });
    
    updateCurrentPlayerDisplay();
    modalOverlay.classList.remove('show');
}

function resetScores() {
    scores = { X: 0, O: 0, draws: 0 };
    updateScoreDisplay();
}

function updateCurrentPlayerDisplay() {
    if (gameMode === 'ai' && currentPlayer === 'O') {
        currentPlayerElement.style.display = 'none';
    } else {
        currentPlayerElement.style.display = 'inline-flex';
        currentSymbolElement.textContent = currentPlayer;
        currentSymbolElement.className = `current-symbol ${currentPlayer.toLowerCase()}`;
    }
}

function updateScoreDisplay() {
    scoreXElement.textContent = scores.X;
    scoreOElement.textContent = scores.O;
    scoreDrawsElement.textContent = scores.draws;
}

function addVisualEffects() {
    const createParticle = () => {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = 'rgba(255, 255, 255, 0.8)';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '999';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = window.innerHeight + 'px';
        
        document.body.appendChild(particle);
        
        const animation = particle.animate([
            { transform: 'translateY(0px)', opacity: 1 },
            { transform: `translateY(-${window.innerHeight + 100}px)`, opacity: 0 }
        ], {
            duration: 3000 + Math.random() * 2000,
            easing: 'linear'
        });
        
        animation.onfinish = () => particle.remove();
    };

    setInterval(createParticle, 300);
}

document.addEventListener('DOMContentLoaded', () => {
    initGame();
    addVisualEffects();
});

document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        handleBoxClick(index);
    } else if (e.key === 'r' || e.key === 'R') {
        resetGame();
    } else if (e.key === 'Escape') {
        if (modalOverlay.classList.contains('show')) {
            closeModalAndReset();
        }
    }
});

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    if (Math.abs(diffY) > Math.abs(diffX) && diffY > 50) {
        resetGame();
    }
    
    touchStartX = 0;
    touchStartY = 0;
});

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration, type = 'sine') {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}
