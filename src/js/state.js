// This file manages the game state, including player stats, resource meters, and the current status of the factory.

function getRandomWorkerCount() {
    return Math.floor(Math.random() * 11) + 10; // Random number between 10-20
}

function getRandomIngredientCount() {
    return Math.floor(Math.random() * 6) + 5; // Random number between 5-10
}

const gameState = {
    playerStats: {
        pastaPrestige: 0,
        chaosLevel: 0,
        ingredients: Array(getRandomIngredientCount()).fill(1), // Initialize with random count
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
        // Ensure meters stay within bounds
        gameState.resourceMeters[resource] = Math.max(0, Math.min(100, gameState.resourceMeters[resource]));
    }
}

export function resetGameState() {
    return {
        playerStats: {
            pastaPrestige: 0,
            chaosLevel: 0,
            ingredients: Array(getRandomIngredientCount()).fill(1), // Initialize with random count
            workerCount: getRandomWorkerCount(),
        }
    };
}

export { gameState, updateResource };