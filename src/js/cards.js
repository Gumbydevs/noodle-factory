// This file defines the card system, including the creation and management of cards, their effects, and how they interact with the game state.

export const CARDS = {
    "Sobbing Intern": {
        description: "An intern's tears might boost morale... or cause chaos.",
        effect: (state) => {
            state.playerStats.workerEnergy += 10;
            state.playerStats.chaosLevel += 5;
            return "Intern's tears somehow boost worker morale!";
        }
    },
    "Rotten Egg Surprise": {
        description: "Add questionable ingredients to your noodles.",
        effect: (state) => {
            state.playerStats.ingredients.push("Rotten Egg");
            state.playerStats.chaosLevel += 15;
            return "Questionable ingredients acquired...";
        }
    },
    "Overtime Whistle": {
        description: "Push your workers harder for more prestige.",
        effect: (state) => {
            state.playerStats.pastaPrestige += 20;
            state.playerStats.workerEnergy -= 25;
            return "Workers exhausted but productive!";
        }
    },
    "Noodle Slap": {
        description: "Restore order through pasta violence.",
        effect: (state) => {
            state.playerStats.chaosLevel -= 10;
            state.playerStats.workerEnergy -= 5;
            return "Order restored through pasta violence!";
        }
    }
};

export function getRandomCard() {
    const cards = Object.keys(CARDS);
    return cards[Math.floor(Math.random() * cards.length)];
}