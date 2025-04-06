// This file handles random events that can occur during the game, adding unpredictability and humor to the gameplay.

const events = [
    {
        id: 1,
        name: "Sobbing Intern",
        description: "An intern is crying in the corner. Do you comfort them or use them as a noodle ingredient?",
        effect: (state) => {
            // Randomly choose an effect
            const choice = Math.random() < 0.5 ? 'comfort' : 'ingredient';
            if (choice === 'comfort') {
                state.morale += 5;
                return "You comfort the intern. Morale increases!";
            } else {
                state.ingredients.push("Sobbing Intern");
                return "You add the intern to the noodle mix. Delicious!";
            }
        }
    },
    {
        id: 2,
        name: "Rotten Egg Surprise",
        description: "A box of rotten eggs has arrived. Do you use them or throw them out?",
        effect: (state) => {
            const choice = Math.random() < 0.5 ? 'use' : 'throw';
            if (choice === 'use') {
                state.spiceLevel += 10;
                return "You use the rotten eggs. Spice level skyrockets!";
            } else {
                return "You throw the eggs away. Nothing happens.";
            }
        }
    },
    {
        id: 3,
        name: "Overtime Whistle",
        description: "The overtime whistle blows! Do you force everyone to work harder or let them rest?",
        effect: (state) => {
            const choice = Math.random() < 0.5 ? 'work' : 'rest';
            if (choice === 'work') {
                state.workerEnergy -= 10;
                state.noodleOutput += 20;
                return "Workers are exhausted but output increases!";
            } else {
                state.workerEnergy += 10;
                return "You let the workers rest. Energy increases!";
            }
        }
    },
    {
        id: 4,
        name: "Noodle Slap",
        description: "A rogue noodle has slapped you! Do you retaliate or embrace the chaos?",
        effect: (state) => {
            const choice = Math.random() < 0.5 ? 'retaliate' : 'embrace';
            if (choice === 'retaliate') {
                state.chaosLevel += 5;
                return "You retaliate! Chaos level rises!";
            } else {
                state.chaosLevel -= 5;
                return "You embrace the chaos! Things calm down a bit.";
            }
        }
    }
];

export default events;