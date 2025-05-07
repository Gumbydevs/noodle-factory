// This file manages the game state, including player stats, resource meters, and the current status of the factory.

function getRandomWorkerCount() {
    return Math.floor(Math.random() * 6) + 15; // 15-20 range for better starting balance
}

const EMERGENCY_COSTS = {
    ingredients: () => 6 + Math.floor(Math.random() * 7), // Random cost between 6-12 per ingredient
    workers: 25 + Math.floor(Math.random() * 8), // Random cost between 25-32 per worker
    maxPurchase: 5    // Maximum number of emergency resources that can be purchased at once
};

const BASE_PRODUCTION = {
    workersPerIngredient: 5,  // Number of workers needed to process 1 ingredient
    noodlesPerIngredient: [10, 20], // Range of noodles produced per ingredient [min, max]
    basePrice: 5 // Base price per noodle
};

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
        weeklyExpenses: 100, // Weekly operating expenses
        turnsAtMaxChaos: 0,
        chaosControlTurns: 0,
        lostIngredients: 0,
        lostWorkers: 0,
        totalProduction: 0,
        productionEfficiency: 1,
        prestige: 0,
        maxChaosLevelReached: 0,
        workerLossRate: 1,
        workerEnergy: 50,
        chosenLesserWeevil: false,
        reggieEscaped: false,
        reggieDead: false,
        reggieComplete: false,
        chaosGainRate: 1,
        prestigeGainRate: 1,
        usedMagicCards: false,
        factoryUpgrades: {},
        hitZeroMoney: false,
        highestSingleSale: 0,
        chaosSteadyTurns: 0,
        lowWorkerConsecutiveTurns: 0,
        singleWorkerTurns: 0,
        lowWorkerTurns: 0,
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

export function updateResource(resourceType, amount, fromUpgrade = false) {
    // Handle negative values as emergency purchases
    if (amount < 0) {
        const severityFactor = Math.abs(amount);
        const totalCost = Math.min(150, Math.max(50, 50 + (severityFactor * 15)));
        
        if (gameState.playerStats.money >= totalCost) {
            gameState.playerStats.money -= totalCost;
            return true;
        }
        return false;
    }

    // Normal resource updates
    switch (resourceType) {
        case 'ingredients':
            // Add random chance for ingredient gain from upgrades
            if (!fromUpgrade && gameState.playerStats.factoryUpgrades) {
                Object.values(gameState.playerStats.factoryUpgrades).forEach(upgrade => {
                    if (upgrade.permanentStats?.ingredientGain > 0) {
                        // 40% chance to gain ingredients based on the upgrade's power
                        if (Math.random() < 0.4) {
                            const scaledBonus = Math.floor(upgrade.permanentStats.ingredientGain * 20);
                            const minBonus = Math.max(1, scaledBonus);
                            const maxBonus = Math.max(2, scaledBonus + 1);
                            const bonusIngredients = Math.floor(Math.random() * (maxBonus - minBonus + 1)) + minBonus;
                            gameState.playerStats.ingredients = Math.max(0, Math.min(20, gameState.playerStats.ingredients + bonusIngredients));
                        }
                    }
                });
            }
            gameState.playerStats.ingredients = Math.max(0, Math.min(20, gameState.playerStats.ingredients + amount));
            break;
        case 'workers':
            gameState.playerStats.workerCount = Math.max(0, Math.min(50, gameState.playerStats.workerCount + amount));
            break;
        case 'chaos':
            let newChaos = gameState.playerStats.chaosLevel + amount;
            if (newChaos > 100) {
                gameState.playerStats.hadMaxChaos = true;
            }
            gameState.playerStats.chaosLevel = Math.max(0, Math.min(100, newChaos));
            break;
        case 'prestige':
            gameState.playerStats.pastaPrestige = Math.max(0, Math.min(100, gameState.playerStats.pastaPrestige + amount));
            break;
    }
    return true;
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

export class GameState {
    constructor() {
        // Initialize game state properties
    }

    async initAudio() {
        const assetLoader = new AssetLoader();
        await assetLoader.init();

        // Store the selected track type for persistence
        localStorage.setItem('selectedMusicTrack', assetLoader.selectedTrack);

        if (assetLoader.selectedTrack === 'lounge') {
            const { loungeMusic } = await import('../audio/music/bgm2.js');
            this.bgm = loungeMusic;
            await this.bgm.preload();
        } else {
            const { musicLoops } = await import('../audio/music/bgm.js');
            this.bgm = musicLoops;
            await this.bgm.preload();
        }

        if (this.bgm) {
            await this.bgm.initAudio();
            if (this.bgm.enabled) {
                await this.bgm.startLoop();
            }
        }
    }
}

export { gameState };