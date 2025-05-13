// This file defines the card system, including the creation and management of cards, their effects, and how they interact with the game state.

import { gameState } from './state.js';

const LOCAL_STORAGE_KEY = 'noodleFactoryPlayedCards';

export const CARDS = {
    "Alphabet Pasta Anomaly": {
        description: "The alphabet pasta starts spelling out ominous messages.",
        requirements: null,
        statModifiers: {
            chaos: 11,
            prestige: 4,
            workers: -5
        },
        effect: (state) => {
            savePlayedCard("Alphabet Pasta Anomaly");
            if (state.playerStats.chaosLevel < 45) {
                state.playerStats.pastaPrestige += 9;
                return "Customers line up to receive personalized pasta prophecies!";
            }
            state.playerStats.lostWorkers += 4;
            return "Workers flee as bowls of pasta spell out 'YOUR DOOM IS AL DENTE'!";
        }
    },
    "Cannelloni Cult": {
        description: "A group of pasta devotees establishes a commune near your factory.",
        requirements: null,
        statModifiers: {
            chaos: 16,
            prestige: 5,
            workers: 4
        },
        effect: (state) => {
            savePlayedCard("Cannelloni Cult");
            if (state.playerStats.chaosLevel > 60) {
                state.playerStats.lostWorkers += 2;
                return "Workers join the cult, donning pasta strainer hats and chanting sauce recipes!";
            }
            return "The cultists' pasta meditation sessions become a tourist attraction!";
        }
    },
    "Carbonara Calamity": {
        description: "The cheese and egg sauce separator malfunctions spectacularly.",
        requirements: { ingredients: 2 },
        statModifiers: {
            ingredients: -2,
            chaos: 17,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Carbonara Calamity");
            if (state.playerStats.workerCount > 18) {
                state.playerStats.chaos -= 6;
                return "Quick-thinking workers contain the creamy explosion!";
            }
            state.playerStats.lostIngredients += 3;
            return "Egg and cheese coat every surface of the factory in a sticky film!";
        }
    },
    "Celebrity Chef Visit": {
        description: "A famous TV chef wants to feature your factory on their show.",
        requirements: { ingredients: 2 },
        statModifiers: {
            prestige: 18,
            chaos: 8,
            ingredients: -2
        },
        effect: (state) => {
            savePlayedCard("Celebrity Chef Visit");
            if (state.playerStats.chaosLevel > 60) {
                state.playerStats.prestige -= 5;
                return "The chef is horrified by your methods and leaves early!";
            }
            return "Your pasta factory becomes the star of 'Extreme Noodle Makeover'!";
        }
    },
    "Sobbing Intern": {
        description: "An intern's tears might boost morale... or cause chaos.",
        requirements: null,
        statModifiers: {
            workers: 3,
            chaos: 5
        },
        effect: (state) => {
            savePlayedCard("Sobbing Intern");
            return "Intern's tears somehow boost worker morale!";
        }
    },
    "Rotten Egg Surprise": {
        description: "Add questionable ingredients to your noodles.",
        requirements: null,
        statModifiers: {
            ingredients: 5,
            chaos: 8
        },
        effect: (state) => {
            savePlayedCard("Rotten Egg Surprise");
            return "Questionable ingredients acquired...";
        }
    },
    "Overtime Whistle": {
        description: "Push your workers for longer hours and longer noodles.",
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
        requirements: null,
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
        requirements: { ingredients: 2 },
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
    "Ziti Zodiac": {
        description: "Workers arrange pasta to predict the future based on ancient methods.",
        requirements: null,
        statModifiers: {
            chaos: 9,
            prestige: 6,
            workers: 2
        },
        effect: (state) => {
            savePlayedCard("Ziti Zodiac");
            if (state.playerStats.chaosLevel < 40) {
                state.playerStats.pastaPrestige += 4;
                state.playerStats.money += Math.random() * 500; // Random money bonus
                return "The pasta patterns reveal profitable business opportunities!";
            }
            return "Workers waste hours trying to decode noodle arrangements!";
        }
    },
    "Pasta Patent War": {
        description: "A rival company claims they invented your signature noodle shape.",
        requirements: null,
        statModifiers: {
            chaos: 9,
            prestige: -7,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Pasta Patent War");
            if (state.playerStats.prestige > 40) {
                state.playerStats.pastaPrestige += 8;
                return "You win the legal battle, securing your pasta innovation legacy!";
            }
            return "Legal fees pile up as the court case drags on!";
        }
    },
    "Pasta Pillow Fight": {
        description: "Workers stuff pillows with uncooked pasta for an epic battle.",
        requirements: { ingredients: 1 },
        statModifiers: {
            ingredients: -1,
            workers: 6,
            chaos: 14
        },
        effect: (state) => {
            savePlayedCard("Pasta Pillow Fight");
            if (state.playerStats.chaosLevel > 65) {
                state.playerStats.lostWorkers += 3;
                return "The crunchy combat turns painful as pasta shrapnel flies everywhere!";
            }
            return "The bizarre team-building exercise somehow boosts morale!";
        }
    },
    "Noodle Network Outage": {
        description: "The factory's pasta tracking system goes offline.",
        requirements: null,
        statModifiers: {
            chaos: 14,
            prestige: -3,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Noodle Network Outage");
            if (state.playerStats.workerCount > 20) {
                state.playerStats.chaos -= 5;
                return "Experienced workers implement an efficient paper-based system!";
            }
            state.playerStats.lostIngredients += 2;
            return "No one knows where the linguine shipment went!";
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
        requirements: { ingredients: 1 },
        statModifiers: {
            ingredients: 8,
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
        requirements: null,
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
        requirements: null,
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
        requirements: null,
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
            // Set the flag in both the passed state and the global state
            state.playerStats.chosenLesserWeevil = true;
            if (gameState && gameState.playerStats) {
                gameState.playerStats.chosenLesserWeevil = true;
            }
            return "Extra protein in the pasta tonight...";
        }
    },
    "Emergency Repairs": {
        description: "The ancient pasta extruder needs fixing.",
        type: "action",
        requirements: {
            ingredients: 2,
            workers: 4
        },
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
            workers: 4,
            prestige: 6,
            chaos: -3
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
            workers: 4,
            ingredients: -1,
            chaos: 5
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
        requirements: { ingredients: 1 },
        statModifiers: {
            workers: 5,
            prestige: 8,
            chaos: -6,
            ingredients: -1
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
    },
    "Pasta Personality Test": {
        description: "A psychologist analyzes workers based on their pasta preference.",
        requirements: null,
        statModifiers: {
            workers: 6,
            chaos: -7,
            prestige: 3
        },
        effect: (state) => {
            savePlayedCard("Pasta Personality Test");
            return "Teams are reorganized based on spaghetti or linguine preference!";
        }
    },
    "Experimental Flour Blend": {
        description: "A mysterious supplier offers an untested flour mixture.",
        requirements: null,
        statModifiers: {
            ingredients: 4,
            chaos: 6,
            prestige: 5
        },
        effect: (state) => {
            savePlayedCard("Experimental Flour Blend");
            if (state.playerStats.chaosLevel < 40) {
                state.playerStats.pastaPrestige += 3;
                return "The new flour creates noodles with extraordinary texture!";
            }
            state.playerStats.chaos += 4;
            return "The flour reacts violently with the chaotic factory environment!";
        }
    },
    "Lasagna Labyrinth": {
        description: "The layered pasta has folded into an impossible maze.",
        requirements: null,
        statModifiers: {
            chaos: 12,
            prestige: 10,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Lasagna Labyrinth");
            if (state.playerStats.chaosLevel > 45) {
                state.playerStats.lostWorkers += 3;
                return "Workers get lost in the twisting pasta corridors!";
            }
            state.playerStats.pastaPrestige += 4;
            return "Tourists pay to navigate the legendary pasta maze!";
        }
    },
    "Orecchiette Oracle": {
        description: "The ear-shaped pasta whispers secrets from beyond.",
        requirements: null,
        statModifiers: {
            chaos: 9,
            prestige: 7,
            workers: 3
        },
        effect: (state) => {
            savePlayedCard("Orecchiette Oracle");
            state.playerStats.usedMagicCards = true;
            return "Workers take turns listening to the pasta's cryptic business advice!";
        }
    },
    "Garganelli Gambit": {
        description: "Take a risk with an experimental pasta rolling technique.",
        requirements: { ingredients: 2 },
        statModifiers: {
            ingredients: -2,
            chaos: 8,
            prestige: 12
        },
        effect: (state) => {
            savePlayedCard("Garganelli Gambit");
            if (Math.random() > 0.5) {
                state.playerStats.pastaPrestige += 6;
                return "The gambit pays off! Your uniquely rolled pasta becomes a sensation!";
            }
            state.playerStats.chaos += 5;
            return "The experimental technique backfires, creating mutant pasta rolls!";
        }
    },
    "Campanelle Chorus": {
        description: "The bell-shaped pasta rings in perfect harmony.",
        requirements: null,
        statModifiers: {
            chaos: -6,
            prestige: 9,
            workers: 5
        },
        effect: (state) => {
            savePlayedCard("Campanelle Chorus");
            return "The melodious pasta bells attract music lovers from around the city!";
        }
    },
    "Strozzapreti Strangler": {
        description: "The 'priest-strangler' pasta is living up to its name!",
        requirements: null,
        statModifiers: {
            chaos: 15,
            workers: -4,
            prestige: -2
        },
        effect: (state) => {
            savePlayedCard("Strozzapreti Strangler");
            if (state.playerStats.chaosLevel < 50) {
                state.playerStats.prestige += 8;
                return "The aggressive pasta is tamed into a viral marketing campaign!";
            }
            state.playerStats.lostWorkers += 2;
            return "Workers flee as animated pasta twists through the air, seeking necks!";
        }
    },
    "Gemelli Twins": {
        description: "Two identical workers appear out of nowhere, claiming they've always worked here.",
        requirements: null,
        statModifiers: {
            workers: 6,
            chaos: 7,
            prestige: 3
        },
        effect: (state) => {
            savePlayedCard("Gemelli Twins");
            state.playerStats.usedMagicCards = true;
            return "No one questions the twins' sudden appearance, they make excellent pasta!";
        }
    },
    "Ditalini Dimension": {
        description: "The tiny tube pasta opens a portal to a microscopic realm.",
        requirements: null,
        statModifiers: {
            chaos: 11,
            ingredients: 4,
            prestige: 8
        },
        effect: (state) => {
            savePlayedCard("Ditalini Dimension");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel > 55) {
                state.playerStats.chaos += 4;
                return "Tiny beings emerge from the portal and cause miniature mayhem!";
            }
            return "Scientists pay top dollar to study the pasta-based dimensional gateway!";
        }
    },
    "Capellini Catastrophe": {
        description: "The angel hair pasta has become impossibly tangled.",
        requirements: null,
        statModifiers: {
            chaos: 13,
            workers: -3,
            prestige: -4
        },
        effect: (state) => {
            savePlayedCard("Capellini Catastrophe");
            if (state.playerStats.workerCount > 20) {
                state.playerStats.pastaPrestige += 5;
                return "Creative workers turn the pasta tangle into an art installation!";
            }
            state.playerStats.lostWorkers += 1;
            return "A worker becomes hopelessly entangled in the pasta web!";
        }
    },
    "Stelline Stargazing": {
        description: "The tiny star-shaped pasta begins to twinkle in the dark.",
        requirements: null,
        statModifiers: {
            prestige: 10,
            chaos: 4,
            ingredients: 2
        },
        effect: (state) => {
            savePlayedCard("Stelline Stargazing");
            state.playerStats.usedMagicCards = true;
            return "Astronomers visit to map the pasta constellations!";
        }
    },
    "Trofie Tempest": {
        description: "The twisted pasta generates a localized storm in Aisle 3.",
        requirements: null,
        statModifiers: {
            chaos: 14,
            workers: -2,
            ingredients: 3
        },
        effect: (state) => {
            savePlayedCard("Trofie Tempest");
            if (state.playerStats.chaosLevel < 40) {
                state.playerStats.ingredients += 2;
                return "The pasta storm mysteriously creates new ingredient combinations!";
            }
            state.playerStats.lostIngredients += 1;
            return "Lightning bolts from the pasta storm zap the ingredient shelves!";
        }
    },
    "Radiatori Revolution": {
        description: "The radiator-shaped pasta is generating heat and discontent.",
        requirements: null,
        statModifiers: {
            chaos: 10,
            prestige: 5,
            workers: -5
        },
        effect: (state) => {
            savePlayedCard("Radiatori Revolution");
            if (state.playerStats.workerCount > 25) {
                state.playerStats.chaos -= 4;
                return "Workers channel the pasta's revolutionary energy into productivity!";
            }
            state.playerStats.lostWorkers += 2;
            return "Workers form a union and demand better pasta conditions!";
        }
    },
    "Fregola Forecast": {
        description: "The round Sardinian pasta predicts tomorrow's market trends.",
        requirements: null,
        statModifiers: {
            prestige: 11,
            chaos: -3,
            ingredients: 2
        },
        effect: (state) => {
            savePlayedCard("Fregola Forecast");
            state.playerStats.usedMagicCards = true;
            return "Investors flock to consult the prophetic pasta beads!";
        }
    },
    "Casarecce Conspiracy": {
        description: "The twisted pasta is plotting something in secret.",
        requirements: null,
        statModifiers: {
            chaos: 8,
            prestige: 4,
            workers: 3
        },
        effect: (state) => {
            savePlayedCard("Casarecce Conspiracy");
            if (state.playerStats.chaosLevel > 50) {
                state.playerStats.chaos += 5;
                return "The pasta conspiracy succeeds! Factory hierarchy is in disarray!";
            }
            return "Workers uncover and thwart the pasta's mysterious plans!";
        }
    },
    "Pizzoccheri Poltergeist": {
        description: "The buckwheat pasta strips are moving objects around the factory.",
        requirements: null,
        statModifiers: {
            chaos: 12,
            prestige: 7,
            workers: -4
        },
        effect: (state) => {
            savePlayedCard("Pizzoccheri Poltergeist");
            if (state.playerStats.chaosLevel < 45) {
                state.playerStats.prestige += 5;
                return "The helpful pasta ghost improves factory efficiency!";
            }
            state.playerStats.lostWorkers += 1;
            return "The malevolent pasta spirit terrorizes workers with flying cutlery!";
        }
    },
    "Bavette Blues": {
        description: "The narrow pasta strips play melancholy music when boiled.",
        requirements: { ingredients: 1 },
        statModifiers: {
            ingredients: -1,
            prestige: 13,
            chaos: 5
        },
        effect: (state) => {
            savePlayedCard("Bavette Blues");
            state.playerStats.usedMagicCards = true;
            return "Restaurants pay premium prices for the musical pasta experience!";
        }
    },
    "Sedanini Supernova": {
        description: "The smooth tube pasta is emitting intense energy waves!",
        requirements: null,
        statModifiers: {
            chaos: 16,
            prestige: 11,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Sedanini Supernova");
            if (state.playerStats.chaosLevel > 55) {
                state.playerStats.lostWorkers += 2;
                return "Workers shield their eyes as pasta tubes emit blinding light!";
            }
            state.playerStats.pastaPrestige += 4;
            return "The glowing pasta attracts curious scientists and tourists!";
        }
    },
    "Anellini Anomaly": {
        description: "The tiny pasta rings are defying gravity!",
        requirements: null,
        statModifiers: {
            chaos: 9,
            prestige: 8,
            ingredients: 3
        },
        effect: (state) => {
            savePlayedCard("Anellini Anomaly");
            state.playerStats.usedMagicCards = true;
            return "Floating pasta rings form mesmerizing patterns in midair!";
        }
    },
    "Bigoli Black Hole": {
        description: "The thick spaghetti is creating a pasta-based gravitational singularity.",
        requirements: null,
        statModifiers: {
            chaos: 18,
            prestige: 6,
            workers: -5,
            ingredients: 4
        },
        effect: (state) => {
            savePlayedCard("Bigoli Black Hole");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel > 60) {
                state.playerStats.lostWorkers += 3;
                return "Workers are pulled into the swirling vortex of pasta gravity!";
            }
            return "The pasta singularity has become a tourist attraction!";
        }
    },
    "Capunti Captain": {
        description: "A leader emerges from the ranks of open-centered pasta shells.",
        requirements: null,
        statModifiers: {
            workers: 8,
            chaos: -6,
            prestige: 7
        },
        effect: (state) => {
            savePlayedCard("Capunti Captain");
            return "The pasta commander organizes the workforce with military precision!";
        }
    },
    "Cavatelli Conjurer": {
        description: "A mysterious figure performs magic tricks with small pasta shells.",
        requirements: null,
        statModifiers: {
            prestige: 12,
            chaos: 7,
            workers: 4
        },
        effect: (state) => {
            savePlayedCard("Cavatelli Conjurer");
            state.playerStats.usedMagicCards = true;
            return "Pasta disappears and reappears in impossible locations!";
        }
    },
    "Cascatelli Crisis": {
        description: "The newly invented pasta shape is causing dimensional instability.",
        requirements: null,
        statModifiers: {
            chaos: 14,
            prestige: 13,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Cascatelli Crisis");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel < 45) {
                state.playerStats.pastaPrestige += 5;
                return "The revolutionary pasta design breaks the internet and brings fame!";
            }
            state.playerStats.chaos += 5;
            return "Reality warps around the impossible pasta geometry!";
        }
    },
    "Mafaldine Maelstrom": {
        description: "The ribbon pasta with ruffled edges stirs up a pasta vortex.",
        requirements: null,
        statModifiers: {
            chaos: 12,
            ingredients: 5,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Mafaldine Maelstrom");
            if (state.playerStats.chaosLevel > 50) {
                state.playerStats.lostWorkers += 1;
                return "The pasta whirlpool grows stronger, pulling in nearby objects!";
            }
            state.playerStats.ingredients += 2;
            return "The swirling pasta currents draw in exotic new ingredients!";
        }
    },
    "Paccheri Prophecy": {
        description: "The large tube pasta reveals visions of the factory's future.",
        requirements: null,
        statModifiers: {
            prestige: 9,
            chaos: 6,
            workers: 3
        },
        effect: (state) => {
            savePlayedCard("Paccheri Prophecy");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel < 35) {
                state.playerStats.prestige += 4;
                return "The pasta tubes show visions of great prosperity and success!";
            }
            state.playerStats.chaos += 3;
            return "The pasta prophecies show disturbing scenes of noodly doom!";
        }
    },
    "Pici Poltergeist": {
        description: "The hand-rolled thick spaghetti has developed supernatural abilities.",
        requirements: null,
        statModifiers: {
            chaos: 11,
            prestige: 7,
            workers: -4
        },
        effect: (state) => {
            savePlayedCard("Pici Poltergeist");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel < 40) {
                state.playerStats.workerCount += 2;
                return "The helpful pasta spirit assists with mundane tasks!";
            }
            state.playerStats.lostWorkers += 2;
            return "Workers flee as possessed pasta chases them through the factory!";
        }
    },
    "Garlic Bread Uprising": {
        description: "The pasta side dish is staging a revolt!",
        requirements: null,
        statModifiers: {
            chaos: 15,
            prestige: -4,
            workers: -3,
            ingredients: 2
        },
        effect: (state) => {
            savePlayedCard("Garlic Bread Uprising");
            if (state.playerStats.chaosLevel > 55) {
                state.playerStats.lostWorkers += 1;
                return "Garlic bread barricades block access to important equipment!";
            }
            state.playerStats.ingredients += 3;
            return "The rebellious bread is subdued and repurposed into delicious ingredients!";
        }
    },
    "Cannellini Conspiracy": {
        description: "The white beans used in pasta dishes are communicating in code.",
        requirements: null,
        statModifiers: {
            chaos: 8,
            prestige: 5,
            ingredients: 3
        },
        effect: (state) => {
            savePlayedCard("Cannellini Conspiracy");
            state.playerStats.usedMagicCards = true;
            return "Government agents arrive to study the bean-based encryption system!";
        }
    },
    "Vodka Sauce Volatility": {
        description: "The creamy tomato sauce has developed unexpected properties.",
        requirements: { ingredients: 1 },
        statModifiers: {
            ingredients: -1,
            chaos: 10,
            prestige: 9
        },
        effect: (state) => {
            savePlayedCard("Vodka Sauce Volatility");
            if (state.playerStats.chaosLevel > 45) {
                state.playerStats.chaos += 4;
                return "The sauce ignites, creating spectacular but dangerous flame shows!";
            }
            state.playerStats.pastaPrestige += 3;
            return "The enhanced sauce creates an unforgettable culinary experience!";
        }
    },
    "Mascarpone Miracle": {
        description: "The cream cheese used in pasta desserts has healing properties.",
        requirements: null,
        statModifiers: {
            workers: 7,
            chaos: -5,
            prestige: 6
        },
        effect: (state) => {
            savePlayedCard("Mascarpone Miracle");
            state.playerStats.usedMagicCards = true;
            return "Workers recover from fatigue after tasting the miraculous cheese!";
        }
    },
    "Truffle Trouble": {
        description: "Expensive mushrooms cause unexpected reactions in the sauce vat.",
        requirements: { ingredients: 2 },
        statModifiers: {
            ingredients: -2,
            prestige: 14,
            chaos: 9
        },
        effect: (state) => {
            savePlayedCard("Truffle Trouble");
            if (state.playerStats.chaosLevel < 40) {
                state.playerStats.pastaPrestige += 7;
                return "The unique fungal compounds create an unparalleled flavor experience!";
            }
            state.playerStats.chaos += 4;
            return "Workers report hallucinating pasta shapes that shouldn't exist!";
        }
    },
    "Carnevale di Pasta": {
        description: "Workers organize a venetian-style pasta mask festival.",
        requirements: null,
        statModifiers: {
            workers: 8,
            prestige: 11,
            chaos: 7
        },
        effect: (state) => {
            savePlayedCard("Carnevale di Pasta");
            return "The elaborate pasta masks win international design awards!";
        }
    },
    "Olive Oil Incident": {
        description: "A barrel of premium olive oil has spilled across the factory floor.",
        requirements: null,
        statModifiers: {
            chaos: 13,
            workers: -5,
            ingredients: -2
        },
        effect: (state) => {
            savePlayedCard("Olive Oil Incident");
            if (state.playerStats.workerCount > 15) {
                state.playerStats.chaos -= 4;
                return "Quick-thinking workers contain the oil with pasta dams!";
            }
            state.playerStats.lostWorkers += 2;
            return "Workers slip and slide across the factory in an olive oil slip-n-slide!";
        }
    },
    "Tortelloni Tornado Warning": {
        description: "Meteorologists detect a vortex of large stuffed pasta forming above the factory.",
        requirements: null,
        statModifiers: {
            chaos: 10,
            prestige: 8,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Tortelloni Tornado Warning");
            if (state.playerStats.chaosLevel > 50) {
                state.playerStats.lostWorkers += 2;
                return "The pasta cyclone touches down, flinging workers across the factory floor!";
            }
            state.playerStats.pastaPrestige += 5;
            return "The swirling pasta spectacle attracts curious weather reporters!";
        }
    },
    "Fusilli Fractal": {
        description: "The spiral pasta has begun forming impossible geometric patterns.",
        requirements: null,
        statModifiers: {
            chaos: 7,
            prestige: 11,
            ingredients: 2
        },
        effect: (state) => {
            savePlayedCard("Fusilli Fractal");
            state.playerStats.usedMagicCards = true;
            return "Mathematicians travel from around the world to study the self-replicating pasta spirals!";
        }
    },
    "Tagliolini Time Slip": {
        description: "Workers report experiencing time dilation near the ribbon pasta station.",
        requirements: null,
        statModifiers: {
            chaos: 13,
            workers: 5,
            prestige: 7
        },
        effect: (state) => {
            savePlayedCard("Tagliolini Time Slip");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel > 45) {
                state.playerStats.chaos += 4;
                return "Workers return from lunch breaks before they've left, causing scheduling chaos!";
            }
            return "The temporal anomaly allows workers to complete eight hours of work in just minutes!";
        }
    },
    "Bucatini Brass Band": {
        description: "The hollow pasta strands vibrate to create surprisingly harmonious music.",
        requirements: null,
        statModifiers: {
            prestige: 9,
            chaos: 5,
            workers: 4
        },
        effect: (state) => {
            savePlayedCard("Bucatini Brass Band");
            return "The pasta orchestra's performances become a popular lunchtime attraction!";
        }
    },
    "Conchiglie Communication": {
        description: "The shell-shaped pasta can somehow transmit sounds from across the factory.",
        requirements: null,
        statModifiers: {
            chaos: 6,
            prestige: 5,
            workers: 3
        },
        effect: (state) => {
            savePlayedCard("Conchiglie Communication");
            state.playerStats.usedMagicCards = true;
            return "Workers create a pasta-based intercom system throughout the building!";
        }
    },
    "Gorgonzola Galaxy": {
        description: "The blue cheese used in pasta sauces forms cosmic patterns.",
        requirements: { ingredients: 1 },
        statModifiers: {
            ingredients: -1,
            prestige: 12,
            chaos: 8
        },
        effect: (state) => {
            savePlayedCard("Gorgonzola Galaxy");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel < 40) {
                state.playerStats.pastaPrestige += 6;
                return "The celestial cheese formations are featured in astronomy magazines!";
            }
            state.playerStats.chaos += 3;
            return "Workers report seeing alien lifeforms in the swirling blue cheese vortex!";
        }
    },
    "Farfalle Flight": {
        description: "The bow-tie pasta has developed the ability to glide through the air.",
        requirements: null,
        statModifiers: {
            chaos: 9,
            prestige: 7,
            ingredients: 3
        },
        effect: (state) => {
            savePlayedCard("Farfalle Flight");
            state.playerStats.usedMagicCards = true;
            return "The flying pasta delivers seasoning to hard-to-reach places in the factory!";
        }
    },
    "Acini di Pepe Avalanche": {
        description: "The tiny grain-shaped pasta has overflowed from its container!",
        requirements: { ingredients: 2 },
        statModifiers: {
            ingredients: -2,
            chaos: 14,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Acini di Pepe Avalanche");
            if (state.playerStats.workerCount > 18) {
                state.playerStats.chaos -= 5;
                return "Quick-thinking workers redirect the pasta flood into emergency containers!";
            }
            state.playerStats.lostWorkers += 2;
            return "Workers disappear beneath the tiny pasta tide, surfacing minutes later covered in starch!";
        }
    },
    "Lasagna Levitation": {
        description: "Sheets of pasta are floating above the preparation tables.",
        requirements: null,
        statModifiers: {
            chaos: 11,
            prestige: 9,
            workers: 3
        },
        effect: (state) => {
            savePlayedCard("Lasagna Levitation");
            state.playerStats.usedMagicCards = true;
            return "The hovering pasta layers assemble themselves into perfect portions!";
        }
    },
    "Agnolotti Astral Projection": {
        description: "The folded pasta packets are disappearing and reappearing elsewhere.",
        requirements: null,
        statModifiers: {
            chaos: 12,
            prestige: 10,
            ingredients: 4
        },
        effect: (state) => {
            savePlayedCard("Agnolotti Astral Projection");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel > 50) {
                state.playerStats.chaos += 5;
                return "The teleporting pasta causes confusion as lunch orders materialize in random locations!";
            }
            return "The self-delivering pasta revolutionizes your distribution system!";
        }
    },
    "Saffron Symphony": {
        description: "The expensive spice creates musical notes when sprinkled into pasta water.",
        requirements: { ingredients: 2 },
        statModifiers: {
            ingredients: -2,
            prestige: 15,
            chaos: 7
        },
        effect: (state) => {
            savePlayedCard("Saffron Symphony");
            state.playerStats.usedMagicCards = true;
            return "Gourmands pay premium prices for pasta that plays Mozart during dinner!";
        }
    },
    "Ricotta Renaissance": {
        description: "The soft cheese inspires workers to create pasta-based art.",
        requirements: null,
        statModifiers: {
            workers: 5,
            prestige: 9,
            chaos: 4
        },
        effect: (state) => {
            savePlayedCard("Ricotta Renaissance");
            return "The factory gallery opens to showcase cheese sculptures and pasta paintings!";
        }
    },
    "Pappardelle Paranormal": {
        description: "The wide ribbon pasta is moving on its own, forming strange symbols.",
        requirements: null,
        statModifiers: {
            chaos: 13,
            prestige: 8,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Pappardelle Paranormal");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel > 55) {
                state.playerStats.lostWorkers += 1;
                return "Workers flee as pasta strips slither across the floor like serpents!";
            }
            state.playerStats.pastaPrestige += 4;
            return "The self-arranging pasta creates perfect nests without human intervention!";
        }
    },
    "Fettuccine Fever": {
        description: "Workers develop an intense craving for ribbon pasta.",
        requirements: null,
        statModifiers: {
            chaos: 8,
            workers: -4,
            ingredients: -1
        },
        effect: (state) => {
            savePlayedCard("Fettuccine Fever");
            if (state.playerStats.ingredients > 3) {
                state.playerStats.ingredients -= 1;
                return "Productivity plummets as workers can't stop eating the inventory!";
            }
            return "The pasta hunger leads to workplace innovation as workers devise new recipes!";
        }
    },
    "Cannoli Crisis": {
        description: "The dessert pasta tubes are exploding when filled too quickly!",
        requirements: { ingredients: 1 },
        statModifiers: {
            ingredients: -1,
            chaos: 10,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Cannoli Crisis");
            if (state.playerStats.chaosLevel < 45) {
                state.playerStats.prestige += 6;
                return "The ricotta fireworks become a popular demonstration for factory tours!";
            }
            state.playerStats.lostWorkers += 1;
            return "Workers duck for cover as sweetened ricotta projectiles fly across the room!";
        }
    },
    "Pasta Particle Accelerator": {
        description: "A physicist has modified your extruder to launch pasta at near-light speed.",
        requirements: null,
        statModifiers: {
            chaos: 16,
            prestige: 14,
            workers: -5
        },
        effect: (state) => {
            savePlayedCard("Pasta Particle Accelerator");
            if (state.playerStats.chaosLevel > 60) {
                state.playerStats.lostWorkers += 3;
                return "Spaghetti strands break the sound barrier, shattering windows and eardrums!";
            }
            state.playerStats.pastaPrestige += 7;
            return "The high-velocity pasta cooks itself through air friction, revolutionizing production!";
        }
    },
    "Rigatoni Rift": {
        description: "The tube pasta is creating a tear in the fabric of space-time!",
        requirements: null,
        statModifiers: {
            chaos: 15,
            ingredients: 5,
            prestige: 11
        },
        effect: (state) => {
            savePlayedCard("Rigatoni Rift");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel > 55) {
                state.playerStats.chaos += 6;
                return "Alternative universe pasta creatures emerge from the rift!";
            }
            state.playerStats.ingredients += 3;
            return "Exotic ingredients from parallel dimensions flow through the pasta portal!";
        }
    },
    "Penne Pendulum": {
        description: "The tube pasta swings in perfect synchronization, marking time.",
        requirements: null,
        statModifiers: {
            chaos: -7,
            workers: 5,
            prestige: 6
        },
        effect: (state) => {
            savePlayedCard("Penne Pendulum");
            return "The rhythmic pasta hypnotizes workers into a state of perfect efficiency!";
        }
    },
    "Orzo Observatory": {
        description: "The rice-shaped pasta has arranged itself into a miniature planetarium.",
        requirements: null,
        statModifiers: {
            prestige: 10,
            chaos: 5,
            workers: 2
        },
        effect: (state) => {
            savePlayedCard("Orzo Observatory");
            state.playerStats.usedMagicCards = true;
            return "Scientists study the orzo's perfect astronomical model that predicts celestial events!";
        }
    },
    "Corkscrew Catastrophe": {
        description: "The factory's pasta winder has gone berserk!",
        requirements: null,
        statModifiers: {
            chaos: 14,
            workers: -3,
            prestige: -4
        },
        effect: (state) => {
            savePlayedCard("Corkscrew Catastrophe");
            if (state.playerStats.workerCount > 15) {
                state.playerStats.chaos -= 5;
                return "Skilled workers tame the wild machine before major damage occurs!";
            }
            state.playerStats.lostWorkers += 2;
            return "The machine spins out of control, wrapping workers in spiral pasta cocoons!";
        }
    },
    "Pasta Poltergeist Party": {
        description: "Multiple spectral pasta shapes have appeared throughout the factory.",
        requirements: null,
        statModifiers: {
            chaos: 14,
            prestige: 9,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Pasta Poltergeist Party");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel < 50) {
                state.playerStats.pastaPrestige += 5;
                return "The transparent pasta entities entertain visitors with haunting performances!";
            }
            state.playerStats.chaos += 4;
            return "The ghostly pasta forms chase workers through the corridors!";
        }
    },
    "Gluten Gluttons": {
        description: "Strange creatures made of pure gluten emerge from the flour silo.",
        requirements: { ingredients: 1 },
        statModifiers: {
            ingredients: -1,
            chaos: 13,
            workers: 4
        },
        effect: (state) => {
            savePlayedCard("Gluten Gluttons");
            state.playerStats.usedMagicCards = true;
            return "The doughy beings turn out to be excellent pasta rollers!";
        }
    },
    "Caramelized Conundrum": {
        description: "The sugar added to pasta sauce has crystallized into mysterious formations.",
        requirements: null,
        statModifiers: {
            prestige: 10,
            chaos: 6,
            ingredients: 3
        },
        effect: (state) => {
            savePlayedCard("Caramelized Conundrum");
            if (state.playerStats.chaosLevel > 55) {
                state.playerStats.chaos += 5;
                return "The sugar crystals grow rapidly, encasing kitchen equipment in amber!";
            }
            return "Gourmets pay premium prices for the unique sweet-savory pasta experience!";
        }
    },
    "Basil Bees": {
        description: "A swarm of bees has taken up residence in the herb garden.",
        requirements: null,
        statModifiers: {
            chaos: 11,
            workers: -3,
            ingredients: 5
        },
        effect: (state) => {
            savePlayedCard("Basil Bees");
            if (state.playerStats.chaosLevel > 50) {
                state.playerStats.lostWorkers += 2;
                return "Workers flee in panic as the bees defend their herbal home!";
            }
            state.playerStats.prestige += 3;
            return "The bees pollinate the herb garden, creating amazingly aromatic ingredients!";
        }
    },
    "Pecorino Pendulum": {
        description: "A massive wheel of cheese swings hypnotically above the production line.",
        requirements: null,
        statModifiers: {
            chaos: -5,
            workers: 7,
            prestige: 8
        },
        effect: (state) => {
            savePlayedCard("Pecorino Pendulum");
            return "Workers enter a cheese-induced trance of perfect productivity!";
        }
    },
    "Barilla Bermuda Triangle": {
        description: "A spatial anomaly in the pasta storage room makes things disappear.",
        requirements: null,
        statModifiers: {
            chaos: 15,
            ingredients: -2,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Barilla Bermuda Triangle");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel < 45) {
                state.playerStats.ingredients += 4;
                return "Lost items from other dimensions materialize to replace what was lost!";
            }
            state.playerStats.lostWorkers += 1;
            return "A worker vanishes while inventorying the rigatoni shelf!";
        }
    },
    "Pesto Protocol Breach": {
        description: "The green sauce has escaped its containment unit!",
        requirements: null,
        statModifiers: {
            chaos: 16,
            prestige: -4,
            ingredients: 4
        },
        effect: (state) => {
            savePlayedCard("Pesto Protocol Breach");
            if (state.playerStats.workerCount > 20) {
                state.playerStats.chaos -= 7;
                return "Alert workers contain the basil-based breach before it reaches the street!";
            }
            return "The entire east wing is covered in a film of olive oil and basil!";
        }
    },
    "Black Pepper Blizzard": {
        description: "Someone knocked over the industrial-sized pepper grinder.",
        requirements: null,
        statModifiers: {
            chaos: 9,
            workers: -4,
            ingredients: 2
        },
        effect: (state) => {
            savePlayedCard("Black Pepper Blizzard");
            if (state.playerStats.chaosLevel < 35) {
                state.playerStats.prestige += 4;
                return "The peppery snowstorm creates a unique atmospheric dining experience!";
            }
            state.playerStats.lostWorkers += 2;
            return "Workers flee the production floor, eyes watering and sneezes echoing!";
        }
    },
    "Chili Flake Fiasco": {
        description: "The red pepper flakes are multiplying at an alarming rate!",
        requirements: null,
        statModifiers: {
            chaos: 12,
            prestige: 6,
            ingredients: 3
        },
        effect: (state) => {
            savePlayedCard("Chili Flake Fiasco");
            if (state.playerStats.chaosLevel > 60) {
                state.playerStats.chaos += 5;
                return "The spicy situation escalates as flakes achieve critical mass!";
            }
            return "The unexpected spice surplus leads to a new line of 'Inferno Fettuccine'!";
        }
    },
    "Nocturnal Noodles": {
        description: "The pasta only moves when no one is looking at it.",
        requirements: null,
        statModifiers: {
            chaos: 8,
            prestige: 11,
            workers: 2
        },
        effect: (state) => {
            savePlayedCard("Nocturnal Noodles");
            state.playerStats.usedMagicCards = true;
            return "Workers set up cameras to catch the pasta's secret choreography!";
        }
    },
    "Vanilla Bean Vision Quest": {
        description: "The dessert pasta flavoring is causing vivid hallucinations.",
        requirements: null,
        statModifiers: {
            chaos: 14,
            prestige: 9,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Vanilla Bean Vision Quest");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel < 50) {
                state.playerStats.pastaPrestige += 6;
                return "Workers return from their spice-induced journeys with innovative pasta concepts!";
            }
            state.playerStats.lostWorkers += 1;
            return "A worker believes they can fly and attempts to leap from the pasta drying rack!";
        }
    },
    "Tomato Telepathy": {
        description: "The sauce ingredients are broadcasting workers' thoughts!",
        requirements: null,
        statModifiers: {
            chaos: 11,
            workers: 4,
            prestige: 5
        },
        effect: (state) => {
            savePlayedCard("Tomato Telepathy");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel > 55) {
                state.playerStats.chaos += 4;
                return "Workplace tensions erupt as secret thoughts are revealed by saucy psychics!";
            }
            return "The hivemind connection improves teamwork and coordination!";
        }
    },
    "Pasta Puns Pandemic": {
        description: "Workers can't stop making terrible pasta-related jokes.",
        requirements: null,
        statModifiers: {
            chaos: 5,
            workers: 6,
            prestige: -3
        },
        effect: (state) => {
            savePlayedCard("Pasta Puns Pandemic");
            return "'Cannelloni believe these jokes!' - The puns are spreading faster than we can stop them!";
        }
    },
    "Garlic Guardian": {
        description: "A giant bulb of garlic has become sentient and protective.",
        requirements: null,
        statModifiers: {
            chaos: 9,
            prestige: 7,
            workers: 3
        },
        effect: (state) => {
            savePlayedCard("Garlic Guardian");
            state.playerStats.usedMagicCards = true;
            return "The aromatic sentinel watches over the factory, warding off vampires and thieves!";
        }
    },
    "Prosciutto Prophecy": {
        description: "The thin ham slices are arranging themselves into predictions of the future.",
        requirements: null,
        statModifiers: {
            chaos: 7,
            prestige: 12,
            ingredients: 2
        },
        effect: (state) => {
            savePlayedCard("Prosciutto Prophecy");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel < 40) {
                state.playerStats.pastaPrestige += 5;
                return "The meat-based divination reveals optimal pasta market strategies!";
            }
            state.playerStats.chaos += 3;
            return "The ham foretells doom and gloom, worrying superstitious workers!";
        }
    },
    "Olive Uprising": {
        description: "The green and black olives are at war with each other!",
        requirements: null,
        statModifiers: {
            chaos: 13,
            workers: -2,
            ingredients: -1
        },
        effect: (state) => {
            savePlayedCard("Olive Uprising");
            if (state.playerStats.chaosLevel > 50) {
                state.playerStats.lostIngredients += 2;
                return "The factory becomes a battlefield as olives hurl themselves across the room!";
            }
            state.playerStats.ingredients += 3;
            return "Workers negotiate a peace treaty, resulting in a unique 'Unity Tapenade'!";
        }
    },
    "Sage Seance": {
        description: "Workers use the aromatic herb to contact the spirit of the original pasta maker.",
        requirements: null,
        statModifiers: {
            chaos: 8,
            prestige: 9,
            workers: 3
        },
        effect: (state) => {
            savePlayedCard("Sage Seance");
            state.playerStats.usedMagicCards = true;
            return "The ghostly chef shares forgotten recipes from centuries past!";
        }
    },
    "Anchovies Anonymous": {
        description: "A support group forms for workers addicted to the salty fish.",
        requirements: null,
        statModifiers: {
            workers: 7,
            chaos: -4,
            prestige: 3
        },
        effect: (state) => {
            savePlayedCard("Anchovies Anonymous");
            return "The twelve-step program helps workers overcome their fishy dependence!";
        }
    },
    "Clove Clairvoyance": {
        description: "The aromatic spice is giving workers glimpses of the future.",
        requirements: null,
        statModifiers: {
            chaos: 6,
            prestige: 8,
            workers: 4
        },
        effect: (state) => {
            savePlayedCard("Clove Clairvoyance");
            state.playerStats.usedMagicCards = true;
            return "Production efficiency improves as workers anticipate problems before they occur!";
        }
    },
    "Mozzarella Moon": {
        description: "A perfect sphere of cheese floats near the ceiling, emitting a soft glow.",
        requirements: null,
        statModifiers: {
            chaos: 10,
            prestige: 15,
            workers: 2
        },
        effect: (state) => {
            savePlayedCard("Mozzarella Moon");
            state.playerStats.usedMagicCards = true;
            return "The luminous dairy orb provides perfect lighting for pasta production!";
        }
    },
    "Squid Ink Society": {
        description: "A secret order of pasta makers uses black ink to write coded messages.",
        requirements: null,
        statModifiers: {
            prestige: 13,
            chaos: 7,
            workers: 3
        },
        effect: (state) => {
            savePlayedCard("Squid Ink Society");
            state.playerStats.usedMagicCards = true;
            return "The cephalopod cultists share ancient pasta-making secrets!";
        }
    },
    "Arugula Alignment": {
        description: "The peppery leaves arrange themselves into strange constellations.",
        requirements: null,
        statModifiers: {
            ingredients: 4,
            prestige: 8,
            chaos: 5
        },
        effect: (state) => {
            savePlayedCard("Arugula Alignment");
            state.playerStats.usedMagicCards = true;
            return "The cosmic greens reveal the perfect timing for pasta water boiling!";
        }
    },
    "Sun-Dried Tomato Seance": {
        description: "The dehydrated fruits attempt to contact the other side.",
        requirements: { ingredients: 1 },
        statModifiers: {
            ingredients: -1,
            prestige: 10,
            chaos: 11
        },
        effect: (state) => {
            savePlayedCard("Sun-Dried Tomato Séance");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel < 45) {
                state.playerStats.pastaPrestige += 4;
                return "The tomatoes channel ancient Mediterranean pasta masters!";
            }
            state.playerStats.chaos += 5;
            return "Ominous messages about the pasta apocalypse echo through the kitchen!";
        }
    },
    "Walnut Wisdom": {
        description: "The nuts used in pasta sauce are dispensing philosophical advice.",
        requirements: null,
        statModifiers: {
            chaos: 6,
            workers: 6,
            prestige: 7
        },
        effect: (state) => {
            savePlayedCard("Walnut Wisdom");
            state.playerStats.usedMagicCards = true;
            return "Workers contemplate life's big questions while shelling the sage nuts!";
        }
    },
    "Capers Capers": {
        description: "The tiny pickled buds are performing acrobatic stunts.",
        requirements: null,
        statModifiers: {
            prestige: 9,
            chaos: 8,
            ingredients: 3
        },
        effect: (state) => {
            savePlayedCard("Capers Capers");
            return "Audiences gather to watch the daring trapeze acts of the flying capers!";
        }
    },
    "Lemon Zest Zeitgeist": {
        description: "Citrus peels capture the spirit of the pasta age.",
        requirements: null,
        statModifiers: {
            prestige: 14,
            chaos: -5,
            workers: 4
        },
        effect: (state) => {
            savePlayedCard("Lemon Zest Zeitgeist");
            return "The bright essence inspires a cultural pasta revolution!";
        }
    },
    "Pine Nut Paranoia": {
        description: "The expensive seeds are convinced someone is trying to steal them.",
        requirements: null,
        statModifiers: {
            chaos: 9,
            ingredients: 5,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Pine Nut Paranoia");
            if (state.playerStats.chaosLevel > 50) {
                state.playerStats.lostWorkers += 1;
                return "The nuts organize a militant defense force, attacking innocent passersby!";
            }
            return "The paranoid nuts hide in the most efficient storage pattern ever seen!";
        }
    },
    "Fennel Forecast": {
        description: "The licorice-flavored herb predicts upcoming pasta trends.",
        requirements: null,
        statModifiers: {
            prestige: 11,
            chaos: 4,
            ingredients: 2
        },
        effect: (state) => {
            savePlayedCard("Fennel Forecast");
            state.playerStats.usedMagicCards = true;
            return "Next season's popular pasta shapes are revealed in the arrangement of fennel fronds!";
        }
    },
    "Cardamom Conspiracy": {
        description: "The aromatic spice is attempting to infiltrate traditionally Italian dishes.",
        requirements: null,
        statModifiers: {
            chaos: 10,
            prestige: 8,
            ingredients: 3
        },
        effect: (state) => {
            savePlayedCard("Cardamom Conspiracy");
            if (state.playerStats.chaosLevel < 40) {
                state.playerStats.pastaPrestige += 6;
                return "The fusion pasta becomes an innovative culinary sensation!";
            }
            state.playerStats.chaos += 4;
            return "Traditionalist chefs protest the spice invasion with wooden spoons and rolling pins!";
        }
    },
    "Tortellini Tornado Alley": {
        description: "A corridor of spinning pasta vortices forms between storage units.",
        requirements: { ingredients: 2 },
        statModifiers: {
            ingredients: -2,
            chaos: 15,
            prestige: 9
        },
        effect: (state) => {
            savePlayedCard("Tortellini Tornado Alley");
            if (state.playerStats.workerCount > 15) {
                state.playerStats.pastaPrestige += 5;
                return "Daring workers perform stunts while riding the stuffed pasta cyclones!";
            }
            state.playerStats.lostWorkers += 2;
            return "Workers take shelter as pasta projectiles pummel the production line!";
        }
    },
    "Manicotti Mirage": {
        description: "The tubular pasta creates optical illusions in the factory.",
        requirements: null,
        statModifiers: {
            chaos: 8,
            prestige: 6,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Manicotti Mirage");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel < 35) {
                state.playerStats.prestige += 4;
                return "The pasta hallucinations become a popular tourist attraction!";
            }
            state.playerStats.lostWorkers += 1;
            return "Workers wander in circles, confused by false pasta pathways!";
        }
    },
    "Linguine Linguistics": {
        description: "The flat noodles have developed their own language.",
        requirements: null,
        statModifiers: {
            prestige: 10,
            chaos: 7,
            workers: 4
        },
        effect: (state) => {
            savePlayedCard("Linguine Linguistics");
            state.playerStats.usedMagicCards = true;
            return "Linguists arrive to study the complex pasta dialect!";
        }
    },
    "Cavatappi Quantum Computing": {
        description: "The spiral pasta has formed an organic supercomputer.",
        requirements: null,
        statModifiers: {
            chaos: 12,
            prestige: 16,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Cavatappi Quantum Computing");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel < 50) {
                state.playerStats.pastaPrestige += 8;
                return "The pasta AI optimizes production logistics beyond human capability!";
            }
            state.playerStats.chaos += 6;
            return "The sentient spirals attempt to connect to the internet and take over the world!";
        }
    },
    "Pumpkin Spice Pandemonium": {
        description: "Someone added seasonal flavoring to the pasta sauce.",
        requirements: null,
        statModifiers: {
            prestige: 13,
            chaos: 9,
            ingredients: -1
        },
        effect: (state) => {
            savePlayedCard("Pumpkin Spice Pandemonium");
            if (state.playerStats.chaosLevel > 40) {
                state.playerStats.chaos += 4;
                return "The factory is overrun with social media influencers seeking the trendy pasta!";
            }
            return "The seasonal pasta blend sells out immediately, creating unprecedented demand!";
        }
    },
    "Ravioli Radio": {
        description: "The stuffed pasta is broadcasting on FM frequencies.",
        requirements: null,
        statModifiers: {
            chaos: 11,
            prestige: 7,
            workers: 3
        },
        effect: (state) => {
            savePlayedCard("Ravioli Radio");
            state.playerStats.usedMagicCards = true;
            return "The pasta station plays the hottest Italian hits and traffic updates!";
        }
    },
    "Lunar Pasta Eclipse": {
        description: "The moon turns the color of perfect al dente pasta.",
        requirements: null,
        statModifiers: {
            prestige: 15,
            chaos: 6,
            workers: 5
        },
        effect: (state) => {
            savePlayedCard("Lunar Pasta Eclipse");
            state.playerStats.usedMagicCards = true;
            return "The celestial sign draws visitors from around the world to your factory!";
        }
    },
    "Pastafarian Pilgrimage": {
        description: "Followers of the Flying Spaghetti Monster gather at your factory.",
        requirements: null,
        statModifiers: {
            prestige: 12,
            chaos: 10,
            workers: 4
        },
        effect: (state) => {
            savePlayedCard("Pastafarian Pilgrimage");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel > 45) {
                state.playerStats.chaos += 5;
                return "The religious fervor reaches dangerous levels as noodle miracles occur!";
            }
            return "The devoted believers volunteer their services to the sacred pasta cause!";
        }
    },
    "Spaghetti Space Program": {
        description: "Engineers build a pasta-powered rocket in the parking lot.",
        requirements: { ingredients: 3 },
        statModifiers: {
            ingredients: -3,
            prestige: 18,
            chaos: 14
        },
        effect: (state) => {
            savePlayedCard("Spaghetti Space Program");
            if (state.playerStats.chaosLevel < 55) {
                state.playerStats.pastaPrestige += 10;
                return "The carbohydrate spacecraft successfully reaches orbit, making international news!";
            }
            state.playerStats.chaos += 7;
            return "The pasta rocket explodes on the launchpad in a spectacular shower of starch!";
        }
    },
    "Penne for Your Thoughts": {
        description: "The tube pasta enables telepathic communication among workers.",
        requirements: null,
        statModifiers: {
            workers: 7,
            chaos: 8,
            prestige: 6
        },
        effect: (state) => {
            savePlayedCard("Penne for Your Thoughts");
            state.playerStats.usedMagicCards = true;
            return "The pasta-based hivemind revolutionizes factory coordination!";
        }
    },
    // Chaos-reducing cards
    "Pasta Meditation Retreat": {
        description: "Workers learn inner peace through pasta-focused mindfulness.",
        requirements: null,
        statModifiers: {
            chaos: -14,
            workers: 3,
            prestige: 5
        },
        effect: (state) => {
            savePlayedCard("Pasta Meditation Retreat");
            if (state.playerStats.chaosLevel > 60) {
                state.playerStats.chaos -= 3;
                return "Even in extreme chaos, the meditation techniques provide some respite!";
            }
            return "The calm atmosphere spreads throughout the factory!";
        }
    },

    "Quality Assurance Audit": {
        description: "Professional inspectors review your pasta production methods.",
        requirements: { workers: 3 },
        statModifiers: {
            chaos: -15,
            prestige: 4,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Quality Assurance Audit");
            if (state.playerStats.chaosLevel > 50) {
                state.playerStats.chaos -= 6;
                return "The auditors are impressed by how well you manage such chaos!";
            }
            return "Your operations receive certification for exceptional pasta quality!";
        }
    },

    "Factory Organization Day": {
        description: "Dedicate time to cleaning and organizing the entire facility.",
        requirements: null,
        statModifiers: {
            chaos: -12,
            ingredients: 2,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Factory Organization Day");
            if (state.playerStats.workerCount > 15) {
                state.playerStats.chaos -= 3;
                return "With many hands, the factory is spotless in record time!";
            }
            state.playerStats.lostWorkers += 1;
            return "The cleanup reveals forgotten ingredient stashes... and one worker who was napping!";
        }
    },

    "Pasta Cooling System Upgrade": {
        description: "Install state-of-the-art temperature control for perfect pasta consistency.",
        requirements: null,
        statModifiers: {
            chaos: -18,
            workers: -2,
            prestige: 7
        },
        effect: (state) => {
            savePlayedCard("Pasta Cooling System Upgrade");
            return "The precise cooling creates pasta with perfect texture and reduces production errors!";
        }
    },

    // Prestige-reducing events
    "Social Media Scandal": {
        description: "A viral video shows your workers mishandling spaghetti!",
        requirements: null,
        statModifiers: {
            prestige: -14,
            chaos: 8,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Social Media Scandal");
            if (state.playerStats.prestige > 40) {
                state.playerStats.prestige -= 5;
                return "The high standing of your factory takes a serious hit!";
            }
            return "Public outrage at workers twirling spaghetti with their fingers!";
        }
    },

    "Competitor's New Recipe": {
        description: "A rival pasta maker releases an innovative new sauce that's stealing your customers.",
        requirements: null,
        statModifiers: {
            prestige: -10,
            ingredients: 3,
            chaos: 5
        },
        effect: (state) => {
            savePlayedCard("Competitor's New Recipe");
            if (state.playerStats.ingredients > 4) {
                state.playerStats.ingredients += 2;
                return "You reverse-engineer their recipe and improve upon it!";
            }
            return "Customers are abandoning your pasta for the competition!";
        }
    },

    "Food Critic's Scathing Review": {
        description: "An influential critic lambasts your signature pasta dish.",
        requirements: null,
        statModifiers: {
            prestige: -16,
            chaos: 7,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Food Critic's Scathing Review");
            if (state.playerStats.prestige > 50) {
                state.playerStats.chaos -= 3;
                return "Your reputation is strong enough to weather the criticism!";
            }
            state.playerStats.lostWorkers += 1;
            return "The head chef quits in tears after reading the review!";
        }
    },

    // Worker-cost cards with high rewards
    "Mass Production Initiative": {
        description: "Implement an aggressive production schedule to maximize output.",
        requirements: { workers: 8 },
        statModifiers: {
            workers: -8,
            ingredients: 10,
            chaos: 6
        },
        effect: (state) => {
            savePlayedCard("Mass Production Initiative");
            if (state.playerStats.chaosLevel < 40) {
                state.playerStats.ingredients += 2;
                return "The streamlined process yields even more ingredients than expected!";
            }
            state.playerStats.lostWorkers += 2;
            return "Workers collapse from exhaustion as machines run at maximum capacity!";
        }
    },

    "Pasta Quality Summit": {
        description: "Host an international gathering of pasta experts at your factory.",
        requirements: { workers: 6 },
        statModifiers: {
            workers: -6,
            prestige: 16,
            chaos: 5
        },
        effect: (state) => {
            savePlayedCard("Pasta Quality Summit");
            return "Your factory becomes the talk of the pasta world!";
        }
    },

    "Factory Restructuring": {
        description: "Implement a complete reorganization of the production lines.",
        requirements: { workers: 7 },
        statModifiers: {
            workers: -7,
            chaos: -16,
            prestige: 9
        },
        effect: (state) => {
            savePlayedCard("Factory Restructuring");
            if (state.playerStats.workerCount > 15) {
                state.playerStats.workers += 2;
                return "The improved workflow brings workers back quickly!";
            }
            return "The new system runs like clockwork, but with a skeleton crew!";
        }
    },

    // Ingredient-focused cards
    "Ingredient Storage Expansion": {
        description: "Build additional storage facilities for pasta ingredients.",
        requirements: { ingredients: 3 },
        statModifiers: {
            ingredients: -3,
            chaos: -5,
            prestige: 7
        },
        effect: (state) => {
            savePlayedCard("Ingredient Storage Expansion");
            state.playerStats.maxIngredients = (state.playerStats.maxIngredients || 20) + 5;
            return "Your ingredient capacity has increased! You can now store more supplies.";
        }
    },

    "Farm-to-Factory Partnership": {
        description: "Establish direct relationships with local farmers for fresh ingredients.",
        requirements: null,
        statModifiers: {
            ingredients: 6,
            prestige: 8,
            chaos: -3
        },
        effect: (state) => {
            savePlayedCard("Farm-to-Factory Partnership");
            // Set up a recurring ingredient delivery
            if (state.playerStats.turnCount % 3 === 0 && !state.playerStats.farmPartnershipActive) {
                state.playerStats.farmPartnershipActive = true;
                state.playerStats.ingredients = Math.min((state.playerStats.maxIngredients || 20), 
                                                        state.playerStats.ingredients + 1);
                return "Regular ingredient deliveries have begun arriving from your partner farms!";
            }
            return "Fresh ingredients arrive directly from local farms!";
        }
    },

    "Bulk Purchasing Plan": {
        description: "Invest in a large shipment of premium pasta ingredients.",
        requirements: null,
        statModifiers: {
            ingredients: 8,
            chaos: 5,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Bulk Purchasing Plan");
            if (state.playerStats.chaosLevel > 50) {
                state.playerStats.lostIngredients += 2;
                return "Some ingredients spoil in the chaos before they can be used!";
            }
            return "The warehouse is filled with high-quality pasta ingredients!";
        }
    },

    // Special mechanics cards
    "Pasta Insurance Policy": {
        description: "Purchase coverage against pasta-related disasters.",
        requirements: null,
        statModifiers: {
            chaos: -7,
            prestige: 4
        },
        effect: (state) => {
            savePlayedCard("Pasta Insurance Policy");
            state.playerStats.insuranceActive = true;
            state.playerStats.money -= 200; // Insurance cost
            return "Your factory is now insured against pasta catastrophes!";
        }
    },

    "Rotating Staff Schedule": {
        description: "Implement a new shift system to manage worker fatigue.",
        requirements: { workers: 5 },
        statModifiers: {
            workers: 6,
            chaos: -9
        },
        effect: (state) => {
            savePlayedCard("Rotating Staff Schedule");
            // Convert chaos to worker energy
            const chaosReduction = Math.min(state.playerStats.chaosLevel, 10);
            state.playerStats.chaos -= chaosReduction;
            state.playerStats.workerEnergy += chaosReduction * 0.5;
            return "Workers are refreshed by the new schedule, and factory chaos is reduced!";
        }
    },

    "Noodle Futures Market": {
        description: "Speculate on pasta commodity prices for potential profit.",
        requirements: null,
        statModifiers: {
            prestige: -5,
            chaos: 4
        },
        effect: (state) => {
            savePlayedCard("Noodle Futures Market");
            // Random chance of success
            if (Math.random() > 0.5) {
                const profit = Math.floor(Math.random() * 500) + 200;
                state.playerStats.money += profit;
                return `Your market speculation pays off with a ${profit} profit!`;
            } else {
                state.playerStats.prestige -= 3;
                return "Your pasta futures investments fail to yield returns!";
            }
        }
    },

    "Factory Automation": {
        description: "Install automated pasta-making systems to reduce labor needs.",
        requirements: { workers: 8 },
        statModifiers: {
            workers: -8,
            prestige: 10,
            chaos: -6
        },
        effect: (state) => {
            savePlayedCard("Factory Automation");
            // Improve production efficiency
            state.playerStats.productionEfficiency = (state.playerStats.productionEfficiency || 1) * 1.25;
            return "The automated systems increase production while requiring fewer workers!";
        }
    },

    // Additional balanced cards
    "Pasta Safety Training": {
        description: "Train workers in proper pasta handling procedures.",
        requirements: null,
        statModifiers: {
            chaos: -11,
            workers: 4,
            prestige: 5
        },
        effect: (state) => {
            savePlayedCard("Pasta Safety Training");
            return "Workers now follow proper safety protocols for boiling water and al dente testing!";
        }
    },

    "Starch Containment Breach": {
        description: "The pasta starch filtration system has failed catastrophically!",
        requirements: null,
        statModifiers: {
            chaos: 16,
            prestige: -8,
            ingredients: -2
        },
        effect: (state) => {
            savePlayedCard("Starch Containment Breach");
            if (state.playerStats.chaosLevel < 40) {
                state.playerStats.chaos -= 4;
                return "Quick-thinking workers contain the starchy explosion!";
            }
            state.playerStats.lostWorkers += 2;
            return "Workers are caught in a sticky situation as starch floods the factory floor!";
        }
    },

    "Noodle Naming Contest": {
        description: "Hold a public competition to name your new pasta shape.",
        requirements: null,
        statModifiers: {
            prestige: 13,
            chaos: 7,
            workers: 2
        },
        effect: (state) => {
            savePlayedCard("Noodle Naming Contest");
            return "The winning entry 'Squigglini' becomes an overnight sensation!";
        }
    },

    "Pasta Portion Control": {
        description: "Implement precise measurement systems for perfect pasta servings.",
        requirements: null,
        statModifiers: {
            chaos: -13,
            ingredients: 4,
            prestige: 6
        },
        effect: (state) => {
            savePlayedCard("Pasta Portion Control");
            // Improve ingredient efficiency
            state.playerStats.ingredientEfficiency = (state.playerStats.ingredientEfficiency || 1) * 1.15;
            return "Ingredients go further with standardized portions!";
        }
    },

    "Spaghetti Sculpture Exhibition": {
        description: "Artists create elaborate sculptures using your dried pasta.",
        requirements: { ingredients: 2 },
        statModifiers: {
            ingredients: -2,
            prestige: 14,
            workers: 3
        },
        effect: (state) => {
            savePlayedCard("Spaghetti Sculpture Exhibition");
            return "The pasta art exhibition attracts international attention!";
        }
    },

    "Ravioli Research Initiative": {
        description: "Fund scientific study of optimal stuffed pasta techniques.",
        requirements: { ingredients: 3 },
        statModifiers: {
            ingredients: -3,
            prestige: 12,
            chaos: -8
        },
        effect: (state) => {
            savePlayedCard("Ravioli Research Initiative");
            if (state.playerStats.chaosLevel < 30) {
                state.playerStats.pastaPrestige += 5;
                return "Groundbreaking pasta research earns your factory academic recognition!";
            }
            return "Scientists develop revolutionary stuffing techniques!";
        }
    },

    "Pasta Archaeological Dig": {
        description: "Excavate ancient pasta-making artifacts beneath the factory.",
        requirements: null,
        statModifiers: {
            chaos: 12,
            prestige: 9,
            workers: -4
        },
        effect: (state) => {
            savePlayedCard("Pasta Archaeological Dig");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel > 50) {
                state.playerStats.chaos += 4;
                return "The dig unearths an ancient pasta curse!";
            }
            return "Archaeologists discover 2,000-year-old pasta molds!";
        }
    },

    "Linguini Language Barrier": {
        description: "A visiting pasta expert only speaks in an obscure pasta dialect.",
        requirements: null,
        statModifiers: {
            chaos: 8,
            prestige: -6,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Linguini Language Barrier");
            if (state.playerStats.workerCount > 15) {
                state.playerStats.prestige += 10;
                return "A worker who studied abroad translates the expert's techniques!";
            }
            state.playerStats.lostWorkers += 1;
            return "Communication breakdowns lead to pasta confusion!";
        }
    },

    "Pasta Humidity Control": {
        description: "Install systems to maintain perfect drying conditions.",
        requirements: null,
        statModifiers: {
            chaos: -9,
            prestige: 8,
            ingredients: 3
        },
        effect: (state) => {
            savePlayedCard("Pasta Humidity Control");
            return "The perfectly regulated humidity results in pasta with ideal texture!";
        }
    },

    "Pasta Psychology Session": {
        description: "A therapist helps workers process their pasta-related stress.",
        requirements: null,
        statModifiers: {
            chaos: -17,
            workers: 5,
            prestige: 3
        },
        effect: (state) => {
            savePlayedCard("Pasta Psychology Session");
            if (state.playerStats.chaosLevel > 60) {
                state.playerStats.lostWorkers += 1;
                return "The therapist flees in terror as workers describe the sentient linguine!";
            }
            return "Workers work through their feelings about the traumatic ravioli incident!";
        }
    },

    "Capellini Choir": {
        description: "The fine angel hair pasta strands vibrate to create heavenly music.",
        requirements: null,
        statModifiers: {
            prestige: 9,
            chaos: 6,
            workers: 5
        },
        effect: (state) => {
            savePlayedCard("Capellini Choir");
            state.playerStats.usedMagicCards = true;
            return "The angelic pasta melodies soothe even the most stressed workers!";
        }
    },

    // New upgrade cards start here
    "Automated Pasta Dryers": {
        description: "High-tech dryers maintain perfect humidity.",
        type: "upgrade",
        requirements: { prestige: 20 },
        cost: 500,
        permanentStats: {
            prestigeGain: 0.05,
            chaosReduction: 0.07
        },
        statModifiers: {
            chaos: -4,
            prestige: 6
        },
        effect: (state) => {
            savePlayedCard("Automated Pasta Dryers");
            return "Perfect drying conditions create pasta with ideal texture!";
        }
    },
    "Artisanal Water Filtration": {
        description: "Special minerals enhance pasta flavor and structural integrity.",
        type: "upgrade",
        requirements: { prestige: 15 },
        cost: 400,
        permanentStats: {
            prestigeGain: 0.08
        },
        statModifiers: {
            prestige: 7,
            chaos: -3
        },
        effect: (state) => {
            savePlayedCard("Artisanal Water Filtration");
            return "The subtle mineral profile elevates your pasta to gourmet status!";
        }
    },
    "Worker Benefits Program": {
        description: "Improved working conditions boost morale and retention.",
        type: "upgrade",
        requirements: { prestige: 25 },
        cost: 550,
        permanentStats: {
            workerEfficiency: 0.1
        },
        statModifiers: {
            workers: 5,
            chaos: -5
        },
        effect: (state) => {
            savePlayedCard("Worker Benefits Program");
            return "Happy workers make better pasta and stay longer!";
        }
    },
    "Chaos Dampening Field": {
        description: "Experimental technology stabilizes factory entropy.",
        type: "upgrade",
        requirements: { prestige: 35 },
        cost: 800,
        permanentStats: {
            chaosReduction: 0.15
        },
        statModifiers: {
            chaos: -12,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Chaos Dampening Field");
            return "The pasta physics stabilizers keep chaos under control!";
        }
    },
    "Ingredient Preservation System": {
        description: "Advanced storage technology extends ingredient freshness.",
        type: "upgrade",
        requirements: { prestige: 20 },
        cost: 450,
        permanentStats: {
            ingredientGain: 0.12
        },
        statModifiers: {
            ingredients: 4,
            chaos: -2
        },
        effect: (state) => {
            savePlayedCard("Ingredient Preservation System");
            return "Your ingredients stay fresher longer and stretch further!";
        }
    },
    "Pasta Gold Certification": {
        description: "Official recognition of your pasta's exceptional quality.",
        type: "upgrade",
        requirements: { prestige: 40 },
        cost: 750,
        permanentStats: {
            prestigeGain: 0.12
        },
        priceBonus: 0.15,
        statModifiers: {
            prestige: 12,
            chaos: 4
        },
        effect: (state) => {
            savePlayedCard("Pasta Gold Certification");
            return "Your gold-standard pasta commands premium prices!";
        }
    },
    "Harmonic Dough Resonator": {
        description: "Sound waves create perfectly consistent pasta texture.",
        type: "upgrade",
        requirements: { prestige: 30 },
        cost: 600,
        permanentStats: {
            chaosReduction: 0.08,
            prestigeGain: 0.06
        },
        statModifiers: {
            prestige: 8,
            chaos: -6
        },
        effect: (state) => {
            savePlayedCard("Harmonic Dough Resonator");
            return "The pasta vibrates at the perfect frequency for ideal texture!";
        }
    },
    "Precision Extrusion Dies": {
        description: "Bronze-crafted shapes for authentic artisanal pasta texture.",
        type: "upgrade",
        requirements: { prestige: 25 },
        cost: 550,
        permanentStats: {
            prestigeGain: 0.10
        },
        productionBonus: 0.1,
        statModifiers: {
            prestige: 9
        },
        effect: (state) => {
            savePlayedCard("Precision Extrusion Dies");
            return "The sauce-grabbing texture of your pasta is unrivaled!";
        }
    },
    "Employee Wellness Center": {
        description: "On-site pasta appreciation facilities for workers.",
        type: "upgrade",
        requirements: { prestige: 35 },
        cost: 650,
        permanentStats: {
            workerEfficiency: 0.15,
            chaosReduction: 0.06
        },
        statModifiers: {
            workers: 6,
            chaos: -7
        },
        effect: (state) => {
            savePlayedCard("Employee Wellness Center");
            return "Workers return from breaks rejuvenated and pasta-passionate!";
        }
    },
    "Durum Wheat Partnership": {
        description: "Direct access to premium grains.",
        type: "upgrade",
        requirements: { prestige: 30 },
        cost: 500,
        permanentStats: {
            ingredientGain: 0.15
        },
        statModifiers: {
            ingredients: 6,
            prestige: 5
        },
        effect: (state) => {
            savePlayedCard("Durum Wheat Partnership");
            return "The finest semolina ensures your pasta has perfect bite!";
        }
    },
    "Automated QC": {
        description: "AI-powered imperfection detection system.",
        type: "upgrade",
        requirements: { prestige: 40 },
        cost: 700,
        permanentStats: {
            prestigeGain: 0.08,
            chaosReduction: 0.08
        },
        statModifiers: {
            prestige: 6,
            chaos: -8
        },
        effect: (state) => {
            savePlayedCard("Automated Quality Control");
            return "The system catches flawed pasta before it leaves the factory!";
        }
    },
    "Pasta Shape Patent": {
        description: "Legal protection for your unique pasta design innovation.",
        type: "upgrade",
        requirements: { prestige: 45 },
        cost: 850,
        permanentStats: {
            prestigeGain: 0.14
        },
        priceBonus: 0.18,
        statModifiers: {
            prestige: 10
        },
        effect: (state) => {
            savePlayedCard("Pasta Shape Patent");
            return "Your revolutionary pasta shape cannot be legally copied!";
        }
    },
    "Waste Recycling System": {
        description: "Convert pasta scraps back into usable ingredients.",
        type: "upgrade",
        requirements: { prestige: 25 },
        cost: 450,
        permanentStats: {
            ingredientGain: 0.18
        },
        statModifiers: {
            ingredients: 3,
            prestige: 3,
            chaos: -3
        },
        effect: (state) => {
            savePlayedCard("Waste Recycling System");
            return "Nothing goes to waste in your eco-friendly pasta factory!";
        }
    },
    "Celebrity Chef Endorsement": {
        description: "Famous culinary master promotes your pasta worldwide.",
        type: "upgrade",
        requirements: { prestige: 50 },
        cost: 900,
        permanentStats: {
            prestigeGain: 0.15
        },
        priceBonus: 0.2,
        statModifiers: {
            prestige: 15,
            chaos: 5
        },
        effect: (state) => {
            savePlayedCard("Celebrity Chef Endorsement");
            return "The world's most famous chef showcases your pasta on TV!";
        }
    },
    "Worker Training Academy": {
        description: "In-house pasta expertise development for all employees.",
        type: "upgrade",
        requirements: { prestige: 35 },
        cost: 600,
        permanentStats: {
            workerEfficiency: 0.18
        },
        statModifiers: {
            workers: 8,
            chaos: -4
        },
        effect: (state) => {
            savePlayedCard("Worker Training Academy");
            return "Each worker becomes a master of pasta craft!";
        }
    },
    
    // Bonus upgrade card - more expensive but very powerful
    "Quantum Pasta Stabilizer": {
        description: "Revolutionary technology that optimizes pasta at subatomic levels.",
        type: "upgrade",
        requirements: { prestige: 60 },
        cost: 1200,
        permanentStats: {
            chaosReduction: 0.15,
            workerEfficiency: 0.10
        },
        productionBonus: 0.15,
        statModifiers: {
            prestige: 14,
            chaos: -10
        },
        effect: (state) => {
            savePlayedCard("Quantum Pasta Stabilizer");
            return "Your pasta achieves quantum perfection in flavor and texture!";
        }
    }
}; // End of CARDS object

