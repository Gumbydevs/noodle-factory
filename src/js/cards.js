// This file defines the card system, including the creation and management of cards, their effects, and how they interact with the game state.

import { gameState } from './state.js';

export const CARDS = {
    "Sobbing Intern": {
        description: "An intern's tears might boost morale... or cause chaos.",
        requirements: null, // No requirements
        statModifiers: {
            workers: 3,
            chaos: 5
        },
        effect: (state) => {
            return "Intern's tears somehow boost worker morale!";
        }
    },
    "Rotten Egg Surprise": {
        description: "Add questionable ingredients to your noodles.",
        requirements: null, // No requirements
        statModifiers: {
            ingredients: 1,
            chaos: 8
        },
        effect: (state) => {
            return "Questionable ingredients acquired...";
        }
    },
    "Overtime Whistle": {
        description: "Push your workers harder for more prestige.",
        requirements: null, // No requirements
        statModifiers: {
            prestige: 10,
            workers: -3
        },
        effect: (state) => {
            let bonus = "";
            // Risk/Reward: If you have a well-staffed factory, get an extra prestige bonus.
            if (state.playerStats.workerCount > 20) {
                bonus = " Extra energy surges from a well-staffed factory!";
                state.playerStats.pastaPrestige += 5;
            }
            return "Workers exhausted but productive!" + bonus;
        }
    },
    "Noodle Slap": {
        description: "Restore order through pasta violence.",
        requirements: null, // No requirements
        statModifiers: {
            chaos: -8,
            workers: -1
        },
        effect: (state) => {
            return "Order restored through pasta violence!";
        }
    },
    "Noodle Kraken": {
        description: "A massive tentacle made of pasta emerges from Vat 7!",
        requirements: null, // No requirements
        statModifiers: {
            chaos: 12,
            prestige: 8,
            workers: -2
        },
        effect: (state) => {
            let bonus = "";
            // Risk/Reward: In a calm state, the Kraken strikes with extra force.
            if (state.playerStats.chaosLevel < 30) {
                bonus = " In the calm, the Kraken strikes with extra force!";
                state.playerStats.pastaPrestige += 4;
            }
            state.playerStats.lostWorkers += 2;
            return "The tentacle waves menacingly with marinara dripping from its noodly appendages!" + bonus;
        }
    },
    "Vat Explosion": {
        description: "Vat 3 is building dangerous pressure levels!",
        requirements: {
            ingredients: 2 // Requires at least 2 ingredients
        },
        statModifiers: {
            ingredients: -2,
            chaos: 15,
            workers: -3
        },
        effect: (state) => {
            let bonus = "";
            // Risk/Reward: If chaos is already high, the explosion is even more catastrophic.
            if (state.playerStats.chaosLevel > 70) {
                bonus = " The excessive chaos amplifies the explosion's impact!";
                state.playerStats.lostWorkers += 2;
                state.playerStats.lostIngredients += 1;
            }
            state.playerStats.lostWorkers += 3;
            state.playerStats.lostIngredients += 2;
            return "The explosion sends pasta shrapnel in all directions!" + bonus;
        }
    },
    "Pasta Prophet": {
        description: "A mystic appears, preaching the gospel of the Flying Spaghetti Monster.",
        requirements: null, // No requirements
        statModifiers: {
            prestige: 12,
            chaos: 6,
            workers: 2
        },
        effect: (state) => {
            state.playerStats.usedMagicCards = true;
            return "R'amen!";
        }
    },
    "Quantum Marinara": {
        description: "The sauce has achieved quantum superposition!",
        requirements: {
            ingredients: 1 // Requires at least 1 ingredient
        },
        statModifiers: {
            ingredients: 3,
            chaos: 6,
            prestige: 8
        },
        effect: (state) => {
            state.playerStats.usedMagicCards = true;
            return "The pasta has achieved quantum fusion!";
        }
    },
    "Ravioli Riot": {
        description: "The stuffed pasta is organizing a revolution!",
        requirements: null, // No requirements
        statModifiers: {
            chaos: 15,
            workers: -4,
            prestige: -5
        },
        effect: (state) => {
            return "The ravioli have seized the means of production!";
        }
    },
    "Time-Traveling Tagliatelle": {
        description: "Some noodles have aged 100 years, others are from next Tuesday.",
        requirements: null, // No requirements
        statModifiers: {
            ingredients: 4,
            prestige: 10,
            chaos: 8
        },
        effect: (state) => {
            let bonus = "";
            // Risk/Reward: If you have plenty of ingredients, time-travelers feast and boost your prestige.
            if (state.playerStats.ingredients > 5) {
                bonus = " The abundance of ingredients creates a feast for time-travelers!";
                state.playerStats.pastaPrestige += 3;
            }
            return "Customers are eating tomorrow's lunch yesterday!" + bonus;
        }
    },
    "Eldritch Al Dente": {
        description: "The pasta has achieved consciousness... and it hungers.",
        requirements: null, // No requirements
        statModifiers: {
            chaos: 18,
            workers: -4,
            prestige: 15
        },
        effect: (state) => {
            return "Ph'nglui mglw'nafh Spaghetti R'lyeh wgah'nagl fhtagn!";
        }
    },
    "Noodle Necromancer": {
        description: "Raising expired pasta from the dead!",
        requirements: null, // No requirements
        statModifiers: {
            ingredients: 5,
            chaos: 10,
            workers: -5
        },
        effect: (state) => {
            return "The undead pasta shambles through the kitchen!";
        }
    },
    "Pasta Fusion Reactor": {
        description: "Attempt to harness the power of nuclear pasta!",
        requirements: { ingredients: 3 },
        statModifiers: {
            chaos: 15,
            prestige: 20,
            workers: -6
        },
        effect: (state) => {
            return "The pasta has achieved nuclear fusion!";
        }
    },
    "Workers Strike": {
        description: "The union demands better pasta conditions!",
        requirements: null,
        statModifiers: {
            workers: -3,
            chaos: 10,
            prestige: -5
        },
        effect: (state) => {
            state.playerStats.strikeDeaths += 3;
            state.playerStats.lostWorkers += 3;
            if (state.playerStats.chaosLevel < 60) {
                state.playerStats.survivedStrikes++;
            }
            return "The workers have formed a picket line with giant spaghetti signs!";
        }
    },
    "Midnight Security": {
        description: "Double-check all the locks before closing.",
        requirements: null,
        statModifiers: {
            chaos: -10,
            workers: -2,
            prestige: 3
        },
        effect: (state) => {
            return "The factory is secure for the night!";
        }
    },
    "Unlocked Door": {
        description: "Someone forgot to lock up last night...",
        requirements: null,
        statModifiers: {
            chaos: 12,
            prestige: -8,
            ingredients: -1
        },
        effect: (state) => {
            return "Raccoons have ransacked the ingredient storage!";
        }
    },
    "Lesser Of Two Weevils": {
        description: "Tiny bugs have infested the flour supply!",
        requirements: null,
        statModifiers: {
            ingredients: -2,
            chaos: 8,
            prestige: -6
        },
        effect: (state) => {
            state.playerStats.chosenLesserWeevil = true;
            return "Extra protein in the pasta tonight...";
        }
    },
    "Emergency Repairs": {
        description: "The ancient pasta extruder needs fixing.",
        requirements: { ingredients: 2 },
        statModifiers: {
            workers: -4,
            prestige: 8,
            chaos: -6
        },
        effect: (state) => {
            return "The machine purrs like new... mostly.";
        }
    },
    "Factory Flood": {
        description: "A pipe burst in the boiler room!",
        requirements: null,
        statModifiers: {
            chaos: 15,
            workers: -3,
            ingredients: -1
        },
        effect: (state) => {
            return "The basement is now a pasta soup kitchen!";
        }
    },
    "Graffiti Artists": {
        description: "Local artists decorated the factory walls overnight.",
        requirements: null,
        statModifiers: {
            chaos: 6,
            prestige: -3
        },
        effect: (state) => {
            return "At least the flying spaghetti monster mural looks nice...";
        }
    },
    "Machine Maintenance": {
        description: "Perform routine maintenance on all equipment.",
        requirements: { ingredients: 1 },
        statModifiers: {
            workers: -3,
            chaos: -12,
            prestige: 6
        },
        effect: (state) => {
            return "Everything's running smoothly... for now.";
        }
    },
    "Power Outage": {
        description: "The factory has lost power!",
        requirements: null,
        statModifiers: {
            chaos: 16,
            workers: -5,
            prestige: -8
        },
        effect: (state) => {
            return "Workers are making pasta by candlelight!";
        }
    },
    "Health Inspector": {
        description: "Surprise inspection from the health department!",
        requirements: null,
        statModifiers: {
            chaos: 12,
            workers: -4,
            prestige: -10
        },
        effect: (state) => {
            return "Quick, hide the sentient spaghetti!";
        }
    },
    "Earthquake": {
        description: "The ground shakes, rattling the ancient vats!",
        requirements: { ingredients: 3 },
        statModifiers: {
            chaos: 20,
            ingredients: -3,
            workers: -5
        },
        effect: (state) => {
            return "The tremors have awakened something in Vat 7...";
        }
    },
    "Exterminator Visit": {
        description: "Deal with the growing pest problem.",
        requirements: null,
        statModifiers: {
            chaos: -8,
            workers: -2,
            prestige: 4
        },
        effect: (state) => {
            return "The rats have been promoted to quality control.";
        }
    },
    "Ravioli, Ravioli, Ravioli": {
        description: "The boss insists on you joining him for a 3 course meal of ravioli at lunchtime.",
        requirements: null,
        statModifiers: {
            workers: 4,
            prestige: 5,
            chaos: -3
        },
        effect: (state) => {
            return "Team morale soars after the great ravioli feast!";
        }
    },
    "Machine Overflow": {
        description: "A machine goes rampant and starts filling up the factory floor with noodles!",
        requirements: { ingredients: 2 },
        statModifiers: {
            ingredients: -2,
            chaos: 12,
            prestige: 6
        },
        effect: (state) => {
            return "Swimming in spaghetti! The local news is here!";
        }
    },
    "Employee Appreciation Day": {
        description: "Host a pasta-themed party for the workers.",
        requirements: null,
        statModifiers: {
            workers: 6,
            prestige: 4,
            chaos: -5
        },
        effect: (state) => {
            return "Happy workers make better pasta!";
        }
    },
    "Pasta Training Seminar": {
        description: "Send workers to learn advanced pasta-making techniques.",
        requirements: null,
        statModifiers: {
            workers: 5,
            prestige: 8,
            chaos: -4
        },
        effect: (state) => {
            return "The workers return as pasta artisans!";
        }
    },
    "Recruitment Fair": {
        description: "Host a job fair with free pasta samples.",
        requirements: { ingredients: 1 },
        statModifiers: {
            workers: 8,
            ingredients: -1,
            chaos: 3
        },
        effect: (state) => {
            return "New hires are eager to start their pasta journey!";
        }
    },
    "Pasta Ghost": {
        description: "A translucent figure made of fettuccine haunts the break room.",
        requirements: null,
        statModifiers: {
            chaos: 8,
            prestige: 7,
            workers: -2
        },
        effect: (state) => {
            return "It keeps leaving ectoplasmic alfredo sauce everywhere!";
        }
    },
    "Motivational Lasagna": {
        description: "Someone left a mysteriously inspiring lasagna in the break room.",
        requirements: null,
        statModifiers: {
            workers: 4,
            chaos: 3,
            prestige: 2
        },
        effect: (state) => {
            return "The layers spoke to their souls!";
        }
    },
    "Pasta Prodigy": {
        description: "A five-year-old pasta savant visits the factory.",
        requirements: null,
        statModifiers: {
            prestige: 12,
            workers: 3,
            chaos: 5
        },
        effect: (state) => {
            return "Their macaroni art belongs in a museum!";
        }
    },
    "Spaghetti Singularity": {
        description: "The pasta AI has become self-aware!",
        requirements: { ingredients: 3 },
        statModifiers: {
            chaos: 14,
            prestige: 15,
            workers: -3
        },
        effect: (state) => {
            return "It's redesigning the factory for maximum efficiency!";
        }
    },
    "Pasta Paradise": {
        description: "Transform the factory into a worker-friendly utopia.",
        requirements: { ingredients: 2 },
        statModifiers: {
            workers: 10,
            prestige: 6,
            chaos: -8,
            ingredients: -2
        },
        effect: (state) => {
            return "The factory now has a pasta fountain in the lobby!";
        }
    },
    "Pasta Festival": {
        description: "The annual city-wide pasta celebration brings crowds to the factory!",
        requirements: { ingredients: 2 },
        statModifiers: {
            prestige: 15,
            chaos: 8,
            workers: 5,
            ingredients: -2
        },
        effect: (state) => {
            return "The festival parade features a giant macaroni float!";
        }
    },
    "Noodle University": {
        description: "Open an on-site training facility for aspiring pasta artisans.",
        requirements: null,
        statModifiers: {
            workers: 7,
            prestige: 10,
            chaos: -5
        },
        effect: (state) => {
            return "Graduates receive degrees in Theoretical Pastamatics!";
        }
    },
    "Pastamancer": {
        description: "A mysterious figure offers to enchant your production line.",
        requirements: { ingredients: 1 },
        statModifiers: {
            ingredients: 4,
            chaos: 12,
            prestige: 8,
            workers: -2
        },
        effect: (state) => {
            return "The spaghetti now glows with arcane energy!";
        }
    },
    "Spaghetti Speed Dating": {
        description: "Host a Lady and the Tramp themed singles night.",
        requirements: null,
        statModifiers: {
            workers: 6,
            prestige: 4,
            chaos: 6
        },
        effect: (state) => {
            return "Love blooms over shared plates of linguine!";
        }
    },
    "Infinite Pasta Theorem": {
        description: "Mathematicians discover fractal patterns in your fusilli.",
        requirements: null,
        statModifiers: {
            prestige: 14,
            chaos: 4,
            workers: 2
        },
        effect: (state) => {
            return "The spiral pasta contains the secrets of the universe!";
        }
    },
    "Pasta Insurance": {
        description: "Update the factory's coverage against pasta-related incidents.",
        requirements: null,
        statModifiers: {
            chaos: -10,
            prestige: 5,
            workers: 3
        },
        effect: (state) => {
            return "Now covered for acts of Flying Spaghetti Monster!";
        }
    },
    "Noodle Diplomacy": {
        description: "Host international diplomats for a pasta summit.",
        requirements: { ingredients: 2 },
        statModifiers: {
            prestige: 16,
            workers: 4,
            chaos: -4,
            ingredients: -2
        },
        effect: (state) => {
            return "World peace achieved through perfect al dente!";
        }
    },
    "Pasta Pension Plan": {
        description: "Implement a retirement package paid in premium pasta.",
        requirements: null,
        statModifiers: {
            workers: 8,
            prestige: 6,
            chaos: -6
        },
        effect: (state) => {
            return "Workers celebrate their golden (pasta) years!";
        }
    },
    "Pasta Influencer": {
        description: "A online star wants to film their latest viral pasta challenge in your factory!",
        requirements: { ingredients: 1 },
        statModifiers: {
            prestige: 12,
            chaos: 8,
            workers: -2,
            ingredients: -1
        },
        effect: (state) => {
            return "The hashtag #NoodleFactoryChallenge is trending worldwide!";
        }
    },
    "Perfect Al Dente": {
        description: "Your timing is impeccable!",
        requirements: null,
        statModifiers: {
            prestige: 8,
            chaos: -5
        },
        effect: (state) => {
            state.playerStats.perfectCooks++;
            return "The pasta is cooked to absolute perfection!";
        }
    },
    "Lunar New Year Dragons": {
        description: "Chinese dragons made of noodles dance through the factory!",
        requirements: null,
        statModifiers: {
            prestige: 12,
            chaos: 8,
            workers: 4,
            ingredients: 2
        },
        effect: (state) => {
            return "The lucky dragons bring prosperity and fresh ingredients!";
        }
    },
    "Phở Master Visit": {
        description: "A Vietnamese noodle master shares ancient techniques.",
        requirements: { ingredients: 1 },
        statModifiers: {
            prestige: 10,
            workers: 3,
            ingredients: 1,
            chaos: -5
        },
        effect: (state) => {
            return "The art of Vietnamese noodle-making elevates your pasta!";
        }
    },
    "Reggie's Great Escape": {
        description: "Your boss strips down, walks into the pasta vat, and disappears...",
        requirements: null,
        statModifiers: {
            workers: -6,
            chaos: 15,
            prestige: -8
        },
        effect: (state) => {
            state.playerStats.chaosSteadyTurns = 0;
            state.playerStats.reggieEscaped = true;
            let bonus = "";
            // Risk/Reward: A dramatic escape under high chaos slightly penalizes prestige.
            if (state.playerStats.chaosLevel > 50) {
                bonus = " In the chaos, his escape is even more dramatic!";
                state.playerStats.pastaPrestige -= 2;
            }
            return "I didn't get where I am today by staying where I was!" + bonus;
        }
    },
    "Return of Reggie": {
        description: "Your boss returns, enlightened and bearing exotic ingredients!",
        requirements: null,
        statModifiers: {
            workers: 8,
            ingredients: 4,
            chaos: -10,
            prestige: 6
        },
        effect: (state) => {
            if (state.playerStats.reggieEscaped) {
                state.playerStats.reggieComplete = true; // This triggers the achievement check
            }
            return "Great to be back! Now, about these Himalayan noodle techniques...";
        }
    },
    "Little Chef": {
        description: "A surprisingly intelligent rat has been secretly improving recipes!",
        requirements: null,
        statModifiers: {
            prestige: 15,
            ingredients: 2,
            chaos: 8,
            workers: -2
        },
        effect: (state) => {
            return "The little rat's innovations are remarkable, but the health inspector must never know!";
        }
    },
    "Karen Invasion": {
        description: "An entitled customer demands to speak to ALL the managers!",
        requirements: null,
        statModifiers: {
            chaos: 12,
            workers: -4,
            prestige: -8
        },
        effect: (state) => {
            return "She's filming everything and threatening to post it on PastaTok!";
        }
    },

    // --- New Cards with Additional Variety and Risk/Reward Elements ---

    "Mystery Meatball": {
        description: "A mysterious meatball appears on the production line. Is it a blessing or a curse?",
        requirements: null,
        statModifiers: {
            ingredients: 2,
            prestige: 3,
            chaos: 2
        },
        effect: (state) => {
            if (Math.random() < 0.5) {
                return "The meatball boosts your ingredient quality and reputation!";
            } else {
                return "The meatball's mystery creates a small mess, stirring up extra chaos!";
            }
        }
    },
    "Saucy Negotiations": {
        description: "The head chef haggles with a supplier for premium tomato sauce.",
        requirements: { ingredients: 2 },
        statModifiers: {
            ingredients: -1,
            chaos: -5,
            prestige: 6
        },
        effect: (state) => {
            if (state.playerStats.ingredients >= 2) {
                return "The negotiations pay off—premium sauce is secured and chaos subsides.";
            } else {
                return "Without enough ingredients to bargain, the negotiations backfire!";
            }
        }
    },
    "Fettuccine Fiasco": {
        description: "A batch of fettuccine goes awry, triggering unexpected events in the kitchen.",
        requirements: null,
        statModifiers: {
            chaos: 4
        },
        effect: (state) => {
            const workerChange = Math.random() < 0.5 ? 4 : -4;
            state.playerStats.workerCount += workerChange;
            return workerChange > 0 
                ? "The fettuccine miracle adds extra hands on deck!" 
                : "The fettuccine fiasco leaves the team scrambling!";
        }
    },
    "Noodle Nirvana": {
        description: "A moment of sublime inspiration transforms the production line into a zen state.",
        requirements: null,
        statModifiers: {
            chaos: -10,
            workers: 5,
            prestige: 7
        },
        effect: (state) => {
            return "The factory enters a state of calm creativity—noodles flow like a peaceful river.";
        }
    },
    "Caffeine Infusion": {
        description: "A sudden burst of espresso energizes the team, fueling an unexpected productivity surge.",
        requirements: null,
        statModifiers: {
            workers: 8,
            chaos: -8
        },
        effect: (state) => {
            return "The caffeine kick revives the team—productivity and morale spike instantly!";
        }
    }
};

export function getRandomCard() {
    const cardNames = Object.keys(CARDS).filter(name => {
        // Special handling for Return of Reggie
        if (name === "Return of Reggie") {
            // Only include if Reggie has escaped
            return gameState?.playerStats?.reggieEscaped === true;
        }
        return true;
    });
    const randomIndex = Math.floor(Math.random() * cardNames.length);
    return cardNames[randomIndex];
}

// filepath: d:\NoodleFactory\src\js\state.js
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
        workerCount: Math.floor(Math.random() * 6) + 15  // 15-20 range for better starting balance
    };
};
