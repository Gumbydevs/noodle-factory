import { CARDS } from './cards.js';
import { gameState } from './state.js';

export const ACHIEVEMENTS = {
    "First Day": {
        description: "Take the keys to your first noodle factory. There's more to pasta than meets the eye...",
        check: (stats) => true, // Always triggers on first game
        reward: "Welcome to management!"
    },
    "Living on the Edge": {
        description: "Reach 30 chaos",
        check: (stats) => stats.chaosLevel >= 30,
        reward: "You thrive in chaos!"
    },
    "Chaos Adept": {
        description: "Reach 55 chaos without losing control",
        check: (stats) => stats.chaosLevel >= 55,
        reward: "We aren't sure if this is a good thing..."
    },
    "Chaos Lord": {
        description: "Reach 70 chaos",
        check: (stats) => stats.chaosLevel >= 70,
        reward: "You are a master of chaos!"
    },
    "Chaos OverLord": {
        description: "Survive a turn with 100+ chaos and maintain control",
        check: (stats) => stats.chaosLevel >= 100 && stats.chaosControlTurns >= 1,
        reward: "Master the forces of pasta chaos"
    },
    "Chaos Survivor": {
        description: "Return from the brink - recover from 100 chaos back to below 90",
        check: (stats) => stats.hadMaxChaos && stats.chaosLevel < 90,
        reward: "Dancing with death!"
    },
    "Master Chef": {
        description: "Reach 100 prestige",
        check: (stats) => stats.pastaPrestige >= 100,
        reward: "Gain bonuses from your culinary skills"
    },
    "Ingredient Hoarder": {
        description: "Reach 20 ingredients!",
        check: (stats) => stats.ingredients >= 20 && stats.lostIngredients === 0,
        reward: "Now we're cooking!"
    },
    "Labour Crisis": {
        description: "Survive with less than 10 workers",
        check: (stats) => stats.workerEnergy <= 10 && stats.workerEnergy > 0,
        reward: "Hanging on by a thread!",
        // Check if worker energy is the right variable
    },
    "Marathon Manager": {
        description: "Survive 20 turns",
        check: (stats, turn) => turn >= 20,
        reward: "You are getting the hang of this!"
    },
    "Factory Legend": {
        description: "Keep the factory running for 50 turns",
        check: (stats, turn) => turn >= 50,
        reward: "Legendary management techniques"
    },
    "Pasta Immortal": {
        description: "Maintain control for an incredible 100 turns",
        check: (stats, turn) => turn >= 100,
        reward: "You know kung fu!",
    },
    "Pasta La Vista": {
        description: "Lose 10 workers in a single run",
        check: (stats) => stats.lostWorkers >= 10,
        reward: "Somehow, you survived this",
        // Triggered by "Workers Strike", "Noodle Kraken", "Vat Explosion" cards
    },
    "Breaking Bread": {
        description: "Reach 50 ingredients without losing any to chaos",
        check: (stats) => stats.ingredients >= 50 && stats.lostIngredients === 0,
        reward: "A pasta-tively amazing feat!",
    },
    "Chaotic Neutral": {
        description: "Maintain exactly 50 chaos for 3 consecutive turns",
        check: (stats) => stats.chaosSteadyTurns >= 3 && stats.chaosLevel === 50,
        reward: "You've mastered the art of balance",
    },
    "Worker Strike Survivor": {
        description: "Survive a worker strike with zero casualties",
        check: (stats) => stats.survivedStrikes >= 1 && stats.strikeDeaths === 0,
        reward: "A true diplomat!",
        // Triggered by "Workers Strike" card
    },
    "The Lesser Evil": {
        description: "Choose between two terrible options and pick the Lesser of Two Weevils",
        check: (stats) => stats.chosenLesserWeevil,
        reward: "A true pasta philosopher!",
    },
    "The Fall and Rise": {
        description: "Witness Reggie's complete journey of self-discovery through pasta",
        check: (stats) => stats.reggieComplete === true,
        reward: "If you get this reference, you didnt get where you are today by not watching the BBC"
    },
    "Card Collector Apprentice": {
        description: "Play 25% of all available cards",
        check: () => {
            const played = getPlayedCards();
            const totalCards = Object.keys(CARDS).length;
            const playedCount = Object.keys(played).length;
            return (playedCount / totalCards) * 100 >= 25;
        },
        reward: "Starting to learn the ropes!"
    },
    "Card Collector Expert": {
        description: "Play 50% of all available cards",
        check: () => {
            const played = getPlayedCards();
            const totalCards = Object.keys(CARDS).length;
            const playedCount = Object.keys(played).length;
            return (playedCount / totalCards) * 100 >= 50;
        },
        reward: "Mastering the art of pasta management!"
    },
    "Card Collector Master": {
        description: "Play 75% of all available cards",
        check: () => {
            const played = getPlayedCards();
            const totalCards = Object.keys(CARDS).length;
            const playedCount = Object.keys(played).length;
            return (playedCount / totalCards) * 100 >= 75;
        },
        reward: "A true pasta connoisseur!"
    },
    "Card Collector Legend": {
        description: "Play every single card in the game",
        check: () => {
            const played = getPlayedCards();
            const totalCards = Object.keys(CARDS).length;
            const playedCount = Object.keys(played).length;
            return playedCount === totalCards;
        },
        reward: "No spring chicken here!",
    },
    "Efficiency Expert": {
        description: "Have 50+ workers while maintaining less than 20 chaos",
        check: (stats) => stats.workerEnergy >= 50 && stats.chaosLevel < 20,
        reward: "Master of organization!"
    },
    "Walking the Line": {
        description: "Have exactly 42 chaos and 42 ingredients simultaneously",
        check: (stats) => stats.chaosLevel === 42 && stats.ingredients === 42,
        reward: "The meaning of pasta life"
    },
    "Resourceful": {
        description: "Reach 30 prestige with less than 15 workers",
        check: (stats) => stats.pastaPrestige >= 30 && stats.workerEnergy < 15,
        reward: "doing more with less!"
    },
    "High Stakes": {
        description: "Have 75+ chaos and 40+ ingredients at the same time",
        check: (stats) => stats.chaosLevel >= 75 && stats.ingredients >= 40,
        reward: "Living dangerously!"
    },
    "Recovery Master": {
        description: "Go from 0 ingredients to 30 in a single turn",
        check: (stats) => stats.ingredientGainInOneTurn >= 30,
        reward: "Back from the brink!"
    }
};

