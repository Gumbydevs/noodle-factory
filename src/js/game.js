import { CARDS, getRandomCard, applyStatModifiers, applyUpgradeEffects, lastDrawnCards, clearLastDrawnCards } from './cards.js';
import events from './events.js';
import { gameState, updateResource, resetGameState, updateChaosEffects, saveGameState, loadGameState, clearSavedGame, hasSavedGame } from './state.js';
import { ACHIEVEMENTS, checkAchievements, getUnlockedAchievements, resetAchievements } from './achievements.js';
import { updateHighScore, getHighScore } from './highscore.js';
import { triggerNoodleRoll, handleCardClick, handleUnselectedCards, resetCardState, addCardHoverEffects } from './animation.js';
import { gameSounds } from '../audio.js'; // Note the .js extension
import { AssetLoader } from './assetLoader.js';
import './noodleAppendages.js'; // Import noodle appendages system

// Remove the direct import of musicLoops - we'll load dynamically based on selection

const SITUATIONS = [
    "The factory floor hums with the sound of pasta machines.",
    "Steam clouds drift between the massive industrial vats.",
    "Noodles of various shapes snake through the conveyor belts.",
    "The air is thick with the aroma of fresh pasta.",
    "Workers bustle between the towering vats of boiling water.",
    `A mysterious fog rolls out from beneath Vat ${Math.floor(Math.random() * 12) + 1}.`,
    "The ancient pasta spirits demand their tribute.",
    "The factory's ancient machinery groans ominously.",
    "Shadows dance between the steam vents.",
    "Something stirs in the depths of the sauce reservoir.",
    "Flour explosions - again! Third time this week!",
    "Spaghetti tangles everywhere. Seriously, EVERYWHERE.",
    "The vat timer dings like crazy. No one knows how to stop it.",
    "A worker fell asleep in a pile of ravioli.",
    "Someone put googly eyes on all the equipment. No one's confessing.",
    "The pasta-making robot is doing the macarena. Not good.",
    `Someone wrote "HELP ME" in sauce on Vat ${Math.floor(Math.random() * 12) + 1}.`,
    "The sauce is extra red today. Suspiciously red...",
    "Three mice are wearing tiny chef hats. Not even the weirdest thing today.",
    "Pasta shapes that shouldn't exist are coming out of the machine.",
    "The boss left a cryptic note: 'Don't turn off Vat 7. EVER.'",
    "Someone's pet goldfish is swimming in the ravioli filling.",
    "The lasagna sheets are stuck to the ceiling again.",
    "That weird pasta smell is back. Smells like... feet?",
    "Factory radio keeps switching to Italian opera by itself.",
    "The night shift left all the pasta tied in knots. Literally.",
    "Tuesday's pasta batch grew hair overnight. Green hair.",
    "Rats are stealing noodles to build a fort in the corner.",
    "The emergency pasta button got pressed.",
    "Coffee machine making pasta, pasta machine making coffee.",
    "Conveyor belt running backwards. Pasta going uphill!",
    "Ingredient delivery guy dropped off mystery meat. Meatballs???",
    "The factory floor is extra slippery today. Olive oil incident.",
    "Power flickers every time someone says 'al dente'.",
    "The employee of the month photo winks at you.",
    "Yesterday's leftover pasta formed a small pyramid overnight.",
    "Warning: Excessive dancing near the pasta vats detected.",
    "Fettuccine keeps spelling out rude words on the drying rack.",
    "Health inspector scheduled for today. Hide the living noodles!",
    "Vending machine dispensing uncooked pasta instead of snacks."
];

const TOOLTIPS = [
    "Some say keeping chaos at exactly 50% leads to... interesting developments.",
    "High prestige pasta attracts more prestigious opportunities...",
    "The ancient scrolls mention something about surviving three days at maximum chaos.",
    "Workers whisper about hidden upgrades requiring specific achievements.",
    "Legend speaks of a worker who maintained perfect efficiency through chaos.",
    "The old maintenance manual suggests patterns in the chaos levels.",
    "Factory veterans claim certain card combinations trigger special events.",
    "Sometimes losing a few ingredients leads to unexpected discoveries.",
    "Rumor has it the pasta archives hold secrets about managing chaos.",
    "An old note mentions 'predictable chaos' every few turns...",
    "The employee handbook has a torn page about 'prestigeous timing'.",
    "Some workers swear the factory changes behavior at specific prestige levels.",
    "A plus sign (+) generally means a positive effect for your factory.",
    "A plus sign (+) usually means more of something.",
    "A minus sign (-) means less of something.",
    "The number of plus (+) or minus signs indicates the strength of the effect.",
    "The minus sign (-) usually indicates a reduction.",
    "Mysterious formulas on the wall hint at optimal worker-to-chaos ratios.",
    "The suggestion box contains notes about 'chaos-prestige synergy'.",
    "Factory elders speak of special events triggered by perfect timing.",
    "Ancient pasta wisdom suggests balance between growth and stability.",
    "The factory's oldest machines seem to respond to specific resource levels.",
    "Keeping ingredients above certain thresholds might prevent... incidents.",
    "Scattered research notes mention experiments with controlled chaos.",
    "The night shift reports strange patterns in resource consumption.",
    "Ancient factory wisdom speaks of surviving three cycles in pure chaos...",
    "Some managers swear recycling upgrades releases stabilizing energies.",
    "Factory records mention emergency protocols involving upgrade dismantling.",
    "Whispers in the break room suggest upgrades can be sacrificed for control.",
    "Old maintenance logs hint at a three-turn threshold for chaos containment.",
    "Factory veterans talk about 'trading permanence for immediate relief'.",
    "The employee manual's forbidden chapter mentions surviving maximum chaos.",
    "Scrapped upgrades seem to have a calming effect on the factory.",
    "Emergency procedures suggest controlled disposal of factory improvements.",
    "Stories tell of managers who danced with pure chaos for three shifts..."
];

class Game {
    constructor() {
        // Add static reference to game instance
        window.gameInstance = this;

        // Initialize isGameStarted as false - we'll set it properly when actually starting/loading a game
        this.isGameStarted = false;

        // Add click cooldown tracking
        this.lastCardPlayTime = 0;
        this.clickCooldown = 300; // Reduced cooldown to 300ms for more responsive feel

        // Add message queue system
        this.messageQueue = [];
        this.messageDisplayTime = 3000; // 3 seconds per message
        this.isDisplayingMessage = false;        // Add message history storage
        this.messageHistory = [];
        this.maxMessageHistory = 50; // Store the 50 most recent messages
        
        // Initialize noodle appendages system
        if (window.noodleAppendages && window.noodleAppendages.start) {
            window.noodleAppendages.start();
        }
        
        // Add emergency message tracking
        this._emergencyEffectMessage = null;
        this._emergencyMessageTimeout = null;
        this._emergencyMessageDisplayTime = 4000; // Show emergency messages longer (4 seconds)

        // Add pause state tracking
        this.isPaused = false;

        // Add emergency pasta sale cooldown tracking
        this.emergencySaleCooldown = 0;

        this.state = {
            playerStats: {
                pastaPrestige: 0,
                chaosLevel: 0,
                ingredients: Math.floor(Math.random() * 3) + 3,
                workerCount: Math.floor(Math.random() * 4) + 8,
                money: 1000, // Starting with $1000
                noodles: 0, // Starting with no noodles
                noodleProductionRate: 1, // Base production rate
                noodleSalePrice: 5, // Base sale price
                lostWorkers: 0,
                lostIngredients: 0,                chaosSteadyTurns: 0,
                highChaosStreakTurns: 0,
                chaosReductionInOneTurn: 0,                chaosEventsTriggered: 0,
                cardsPlayedWithoutChaos: 0,
                magicCardsPlayed: 0,                scienceCardsPlayed: 0,
                edgeOfTomorrowTurns: 0,
                nearMaxChaosConsecutiveTurns: 0,
                balancedStatsTurns: 0,
                turnsAtMaxChaos: 0,
                hadMaxChaos: false,
                usedMagicCards: false,
                survivedStrikes: 0,
                strikeDeaths: 0,
                perfectCooks: 0,
                highestPrestigeDish: 0,
                factoryUpgrades: {},
                prestigeGainRate: 1,
                chaosGainRate: 1,
                workerLossRate: 1,
                highestSingleSale: 0,
                powerOutage: 0 // Add power outage tracking
            }
        };
        this.isGameOver = false;
        this.turn = 0;
        this.achievements = new Set(getUnlockedAchievements()); // Initialize with saved achievements
        this.unlocks = {
            tier1: false,
            tier2: false,
            tier3: false
        };

        this.lightsStatus = new Array(11).fill('off'); // Keep the array but don't create lights yet

        // Add ambient glow classes - only for game messages and stats
        document.getElementById('game-messages')?.classList.add('light-glow');
        document.getElementById('stats')?.classList.add('light-glow');

        // Hide factory lights if they exist
        document.querySelector('#factory-lights')?.classList.add('hidden');

        // Clear any existing chaos effects
        document.body.classList.remove('chaos-level-1', 'chaos-level-2', 'chaos-level-3', 'chaos-level-max', 'chaos-noise');

        // Create CRT overlay if it doesn't exist
        if (!document.querySelector('.crt-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'crt-overlay';
            document.body.appendChild(overlay);
        }

        // Create upgrade container if it doesn't exist
        if (!document.querySelector('.upgrades-container')) {
            const upgradesContainer = document.createElement('div');
            upgradesContainer.className = 'upgrades-container';
            upgradesContainer.innerHTML = '<div class="upgrades-grid"></div>'; // Removed the h3 heading
            document.getElementById('game-container').appendChild(upgradesContainer);
        }

        // Show game container properly
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.display = 'block';
            gameContainer.style.opacity = '0';
            requestAnimationFrame(() => {
                gameContainer.style.transition = 'opacity 0.5s ease-out';
                gameContainer.style.opacity = '1';
            });
        }

        // Initialize card animations
        document.querySelectorAll('.card').forEach(card => {
            this.initializeCardAnimations(card);
        });

        // Initial display update
        this.updateInitialDisplay();

        // Only show start/continue buttons if game hasn't started
        if (!this.isGameStarted) {
            this.updateStartScreenButtons();
        }

        // Hide cards initially
        this.hideCards();
        
        // Show start button
        const startButton = document.getElementById('start-game');
        if (startButton) {
            startButton.classList.remove('hidden');
        }        // Add initial message
        const messageBox = document.getElementById('game-messages');
        if (messageBox) {
            messageBox.textContent = "Click below to start managing your Noodle Factory!";
            messageBox.classList.remove('feedback');
            messageBox.classList.add('situation');
        }

        // Setup message history handlers
        this.setupMessageHistoryHandlers();

        // Setup help button
        this.setupHelpButton();
    }

    initializeLights() {
        const lightsContainer = document.querySelector('.lights-container');
        if (!lightsContainer) return;

        // Clear existing lights
        for (let i = 0; i < 11; i++) {
            const light = document.createElement('div');
            light.className = 'light-bulb off';
            lightsContainer.appendChild(light);
        }

        // Add emergency pasta button if not already present
        const noodlesItem = document.querySelector('.resource-item:has(.noodles-color)');
        if (noodlesItem && !document.querySelector('.emergency-pasta-button')) {
            const emergencyButton = document.createElement('button');
            emergencyButton.className = 'emergency-pasta-button';
            emergencyButton.innerHTML = '<span>!</span>';
            emergencyButton.title = 'Emergency Pasta Button';
            noodlesItem.appendChild(emergencyButton);
            
            // Add click event listener
            emergencyButton.addEventListener('click', () => this.showEmergencyPastaModal());
        }

        this.updateLights();
    }

    countActiveLights(lights) {
        if (!lights || !lights.length) return 0;
        return Array.from(lights).filter(light => 
            light.classList.contains('on') || 
            light.classList.contains('flicker')
        ).length;
    }

    updateLights() {
        const lights = document.querySelectorAll('.light-bulb');
        if (!lights.length) return;

        const stats = this.state.playerStats;
        
        // Check if there's a power outage in effect
        if (stats.powerOutage > 0) {
            // During power outage, all lights are off
            lights.forEach(light => {
                light.className = 'light-bulb off';
            });
            
            // Store the current lights status for when power returns
            this.lightsStatusBeforeOutage = this.lightsStatus || new Array(lights.length).fill('off');
            
            // Apply darkness effect even during power outage
            this.applyLightingEffects(0); // 0 active lights
            return;
        }
        
        const chaosLevel = stats.chaosLevel;
        const ingredientLevel = stats.ingredients;
        const prestigeLevel = stats.pastaPrestige;
        const moneyLevel = stats.money;

        // Calculate how many lights should be on based on resources
        const totalLights = lights.length;
        let onLights = Math.floor((ingredientLevel / 10) * totalLights); // Scale with ingredients
        
        // Add lights based on prestige
        onLights += Math.floor((prestigeLevel / 50) * (totalLights / 2)); // Prestige adds up to half the lights

        // Money affects lighting - if below 100, reduce lights
        if (moneyLevel < 100) {
            const moneyFactor = Math.max(0.2, moneyLevel / 100); // Never go below 20% of current lights
            onLights = Math.floor(onLights * moneyFactor);
        }

        // Special case for first turn - ensure minimum lights but don't dim the screen
        if (this.turn === 1) {
            onLights = Math.max(3, onLights); // Minimum 3 lights on first turn
        }

        // Ensure minimum of 2 lights and maximum of total lights
        onLights = Math.max(2, Math.min(totalLights, onLights));

        // Randomly flicker lights based on chaos
        const flickerChance = Math.min(chaosLevel / 200, 0.5); // Max 50% chance per light

        // Update each light
        lights.forEach((light, index) => {
            light.className = 'light-bulb';
            
            if (index < onLights) {
                // Light should be on, but may flicker based on chaos
                if (Math.random() < flickerChance) {
                    light.classList.add('flicker');
                } else {
                    light.classList.add('on');
                }
            } else if (index < onLights + 2 && onLights > 3) {
                // Transition zone - dim lights, only if we have more than 3 lights on
                light.classList.add('dim');
            } else {
                // Remaining lights off
                light.classList.add('off');
            }
        });

        // Save current lights status
        this.lightsStatus = Array.from(lights).map(light => {
            if (light.classList.contains('on')) return 'on';
            if (light.classList.contains('flicker')) return 'flicker';
            if (light.classList.contains('dim')) return 'dim';
            return 'off';
        });

        // Update game effects based on lights
        this.applyLightingEffects(this.countActiveLights(lights));
    }

    applyLightingEffects(activeLights) {
        const gameContainer = document.getElementById('game-container');
        const totalLights = 11;
        const lightRatio = activeLights / totalLights;
        const stats = this.state.playerStats;

        // Check for power outage - apply maximum darkness effect
        if (stats.powerOutage > 0) {
            // During power outage, apply stronger darkness effect
            gameContainer.style.filter = 'brightness(0.5)'; // Very dark
            document.querySelectorAll('.light-glow').forEach(el => {
                el.style.setProperty('--glow-intensity', '0.5'); // Minimal glow
            });
            
            // Only show the message on the first call during outage, not every frame
            if (!this._powerOutageMessageShown) {
                this.showEffectMessage("The factory is in complete darkness due to the power outage!");
                this._powerOutageMessageShown = true;
            }
            return;
        } else {
            // Reset the message flag when power is restored
            this._powerOutageMessageShown = false;
        }

        // Don't apply heavy dimming on first turn
        if (this.turn === 1) {
            gameContainer.style.filter = 'brightness(0.9)';
            document.querySelectorAll('.light-glow').forEach(el => {
                el.style.setProperty('--glow-intensity', '1.2');
            });
            return;
        }

        // Calculate screen darkness based only on lighting-related factors
        let darknessLevel = 1;

        // Money factor - significant darkness when below starting money
        if (stats.money < 100) {
            darknessLevel *= Math.max(0.7, stats.money / 100);
            
            if (lightRatio < 0.4) {
                this.showEffectMessage("The factory's lights flicker weakly. They need money to stay on...");
            }
        }

        // Light ratio factor
        if (lightRatio < 0.3) {
            darknessLevel *= 0.8;
        } else if (lightRatio < 0.6) {
            darknessLevel *= 0.9;
        }
    }

    initializeCardAnimations(card) {
        // Delegate to the centralized animation system
        addCardHoverEffects(card);
    }

    updateStartScreenButtons() {
        const startButton = document.getElementById('start-game');
        if (!startButton || this.isGameStarted) return;

        const hasSave = hasSavedGame();
        
        // Update start button text
        startButton.textContent = 'Start New Run';
        
        // Create or update continue button
        let continueButton = document.getElementById('continue-game');
        if (hasSave) {
            if (!continueButton) {
                continueButton = document.createElement('button');
                continueButton.id = 'continue-game';
                continueButton.className = 'button primary';
                continueButton.textContent = 'Continue';
                startButton.parentNode.insertBefore(continueButton, startButton.nextSibling);
                
                // Add continue button handler
                continueButton.addEventListener('click', () => this.loadGame());
            }
        } else if (continueButton) {
            continueButton.remove();
        }
    }

    updateInitialDisplay() {
        document.getElementById('prestige').textContent = '0';
        document.getElementById('chaos').textContent = '0';
        document.getElementById('ingredients').textContent = '0';
        document.getElementById('energy').textContent = '0';
        document.getElementById('turn').textContent = '0';

        // Add resources row to ingredients section if it doesn't exist
        const ingredientsStat = document.querySelector('.stat:nth-child(3)');
        if (ingredientsStat && !ingredientsStat.querySelector('.resources-row')) {
            const resourcesRow = document.createElement('div');
            resourcesRow.className = 'resources-row';
            resourcesRow.innerHTML = `
                <span class="resource-item">
                    <span class="resource-icon">💰</span>
                    <span id="money-stat" class="resource-value money-color">$1000</span>
                </span>
                <span class="resource-item">
                    <span class="resource-icon">🍜</span>
                    <span id="noodles-stat" class="resource-value noodles-color">0</span>
                </span>
            `;
            ingredientsStat.appendChild(resourcesRow);
        }

        // Set all progress bars to 0%
        document.getElementById('prestige-progress').style.width = '0%';
        document.getElementById('chaos-progress').style.width = '0%';
        document.getElementById('ingredients-progress').style.width = '0%';
        document.getElementById('workers-progress').style.width = '0%';
        document.getElementById('turn-progress').style.width = '0%';
    }

    hideCards() {
        document.getElementById('cards-container').classList.add('hidden');
    }

    showCards() {
        document.getElementById('cards-container').classList.remove('hidden');
    }

