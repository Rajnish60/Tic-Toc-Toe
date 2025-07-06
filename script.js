// Game state
let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;
let scores = { X: 0, O: 0, draws: 0 };

// Win patterns
const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// DOM elements
const boxes = document.querySelectorAll('.box');
const currentPlayerElement = document.getElementById('current-player');
const currentSymbolElement = document.getElementById('current-symbol');
const scoreXElement = document.getElementById('score-x');
const scoreOElement = document.getElementById('score-o');
const scoreDrawsElement = document.getElementById('score-draws');
const resetGameBtn = document.getElementById('reset-game');
const resetScoresBtn = document.getElementById('reset-scores');
const modalOverlay = document.getElementById('modal-overlay');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const playAgainBtn = document.getElementById('play-again');

// Initialize game
function initGame() {
    boxes.forEach((box, index) => {
        box.addEventListener('click', () => handleBoxClick(index));
    });
    
    resetGameBtn.addEventListener('click', resetGame);
    resetScoresBtn.addEventListener('click', resetScores);
    playAgainBtn.addEventListener('click', closeModalAndReset);
    
    updateCurrentPlayerDisplay();
    updateScoreDisplay();
}

// Handle box click
function handleBoxClick(index) {
    if (board[index] || !gameActive) return;
    
    // Update board state
    board[index] = currentPlayer;
    
    // Update UI
    const box = boxes[index];
    box.textContent = currentPlayer;
    box.classList.add(currentPlayer.toLowerCase());
    box.classList.add('symbol-appear');
    box.classList.add('disabled');
    
    // Check for win or draw
    const result = checkGameResult();
    
    if (result.winner) {
        handleWin(result.winner, result.pattern);
    } else if (result.draw) {
        handleDraw();
    } else {
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateCurrentPlayerDisplay();
    }
}

// Check game result
function checkGameResult() {
    // Check for winner
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], pattern };
        }
    }
    
    // Check for draw
    if (board.every(cell => cell !== null)) {
        return { draw: true };
    }
    
    return { winner: null, draw: false };
}

// Handle win
function handleWin(winner, pattern) {
    gameActive = false;
    scores[winner]++;
    
    // Highlight winning pattern
    pattern.forEach(index => {
        boxes[index].classList.add('winning');
    });
    
    // Update score display
    updateScoreDisplay();
    
    // Show modal after animation
    setTimeout(() => {
        showModal(winner, 'win');
    }, 1000);
}

// Handle draw
function handleDraw() {
    gameActive = false;
    scores.draws++;
    
    // Update score display
    updateScoreDisplay();
    
    // Show modal
    setTimeout(() => {
        showModal(null, 'draw');
    }, 500);
}

// Show modal
function showModal(winner, type) {
    if (type === 'win') {
        modalIcon.textContent = '🏆';
        modalTitle.textContent = '🎉 Victory!';
        modalMessage.textContent = `Player ${winner} wins!`;
        modalMessage.style.color = winner === 'X' ? '#ff6b6b' : '#4ecdc4';
    } else {
        modalIcon.textContent = '🤝';
        modalTitle.textContent = "It's a Draw!";
        modalMessage.textContent = 'Great game, both players!';
        modalMessage.style.color = '#666';
    }
    
    modalOverlay.classList.add('show');
}

// Close modal and reset
function closeModalAndReset() {
    modalOverlay.classList.remove('show');
    setTimeout(resetGame, 300);
}

// Reset game
function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = true;
    
    boxes.forEach(box => {
        box.textContent = '';
        box.className = 'box';
    });
    
    updateCurrentPlayerDisplay();
    modalOverlay.classList.remove('show');
}

// Reset scores
function resetScores() {
    scores = { X: 0, O: 0, draws: 0 };
    updateScoreDisplay();
}

// Update current player display
function updateCurrentPlayerDisplay() {
    currentSymbolElement.textContent = currentPlayer;
    currentSymbolElement.className = `current-symbol ${currentPlayer.toLowerCase()}`;
}

// Update score display
function updateScoreDisplay() {
    scoreXElement.textContent = scores.X;
    scoreOElement.textContent = scores.O;
    scoreDrawsElement.textContent = scores.draws;
}

// Add some visual effects
function addVisualEffects() {
    // Add floating particles effect
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
    
    // Create particles periodically
    setInterval(createParticle, 300);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    addVisualEffects();
});

// Add keyboard support
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

// Add touch support for mobile
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
    
    // Reset if swipe up
    if (Math.abs(diffY) > Math.abs(diffX) && diffY > 50) {
        resetGame();
    }
    
    touchStartX = 0;
    touchStartY = 0;
});

// Add sound effects (using Web Audio API)
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

// Add sound to box clicks
boxes.forEach(box => {
    box.addEventListener('click', () => {
        if (!box.classList.contains('disabled')) {
            playSound(800, 0.1);
        }
    });
});

// Add sound to win
function handleWinWithSound(winner, pattern) {
    handleWin(winner, pattern);
    // Play victory sound
    setTimeout(() => playSound(523, 0.2), 100);
    setTimeout(() => playSound(659, 0.2), 300);
    setTimeout(() => playSound(784, 0.4), 500);
}