export const RISK_ACHIEVEMENTS = {
    "Edge Runner": {
        description: "Process 30 ingredients while at exactly 45 chaos",
        check: (stats) => stats.ingredients >= 30 && stats.chaosLevel === 45,
        successChance: 0.5,
        onSuccess: (stats) => {
            stats.chaosLevel = Math.max(0, stats.chaosLevel - 20);
            stats.ingredients += 15;
            return "Chaos: <span style='color:green'>--</span> | Ingredients: <span style='color:green'>++</span>";
        },
        onFailure: (stats) => {
            stats.ingredients = Math.floor(stats.ingredients * 0.3);
            stats.chaosLevel += 25;
            return "Ingredients: <span style='color:red'>---</span> | Chaos: <span style='color:red'>++</span>";
        }
    },
    "Skeleton Factory": {
        description: "Maintain 25 prestige with exactly 10 workers",
        check: (stats) => stats.pastaPrestige === 25 && stats.workerEnergy === 10,
        successChance: 0.4,
        onSuccess: (stats) => {
            stats.workerEnergy += 15;
            stats.pastaPrestige += 10;
            return "Workers: <span style='color:green'>++</span> | Prestige: <span style='color:green'>+</span>";
        },
        onFailure: (stats) => {
            stats.workerEnergy = Math.floor(stats.workerEnergy * 0.5);
            stats.chaosLevel += 15;
            return "Workers: <span style='color:red'>--</span> | Chaos: <span style='color:red'>+</span>";
        }
    },
    "Triple Threat": {
        description: "Have exactly 33 chaos, ingredients, and workers",
        check: (stats) => stats.chaosLevel === 33 && stats.ingredients === 33 && stats.workerEnergy === 33,
        successChance: 0.3,
        onSuccess: (stats) => {
            stats.pastaPrestige += 15;
            stats.chaosLevel = Math.max(0, stats.chaosLevel - 10);
            return "Prestige: <span style='color:green'>++</span> | Chaos: <span style='color:green'>-</span>";
        },
        onFailure: (stats) => {
            stats.workerEnergy = Math.floor(stats.workerEnergy * 0.7);
            stats.ingredients = Math.floor(stats.ingredients * 0.7);
            return "Workers: <span style='color:red'>--</span> | Ingredients: <span style='color:red'>--</span>";
        }
    }
};

//  firstGameCheck to track if this is the very first game
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

// resetAchievements function to clear achievements and played cards
export const resetAchievements = () => {
    localStorage.removeItem('noodleFactoryAchievements');
    localStorage.removeItem('noodleFactoryFirstGame');
    localStorage.removeItem('noodleFactoryPlayedCards'); // Add this line
};

// checkAchievements to handle first game achievement
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

//  where the storage key is defined
export function getPlayedCards() {
    const played = localStorage.getItem('noodleFactoryPlayedCards') || '{}';
    return JSON.parse(played);
}

// checkCardAchievements to trigger achievement checks
export function checkCardAchievements() {
    const played = getPlayedCards();
    const totalCards = Object.keys(CARDS).length;
    const playedCount = Object.keys(played).length;
    const percentage = (playedCount / totalCards) * 100;

    console.log(`Cards played: ${playedCount}/${totalCards} (${percentage.toFixed(1)}%)`); // Debug log

    // These will now trigger achievement checks through the normal achievement system
    checkAchievements(gameState.playerStats);
}