    updateDisplay() {
        // Track previous values to detect changes
        const prevStats = {
            prestige: parseFloat(document.getElementById('prestige').textContent),
            chaos: parseFloat(document.getElementById('chaos').textContent),
            ingredients: Math.floor(parseFloat(document.getElementById('ingredients').textContent)),
            energy: parseFloat(document.getElementById('energy').textContent),
            money: parseFloat(document.getElementById('money-stat').textContent.replace('$', '')),
            noodles: parseFloat(document.getElementById('noodles-stat').textContent)
        };
        
        // Update all stat displays with formatted values
        const stats = {
            prestige: Math.round(this.state.playerStats.pastaPrestige * 10) / 10,
            chaos: Math.round(this.state.playerStats.chaosLevel),
            ingredients: Math.floor(this.state.playerStats.ingredients),
            energy: Math.round(this.state.playerStats.workerCount),
            money: Math.round(this.state.playerStats.money),
            noodles: Math.round(this.state.playerStats.noodles),
            turn: this.turn
        };

        // Update main stats
        Object.entries(stats).forEach(([stat, value]) => {
            const element = document.getElementById(stat);
            if (element) {
                const prevValue = prevStats[stat];
                if (prevValue !== value) {
                    // Remove existing animation classes
                    element.classList.remove('increase', 'decrease');
                    void element.offsetWidth; // Force reflow
                    
                    // Add appropriate animation class
                    if (value > prevValue) {
                        element.classList.add('increase');
                    } else if (value < prevValue) {
                        element.classList.add('decrease');
                    }
                    
                    element.textContent = value;
                }
            }
        });

        // Update both money displays
        const moneyTop = document.getElementById('money-top');
        const moneyStat = document.getElementById('money-stat');
        const moneyValue = stats.money;
        [moneyTop, moneyStat].forEach(element => {
            if (element) {
                const currentValue = parseFloat(element.textContent.replace('$', ''));
                if (currentValue !== moneyValue) {
                    element.classList.remove('increase', 'decrease');
                    void element.offsetWidth;
                    if (moneyValue > currentValue) {
                        element.classList.add('increase');
                    } else if (moneyValue < currentValue) {
                        element.classList.add('decrease');
                    }
                    element.textContent = `$${moneyValue}`;
                }
            }
        });

        // Update both noodle displays
        const noodlesTop = document.getElementById('noodles-top');
        const noodlesStat = document.getElementById('noodles-stat');
        const noodlesValue = stats.noodles;
        [noodlesTop, noodlesStat].forEach(element => {
            if (element) {
                const currentValue = parseFloat(element.textContent);
                if (currentValue !== noodlesValue) {
                    element.classList.remove('increase', 'decrease');
                    void element.offsetWidth;
                    if (noodlesValue > currentValue) {
                        element.classList.add('increase');
                    } else if (noodlesValue < currentValue) {
                        element.classList.add('decrease');
                    }
                    element.textContent = noodlesValue;
                }
            }
        });

        // Update progress bars
        const progressBars = {
            'prestige-progress': (this.state.playerStats.pastaPrestige / 100) * 100,
            'chaos-progress': (this.state.playerStats.chaosLevel / 100) * 100,
            'ingredients-progress': (this.state.playerStats.ingredients / 20) * 100,
            'workers-progress': (this.state.playerStats.workerCount / 50) * 100,
            'turn-progress': 100
        };

        Object.entries(progressBars).forEach(([barId, percentage]) => {
            const bar = document.getElementById(barId);
            if (bar) {
                bar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
            }
        });

        // Add resource state effects
        const statsContainer = document.getElementById('stats');
        
        // Remove all special state classes
        statsContainer.classList.remove(
            'balanced-state',
            'critical-state',
            'harmony-state',
            'perfect-state'
        );

        // Check for special resource states
        if (stats.chaosLevel === 50 && stats.workerCount >= 20) {
            statsContainer.classList.add('balanced-state');
            this.showEffectMessage("The factory finds perfect balance!");
        }

        if (stats.chaosLevel >= 75 && stats.ingredients >= 15) {
            statsContainer.classList.add('critical-state');
            this.showEffectMessage("Danger and opportunity are intertwined!");
        }

        if (stats.pastaPrestige >= 50 && stats.chaosLevel <= 30) {
            statsContainer.classList.add('harmony-state');
            this.showEffectMessage("Your factory runs like a well-oiled machine!");
        }

        if (stats.workerCount >= 40 && stats.ingredients >= 15 && stats.pastaPrestige >= 40) {            statsContainer.classList.add('perfect-state');
            this.showEffectMessage("Peak pasta production achieved!");
        }

        // Save the current message history length before checking chaos
        const messageHistoryLengthBefore = this.messageHistory.length;
        const lastMessageTypeBefore = this.messageHistory.length > 0 ? this.messageHistory[0].type : null;
        
        // Check chaos but don't let it override card action messages
        this.checkChaosEvents();
        this.checkAchievements();

        // Update lights
        this.updateLights();
    }

    checkChaosEvents() {
        const chaos = this.state.playerStats.chaosLevel;
        const body = document.body;
        const messageBox = document.getElementById('game-messages');
        
        // Update music based on chaos level - check for all music systems
        if (window.musicLoops && window.musicLoops.updateChaosLevel) {
            window.musicLoops.updateChaosLevel(chaos);
        }
        if (window.loungeMusic && window.loungeMusic.updateChaosLevel) {
            window.loungeMusic.updateChaosLevel(chaos);
        }        if (window.dnbMusic && window.dnbMusic.updateChaosLevel) {
            window.dnbMusic.updateChaosLevel(chaos);
        }
        
        // Remove all chaos classes first
        body.classList.remove('chaos-level-1', 'chaos-level-2', 'chaos-level-3', 'chaos-level-max', 'chaos-noise');
        messageBox.classList.remove('chaos-warning');
        
        // Check for threshold crossings and play appropriate sounds
        if (this._lastChaosLevel) {
            const thresholds = [25, 45, 70, 90, 100];
            for (const threshold of thresholds) {
                if (chaos >= threshold && this._lastChaosLevel < threshold) {
                    if (threshold === 100) {
                        gameSounds.playMaxChaosSound();
                        setTimeout(() => gameSounds.createGrumbleSound(2.8), 200); // Slightly reduced from 3.0
                    } else if (threshold === 90) {
                        gameSounds.playPreMaxChaosSound();
                        setTimeout(() => gameSounds.createGrumbleSound(2.3), 200); // Slightly reduced from 2.5
                    } else if (threshold === 70) {
                        gameSounds.playHighChaosSound();
                        gameSounds.createGrumbleSound(1.8); // Slightly reduced from 2.0
                    } else {
                        gameSounds.playChaosSoundForLevel(threshold);
                        gameSounds.createGrumbleSound(threshold / 55); // Slightly reduced intensity
                    }
                    break;
                }
            }        }
        this._lastChaosLevel = chaos;        // Track large chaos reductions for "Order From Chaos" achievement
        if (this._lastChaosLevel && this._lastChaosLevel >= 90 && chaos < 80) {
            const reductionAmount = this._lastChaosLevel - chaos;
            // Update the chaosReductionInOneTurn stat
            this.state.playerStats.chaosReductionInOneTurn = reductionAmount;
        }
        
        // Update noodle appendages based on chaos level
        if (window.noodleAppendages && window.noodleAppendages.updateForChaos) {
            window.noodleAppendages.updateForChaos(chaos);
        }
        
        // Add proper mobile-friendly chaos classes
        if (chaos >= 90) { // Changed from 100 to 90
            body.classList.add('chaos-level-max');
            if (!('ontouchstart' in window)) {
                body.classList.add('chaos-noise');
            }
            
            if (Math.random() < 0.4) {
                this.triggerNoodleRain();
            }
        }
        else if (chaos >= 75) {
            body.classList.add('chaos-level-3');
            if (!('ontouchstart' in window)) {
                body.classList.add('chaos-noise');
            }
            
            if (Math.random() < 0.2) {
                this.triggerNoodleRain();
            }
        }
        else if (chaos >= 50) {
            body.classList.add('chaos-level-2');
        }
        else if (chaos >= 25) {
            body.classList.add('chaos-level-1');
        }
    }

    triggerNoodleRain() {
        // Create a basic SVG noodle with dynamic width
        const noodleCount = 15 + Math.floor(Math.random() * 15);

        for (let i = 0; i < noodleCount; i++) {
            setTimeout(() => {
                const noodle = document.createElement('div');
                noodle.className = 'chaos-noodle';
                noodle.style.left = `${Math.random() * 100}vw`;
                
                // Random length between 40px and 120px
                const noodleLength = 40 + Math.floor(Math.random() * 80);
                noodle.style.setProperty('--noodle-length', `${noodleLength}px`);
                
                // Adjust SVG viewBox and path to match the length
                const noodleSVG = `
                    <svg width="${noodleLength}" height="20" viewBox="0 0 ${noodleLength} 20">
                        <path d="M5,10 Q${noodleLength/2},20 ${noodleLength-5},10" 
                              stroke="#FFE5B4" 
                              stroke-width="3" 
                              fill="none"/>
                    </svg>
                `;
                
                const spinAmount = 360 + Math.random() * 720;
                const duration = 3000 + Math.random() * 2000;
                
                noodle.style.setProperty('--spin-amount', `${spinAmount}deg`);
                noodle.style.animation = `noodleFallRandom ${duration}ms linear forwards`;
                
                noodle.innerHTML = noodleSVG;
                document.body.appendChild(noodle);

                setTimeout(() => noodle.remove(), duration);
            }, Math.random() * 1000);
        }
    }

    formatCardEffects(modifiers) {
        if (!modifiers) return '';
        
        return Object.entries(modifiers)
            .map(([stat, value]) => {
                const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
                
                // New threshold logic for signs
                let signs;
                const absValue = Math.abs(value);
                if (absValue <= 5) {
                    signs = (value > 0 ? '+' : '-').repeat(1);
                } else if (absValue <= 8) {
                    signs = (value > 0 ? '+' : '-').repeat(2);
                } else if (absValue <= 13) {
                    signs = (value > 0 ? '+' : '-').repeat(3);
                } else {
                    signs = (value > 0 ? '+' : '-').repeat(4);
                }
                    
                const signClass = value > 0 ? 'positive' : 'negative';
                // Map 'workers' to 'energy' for color class
                const statClass = stat === 'workers' ? 'energy-color' : `${stat}-color`;

                // Include the colon in the colored span
                return `<span class="stat-modifier"><span class="${statClass}">${statName}:</span> <span class="${signClass}">${signs}</span></span>`;
            })
            .join('');
    }

    formatPermanentEffects(permanentStats, card) {
        if (!permanentStats) return '';
        
        const entries = Object.entries(permanentStats);
        // Add priceBonus directly from the upgrade card
        if (card?.priceBonus) {
            entries.push(['priceBonus', card.priceBonus]);
        }
        
        return entries
            .map(([stat, value]) => {
                // Convert value to appropriate number of signs
                const absValue = Math.abs(stat === 'priceBonus' ? value * 100 : value * 100);
                
                // For chaos reduction, we want to invert the sign display
                // because a positive reduction means less chaos (negative sign)
                let displayValue = value;
                if (stat === 'chaosReduction') {
                    displayValue = -value; // Invert the value for display purposes
                }
                
                let signs;
                if (absValue <= 15) {
                    signs = (displayValue > 0 ? '+' : '-').repeat(1);
                } else if (absValue <= 25) {
                    signs = (displayValue > 0 ? '+' : '-').repeat(2);
                } else if (absValue <= 35) {
                    signs = (displayValue > 0 ? '+' : '-').repeat(3);
                } else {
                    signs = (displayValue > 0 ? '+' : '-').repeat(4);
                }
                
                // Map stats to display names
                const statDisplay = {
                    'prestigeGain': 'Prestige',
                    'chaosReduction': 'Chaos',
                    'workerEfficiency': 'Workers',
                    'workerLossRate': 'Workers',
                    'ingredientGain': 'Ingredients',
                    'priceBonus': 'Sale Price'
                }[stat] || stat;

                // Get color class
                const colorClass = {
                    'prestigeGain': 'prestige-color',
                    'chaosReduction': 'chaos-color',
                    'workerEfficiency': 'energy-color',
                    'workerLossRate': 'energy-color',
                    'ingredientGain': 'ingredients-color',
                    'priceBonus': 'money-color'
                }[stat] || '';
                
                // Use displayValue for determining positive/negative class
                const signClass = displayValue > 0 ? 'positive' : 'negative';
                
                return `<div class="permanent-effect">
                    <span class="${colorClass}">${statDisplay}:</span>
                    <span class="${signClass}">${signs}</span>
                </div>`;
            })
            .join('');
    }    drawNewCards() {
        // If there's an active emergency message, don't overwrite it yet
        if (this._emergencyEffectMessage) {
            // Store these messages to show after the emergency message timeout
            this._deferredProductionMessage = this._pendingProductionMessage;
            this._deferredSalesMessage = this._pendingSalesMessage;
            this._deferredSituationMessage = this._pendingSituationMessage;
            this._deferredEffectMessage = this._pendingEffectMessage;
            
            // Clear pending messages so we don't show them now
            this._pendingProductionMessage = null;
            this._pendingSalesMessage = null;
            this._pendingSituationMessage = null;
            this._pendingEffectMessage = null;
            
            // Set a timeout to show the deferred messages after emergency message finishes
            if (this._emergencyMessageTimeout) {
                clearTimeout(this._emergencyMessageTimeout);
            }
            
            this._emergencyMessageTimeout = setTimeout(() => {
                // Show deferred messages after emergency message timeout
                if (this._deferredProductionMessage) {
                    this.showProductionMessage(this._deferredProductionMessage);
                    this._deferredProductionMessage = null;
                }
                
                if (this._deferredSalesMessage) {
                    this.showSalesMessage(this._deferredSalesMessage);
                    this._deferredSalesMessage = null;
                }
                
                if (this._deferredSituationMessage) {
                    this.showSituationMessage(this._deferredSituationMessage);
                    this._deferredSituationMessage = null;
                }
                
                if (this._deferredEffectMessage) {
                    this.showEffectMessage(this._deferredEffectMessage);
                    this._deferredEffectMessage = null;
                }
                
                this._emergencyEffectMessage = null;
            }, this._emergencyMessageDisplayTime);
        } else {
            // Show any pending messages now that animations are complete
            if (this._pendingProductionMessage) {
                this.showProductionMessage(this._pendingProductionMessage);
                this._pendingProductionMessage = null;
            }
            
            if (this._pendingSalesMessage) {
                this.showSalesMessage(this._pendingSalesMessage);
                this._pendingSalesMessage = null;
            }
            
            if (this._pendingSituationMessage) {
                this.showSituationMessage(this._pendingSituationMessage);
                this._pendingSituationMessage = null;
            }
            
            if (this._pendingEffectMessage) {
                this.showEffectMessage(this._pendingEffectMessage);
                this._pendingEffectMessage = null;
            }
        }
        
        // Remove any existing cards
        document.querySelectorAll('.card').forEach(card => {
            card.remove();
        });

        gameSounds.playDrawCardsSound();
        
        const cardsContainer = document.getElementById('cards-container');
        cardsContainer.classList.remove('hidden');        // Get available cards
        const availableCards = Object.keys(CARDS).filter(cardName => {
            // Handle "Reggie's Great Escape" and "Return of Reggie" cards specially
            if (cardName === "Reggie's Great Escape") {
                // Don't show "Reggie's Great Escape" after it's been played (reggieEscaped is true)
                return this.state.playerStats.reggieEscaped !== true;
            }
            
            if (cardName === "Return of Reggie") {
                // Only show "Return of Reggie" after "Reggie's Great Escape" has been played
                // but don't show it after it's already been played (reggieComplete is true)
                return this.state.playerStats.reggieEscaped === true && 
                       this.state.playerStats.reggieComplete !== true;
            }
            
            // Handle UHF Channel 62 storyline cards
            if (cardName === "Local Underdog Spotlight") {
                // Only show the first card if the storyline hasn't started
                return this.state.playerStats.uhfStoryline === undefined;
            }
            
            if (cardName === "Noodles is Tripped!") {
                // Only show after the first card has been played
                return this.state.playerStats.uhfStoryline === 1;
            }
            
            if (cardName === "MacIntosh's Master Plan") {
                // Only show after the second card has been played
                return this.state.playerStats.uhfStoryline === 2;
            }
            
            if (cardName === "Sabotage in the Sauce") {
                // Only show after the third card has been played
                return this.state.playerStats.uhfStoryline === 3;
            }
              if (cardName === "Live Broadcast Blowback") {
                // Only show after the fourth card has been played
                return this.state.playerStats.uhfStoryline === 4;
            }
            
            // Handle Ren & Stimpy storyline cards
            if (cardName === "Happy Happy Joy Joy") {
                // Only show the first card if the storyline hasn't started
                return this.state.playerStats.rnstimpyStoryline === undefined;
            }
            
            if (cardName === "Log for Lunch") {
                // Only show after the first card has been played
                return this.state.playerStats.rnstimpyStoryline === 1;
            }
            
            if (cardName === "Space Madness") {
                // Only show after the second card has been played
                return this.state.playerStats.rnstimpyStoryline === 2;
            }
            
            // Handle Beavis and Butthead storyline cards
            if (cardName === "Cornholio Awakens") {
                // Only show the first card if the storyline hasn't started
                return this.state.playerStats.beavisbhStoryline === undefined;
            }
            
            if (cardName === "Huh Huh, Cool") {
                // Only show after the first card has been played
                return this.state.playerStats.beavisbhStoryline === 1;
            }
            
            if (cardName === "Nachos Rule!") {
                // Only show after the second card has been played
                return this.state.playerStats.beavisbhStoryline === 2;
            }
            
            // Skip upgrade cards that are already installed
            if (this.state.playerStats.factoryUpgrades && 
                cardName in this.state.playerStats.factoryUpgrades) {
                return false;
            }
            
            if (CARDS[cardName].type === "upgrade") {
                const requiredPrestige = CARDS[cardName].requirements?.prestige || 0;
                return this.state.playerStats.pastaPrestige >= requiredPrestige;
            }
            
            return true;
        });        // Detect active storylines
        const hasActiveUHFStoryline = this.state.playerStats.uhfStoryline !== undefined && !this.state.playerStats.uhfComplete;
        const hasActiveReggieStoryline = this.state.playerStats.reggieEscaped === true && !this.state.playerStats.reggieComplete;
        // Fix for R&S storyline - consider active if any of the stages are valid
        const hasActiveRnSStoryline = this.state.playerStats.rnstimpyStoryline !== undefined && 
                                      this.state.playerStats.rnstimpyStoryline < 3 && 
                                      !this.state.playerStats.rnstimpyComplete;
        const hasBBStoryline = this.state.playerStats.beavisbhStoryline !== undefined && !this.state.playerStats.beavisbhComplete;
        
        // Identify storyline cards
        const storylineCards = availableCards.filter(cardName => {
            // UHF storyline cards
            if (["Noodles is Tripped!", "MacIntosh's Master Plan", "Sabotage in the Sauce", "Live Broadcast Blowback"].includes(cardName)) {
                return hasActiveUHFStoryline;
            }
            // Reggie storyline
            if (cardName === "Return of Reggie") {
                return hasActiveReggieStoryline;
            }            // Ren & Stimpy storyline
            if (cardName === "Log for Lunch") {
                return this.state.playerStats.rnstimpyStoryline === 1;
            }
            if (cardName === "Space Madness") {
                return this.state.playerStats.rnstimpyStoryline === 2;
            }
            // Beavis & Butthead storyline
            if (["Huh Huh, Cool", "Nachos Rule!"].includes(cardName)) {
                return hasBBStoryline;
            }
            return false;
        });

        // Separate upgrade and regular cards (excluding storyline cards)
        const upgradeCards = availableCards.filter(cardName => CARDS[cardName].type === "upgrade");
        const regularCards = availableCards.filter(cardName => 
            CARDS[cardName].type !== "upgrade" && !storylineCards.includes(cardName)
        );        // Select cards based on game state
        let leftCard, rightCard;
          // Prioritize storyline cards if any storyline is active
        const hasActiveStoryline = hasActiveUHFStoryline || hasActiveReggieStoryline || 
                                 hasActiveRnSStoryline || hasBBStoryline;
          // Track the last turn we showed a storyline card
        if (!this.lastStorylineTurn) {
            this.lastStorylineTurn = 0;
        }
        
        // Calculate a dynamic probability based on turns since last storyline card
        // This makes it more likely to show a storyline card the longer it's been since we showed one
        const turnsSinceStoryline = this.turn - this.lastStorylineTurn;
        const baseStorylineProbability = 0.25; // Reduced base chance from 0.4 (40%) to 0.25 (25%)
        const additionalProbability = Math.min(0.25, turnsSinceStoryline * 0.03); // Increases by 3% each turn, up to 25% (reduced from 5% and 30%)
        const storylineProbability = Math.min(0.7, baseStorylineProbability + additionalProbability); // Reduced max probability from 0.85 to 0.7
        
        // If we have storyline cards, show one with calculated probability
        if (storylineCards.length > 0 && Math.random() < storylineProbability) {
            // Choose a storyline card
            const storylineCard = storylineCards[Math.floor(Math.random() * storylineCards.length)];
            
            // For the second card, prioritize another storyline card if available, otherwise regular
            let secondCard;
            
            if (storylineCards.length > 1 && Math.random() < 0.25) { // Reduced from 0.4 to 0.25
                // Get a different storyline card if possible
                const otherStorylineCards = storylineCards.filter(c => c !== storylineCard);
                secondCard = otherStorylineCards[Math.floor(Math.random() * otherStorylineCards.length)];
            } else if (upgradeCards.length > 0 && Math.random() < 0.3) {
                // 30% chance for an upgrade card
                secondCard = upgradeCards[Math.floor(Math.random() * upgradeCards.length)];
            } else {
                // Otherwise a regular card
                secondCard = regularCards.length > 0
                    ? regularCards[Math.floor(Math.random() * regularCards.length)]
                    : availableCards[Math.floor(Math.random() * availableCards.length)];
            }
            
            // Randomly assign to left or right
            if (Math.random() < 0.5) {
                leftCard = storylineCard;
                rightCard = secondCard;
            } else {
                leftCard = secondCard;
                rightCard = storylineCard;
            }
            
            // Update the last storyline turn
            this.lastStorylineTurn = this.turn;
        } else if (upgradeCards.length > 0 && regularCards.length > 0 && Math.random() < 0.3) {
            // 30% chance to get one upgrade card if available
            leftCard = upgradeCards[Math.floor(Math.random() * upgradeCards.length)];
            rightCard = regularCards[Math.floor(Math.random() * regularCards.length)];
            if (Math.random() < 0.5) {
                // 50% chance to swap positions
                [leftCard, rightCard] = [rightCard, leftCard];
            }
        } else {
            // Otherwise get two regular cards
            [leftCard, rightCard] = [...regularCards].sort(() => Math.random() - 0.5).slice(0, 2);
        }
        
        // Add these cards to lastDrawnCards to prevent them from appearing in the next game        // Import lastDrawnCards directly from cards.js to keep it updated
        if (typeof lastDrawnCards !== 'undefined') {            // Add cards if they don't already exist in the array
            if (!lastDrawnCards.includes(leftCard)) {
                lastDrawnCards.push(leftCard);
            }
            if (!lastDrawnCards.includes(rightCard)) {
                lastDrawnCards.push(rightCard);
            }
            // Limit the array size to prevent it from growing too large (keeping the last 10 cards)
            if (lastDrawnCards.length > 10) {
                // Modify the array in-place instead of reassigning
                lastDrawnCards.splice(0, lastDrawnCards.length - 10);
            }
        }        // Get current upgrade slots info for display        // Get reference to upgrades grid to check for upgrade slots later in checkCardPlayable
        const upgradesGrid = document.querySelector('.upgrades-grid');
        
        cardsContainer.innerHTML = `
            <div class="card" id="card-left">
                ${CARDS[leftCard].type === "upgrade" ? 
                    `<div class="upgrade-label">Prestigious Upgrade</div>
                    <h3>${leftCard}</h3>
                    <div class="card-description">${CARDS[leftCard].description}</div>
                    ${CARDS[leftCard].cost ? 
                        `<div class="cost-display ${this.state.playerStats.money < CARDS[leftCard].cost ? 'cannot-afford' : ''}">
                            <span class="cost-icon">$</span>
                            <span>${CARDS[leftCard].cost}</span>
                         </div>` : ''
                    }
                    ${CARDS[leftCard].permanentStats || CARDS[leftCard].priceBonus ? 
                        `<div class="card-effects permanent-effects">
                            <div class="effects-label">Passive Effects:</div>
                            ${this.formatPermanentEffects(CARDS[leftCard].permanentStats, CARDS[leftCard])}
                        </div>` : ''
                    }
                    ${CARDS[leftCard].statModifiers ? 
                        `<div class="card-effects instant-effects">
                            <div class="effects-label">Instant Effects:</div>
                            ${this.formatCardEffects(CARDS[leftCard].statModifiers)}
                        </div>` : ''
                    }`
                    : 
                    `<h3>${leftCard}</h3>
                    <div class="card-description">${CARDS[leftCard].description}</div>
                    <div class="card-effects">
                        ${this.formatCardEffects(CARDS[leftCard].statModifiers)}
                    </div>`
                }
            </div>            <div class="card" id="card-right">
                ${CARDS[rightCard].type === "upgrade" ? 
                    `<div class="upgrade-label">Prestigious Upgrade</div>
                    <h3>${rightCard}</h3>
                    <div class="card-description">${CARDS[rightCard].description}</div>
                    ${CARDS[rightCard].cost ? 
                        `<div class="cost-display ${this.state.playerStats.money < CARDS[rightCard].cost ? 'cannot-afford' : ''}">
                            <span class="cost-icon">$</span>
                            <span>${CARDS[rightCard].cost}</span>
                         </div>` : ''
                    }
                    ${CARDS[rightCard].permanentStats || CARDS[rightCard].priceBonus ? 
                        `<div class="card-effects permanent-effects">
                            <div class="effects-label">Passive Effects:</div>
                            ${this.formatPermanentEffects(CARDS[rightCard].permanentStats, CARDS[rightCard])}
                        </div>` : ''
                    }
                    ${CARDS[rightCard].statModifiers ? 
                        `<div class="card-effects instant-effects">
                            <div class="effects-label">Instant Effects:</div>
                            ${this.formatCardEffects(CARDS[rightCard].statModifiers)}
                        </div>` : ''
                    }`
                    : 
                    `<h3>${rightCard}</h3>
                    <div class="card-description">${CARDS[rightCard].description}</div>
                    <div class="card-effects">
                        ${this.formatCardEffects(CARDS[rightCard].statModifiers)}
                    </div>`
                }
            </div>
        `;

        // Initialize animations for new cards
        requestAnimationFrame(() => {
            document.querySelectorAll('.card').forEach(card => {
                addCardHoverEffects(card);
            });
        });        // Add click handlers with requirement checks
        document.getElementById('card-left').onclick = () => {
            // If the game is paused, close the pause menu first
            if (this.isPaused) {
                this.closePauseMenu();
            }
            
            if (this.checkCardPlayable(CARDS[leftCard], true)) {
                // Immediately hide the other card with no visual effects
                const otherCard = document.getElementById('card-right');
                otherCard.style.display = 'none';
                otherCard.style.visibility = 'hidden';
                otherCard.style.opacity = '0';
                otherCard.style.position = 'absolute';
                otherCard.style.pointerEvents = 'none';
                otherCard.style.zIndex = '-10';
                this.playCard(leftCard);
            }
        };
        document.getElementById('card-right').onclick = () => {
            // If the game is paused, close the pause menu first
            if (this.isPaused) {
                this.closePauseMenu();
            }
            
            if (this.checkCardPlayable(CARDS[rightCard], true)) {
                // Immediately hide the other card with no visual effects
                const otherCard = document.getElementById('card-left');
                otherCard.style.display = 'none';
                otherCard.style.visibility = 'hidden';
                otherCard.style.opacity = '0';
                otherCard.style.position = 'absolute';
                otherCard.style.pointerEvents = 'none';
                otherCard.style.zIndex = '-10';
                this.playCard(rightCard);
            }
        };
    }