let lastDrawnCards = [];

function getPlayedCards() {
    const played = localStorage.getItem(LOCAL_STORAGE_KEY);
    return played ? JSON.parse(played) : {};
}

function savePlayedCard(cardName) {
    const played = JSON.parse(localStorage.getItem('noodleFactoryPlayedCards') || '{}');
    played[cardName] = true;
    localStorage.setItem('noodleFactoryPlayedCards', JSON.stringify(played));

    // Handle upgrade card costs
    const card = CARDS[cardName];
    if (card && card.type === 'upgrade' && card.cost) {
        // Set a flag to indicate this card was purchased
        if (gameState && gameState.playerStats) {
            if (!gameState.playerStats.purchasedUpgrades) {
                gameState.playerStats.purchasedUpgrades = {};
            }
            gameState.playerStats.purchasedUpgrades[cardName] = card.cost;
        }
    }
    
    checkCardAchievements();
}

function checkCardAchievements() {
    const played = getPlayedCards();
    if (Object.keys(played).length === 0) return;
    const totalCards = Object.keys(CARDS).length;
    const playedCount = Object.keys(played).length;
    const percentage = (playedCount / totalCards) * 100;
    console.log(`Cards played: ${playedCount}/${totalCards} (${percentage.toFixed(1)}%)`);
}

