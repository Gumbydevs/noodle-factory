// This file defines the card system, including the creation and management of cards, their effects, and how they interact with the game state.

import { gameState } from './state.js';

const LOCAL_STORAGE_KEY = 'noodleFactoryPlayedCards';

export const CARDS = {
    "Sobbing Intern": {
        description: "An intern's tears might boost morale... or cause chaos.",
        requirements: null,
        statModifiers: {
            workers: 3,    // Increased from 2
            chaos: 5      // Reduced from 8
        },
        effect: (state) => {
            savePlayedCard("Sobbing Intern");
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
            savePlayedCard("Rotten Egg Surprise");
            return "Questionable ingredients acquired...";
        }
    },
    "Overtime Whistle": {
        description: "Push your workers harder for more prestige.",
        requirements: null,
        statModifiers: {
            prestige: 6,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Overtime Whistle");
            if (state.playerStats.workerCount > 20) {
                state.playerStats.pastaPrestige += 5;
                return "Workers exhausted but productive! Extra energy surges from a well-staffed factory!";
            }
            return "Workers exhausted but productive!";
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
            savePlayedCard("Noodle Slap");
            return "Order restored through pasta violence!";
        }
    },
    "Noodle Kraken": {
        description: "A massive tentacle made of pasta emerges from Vat 7!",
        requirements: null,
        statModifiers: {
            chaos: 12,
            prestige: 8,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Noodle Kraken");
            if (state.playerStats.chaosLevel < 30) {
                state.playerStats.pastaPrestige += 4;
                return "The Kraken bestows its noodly wisdom upon the factory!";
            } else {
                state.playerStats.lostWorkers += 4;
                return "The Kraken rampages through the factory, taking workers with it!";
            }
        }
    },
    "Vat Explosion": {
        description: "Vat 3 is building dangerous pressure levels!",
        requirements: { ingredients: 2 }, // Requires at least 2 ingredients
        statModifiers: {
            ingredients: -2,
            chaos: 15,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Vat Explosion");
            if (state.playerStats.chaosLevel > 70) {
                state.playerStats.lostWorkers += 2;
                state.playerStats.lostIngredients += 1;
                return "A vat exploded! Workers are panicking and ingredients are lost!";
            }
            return "There was an explosion in the vat! Chaos reigns!";
        }
    },
    "Pasta Prophet": {
        description: "A mystic appears, preaching the gospel of the Flying Spaghetti Monster.",
        requirements: null,
        statModifiers: {
            prestige: 12,
            chaos: 6,
            workers: 2
        },
        effect: (state) => {
            savePlayedCard("Pasta Prophet");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel < 40) {
                state.playerStats.prestige += 4;
                return "R'amen! The prophecy brings enlightenment!";
            }
            return "R'amen! The chaos corrupts the prophecy!";
        }
    },
    "Quantum Marinara": {
        description: "The sauce has achieved quantum superposition!",
        requirements: { ingredients: 1 }, // Requires at least 1 ingredient
        statModifiers: {
            ingredients: 3,
            chaos: 6,
            prestige: 8
        },
        effect: (state) => {
            savePlayedCard("Quantum Marinara");
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
            savePlayedCard("Ravioli Riot");
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
            savePlayedCard("Time-Traveling Tagliatelle");
            if (state.playerStats.ingredients > 5) {
                state.playerStats.pastaPrestige += 3;
                return "Time-traveling pasta is a hit!";
            }
            return "Time is a flat circle, and so is the pasta!";
        }
    },
    "Eldritch Al Dente": {
        description: "The pasta has achieved consciousness... and it hungers.",
        requirements: null,
        statModifiers: {
            chaos: 18,
            workers: -4,
            prestige: 15
        },
        effect: (state) => {
            savePlayedCard("Eldritch Al Dente");
            if (state.playerStats.chaosLevel < 40) {
                state.playerStats.pastaPrestige += 8;
                return "Ph'nglui mglw'nafh Spaghetti R'lyeh wgah'nagl fhtagn!";
            } else {
                state.playerStats.lostWorkers += 6;
                return "The pasta demands sacrifices!";
            }
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
            savePlayedCard("Noodle Necromancer");
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
            savePlayedCard("Pasta Fusion Reactor");
            if (state.playerStats.chaosLevel < 50) {
                state.playerStats.prestige += 10;
                return "The power of the atom spaghetti is yours to command!";
            } else {
                state.playerStats.lostWorkers += 8;
                return "The reactor goes critical! A catastrophic pasta meltdown!";
            }
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
            savePlayedCard("Workers Strike");
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
            savePlayedCard("Midnight Security");
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
            savePlayedCard("Unlocked Door");
            if (state.playerStats.workerEnergy > 25) {
                state.playerStats.chaos -= 5;
                return "Alert workers catch the problem early!";
            }
            state.playerStats.lostIngredients += 2;
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
            savePlayedCard("Lesser Of Two Weevils");
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
            savePlayedCard("Emergency Repairs");
            if (state.playerStats.chaosLevel < 50) {
                state.playerStats.chaos -= 4;
                return "The machine purrs like new... mostly.";
            }
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
            savePlayedCard("Factory Flood");
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
            savePlayedCard("Graffiti Artists");
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
            savePlayedCard("Machine Maintenance");
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
            savePlayedCard("Power Outage");
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
            savePlayedCard("Health Inspector");
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
            savePlayedCard("Earthquake");
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
            savePlayedCard("Exterminator Visit");
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
            savePlayedCard("Ravioli, Ravioli, Ravioli");
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
            savePlayedCard("Machine Overflow");
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
            savePlayedCard("Employee Appreciation Day");
            return "Happy workers make better pasta!";
        }
    },
    "Pasta Training Seminar": {
        description: "Send workers to learn advanced pasta-making techniques.",
        requirements: null,
        statModifiers: {
            workers: 4,     // Increased from 3
            prestige: 6,    // Increased from 4
            chaos: -3       // Improved from -2
        },
        effect: (state) => {
            savePlayedCard("Pasta Training Seminar");
            return "The workers return as pasta artisans!";
        }
    },
    "Recruitment Fair": {
        description: "Host a job fair with free pasta samples.",
        requirements: { ingredients: 1 },
        statModifiers: {
            workers: 4,      // Reduced from 8
            ingredients: -1,
            chaos: 5        // Increased from 3
        },
        effect: (state) => {
            savePlayedCard("Recruitment Fair");
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
            savePlayedCard("Pasta Ghost");
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
            savePlayedCard("Motivational Lasagna");
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
            savePlayedCard("Pasta Prodigy");
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
            savePlayedCard("Spaghetti Singularity");
            return "It's redesigning the factory for maximum efficiency!";
        }
    },
    "Pasta Paradise": {
        description: "Transform the factory into a worker-friendly utopia.",
        requirements: { ingredients: 1 }, // Reduced from 2
        statModifiers: {
            workers: 5,
            prestige: 8,    // Increased from 4
            chaos: -6,      // Improved from -4
            ingredients: -1  // Reduced cost from -2
        },
        effect: (state) => {
            savePlayedCard("Pasta Paradise");
            return "The factory is now a pasta paradise!";
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
            savePlayedCard("Pasta Festival");
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
            savePlayedCard("Noodle University");
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
            savePlayedCard("Pastamancer");
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
            savePlayedCard("Spaghetti Speed Dating");
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
            savePlayedCard("Infinite Pasta Theorem");
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
            savePlayedCard("Pasta Insurance");
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
            savePlayedCard("Noodle Diplomacy");
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
            savePlayedCard("Pasta Pension Plan");
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
            savePlayedCard("Pasta Influencer");
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
            savePlayedCard("Perfect Al Dente");
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
            savePlayedCard("Lunar New Year Dragons");
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
            savePlayedCard("Phở Master Visit");
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
            savePlayedCard("Reggie's Great Escape");
            state.playerStats.chaosSteadyTurns = 0;
            state.playerStats.reggieEscaped = true;
            let bonus = "";
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
            savePlayedCard("Return of Reggie");
            if (state.playerStats.reggieEscaped) {
                state.playerStats.reggieComplete = true;
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
            savePlayedCard("Little Chef");
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
            savePlayedCard("Karen Invasion");
            return "She's filming everything and threatening to post it on PastaTok!";
        }
    },
    "Mystery Meatball": {
        description: "A mysterious meatball appears on the production line. Is it a blessing or a curse?",
        requirements: null,
        statModifiers: {
            ingredients: 2,
            prestige: 3,
            chaos: 2
        },
        effect: (state) => {
            savePlayedCard("Mystery Meatball");
            if (state.playerStats.chaosLevel < 35) {
                state.playerStats.ingredients += 2;
                return "The meatball boosts your ingredient quality and reputation!";
            }
            state.playerStats.chaos += 4;
            return "The meatball's mystery creates a small mess, stirring up extra chaos!";
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
            savePlayedCard("Saucy Negotiations");
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
            savePlayedCard("Fettuccine Fiasco");
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
            savePlayedCard("Noodle Nirvana");
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
            savePlayedCard("Caffeine Infusion");
            return "The caffeine kick revives the team—productivity and morale spike instantly!";
        }
    },
    "Supply Chain Mastery": {
        description: "Optimize your ingredient delivery network.",
        requirements: null,
        statModifiers: {
            ingredients: 3,
            prestige: 4,
            chaos: -2
        },
        effect: (state) => {
            savePlayedCard("Supply Chain Mastery");
            return "Your ingredient supplies are flowing smoothly!";
        }
    },
    "Worker Wellness Program": {
        description: "Implement healthy pasta breaks and ergonomic stations.",
        requirements: null,
        statModifiers: {
            workers: 4,
            chaos: -4,
            prestige: 3
        },
        effect: (state) => {
            savePlayedCard("Worker Wellness Program");
            return "Happy workers make better pasta!";
        }
    },
    "Quality Control Initiative": {
        description: "Implement strict pasta quality standards.",
        requirements: { ingredients: 1 },
        statModifiers: {
            prestige: 8,
            chaos: -3,
            workers: -1
        },
        effect: (state) => {
            savePlayedCard("Quality Control Initiative");
            return "Your pasta quality reaches new heights!";
        }
    },
    "Pasta Innovation Lab": {
        description: "Set up a research facility for new pasta shapes.",
        requirements: { ingredients: 2 },
        statModifiers: {
            prestige: 10,
            chaos: 4,
            ingredients: -1
        },
        effect: (state) => {
            savePlayedCard("Pasta Innovation Lab");
            return "Revolutionary pasta designs emerge!";
        }
    },
    "Emergency Ingredient Run": {
        description: "Send workers on a quick supply run.",
        requirements: null,
        statModifiers: {
            ingredients: 4,
            workers: -1,
            chaos: 2
        },
        effect: (state) => {
            savePlayedCard("Emergency Ingredient Run");
            return "Fresh supplies acquired just in time!";
        }
    },
    "Pasta Mentorship": {
        description: "Experienced workers train newcomers in pasta arts.",
        requirements: null,
        statModifiers: {
            workers: 3,
            prestige: 4,
            chaos: -2
        },
        effect: (state) => {
            savePlayedCard("Pasta Mentorship");
            return "Knowledge passes to the next generation!";
        }
    }
};