    checkCardPlayable(card, isClick = false) {  // Add isClick parameter
        if (!card) return true;
        
        // For upgrades, check prestige requirement, slot availability, and money
        if (card.type === "upgrade") {
            // First check prestige requirement
            if (card.requirements?.prestige && 
                this.state.playerStats.pastaPrestige < card.requirements.prestige) {
                // Only show message and play sound if actually clicked
                if (isClick) {
                    gameSounds.playUpgradeBlockedSound();
                    this.showEffectMessage(`<span style="color: #ff6347;">Not enough prestige! Requires ${card.requirements.prestige} prestige.</span>`, true);
                }
                return false;
            }
            
            // Check if player has enough money to purchase the upgrade
            if (card.cost && this.state.playerStats.money < card.cost) {
                // Only show message and play sound if actually clicked
                if (isClick) {
                    gameSounds.playUpgradeBlockedSound();
                    this.showEffectMessage(`<span style="color: #ff6347;">Not enough money! Costs $${card.cost} but you only have $${Math.floor(this.state.playerStats.money)}.</span>`, true);
                }
                return false;
            }
              // Then check upgrade slots
            const upgradesGrid = document.querySelector('.upgrades-grid');
            const existingUpgrades = upgradesGrid.querySelectorAll('.upgrade-card');
            const maxSlots = this.state.playerStats.maxUpgradeSlots || 2; // Default to 2 slots
            if (existingUpgrades.length >= maxSlots) {
                // Only show message and play sound if actually clicked
                if (isClick) {                    gameSounds.playUpgradeBlockedSound();
                    this.showEffectMessage(`Maximum of ${maxSlots} factory upgrades allowed! ${maxSlots < 3 ? "Install Factory Expansion Blueprint or " : ""}Sell an upgrade first.`, true);
                }
                return false;
            }
        }
        
        return true;
    }    playCard(cardName) {
        // Make spam click check more sensitive
        const now = Date.now();
        if (now - this.lastCardPlayTime < this.clickCooldown) {
            gameSounds.playBadCardSound();
            this.showEffectMessage("Too fast! The noodles are dizzy! 🌀", true);
            return;
        }
        this.lastCardPlayTime = now;

        const card = CARDS[cardName];
        if (!card) return;
          // Track cards played without chaos events for "The Pasta Godfather" achievement
        if (this.state.playerStats.chaosLevel < 70) { // Only count when chaos is under control
            this.state.playerStats.cardsPlayedWithoutChaos = (this.state.playerStats.cardsPlayedWithoutChaos || 0) + 1;
        } else {
            // Reset the counter if chaos is too high
            this.state.playerStats.cardsPlayedWithoutChaos = 0;
        }
        
        // Track science cards for "Pasta Researcher" achievement
        if (card.description && 
            (card.description.toLowerCase().includes('science') || 
             card.description.toLowerCase().includes('experiment') || 
             card.description.toLowerCase().includes('lab') ||
             card.description.toLowerCase().includes('research'))) {
            this.state.playerStats.scienceCardsPlayed = (this.state.playerStats.scienceCardsPlayed || 0) + 1;
        }

        // Handle emergency resource purchases
        let emergencyMessage = '';
        if (card.statModifiers) {
            // Clear the message queue when playing a card to ensure card action message displays first
            this.messageQueue = [];
            
            // Before playing a card, store the current queue state for later restoration
            const oldQueue = [...this.messageQueue]; 
            
            // Clear any pending chaos messages to prioritize card action messages
            this.messageQueue = this.messageQueue.filter(msg => msg.type !== 'chaos-warning');

            const ingredientChange = card.statModifiers.ingredients || 0;
            const workerChange = card.statModifiers.workers || 0;
            
            // Check if we would run out of ingredients
            if (ingredientChange < 0 && (this.state.playerStats.ingredients + ingredientChange) < 0) {
                const neededIngredients = Math.abs(this.state.playerStats.ingredients + ingredientChange);
                const severityFactor = Math.abs(ingredientChange);
                const totalCost = Math.min(150, Math.max(50, 50 + (severityFactor * 15)));
                
                if (this.state.playerStats.money >= totalCost) {
                    // Update money first
                    this.state.playerStats.money -= totalCost;
                    // Force display update to show money change
                    this.updateDisplay();
                    
                    // Small delay before adding ingredients for visual feedback
                    setTimeout(() => {                        this.state.playerStats.ingredients += neededIngredients;
                        this.updateDisplay();
                        emergencyMessage = `Emergency ingredients purchased for $${totalCost}!`;
                        this.showEffectMessage(emergencyMessage, true);
                    }, 300);
                } else {
                    // If we have noodles, try emergency sale first
                    if (this.state.playerStats.noodles > 0) {
                        const noodlesToSell = this.state.playerStats.noodles;
                        const emergencySalePrice = Math.floor(this.state.playerStats.noodleSalePrice * 0.8);
                        const income = noodlesToSell * emergencySalePrice;
                        this.state.playerStats.noodles = 0;
                        this.state.playerStats.money += income;
                        
                        // If we now have enough money, buy ingredients
                        if (this.state.playerStats.money >= totalCost) {                            this.state.playerStats.money -= totalCost;
                            this.state.playerStats.ingredients += neededIngredients;
                            emergencyMessage = `Emergency noodle sale: ${noodlesToSell} noodles sold for $${income}!\nEmergency ingredients purchased for $${totalCost}!`;
                            this.showEffectMessage(emergencyMessage, true);
                        } else {
                            this.isGameOver = true;
                            this.gameOverReason = `Not enough money ($${this.state.playerStats.money}) after emergency noodle sale to purchase ingredients ($${totalCost}).`;
                            this.endGame('ingredients');
                            return;
                        }
                    } else {
                        this.isGameOver = true;
                        this.gameOverReason = `Not enough money ($${this.state.playerStats.money}) to purchase emergency ingredients ($${totalCost}).`;
                        this.endGame('ingredients');
                        return;
                    }
                }
            }

            // Check if we would run out of workers
            if (workerChange < 0 && (this.state.playerStats.workerCount + workerChange) < 0) {
                const neededWorkers = Math.abs(this.state.playerStats.workerCount + workerChange);
                const severityFactor = Math.abs(workerChange); // How big the negative modifier is
                
                // Calculate base cost per worker (50-150 range based on severity)
                const costPerWorker = Math.min(150, Math.max(50, 50 + (severityFactor * 15)));
                const totalCost = costPerWorker; // One-time cost for the emergency hire, not per worker
                
                if (this.state.playerStats.money >= totalCost) {
                    // Update money first
                    this.state.playerStats.money -= totalCost;
                    // Force display update to show money change
                    this.updateDisplay();
                    
                    // Small delay before adding workers for visual feedback
                    setTimeout(() => {                        this.state.playerStats.workerCount += neededWorkers;
                        this.updateDisplay();
                        emergencyMessage = `Emergency workers hired for $${totalCost}!`;
                        this.showEffectMessage(emergencyMessage, true);
                    }, 300);
                } else {
                    // If we have noodles, try emergency sale first
                    if (this.state.playerStats.noodles > 0) {
                        const noodlesToSell = this.state.playerStats.noodles;
                        const emergencySalePrice = Math.floor(this.state.playerStats.noodleSalePrice * 0.8);
                        const income = noodlesToSell * emergencySalePrice;
                        this.state.playerStats.noodles = 0;
                        this.state.playerStats.money += income;
                        
                        // If we now have enough money, hire workers
                        if (this.state.playerStats.money >= totalCost) {                            this.state.playerStats.money -= totalCost;
                            this.state.playerStats.workerCount += neededWorkers;
                            emergencyMessage = `Emergency noodle sale: ${noodlesToSell} noodles sold for $${income}!\nEmergency workers hired for $${totalCost}!`;
                            this.showEffectMessage(emergencyMessage, true);
                        } else {
                            this.isGameOver = true;
                            this.gameOverReason = `Not enough money ($${this.state.playerStats.money}) after emergency noodle sale to hire workers ($${totalCost}).`;
                            this.endGame('workers');
                            return;
                        }
                    } else {
                        this.isGameOver = true;
                        this.gameOverReason = `Not enough money ($${this.state.playerStats.money}) to hire emergency workers ($${totalCost}).`;
                        this.endGame('workers');
                        return;
                    }
                }            }

            // Rest of the method remains unchanged...            
            const clickedCard = Array.from(document.querySelectorAll('.card')).find(
                cardElement => cardElement.querySelector('h3') && cardElement.querySelector('h3').textContent === cardName
            );
            const otherCard = Array.from(document.querySelectorAll('.card')).find(
                cardElement => cardElement !== clickedCard
            );// Handle upgrade cards differently
            if (card.type === "upgrade") {
                // Play card sound immediately
                gameSounds.playCardSound();
                
                // Immediately hide the other card
                if (otherCard) {
                    otherCard.style.display = 'none';
                    otherCard.style.visibility = 'hidden';
                    
                    // Clean up any noodle appendages on the hidden card
                    if (window.noodleAppendages && window.noodleAppendages.cleanup) {
                        window.noodleAppendages.cleanup(otherCard);
                    }
                }
                
                // Mark clicked card for upgrade animation - just the minimum needed
                if (clickedCard) {
                    clickedCard.classList.add('played', 'upgrade-selected');
                    clickedCard.setAttribute('data-selected', 'true');
                    clickedCard.style.zIndex = '100';
                    
                    // We don't clean up appendages on upgrade cards as they will persist
                }

                // Apply immediate stat modifiers first
                if (card.statModifiers) {
                    const balancedModifiers = applyStatModifiers(this.state, {...card.statModifiers});
                    Object.entries(balancedModifiers).forEach(([stat, value]) => {
                        const statKey = stat === 'workers' ? 'workerCount' : 
                                      stat === 'prestige' ? 'pastaPrestige' : 
                                      stat === 'chaos' ? 'chaosLevel' : 
                                      stat;
                        
                        const currentValue = this.state.playerStats[statKey] || 0;
                        this.state.playerStats[statKey] = Math.max(0, currentValue + Number(value));
                    });
                }                // Pin the upgrade card to the upgrades section
                if (this.pinUpgradeCard(cardName, card)) {
                    // Apply permanent stats after successful pinning
                    if (card.permanentStats) {
                        this.applyUpgradeStats(card.permanentStats);
                    }
                    
                    // Add message feedback for upgrade cards but store to show after animations
                    let upgradeMessage = `Upgrade installed: ${cardName}`;
                    
                    // Special messaging for Factory Expansion Blueprint
                    if (cardName === "Factory Expansion Blueprint") {
                        upgradeMessage = `Upgrade installed: ${cardName}. Factory can now support 3 upgrades!`;
                    }
                    
                    this.addMessageToHistory(upgradeMessage, 'feedback');
                    this._pendingEffectMessage = upgradeMessage;
                    
                    // Store the upgrade in state
                    this.state.playerStats.factoryUpgrades[cardName] = card;
                }

                // Update display after all changes
                this.updateDisplay();
                
                // Increment turn counter
                this.turn++;
                
                // Process turn effects
                this.processTurnEffects();

                // Auto-save game state after processing turn effects
                this.autoSave();
                  // Draw new cards after a delay
                if (!this.isGameOver) {
                    setTimeout(() => {
                        document.querySelectorAll('.card').forEach(card => card.remove());
                        this.drawNewCards();
                    }, 800);
                }
                return;
            }            // Rest of the existing playCard code for non-upgrade cards...            // Play card sound immediately
            gameSounds.playCardSound();
            
            // Clean up noodle appendages from the clicked card
            if (window.noodleAppendages && window.noodleAppendages.cleanup && clickedCard) {
                window.noodleAppendages.cleanup(clickedCard);
            }

            if (clickedCard && clickedCard.isConnected) {
                // Get card position for effects - only if it's still in the DOM
                const rect = clickedCard.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Create various effects based on card type or modifiers
                if (card.statModifiers) {
                    // Money effect for prestige gains
                    if (card.statModifiers.prestige > 0) {
                        createMoneyEffect(centerX, centerY);
                    }

                    // Noodle explosion for chaos changes
                    if (Math.abs(card.statModifiers.chaos) > 5) {
                        createNoodleExplosion(centerX, centerY);
                    }

                    // Smoke for worker changes
                    if (card.statModifiers.workers) {
                        for (let i = 0; i < 5; i++) {
                            setTimeout(() => {
                                createSmokeParticle(
                                    centerX + (Math.random() - 0.5) * 50,
                                    centerY + (Math.random() - 0.5) * 50
                                );
                            }, i * 100);
                        }
                    }

                    // Water splash for ingredient changes
                    if (card.statModifiers.ingredients) {
                        createWaterSplash(centerX, centerY);
                    }
                }                // Fire effect for "magical" or special cards
                if (card.description.toLowerCase().includes('magic') || 
                    card.description.toLowerCase().includes('mystic') ||
                    card.description.toLowerCase().includes('spirit')) {
                    // Track magic cards for "Mystic Master" achievement
                    this.state.playerStats.magicCardsPlayed = (this.state.playerStats.magicCardsPlayed || 0) + 1;
                    this.state.playerStats.usedMagicCards = true;
                    
                    for (let i = 0; i < 8; i++) {
                        setTimeout(() => {
                            createFireParticle(
                                centerX + (Math.random() - 0.5) * 40,
                                centerY + (Math.random() - 0.5) * 40
                            );
                        }, i * 80);
                    }
                }

                // Existing card animation
                clickedCard.classList.add('played');
                clickedCard.setAttribute('data-selected', 'true');
                clickedCard.style.zIndex = '100';
            }            // Increment turn counter
            this.turn++;
              // Add the played card to lastDrawnCards to prevent it from appearing in the next game
            if (!lastDrawnCards.includes(cardName)) {
                lastDrawnCards.push(cardName);
                // Limit the array size to prevent it from growing too large
                if (lastDrawnCards.length > 10) {
                    // Modify the array in-place instead of reassigning
                    lastDrawnCards.splice(0, lastDrawnCards.length - 10);
                }
            }
            
            // Apply visual feedback for cards BEFORE stat changes
            if (clickedCard) {
                clickedCard.classList.add('played');
                clickedCard.setAttribute('data-selected', 'true');
                clickedCard.style.zIndex = '100';
            }
            if (otherCard) {
                // Immediately hide the unselected card
                otherCard.style.display = 'none';
                otherCard.style.visibility = 'hidden';
                otherCard.style.opacity = '0';
                otherCard.style.pointerEvents = 'none';
                otherCard.style.zIndex = '-10';
                otherCard.style.position = 'absolute';
            }

            // Apply stat modifications with balance checks
            if (card.statModifiers) {
                const balancedModifiers = applyStatModifiers(this.state, {...card.statModifiers});
                Object.entries(balancedModifiers).forEach(([stat, value]) => {
                    const statKey = stat === 'workers' ? 'workerCount' : 
                                  stat === 'prestige' ? 'pastaPrestige' : 
                                  stat === 'chaos' ? 'chaosLevel' : 
                                  stat;
                    
                    const currentValue = this.state.playerStats[statKey] || 0;
                    this.state.playerStats[statKey] = Math.max(0, currentValue + Number(value));
                });

                // Update display after stat changes
                this.updateDisplay();                // Apply card effect first
                if (card.effect) {
                    const message = card.effect(this.state);
                    if (message) {
                        // Add to history
                        this.addMessageToHistory(message, 'feedback');
                        // Store to show after animations are complete
                        this._pendingEffectMessage = message;
                    }
                }

                // Check for achievements AFTER both stat changes and card effect
                this.checkAchievements();
            }

            // Process turn effects and check game state
            this.processTurnEffects();

            // Auto-save game state after processing turn effects
            this.autoSave();

            // Check for game over conditions
            if (this.checkGameOver()) {
                return;
            }            // Schedule cleanup and new cards after animations complete
            if (!this.isGameOver) {
                setTimeout(() => {
                    // Clean up any remaining appendages before removing cards
                    document.querySelectorAll('.card').forEach(card => {
                        if (window.noodleAppendages && window.noodleAppendages.cleanup) {
                            window.noodleAppendages.cleanup(card);
                        }
                        card.remove();
                    });
                    this.drawNewCards();
                }, 800);
            }
        }
    }    processTurnEffects() {
        // Apply upgrade effects first
        applyUpgradeEffects(this.state);

        // Process power outage if active
        if (this.state.playerStats.powerOutage > 0) {
            this.state.playerStats.powerOutage--;
            
            if (this.state.playerStats.powerOutage === 0) {
                // Power is restored - show message
                const powerRestoredMessage = "Power has been restored to the factory!";
                this.addMessageToHistory(powerRestoredMessage, 'feedback');
                this._pendingEffectMessage = powerRestoredMessage;
                
                // Restore previous light status if available
                if (this.lightsStatusBeforeOutage) {
                    this.lightsStatus = [...this.lightsStatusBeforeOutage];
                    this.lightsStatusBeforeOutage = null;
                }
                
                // Update lights immediately to show power is back
                this.updateLights();
            } else {
                // Power is still out
                const outageMessage = `Power outage continues. ${this.state.playerStats.powerOutage} ${this.state.playerStats.powerOutage === 1 ? 'turn' : 'turns'} until power is restored.`;
                this.addMessageToHistory(outageMessage, 'feedback');
                this._pendingEffectMessage = outageMessage;
            }
        }

        // Add passive ingredient gain each turn
        const baseIngredientGain = 0.2 + this.state.playerStats.ingredientGainRate;
        const prestigeBonus = this.state.playerStats.pastaPrestige * 0.01;
        const totalIngredientGain = Math.random() < 0.7 ? Math.floor(baseIngredientGain + prestigeBonus) : 0;
        
        if (totalIngredientGain > 0) {
            this.state.playerStats.ingredients = Math.min(20, Math.floor(this.state.playerStats.ingredients + totalIngredientGain));
        }

        // Process production
        let productionMessage = this.processProduction();

        // Process sales and expenses
        let salesMessage = this.processSalesAndExpenses();
        
        // Add important messages to history first
        if (productionMessage) {
            this.addMessageToHistory(productionMessage, 'production');
            // Store in temporary properties to show after animations are complete
            this._pendingProductionMessage = productionMessage;
        }
        if (salesMessage) {
            this.addMessageToHistory(salesMessage, 'sales');
            // Store in temporary properties to show after animations are complete
            this._pendingSalesMessage = salesMessage;
        }        // Update visuals
        this.updateDisplay();
        // Update other tracking stats
        this.updateChaosStreak();
        this.updateSingleWorkerStreak();
        this.updateLowWorkerStats();
        this.checkBalancedStats();
        
        // Process any active worker strikes
        this.processStrike();
        
        // Check if any risk achievements are met
        this.checkRiskAchievements();

        // Store the situation message to show after animations
        const situationMessage = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
        if (situationMessage) {
            this.addMessageToHistory(situationMessage, 'situation');
            // Save to show after animations are complete
            this._pendingSituationMessage = situationMessage;
        }
    }