export function applyStatModifiers(state, modifiers) {
    // Remove automatic ingredient checking since it's now handled at a higher level
    if (modifiers.chaos && modifiers.chaos < 0) {
        const minChaos = 5;
        if (state.playerStats.chaosLevel + modifiers.chaos < minChaos) {
            modifiers.chaos = minChaos - state.playerStats.chaosLevel;
        }
    }
    
    // Cap all stat changes to ±10 for balance
    Object.keys(modifiers).forEach(stat => {
        if (Math.abs(modifiers[stat]) > 10) {
            modifiers[stat] = Math.sign(modifiers[stat]) * 10;
        }
    });
    return modifiers;
}

export function applyUpgradeEffects(state) {
    if (!state.playerStats.factoryUpgrades) return;

    // Reset rates to base values first
    state.playerStats.prestigeGainRate = 1;
    state.playerStats.chaosGainRate = 1;
    state.playerStats.workerLossRate = 1;
    state.playerStats.noodleProductionRate = 1;
    state.playerStats.noodleSalePrice = 5; // Base price

    // Apply all permanent effects from all upgrades
    Object.entries(state.playerStats.factoryUpgrades).forEach(([name, upgrade]) => {
        // Skip upgrades that are being sold (marked with _beingSold flag)
        if (upgrade._beingSold) return;
        
        if (upgrade.permanentStats) {
            // Apply permanent stat modifiers
            if (upgrade.permanentStats.prestigeGain) {
                state.playerStats.prestigeGainRate *= (1 + upgrade.permanentStats.prestigeGain);
                triggerUpgradeGlow(name, "prestigeGain");
            }
            if (upgrade.permanentStats.chaosReduction) {
                state.playerStats.chaosGainRate *= (1 - upgrade.permanentStats.chaosReduction);
                triggerUpgradeGlow(name, "chaosReduction");
            }
            if (upgrade.permanentStats.workerEfficiency) {
                state.playerStats.workerLossRate *= (1 - upgrade.permanentStats.workerEfficiency);
                triggerUpgradeGlow(name, "workerEfficiency");
            }

            // Handle ingredient gain/loss chances
            if (upgrade.permanentStats.ingredientGain) {
                const chance = Math.abs(upgrade.permanentStats.ingredientGain);
                if (Math.random() < chance) {
                    if (upgrade.permanentStats.ingredientGain > 0) {
                        // Add ingredient with message
                        if (state.playerStats.ingredients < 20) {
                            state.playerStats.ingredients++;
                            triggerUpgradeGlow(name, "ingredientGain");
                            if (window.gameInstance) {
                                // Add bonus message to the end of the queue instead of showing immediately
                                window.gameInstance.messageQueue.push({
                                    message: `${name} generated a bonus ingredient!`,
                                    type: 'feedback'
                                });
                            }
                        }
                    } else {
                        // Remove ingredient with message
                        if (state.playerStats.ingredients > 0) {
                            state.playerStats.ingredients--;
                            triggerUpgradeGlow(name, "ingredientGain");
                            if (window.gameInstance) {
                                // Add bonus message to the end of the queue instead of showing immediately
                                window.gameInstance.messageQueue.push({
                                    message: `${name} consumed an ingredient!`,
                                    type: 'feedback'
                                });
                            }
                        }
                    }
                }
            }
        }

        // Apply production and price bonuses
        if (upgrade.productionBonus) {
            state.playerStats.noodleProductionRate *= (1 + upgrade.productionBonus);
        }
        if (upgrade.priceBonus) {
            state.playerStats.noodleSalePrice = Math.round(state.playerStats.noodleSalePrice * (1 + upgrade.priceBonus));
        }
    });
}

