// This file manages the game state, including player stats, resource meters, and the current status of the factory.

const gameState = {
    playerStats: {
        pastaPrestige: 0,
        chaosLevel: 0,
        ingredients: [],
        unitsSold: 0,
        workerCount: 100,  // Changed from workerEnergy
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

export const resetGameState = () => {
    gameState.playerStats = {
        pastaPrestige: 0,
        chaosLevel: 0,
        ingredients: [
            "Basic Flour",
            "Water",
            "Salt",
            "Egg"
        ],
        workerCount: Math.floor(Math.random() * 11) + 10  // Random between 10-20
    };
};

export { gameState, updateResource };