    processProduction() {
        // Check if workers are on strike - prevent all production
        if (this.state.playerStats.strikeActive) {
            return "No production: Workers are on strike! (" + this.state.playerStats.strikeDuration + " turns remaining)";
        }
        
        // Don't produce anything without ingredients
        if (this.state.playerStats.ingredients <= 0) return null;
        
        const workers = this.state.playerStats.workerCount;
        
        // Make ingredients last longer by reducing consumption rate
        const baseProduction = Math.min(
            Math.floor(this.state.playerStats.ingredients * 0.5), // Round down ingredient usage
            Math.ceil(workers / 0.5)  // Each 5 workers can process 1 ingredient
        );

        if (baseProduction <= 0) return null;
        
        const chaosLevel = this.state.playerStats.chaosLevel;
        const chaosMultiplier = chaosLevel > 50 ? 
            1 - ((chaosLevel - 50) / 100) :
            1 + (chaosLevel / 100);
        const noodlesPerIngredient = 15 + Math.floor(Math.random() * 16);
        const production = Math.max(1, Math.floor(baseProduction * noodlesPerIngredient * chaosMultiplier * this.state.playerStats.noodleProductionRate));

        if (production > 0) {
            this.state.playerStats.noodles += production;
            // Only consume whole number of ingredients
            this.state.playerStats.ingredients = Math.floor(Math.max(0, this.state.playerStats.ingredients - (baseProduction * 0.5)));
            
            // Return the production message
            return `Daily production: Created ${production} noodles!`;
        }
        
        return null;
    }

    processSalesAndExpenses() {
        let message = '';
        
        // For 5-day cycle, use (turn % 5 === 0) for turns 5, 10, 15, etc.
        const shouldSellNoodles = (this.turn > 0 && this.turn % 5 === 0);
        
        // Process sales every 5 days (production cycle)
        if (shouldSellNoodles) {
            const maxSales = Math.floor(20 + (this.state.playerStats.pastaPrestige * 0.5));
            const availableNoodles = this.state.playerStats.noodles;
            const dailySales = Math.min(maxSales, availableNoodles);            if (dailySales > 0) {
                const income = dailySales * this.state.playerStats.noodleSalePrice;
                this.state.playerStats.noodles -= dailySales;
                this.state.playerStats.money += income;
                
                // Track highest single sale for "Noodle Economy" achievement
                if (income > this.state.playerStats.highestSingleSale) {
                    this.state.playerStats.highestSingleSale = income;
                }
                
                message = `Sales: ${dailySales} noodles sold for $${income}!`;
            } else {
                message = `Sales day: No noodles available to sell!`;
            }
        }

        // Process weekly expenses
        if (this.turn % 7 === 0) {
            const expenses = this.state.playerStats.weeklyExpenses;
            this.state.playerStats.money = Math.max(0, this.state.playerStats.money - expenses);
            
            if (message) {
                message += ` Weekly expenses: -$${expenses}`;
            } else {
                message = `Weekly expenses: -$${expenses}`;
            }
        }
        
        return message || null;
    }

    addUpgradeClickHandler(upgradeElement, card) {
        upgradeElement.addEventListener('click', () => {
            // Generate the benefits of selling before showing the dialog
            const chaosReduction = 3 + Math.floor(Math.random() * 6); // Random 5-10 reduction
            const ingredientGain = 2 + Math.floor(Math.random() * 4); // Random 4-6 ingredients
            
            // Calculate money refund (50% of original cost)
            const refundAmount = card.cost ? Math.floor(card.cost * 0.5) : 0;
            
            // Remove any existing confirmation dialog first
            upgradeElement.querySelectorAll('.sell-confirm').forEach(el => el.remove());
              const confirmDialog = document.createElement('div');
            confirmDialog.className = 'sell-confirm compact-confirm';
            confirmDialog.innerHTML = `
                <div class="sell-header">Sell ${card.type === "upgrade" ? "Upgrade" : "Card"}?</div>
                <div class="sell-benefits">
                    ${refundAmount > 0 ? 
                      `<div class="sell-benefit money-color">
                        <span class="benefit-icon" style="font-size: 16px;">💰</span>
                        <span class="benefit-text" style="font-size: 15px;">+$${refundAmount}</span>
                      </div>` : ''}
                    <div class="sell-benefit ingredients-color">
                        <span class="benefit-icon" style="font-size: 16px;">🌾</span>
                        <span class="benefit-text" style="font-size: 15px;">+${ingredientGain} ingredients</span>
                    </div>
                    <div class="sell-benefit chaos-color">
                        <span class="benefit-icon" style="font-size: 16px;">🌀</span>
                        <span class="benefit-text" style="font-size: 15px;">-${Math.round(chaosReduction)} chaos</span>
                    </div>
                </div>
                <div class="sell-buttons">
                    <button class="sell-yes" style="font-size: 14px; padding: 4px 12px;">Sell</button>
                    <button class="sell-no" style="font-size: 14px; padding: 4px 12px;">Cancel</button>
                </div>
            `;
              upgradeElement.appendChild(confirmDialog);
            
            // Add CSS to make it properly sized and styled
            const style = document.createElement('style');
            style.textContent = `
                .sell-confirm.compact-confirm {
                    position: absolute;
                    width: 220px; /* Increased width */
                    height: auto;
                    max-height: 180px; /* Increased max height */
                    font-size: 14px; /* Increased font size */
                    background: rgba(20, 20, 20, 0.95);
                    border: 2px solid #555; /* More visible border */
                    border-radius: 8px; /* Slightly more rounded corners */
                    padding: 10px 12px; /* More padding */
                    z-index: 1500;
                    top: -90px; /* Position it much higher above the card */
                    left: 50%;
                    transform: translateX(-50%) scale(1);
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.9), 0 0 8px rgba(255, 215, 0, 0.5); /* Enhanced shadow */
                    pointer-events: auto; /* Ensure it can receive clicks */
                }
                
                .sell-header {
                    font-weight: bold;
                    margin-bottom: 4px;
                    font-size: 13px;
                    text-align: center;
                }
                
                .sell-benefits {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    margin-bottom: 6px;
                }
                
                .sell-benefit {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    line-height: 1.2;
                }
                
                .benefit-icon {
                    font-size: 11px;
                    width: 12px;
                }
                
                .sell-buttons {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 2px;
                }
                
                .sell-yes, .sell-no {
                    padding: 2px 8px;
                    border-radius: 3px;
                    border: 1px solid #444;
                    background: #333;
                    cursor: pointer;
                    font-size: 11px;
                    transition: all 0.2s;
                }
                
                .sell-yes:hover {
                    background: #3a6e3a;
                }
                
                .sell-no:hover {
                    background: #6e3a3a;
                }
                
                /* Animation for the popup appearing */
                .sell-confirm.compact-confirm {
                    animation: popupAppear 0.25s ease-out forwards;
                }
                
                @keyframes popupAppear {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.8);
                    }
                    100% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1.2);
                    }
                }
            `;
            
            document.head.appendChild(style);
            
            const yesButton = confirmDialog.querySelector('.sell-yes');
            const noButton = confirmDialog.querySelector('.sell-no');
            
            yesButton.onclick = (e) => {
                e.stopPropagation();
                // Play sell sound first
                gameSounds.playUpgradeSellSound();
                
                const cardName = upgradeElement.getAttribute('data-name');
                
                // Mark the upgrade as being sold to prevent further effects
                if (this.state.playerStats.factoryUpgrades[cardName]) {
                    this.state.playerStats.factoryUpgrades[cardName]._beingSold = true;
                }
                
                // Apply benefits
                this.state.playerStats.chaosLevel = Math.max(0, 
                    this.state.playerStats.chaosLevel - chaosReduction);
                this.state.playerStats.ingredients = Math.min(20, 
                    this.state.playerStats.ingredients + ingredientGain);
                
                // Add refund if applicable
                if (refundAmount > 0) {
                    this.state.playerStats.money += refundAmount;
                }
                  // Show feedback message
                let feedbackMsg = `Sold upgrade: +${ingredientGain} ingredients, -${Math.round(chaosReduction)} chaos`;
                if (refundAmount > 0) {
                    feedbackMsg += `, +$${refundAmount} refund`;
                }
                
                // Special handling for Factory Expansion Blueprint
                if (cardName === "Factory Expansion Blueprint") {
                    // Reset max slots back to default when this upgrade is sold
                    this.state.playerStats.maxUpgradeSlots = 2;
                    feedbackMsg += `. Factory upgrade capacity reduced to 2.`;
                }
                
                this.showEffectMessage(feedbackMsg);
                
                // Remove permanent stats
                if (card.permanentStats) {
                    this.removeUpgradeStats(card.permanentStats);
                }
                
                // Remove from state - ensure we completely remove it
                delete this.state.playerStats.factoryUpgrades[cardName];
                  // Clean up any noodle appendages
                if (window.noodleAppendages && window.noodleAppendages.cleanup) {
                    window.noodleAppendages.cleanup(upgradeElement);
                }
                
                // Animate removal
                upgradeElement.classList.add('disappearing');
                setTimeout(() => upgradeElement.remove(), 300);
                
                // Cleanup style
                style.remove();
                
                // Update display
                this.updateDisplay();
            };
            
            noButton.onclick = (e) => {
                e.stopPropagation();
                confirmDialog.remove();
                style.remove();
            };
            
            // Close dialog when clicking outside
            const closeOnOutsideClick = (event) => {
                if (!confirmDialog.contains(event.target) && !upgradeElement.contains(event.target)) {
                    confirmDialog.remove();
                    style.remove();
                    document.removeEventListener('click', closeOnOutsideClick);
                }
            };
            
            // Add a slight delay before adding the event listener to prevent immediate closing
            setTimeout(() => {
                document.addEventListener('click', closeOnOutsideClick);
            }, 10);
        });
    }