function triggerUpgradeGlow(upgradeName, effectType) {
    // Find the upgrade element
    const upgradeElement = document.querySelector(`.upgrade-card[data-name="${upgradeName}"]`);
    if (!upgradeElement) return;

    // Remove any existing activation classes
    upgradeElement.classList.remove('activated');
    // Set the effect type
    upgradeElement.setAttribute('data-effect', effectType);
    
    // Force a reflow
    void upgradeElement.offsetWidth;
    
    // Add the activation class to trigger the animation
    upgradeElement.classList.add('activated');
    
    // Remove the activation class after animation completes
    setTimeout(() => {
        upgradeElement.classList.remove('activated');
    }, 800); // Match the animation duration
}

function createSmokeEffect(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // More particles for selected cards
    const isSelected = element.dataset.selected === 'true';
    const particleCount = isSelected ? 25 : 12;
    
    // Check if it's an upgrade card - less smoke for upgrades
    const isUpgradeCard = element.classList.contains('upgrade-selected');
    const finalParticleCount = isUpgradeCard ? 10 : particleCount;
    
    // Create a variety of particle sizes and colors
    const colors = ['255, 255, 255', '245, 245, 245', '235, 235, 235', '225, 225, 225'];
    
    // Create particles with varied parameters
    for (let i = 0; i < finalParticleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'smoke-particle';
        
        // Add variety to particle positions
        const spreadFactor = isSelected ? 1 : 0.7;
        const randomOffsetX = (Math.random() - 0.5) * rect.width * spreadFactor;
        const randomOffsetY = (Math.random() - 0.5) * rect.height * spreadFactor;

        particle.style.left = `${centerX + randomOffsetX}px`;
        particle.style.top = `${centerY + randomOffsetY}px`;

        // Add variety to particle movement
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 140; 
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - (50 + Math.random() * 30);

        // Randomize particle size
        const size = 8 + Math.floor(Math.random() * 8);
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Randomize particle color and opacity
        const colorIndex = Math.floor(Math.random() * colors.length);
        const baseOpacity = 0.6 + Math.random() * 0.3;
        particle.style.background = `rgba(${colors[colorIndex]}, ${baseOpacity})`;
        
        // Add particle animation properties
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        
        // Add random duration for more natural effect
        const duration = 0.5 + Math.random() * 0.3;
        
        document.body.appendChild(particle);

        requestAnimationFrame(() => {
            particle.style.animation = `smoke ${duration}s ease-out forwards`;
        });

        setTimeout(() => particle.remove(), 600); // Match the animation duration
    }
}

