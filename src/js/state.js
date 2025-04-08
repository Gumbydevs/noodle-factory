// This file manages the game state, including player stats, resource meters, and the current status of the factory.

function getRandomWorkerCount() {
    return Math.floor(Math.random() * 6) + 15; // 15-20 range for better starting balance
}

const gameState = {
    playerStats: {
        pastaPrestige: 0,
        chaosLevel: 0,
        ingredients: 0,  
        unitsSold: 0,
        workerCount: getRandomWorkerCount(),
        workersInFactory: 5,
    },
    resourceMeters: {
        noodletude: 50,
        spiceLevel: 50,
        corporateCompliance: 100,
        boilPressure: 0,
    },
    currentStatus: 'Game in Progress',
};

function updateResource(resource, amount) {
    if (gameState.resourceMeters[resource] !== undefined) {
        gameState.resourceMeters[resource] = Math.max(0, Math.min(100, gameState.resourceMeters[resource] + amount));
    }
    
    // Apply caps and natural progression for player stats
    if (resource === 'chaosLevel') {
        // Modified chaos calculation to make reductions more effective
        const chaosReduction = amount < 0 ? amount * 1.5 : amount; // 50% more effective reduction
        gameState.playerStats.chaosLevel = Math.min(100, gameState.playerStats.chaosLevel + chaosReduction);
        // Increased minimum chaos level slightly
        if (gameState.playerStats.chaosLevel < 8) gameState.playerStats.chaosLevel = 8;
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
            ingredients: 0,  // Changed from array to number
            workerCount: Math.floor(Math.random() * 6) + 15
        }
    };
};

// Function to check chaos level and apply visual effects
export function updateChaosEffects(chaosLevel) {
    const body = document.body;
    
    // Remove all existing chaos classes first
    body.classList.remove('chaos-level-1', 'chaos-level-2', 'chaos-level-3', 'chaos-level-max', 'chaos-noise');
    
    // Apply appropriate chaos level class
    if (chaosLevel >= 80) {
        body.classList.add('chaos-level-max', 'chaos-noise');
    } else if (chaosLevel >= 60) {
        body.classList.add('chaos-level-3', 'chaos-noise');
    } else if (chaosLevel >= 40) {
        body.classList.add('chaos-level-2');
    } else if (chaosLevel >= 20) {
        body.classList.add('chaos-level-1');
    }
}

export { gameState, updateResource };