// Add these variables at the top level, after the CARDS object
let lastDrawnCards = [];

function getPlayedCards() {
    const played = localStorage.getItem(LOCAL_STORAGE_KEY);
    return played ? JSON.parse(played) : {};
}

function savePlayedCard(cardName) {
    const played = JSON.parse(localStorage.getItem('noodleFactoryPlayedCards') || '{}');
    played[cardName] = true;
    localStorage.setItem('noodleFactoryPlayedCards', JSON.stringify(played));
    checkCardAchievements(); // Make sure this is called after saving
}

function checkCardAchievements() {
    const played = getPlayedCards();
    // Don't check if no cards have been played
    if (Object.keys(played).length === 0) return;
    
    const totalCards = Object.keys(CARDS).length;
    const playedCount = Object.keys(played).length;
    const percentage = (playedCount / totalCards) * 100;
    console.log(`Cards played: ${playedCount}/${totalCards} (${percentage.toFixed(1)}%)`);
}

function applyStatModifiers(state, modifiers) {
    // Ensure chaos doesn't drop too low
    if (modifiers.chaos && modifiers.chaos < 0) {
        const minChaos = 5;
        if (state.playerStats.chaosLevel + modifiers.chaos < minChaos) {
            modifiers.chaos = minChaos - state.playerStats.chaosLevel;
        }
    }

    // Scale down large stat changes
    Object.keys(modifiers).forEach(stat => {
        if (Math.abs(modifiers[stat]) > 10) {
            modifiers[stat] = Math.sign(modifiers[stat]) * 10;
        }
    });

    return modifiers;
}