export function getRandomCard() {
    const selectedCard = document.querySelector('.card[data-selected="true"]');
    if (selectedCard) {
        // Skip animations for upgrade cards
        if (!selectedCard.classList.contains('upgrade-selected')) {
            // Add wiggle animation before disappearing
            selectedCard.classList.add('wiggle-selected');
            
            // Create smoke effect right away for better feedback
            createSmokeEffect(selectedCard);
            
            // Short delay to let wiggle animation start before applying dissolving effect
            setTimeout(() => {
                selectedCard.classList.add('dissolving');
            }, 200);
        }
        
        return new Promise(resolve => {
            // Set timeout to match our animation duration
            setTimeout(() => {
                const cardNames = Object.keys(CARDS).filter(name => {
                    // Skip cards in lastDrawnCards
                    if (lastDrawnCards.includes(name)) {
                        return false;
                    }
                    // Check for Reggie's Return special case
                    if (name === "Return of Reggie") {
                        return gameState?.playerStats?.reggieEscaped === true;
                    }
                    // Filter out upgrade cards that don't meet prestige requirements
                    if (CARDS[name].type === "upgrade") {
                        const requiredPrestige = CARDS[name].requirements?.prestige || 0;
                        return gameState?.playerStats?.pastaPrestige >= requiredPrestige;
                    }
                    return true;
                });                resolve(cardNames[Math.floor(Math.random() * cardNames.length)]);
            }, 650); // Adjusted to match our wiggle + dissolve animation timing
        });
    }

    const cardNames = Object.keys(CARDS).filter(name => {
        // Skip cards in lastDrawnCards
        if (lastDrawnCards.includes(name)) {
            return false;
        }
        // Check for Reggie's Return special case
        if (name === "Return of Reggie") {
            return gameState?.playerStats?.reggieEscaped === true;
        }
        // Filter out upgrade cards that don't meet prestige requirements
        if (CARDS[name].type === "upgrade") {
            const requiredPrestige = CARDS[name].requirements?.prestige || 0;
            return gameState?.playerStats?.pastaPrestige >= requiredPrestige;
        }
        return true;
    });

    // Add weighted probability for upgrade cards at higher prestige
    if (gameState?.playerStats?.pastaPrestige >= 25) {
        const upgradeCards = cardNames.filter(name => CARDS[name].type === "upgrade");
        const regularCards = cardNames.filter(name => CARDS[name].type !== "upgrade");

        // Increase upgrade chance based on prestige, starting at 25
        let upgradeChance;
        if (gameState.playerStats.pastaPrestige >= 50) {
            // Original scaling for 50+ prestige
            upgradeChance = Math.min(0.75, (gameState.playerStats.pastaPrestige - 50) / 100);
        } else {
            // New scaled chance for 25-49 prestige
            upgradeChance = Math.min(0.35, (gameState.playerStats.pastaPrestige - 25) / 100);
        }

        if (Math.random() < upgradeChance && upgradeCards.length > 0) {
            return upgradeCards[Math.floor(Math.random() * upgradeCards.length)];
        }

        return regularCards[Math.floor(Math.random() * regularCards.length)];
    }

    return cardNames[Math.floor(Math.random() * cardNames.length)];
}

