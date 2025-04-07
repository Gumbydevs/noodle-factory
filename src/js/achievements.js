export const ACHIEVEMENTS = {
    "Chaos Lord": {
        description: "Reach 50 chaos without losing control",
        check: (stats) => stats.chaosLevel >= 50,
        reward: "Unlock chaos-themed cards"
    },
    "Master Chef": {
        description: "Reach 100 prestige",
        check: (stats) => stats.pastaPrestige >= 100,
        reward: "Unlock premium ingredients"
    },
    "Ingredient Hoarder": {
        description: "Collect 20 different ingredients",
        check: (stats) => stats.ingredients.length >= 20,
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
    }
};