    checkGameOver() {
        // Track turns at max chaos
        if (this.state.playerStats.chaosLevel >= 100) {
            this.state.playerStats.turnsAtMaxChaos = (this.state.playerStats.turnsAtMaxChaos || 0) + 1;
            this.state.playerStats.chaosControlTurns = (this.state.playerStats.chaosControlTurns || 0) + 1;
            this.state.playerStats.hadMaxChaos = true;
            
            if (this.state.playerStats.turnsAtMaxChaos >= 3) {
                gameSounds.playGameOverSound();
                this.endGame('chaos');
                this.isGameOver = true;
                return true;
            }
        } else {
            this.state.playerStats.turnsAtMaxChaos = 0;
        }

        // Check for worker game over, but only if we can't afford emergency workers
        if (this.state.playerStats.workerCount <= 0) {
            // Calculate emergency worker cost similar to playCard method
            const severityFactor = 4; // Equivalent to a -4 worker card
            const costPerWorker = Math.min(150, Math.max(50, 50 + (severityFactor * 15)));
            
            // If we can't afford workers, then it's game over
            if (this.state.playerStats.money < costPerWorker && this.state.playerStats.noodles === 0) {
                gameSounds.playGameOverSound();
                this.endGame('workers');
                this.isGameOver = true;
                return true;
            }
        }

        return false;
    }    pinUpgradeCard(cardName, card) {
        const upgradesGrid = document.querySelector('.upgrades-grid');
        const existingUpgrades = upgradesGrid.querySelectorAll('.upgrade-card');
        const maxSlots = this.state.playerStats.maxUpgradeSlots || 2; // Default to 2 slots
        
        if (existingUpgrades.length >= maxSlots) {            gameSounds.playUpgradeBlockedSound();
            this.showEffectMessage(`<span style="color: #ff6347;">Maximum of ${maxSlots} factory upgrades allowed! ${maxSlots < 3 ? "Install Factory Expansion Blueprint or " : ""}Sell an upgrade first.</span>`, true);
            return false;
        }
        
        const originalCard = document.querySelector('.card[data-selected="true"]');
        if (!originalCard) return false;

        // Get the positions and dimensions
        const origRect = originalCard.getBoundingClientRect();
        const gridRect = upgradesGrid.getBoundingClientRect();
        // Calculate target position
        const slotWidth = 120;
        const slotGap = 10;
        const slot = existingUpgrades.length;
        
        // Use the already defined maxSlots from above
        const totalWidth = (slotWidth * maxSlots) + (slotGap * (maxSlots - 1));
        const startX = gridRect.left + (gridRect.width - totalWidth) / 2;
        const targetX = startX + (slot * (slotWidth + slotGap));
        const targetY = gridRect.top;
        
        // Create the upgrade card that will be pinned
        const upgradeElement = document.createElement('div');
        upgradeElement.className = 'upgrade-card pinning';
        upgradeElement.setAttribute('data-name', cardName);
        upgradeElement.style.position = 'fixed';
        upgradeElement.style.left = `${origRect.left}px`;
        upgradeElement.style.top = `${origRect.top}px`;
        upgradeElement.style.width = `${origRect.width}px`;
        upgradeElement.style.height = `${origRect.height}px`;        upgradeElement.innerHTML = `
            <h4>${cardName}</h4>
            <div class="card-description-small">${card.description}</div>
            <div class="upgrade-effects">
                ${card.permanentStats || card.priceBonus ? 
                    `<div class="effects-label">Passive Effects:</div>
                    ${this.formatPermanentEffects(card.permanentStats, card)}` : ''
                }
            </div>
        `;
        
        // Add to the DOM
        document.body.appendChild(upgradeElement);
        
        // Apply cost to player's money
        if (card.cost) {
            this.state.playerStats.money -= card.cost;
            this.updateDisplay();
        }
        
        // Hide original card immediately
        if (originalCard) {
            originalCard.style.visibility = 'hidden';
            originalCard.style.display = 'none';
        }
        
        // Force a reflow to ensure all styles are applied
        void upgradeElement.offsetHeight;
        
        // Start the animation immediately
        upgradeElement.style.opacity = '1';
        upgradeElement.style.zIndex = '200';
        upgradeElement.style.transition = 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
        upgradeElement.style.transform = 'scale(0.8)';
        upgradeElement.style.left = `${targetX}px`;
        upgradeElement.style.top = `${targetY}px`;
          // Play the pin sound right away for better feedback
        try {
            gameSounds.playUpgradePinSound();
        } catch (e) {
            console.error('Error playing upgrade pin sound:', e);
        }
        
        // When animation completes, move to the grid
        setTimeout(() => {
            // Reset styles and move to grid
            const oldZIndex = upgradeElement.style.zIndex;
            upgradeElement.style = '';
            upgradeElement.style.zIndex = oldZIndex;
            upgradesGrid.appendChild(upgradeElement);
            
            // Add click handler for selling upgrades
            this.addUpgradeClickHandler(upgradeElement, card);
        }, 400); // Match the transition duration
        
        return true;
    }

    applyUpgradeStats(permanentStats) {
        if (!permanentStats) return;
        
        Object.entries(permanentStats).forEach(([stat, value]) => {
            switch(stat) {
                case 'prestigeGain':
                    this.state.playerStats.prestigeGainRate += value;
                    break;
                case 'chaosReduction':
                    this.state.playerStats.chaosGainRate *= (1 - value);
                    break;
                case 'workerEfficiency':
                    this.state.playerStats.workerLossRate *= (1 - value);
                    break;
                case 'ingredientGain':
                    this.state.playerStats.ingredientGainRate = (this.state.playerStats.ingredientGainRate || 0) + value;
                    break;
            }
        });
    }

    removeUpgradeStats(permanentStats) {
        if (!permanentStats) return;
        
        Object.entries(permanentStats).forEach(([stat, value]) => {
            switch(stat) {
                case 'prestigeGain':
                    this.state.playerStats.prestigeGainRate -= value;
                    break;
                case 'chaosReduction':
                    this.state.playerStats.chaosGainRate /= (1 - value);
                    break;
                case 'workerEfficiency':
                    this.state.playerStats.workerLossRate /= (1 - value);
                    break;
                case 'ingredientGain':
                    this.state.playerStats.ingredientGainRate = (this.state.playerStats.ingredientGainRate || 0) - value;
                    break;
            }
        });
    }

    checkAchievements() {
        const newAchievements = checkAchievements(this.state.playerStats, this.turn);
        
        // Play achievement sound if there are new achievements
        if (newAchievements.length > 0) {
            gameSounds.playAchievementSound();
        }

        // Display any newly unlocked achievements
        newAchievements.forEach(achievement => {
            this.showAchievementPopup(achievement.id, achievement);
        });
    }

    showAchievementPopup(name, achievement) {
        // Create container if it doesn't exist
        let container = document.querySelector('.achievement-popups-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'achievement-popups-container';
            document.body.appendChild(container);
        }

        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <h3>Achievement Unlocked!</h3>
            <p class="achievement-name">${name}</p>
            <p class="achievement-desc">${achievement.description}</p>
            <p class="achievement-reward">${achievement.reward}</p>
        `;
        
        // Add popup to container but don't show it yet
        container.appendChild(popup);
        
        // Force a reflow
        void popup.offsetHeight;
        
        // Add show class to trigger animation
        requestAnimationFrame(() => {
            popup.classList.add('show');
        });

        // Remove popup after animation
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.remove();
                // Reposition remaining popups
                Array.from(container.children).forEach((p, index) => {
                    p.style.transform = `translateY(${index * p.offsetHeight}px)`;
                });
            }, 300); // Match transition duration
        }, 5500);
    }

    endGame(reason = '') {
        // Show options button again
        const optionsButton = document.getElementById('options-button');
        if (optionsButton) {
            optionsButton.style.display = 'block';
        }

        // Convert reason to descriptive message
        const gameOverMessages = {
            'workers': `Your workforce has abandoned the factory. With only $${Math.round(this.state.playerStats.money)} in the bank, you can't afford resume production.`,
            'chaos': `After 3 days of complete chaos, the factory has been consumed. Forever lost to the noodle dimension.`,
            'ingredients': `With no ingredients left and only $${Math.round(this.state.playerStats.money)} in the bank, you can't afford to resume production.`
        };

        // Use custom reason if provided, otherwise use template
        const endMessage = this.gameOverReason || gameOverMessages[reason] || '';
        
        this.isGameOver = true;
        this.checkHighScore();
        
        // Reset all chaos effects and filters
        const body = document.body;
        body.classList.remove('chaos-level-1', 'chaos-level-2', 'chaos-level-3', 'chaos-level-max', 'chaos-noise');
        
