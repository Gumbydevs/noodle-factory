// This file defines the card system, including the creation and management of cards, their effects, and how they interact with the game state.

export const CARDS = {
    "Sobbing Intern": {
        description: "An intern's tears might boost morale... or cause chaos.",
        statModifiers: {
            energy: 10,
            chaos: 5
        },
        effect: (state) => {
            state.playerStats.workerEnergy += 10;
            state.playerStats.chaosLevel += 5;
            return "Intern's tears somehow boost worker morale!";
        }
    },
    "Rotten Egg Surprise": {
        description: "Add questionable ingredients to your noodles.",
        statModifiers: {
            ingredients: 1,
            chaos: 15
        },
        effect: (state) => {
            state.playerStats.ingredients.push("Rotten Egg");
            state.playerStats.chaosLevel += 15;
            return "Questionable ingredients acquired...";
        }
    },
    "Overtime Whistle": {
        description: "Push your workers harder for more prestige.",
        statModifiers: {
            prestige: 20,
            energy: -25
        },
        effect: (state) => {
            state.playerStats.pastaPrestige += 20;
            state.playerStats.workerEnergy -= 25;
            return "Workers exhausted but productive!";
        }
    },
    "Noodle Slap": {
        description: "Restore order through pasta violence.",
        statModifiers: {
            chaos: -10,
            energy: -5
        },
        effect: (state) => {
            state.playerStats.chaosLevel -= 10;
            state.playerStats.workerEnergy -= 5;
            return "Order restored through pasta violence!";
        }
    },
    "Noodle Kraken": {
        description: "A massive tentacle made of pasta emerges from Vat 7!",
        statModifiers: {
            chaos: 15,
            prestige: 10,
            energy: -10
        },
        effect: (state) => {
            state.playerStats.chaosLevel += 15;
            state.playerStats.pastaPrestige += 10;
            state.playerStats.workerEnergy -= 10;
            return "The Kraken has become our star attraction!";
        }
    },
    "Vat Explosion": {
        description: "Vat 3 is building dangerous pressure levels!",
        statModifiers: {
            ingredients: -2,
            chaos: 20,
            energy: -15
        },
        effect: (state) => {
            state.playerStats.ingredients = state.playerStats.ingredients.slice(2);
            state.playerStats.chaosLevel += 20;
            state.playerStats.workerEnergy -= 15;
            return "BOOM! The ceiling is covered in al dente shrapnel!";
        }
    },
    "Pasta Prophet": {
        description: "A mystic appears, preaching the gospel of the Flying Spaghetti Monster.",
        statModifiers: {
            prestige: 15,
            chaos: 10,
            energy: 5
        },
        effect: (state) => {
            state.playerStats.pastaPrestige += 15;
            state.playerStats.chaosLevel += 10;
            state.playerStats.workerEnergy += 5;
            return "R'amen! The workers have been blessed by His Noodly Appendage!";
        }
    },
    "Quantum Marinara": {
        description: "The sauce has achieved quantum superposition!",
        statModifiers: {
            ingredients: 3,
            chaos: 8,
            prestige: 12
        },
        effect: (state) => {
            state.playerStats.ingredients.push("Quantum Tomato", "Schrödinger's Herb", "Time-Dilated Garlic");
            state.playerStats.chaosLevel += 8;
            state.playerStats.pastaPrestige += 12;
            return "The sauce exists in all possible states until observed!";
        }
    },
    "Ravioli Riot": {
        description: "The stuffed pasta is organizing a revolution!",
        statModifiers: {
            chaos: 25,
            energy: -20,
            prestige: -10
        },
        effect: (state) => {
            state.playerStats.chaosLevel += 25;
            state.playerStats.workerEnergy -= 20;
            state.playerStats.pastaPrestige -= 10;
            return "The ravioli have seized the means of production!";
        }
    },
    "Time-Traveling Tagliatelle": {
        description: "Some noodles have aged 100 years, others are from next Tuesday.",
        statModifiers: {
            ingredients: 4,
            prestige: 15,
            chaos: 12
        },
        effect: (state) => {
            state.playerStats.ingredients.push("Vintage Pasta", "Future Noodle", "Temporal Flour", "Paradox Sauce");
            state.playerStats.pastaPrestige += 15;
            state.playerStats.chaosLevel += 12;
            return "Customers are eating tomorrow's lunch yesterday!";
        }
    },
    "Eldritch Al Dente": {
        description: "The pasta has achieved consciousness... and it hungers.",
        statModifiers: {
            chaos: 30,
            energy: -25,
            prestige: 25
        },
        effect: (state) => {
            state.playerStats.chaosLevel += 30;
            state.playerStats.workerEnergy -= 25;
            state.playerStats.pastaPrestige += 25;
            return "Ph'nglui mglw'nafh Spaghetti R'lyeh wgah'nagl fhtagn!";
        }
    },
    "Noodle Necromancer": {
        description: "Raising expired pasta from the dead!",
        statModifiers: {
            ingredients: 5,
            chaos: 18,
            energy: -15
        },
        effect: (state) => {
            state.playerStats.ingredients.push("Zombie Ziti", "Phantom Fettuccine", "Ghost Gnocchi", 
                "Revenant Rigatoni", "Wraith Ravioli");
            state.playerStats.chaosLevel += 18;
            state.playerStats.workerEnergy -= 15;
            return "The undead pasta shambles through the kitchen!";
        }
    }
};

export function getRandomCard() {
    const cards = Object.keys(CARDS);
    return cards[Math.floor(Math.random() * cards.length)];
}