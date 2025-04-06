// This file defines the card system, including the creation and management of cards, their effects, and how they interact with the game state.

export const CARDS = {
    "Sobbing Intern": {
        description: "An intern's tears might boost morale... or cause chaos.",
        requirements: null, // No requirements
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
        requirements: null, // No requirements
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
        requirements: null, // No requirements
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
        requirements: null, // No requirements
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
        requirements: null, // No requirements
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
        requirements: {
            ingredients: 2 // Requires at least 2 ingredients
        },
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
        requirements: null, // No requirements
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
        requirements: {
            ingredients: 1 // Requires at least 1 ingredient
        },
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
        requirements: null, // No requirements
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
        requirements: null, // No requirements
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
        requirements: null, // No requirements
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
        requirements: null, // No requirements
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
    },
    "Pasta Fusion Reactor": {
        description: "Attempt to harness the power of nuclear pasta!",
        requirements: { ingredients: 3 },
        statModifiers: {
            chaos: 25,
            prestige: 30,
            energy: -20
        },
        effect: (state) => {
            state.playerStats.chaosLevel += 25;
            state.playerStats.pastaPrestige += 30;
            state.playerStats.workerEnergy -= 20;
            state.playerStats.ingredients = state.playerStats.ingredients.slice(3);
            return "The pasta has achieved nuclear fusion!";
        }
    },
    "Workers Strike": {
        description: "The union demands better pasta conditions!",
        requirements: null,
        statModifiers: {
            energy: -30,
            chaos: 15,
            prestige: -10
        },
        effect: (state) => {
            state.playerStats.workerEnergy -= 30;
            state.playerStats.chaosLevel += 15;
            state.playerStats.pastaPrestige -= 10;
            return "The workers have formed a picket line with giant spaghetti signs!";
        }
    },
    "Midnight Security": {
        description: "Double-check all the locks before closing.",
        requirements: null,
        statModifiers: {
            chaos: -15,
            energy: -5,
            prestige: 5
        },
        effect: (state) => {
            state.playerStats.chaosLevel -= 15;
            state.playerStats.workerEnergy -= 5;
            state.playerStats.pastaPrestige += 5;
            return "The factory is secure for the night!";
        }
    },
    "Unlocked Door": {
        description: "Someone forgot to lock up last night...",
        requirements: null,
        statModifiers: {
            chaos: 20,
            prestige: -15,
            ingredients: -2
        },
        effect: (state) => {
            state.playerStats.chaosLevel += 20;
            state.playerStats.pastaPrestige -= 15;
            state.playerStats.ingredients = state.playerStats.ingredients.slice(2);
            return "Raccoons have ransacked the ingredient storage!";
        }
    },
    "Lesser Of Two Weevils": {
        description: "Tiny bugs have infested the flour supply!",
        requirements: null,
        statModifiers: {
            ingredients: -3,
            chaos: 15,
            prestige: -10
        },
        effect: (state) => {
            state.playerStats.ingredients = state.playerStats.ingredients.slice(3);
            state.playerStats.chaosLevel += 15;
            state.playerStats.pastaPrestige -= 10;
            return "Extra protein in the pasta tonight...";
        }
    },
    "Emergency Repairs": {
        description: "The ancient pasta extruder needs fixing.",
        requirements: { ingredients: 2 },
        statModifiers: {
            energy: -20,
            prestige: 15,
            chaos: -10
        },
        effect: (state) => {
            state.playerStats.workerEnergy -= 20;
            state.playerStats.pastaPrestige += 15;
            state.playerStats.chaosLevel -= 10;
            return "The machine purrs like new... mostly.";
        }
    },
    "Factory Flood": {
        description: "A pipe burst in the boiler room!",
        requirements: null,
        statModifiers: {
            chaos: 25,
            energy: -15,
            ingredients: -2
        },
        effect: (state) => {
            state.playerStats.chaosLevel += 25;
            state.playerStats.workerEnergy -= 15;
            state.playerStats.ingredients = state.playerStats.ingredients.slice(2);
            return "The basement is now a pasta soup kitchen!";
        }
    },
    "Graffiti Artists": {
        description: "Local artists decorated the factory walls overnight.",
        requirements: null,
        statModifiers: {
            chaos: 10,
            prestige: -5
        },
        effect: (state) => {
            state.playerStats.chaosLevel += 10;
            state.playerStats.pastaPrestige -= 5;
            return "At least the flying spaghetti monster mural looks nice...";
        }
    },
    "Machine Maintenance": {
        description: "Perform routine maintenance on all equipment.",
        requirements: { ingredients: 1 },
        statModifiers: {
            energy: -10,
            chaos: -20,
            prestige: 10
        },
        effect: (state) => {
            state.playerStats.workerEnergy -= 10;
            state.playerStats.chaosLevel -= 20;
            state.playerStats.pastaPrestige += 10;
            return "Everything's running smoothly... for now.";
        }
    },
    "Power Outage": {
        description: "The factory has lost power!",
        requirements: null,
        statModifiers: {
            chaos: 30,
            energy: -25,
            prestige: -15
        },
        effect: (state) => {
            state.playerStats.chaosLevel += 30;
            state.playerStats.workerEnergy -= 25;
            state.playerStats.pastaPrestige -= 15;
            return "Workers are making pasta by candlelight!";
        }
    },
    "Health Inspector": {
        description: "Surprise inspection from the health department!",
        requirements: null,
        statModifiers: {
            chaos: 20,
            energy: -15,
            prestige: -20
        },
        effect: (state) => {
            state.playerStats.chaosLevel += 20;
            state.playerStats.workerEnergy -= 15;
            state.playerStats.pastaPrestige -= 20;
            return "Quick, hide the sentient spaghetti!";
        }
    },
    "Earthquake": {
        description: "The ground shakes, rattling the ancient vats!",
        requirements: { ingredients: 3 },
        statModifiers: {
            chaos: 35,
            ingredients: -3,
            energy: -20
        },
        effect: (state) => {
            state.playerStats.chaosLevel += 35;
            state.playerStats.ingredients = state.playerStats.ingredients.slice(3);
            state.playerStats.workerEnergy -= 20;
            return "The tremors have awakened something in Vat 7...";
        }
    },
    "Exterminator Visit": {
        description: "Deal with the growing pest problem.",
        requirements: null,
        statModifiers: {
            chaos: -10,
            energy: -5,
            prestige: 5
        },
        effect: (state) => {
            state.playerStats.chaosLevel -= 10;
            state.playerStats.workerEnergy -= 5;
            state.playerStats.pastaPrestige += 5;
            return "The rats have been promoted to quality control.";
        }
    }
};

export function getRandomCard() {
    const cards = Object.keys(CARDS);
    return cards[Math.floor(Math.random() * cards.length)];
}