        // Reset any game container filters
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.filter = 'none';
        }
        
        // Remove CRT effect
        const crtOverlay = document.querySelector('.crt-overlay');
        if (crtOverlay) {
            crtOverlay.classList.remove('active');
        }        // Stop background music
        if (window.musicLoops && window.musicLoops.stopLoop) {
            window.musicLoops.stopLoop();
        }
        
        // Stop noodle appendages system
        if (window.noodleAppendages && window.noodleAppendages.stop) {
            window.noodleAppendages.stop();
        }

        // Create game over screen
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over-screen';
        
        gameOverScreen.innerHTML = `
            <div class="game-over-content">
                <div class="game-over-header">GAME OVER</div>
                <p class="end-reason">${endMessage}</p>
                
                <div class="score-display">
                    <div class="current-score">
                        <h3>Your Score</h3>
                        <span class="score-value turn-score">${this.turn}</span>
                        <span class="score-label">TURNS</span>
                    </div>
                    <div class="high-score">
                        <h3>Best Score</h3>
                        <span class="score-value">${updateHighScore(this.turn)}</span>
                        <span class="score-label">TURNS</span>
                    </div>
                </div>

                <div class="final-stats">
                    <h3>Final Statistics</h3>
                    <div class="stat-grid">
                        <div class="final-stat prestige-color">
                            <span>Prestige</span>
                            <span>${Math.round(this.state.playerStats.pastaPrestige)}</span>
                        </div>
                        <div class="final-stat chaos-color">
                            <span>Chaos</span>
                            <span>${Math.round(this.state.playerStats.chaosLevel)}</span>
                        </div>
                        <div class="final-stat ingredients-color">
                            <span>Ingredients</span>
                            <span>${Math.round(this.state.playerStats.ingredients)}</span>
                        </div>
                        <div class="final-stat energy-color">
                            <span>Workers</span>
                            <span>${Math.round(this.state.playerStats.workerCount)}</span>
                        </div>
                        <div class="final-stat money-color">
                            <span>Money</span>
                            <span>$${Math.round(this.state.playerStats.money)}</span>
                        </div>
                        <div class="final-stat noodles-color">
                            <span>Noodles</span>
                            <span>${Math.round(this.state.playerStats.noodles)}</span>
                        </div>
                    </div>
                </div>

                <button id="new-game" class="button primary">Start New Run</button>

                <div class="achievements-section">
                    <h3>Achievements Earned</h3>
                    <div class="achievements-grid">
                        ${getUnlockedAchievements().map(id => `
                            <div class="achievement-item">
                                <span class="achievement-name">${id}</span>
                                <span class="achievement-desc">${ACHIEVEMENTS[id].description}</span>
                                <span class="achievement-reward">${ACHIEVEMENTS[id].reward}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="buttons-section secondary-buttons">
                    <button id="share-results" class="button secondary">Share Results</button>
                    <button id="home-button" class="button secondary small">Home</button>
                </div>
            </div>
        `;

        // Make sure the gameContainer exists before attempting to append
        if (!gameContainer) {
            console.error('Game container not found, cannot append game over screen');
            return;
        }
        
        // Add to container after setting innerHTML
        gameContainer.appendChild(gameOverScreen);

        // Hide cards and old message box
        this.hideCards();
        const messageBox = document.getElementById('game-messages');
        if (messageBox) {
            messageBox.style.display = 'none';
        }
        
        // Add event listeners AFTER the screen is in the DOM
        const homeButton = document.getElementById('home-button');
        const newGameButton = document.getElementById('new-game');
        const shareButton = document.getElementById('share-results');

        if (homeButton) {
            homeButton.onclick = () => {
                window.location.href = 'index.html';
            };
        }

        if (newGameButton) {
            newGameButton.onclick = () => {
                gameOverScreen.remove();
                if (messageBox) {
                    messageBox.style.display = 'block';
                }
                this.start();
            };
        }

        if (shareButton) {
            shareButton.onclick = () => {
                this.shareGameResults();
            };
        }

        // Clear saved game on game over
        clearSavedGame();
        
        // Update start screen buttons after game over
        this.updateStartScreenButtons();
    }

    start() {
        // Set game started flag first
        this.isGameStarted = true;

        // Remove continue button if it exists
        const continueButton = document.getElementById('continue-game');
        if (continueButton) {
            continueButton.parentElement.removeChild(continueButton);
        }

        // Hide start screen elements and options button
        const startButton = document.getElementById('start-game');
        const optionsButton = document.getElementById('options-button');
        if (startButton) {
            startButton.classList.add('hidden');
        }
        if (optionsButton) {
            optionsButton.style.display = 'none';
        }

        // Initialize with default state
        resetGameState();
        this.state = {
            playerStats: {
                pastaPrestige: 0,
                chaosLevel: 0,
                ingredients: Math.floor(Math.random() * 5) + 7, // Increased from 3+3 to 5+7
                workerCount: Math.floor(Math.random() * 4) + 8,
                money: 1000,
                noodles: 0,                noodleProductionRate: 1,
                noodleSalePrice: 5,
                maxUpgradeSlots: 2, // Default to 2 slots
                weeklyExpenses: 100,
                lostWorkers: 0,
                lostIngredients: 0,
                chaosSteadyTurns: 0,
                turnsAtMaxChaos: 0,
                hadMaxChaos: false,
                usedMagicCards: false,
                survivedStrikes: 0,
                strikeDeaths: 0,
                perfectCooks: 0,
                highestPrestigeDish: 0,
                chosenLesserWeevil: false,
                factoryUpgrades: {},
                prestigeGainRate: 1,
                chaosGainRate: 1,
                workerLossRate: 1,
                ingredientGainRate: 0.2, // Add base ingredient gain rate
                powerOutage: 0 // Add power outage tracking
            }
        };

        // Show and initialize factory lights
        const factoryLights = document.querySelector('#factory-lights');
        if (factoryLights) {
            factoryLights.classList.remove('hidden');
            this.initializeLights();
        }

        // Initialize with just a few lights on
        this.lightsStatus = new Array(11).fill('off');
        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * 11);
            this.lightsStatus[randomIndex] = 'on';
        }
        this.updateLights();

        this.isGameOver = false;
        this.turn = 1;
        this.achievements = new Set(getUnlockedAchievements()); // Reload achievements on new game
          // Reset all chaos effects
        const body = document.body;
        body.classList.remove('chaos-level-1', 'chaos-level-2', 'chaos-level-3', 'chaos-level-max', 'chaos-noise');
        const messageBox = document.getElementById('game-messages');
        messageBox.classList.remove('chaos-warning');
        
        // Clear lastDrawnCards to ensure no repeats from previous games
        clearLastDrawnCards();
        
        // Activate CRT effect
        document.querySelector('.crt-overlay').classList.add('active');

        // Play start game sound
        gameSounds.playStartGameSound();

        // Hide start button and show cards
        document.getElementById('start-game').classList.add('hidden');
        this.showCards();
        
        // Reset upgrade display
        const upgradesGrid = document.querySelector('.upgrades-grid');
        if (upgradesGrid) {
            upgradesGrid.innerHTML = '';
        }
          // Reset upgrade stats
        this.state.playerStats.factoryUpgrades = {};
        this.state.playerStats.prestigeGainRate = 1;
        this.state.playerStats.chaosGainRate = 1;
        this.state.playerStats.workerLossRate = 1;
        
        // Initialize noodle appendages system
        if (window.noodleAppendages && window.noodleAppendages.start) {
            window.noodleAppendages.start();
        }
        
        this.updateDisplay();
        this.drawNewCards();
        this.showSituationMessage("Welcome to your first day as Noodle Factory Manager! What's your first move?");

        // Clear any existing saved game when starting new game
        clearSavedGame();
    }

    checkProgression() {
        if (this.state.playerStats.pastaPrestige >= 100 && !this.unlocks.tier1) {
            this.unlocks.tier1 = true;
            this.unlockNewContent('tier1');
        }
        // ... more progression checks
    }

    tradeResources(from, to, amount) {
        const rates = {
            ingredients: { energy: 2, prestige: 5 },
            energy: { ingredients: 0.5, prestige: 3 },
            prestige: { ingredients: 0.2, energy: 0.3 }
        };
        // Implement trading logic
    }    triggerChaosEvent(message) {
        const messageBox = document.getElementById('game-messages');
        if (!messageBox) return;

        // Track chaos events for "Chaos Theory" achievement
        this.state.playerStats.chaosEventsTriggered = (this.state.playerStats.chaosEventsTriggered || 0) + 1;

        // Add randomization for sounds
        if (Math.random() > 0.85) {
            gameSounds.playChaosSound();
            gameSounds.createGrumbleSound(this.state.playerStats.chaosLevel / 50);
        }

        // Check if there's a recent card action message in history (last 2 turns)
        const recentMessages = this.messageHistory.slice(0, 3);
        const hasRecentCardActionMsg = recentMessages.some(
            msg => msg.type === 'feedback' && msg.turn === this.turn && !msg.message.includes('Perfect balance') && 
                  !msg.message.includes('Peak pasta') && !msg.message.includes('well-oiled machine')
        );

        // Only show chaos message if there's no recent card action message
        // or add to history silently if a card was just played
        if (!hasRecentCardActionMsg) {
            this.showChaosMessage(message);
        } else {
            // Just add to history without displaying
            this.addMessageToHistory(message, 'chaos-warning');
        }
    }

    checkHighScore() {
        const currentScore = this.turn;
        const previousHigh = getHighScore();
        const isNewHighScore = currentScore > previousHigh;
        
        // Add null check before accessing classList
        const scoreDisplay = document.querySelector('.score-display');
        if (scoreDisplay && isNewHighScore) {
            scoreDisplay.classList.add('new-high-score');
        }
    }

    reduceWorkers(amount) {
        const finalWorkerCount = this.state.playerStats.workerCount - amount;
        
        // Only reduce if we won't go below 1 worker
        if (finalWorkerCount >= 1) {
            this.state.playerStats.workerCount = finalWorkerCount;
            return true;
        }
        
        // If reduction would cause game over, prevent it
        return false;
    }

    updateState() {
        // Track steady chaos
        if (this.state.playerStats.chaosLevel === 50) {
            this.state.playerStats.chaosSteadyTurns++;
        } else {
            this.state.playerStats.chaosSteadyTurns = 0;
        }
        
        // Track lost ingredients from chaos events
        if (this.state.playerStats.chaosLevel >= 75) {
            this.state.playerStats.lostIngredients++;
        }
    }

    autoSave() {
        if (this.isGameOver) return;
        
        const saved = saveGameState({
            ...this.state,
            turn: this.turn
        });

        if (!saved) {
            console.error('Failed to auto-save game state');
        }
    }    showMessage(message, type) {
        if (!message) return; // Skip empty messages
        
        // Add message to history first
        this.addMessageToHistory(message, type);
        
        // Get the message box element
        const messageBox = document.getElementById('game-messages');
        if (!messageBox) return;
        
        // Clear existing content
        messageBox.innerHTML = '';
          // Get the 3 most recent messages from history to display
        const recentMessages = this.messageHistory.slice(0, 3);
        
        // Display messages with newest on top but invert the order of 2nd and 3rd messages
        // so that production/sales related messages appear in middle position and 
        // factory status/situation messages appear in bottom position
        const displayMessages = [...recentMessages];
        if (displayMessages.length >= 3) {
            // Swap positions of the 2nd and 3rd messages
            [displayMessages[1], displayMessages[2]] = [displayMessages[2], displayMessages[1]];
        }
        
        // Create container elements for each message
        displayMessages.forEach((entry, index) => {
            const messageContainer = document.createElement('div');
            messageContainer.className = `message-container ${entry.type}`;
            
            // Add visual separator between messages
            if (index > 0) {
                messageContainer.classList.add('previous-message');
                
                // Add small visual divider between messages
                const divider = document.createElement('div');
                divider.className = 'message-divider';
                messageBox.appendChild(divider);
            }
            
            // Determine message type color and icon
            let messageColor, messageIcon;
            
            if (entry.type === 'situation') {
                messageColor = '#3498db'; // Blue for situations
                messageIcon = '🏭';            } else if (entry.type === 'chaos-warning') {
                messageColor = '#e74c3c'; // Red for chaos warnings
                messageIcon = '⚠️';
            } else if (entry.type === 'production') {
                messageColor = '#f39c12'; // Orange for production
                messageIcon = '🍜';
            } else if (entry.type === 'sales') {
                messageColor = '#2ecc71'; // Green for sales
                messageIcon = '💰';
            } else if (entry.type === 'emergency-feedback') {
                // Special style for emergency messages
                messageColor = '#ff6347'; // Tomato red for emergency messages
                messageIcon = '🚨';
                // Add a special class to make the message more prominent
                messageContainer.classList.add('emergency-message');
            } else {
                // Default feedback message style
                messageColor = '#ffd700'; // Yellow for general feedback
                messageIcon = '📝';
                
                // Special cases for feedback messages
                if (entry.message.includes('expenses')) {
                    messageColor = '#e67e22'; // Darker orange for expenses
                    messageIcon = '💸';
                } else if (entry.message.includes('generated a bonus') || entry.message.includes('bonus ingredient')) {
                    messageColor = '#9b59b6'; // Purple for bonus messages
                    messageIcon = '✨';
                }
            }
            
            // Create icon element if we have one
            if (messageIcon) {
                const iconSpan = document.createElement('span');
                iconSpan.className = 'message-icon';
                iconSpan.textContent = messageIcon;
                messageContainer.appendChild(iconSpan);
            }
            
            // Create text container with appropriate color
            const textSpan = document.createElement('span');
            textSpan.className = 'message-text';
            textSpan.innerHTML = entry.message;
            textSpan.style.color = messageColor;
            
            messageContainer.appendChild(textSpan);
            
            // Do NOT add turn/day number to the main message box
            // Only keep it for the history popup
            
            messageBox.appendChild(messageContainer);
        });
        
        // Add global class for message box type - use most recent message type
        if (recentMessages.length > 0) {
            messageBox.className = `message-box ${recentMessages[0].type}`;
        }
    }    showEffectMessage(message, isEmergency = false) {
        if (!message) return;
        
        if (isEmergency) {
            // Store the emergency message for display
            this._emergencyEffectMessage = message;
            
            // Show it immediately
            this.showMessage(message, 'emergency-feedback');
            
            // Set a timeout to prevent it from being immediately overwritten
            if (this._emergencyMessageTimeout) {
                clearTimeout(this._emergencyMessageTimeout);
            }
            
            this._emergencyMessageTimeout = setTimeout(() => {
                this._emergencyEffectMessage = null;
            }, this._emergencyMessageDisplayTime);
            
            // Log for debugging
            console.log("Emergency message shown:", message);
        } else {
            // Normal effect messages
            this.showMessage(message, 'feedback');
        }
    }
    
    showSituationMessage(message) {
        if (!message) return;
        this.showMessage(message, 'situation');
    }
    
    showChaosMessage(message) {
        if (!message) return;
        this.showMessage(message, 'chaos-warning');
    }
    
    showProductionMessage(message) {
        if (!message) return;
        this.showMessage(message, 'production');
    }
    
    showSalesMessage(message) {
        if (!message) return;
        this.showMessage(message, 'sales');
    }
    
    // This is now a no-op since we handle messages directly
    processMessageQueue() {}

    // Add a message to the history
    addMessageToHistory(message, type) {
        // Create a new history entry with timestamp and turn number
        const historyEntry = {
            message: message,
            type: type,
            timestamp: new Date().toLocaleTimeString(),
            turn: this.turn // Add the current turn number
        };
        
        // Add to the beginning for newest-first order
        this.messageHistory.unshift(historyEntry);
        
        // Trim history if it exceeds the maximum
        if (this.messageHistory.length > this.maxMessageHistory) {
            this.messageHistory.pop();
        }
    }

    updateLowWorkerStats() {
        // Track consecutive turns with low worker count for achievement
        if (this.state.playerStats.workerCount <= 10 && this.state.playerStats.workerCount > 0) {
            this.state.playerStats.lowWorkerConsecutiveTurns = (this.state.playerStats.lowWorkerConsecutiveTurns || 0) + 1;
            this.state.playerStats.lowWorkerTurns = (this.state.playerStats.lowWorkerTurns || 0) + 1;
        } else {
            // Reset consecutive count if worker count is above threshold
            this.state.playerStats.lowWorkerConsecutiveTurns = 0;
        }
    }

    updateSingleWorkerStreak() {
        // Track turns with exactly one worker for achievement
        if (this.state.playerStats.workerCount === 1) {
            this.state.playerStats.singleWorkerTurns = (this.state.playerStats.singleWorkerTurns || 0) + 1;
            this.state.playerStats.singleWorkerConsecutiveTurns = (this.state.playerStats.singleWorkerConsecutiveTurns || 0) + 1;
        } else {
            // Reset consecutive count if worker count is not 1
            this.state.playerStats.singleWorkerConsecutiveTurns = 0;
        }
    }    checkBalancedStats() {
        // Check for special balanced stats and achievements
        const stats = this.state.playerStats;
        
        // Check for perfect balance (chaos exactly at 50%)
        if (stats.chaosLevel === 50) {
            stats.balancedChaosTurns = (stats.balancedChaosTurns || 0) + 1;
            
            // Potential special effects or achievements for maintaining balance
            if (stats.balancedChaosTurns >= 3) {
                // Add small ingredient bonus for maintaining balance
                if (Math.random() < 0.3) {
                    const bonusAmount = Math.floor(Math.random() * 2) + 1;
                    stats.ingredients = Math.min(20, stats.ingredients + bonusAmount);
                    this.showEffectMessage(`Balance bonus: +${bonusAmount} ingredients!`);
                }
                
                // Chance for small prestige gain
                if (stats.balancedChaosTurns >= 5 && Math.random() < 0.2) {
                    const prestigeBonus = 0.5;
                    stats.pastaPrestige += prestigeBonus;
                    this.showEffectMessage(`Perfect balance generates a prestige bonus!`);
                }
            }
        } else {
            // Reset balance streak if chaos is not at 50%
            stats.balancedChaosTurns = 0;
        }
        
        // Check for "Balanced Diet" achievement - exactly equal levels of prestige, chaos, and ingredients
        if (stats.pastaPrestige === stats.chaosLevel && stats.chaosLevel === stats.ingredients && stats.ingredients > 0) {
            stats.balancedStatsTurns = (stats.balancedStatsTurns || 0) + 1;
            
            // Small Easter egg message
            if (stats.balancedStatsTurns === 1) {
                this.showEffectMessage("Perfect harmony achieved: prestige, chaos, and ingredients all perfectly balanced!");
            }
        } else {
            stats.balancedStatsTurns = 0;
        }
        
        // Check for high efficiency (high worker count + low chaos)
        if (stats.workerCount >= 20 && stats.chaosLevel <= 25) {
            stats.efficientFactoryTurns = (stats.efficientFactoryTurns || 0) + 1;
            
            // Possible production bonus for efficiency
            if (stats.efficientFactoryTurns >= 2 && Math.random() < 0.4) {
                stats.noodleProductionRate *= 1.05; // 5% production boost
                this.showEffectMessage(`Efficient factory operation increases production rate!`);
            }
        } else {
            // Reset efficiency streak
            stats.efficientFactoryTurns = 0;
        }
    }    updateChaosStreak() {
        const stats = this.state.playerStats;
        
        // Track "Dancing With Danger" (maintain chaos 90-99 for 5 consecutive turns)
        if (stats.chaosLevel >= 90 && stats.chaosLevel < 100) {
            stats.highChaosStreakTurns = (stats.highChaosStreakTurns || 0) + 1;
        } else {
            stats.highChaosStreakTurns = 0;
        }
        
        // Track chaos stability for "Chaotic Neutral" achievement
        if (stats.chaosLevel === 50) {
            stats.chaosSteadyTurns = (stats.chaosSteadyTurns || 0) + 1;
        } else {
            stats.chaosSteadyTurns = 0;
        }
        
        // Track "Edge of Tomorrow" (exactly 99 chaos for 10 consecutive turns)
        if (stats.chaosLevel === 99) {
            stats.edgeOfTomorrowTurns = (stats.edgeOfTomorrowTurns || 0) + 1;
        } else {
            stats.edgeOfTomorrowTurns = 0;
        }
        
        // Track near-max chaos consecutive turns for "Death's Door" risk achievement
        if (stats.chaosLevel === 99) {
        }
        
        // Track "Edge of Tomorrow" (exactly 99 chaos for 10 consecutive turns)
        if (stats.chaosLevel === 99) {
            stats.edgeOfTomorrowTurns = (stats.edgeOfTomorrowTurns || 0) + 1;
        } else {
            stats.edgeOfTomorrowTurns = 0;
        }
        
        // Track near-max chaos consecutive turns for "Death's Door" risk achievement
        if (stats.chaosLevel === 99) {
            stats.nearMaxChaosConsecutiveTurns = (stats.nearMaxChaosConsecutiveTurns || 0) + 1;
        } else {
            stats.nearMaxChaosConsecutiveTurns = 0;
        }
    }
    
    checkRiskAchievements() {
        // Check for achievements related to high-risk gameplay
        const stats = this.state.playerStats;
        
        // Check for playing risky with high chaos
        if (stats.chaosLevel >= 90) {
            stats.highChaosRiskTurns = (stats.highChaosRiskTurns || 0) + 1;
        } else {
            stats.highChaosRiskTurns = 0;
        }
        
        // Check for playing with very low ingredients
        if (stats.ingredients <= 2) {
            stats.lowIngredientsRiskTurns = (stats.lowIngredientsRiskTurns || 0) + 1;
        } else {
            stats.lowIngredientsRiskTurns = 0;
        }
        
        // Check for playing with very low worker count
        if (stats.workerCount <= 3) {
            stats.lowWorkerRiskTurns = (stats.lowWorkerRiskTurns || 0) + 1;
        } else {
            stats.lowWorkerRiskTurns = 0;
        }
        
        // Check for playing with very low money
        if (stats.money <= 100) {
            stats.lowMoneyRiskTurns = (stats.lowMoneyRiskTurns || 0) + 1;
        } else {
            stats.lowMoneyRiskTurns = 0;
        }
        
        // Check for combined risks (living dangerously!)
        if ((stats.chaosLevel >= 75) && (stats.ingredients <= 3 || stats.workerCount <= 5 || stats.money <= 200)) {
            stats.combinedRiskTurns = (stats.combinedRiskTurns || 0) + 1;
        } else {
            stats.combinedRiskTurns = 0;
        }
    }    processStrike() {
        const stats = this.state.playerStats;
        
        // If there's no active strike, do nothing
        if (!stats.strikeActive) return;
        
        // Decrease the strike duration
        stats.strikeDuration--;
        
        // Check if the strike has ended
        if (stats.strikeDuration <= 0) {
            // Strike has ended, restore workers and mark it as resolved
            stats.strikeActive = false;
            
            // Restore workers (some may have left permanently)
            const workersLost = Math.floor(stats.workersBeforeStrike * 0.2); // About 20% leave permanently
            stats.workerCount = Math.max(1, stats.workersBeforeStrike - workersLost);
            
            // Track that player survived a strike
            stats.survivedStrikes = (stats.survivedStrikes || 0) + 1;
            
            // Show a message about the strike ending
            this.showEffectMessage("The strike has ended! " + 
                                  (workersLost > 0 ? workersLost + " workers left permanently." : "All workers have returned."), true);
            
            // Update display
            this.updateDisplay();
        }
    }

    loadGame() {
        const savedState = loadGameState();
        if (!savedState) {
            return;
        }

        // Clear lastDrawnCards when loading a saved game to prevent repeats from previous sessions
        clearLastDrawnCards();

        this.isGameStarted = true;

        document.getElementById('start-game').classList.add('hidden');
        const continueButton = document.getElementById('continue-game');
        if (continueButton) {
            continueButton.remove();
        }
        
        const optionsButton = document.getElementById('options-button');
        if (optionsButton) {
            optionsButton.style.display = 'none';
        }

        this.state = savedState;
        this.turn = savedState.turn;
        this.isGameOver = false;

        const factoryLights = document.querySelector('#factory-lights');
        if (factoryLights) {
            factoryLights.classList.remove('hidden');
            this.initializeLights();
        }

        document.body.classList.remove('chaos-level-1', 'chaos-level-2', 'chaos-level-3', 'chaos-level-max', 'chaos-noise');
        document.getElementById('game-messages').style.display = 'block';

        this.showCards();        this.updateDisplay();
        this.drawNewCards();
        
        // Stop all music first to prevent multiple tracks from playing
        if (window.musicLoops) window.musicLoops.stopLoop();
        if (window.loungeMusic) window.loungeMusic.stopLoop();
        if (window.dnbMusic) window.dnbMusic.stopLoop();
        
        // Initialize SoundManager to properly set up the selected music
        if (window.soundManager && !window.soundManager.initialized) {
            window.soundManager.init().then(() => {
                console.log("SoundManager initialized during game load");
            });
        }
        
        gameSounds.playStartGameSound();
        this.showEffectMessage("Game loaded successfully!");
    }

    shareGameResults() {
        const gameOverContent = document.querySelector('.game-over-content');
        if (!gameOverContent) return;

        html2canvas(gameOverContent, {
            backgroundColor: '#1a1a1a',
            scale: 2,
            logging: false
        }).then(canvas => {
            canvas.toBlob(async (blob) => {
                const shareData = {
                    title: 'Noodle Factory Chaos',
                    text: `I survived ${this.turn} turns in Noodle Factory Chaos! Can you beat my score?`,
                    files: [
                        new File([blob], 'noodle-factory-score.png', { 
                            type: 'image/png' 
                        })
                    ]
                };

                try {
                    if (navigator.canShare && navigator.canShare(shareData)) {
                        await navigator.share(shareData);
                    }
                } catch (err) {
                    console.log('Sharing failed:', err);
                }
            });
        });
    }

    // Show the message history modal
    showMessageHistory() {
        const modal = document.querySelector('.message-history-modal');
        const overlay = document.querySelector('.modal-overlay');
        const content = document.querySelector('.message-history-content');
        
        if (!modal || !overlay || !content) {
            console.error('Message history modal elements not found');
            return;
        }
        
        // Clear existing content
        content.innerHTML = '';
        
        // If there are no messages, show a placeholder
        if (this.messageHistory.length === 0) {
            content.innerHTML = '<div class="message-history-empty">No messages yet.</div>';
        } else {
            // Add each message to the content
            this.messageHistory.forEach(entry => {
                const messageItem = document.createElement('div');
                messageItem.className = `message-history-item ${entry.type}`;
                
                const timeElement = document.createElement('div');
                timeElement.className = 'message-history-time';
                timeElement.textContent = entry.timestamp;
                
                const textElement = document.createElement('div');
                textElement.className = 'message-history-text';
                textElement.innerHTML = entry.message;
                
                const turnElement = document.createElement('div');
                turnElement.className = 'message-history-turn';
                turnElement.textContent = `Day ${entry.turn}`;
                
                messageItem.appendChild(timeElement);
                messageItem.appendChild(textElement);
                messageItem.appendChild(turnElement);
                content.appendChild(messageItem);
            });
        }
        
        // Show the modal and overlay
        modal.classList.add('active');
        overlay.classList.add('active');
    }

    // Hide the message history modal
    hideMessageHistory() {
        const modal = document.querySelector('.message-history-modal');
        const overlay = document.querySelector('.modal-overlay');
        
        if (modal) modal.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    // Setup message history click handlers
    setupMessageHistoryHandlers() {
        // Add click handler to the messages box
        const messagesBox = document.getElementById('game-messages');
        if (messagesBox) {
            messagesBox.addEventListener('click', () => this.showMessageHistory());
        }
        
        // Add click handlers to close the modal
        const closeButton = document.querySelector('.message-history-close');
        const overlay = document.querySelector('.modal-overlay');
        
        if (closeButton) {
            closeButton.addEventListener('click', () => this.hideMessageHistory());
        }
        
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideMessageHistory();
                }
            });
        }
        
        // Add escape key handler for both message history and pause menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // If message history is open, close it first
                const messageHistoryModal = document.querySelector('.message-history-modal.active');
                if (messageHistoryModal) {
                    this.hideMessageHistory();
                } else if (this.isGameStarted && !this.isGameOver) {
                    // Otherwise toggle pause menu if game is active
                    this.togglePauseMenu();
                }
            }
        });
    }

    // Create a pause menu overlay
    createPauseMenu() {
        // Check if menu already exists
        if (document.querySelector('.pause-menu-overlay')) {
            return;
        }        // Create the pause menu overlay
        const pauseOverlay = document.createElement('div');
        pauseOverlay.className = 'pause-menu-overlay';
        pauseOverlay.style.position = 'fixed';
        pauseOverlay.style.top = '0';
        pauseOverlay.style.left = '0';
        pauseOverlay.style.right = '0';
        pauseOverlay.style.bottom = '0';
        pauseOverlay.style.background = 'rgba(0, 0, 0, 0.65)';
        pauseOverlay.style.zIndex = '2000';
        pauseOverlay.style.display = 'flex';
        pauseOverlay.style.alignItems = 'center';
        pauseOverlay.style.justifyContent = 'center';
        
        const pauseMenu = document.createElement('div');
        pauseMenu.className = 'pause-menu';
        pauseMenu.style.background = '#181B22';
        pauseMenu.style.padding = '20px 30px';
        pauseMenu.style.borderRadius = '10px';
        pauseMenu.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
        pauseMenu.style.textAlign = 'center';
        pauseMenu.style.maxWidth = '90%';
        pauseMenu.style.zIndex = '2001';
        
        pauseMenu.innerHTML = `
            <h2>Game Paused</h2>
            <div class="pause-menu-buttons">
                <button id="continue-run" class="button primary">Continue Run</button>
                <button id="new-run" class="button primary">New Run</button>
                <button id="options" class="button secondary">Options</button>
            </div>
        `;        
        pauseOverlay.appendChild(pauseMenu);
        document.body.appendChild(pauseOverlay);
        
        // Mark game as paused
        this.isPaused = true;
        
        // Add event listeners
        document.getElementById('continue-run').addEventListener('click', () => {
            this.closePauseMenu();
        });
        
        document.getElementById('new-run').addEventListener('click', () => {
            this.closePauseMenu();
            if (confirm('Start a new run? Current progress will be lost.')) {
                this.start();
            }
        });
        
        document.getElementById('options').addEventListener('click', () => {
            window.location.href = 'options.html';
        });
        
        this.isPaused = true;
    }
    
    // Close the pause menu
    closePauseMenu() {
        const pauseMenu = document.querySelector('.pause-menu-overlay');
        if (pauseMenu) {
            pauseMenu.remove();
        }
        this.isPaused = false;
    }
    
    // Toggle pause menu
    togglePauseMenu() {
        if (this.isPaused) {
            this.closePauseMenu();
            // Remove pause state flag when closing the menu
            localStorage.removeItem('gamePauseState');
        } else {
            this.createPauseMenu();
            // Set flag indicating we're in a game - used when returning from options
            localStorage.setItem('fromActiveGame', 'true');
            // Set pause state flag when opening the menu
            localStorage.setItem('gamePauseState', 'paused');
        }
    }

    // Setup help button
    setupHelpButton() {
        // First, check if a help button already exists
        let helpButton = document.getElementById('help-button');
        
        if (!helpButton) {
            // Only create a new button if one doesn't already exist
            const gameContainer = document.getElementById('game-container');
            if (!gameContainer) return;
            
            helpButton = document.createElement('button');
            helpButton.id = 'help-button';
            helpButton.className = 'help-button';
            helpButton.innerHTML = '<span>?</span>';
            helpButton.title = 'Game Help';
            
            gameContainer.appendChild(helpButton);
        }
        
        // Remove any existing click handlers to prevent duplicates
        const oldHelpButton = helpButton.cloneNode(true);
        if (helpButton.parentNode) {
            helpButton.parentNode.replaceChild(oldHelpButton, helpButton);
        }
        helpButton = oldHelpButton;
        
        // Add event listener to the help button (whether it's new or existing)
        helpButton.addEventListener('click', () => this.showHelp());
    }

    // Show help popup
    showHelp() {
        // Create overlay and help container
        const helpOverlay = document.createElement('div');
        helpOverlay.className = 'help-overlay';
        
        const helpContainer = document.createElement('div');
        helpContainer.className = 'help-container';
        
        // Get a random tooltip from the TOOLTIPS array
        const randomTip = TOOLTIPS[Math.floor(Math.random() * TOOLTIPS.length)];
        
        // Basic help content without giving away too much
        helpContainer.innerHTML = `
            <h2>Noodle Factory Basics</h2>
            <div class="help-section">
                <h3>Basic Gameplay</h3>
                <p>Each turn, you'll be presented with two cards. Choose one to steer your factory's fate.</p>
                <p>Different symbols indicate different effects:</p>
                <ul>
                    <li><span class="positive">+</span> generally increases something</li>
                    <li><span class="negative">-</span> generally decreases something</li>
                    <li>Multiple symbols (like <span class="positive">+++</span>) indicate stronger effects</li>
                </ul>
                <p>The factory lights offer insight into your overall status - keep them on!</p>
            </div>
            <div class="help-section">
                <h3>Controls & Navigation</h3>
                <ul>
                    <li>Press <kbd>ESC</kbd> during a game to access the pause menu</li>
                    <li>Click on the message box to see your message history</li>
                    <li>Click on factory upgrades to sell them for resources</li>
                    <li>The game saved automatically each turn - click Continue when returning to resume your run</li>
                </ul>
            </div>
            <div class="help-section">
                <h3>Your Resources</h3>
                <ul>
                    <li><span class="prestige-color">Prestige</span>: Your factory's reputation</li>    
                    <li><span class="ingredients-color">Ingredients</span>: Raw materials for creating noodles</li>
                    <li><span class="energy-color">Workers</span>: Staff operating your factory</li>
                    <li><span class="chaos-color">Chaos</span>: Disorder in your factory operations</li>
                    <li><span class="money-color">Money</span>: Currency for transactions</li>
                    <li><span class="noodles-color">Noodles</span>: Your main product. Specifically how much current noodle in stock</li> 
                    </ul>
                <p>Keep an eye on these resources as they can affect your factory's performance.</p>
            </div>
            
            <div class="help-section">
                <h3>Discover as You Play</h3>
                <p>The rest is up to you to discover! Watch how resources interact, observe patterns in the chaos, and learn what makes your factory thrive.</p>
            </div>
            
            <div class="help-tip">
            <h3>Hints & Tips</h3>
                <p><em>Factory Wisdom:</em> "${randomTip}"</p>
            </div>
            
            <div class="help-buttons">
                <button id="close-help" class="button primary">Got it!</button>
            </div>
           <p style="text-align: center;">© 2025 Gumbysoft. All rights reserved.</p>
        `;
        
        helpOverlay.appendChild(helpContainer);
        document.body.appendChild(helpOverlay);
        
        // Add event listener to close button
        document.getElementById('close-help').addEventListener('click', () => {
            helpOverlay.remove();
        });
        
        // Close on overlay click (outside the help container)
        helpOverlay.addEventListener('click', (e) => {
            if (e.target === helpOverlay) {
                helpOverlay.remove();
            }
        });
        
        // Add ESC key to close help
        const closeHelpOnEsc = (e) => {
            if (e.key === 'Escape') {
                helpOverlay.remove();
                document.removeEventListener('keydown', closeHelpOnEsc);
            }
        };
        document.addEventListener('keydown', closeHelpOnEsc);
    }

    showEmergencyPastaModal() {
        // First check if player has any noodles to sell
        if (this.state.playerStats.noodles <= 0) {
            this.showEffectMessage("No noodles available to sell! Make some pasta first.");
            gameSounds.playBadCardSound();
            return;
        }
        
        // Check if the emergency button is on cooldown
        if (this.emergencySaleCooldown && this.turn - this.emergencySaleCooldown < 3) {
            const turnsLeft = 3 - (this.turn - this.emergencySaleCooldown);
            this.showEffectMessage(`Emergency sales on cooldown! Available in ${turnsLeft} turn${turnsLeft > 1 ? 's' : ''}.`);
            gameSounds.playBadCardSound();
            return;
        }
        
        // Play a sound for emergency button press
        gameSounds.playChaosSound();
        
        // Calculate the prices and sale quantities for each option with randomization
        const currentNoodles = this.state.playerStats.noodles;
        const basePrice = this.state.playerStats.noodleSalePrice;
        
        // Flash Sale (randomize discount between 70% and 85%)
        const flashSaleDiscount = 0.70 + Math.random() * 0.15;
        const flashSalePrice = Math.floor(basePrice * flashSaleDiscount);
        // Random sale quantity between 80% and 100% of current noodles
        const flashSalePercent = 0.8 + Math.random() * 0.2;
        const flashSaleQuantity = Math.floor(currentNoodles * flashSalePercent);
        const flashSaleValue = flashSalePrice * flashSaleQuantity;
        
        // Generate consequences for flash sale (possible chaos increase)
        const flashSaleChaosChange = Math.random() < 0.5 ? Math.floor(Math.random() * 5) + 3 : 0;
        
        // Bulk Sale (randomize discount between 55% and 70%)
        const bulkSaleDiscount = 0.55 + Math.random() * 0.15;
        const bulkSalePrice = Math.floor(basePrice * bulkSaleDiscount);
        // Random sale quantity between 90% and 100% of current noodles
        const bulkSalePercent = 0.9 + Math.random() * 0.1;
        const bulkSaleQuantity = Math.floor(currentNoodles * bulkSalePercent);
        const bulkSaleValue = bulkSalePrice * bulkSaleQuantity;
        
        // Generate consequences for bulk sale 
        // (chaos reduction between 5 and 15, but possible worker loss)
        const bulkSaleChaosChange = -(Math.floor(Math.random() * 10) + 5);
        const bulkSaleWorkerChange = Math.random() < 0.6 ? -(Math.floor(Math.random() * 2) + 1) : 0;
        
        // Premium Sale (randomize premium between 110% and 140%)
        const premiumMultiplier = 1.1 + Math.random() * 0.3;
        const premiumSalePrice = Math.floor(basePrice * premiumMultiplier);
        // Random sale quantity between 40% and 60% of current noodles
        const premiumSalePercent = 0.4 + Math.random() * 0.2;
        const premiumSaleQuantity = Math.floor(currentNoodles * premiumSalePercent);
        const premiumSaleValue = premiumSalePrice * premiumSaleQuantity;
        
        // Generate consequences for premium sale (prestige gain but could affect ingredients)
        const premiumPrestigeChange = Math.floor(Math.random() * 3) + 1;
        const premiumIngredientsChange = Math.random() < 0.4 ? -(Math.floor(Math.random() * 3) + 1) : 0;
        
        // Format display values
        const flashSaleDisplay = `$${flashSalePrice}/ea (${flashSaleQuantity} noodles, $${flashSaleValue})`;
        const bulkSaleDisplay = `$${bulkSalePrice}/ea (${bulkSaleQuantity} noodles, $${bulkSaleValue})`;
        const premiumSaleDisplay = `$${premiumSalePrice}/ea (${premiumSaleQuantity} noodles, $${premiumSaleValue})`;
        
        // Arrays of potential buyers for different sale types
        const flashSaleBuyers = [
            "A local restaurant chain makes a quick order.",
            "The nearby school cafeteria needs pasta ASAP.",
            "A panic buyer clears out your stock before a storm.",
            "Your competitor's factory had a breakdown and they need emergency supplies.",
            "A passing truck driver buys everything to resell at a roadside stand.",
            "The discount grocery store wants all your odd-shaped pasta.",
            "A desperate caterer needs immediate backup for a large event.",
            "Your landlord accepts pasta as partial payment on your rent.",
            "A food bank is collecting donations for a community event.",
            "A hungry flash mob appears and buys everything."
        ];
        
        const bulkSaleBuyers = [
            "The military offers a bulk contract at a reduced price.",
            "A prison system needs to feed thousands of inmates.",
            "A cruise ship docks and needs to restock quickly.",
            "A survivalist group is preparing for the apocalypse... with pasta.",
            "A budget supermarket chain takes all your stock for their clearance aisle.",
            "A pasta-loving cult buys in bulk for their annual ceremony.",
            "A university dining service needs a semester's worth of pasta.",
            "A government stockpile program makes an emergency purchase.",
            "A budget airline needs to replace their in-flight meals.",
            "The local pasta-eating competition needs supplies for this weekend."
        ];
        
        const premiumBuyers = [
            "A Michelin-starred restaurant recognizes your quality.",
            "A celebrity chef features your pasta on their cooking show.",
            "An exclusive dinner party for diplomats requires your finest product.",
            "A luxury cruise liner orders for their gourmet restaurant.",
            "An eccentric billionaire's personal chef makes a special request.",
            "A royal family's kitchen requests your pasta for a state dinner.",
            "A famous food critic wants to feature your noodles in a magazine.",
            "A high-end Italian restaurant chain signs an exclusive deal.",
            "A fancy hotel prepares for their annual pasta festival.",
            "The governor's mansion calls for an emergency delivery."
        ];
        
        // Randomly select buyer scenarios for each option
        const flashSaleBuyer = flashSaleBuyers[Math.floor(Math.random() * flashSaleBuyers.length)];
        const bulkSaleBuyer = bulkSaleBuyers[Math.floor(Math.random() * bulkSaleBuyers.length)];
        const premiumBuyer = premiumBuyers[Math.floor(Math.random() * premiumBuyers.length)];
        
        // Store the selected buyers and sale options for later use in processEmergencyOption
        this.saleOptions = {
            discount: {
                buyer: flashSaleBuyer,
                price: flashSalePrice,
                quantity: flashSaleQuantity,
                total: flashSaleValue,
                chaosChange: flashSaleChaosChange
            },
            bulk: {
                buyer: bulkSaleBuyer,
                price: bulkSalePrice,
                quantity: bulkSaleQuantity,
                total: bulkSaleValue,
                chaosChange: bulkSaleChaosChange,
                workerChange: bulkSaleWorkerChange
            },
            premium: {
                buyer: premiumBuyer,
                price: premiumSalePrice,
                quantity: premiumSaleQuantity,
                total: premiumSaleValue,
                prestigeChange: premiumPrestigeChange,
                ingredientsChange: premiumIngredientsChange
            }
        };
        
        // Store the selected buyers for backward compatibility
        this.selectedBuyers = {
            discount: flashSaleBuyer,
            bulk: bulkSaleBuyer,
            premium: premiumBuyer
        };
        
        // Create the emergency modal if it doesn't exist
        let modal = document.querySelector('.emergency-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'emergency-modal';
            modal.innerHTML = `
                <div class="emergency-header">
                    <h2>Emergency Pasta Sale</h2>
                    <button class="emergency-close">&times;</button>
                </div>
                <div class="emergency-options">
                    <div class="emergency-option" data-id="discount">
                        <div class="option-header">
                            <span class="option-title">Flash Sale</span>
                            <span class="option-price">${flashSaleDisplay}</span>
                        </div>
                        <p class="buyer-desc">${flashSaleBuyer}</p>
                        <p class="option-desc">Quick sell at ${Math.round(flashSaleDiscount * 100)}% of normal price. ${flashSaleChaosChange > 0 ? `Warning: May increase chaos by ${flashSaleChaosChange}.` : 'No additional effects.'}</p>
                    </div>
                    <div class="emergency-option" data-id="bulk">
                        <div class="option-header">
                            <span class="option-title">Bulk Deal</span>
                            <span class="option-price">${bulkSaleDisplay}</span>
                        </div>
                        <p class="buyer-desc">${bulkSaleBuyer}</p>
                        <p class="option-desc">Mass sale at ${Math.round(bulkSaleDiscount * 100)}% price. Reduces chaos by ${Math.abs(bulkSaleChaosChange)}. ${bulkSaleWorkerChange < 0 ? `Warning: Will lose ${Math.abs(bulkSaleWorkerChange)} worker${Math.abs(bulkSaleWorkerChange) > 1 ? 's' : ''}.` : ''}</p>
                    </div>
                    <div class="emergency-option" data-id="premium">
                        <div class="option-header">
                            <span class="option-title">Premium Rush</span>
                            <span class="option-price">${premiumSaleDisplay}</span>
                        </div>
                        <p class="buyer-desc">${premiumBuyer}</p>
                        <p class="option-desc">Limited quantity at ${Math.round(premiumMultiplier * 100)}% price. Gain ${premiumPrestigeChange} prestige. ${premiumIngredientsChange < 0 ? `Warning: May lose ${Math.abs(premiumIngredientsChange)} ingredient${Math.abs(premiumIngredientsChange) > 1 ? 's' : ''}.` : ''}</p>
                    </div>
                </div>
                <p class="emergency-warning">Will put sales operations on cooldown for 3 turns!</p>
            `;
            document.body.appendChild(modal);
            
            // Add style for the warning
            const style = document.createElement('style');
            style.textContent = `
                .emergency-warning {
                    color: #ff6347;
                    font-size: 12px;
                    text-align: center;
                    margin-top: 10px;
                    font-style: italic;
                }
            `;
            document.head.appendChild(style);
            
            // Close button functionality
            const closeBtn = modal.querySelector('.emergency-close');
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
                setTimeout(() => {
                    if (!modal.classList.contains('active')) {
                        modal.style.display = 'none';
                    }
                }, 300);
            });
            
            // Option click functionality
            const options = modal.querySelectorAll('.emergency-option');
            options.forEach(option => {
                option.addEventListener('click', () => {
                    const optionId = option.getAttribute('data-id');
                    this.processEmergencyOption(optionId);
                    modal.classList.remove('active');
                    setTimeout(() => modal.style.display = 'none', 300);
                });
            });
        } else {
            // Update the existing modal with new prices and buyer descriptions
            const flashSaleOption = modal.querySelector('.emergency-option[data-id="discount"]');
            const bulkSaleOption = modal.querySelector('.emergency-option[data-id="bulk"]');
            const premiumSaleOption = modal.querySelector('.emergency-option[data-id="premium"]');
            
            // Update the options
            if (flashSaleOption) {
                flashSaleOption.querySelector('.buyer-desc').textContent = flashSaleBuyer;
                flashSaleOption.querySelector('.option-price').textContent = flashSaleDisplay;
                flashSaleOption.querySelector('.option-desc').textContent = `Quick sell at ${Math.round(flashSaleDiscount * 100)}% of normal price. ${flashSaleChaosChange > 0 ? `Warning: May increase chaos by ${flashSaleChaosChange}.` : 'No additional effects.'}`;
            }
            if (bulkSaleOption) {
                bulkSaleOption.querySelector('.buyer-desc').textContent = bulkSaleBuyer;
                bulkSaleOption.querySelector('.option-price').textContent = bulkSaleDisplay;
                bulkSaleOption.querySelector('.option-desc').textContent = `Mass sale at ${Math.round(bulkSaleDiscount * 100)}% price. Reduces chaos by ${Math.abs(bulkSaleChaosChange)}. ${bulkSaleWorkerChange < 0 ? `Warning: Will lose ${Math.abs(bulkSaleWorkerChange)} worker${Math.abs(bulkSaleWorkerChange) > 1 ? 's' : ''}.` : ''}`;
            }
            if (premiumSaleOption) {
                premiumSaleOption.querySelector('.buyer-desc').textContent = premiumBuyer;
                premiumSaleOption.querySelector('.option-price').textContent = premiumSaleDisplay;
                premiumSaleOption.querySelector('.option-desc').textContent = `Limited quantity at ${Math.round(premiumMultiplier * 100)}% price. Gain ${premiumPrestigeChange} prestige. ${premiumIngredientsChange < 0 ? `Warning: May lose ${Math.abs(premiumIngredientsChange)} ingredient${Math.abs(premiumIngredientsChange) > 1 ? 's' : ''}.` : ''}`;
            }
        }
        
        // Show the modal
        modal.style.display = 'flex';
        
        // Add active class after a small delay for animation
        setTimeout(() => modal.classList.add('active'), 10);
    }

    processEmergencyOption(optionId) {
        // Get the selected options from the new saleOptions object
        const options = this.saleOptions ? this.saleOptions[optionId] : null;
        
        // Fall back to old method if saleOptions is not available
        if (!options) {
            // Need to check if we have noodles to sell
            if (this.state.playerStats.noodles <= 0) {
                this.showEffectMessage("No noodles available to sell!");
                gameSounds.playBadCardSound();
                return;
            }
            
            // Get outcome descriptions for different sale types
            const successScenarios = [
                "The transaction completes smoothly.",
                "They pay promptly and even help load the truck.",
                "The deal concludes with a handshake and promise of future business.",
                "They're so pleased they leave a generous tip for your factory workers.",
                "The buyer promises to recommend you to others.",
                "The sale happens just in time to avoid a storage overflow.",
                "Your sales team celebrates the unexpected revenue.",
                "Your accountant does a happy dance when seeing the numbers."
            ];
            
            const chaosReductionScenarios = [
                "The empty storage areas create a sense of calm around the factory.",
                "Clearing inventory reduces pressure on your production team.",
                "Workers feel relieved as the crowded storage areas empty out.",
                "The factory runs more smoothly with less backlog to manage.",
                "The cleaning crew can finally access those hard-to-reach corners.",
                "Your logistics manager's eye stops twitching for the first time in weeks.",
                "The pasta-stacking hazards are temporarily eliminated."
            ];
            
            const prestigeScenarios = [
                "Word of your quality spreads through high-end culinary circles.",
                "A food magazine mentions your factory in their latest issue.",
                "Your factory's reputation grows among fine dining establishments.",
                "Industry experts take notice of your exceptional product.",
                "Your sales team leverages this deal to approach other premium clients.",
                "Photos of your pasta appear on a famous food blog."
            ];
            
            const currentNoodles = this.state.playerStats.noodles;
            const basePrice = this.state.playerStats.noodleSalePrice;
            let soldNoodles, soldPrice, income, chaosReduction = 0, prestigeGain = 0;
            
            // Get the selected buyer scenario from showEmergencyPastaModal
            const buyerMessage = this.selectedBuyers ? this.selectedBuyers[optionId] : '';
            let outcomeMessage;
            
            switch (optionId) {
                case 'discount':
                    // Flash Sale: Sell all noodles at 80% price
                    soldNoodles = currentNoodles;
                    soldPrice = Math.floor(basePrice * 0.8);                    income = soldNoodles * soldPrice;
                    
                    // Track highest single sale for achievement
                    if (income > this.state.playerStats.highestSingleSale) {
                        this.state.playerStats.highestSingleSale = income;
                    }
                    
                    outcomeMessage = successScenarios[Math.floor(Math.random() * successScenarios.length)];
                    
                    this.state.playerStats.noodles = 0;
                    this.state.playerStats.money += income;
                    
                    this.showEffectMessage(`${outcomeMessage} Sold ${soldNoodles} noodles at $${soldPrice} each for $${income} total.`);
                    gameSounds.playCardSound();
                    break;
                    
                case 'bulk':
                    // Bulk Clearance: Sell all noodles at 65% price, reduce chaos by 10%                    soldNoodles = currentNoodles;
                    soldPrice = Math.floor(basePrice * 0.65);
                    income = soldNoodles * soldPrice;
                    chaosReduction = Math.min(10, this.state.playerStats.chaosLevel);
                    
                    // Track highest single sale for achievement
                    if (income > this.state.playerStats.highestSingleSale) {
                        this.state.playerStats.highestSingleSale = income;
                    }
                    
                    outcomeMessage = chaosReductionScenarios[Math.floor(Math.random() * chaosReductionScenarios.length)];
                    
                    this.state.playerStats.noodles = 0;
                    this.state.playerStats.money += income;
                    this.state.playerStats.chaosLevel = Math.max(0, this.state.playerStats.chaosLevel - chaosReduction);
                    
                    this.showEffectMessage(`${outcomeMessage} Sold ${soldNoodles} noodles at $${soldPrice} each for $${income} total. Chaos reduced by ${chaosReduction}.`);
                    gameSounds.playUpgradePinSound();
                    break;
                    
                case 'premium':
                    // Premium Rush: Sell half noodles at 120% price, gain 3 prestige                    soldNoodles = Math.floor(currentNoodles / 2);
                    soldPrice = Math.floor(basePrice * 1.2);
                    income = soldNoodles * soldPrice;
                    prestigeGain = 3;
                    
                    // Track highest single sale for achievement
                    if (income > this.state.playerStats.highestSingleSale) {
                        this.state.playerStats.highestSingleSale = income;
                    }
                    
                    outcomeMessage = prestigeScenarios[Math.floor(Math.random() * prestigeScenarios.length)];
                    
                    this.state.playerStats.noodles -= soldNoodles;
                    this.state.playerStats.money += income;
                    this.state.playerStats.pastaPrestige += prestigeGain;
                    
                    this.showEffectMessage(`${outcomeMessage} Sold ${soldNoodles} premium noodles at $${soldPrice} each for $${income} total. Prestige increased by ${prestigeGain}!`);
                    gameSounds.playAchievementSound();
                    break;
            }
            
            // Set cooldown
            this.emergencySaleCooldown = this.turn;
            
            // Update display after processing the option
            this.updateDisplay();
            
            // Check for achievements after emergency actions
            this.checkAchievements();
            
            return;
        }
        
        // Need to check if we have noodles to sell
        if (this.state.playerStats.noodles <= 0) {
            this.showEffectMessage("No noodles available to sell!");
            gameSounds.playBadCardSound();
            return;
        }
        
        // Get appropriate scenario descriptions
        const successScenarios = [
            "The transaction completes smoothly.",
            "They pay promptly and even help load the truck.",
            "The deal concludes with a handshake and promise of future business.",
            "They're so pleased they leave a generous tip for your factory workers.",
            "The buyer promises to recommend you to others.",
            "The sale happens just in time to avoid a storage overflow.",
            "Your sales team celebrates the unexpected revenue.",
            "Your accountant does a happy dance when seeing the numbers."
        ];
        
        const chaosReductionScenarios = [
            "The empty storage areas create a sense of calm around the factory.",
            "Clearing inventory reduces pressure on your production team.",
            "Workers feel relieved as the crowded storage areas empty out.",
            "The factory runs more smoothly with less backlog to manage.",
            "The cleaning crew can finally access those hard-to-reach corners.",
            "Your logistics manager's eye stops twitching for the first time in weeks.",
            "The pasta-stacking hazards are temporarily eliminated."
        ];
        
        const prestigeScenarios = [
            "Word of your quality spreads through high-end culinary circles.",
            "A food magazine mentions your factory in their latest issue.",
            "Your factory's reputation grows among fine dining establishments.",
            "Industry experts take notice of your exceptional product.",
            "Your sales team leverages this deal to approach other premium clients.",
            "Photos of your pasta appear on a famous food blog."
        ];
        
        let outcomeMessage;
        let soundEffect = 'card';
        
        // Process the sale based on the selected option
        switch (optionId) {
            case 'discount':
                // Flash Sale
                outcomeMessage = successScenarios[Math.floor(Math.random() * successScenarios.length)];
                
                // Apply effects
                this.state.playerStats.noodles -= options.quantity;
                this.state.playerStats.money += options.total;
                
                // Apply consequences
                if (options.chaosChange > 0) {
                    this.state.playerStats.chaosLevel = Math.min(100, this.state.playerStats.chaosLevel + options.chaosChange);
                    outcomeMessage += ` Chaos increased by ${options.chaosChange}!`;
                }
                
                this.showEffectMessage(`${outcomeMessage} Sold ${options.quantity} noodles at $${options.price} each for $${options.total} total.`);
                gameSounds.playCardSound();
                break;
                
            case 'bulk':
                // Bulk Sale
                outcomeMessage = chaosReductionScenarios[Math.floor(Math.random() * chaosReductionScenarios.length)];
                
                // Apply effects
                this.state.playerStats.noodles -= options.quantity;
                this.state.playerStats.money += options.total;
                
                // Apply chaos reduction
                if (options.chaosChange < 0) {
                    this.state.playerStats.chaosLevel = Math.max(0, this.state.playerStats.chaosLevel + options.chaosChange);
                }
                
                // Apply worker consequences
                if (options.workerChange < 0) {
                    this.state.playerStats.workerCount = Math.max(1, this.state.playerStats.workerCount + options.workerChange);
                    outcomeMessage += ` ${Math.abs(options.workerChange)} worker${Math.abs(options.workerChange) > 1 ? 's' : ''} quit due to the rushed workload.`;
                }
                
                this.showEffectMessage(`${outcomeMessage} Sold ${options.quantity} noodles at $${options.price} each for $${options.total} total. Chaos reduced by ${Math.abs(options.chaosChange)}.`);
                gameSounds.playUpgradePinSound();
                break;
                
            case 'premium':
                // Premium Sale
                outcomeMessage = prestigeScenarios[Math.floor(Math.random() * prestigeScenarios.length)];
                
                // Apply effects
                this.state.playerStats.noodles -= options.quantity;
                this.state.playerStats.money += options.total;
                this.state.playerStats.pastaPrestige += options.prestigeChange;
                
                // Apply ingredient consequences
                if (options.ingredientsChange < 0) {
                    this.state.playerStats.ingredients = Math.max(0, this.state.playerStats.ingredients + options.ingredientsChange);
                    outcomeMessage += ` Used ${Math.abs(options.ingredientsChange)} ingredient${Math.abs(options.ingredientsChange) > 1 ? 's' : ''} to meet quality standards.`;
                }
                
                this.showEffectMessage(`${outcomeMessage} Sold ${options.quantity} premium noodles at $${options.price} each for $${options.total} total. Prestige increased by ${options.prestigeChange}!`);
                gameSounds.playAchievementSound();
                break;
        }
        
        // Set cooldown
        this.emergencySaleCooldown = this.turn;
        
        // Update display after processing the option
        this.updateDisplay();
        
        // Check for achievements after emergency actions
        this.checkAchievements();
    }

    // Create a quick smoke effect for instantly disappearing cards
    createQuickSmoke(x, y) {
        // Create a minimal number of particles for a quick effect
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'smoke-particle';
            
            // Random position around the center
            const offsetX = -15 + Math.random() * 30;
            const offsetY = -15 + Math.random() * 30;
            particle.style.left = `${x + offsetX}px`;
            particle.style.top = `${y + offsetY}px`;
            
            // Bigger particles for better visibility
            const size = 5 + Math.random() * 8;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Use white/gray color
            const brightness = 220 + Math.floor(Math.random() * 35);
            particle.style.backgroundColor = `rgba(${brightness}, ${brightness}, ${brightness}, 0.9)`;
            
            // Add random movement
            const angle = Math.random() * Math.PI * 2;
            const distance = 40 + Math.random() * 60;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            
            // Quick animation
            document.body.appendChild(particle);
            requestAnimationFrame(() => {
                particle.style.animation = 'smoke 0.3s ease-out forwards';
            });
            
            // Remove after animation completes
            setTimeout(() => particle.remove(), 300);
        }
    }
}

function createSmokeParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'smoke-particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 100;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 100;
    
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    
    document.body.appendChild(particle);
    
    particle.style.animation = 'smoke 1s ease-out forwards';
    
    setTimeout(() => particle.remove(), 1000);
}

function createFireParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'fire-particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 80;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 100;
    
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
}

function createWaterSplash(x, y) {
    const splash = document.createElement('div');
    splash.className = 'water-splash';
    splash.style.left = `${x}px`;
    splash.style.top = `${y}px`;
    
    for (let i = 0; i < 8; i++) {
        const droplet = document.createElement('div');
        droplet.className = 'water-droplet';
        const angle = (i / 8) * Math.PI * 2;
        droplet.style.setProperty('--angle', `${angle}rad`);
        splash.appendChild(droplet);
    }
    
    document.body.appendChild(splash);
    setTimeout(() => splash.remove(), 1000);
}

function createNoodleExplosion(x, y) {
    const noodleCount = 12;
    for (let i = 0; i < noodleCount; i++) {
        const noodle = document.createElement('div');
        noodle.className = 'exploding-noodle';
        noodle.style.left = `${x}px`;
        noodle.style.top = `${y}px`;
        
        const angle = (i / noodleCount) * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        noodle.style.setProperty('--tx', `${tx}px`);
        noodle.style.setProperty('--ty', `${ty}px`);
        noodle.style.setProperty('--rotation', `${Math.random() * 720}deg`);
        
        document.body.appendChild(noodle);
        setTimeout(() => noodle.remove(), 1000);
    }
}

function createMoneyEffect(x, y) {
    const symbols = ['$', '💰', '💵'];
    const symbolCount = 8;

    for (let i = 0; i < symbolCount; i++) {
        const symbol = document.createElement('div');
        symbol.className = 'money-symbol';
        symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        symbol.style.left = `${x}px`;
        symbol.style.top = `${y}px`;

        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 80;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - 100;

        symbol.style.setProperty('--tx', `${tx}px`);
        symbol.style.setProperty('--ty', `${ty}px`);

        document.body.appendChild(symbol);
        setTimeout(() => symbol.remove(), 1500);
    }
}

class SoundManager {
    constructor() {
        this.enabled = false;
        this.initialized = false;
    }    async init() {
        if (this.initialized) return;
        
        try {
            // Make sure we have all music engines available
            await Promise.all([
                import('../audio/music/bgm.js').then(m => { window.musicLoops = m.musicLoops; }),
                import('../audio/music/bgm2.js').then(m => { window.loungeMusic = m.loungeMusic; }),
                import('../audio/music/bgm3.js').then(m => { window.dnbMusic = m.dnbMusic; })
            ]);
            
            // Make sure all music is stopped first
            window.musicLoops.stopLoop();
            window.loungeMusic.stopLoop();
            window.dnbMusic.stopLoop();
            
            const musicTrack = localStorage.getItem('selectedMusicTrack');
            console.log("Initializing music with track:", musicTrack);
            
            // If random is selected, pick a new random track each time
            if (musicTrack === 'random') {
                const availableTracks = ['default', 'lounge', 'dnb'];
                const randomTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
                console.log("Random music selection chose:", randomTrack);
                
                if (randomTrack === 'lounge') {
                    if (window.loungeMusic.enabled) {
                        await window.loungeMusic.startLoop();
                        console.log("Pho Real music started from random selection");
                    }
                } else if (randomTrack === 'dnb') {
                    if (window.dnbMusic.enabled) {
                        await window.dnbMusic.startLoop();
                        console.log("Dry Ramen Breaks music started from random selection");
                    }
                } else {
                    if (window.musicLoops.enabled) {
                        await window.musicLoops.startLoop();
                        console.log("Default music started from random selection");
                    }
                }
            } else if (musicTrack === 'lounge') {
                if (window.loungeMusic.enabled) {
                    await window.loungeMusic.startLoop();
                    console.log("Pho Real music started");
                }
            } else if (musicTrack === 'dnb') {
                if (window.dnbMusic.enabled) {
                    await window.dnbMusic.startLoop();
                    console.log("Dry Ramen Breaks music started");
                }
            } else {
                if (window.musicLoops.enabled) {
                    await window.musicLoops.startLoop();
                    console.log("Default music started");
                }
            }
            
            this.enabled = true;
            this.initialized = true;
        } catch (e) {
            console.error('Audio initialization failed:', e);
        }
    }

    playCardSound(volumeMultiplier = 1) {
        this.ensureAudioContext();
        if (!this.ctx) return;
        try {
            const mainGain = this.ctx.createGain();
            const beepGain = this.ctx.createGain();
            const noiseGain = this.ctx.createGain();
            
            const pentatonicNotes = {
                'C3': 130.81, 'Eb3': 155.56, 'F3': 174.61, 
                'G3': 196.00, 'Bb3': 233.08, 'C4': 261.63
            };

            const notes = Object.values(pentatonicNotes);
            const note1 = notes[Math.floor(Math.random() * notes.length)];
            const note2 = notes[Math.floor(Math.random() * notes.length)];
            
            mainGain.gain.value = 1.2 * volumeMultiplier;
        } catch (e) {
            console.warn('Error playing card sound:', e);
        }
    }

    playDrawCardsSound() {
        this.ensureAudioContext();
        if (!this.ctx) return;
        try {
            const mainGain = this.ctx.createGain();
            mainGain.gain.value = 0.03; // Keep volume low
            
            const musicalNotes = {
                'C4': 261.63,
                'Eb4': 311.13,
                'F4': 349.23,
                'G4': 392.00,
                'Bb4': 466.16
            };

            const notesList = Object.values(musicalNotes);
            const startIndex = Math.floor(Math.random() * (notesList.length - 1));
            const note1 = notesList[startIndex];
            const note2 = notesList[startIndex + 1];

            const osc1 = this.ctx.createOscillator();
            osc1.type = 'sine';
            osc1.frequency.value = note1;
            const gain1 = this.ctx.createGain();
            gain1.gain.setValueAtTime(0, this.ctx.currentTime);
            gain1.connect(mainGain);
            mainGain.connect(this.gainNode);

            const gain2 = this.ctx.createGain();
            const osc2 = this.ctx.createOscillator();
            osc2.type = 'sine';
            osc2.frequency.value = note2;
            gain2.gain.setValueAtTime(0, this.ctx.currentTime);
            gain2.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.15);
            gain2.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
            osc2.connect(gain2);
            gain2.connect(mainGain);

            osc1.start(this.ctx.currentTime);
            osc2.start(this.ctx.currentTime + 0.1);
            osc1.stop(this.ctx.currentTime + 0.2);
            osc2.stop(this.ctx.currentTime + 0.3);

            setTimeout(() => {
                mainGain.disconnect();
                gain1.disconnect();
                gain2.disconnect();
            }, 400);
        } catch (e) {
            console.warn('Error playing draw cards sound:', e);
        }
    }
}

// Create and expose SoundManager globally
const soundManager = new SoundManager();
window.soundManager = soundManager;

const game = new Game();
document.getElementById('start-game').addEventListener('click', () => game.start());

function setupNoodleWiggle() {
    const noodleText = document.querySelector('.jiggly');
    if (!noodleText) return;

    noodleText.classList.add('active');
    
    setInterval(() => {
        if (Math.random() < 0.2) {
            noodleText.classList.remove('active');
            void noodleText.offsetWidth;
            noodleText.classList.add('active');
        }
    }, 3000);
}

function setupInitialAudio() {
    const handleUserInteraction = async () => {
        console.log("User interaction - initializing audio");
        await soundManager.init();
    };

    ['touchstart', 'click'].forEach(eventType => {
        document.addEventListener(eventType, handleUserInteraction, { once: true });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const assetLoader = new AssetLoader();
    await assetLoader.init();

    setupNoodleWiggle();
    setupInitialAudio();
    
    // Create game instance if it doesn't exist
    if (!window.gameInstance) {
        window.gameInstance = new Game();
    }
    
    // Check for any flags indicating we should auto-load the game
    const shouldLoadGameImmediately = 
        localStorage.getItem('FORCE_LOAD_GAME') === 'true' ||
        localStorage.getItem('AUTOLOAD_GAME') === 'true' ||
        new URLSearchParams(window.location.search).get('action') === 'loadGame';
    
    if (shouldLoadGameImmediately && localStorage.getItem('noodleFactoryGameState')) {
        console.log('Auto-loading game detected');
        
        // Clear any localStorage flags we may have set
        localStorage.removeItem('FORCE_LOAD_GAME');
        localStorage.removeItem('AUTOLOAD_GAME');
        
        // Hide start screen buttons immediately to prevent any flash of content
        const startButton = document.getElementById('start-game');
        const continueButton = document.getElementById('continue-game');
        const optionsButton = document.getElementById('options-button');
        
        if (startButton) startButton.style.display = 'none';
        if (continueButton) continueButton.style.display = 'none';
        if (optionsButton) optionsButton.style.display = 'none';
        
        // Load the game after a minimal delay to ensure DOM is fully ready
        setTimeout(() => {
            window.gameInstance.loadGame();
        }, 10);
    } else {
        // Only show start/continue buttons if not auto-loading
        window.gameInstance.updateStartScreenButtons();
    }
});

function canPlayCard(card) {
    if (card.effects.some(effect => effect.type === 'ingredients' && effect.value > 0)) {
        return true;
    }
    
    if (card.effects.some(effect => effect.type === 'ingredients' && effect.value < 0)) {
        return gameState.ingredients >= Math.abs(Math.min(...card.effects
            .filter(e => e.type === 'ingredients')
            .map(e => e.value)));
    }
    
    return true;
}

function processTurn() {
    const newWorkers = Math.floor(Math.random() * 4);
    gameState.workers += newWorkers;
    
    if (gameState.ingredients > 0) {
        gameState.ingredients = Math.max(0, gameState.ingredients - 1);
    }
}

document.addEventListener('keydown', (e) => {
    if (!game || !e.ctrlKey) return;

    switch (e.key.toLowerCase()) {
        case 'c':
            game.state.playerStats.chaosLevel = Math.min(100, game.state.playerStats.chaosLevel + 15);
            game.updateDisplay();
            break;
        case 'x':
            game.state.playerStats.chaosLevel = Math.max(0, game.state.playerStats.chaosLevel - 15);
            game.updateDisplay();
            break;
        case 'p':
            game.state.playerStats.pastaPrestige = Math.min(100, game.state.playerStats.pastaPrestige + 15);
            game.updateDisplay();
            break;
        case 'o':
            game.state.playerStats.pastaPrestige = Math.max(0, game.state.playerStats.pastaPrestige - 15);
            game.updateDisplay();
            break;
        case ' ':  // Add space key handler
            if (gameSounds) {
                e.preventDefault();
                gameSounds.playRandomChatter();
                console.log('Debug: Triggered random chatter sound');
            }
            break;
    }
});

document.getElementById('options-button')?.addEventListener('click', () => {
    window.location.href = 'options.html';
});

export default Game;