// Add function to check if player can afford an upgrade
export function canAffordUpgrade(cardName) {
    const card = CARDS[cardName];
    if (card && card.type === 'upgrade' && card.cost) {
        return gameState?.playerStats?.money >= card.cost;
    }
    return true;
}

// Add function to purchase an upgrade
export function purchaseUpgrade(cardName) {
    const card = CARDS[cardName];
    if (card && card.type === 'upgrade' && card.cost) {
        if (gameState?.playerStats?.money >= card.cost) {
            gameState.playerStats.money -= card.cost;
            return true;
        }
        return false;
    }
    return true;
}

// Add function to sell an upgrade and get refund
export function sellUpgrade(cardName) {
    const card = CARDS[cardName];
    if (card && card.type === 'upgrade' && card.cost) {
        const refundPercentage = 0.5; // 50% refund
        const refundAmount = Math.floor(card.cost * refundPercentage);
        
        if (gameState && gameState.playerStats) {
            gameState.playerStats.money += refundAmount;
            return refundAmount;
        }
    }
    return 0;
}

// Also update checkCardPlayable function to check for additional stat costs
function checkCardPlayable(card) {
    if (!card.requirements) return true;

    if (card.statModifiers?.workers < 0) {
        const workerChange = card.statModifiers.workers;
        const currentWorkers = gameState.playerStats.workerCount || 0;
        
        // Check if we would go below 0 workers
        if ((currentWorkers + workerChange) < 0) {
            const severityFactor = Math.abs(workerChange);
            const costPerWorker = Math.min(150, Math.max(50, 50 + (severityFactor * 15)));
            
            // Check if we can afford emergency workers
            if (gameState.playerStats.money >= costPerWorker || gameState.playerStats.noodles > 0) {
                return true; // We can afford emergency workers or have noodles to sell
            }
            return false; // Can't afford workers and have no noodles
        }
    }

    return true; // All other cards are playable
}