function createSmokeEffect(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Create more particles for a denser effect
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'smoke-particle';
        
        // Randomize initial positions within the card
        const randomOffsetX = (Math.random() - 0.5) * rect.width * 0.8;
        const randomOffsetY = (Math.random() - 0.5) * rect.height * 0.8;
        
        particle.style.left = `${centerX + randomOffsetX}px`;
        particle.style.top = `${centerY + randomOffsetY}px`;
        
        // Randomize particle movement
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - 50;
        
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        
        document.body.appendChild(particle);
        
        // Stagger the animations slightly
        requestAnimationFrame(() => {
            particle.style.animation = `smoke 0.8s ease-out forwards`;
        });
        
        // Clean up particles
        setTimeout(() => particle.remove(), 800);
    }
}

export function getRandomCard() {
    const selectedCard = document.querySelector('.card[data-selected="true"]');
    if (selectedCard) {
        // First add the disappearing class to stop other animations
        selectedCard.classList.add('disappearing');
        
        // Create smoke effect
        createSmokeEffect(selectedCard);
        
        // Wait a very short moment for the class to take effect
        requestAnimationFrame(() => {
            selectedCard.style.opacity = '0';
            selectedCard.style.transform = 'scale(0.5) translateY(-20px)';
        });

        // Wait for smoke and disappear animation before continuing
        return new Promise(resolve => {
            setTimeout(() => {
                // Continue with card selection
                const cardNames = Object.keys(CARDS).filter(name => {
                    // Filter out the last two drawn cards
                    if (lastDrawnCards.includes(name)) {
                        return false;
                    }
                    // Special handling for Return of Reggie
                    if (name === "Return of Reggie") {
                        // Only include if Reggie has escaped
                        return gameState?.playerStats?.reggieEscaped === true;
                    }
                    return true;
                });
                resolve(cardNames[Math.floor(Math.random() * cardNames.length)]);
            }, 400);
        });
    }

    // If no selected card, proceed normally
    const cardNames = Object.keys(CARDS).filter(name => {
        // Filter out the last two drawn cards
        if (lastDrawnCards.includes(name)) {
            return false;
        }
        // Special handling for Return of Reggie
        if (name === "Return of Reggie") {
            // Only include if Reggie has escaped
            return gameState?.playerStats?.reggieEscaped === true;
        }
        return true;
    });
    return cardNames[Math.floor(Math.random() * cardNames.length)];
}

// filepath: d:\NoodleFactory\src\js\state.js
export const resetGameState = () => {
    gameState.playerStats = {
        chaosLevel: 0,
        pastaPrestige: 0,
        ingredients: [
            "Water",
            "Salt",
            "Egg",
            "Basic Flour"
        ],
        workerCount: Math.floor(Math.random() * 6) + 15  // 15-20 range for better starting balance
    };
};
