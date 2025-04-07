export const ACHIEVEMENTS = {
    "First Day": {
        description: "Take the keys and start managing your first noodle factory",
        check: (stats) => true, // Always triggers on first game
        reward: "Welcome to management!"
    },
    "Living on the Edge": {
        description: "Reach 30 chaos and survive",
        check: (stats) => stats.chaosLevel >= 30,
        reward: "Unlock basic chaos management"
    },
    "Chaos Adept": {
        description: "Reach 55 chaos without losing control",
        check: (stats) => stats.chaosLevel >= 55,
        reward: "Unlock intermediate chaos cards"
    },
    "Chaos Lord": {
        description: "Reach 80 chaos and maintain control",
        check: (stats) => stats.chaosLevel >= 80,
        reward: "Master the forces of pasta chaos"
    },
    "Master Chef": {
        description: "Reach 100 prestige",
        check: (stats) => stats.pastaPrestige >= 100,
        reward: "Unlock premium ingredients"
    },
    "Ingredient Hoarder": {
        description: "Reach 20 ingredients without losing any",
        check: (stats) => stats.ingredients >= 20 && stats.lostIngredients === 0,
        reward: "Unlock special recipes"
    },
    "Energy Crisis": {
        description: "Survive with less than 10 energy",
        check: (stats) => stats.workerEnergy <= 10 && stats.workerEnergy > 0,
        reward: "Unlock energy management cards"
    },
    "Marathon Manager": {
        description: "Survive 20 turns",
        check: (stats, turn) => turn >= 20,
        reward: "Unlock endurance bonuses"
    },
    "Factory Legend": {
        description: "Keep the factory running for 50 turns",
        check: (stats, turn) => turn >= 50,
        reward: "Unlock legendary management techniques"
    },
    "Pasta Immortal": {
        description: "Maintain control for an incredible 100 turns",
        check: (stats, turn) => turn >= 100,
        reward: "Unlock the secrets of eternal pasta"
    },
    "Pasta La Vista": {
        description: "Lose 10 workers in a single run",
        check: (stats) => stats.lostWorkers >= 10,
        reward: "Unlock worker safety cards",
        // Triggered by "Workers Strike", "Noodle Kraken", "Vat Explosion" cards
    },
    "Breaking Bread": {
        description: "Reach 50 ingredients without losing any to chaos",
        check: (stats) => stats.ingredients >= 50 && stats.lostIngredients === 0,
        reward: "Unlock premium storage options"
    },
    "Chaotic Neutral": {
        description: "Maintain exactly 50 chaos for 3 consecutive turns",
        check: (stats) => stats.chaosSteadyTurns >= 3 && stats.chaosLevel === 50,
        reward: "Unlock chaos stabilization cards"
    },
    "Worker Strike Survivor": {
        description: "Survive a worker strike with zero casualties",
        check: (stats) => stats.survivedStrikes >= 1 && stats.strikeDeaths === 0,
        reward: "Unlock negotiation cards",
        // Triggered by "Workers Strike" card
    },
    "The Lesser Evil": {
        description: "Choose between two terrible options and pick the Lesser of Two Weevils",
        check: (stats) => stats.chosenLesserWeevil,
        reward: "Unlock pest control options"
    },
    "The Fall and Rise": {
        description: "Witness Reggie's complete journey of self-discovery through pasta",
        check: (stats) => stats.reggieComplete === true,
        reward: "Unlock enlightened management techniques"
    },
    "Card Collector Apprentice": {
        description: "Play 25% of all available cards",
        check: (stats) => stats.cardCollector25,
        reward: "Starting to learn the ropes!"
    },
    "Card Collector Expert": {
        description: "Play 50% of all available cards",
        check: (stats) => stats.cardCollector50,
        reward: "Mastering the art of pasta management!"
    },
    "Card Collector Master": {
        description: "Play 75% of all available cards",
        check: (stats) => stats.cardCollector75,
        reward: "A true pasta connoisseur!"
    },
    "Card Collector Legend": {
        description: "Play every single card in the game",
        check: (stats) => stats.cardCollector100,
        reward: "You've seen it all!"
    }
};

// Add firstGameCheck to track if this is the very first game
export const isFirstGame = () => {
    return !localStorage.getItem('noodleFactoryFirstGame');
};

export const markFirstGamePlayed = () => {
    localStorage.setItem('noodleFactoryFirstGame', 'true');
};

export const saveAchievement = (achievementId) => {
    const savedAchievements = JSON.parse(localStorage.getItem('noodleFactoryAchievements') || '[]');
    if (!savedAchievements.includes(achievementId)) {
        savedAchievements.push(achievementId);
        localStorage.setItem('noodleFactoryAchievements', JSON.stringify(savedAchievements));
        return true; // Return true if this is a new achievement
    }
    return false; // Return false if already earned
};

export const getUnlockedAchievements = () => {
    return JSON.parse(localStorage.getItem('noodleFactoryAchievements') || '[]');
};

export const isAchievementUnlocked = (achievementId) => {
    const savedAchievements = getUnlockedAchievements();
    return savedAchievements.includes(achievementId);
};

// Modify the resetAchievements function to also reset first game status
export const resetAchievements = () => {
    localStorage.removeItem('noodleFactoryAchievements');
    localStorage.removeItem('noodleFactoryFirstGame');
};

// Modify checkAchievements to handle first game achievement
export const checkAchievements = (stats, turn) => {
    const newAchievements = [];
    
    // Check first game achievement
    if (isFirstGame()) {
        if (saveAchievement("First Day")) {
            newAchievements.push({
                id: "First Day",
                description: ACHIEVEMENTS["First Day"].description,
                reward: ACHIEVEMENTS["First Day"].reward
            });
        }
        markFirstGamePlayed();
    }
    
    // Check other achievements
    Object.entries(ACHIEVEMENTS).forEach(([id, achievement]) => {
        if (id !== "First Day" && !isAchievementUnlocked(id) && achievement.check(stats, turn)) {
            if (saveAchievement(id)) {
                newAchievements.push({
                    id,
                    description: achievement.description,
                    reward: achievement.reward
                });
            }
        }
    });
    
    return newAchievements;
};

// Modify the checkCardAchievements function to add achievement flags
function checkCardAchievements() {
    const played = getPlayedCards();
    const totalCards = Object.keys(CARDS).length;
    const playedCount = Object.keys(played).length;
    const percentage = (playedCount / totalCards) * 100;

    if (percentage >= 25 && !gameState.playerStats.cardCollector25) {
        gameState.playerStats.cardCollector25 = true;
        saveAchievement("Card Collector Apprentice");
    }
    if (percentage >= 50 && !gameState.playerStats.cardCollector50) {
        gameState.playerStats.cardCollector50 = true;
        saveAchievement("Card Collector Expert");
    }
    if (percentage >= 75 && !gameState.playerStats.cardCollector75) {
        gameState.playerStats.cardCollector75 = true;
        saveAchievement("Card Collector Master");
    }
    if (percentage === 100 && !gameState.playerStats.cardCollector100) {
        gameState.playerStats.cardCollector100 = true;
        saveAchievement("Card Collector Legend");
    }
}