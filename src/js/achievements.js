import { CARDS } from './cards.js';
import { gameState } from './state.js';

// Define achievement categories for better organization
export const ACHIEVEMENT_CATEGORIES = {
    PROGRESS: "Progress",
    CHAOS: "Chaos Management",
    RESOURCES: "Resource Management",
    WORKERS: "Worker Relations",
    PRESTIGE: "Prestige & Reputation",
    SPECIAL: "Special Events",
    CHALLENGE: "Challenges",
    COLLECTION: "Collection"
};

export const ACHIEVEMENTS = {
    "First Day": {
        description: "Take the keys to your first noodle factory. There's more to pasta than meets the eye...",
        check: (stats) => true, // Always triggers on first game
        reward: "Welcome to management!",
        category: ACHIEVEMENT_CATEGORIES.PROGRESS
    },
    "Living on the Edge": {
        description: "Reach 30 chaos",
        check: (stats) => stats.chaosLevel >= 30,
        reward: "You thrive in chaos!",
        category: ACHIEVEMENT_CATEGORIES.CHAOS
    },
    "Chaos Adept": {
        description: "Reach 55 chaos without losing control",
        check: (stats) => stats.chaosLevel >= 55,
        reward: "We aren't sure if this is a good thing...",
        category: ACHIEVEMENT_CATEGORIES.CHAOS
    },
    "Chaos Lord": {
        description: "Reach 70 chaos",
        check: (stats) => stats.chaosLevel >= 70,
        reward: "You are a master of chaos!",
        category: ACHIEVEMENT_CATEGORIES.CHAOS
    },
    "Chaos OverLord": {
        description: "Survive a turn with 100+ chaos and maintain control",
        check: (stats) => stats.chaosLevel >= 100 && stats.chaosControlTurns >= 1,
        reward: "Master the forces of pasta chaos",
        category: ACHIEVEMENT_CATEGORIES.CHAOS
    },
    "Chaos Survivor": {
        description: "Return from the brink - recover from 100 chaos back to below 90",
        check: (stats) => stats.hadMaxChaos && stats.chaosLevel < 90,
        reward: "Dancing with death!",
        category: ACHIEVEMENT_CATEGORIES.CHAOS
    },
    "Master Chef": {
        description: "Reach 100 prestige",
        check: (stats) => stats.pastaPrestige >= 100,
        reward: "Gain bonuses from your culinary skills",
        category: ACHIEVEMENT_CATEGORIES.PRESTIGE
    },
    "Ingredient Hoarder": {
        description: "Reach 20 ingredients!",
        check: (stats) => stats.ingredients >= 20 && stats.lostIngredients === 0,
        reward: "Now we're cooking!",
        category: ACHIEVEMENT_CATEGORIES.RESOURCES
    },
    "Labour Crisis": {
        description: "Survive with less than 10 workers for 5 consecutive turns",
        check: (stats) => stats.workerCount <= 10 && stats.workerCount > 0 && (stats.lowWorkerConsecutiveTurns >= 5),
        reward: "Hanging on by a thread!",
        category: ACHIEVEMENT_CATEGORIES.WORKERS
    },
    "Marathon Manager": {
        description: "Survive 20 turns",
        check: (stats, turn) => turn >= 20,
        reward: "You are getting the hang of this!",
        category: ACHIEVEMENT_CATEGORIES.PROGRESS
    },
    "Factory Legend": {
        description: "Keep the factory running for 50 turns",
        check: (stats, turn) => turn >= 50,
        reward: "Legendary management techniques",
        category: ACHIEVEMENT_CATEGORIES.PROGRESS
    },
    "Pasta Immortal": {
        description: "Maintain control for an incredible 100 turns",
        check: (stats, turn) => turn >= 100,
        reward: "You know kung fu!",
        category: ACHIEVEMENT_CATEGORIES.PROGRESS
    },
    "Pasta La Vista": {
        description: "Lose 10 workers in a single run",
        check: (stats) => stats.lostWorkers >= 10,
        reward: "Somehow, you survived this",
        category: ACHIEVEMENT_CATEGORIES.WORKERS
    },
    "Breaking Bread": {
        description: "Reach 50 ingredients without losing any to chaos",
        check: (stats) => stats.ingredients >= 50 && stats.lostIngredients === 0,
        reward: "A pasta-tively amazing feat!",
        category: ACHIEVEMENT_CATEGORIES.RESOURCES
    },
    "Chaotic Neutral": {
        description: "Maintain exactly 50 chaos for 3 consecutive turns",
        check: (stats) => stats.chaosSteadyTurns >= 3 && stats.chaosLevel === 50,
        reward: "You've mastered the art of balance",
        category: ACHIEVEMENT_CATEGORIES.CHAOS
    },
    "Worker Strike Survivor": {
        description: "Survive a worker strike with zero casualties",
        check: (stats) => stats.survivedStrikes >= 1 && stats.strikeDeaths === 0,
        reward: "A true diplomat!",
        category: ACHIEVEMENT_CATEGORIES.WORKERS
    },
    "The Lesser Evil": {
        description: "Choose between two terrible options and pick the Lesser of Two Weevils",
        check: (stats) => stats.chosenLesserWeevil,
        reward: "A true pasta philosopher!",
        category: ACHIEVEMENT_CATEGORIES.SPECIAL
    },
    "The Fall and Rise": {
        description: "Witness Reggie's complete journey of self-discovery through pasta",
        check: (stats) => stats.reggieComplete === true,
        reward: "If you get this reference, you didnt get where you are today by not watching the BBC",
        category: ACHIEVEMENT_CATEGORIES.SPECIAL
    },
    "Card Collector Apprentice": {
        description: "Play 25% of all available cards",
        check: () => {
            const played = getPlayedCards();
            const totalCards = Object.keys(CARDS).length;
            const playedCount = Object.keys(played).length;
            return (playedCount / totalCards) * 100 >= 25;
        },
        reward: "Starting to learn the ropes!",
        category: ACHIEVEMENT_CATEGORIES.COLLECTION
    },
    "Card Collector Expert": {
        description: "Play 50% of all available cards",
        check: () => {
            const played = getPlayedCards();
            const totalCards = Object.keys(CARDS).length;
            const playedCount = Object.keys(played).length;
            return (playedCount / totalCards) * 100 >= 50;
        },
        reward: "Mastering the art of pasta management!",
        category: ACHIEVEMENT_CATEGORIES.COLLECTION
    },
    "Card Collector Master": {
        description: "Play 75% of all available cards",
        check: () => {
            const played = getPlayedCards();
            const totalCards = Object.keys(CARDS).length;
            const playedCount = Object.keys(played).length;
            return (playedCount / totalCards) * 100 >= 75;
        },
        reward: "A true pasta connoisseur!",
        category: ACHIEVEMENT_CATEGORIES.COLLECTION
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
        category: ACHIEVEMENT_CATEGORIES.COLLECTION
    },
    "Efficiency Expert": {
        description: "Have 50+ workers while maintaining less than 20 chaos",
        check: (stats) => stats.workerCount >= 50 && stats.chaosLevel < 20,
        reward: "Master of organization!",
        category: ACHIEVEMENT_CATEGORIES.WORKERS
    },
    "Walking the Line": {
        description: "Have exactly 42 chaos and 42 ingredients simultaneously",
        check: (stats) => stats.chaosLevel === 42 && stats.ingredients === 42,
        reward: "The meaning of pasta life",
        category: ACHIEVEMENT_CATEGORIES.SPECIAL
    },
    "Resourceful": {
        description: "Reach 30 prestige with less than 15 workers",
        check: (stats) => stats.pastaPrestige >= 30 && stats.workerCount < 15,
        reward: "doing more with less!",
        category: ACHIEVEMENT_CATEGORIES.CHALLENGE
    },
    "High Stakes": {
        description: "Have 75+ chaos and 40+ ingredients at the same time",
        check: (stats) => stats.chaosLevel >= 75 && stats.ingredients >= 40,
        reward: "Living dangerously!",
        category: ACHIEVEMENT_CATEGORIES.CHALLENGE
    },
    "Recovery Master": {
        description: "Go from 0 ingredients to 30 in a single turn",
        check: (stats) => stats.ingredientGainInOneTurn >= 30,
        reward: "Back from the brink!",
        category: ACHIEVEMENT_CATEGORIES.RESOURCES
    },
    "Century Club": {
        description: "Survive for 100 turns while keeping chaos below 50",
        check: (stats, turn) => turn >= 100 && stats.chaosLevel < 50,
        reward: "The steady hand of management",
        category: ACHIEVEMENT_CATEGORIES.PROGRESS
    },
    "200 Club": {
        description: "Survive for 200 turns. You're practically part of the furniture now.",
        check: (stats, turn) => turn >= 200,
        reward: "Here's your gold watch!",
        category: ACHIEVEMENT_CATEGORIES.PROGRESS
    },
    "Dancing With Danger": {
        description: "Maintain chaos between 90-99 for 5 consecutive turns",
        check: (stats) => stats.highChaosStreakTurns >= 5,
        reward: "Teetering on the edge",
        category: ACHIEVEMENT_CATEGORIES.CHAOS
    },
    "Order From Chaos": {
        description: "Reduce chaos from above 90 to below 30 in a single turn",
        check: (stats) => stats.chaosReductionInOneTurn >= 60,
        reward: "A calming influence",
        category: ACHIEVEMENT_CATEGORIES.CHAOS
    },
    "Chaos Theory": {
        description: "Trigger 10 chaos events in a single game",
        check: (stats) => stats.chaosEventsTriggered >= 10,
        reward: "The butterfly effect",
        category: ACHIEVEMENT_CATEGORIES.CHAOS
    },
    "Noodle Tycoon": {
        description: "Accumulate 500 noodles at once",
        check: (stats) => stats.noodles >= 500,
        reward: "Swimming in pasta!",
        category: ACHIEVEMENT_CATEGORIES.RESOURCES
    },
    "Millionaire": {
        description: "Accumulate $10,000",
        check: (stats) => stats.money >= 10000,
        reward: "Money to burn",
        category: ACHIEVEMENT_CATEGORIES.RESOURCES
    },
    "Noodle Economy": {
        description: "Earn $1000 in a single sale",
        check: (stats) => stats.highestSingleSale >= 1000,
        reward: "Business magnate",
        category: ACHIEVEMENT_CATEGORIES.RESOURCES
    },
    "Pasta Miser": {
        description: "Run out of money completely but still survive",
        check: (stats) => stats.hitZeroMoney && !stats.gameOver,
        reward: "Living on borrowed time",
        category: ACHIEVEMENT_CATEGORIES.RESOURCES
    },
    "Worker's Paradise": {
        description: "Maintain 100 workers with less than 20% turnover",
        check: (stats) => stats.workerCount >= 100 && stats.workerTurnoverRate < 0.2,
        reward: "They love you!",
        category: ACHIEVEMENT_CATEGORIES.WORKERS
    },
    "One-Person Operation": {
        description: "Stay at exactly 1 worker for 5 consecutive turns",
        check: (stats) => stats.singleWorkerTurns >= 5,
        reward: "Self-reliance",
        category: ACHIEVEMENT_CATEGORIES.WORKERS
    },
    "Rapid Scaling": {
        description: "Increase worker count by 30 in a single turn",
        check: (stats) => stats.workerGainInOneTurn >= 30,
        reward: "Recruitment drive",
        category: ACHIEVEMENT_CATEGORIES.WORKERS
    },
    "Michelin Star": {
        description: "Reach 150 prestige",
        check: (stats) => stats.pastaPrestige >= 150,
        reward: "Fine dining",
        category: ACHIEVEMENT_CATEGORIES.PRESTIGE
    },
    "Double Michelin": {
        description: "Reach 200 prestige",
        check: (stats) => stats.pastaPrestige >= 200,
        reward: "World-class cuisine",
        category: ACHIEVEMENT_CATEGORIES.PRESTIGE
    },
    "Triple Michelin": {
        description: "Reach 250 prestige",
        check: (stats) => stats.pastaPrestige >= 250,
        reward: "Culinary legend",
        category: ACHIEVEMENT_CATEGORIES.PRESTIGE
    },
    "Food Network Star": {
        description: "Reach 300 prestige",
        check: (stats) => stats.pastaPrestige >= 300,
        reward: "Celebrity chef status",
        category: ACHIEVEMENT_CATEGORIES.PRESTIGE
    },
    "The Perfect Run": {
        description: "Complete a 50+ turn game without ever exceeding 50 chaos",
        check: (stats, turn) => turn >= 50 && stats.maxChaosLevelReached <= 50,
        reward: "Nerves of steel",
        category: ACHIEVEMENT_CATEGORIES.SPECIAL
    },
    "Mystic Master": {
        description: "Play 5 magic-themed cards in a single game",
        check: (stats) => stats.magicCardsPlayed >= 5,
        reward: "A touch of magic",
        category: ACHIEVEMENT_CATEGORIES.SPECIAL
    },
    "Balanced Diet": {
        description: "Maintain exactly equal levels of prestige, chaos, and ingredients for 3 turns",
        check: (stats) => stats.balancedStatsTurns >= 3,
        reward: "Perfect harmony",
        category: ACHIEVEMENT_CATEGORIES.SPECIAL
    },
    "Risk Taker": {
        description: "Successfully complete 3 risk achievements in a single game",
        check: (stats) => stats.riskAchievementsSucceeded >= 3,
        reward: "Fortune favors the bold",
        category: ACHIEVEMENT_CATEGORIES.CHALLENGE
    },
    "On The Edge": {
        description: "Play 10 turns with less than 5 ingredients available",
        check: (stats) => stats.lowIngredientTurns >= 10,
        reward: "Resource conservation expert",
        category: ACHIEVEMENT_CATEGORIES.CHALLENGE
    },
    "Skeleton Crew": {
        description: "Survive 15 turns with less than 5 workers",
        check: (stats) => stats.lowWorkerTurns >= 15,
        reward: "Small but mighty",
        category: ACHIEVEMENT_CATEGORIES.CHALLENGE
    },
    "Against All Odds": {
        description: "Survive a turn with max chaos, 1 worker, and 0 ingredients",
        check: (stats) => stats.survivedWithNothingLeft,
        reward: "The ultimate comeback story",
        category: ACHIEVEMENT_CATEGORIES.CHALLENGE
    },
    "Upgrade Enthusiast": {
        description: "Buy 10 different upgrade cards across all games",
        check: (stats) => stats.totalUpgradesBought >= 10,
        reward: "Quality investment",
        category: ACHIEVEMENT_CATEGORIES.COLLECTION
    },
    "Upgrade Addict": {
        description: "Buy 20 different upgrade cards across all games",
        check: (stats) => stats.totalUpgradesBought >= 20,
        reward: "Factory evolution",
        category: ACHIEVEMENT_CATEGORIES.COLLECTION
    },
    "Pasta Researcher": {
        description: "Play 10 different science-themed cards",
        check: (stats) => stats.scienceCardsPlayed >= 10,
        reward: "The science of pasta",
        category: ACHIEVEMENT_CATEGORIES.COLLECTION
    },
    "Grand Pasta Master": {
        description: "Reach 500 prestige points in a single game",
        check: (stats) => stats.pastaPrestige >= 500,
        reward: "Your name is whispered in reverent tones throughout the culinary world",
        category: ACHIEVEMENT_CATEGORIES.PRESTIGE
    },
    "Pasta Whisperer": {
        description: "Have 150+ workers with zero worker losses for 20 consecutive turns",
        check: (stats) => stats.workerCount >= 150 && stats.noWorkerLossTurns >= 20,
        reward: "They would follow you into the fires of Mount Doom",
        category: ACHIEVEMENT_CATEGORIES.WORKERS
    },
    "Edge of Tomorrow": {
        description: "Survive 10 consecutive turns with chaos at exactly 99",
        check: (stats) => stats.edgeOfTomorrowTurns >= 10,
        reward: "Live. Die. Al dente.",
        category: ACHIEVEMENT_CATEGORIES.CHALLENGE
    },
    "Pasta Rich": {
        description: "Accumulate $100,000 in a single game",
        check: (stats) => stats.money >= 100000,
        reward: "Rolling in dough, literally",
        category: ACHIEVEMENT_CATEGORIES.RESOURCES
    },
    "The Pasta Godfather": {
        description: "Play 50 cards in a single game without encountering any chaos events",
        check: (stats) => stats.cardsPlayedWithoutChaos >= 50,
        reward: "An offer they couldn't refuse",
        category: ACHIEVEMENT_CATEGORIES.SPECIAL
    },
    "It's Over 9000!!!": {
        description: "Produce 9001 noodles in a single game",
        check: (stats) => stats.totalNoodlesProduced >= 9001,
        reward: "His power level is impossible!",
        category: ACHIEVEMENT_CATEGORIES.RESOURCES
    },
    "Hall of Legends": {
        description: "Complete 50 achievements",
        check: () => {
            const unlockedCount = getUnlockedAchievements().length;
            return unlockedCount >= 50;
        },
        reward: "True pasta legend status unlocked",
        category: ACHIEVEMENT_CATEGORIES.SPECIAL
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
        check: (stats) => stats.pastaPrestige === 25 && stats.workerCount === 10,
        successChance: 0.4,
        onSuccess: (stats) => {
            stats.workerCount += 15;
            stats.pastaPrestige += 10;
            return "Workers: <span style='color:green'>++</span> | Prestige: <span style='color:green'>+</span>";
        },
        onFailure: (stats) => {
            stats.workerCount = Math.floor(stats.workerCount * 0.5);
            stats.chaosLevel += 15;
            return "Workers: <span style='color:red'>--</span> | Chaos: <span style='color:red'>+</span>";
        }
    },
    "Triple Threat": {
        description: "Have exactly 33 chaos, ingredients, and workers",
        check: (stats) => stats.chaosLevel === 33 && stats.ingredients === 33 && stats.workerCount === 33,
        successChance: 0.3,
        onSuccess: (stats) => {
            stats.pastaPrestige += 15;
            stats.chaosLevel = Math.max(0, stats.chaosLevel - 10);
            return "Prestige: <span style='color:green'>++</span> | Chaos: <span style='color:green'>-</span>";
        },
        onFailure: (stats) => {
            stats.workerCount = Math.floor(stats.workerCount * 0.7);
            stats.ingredients = Math.floor(stats.ingredients * 0.7);
            return "Workers: <span style='color:red'>--</span> | Ingredients: <span style='color:red'>--</span>";
        }
    },
    "Chaos Gambit": {
        description: "Have exactly 88 chaos and 88 noodles",
        check: (stats) => stats.chaosLevel === 88 && stats.noodles === 88,
        successChance: 0.35,
        onSuccess: (stats) => {
            stats.money += 888;
            stats.pastaPrestige += 8;
            return "Money: <span style='color:green'>+++</span> | Prestige: <span style='color:green'>+</span>";
        },
        onFailure: (stats) => {
            stats.noodles = Math.floor(stats.noodles * 0.5);
            stats.chaosLevel += 10;
            return "Noodles: <span style='color:red'>--</span> | Chaos: <span style='color:red'>+</span>";
        }
    },
    "Perfect Balance": {
        description: "Have exactly 50 chaos, 50 ingredients, and 50 workers",
        check: (stats) => stats.chaosLevel === 50 && stats.ingredients === 50 && stats.workerCount === 50,
        successChance: 0.25,
        onSuccess: (stats) => {
            stats.pastaPrestige += 25;
            stats.money += 500;
            return "Prestige: <span style='color:green'>++</span> | Money: <span style='color:green'>++</span>";
        },
        onFailure: (stats) => {
            stats.chaosLevel += 20;
            stats.workerCount -= 10;
            return "Chaos: <span style='color:red'>++</span> | Workers: <span style='color:red'>-</span>";
        }
    },
    "Broke Millionaire": {
        description: "Have 1000+ noodles but less than $50",
        check: (stats) => stats.noodles >= 1000 && stats.money < 50,
        successChance: 0.45,
        onSuccess: (stats) => {
            stats.money += 2000;
            stats.pastaPrestige += 5;
            return "Money: <span style='color:green'>+++</span> | Prestige: <span style='color:green'>+</span>";
        },
        onFailure: (stats) => {
            stats.noodles = Math.floor(stats.noodles * 0.4);
            return "Noodles: <span style='color:red'>---</span>";
        }
    },
    "Death's Door": {
        description: "Have exactly 99 chaos for 2 consecutive turns",
        check: (stats) => stats.nearMaxChaosConsecutiveTurns >= 2,
        successChance: 0.2,
        onSuccess: (stats) => {
            stats.chaosLevel = 50;
            stats.pastaPrestige += 30;
            return "Chaos: <span style='color:green'>---</span> | Prestige: <span style='color:green'>+++</span>";
        },
        onFailure: (stats) => {
            stats.chaosLevel = 100;
            return "Chaos: <span style='color:red'>MAX</span> | Game Over Imminent!";
        }
    },
    "All or Nothing": {
        description: "Have 0 ingredients, 0 money, but 50+ workers",
        check: (stats) => stats.ingredients === 0 && stats.money === 0 && stats.workerCount >= 50,
        successChance: 0.3,
        onSuccess: (stats) => {
            stats.ingredients += 20;
            stats.money += 1000;
            return "Ingredients: <span style='color:green'>+++</span> | Money: <span style='color:green'>+++</span>";
        },
        onFailure: (stats) => {
            stats.workerCount = Math.floor(stats.workerCount * 0.6);
            return "Workers: <span style='color:red'>--</span> | They're abandoning ship!";
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

// Get count of achievements by category
export const getAchievementCountByCategory = () => {
    const categories = {};
    
    // Initialize categories
    Object.values(ACHIEVEMENT_CATEGORIES).forEach(category => {
        categories[category] = { total: 0, unlocked: 0 };
    });
    
    // Count total achievements by category
    Object.values(ACHIEVEMENTS).forEach(achievement => {
        const category = achievement.category || ACHIEVEMENT_CATEGORIES.SPECIAL;
        if (categories[category]) {
            categories[category].total++;
        }
    });
    
    // Count unlocked achievements by category
    const unlocked = getUnlockedAchievements();
    unlocked.forEach(id => {
        const achievement = ACHIEVEMENTS[id];
        if (achievement && achievement.category) {
            if (categories[achievement.category]) {
                categories[achievement.category].unlocked++;
            }
        }
    });
    
    return categories;
};

// Get total achievement progress percentage
export const getAchievementProgress = () => {
    const total = Object.keys(ACHIEVEMENTS).length;
    const unlocked = getUnlockedAchievements().length;
    return Math.floor((unlocked / total) * 100);
};

// resetAchievements function to clear achievements and played cards
export const resetAchievements = () => {
    localStorage.removeItem('noodleFactoryAchievements');
    localStorage.removeItem('noodleFactoryFirstGame');
    localStorage.removeItem('noodleFactoryPlayedCards');
};

// Enhanced checkAchievements with risk achievements handling
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
    
    // Check regular achievements
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
    
    // Check risk achievements
    Object.entries(RISK_ACHIEVEMENTS).forEach(([id, achievement]) => {
        if (achievement.check(stats)) {
            // Record that a risk achievement was attempted
            stats.riskAchievementAttempts = (stats.riskAchievementAttempts || 0) + 1;
            
            // Determine success or failure
            const success = Math.random() < achievement.successChance;
            
            if (success) {
                // Apply success effects and update stats
                const result = achievement.onSuccess(stats);
                stats.riskAchievementsSucceeded = (stats.riskAchievementsSucceeded || 0) + 1;
                
                // Create a special achievement notification
                return {
                    id: `RISK: ${id}`,
                    description: `${achievement.description} - SUCCESS!`,
                    reward: result
                };
            } else {
                // Apply failure effects
                const result = achievement.onFailure(stats);
                stats.riskAchievementsFailed = (stats.riskAchievementsFailed || 0) + 1;
                
                // Create a failure notification
                return {
                    id: `RISK: ${id}`,
                    description: `${achievement.description} - FAILED!`,
                    reward: result
                };
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

// Add a new function to track played card
export function trackPlayedCard(cardName) {
    const played = getPlayedCards();
    played[cardName] = (played[cardName] || 0) + 1;
    localStorage.setItem('noodleFactoryPlayedCards', JSON.stringify(played));
    
    // Check for card-related achievements
    checkCardAchievements();
}

// Enhanced to track magic and special cards
export function checkCardAchievements() {
    const played = getPlayedCards();
    const totalCards = Object.keys(CARDS).length;
    const playedCount = Object.keys(played).length;
    const percentage = (playedCount / totalCards) * 100;

    console.log(`Cards played: ${playedCount}/${totalCards} (${percentage.toFixed(1)}%)`);

    // These will now trigger achievement checks through the normal achievement system
    checkAchievements(gameState.playerStats);
}

// Function to get the rarest achievements (least unlocked)
export function getRarestAchievements(limit = 5) {
    const unlocked = getUnlockedAchievements();
    const allAchievements = Object.keys(ACHIEVEMENTS);
    
    // Get achievements that haven't been unlocked yet
    const notUnlocked = allAchievements.filter(id => !unlocked.includes(id));
    
    // Sort them by difficulty (could be enhanced with actual statistics in the future)
    const sorted = notUnlocked.sort((a, b) => {
        const achA = ACHIEVEMENTS[a];
        const achB = ACHIEVEMENTS[b];
        
        // Prioritize special achievements
        if (achA.category === ACHIEVEMENT_CATEGORIES.SPECIAL && 
            achB.category !== ACHIEVEMENT_CATEGORIES.SPECIAL) {
            return -1;
        }
        if (achB.category === ACHIEVEMENT_CATEGORIES.SPECIAL && 
            achA.category !== ACHIEVEMENT_CATEGORIES.SPECIAL) {
            return 1;
        }
        
        // Then prioritize challenge achievements
        if (achA.category === ACHIEVEMENT_CATEGORIES.CHALLENGE && 
            achB.category !== ACHIEVEMENT_CATEGORIES.CHALLENGE) {
            return -1;
        }
        if (achB.category === ACHIEVEMENT_CATEGORIES.CHALLENGE && 
            achA.category !== ACHIEVEMENT_CATEGORIES.CHALLENGE) {
            return 1;
        }
        
        return 0;
    });
    
    return sorted.slice(0, limit).map(id => ({
        id,
        description: ACHIEVEMENTS[id].description,
        category: ACHIEVEMENTS[id].category
    }));
}