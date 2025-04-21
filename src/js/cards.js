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
                return "The chef is horrified by your chaotic methods and leaves early!";
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
        type: "action",  // Add type for consistency
        requirements: {
            ingredients: 2,
            workers: 4  // Add missing requirement
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
    "Lasagna Layoff": {
        description: "Budget cuts force you to reduce your lasagna department.",
        requirements: null,
        statModifiers: {
            workers: -5,
            chaos: 10,
            prestige: -4
        },
        effect: (state) => {
            savePlayedCard("Lasagna Layoff");
            if (state.playerStats.workerCount > 25) {
                state.playerStats.chaos -= 6;
                return "The remaining workforce absorbs the change seamlessly!";
            }
            state.playerStats.lostWorkers += 2;
            return "The layoffs trigger an exodus of additional workers!";
        }
    },
    "Spaghetti Sorcery": {
        description: "A mystical event causes pasta to float through the air.",
        requirements: null,
        statModifiers: {
            chaos: 15,
            prestige: 9,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Spaghetti Sorcery");
            if (state.playerStats.chaosLevel > 55) {
                state.playerStats.lostWorkers += 2;
                return "Flying pasta attacks terrify workers into fleeing!";
            }
            state.playerStats.pastaPrestige += 5;
            return "The floating pasta display wows visitors and food critics!";
        }
    },
    "Automated Pasta Line": {
        description: "Efficiency so high, even the ravioli are impressed.",
        type: "upgrade",
        requirements: { prestige: 25 },
        permanentStats: {
            workerEfficiency: 0.2,     // 20% less worker loss
            ingredientGain: 0.25,    // 25% chance for extra ingredients
            chaosReduction: -0.3,      // 20% more chaos gain
        },
        statModifiers: {
            prestige: 5,
        },
        effect: (state) => {
            savePlayedCard("Automated Pasta Line");
            state.playerStats.factoryUpgrades.automation = true;
            return "The automated line hums with mechanical efficiency!";
        }
    },
    "Golden Pasta Extruder": {
        description: "Install a premium pasta-making machine that's high maintenance.",
        type: "upgrade",
        requirements: { prestige: 30 },
        permanentStats: {
            prestigeGain: 0.25,        // 25% more prestige gain
            ingredientGain: -0.15      // 15% chance to lose extra ingredient each turn
        },
        statModifiers: {
            prestige: 12,
            chaos: 5
        },
        effect: (state) => {
            savePlayedCard("Golden Pasta Extruder");
            state.playerStats.factoryUpgrades.goldenExtruder = true;
            return "The golden extruder creates pasta of legendary quality!";
        }
    },
    "Quantum Drying Room": {
        description: "Install a high-tech drying facility that reduces chaos buildup.",
        type: "upgrade",
        requirements: { prestige: 35 },
        permanentStats: {
            chaosReduction: 0.15  // 15% less chaos gain
        },
        statModifiers: {
            chaos: -15,
            prestige: 8
        },
        effect: (state) => {
            savePlayedCard("Quantum Drying Room");
            state.playerStats.factoryUpgrades.quantumDrying = true;
            return "The quantum-stabilized pasta brings order to chaos!";
        }
    },
    "Spaghetti Surgeons": {
    description: "Elite pasta medics fix flawed noodles with tweezers and drama.",
    type: "upgrade",
    requirements: { prestige: 20 },
    permanentStats: {
        prestigeGain: 0.25,       // 25% more prestige gain
        chaosReduction: -0.05,    // Slightly more chaos from delays
        ingredientGain: -0.15     // More ingredient loss from rejected pasta
    },
    statModifiers: {
        chaos: 3
    },
    effect: (state) => {
        savePlayedCard("Spaghetti Surgeons");
        state.playerStats.factoryUpgrades.qualityLab = true;
        return "No noodle too broken. No drama too small.";
    }
    },
    "Break Room": {
        description: "Build a luxurious pasta-themed break room.",
        type: "upgrade",
        requirements: { prestige: 15 },
        permanentStats: {
            workerEfficiency: 0.25  // 25% less worker loss
        },
        statModifiers: {
            workers: 5,
            prestige: 3,
            chaos: -4
        },
        effect: (state) => {
            savePlayedCard("Break Room");
            state.playerStats.factoryUpgrades.breakRoom = true;
            return "Happy workers make better pasta!";
        }
    },
    "Pasta Nursery": {
        description: "Even noodles deserve a break.",
        type: "upgrade",
        requirements: { prestige: 15 },
        permanentStats: {
            ingredientGain: 0.35,    // 25% chance for extra ingredients
        },
        statModifiers: {
            ingredients: -3,
            prestige: 4,
            chaos: 4
        },
        effect: (state) => {
            savePlayedCard("Pasta Nursery");
            state.playerStats.factoryUpgrades.pastaNursery = true;
            return "Happy pasta make better workers!";
        }
    },
    "Industrial Kitchen": {
        description: "Kitchen, But Pro.",
        type: "upgrade",
        requirements: { prestige: 22 },
        permanentStats: {
            prestigeGain: 0.2,         // 20% more prestige gain
            ingredientGain: 0.25,    // 25% chance for extra ingredients
            workerEfficiency: -0.1     // 10% less worker efficiency (equipment is complicated)
        },
        statModifiers: {
            prestige: 10,
            chaos: 6,
        },
        effect: (state) => {
            savePlayedCard("Industrial Kitchen");
            state.playerStats.factoryUpgrades.industrialKitchen = true;
            return "The new kitchen dramatically increases production capacity!";
        }
    },
    "Pasta Archives": {
        description: "Build a library of ancient pasta knowledge.",
        type: "upgrade",
        requirements: { prestige: 28 },
        permanentStats: {
            prestigeGain: 0.15,  // 15% more prestige gain
            workerEfficiency: 0.15  // 15% less worker loss
        },
        statModifiers: {
            prestige: 7,
            workers: 4
        },
        effect: (state) => {
            savePlayedCard("Pasta Archives");
            state.playerStats.factoryUpgrades.pastaArchives = true;
            return "Ancient pasta wisdom flows through your factory!";
        }
    },
    "Sentient Supply Bot": {
        description: "Install an AI-powered supply robot that occasionally malfunctions.",
        type: "upgrade",
        requirements: { prestige: 25 },
        permanentStats: {
            ingredientGain: 0.25,    // 25% chance for extra ingredients
            workerEfficiency: -0.15  // Workers are 15% less efficient (scared of the robot)
        },
        statModifiers: {
            workers: -2,
            chaos: 8
        },
        effect: (state) => {
            savePlayedCard("Sentient Supply Bot");
            state.playerStats.factoryUpgrades.supplyBot = true;
            return "The robot seems friendly... mostly.";
        }
    },
    "Ingredient Replicator": {
        description: "Because who needs to play by the rules?",
        type: "upgrade",
        requirements: { prestige: 30 },
        permanentStats: {
            ingredientGain: 0.5,     // 50% chance for extra ingredients
            chaosReduction: -0.35,   // 35% more chaos gain (unstable parallel universes)
            prestigeGain: -0.2      // 20% less prestige (customers suspicious of duplicated ingredients)
        },
        statModifiers: {
        },
        effect: (state) => {
            savePlayedCard("Ingredient Replicator");
            state.playerStats.factoryUpgrades.Replicator = true;
            return "Reality bends as ingredients multiply... concerning.";
        }
    },
    "Efficient Production Line": {
        description: "The noodles never stop. Not even to scream.",
        type: "upgrade",
        requirements: { prestige: 20 },
        permanentStats: {
            ingredientGain: 0.35,     // 20% chance for extra ingredients
            workerEfficiency: 0.2,     // 20% more worker efficiency
            prestigeGain: 0.15        // 15% more prestige gain
        },
        statModifiers: {
            workers: -2,
            ingredients: -1
        },
        productionBonus: 0.25 // 25% increase in production
    },
    "Market Expansion": {
        description: "Expand into new markets, increasing noodle prices.",
        type: "upgrade",
        requirements: { prestige: 25 },
        permanentStats: {
            prestigeGain: 0.2,        // 20% more prestige gain
            chaosReduction: -0.1      // 10% more chaos gain
        },
        statModifiers: {
            chaos: 5
        },
        priceBonus: 0.3 // 30% increase in sale price
    },
    "Quality Control": {
        description: "Clipboards out. Noodles, beware.",
        type: "upgrade",
        requirements: { prestige: 18 },
        permanentStats: {
            prestigeGain: 0.15,       // 15% more prestige gain
            workerEfficiency: -0.05   // 5% less worker efficiency
        },
        statModifiers: {
            prestige: 5,
            chaos: -3
        },
        productionBonus: 0.15, // 15% increase in production
        priceBonus: 0.15 // 15% increase in sale price
    },
    // ==== ADDING NEW CARDS BELOW ====

    "Noodle Jazz Festival": {
        description: "Local jazz musicians play improvised solos based on pasta shapes.",
        requirements: null,
        statModifiers: {
            prestige: 8,
            workers: 2,
            chaos: 3
        },
        effect: (state) => {
            savePlayedCard("Noodle Jazz Festival");
            if (state.playerStats.chaosLevel > 60) {
                state.playerStats.workers -= 1;
                return "The avant-garde pasta solos become too experimental for some workers!";
            }
            return "The smooth pasta jams boost morale and public interest!";
        }
    },

    "Pasta Rain Dance": {
        description: "Ancient ritual that summons cloudbursts of farfalle from the sky.",
        requirements: null,
        statModifiers: {
            ingredients: 6,
            chaos: 10,
            prestige: 3
        },
        effect: (state) => {
            savePlayedCard("Pasta Rain Dance");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel > 70) {
                state.playerStats.lostWorkers += 3;
                return "Workers flee as bow-tie pasta rains down with alarming velocity!";
            }
            return "Free ingredients fall from the sky in a miraculous display!";
        }
    },

    "Sentient Tortellini": {
        description: "Your stuffed pasta has developed consciousness and opinions about interior design.",
        requirements: null,
        statModifiers: {
            prestige: 12,
            chaos: 14,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Sentient Tortellini");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.prestige > 25) {
                state.playerStats.pastaPrestige += 5;
                return "The tortellini's avant-garde factory redesign attracts architecture magazines!";
            }
            return "Workers quit after being critiqued by judgmental pasta!";
        }
    },

    "Garlic Bread Rebellion": {
        description: "The side dish rises up, demanding equal treatment with the pasta.",
        requirements: { ingredients: 1 },
        statModifiers: {
            chaos: 8,
            ingredients: 3,
            prestige: 4
        },
        effect: (state) => {
            savePlayedCard("Garlic Bread Rebellion");
            if (state.playerStats.chaosLevel < 50) {
                state.playerStats.pastaPrestige += 3;
                return "The bread uprising results in a new award-winning appetizer menu!";
            }
            state.playerStats.chaos += 5;
            return "The garlic-scented revolutionaries seize control of the east kitchen!";
        }
    },

    "Noodle Noir": {
        description: "The factory is suddenly bathed in black and white, with a mysterious femme fatale asking about linguine.",
        requirements: null,
        statModifiers: {
            chaos: 9,
            prestige: 7,
            workers: 4
        },
        effect: (state) => {
            savePlayedCard("Noodle Noir");
            if (state.playerStats.ingredients < 10) {
                state.playerStats.ingredients += 2;
                return "She slips you a package before disappearing into the shadows. 'The good stuff,' she whispers.";
            }
            return "Workers are inexplicably wearing trenchcoats and speaking in hard-boiled monologues.";
        }
    },

    "Al Dente Alliance": {
        description: "Form a pact with rival pasta makers to standardize cooking times.",
        requirements: null,
        statModifiers: {
            chaos: -8,
            prestige: 9,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Al Dente Alliance");
            return "The Great Pasta Treaty is signed with a splash of olive oil!";
        }
    },

    "Macaroni Madness": {
        description: "A batch of macaroni develops a mind of its own and starts rearranging into complex patterns.",
        requirements: { ingredients: 2 },
        statModifiers: {
            chaos: 12,
            prestige: 10,
            ingredients: -2
        },
        effect: (state) => {
            savePlayedCard("Macaroni Madness");
            if (state.playerStats.pastaPrestige > 30) {
                state.playerStats.chaos -= 5;
                return "Art critics declare it a masterpiece of 'pasta modernism'!";
            }
            state.playerStats.lostWorkers += 2;
            return "Workers flee as macaroni arranges itself into unsettling facial features!";
        }
    },

    "Penne for Your Thoughts": {
        description: "A philosophical pasta debate breaks out on the factory floor.",
        requirements: null,
        statModifiers: {
            workers: -2,
            chaos: -7,
            prestige: 4
        },
        effect: (state) => {
            savePlayedCard("Penne for Your Thoughts");
            if (state.playerStats.prestige > 20) {
                state.playerStats.pastaPrestige += 3;
                return "The resulting pasta philosophy book becomes a bestseller!";
            }
            return "The existential discussion calms everyone down significantly.";
        }
    },

    "Fusilli Fusion": {
        description: "Attempt to combine spiral pasta with quantum mechanics.",
        requirements: { ingredients: 2 },
        statModifiers: {
            ingredients: 8,
            chaos: 15,
            prestige: 12
        },
        effect: (state) => {
            savePlayedCard("Fusilli Fusion");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel > 60) {
                state.playerStats.lostWorkers += 5;
                return "The pasta spirals into a miniature black hole! Workers are running for their lives!";
            }
            return "The spirals now contain infinite pasta in finite space. Physicists are baffled!";
        }
    },

    "Orzo Observatory": {
        description: "Build a telescope made entirely of tiny rice-shaped pasta.",
        requirements: { ingredients: 3 },
        statModifiers: {
            prestige: 15,
            ingredients: -3,
            chaos: 8
        },
        effect: (state) => {
            savePlayedCard("Orzo Observatory");
            if (state.playerStats.workerCount > 15) {
                state.playerStats.pastaPrestige += 5;
                return "The stars align to reveal the secret of perfect pasta timing!";
            }
            return "Workers spend hours staring at stars through pasta lenses.";
        }
    },

    "Gnocchi Gnomes": {
        description: "Tiny potato pasta creatures have appeared in the pantry!",
        requirements: null,
        statModifiers: {
            ingredients: 5,
            chaos: 7,
            workers: -1
        },
        effect: (state) => {
            savePlayedCard("Gnocchi Gnomes");
            state.playerStats.usedMagicCards = true;
            return "They're stealing ingredients, but also bringing new exotic ones!";
        }
    },

    "Pasta Police Raid": {
        description: "Authorities investigating reports of illegal pasta shapes.",
        requirements: null,
        statModifiers: {
            chaos: -10,
            prestige: -6,
            workers: -4
        },
        effect: (state) => {
            savePlayedCard("Pasta Police Raid");
            if (state.playerStats.chaosLevel > 60) {
                state.playerStats.lostWorkers += 3;
                return "Several workers are arrested for 'criminal pasta innovation'!";
            }
            return "The officers leave after a stern warning about unauthorized ravioli shapes.";
        }
    },

    "Corporate Espionage": {
        description: "Catch a spy from Big Pasta trying to steal your recipes!",
        requirements: null,
        statModifiers: {
            chaos: 11,
            prestige: 7,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Corporate Espionage");
            if (state.playerStats.workerCount > 20) {
                state.playerStats.pastaPrestige += 8;
                return "You flip the spy and get valuable industry secrets in return!";
            }
            state.playerStats.lostIngredients += 2;
            return "The spy escapes with your secret sauce formula!";
        }
    },

    "Fettuccine Forecasting": {
        description: "Predict market trends by measuring pasta elasticity.",
        requirements: null,
        statModifiers: {
            prestige: 9,
            chaos: -5,
            workers: 2
        },
        effect: (state) => {
            savePlayedCard("Fettuccine Forecasting");
            if (state.playerStats.prestige > 25) {
                state.playerStats.ingredients += 3;
                return "Your economic predictions allow perfect ingredient purchasing timing!";
            }
            return "The pasta market analysis yields moderately useful results.";
        }
    },

    "Pasta-La-Vista": {
        description: "An action star visits to film an explosive scene in your factory.",
        requirements: null,
        statModifiers: {
            prestige: 14,
            chaos: 17,
            workers: -4
        },
        effect: (state) => {
            savePlayedCard("Pasta-La-Vista");
            if (state.playerStats.chaosLevel < 50) {
                state.playerStats.pastaPrestige += 10;
                return "The controlled explosions make for an epic pasta commercial!";
            }
            state.playerStats.lostIngredients += 4;
            return "That wasn't in the script! The star accidentally blew up the real ingredients!";
        }
    },

    "Farfalle Butterfly Effect": {
        description: "A small change in the pasta recipe cascades into unpredictable consequences.",
        requirements: { ingredients: 1 },
        statModifiers: {
            ingredients: -1,
            chaos: 14
        },
        effect: (state) => {
            savePlayedCard("Farfalle Butterfly Effect");
            // Random effect based on chaos level
            if (Math.random() < 0.5) {
                state.playerStats.workerCount += 5;
                state.playerStats.pastaPrestige += 7;
                return "The tiny alteration creates the most addictive pasta ever known!";
            } else {
                state.playerStats.lostWorkers += 4;
                state.playerStats.pastaPrestige += 4;
                return "Customers report seeing visions of alternate timelines while eating your pasta!";
            }
        }
    },

    "Vermicelli Vortex": {
        description: "Thin pasta strands begin to spin, creating a hypnotic spiral.",
        requirements: null,
        statModifiers: {
            chaos: 16,
            prestige: 11,
            workers: -5
        },
        effect: (state) => {
            savePlayedCard("Vermicelli Vortex");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel < 40) {
                state.playerStats.ingredients += 5;
                return "The vortex pulls ingredients from another dimension!";
            }
            state.playerStats.lostWorkers += 2;
            return "Workers are being sucked into the pasta dimension!";
        }
    },

    "Precision Pesto": {
        description: "Implement a scientifically perfect sauce distribution system.",
        requirements: null,
        statModifiers: {
            prestige: 8,
            chaos: -9,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Precision Pesto");
            return "Each strand receives exactly 3.14159 milliliters of sauce!";
        }
    },

    "Rigatoni Ritualists": {
        description: "Workers arrange pasta tubes in ceremonial circles during night shifts.",
        requirements: null,
        statModifiers: {
            chaos: 11,
            prestige: 6,
            ingredients: 2
        },
        effect: (state) => {
            savePlayedCard("Rigatoni Ritualists");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel > 70) {
                state.playerStats.lostWorkers += 3;
                return "The ritual succeeds, opening a portal to the Pasta Realm! Workers flee in terror!";
            }
            return "The strange ceremonies seem to improve pasta quality through unknown means.";
        }
    },

    "Sauce Séance": {
        description: "Contact the spirits of master pasta chefs from beyond the grave.",
        requirements: null,
        statModifiers: {
            prestige: 13,
            chaos: 9,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Sauce Séance");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel < 50) {
                state.playerStats.pastaPrestige += 7;
                return "The ghost of Nonna reveals her secret sauce recipe!";
            }
            state.playerStats.lostWorkers += 2;
            return "Workers flee as possessed pasta floats through the air!";
        }
    },

    "Tortellini Time Machine": {
        description: "The ring-shaped pasta begins to alter the flow of time in the factory.",
        requirements: { ingredients: 2 },
        statModifiers: {
            ingredients: -2,
            chaos: 12,
            prestige: 10
        },
        effect: (state) => {
            savePlayedCard("Tortellini Time Machine");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel < 40) {
                state.playerStats.ingredients += 4;
                return "Workers harvest ingredients that haven't even been planted yet!";
            }
            state.playerStats.lostWorkers += 3;
            return "Workers age backwards until they're toddlers! Child labor laws violated!";
        }
    },

    "Lasagna Labyrinth": {
        description: "The pasta layers fold into impossible geometries, creating a maze.",
        requirements: { ingredients: 3 },
        statModifiers: {
            ingredients: -3,
            chaos: 15,
            prestige: 8
        },
        effect: (state) => {
            savePlayedCard("Lasagna Labyrinth");
            if (state.playerStats.workerCount > 25) {
                state.playerStats.pastaPrestige += 6;
                return "Tour groups pay to get lost in your mind-bending pasta architecture!";
            }
            state.playerStats.lostWorkers += 4;
            return "Workers are getting lost in the non-Euclidean pasta dimensions!";
        }
    },

    "Cavatappi Conundrum": {
        description: "The corkscrew pasta has twisted itself into a philosophical puzzle.",
        requirements: null,
        statModifiers: {
            prestige: 7,
            chaos: 6,
            workers: 3
        },
        effect: (state) => {
            savePlayedCard("Cavatappi Conundrum");
            if (state.playerStats.pastaPrestige > 20) {
                state.playerStats.pastaPrestige += 4;
                return "Philosophy professors visit to study the pasta that questions existence!";
            }
            return "Workers spend hours contemplating the meaning hidden in the twisted pasta.";
        }
    },

    "Spaghetti Western": {
        description: "A mysterious stranger in a poncho arrives, challenging workers to pasta duels.",
        requirements: null,
        statModifiers: {
            prestige: 9,
            chaos: 7,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Spaghetti Western");
            if (state.playerStats.workerCount > 20) {
                state.playerStats.pastaPrestige += 5;
                state.playerStats.workerCount += 2;
                return "Your champion defeats the stranger, who joins your workforce in respect!";
            }
            return "The stranger twirls pasta faster than any worker you've ever seen!";
        }
    },

    "Pasta Paparazzi": {
        description: "Celebrity gossip magazines discover your factory's unusual methods.",
        requirements: null,
        statModifiers: {
            prestige: 11,
            chaos: 5,
            workers: 4
        },
        effect: (state) => {
            savePlayedCard("Pasta Paparazzi");
            if (state.playerStats.chaosLevel > 50) {
                state.playerStats.pastaPrestige += 8;
                return "'CHAOS NOODLES: The Factory That Defies Physics!' - sales skyrocket!";
            }
            return "The publicity brings in curious new workers eager to be part of pasta history!";
        }
    },

    "Ditalini Diamond Heist": {
        description: "Tiny pasta tubes used to pull off the perfect jewel theft.",
        requirements: null,
        statModifiers: {
            chaos: 13,
            prestige: -7,
            ingredients: 7
        },
        effect: (state) => {
            savePlayedCard("Ditalini Diamond Heist");
            if (state.playerStats.chaosLevel < 30) {
                state.playerStats.pastaPrestige += 5;
                return "The stolen gems are fake! But the publicity is real—and spectacular!";
            }
            state.playerStats.lostWorkers += 2;
            return "The police arrive with questions about pasta-based criminal activity!";
        }
    },

    "Cannelloni Catastrophe": {
        description: "The tube pasta exploded when it came in contact with an experimental sauce.",
        requirements: { ingredients: 2 },
        statModifiers: {
            ingredients: -2,
            chaos: 14,
            workers: -4
        },
        effect: (state) => {
            savePlayedCard("Cannelloni Catastrophe");
            if (state.playerStats.workerCount > 20) {
                state.playerStats.pastaPrestige += 3;
                return "Quick-thinking workers contain the explosion and salvage the recipe!";
            }
            state.playerStats.lostIngredients += 3;
            return "The Pasta Patrol quarantines your factory pending investigation!";
        }
    },

    "Linguine Lore": {
        description: "Ancient pasta scrolls reveal forgotten noodle wisdom.",
        requirements: null,
        statModifiers: {
            prestige: 12,
            chaos: -5,
            workers: 3
        },
        effect: (state) => {
            savePlayedCard("Linguine Lore");
            if (state.playerStats.pastaPrestige > 25) {
                state.playerStats.ingredients += 3;
                return "The scrolls reveal ancient sources of rare ingredients!";
            }
            return "Workers study the pasta wisdom, reaching noodle enlightenment.";
        }
    },

    "Capellini Copyright": {
        description: "A legal battle erupts over who owns the rights to 'angel hair' pasta.",
        requirements: null,
        statModifiers: {
            prestige: -5,
            chaos: 8,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Capellini Copyright");
            if (state.playerStats.pastaPrestige > 30) {
                state.playerStats.pastaPrestige += 12;
                return "You win the case and become the sole legal producer of angel hair pasta!";
            }
            state.playerStats.lostWorkers += 1;
            return "Legal fees mount as the copyright case becomes increasingly complex.";
        }
    },
    
    "Manicotti Meteor": {
        description: "A mysterious pasta-shaped object crashes behind the factory.",
        requirements: null,
        statModifiers: {
            ingredients: 7,
            chaos: 13,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Manicotti Meteor");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel > 60) {
                state.playerStats.lostWorkers += 4;
                return "The meteor hatches, releasing pasta aliens that abduct your workers!";
            }
            return "The meteor contains exotic alien ingredients that enhance your pasta!";
        }
    },

    "Ravioli Rebellion": {
        description: "Workers demand more creative freedom with their pasta designs.",
        requirements: null,
        statModifiers: {
            workers: 5,
            chaos: 6,
            prestige: -3
        },
        effect: (state) => {
            savePlayedCard("Ravioli Rebellion");
            if (state.playerStats.pastaPrestige > 20) {
                state.playerStats.pastaPrestige += 8;
                return "The creative freedom results in award-winning pasta innovations!";
            }
            return "Workers are making heart-shaped ravioli and pasta shaped like little ducks.";
        }
    },

    "Pappardelle Pride": {
        description: "Host a festival celebrating wide noodle diversity and inclusion.",
        requirements: { ingredients: 2 },
        statModifiers: {
            prestige: 10,
            workers: 6,
            ingredients: -2
        },
        effect: (state) => {
            savePlayedCard("Pappardelle Pride");
            if (state.playerStats.chaos < 40) {
                state.playerStats.pastaPrestige += 5;
                return "The inclusive atmosphere attracts talented pasta artisans from around the world!";
            }
            return "Workers from all pasta backgrounds come together in noodle solidarity!";
        }
    },

    "Bucatini Blackout": {
        description: "The hollow spaghetti absorbs all light in a 50-foot radius.",
        requirements: null,
        statModifiers: {
            chaos: 16,
            prestige: 8,
            workers: -5
        },
        effect: (state) => {
            savePlayedCard("Bucatini Blackout");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel < 50) {
                state.playerStats.pastaPrestige += 7;
                return "Scientists flock to study the light-absorbing pasta phenomenon!";
            }
            state.playerStats.lostWorkers += 3;
            return "Workers stumble around in the darkness, knocking over valuable equipment!";
        }
    },

    "Rotini Rotation": {
        description: "The spiral pasta starts spinning on its own, generating electricity.",
        requirements: null,
        statModifiers: {
            prestige: 9,
            chaos: 7,
            workers: 3
        },
        effect: (state) => {
            savePlayedCard("Rotini Rotation");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.prestige > 25) {
                state.playerStats.chaos -= 5;
                return "Your pasta-powered factory becomes a model of sustainable energy!";
            }
            return "The perpetual spiral motion provides free electricity for the factory!";
        }
    },

    "Pasta Pyramid Scheme": {
        description: "A suspiciously enthusiastic investor suggests a 'multi-level pasta marketing' approach.",
        requirements: null,
        statModifiers: {
            workers: 8,
            chaos: 9,
            prestige: -8
        },
        effect: (state) => {
            savePlayedCard("Pasta Pyramid Scheme");
            if (state.playerStats.chaosLevel < 30) {
                state.playerStats.pastaPrestige += 15;
                return "Against all odds, the ridiculous business model becomes wildly successful!";
            }
            state.playerStats.workerCount -= 4;
            state.playerStats.lostWorkers += 4;
            return "Workers quit after realizing they've been recruited into selling pasta door-to-door!";
        }
    },

    "Strozzapreti Curse": {
        description: "Legend says this 'priest-strangler' pasta brings bad luck to clergy.",
        requirements: null,
        statModifiers: {
            chaos: 12,
            prestige: 13,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Strozzapreti Curse");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel > 60) {
                state.playerStats.pastaPrestige += 5;
                return "Local exorcists declare your factory 'deliciously haunted'!";
            }
            return "Religious leaders avoid your factory, but occult tourists flock in!";
        }
    },

    "Caffeine Crisis": {
        description: "Workers exhausted after pulling an all-night pasta emergency.",
        requirements: null,
        statModifiers: {
            chaos: 11,
            workers: -6,
            prestige: -5
        },
        effect: (state) => {
            savePlayedCard("Caffeine Crisis");
            if (state.playerStats.ingredients > 10) {
                state.playerStats.ingredients -= 2;
                state.playerStats.workers += 10;
                return "You sacrifice precious ingredients to brew super-coffee! Workers revitalized!";
            }
            return "Workers shamble around like pasta zombies, desperately seeking espresso!";
        }
    },

    "Orecchiette Oracle": {
        description: "The ear-shaped pasta allows you to hear the whispers of future pasta trends.",
        requirements: null,
        statModifiers: {
            prestige: 11,
            chaos: 5,
            ingredients: 3
        },
        effect: (state) => {
            savePlayedCard("Orecchiette Oracle");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel < 40) {
                state.playerStats.pastaPrestige += 6;
                return "Your prophetic pasta predictions place you years ahead of competitors!";
            }
            return "The whispers from beyond are concerning but profitable!";
        }
    },

    "Conchiglie Crisis": {
        description: "The shell pasta has trapped tiny sea creatures inside!",
        requirements: null,
        statModifiers: {
            chaos: 13,
            prestige: 7,
            workers: -3
        },
        effect: (state) => {
            savePlayedCard("Conchiglie Crisis");
            if (state.playerStats.ingredients < 10) {
                state.playerStats.ingredients += 4;
                return "The surprise seafood addition becomes your signature ingredient!";
            }
            state.playerStats.lostWorkers += 2;
            return "Health inspectors arrive as customers report 'singing pasta'!";
        }
    },

    "Tagliatelle Talent Show": {
        description: "Workers compete to create the most artistic pasta ribbons.",
        requirements: { ingredients: 1 },
        statModifiers: {
            prestige: 8,
            workers: 4,
            ingredients: -1
        },
        effect: (state) => {
            savePlayedCard("Tagliatelle Talent Show");
            if (state.playerStats.workerCount > 15) {
                state.playerStats.pastaPrestige += 4;
                return "The competition discovers a pasta prodigy who can cut perfect ribbons blindfolded!";
            }
            return "The friendly competition boosts morale and attracts artistic types to your workforce!";
        }
    },

    "Trofie Tribulation": {
        description: "The twisted pasta gets tangled in the machinery.",
        requirements: null,
        statModifiers: {
            chaos: 14,
            workers: -4,
            prestige: -6
        },
        effect: (state) => {
            savePlayedCard("Trofie Tribulation");
            if (state.playerStats.chaosLevel < 50) {
                state.playerStats.pastaPrestige += 10;
                state.playerStats.ingredients += 2;
                return "Engineers convert the tangled mess into a revolutionary new pasta shape!";
            }
            state.playerStats.lostIngredients += 2;
            return "Production halts while workers untangle the pasta disaster!";
        }
    },

    "Campanelle Choir": {
        description: "The bell-shaped pasta begins to ring with ethereal melodies.",
        requirements: null,
        statModifiers: {
            prestige: 13,
            chaos: 8,
            workers: 2
        },
        effect: (state) => {
            savePlayedCard("Campanelle Choir");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.prestige > 30) {
                state.playerStats.pastaPrestige += 6;
                return "Music critics declare your factory 'the eighth wonder of the culinary world'!";
            }
            return "The harmonious pasta music soothes workers into a productive trance!";
        }
    },

    "Gemelli Genetics": {
        description: "Experiment with twin pasta strands that share a mystical DNA bond.",
        requirements: { ingredients: 2 },
        statModifiers: {
            ingredients: 4,
            chaos: 9,
            prestige: 6,
            workers: -1
        },
        effect: (state) => {
            savePlayedCard("Gemelli Genetics");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel > 50) {
                state.playerStats.lostWorkers += 2;
                return "The pasta twins develop telepathic abilities and recruit workers to their hive mind!";
            }
            return "The synchronized pasta strands never break during cooking—a scientific breakthrough!";
        }
    },

    "Radiatori Revolution": {
        description: "The radiator-shaped pasta generates unprecedented amounts of heat.",
        requirements: null,
        statModifiers: {
            chaos: 15,
            prestige: 9,
            workers: -5
        },
        effect: (state) => {
            savePlayedCard("Radiatori Revolution");
            if (state.playerStats.chaosLevel < 40) {
                state.playerStats.pastaPrestige += 7;
                return "Your factory's free thermal energy system makes financial headlines!";
            }
            state.playerStats.lostWorkers += 3;
            return "Workers collapse from heat exhaustion as temperatures reach pasta-melting levels!";
        }
    },

    "Anellini Anomaly": {
        description: "The tiny ring pasta creates miniature wormholes.",
        requirements: null,
        statModifiers: {
            chaos: 17,
            prestige: 14,
            workers: -6
        },
        effect: (state) => {
            savePlayedCard("Anellini Anomaly");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.ingredients < 5) {
                state.playerStats.ingredients += 5;
                return "Workers harvest ingredients from parallel dimensions through pasta portals!";
            }
            state.playerStats.lostWorkers += 4;
            return "Workers keep disappearing through microscopic pasta portals!";
        }
    },

    "Mezzelune Madness": {
        description: "The half-moon pasta predicts workers' futures with disturbing accuracy.",
        requirements: null,
        statModifiers: {
            workers: -3,
            chaos: 12,
            prestige: 11
        },
        effect: (state) => {
            savePlayedCard("Mezzelune Madness");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.pastaPrestige > 25) {
                state.playerStats.workers += 6;
                return "Fortunetellers flock to your factory, offering free labor for pasta prophecies!";
            }
            state.playerStats.lostWorkers += 3;
            return "Workers resign after pasta predicts 'death by ravioli' in their futures!";
        }
    },
    
    "Catastrophic Cappelletti": {
        description: "The hat-shaped pasta has developed an extreme caffeine addiction.",
        requirements: null,
        statModifiers: {
            chaos: 18,
            prestige: 8,
            workers: 5
        },
        effect: (state) => {
            savePlayedCard("Catastrophic Cappelletti");
            if (state.playerStats.chaosLevel > 70) {
                state.playerStats.lostWorkers += 4;
                return "The hyperactive pasta hats are bouncing off walls and terrorizing workers!";
            }
            return "The energetic pasta increases production speed by 400%! Workers struggle to keep up!";
        }
    },

    "Pasta Weather System": {
        description: "Install climate control that maintains perfect pasta-making conditions.",
        requirements: null,
        statModifiers: {
            chaos: -12,
            workers: 3,
            prestige: 6
        },
        effect: (state) => {
            savePlayedCard("Pasta Weather System");
            return "The factory now maintains the exact temperature and humidity of a Tuscan summer!";
        }
    },

    "Tortelloni Telepathy": {
        description: "The stuffed pasta rings transmit thoughts between workers.",
        requirements: { ingredients: 1 },
        statModifiers: {
            ingredients: -1,
            chaos: 10,
            workers: 7
        },
        effect: (state) => {
            savePlayedCard("Tortelloni Telepathy");
            state.playerStats.usedMagicCards = true;
            if (state.playerStats.chaosLevel < 55) {
                state.playerStats.pastaPrestige += 5;
                return "The mind-linked workers achieve unprecedented production synergy!";
            }
            state.playerStats.lostWorkers += 2;
            return "Workers quit after discovering their pasta-induced shared dreams!";
        }
    },

    "Malloreddus Mystery": {
        description: "The Sardinian gnocchi contains microscopic riddles.",
        requirements: null,
        statModifiers: {
            prestige: 7,
            chaos: 6,
            workers: -2
        },
        effect: (state) => {
            savePlayedCard("Malloreddus Mystery");
            if (state.playerStats.pastaPrestige > 20) {
                state.playerStats.ingredients += 3;
                return "Solving the pasta puzzles reveals hidden caches of premium ingredients!";
            }
            return "Cryptographers flock to your factory to decode the pasta riddles!";
        }
    },

    "Symbolic Sacchettini": {
        description: "The little sack pasta contains secret messages in every fold.",
        requirements: null,
        statModifiers: {
            prestige: 10,
            chaos: 9,
            ingredients: 2
        },
        effect: (state) => {
            savePlayedCard("Symbolic Sacchettini");
            if (state.playerStats.chaosLevel > 60) {
                state.playerStats.chaos += 5;
                return "The pasta messages appear to be instructions from another dimension!";
            }
            return "Customers delight in finding fortune-cookie-style wisdom in their pasta!";
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

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'smoke-particle';
        const randomOffsetX = (Math.random() - 0.5) * rect.width * 0.8;
        const randomOffsetY = (Math.random() - 0.5) * rect.height * 0.8;

        particle.style.left = `${centerX + randomOffsetX}px`;
        particle.style.top = `${centerY + randomOffsetY}px`;

        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - 50;

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        document.body.appendChild(particle);

        requestAnimationFrame(() => {
            particle.style.animation = `smoke 0.8s ease-out forwards`;
        });

        setTimeout(() => particle.remove(), 800);
    }
}

export function getRandomCard() {
    const selectedCard = document.querySelector('.card[data-selected="true"]');
    if (selectedCard) {
        selectedCard.classList.add('disappearing');

        createSmokeEffect(selectedCard);

        requestAnimationFrame(() => {
            selectedCard.style.opacity = '0';
            selectedCard.style.transform = 'scale(0.5) translateY(-20px)';
        });

        return new Promise(resolve => {
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
                });
                resolve(cardNames[Math.floor(Math.random() * cardNames.length)]);
            }, 400);
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
        workerCount: Math.floor(Math.random() * 6) + 15
    };
};
