// This file manages the game state, including player stats, resource meters, and the current status of the factory.

function getRandomWorkerCount() {
    return Math.floor(Math.random() * 6) + 15; // 15-20 range for better starting balance
}

const gameState = {
    playerStats: {
        pastaPrestige: 0,
        chaosLevel: 0,
        ingredients: Math.floor(Math.random() * 3) + 3,
        unitsSold: 0,
        workerCount: Math.floor(Math.random() * 4) + 8,
        workersInFactory: 5,
        money: 1000,        // Starting with $1000
        noodles: 0,
        noodleProductionRate: 1,
        noodleSalePrice: 5,
        weeklyExpenses: 100, // New: Weekly operating expenses
        turnsAtMaxChaos: 0,
        chaosControlTurns: 0,
    },
    resourceMeters: {
        noodletude: 50,
        spiceLevel: 50,
        corporateCompliance: 100,
        boilPressure: 0,
    },
    currentStatus: 'Game in Progress',
};

// Save game constants
const SAVE_GAME_KEY = 'noodleFactorySaveGame';

export function saveGameState(state) {
    try {
        const saveData = {
            playerStats: state.playerStats,
            resourceMeters: state.resourceMeters,
            currentStatus: state.currentStatus,
            turn: state.turn,
            version: '1.0.0', // Add version for future compatibility
            timestamp: Date.now()
        };
        localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(saveData));
        return true;
    } catch (e) {
        console.error('Error saving game:', e);
        return false;
    }
}

export function loadGameState() {
    try {
        const saveData = localStorage.getItem(SAVE_GAME_KEY);
        if (!saveData) return null;
        
        const parsedData = JSON.parse(saveData);
        
        // Version check for future compatibility
        if (!parsedData.version) return null;
        
        return {
            playerStats: parsedData.playerStats,
            resourceMeters: parsedData.resourceMeters,
            currentStatus: parsedData.currentStatus,
            turn: parsedData.turn
        };
    } catch (e) {
        console.error('Error loading game:', e);
        return null;
    }
}

export function hasSavedGame() {
    return localStorage.getItem(SAVE_GAME_KEY) !== null;
}

export function clearSavedGame() {
    localStorage.removeItem(SAVE_GAME_KEY);
}

function updateResource(resource, amount) {
    if (resource === 'money') {
        gameState.playerStats.money = Math.max(0, gameState.playerStats.money + amount);
    } else if (resource === 'noodles') {
        gameState.playerStats.noodles = Math.max(0, gameState.playerStats.noodles + amount);
    } else if (gameState.resourceMeters[resource] !== undefined) {
        gameState.resourceMeters[resource] = Math.max(0, Math.min(100, gameState.resourceMeters[resource] + amount));
    }
    
    // Apply caps and natural progression for player stats
    if (resource === 'chaosLevel') {
        // Fix chaos reduction by ensuring proper handling of negative values
        const chaosReduction = amount < 0 ? Math.abs(amount) * 1.8 : amount; // Use absolute value for reduction
        const adjustedAmount = amount < 0 ? -chaosReduction : chaosReduction; // Re-apply negative sign if needed
        
        const currentChaos = gameState.playerStats.chaosLevel;
        const finalAmount = currentChaos > 70 ? adjustedAmount * 0.8 : 
                           currentChaos > 50 ? adjustedAmount * 0.9 : 
                           adjustedAmount;
        
        gameState.playerStats.chaosLevel = Math.min(100, Math.max(5, currentChaos + finalAmount));
        updateChaosEffects(gameState.playerStats.chaosLevel);
    }
    else if (resource === 'pastaPrestige') {
        // Cap prestige at 100
        gameState.playerStats.pastaPrestige = Math.min(100, Math.max(0, gameState.playerStats.pastaPrestige + amount));
        // Prestige naturally decays
        if (amount > 0) {
            setTimeout(() => {
                gameState.playerStats.pastaPrestige = Math.max(0, gameState.playerStats.pastaPrestige - 2);
            }, 2000);
        }
    }
    else if (resource === 'workers' || resource === 'workerCount') {
        // Cap workers at 50
        gameState.playerStats.workerCount = Math.min(50, Math.max(1, gameState.playerStats.workerCount + amount));
        // Workers naturally get tired and leave
        if (amount > 0) {
            setTimeout(() => {
                gameState.playerStats.workerCount = Math.max(1, gameState.playerStats.workerCount - 1);
            }, 3000);
        }
    }
    else if (resource === 'ingredients') {
        // Cap ingredients at 20
        gameState.playerStats.ingredients = Math.min(20, Math.max(0, gameState.playerStats.ingredients + amount));
    }
}

export const resetGameState = () => {
    return {
        playerStats: {
            pastaPrestige: 0,
            chaosLevel: 0,
            ingredients: Math.floor(Math.random() * 3) + 3,
            workerCount: Math.floor(Math.random() * 4) + 8,
            money: 1000, // Starting with $1000
            noodles: 0, // Starting noodles
            noodleProductionRate: 1, // Base production rate
            noodleSalePrice: 5, // Base sale price per noodle
            turnsAtMaxChaos: 0,
            chaosControlTurns: 0,  
        }
    };
};

// Function to check chaos level and apply visual effects
export function updateChaosEffects(chaosLevel) {
    const body = document.body;
    
    // Remove all existing chaos classes first
    body.classList.remove('chaos-level-1', 'chaos-level-2', 'chaos-level-3', 'chaos-level-max', 'chaos-noise');
    
    // Reset chaos-specific CSS variables
    document.documentElement.style.setProperty('--chaos-shake', '0');
    document.documentElement.style.setProperty('--chaos-rotate', '0deg');
    document.documentElement.style.setProperty('--chaos-scale', '1');
    
    // Apply appropriate chaos level class and set intensity variables
    if (chaosLevel >= 80) {
        body.classList.add('chaos-level-max', 'chaos-noise');
        document.documentElement.style.setProperty('--chaos-shake', '3');
        document.documentElement.style.setProperty('--chaos-rotate', '2deg');
        document.documentElement.style.setProperty('--chaos-scale', '1.1');
    } else if (chaosLevel >= 60) {
        body.classList.add('chaos-level-3', 'chaos-noise');
        document.documentElement.style.setProperty('--chaos-shake', '2');
        document.documentElement.style.setProperty('--chaos-rotate', '1.5deg');
        document.documentElement.style.setProperty('--chaos-scale', '1.05');
    } else if (chaosLevel >= 40) {
        body.classList.add('chaos-level-2');
        document.documentElement.style.setProperty('--chaos-shake', '1');
        document.documentElement.style.setProperty('--chaos-rotate', '1deg');
        document.documentElement.style.setProperty('--chaos-scale', '1.02');
    } else if (chaosLevel >= 20) {
        body.classList.add('chaos-level-1');
        document.documentElement.style.setProperty('--chaos-shake', '0.5');
        document.documentElement.style.setProperty('--chaos-rotate', '0.5deg');
        document.documentElement.style.setProperty('--chaos-scale', '1.01');
    }
}

export { gameState, updateResource };