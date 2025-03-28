// Game state management
const gameState = {
    totalPercentage: 100,
    currentOffer: 0,
    round: 1,
    maxRounds: 3,
    gameOver: false,
    currentPlayer: 1, // Track current player (1 or 2)
    gameLog: {
        gameId: new Date().toISOString(),
        rounds: [],
        finalOutcome: null,
        timestamp: new Date().toISOString()
    }
};

// DOM Elements
const elements = {
    totalDisplay: document.getElementById('cakeValue'),
    offerAmount: document.getElementById('offerAmount'),
    makeOffer: document.getElementById('makeOffer'),
    acceptOffer: document.getElementById('acceptOffer'),
    rejectOffer: document.getElementById('rejectOffer'),
    gameStatus: document.getElementById('gameStatus'),
    historyList: document.getElementById('historyList'),
    player1Label: document.getElementById('player1Label'),
    player2Label: document.getElementById('player2Label'),
    offerControls: document.getElementById('offerControls'),
    responseControls: document.getElementById('responseControls')
};

// Initialize game
function initializeGame() {
    updateDisplay();
    elements.makeOffer.addEventListener('click', handleOffer);
    elements.acceptOffer.addEventListener('click', () => handleResponse(true));
    elements.rejectOffer.addEventListener('click', () => handleResponse(false));
    
    // Hide response controls initially
    elements.responseControls.style.display = 'none';
    
    // Log game start
    logGameEvent('gameStart', { initialPercentage: gameState.totalPercentage });
    
    updatePlayerLabels();
}

// Update the display with current game state
function updateDisplay() {
    elements.totalDisplay.textContent = gameState.totalPercentage;
    elements.offerAmount.max = gameState.totalPercentage;
}

// Update player labels to show current player
function updatePlayerLabels() {
    elements.player1Label.classList.toggle('active', gameState.currentPlayer === 1);
    elements.player2Label.classList.toggle('active', gameState.currentPlayer === 2);
    
    // Show/hide appropriate controls
    if (!gameState.gameOver) {
        if (gameState.currentOffer === 0) {
            // Show offer controls to current player
            elements.offerControls.style.display = 'block';
            elements.responseControls.style.display = 'none';
            elements.gameStatus.textContent = `Player ${gameState.currentPlayer}, make your offer!`;
        } else {
            // Show response controls to other player
            elements.offerControls.style.display = 'none';
            elements.responseControls.style.display = 'block';
            elements.gameStatus.textContent = `Player ${gameState.currentPlayer}, accept or reject the offer?`;
        }
    }
}

// Add an entry to the game history and log
function addToHistory(message) {
    const historyItem = document.createElement('li');
    historyItem.textContent = message;
    elements.historyList.insertBefore(historyItem, elements.historyList.firstChild);
}

// Log game events
function logGameEvent(eventType, data) {
    const event = {
        type: eventType,
        timestamp: new Date().toISOString(),
        round: gameState.round,
        data: data
    };
    gameState.gameLog.rounds.push(event);
    
    // Save to localStorage
    saveGameLog();
}

// Save game log to localStorage
function saveGameLog() {
    const logs = JSON.parse(localStorage.getItem('vlaaiGameLogs') || '[]');
    const existingLogIndex = logs.findIndex(log => log.gameId === gameState.gameLog.gameId);
    
    if (existingLogIndex >= 0) {
        logs[existingLogIndex] = gameState.gameLog;
    } else {
        logs.push(gameState.gameLog);
    }
    
    localStorage.setItem('vlaaiGameLogs', JSON.stringify(logs));
}

// Handle player's offer
function handleOffer() {
    if (gameState.gameOver) {
        return;
    }

    const offerAmount = parseInt(elements.offerAmount.value);
    
    // Validate offer
    if (offerAmount < 0 || offerAmount > gameState.totalPercentage) {
        elements.gameStatus.textContent = `Please make a valid offer between 0% and ${gameState.totalPercentage}%`;
        return;
    }

    gameState.currentOffer = offerAmount;
    addToHistory(`Round ${gameState.round}: Player ${gameState.currentPlayer} offered ${offerAmount}% of the vlaai`);
    
    // Log the offer
    logGameEvent('playerOffer', { 
        player: gameState.currentPlayer,
        percentage: offerAmount 
    });

    // Switch to other player's turn to respond
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    updatePlayerLabels();
}

// Handle response to offer
function handleResponse(accepted) {
    if (accepted) {
        handleAcceptedOffer();
    } else {
        handleRejectedOffer();
    }
    
    // Reset offer
    gameState.currentOffer = 0;
    
    // Switch back to other player
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    updatePlayerLabels();
}

// Handle accepted offer
function handleAcceptedOffer() {
    const offeringPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    const receivingPlayer = gameState.currentPlayer;
    
    addToHistory(`Player ${gameState.currentPlayer} accepted Player ${offeringPlayer}'s offer of ${gameState.currentOffer}%`);
    elements.gameStatus.textContent = `Offer accepted! Player ${offeringPlayer} gets ${gameState.currentOffer}%, Player ${receivingPlayer} gets ${gameState.totalPercentage - gameState.currentOffer}%`;
    
    // Log acceptance
    logGameEvent('offerAccepted', { 
        offeringPlayer: offeringPlayer,
        receivingPlayer: receivingPlayer,
        offerPercentage: gameState.currentOffer,
        remainingPercentage: gameState.totalPercentage - gameState.currentOffer
    });
    
    endGame('accepted');
}

// Handle rejected offer
function handleRejectedOffer() {
    const offeringPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    addToHistory(`Player ${gameState.currentPlayer} rejected Player ${offeringPlayer}'s offer`);
    
    // Log rejection
    logGameEvent('offerRejected', { 
        offeringPlayer: offeringPlayer,
        rejectingPlayer: gameState.currentPlayer
    });
    
    gameState.round++;
    
    if (gameState.round > gameState.maxRounds) {
        elements.gameStatus.textContent = "Game Over! Maximum rounds reached. Neither player gets any vlaai!";
        endGame('maxRoundsReached');
    } else {
        elements.gameStatus.textContent = `Round ${gameState.round}: Player ${gameState.currentPlayer}, make your offer!`;
    }
}

// End the game
function endGame(outcome) {
    gameState.gameOver = true;
    elements.offerControls.style.display = 'none';
    elements.responseControls.style.display = 'none';
    
    // Update final outcome in game log
    gameState.gameLog.finalOutcome = outcome;
    saveGameLog();
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initializeGame);

// Export game logs function (can be called from console)
window.exportGameLogs = function() {
    const logs = localStorage.getItem('vlaaiGameLogs');
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vlaai_game_logs.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}; 