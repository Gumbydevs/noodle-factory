// This file manages the game state, including player stats, resource meters, and the current status of the factory.

function getRandomWorkerCount() {
    return Math.floor(Math.random() * 6) + 15; // 15-20 range for better starting balance
}

const gameState = {
    playerStats: {
        pastaPrestige: 0,
        chaosLevel: 0,
        ingredients: 0,  // Changed from array to number
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
        gameState.resourceMeters[resource] += amount;
        gameState.resourceMeters[resource] = Math.max(0, Math.min(100, gameState.resourceMeters[resource]));
    }
    
    // Update chaos effects whenever chaos level changes
    if (resource === 'chaosLevel') {
        updateChaosEffects(gameState.playerStats.chaosLevel);
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

// Add function to check chaos level and apply visual effects
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