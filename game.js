// Game state management
const gameState = {
    totalPercentage: 100,
    currentOffer: 0,
    round: 1,
    maxRounds: 3,
    gameOver: false,
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
    gameStatus: document.getElementById('gameStatus'),
    historyList: document.getElementById('historyList')
};

// Initialize game
function initializeGame() {
    updateDisplay();
    elements.makeOffer.addEventListener('click', handleOffer);
    // Log game start
    logGameEvent('gameStart', { initialPercentage: gameState.totalPercentage });
}

// Update the display with current game state
function updateDisplay() {
    elements.totalDisplay.textContent = gameState.totalPercentage;
    elements.offerAmount.max = gameState.totalPercentage;
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

// Handle the player's offer
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
    addToHistory(`Round ${gameState.round}: You offered ${offerAmount}% of the vlaai`);
    
    // Log the offer
    logGameEvent('playerOffer', { percentage: offerAmount });

    // Simulate AI response (this will be replaced with GPT-4 integration)
    const aiResponse = simulateAIResponse(offerAmount);
    
    if (aiResponse.accepted) {
        handleAcceptedOffer(offerAmount);
    } else {
        handleRejectedOffer(aiResponse.counterOffer);
    }
}

// Handle accepted offer
function handleAcceptedOffer(percentage) {
    addToHistory(`AI accepted your offer of ${percentage}% of the vlaai`);
    elements.gameStatus.textContent = `Offer accepted! You get ${percentage}% of the vlaai, AI gets ${gameState.totalPercentage - percentage}%`;
    
    // Log acceptance
    logGameEvent('offerAccepted', { 
        playerPercentage: percentage,
        aiPercentage: gameState.totalPercentage - percentage 
    });
    
    endGame('accepted');
}

// Handle rejected offer
function handleRejectedOffer(counterOffer) {
    addToHistory(`AI rejected and counter-offered ${counterOffer}% of the vlaai`);
    
    // Log rejection and counter-offer
    logGameEvent('offerRejected', { 
        counterOffer: counterOffer 
    });
    
    gameState.round++;
    
    if (gameState.round > gameState.maxRounds) {
        elements.gameStatus.textContent = "Game Over! Maximum rounds reached.";
        endGame('maxRoundsReached');
    } else {
        elements.gameStatus.textContent = `AI counter-offered ${counterOffer}%. Make your offer for round ${gameState.round}!`;
    }
}

// Simple AI response simulation (will be replaced with GPT-4)
function simulateAIResponse(offer) {
    const fairShare = gameState.totalPercentage / 2;
    
    // Accept if offer is fair or better for AI
    if (offer <= fairShare) {
        return {
            accepted: true,
            counterOffer: null
        };
    }
    
    // Otherwise reject and make counter-offer
    return {
        accepted: false,
        counterOffer: Math.floor(fairShare)
    };
}

// End the game
function endGame(outcome) {
    gameState.gameOver = true;
    elements.makeOffer.disabled = true;
    
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