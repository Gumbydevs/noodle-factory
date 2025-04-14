import { CARDS, getRandomCard, applyStatModifiers, applyUpgradeEffects } from './cards.js';
import events from './events.js';
import { gameState, updateResource, resetGameState, updateChaosEffects, saveGameState, loadGameState, clearSavedGame, hasSavedGame } from './state.js';
import { ACHIEVEMENTS, checkAchievements, getUnlockedAchievements, resetAchievements } from './achievements.js';
import { updateHighScore, getHighScore } from './highscore.js';
import { triggerNoodleRoll, handleCardClick, resetCardState, addCardHoverEffects } from './animation.js';
import { gameSounds } from '../audio.js'; // Note the .js extension
import { AssetLoader } from './assetLoader.js';

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
        this.isDisplayingMessage = false;

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
                lostIngredients: 0,
                chaosSteadyTurns: 0,
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
                workerLossRate: 1
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
        }

        // Add initial message
        const messageBox = document.getElementById('game-messages');
        if (messageBox) {
            messageBox.textContent = "Click below to start managing your Noodle Factory!";
            messageBox.classList.remove('feedback');
            messageBox.classList.add('situation');
        }
    }

    initializeLights() {
        const lightsContainer = document.querySelector('.lights-container');
        if (!lightsContainer) return;

        // Clear existing lights
        lightsContainer.innerHTML = '';

        // Create 11 light bulbs instead of 15
        for (let i = 0; i < 11; i++) {
            const light = document.createElement('div');
            light.className = 'light-bulb off';
            lightsContainer.appendChild(light);
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

        // Update game effects based on lights
        this.applyLightingEffects(this.countActiveLights(lights));
    }

    applyLightingEffects(activeLights) {
        const gameContainer = document.getElementById('game-container');
        const totalLights = 11;
        const lightRatio = activeLights / totalLights;
        const stats = this.state.playerStats;

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
        }

        // Light ratio factor
        if (lightRatio < 0.3) {
            darknessLevel *= 0.8;
        } else if (lightRatio < 0.6) {
            darknessLevel *= 0.9;
        }

        // Generate random color tint based on chaos level
        let colorTint = '';
        if (stats.chaosLevel >= 25) {
            // Generate random hue that changes smoothly - increased range from ±20 to ±45
            const hueRotation = Math.sin(Date.now() / 5000) * 45; // Increased amplitude for more noticeable color shifts
            // Increased saturation boost from 20% to 50% max
            const saturationBoost = Math.min(1.5, 1 + (stats.chaosLevel / 100)); 
            // Add a slight contrast boost for more punch
            const contrastBoost = Math.min(1.2, 1 + (stats.chaosLevel / 200));
            colorTint = `hue-rotate(${hueRotation}deg) saturate(${saturationBoost}) contrast(${contrastBoost})`;
        }

        // Combine brightness with color effects
        const combinedFilter = `brightness(${Math.max(0.5, darknessLevel)}) ${colorTint}`;
        gameContainer.style.filter = combinedFilter;

        // Adjust glow intensity inversely to darkness
        const glowIntensity = Math.min(12.5, (1 / darknessLevel) * 1.2);
        document.querySelectorAll('.light-glow').forEach(el => {
            el.style.setProperty('--glow-intensity', glowIntensity.toString());
        });

        // Apply gameplay effects based on lighting only
        if (lightRatio < 0.5 && this.turn > 1) {
            this.state.playerStats.workerLossRate *= 1.2;
        }
        if (lightRatio < 0.3 && this.turn > 1) {
            this.state.playerStats.chaosGainRate *= 1.3;
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

        if (stats.workerCount >= 40 && stats.ingredients >= 15 && stats.pastaPrestige >= 40) {
            statsContainer.classList.add('perfect-state');
            this.showEffectMessage("Peak pasta production achieved!");
        }

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
        }
        if (window.dnbMusic && window.dnbMusic.updateChaosLevel) {
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
            }
        }
        this._lastChaosLevel = chaos;
        
        // Add proper mobile-friendly chaos classes
        if (chaos >= 90) { // Changed from 100 to 90
            body.classList.add('chaos-level-max');
            if (!('ontouchstart' in window)) {
                body.classList.add('chaos-noise');
            }
            this.triggerChaosEvent("Reality itself begins to melt!");
            
            if (Math.random() < 0.4) {
                this.triggerNoodleRain();
            }
        }
        else if (chaos >= 75) {
            body.classList.add('chaos-level-3');
            if (!('ontouchstart' in window)) {
                body.classList.add('chaos-noise');
            }
            this.triggerChaosEvent("The factory warps between dimensions!");
            
            if (Math.random() < 0.2) {
                this.triggerNoodleRain();
            }
        }
        else if (chaos >= 50) {
            body.classList.add('chaos-level-2');
            this.triggerChaosEvent("Strange distortions appear in the corners of your vision...");
        }
        else if (chaos >= 25) {
            body.classList.add('chaos-level-1');
            this.triggerChaosEvent("Something feels slightly off...");
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
    }

    drawNewCards() {
        // Remove any existing cards
        document.querySelectorAll('.card').forEach(card => {
            card.remove();
        });

        gameSounds.playDrawCardsSound();
        
        const cardsContainer = document.getElementById('cards-container');
        cardsContainer.classList.remove('hidden');

        // Get available cards
        const availableCards = Object.keys(CARDS).filter(cardName => {
            if (cardName === "Return of Reggie") {
                return this.state.playerStats.reggieEscaped === true;
            }
            if (CARDS[cardName].type === "upgrade") {
                const requiredPrestige = CARDS[cardName].requirements?.prestige || 0;
                return this.state.playerStats.pastaPrestige >= requiredPrestige;
            }
            return true;
        });

        // Separate upgrade and regular cards
        const upgradeCards = availableCards.filter(cardName => CARDS[cardName].type === "upgrade");
        const regularCards = availableCards.filter(cardName => CARDS[cardName].type !== "upgrade");

        // Select cards based on game state - ensure we don't get 2 upgrade cards
        let leftCard, rightCard;
        if (upgradeCards.length > 0 && regularCards.length > 0 && Math.random() < 0.3) {
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

        cardsContainer.innerHTML = `
            <div class="card" id="card-left">
                ${CARDS[leftCard].type === "upgrade" ? 
                    `<div class="upgrade-label">Prestigious Upgrade</div>
                    <h3>${leftCard}</h3>
                    <div class="card-description">${CARDS[leftCard].description}</div>
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
            </div>
            <div class="card" id="card-right">
                ${CARDS[rightCard].type === "upgrade" ? 
                    `<div class="upgrade-label">Prestigious Upgrade</div>
                    <h3>${rightCard}</h3>
                    <div class="card-description">${CARDS[rightCard].description}</div>
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
        });

        // Add click handlers with requirement checks
        document.getElementById('card-left').onclick = () => {
            if (this.checkCardPlayable(CARDS[leftCard], true)) {
                this.playCard(leftCard);
            }
        };
        document.getElementById('card-right').onclick = () => {
            if (this.checkCardPlayable(CARDS[rightCard], true)) {
                this.playCard(rightCard);
            }
        };
    }

    checkCardPlayable(card, isClick = false) {  // Add isClick parameter
        if (!card) return true;
        
        // For upgrades, check prestige requirement and slot availability
        if (card.type === "upgrade") {
            // First check prestige requirement
            if (card.requirements?.prestige && 
                this.state.playerStats.pastaPrestige < card.requirements.prestige) {
                // Only show message and play sound if actually clicked
                if (isClick) {
                    gameSounds.playUpgradeBlockedSound();
                    this.showEffectMessage(`<span style="color: #ff6347;">Not enough prestige! Requires ${card.requirements.prestige} prestige.</span>`);
                }
                return false;
            }
            
            // Then check upgrade slots
            const upgradesGrid = document.querySelector('.upgrades-grid');
            const existingUpgrades = upgradesGrid.querySelectorAll('.upgrade-card');
            if (existingUpgrades.length >= 2) {
                // Only show message and play sound if actually clicked
                if (isClick) {
                    gameSounds.playUpgradeBlockedSound();
                    this.showEffectMessage("Maximum of 2 factory upgrades allowed! Sell an upgrade first.");
                }
                return false;
            }
        }
        
        return true;
    }

    playCard(cardName) {
        // Make spam click check more sensitive
        const now = Date.now();
        if (now - this.lastCardPlayTime < this.clickCooldown) {
            gameSounds.playBadCardSound();
            this.showEffectMessage("Too fast! The noodles are dizzy! 🌀");
            return;
        }
        this.lastCardPlayTime = now;

        const card = CARDS[cardName];
        if (!card) return;

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
                    setTimeout(() => {
                        this.state.playerStats.ingredients += neededIngredients;
                        this.updateDisplay();
                        emergencyMessage = `Emergency ingredients purchased for $${totalCost}!`;
                        this.showEffectMessage(emergencyMessage);
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
                        if (this.state.playerStats.money >= totalCost) {
                            this.state.playerStats.money -= totalCost;
                            this.state.playerStats.ingredients += neededIngredients;
                            emergencyMessage = `Emergency noodle sale: ${noodlesToSell} noodles sold for $${income}!\nEmergency ingredients purchased for $${totalCost}!`;
                            this.showEffectMessage(emergencyMessage);
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
                    setTimeout(() => {
                        this.state.playerStats.workerCount += neededWorkers;
                        this.updateDisplay();
                        emergencyMessage = `Emergency workers hired for $${totalCost}!`;
                        this.showEffectMessage(emergencyMessage);
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
                        if (this.state.playerStats.money >= totalCost) {
                            this.state.playerStats.money -= totalCost;
                            this.state.playerStats.workerCount += neededWorkers;
                            emergencyMessage = `Emergency noodle sale: ${noodlesToSell} noodles sold for $${income}!\nEmergency workers hired for $${totalCost}!`;
                            this.showEffectMessage(emergencyMessage);
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
                }
            }

            // Rest of the method remains unchanged...
            const clickedCard = Array.from(document.querySelectorAll('.card')).find(
                card => card.querySelector('h3').textContent === cardName
            );
            const otherCard = Array.from(document.querySelectorAll('.card')).find(
                card => card !== clickedCard
            );

            // Handle upgrade cards differently
            if (card.type === "upgrade") {
                // Play both card sound and upgrade sound
                gameSounds.playCardSound();
                gameSounds.playUpgradePinSound();

                // Mark cards as played for animation
                if (clickedCard) {
                    clickedCard.classList.add('played');
                    clickedCard.setAttribute('data-selected', 'true');
                    clickedCard.style.zIndex = '100';
                }
                if (otherCard) {
                    otherCard.classList.add('played');
                    otherCard.setAttribute('data-selected', 'false');
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
                }

                // Pin the upgrade card to the upgrades section
                if (this.pinUpgradeCard(cardName, card)) {
                    // Apply permanent stats after successful pinning
                    if (card.permanentStats) {
                        this.applyUpgradeStats(card.permanentStats);
                    }
                    
                    // Add message feedback for upgrade cards
                    this.showEffectMessage(`Upgrade installed: ${cardName}`);
                    
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
            }

            // Rest of the existing playCard code for non-upgrade cards...
            // Play card sound immediately
            gameSounds.playCardSound();

            if (clickedCard) {
                // Get card position for effects
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
                }

                // Fire effect for "magical" or special cards
                if (card.description.toLowerCase().includes('magic') || 
                    card.description.toLowerCase().includes('mystic') ||
                    card.description.toLowerCase().includes('spirit')) {
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
            }

            // Increment turn counter
            this.turn++;

            // Apply visual feedback for cards BEFORE stat changes
            if (clickedCard) {
                clickedCard.classList.add('played');
                clickedCard.setAttribute('data-selected', 'true');
                clickedCard.style.zIndex = '100';
            }
            if (otherCard) {
                otherCard.classList.add('played');
                otherCard.setAttribute('data-selected', 'false');
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
                this.updateDisplay();

                // Apply card effect first
                if (card.effect) {
                    const message = card.effect(this.state);
                    this.showEffectMessage(message);
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
            }

            // Schedule cleanup and new cards after animations complete
            if (!this.isGameOver) {
                setTimeout(() => {
                    document.querySelectorAll('.card').forEach(card => card.remove());
                    this.drawNewCards();
                }, 800);
            }
        }
    }

    processTurnEffects() {
        // Apply upgrade effects first
        applyUpgradeEffects(this.state);

        // Add passive ingredient gain each turn
        const baseIngredientGain = 0.2 + this.state.playerStats.ingredientGainRate;
        const prestigeBonus = this.state.playerStats.pastaPrestige * 0.01;
        const totalIngredientGain = Math.random() < 0.7 ? Math.floor(baseIngredientGain + prestigeBonus) : 0;
        
        if (totalIngredientGain > 0) {
            this.state.playerStats.ingredients = Math.min(20, Math.floor(this.state.playerStats.ingredients + totalIngredientGain));
        }

        // Store production messages to queue them after card action messages
        let productionMessages = [];

        // Continue with regular production if we have ingredients
        if (this.state.playerStats.ingredients > 0) {
            const workers = this.state.playerStats.workerCount;
            // Make ingredients last longer by reducing consumption rate
            const baseProduction = Math.min(
                Math.floor(this.state.playerStats.ingredients * 0.5), // Round down ingredient usage
                Math.ceil(workers / 0.5)  // Each 5 workers can process 1 ingredient
            );

            if (baseProduction > 0) {
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
                    
                    // Store production message instead of showing it immediately
                    productionMessages.push({
                        message: `Daily production: Created ${production} noodles!`,
                        type: 'feedback'
                    });
                }
            }
        }

        // Process sales and expenses but collect messages instead of showing them
        const salesMessages = this.processSalesAndExpenses();
        
        // Now add all collected messages to the queue in correct order
        // Add production messages
        productionMessages.forEach(msg => {
            this.messageQueue.push(msg);
        });
        
        // Add sales messages
        salesMessages.forEach(msg => {
            this.messageQueue.push(msg);
        });
        
        // Finally add a situation message
        const situationMessage = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
        this.showSituationMessage(situationMessage);
        
        // Start processing message queue if not already doing so
        if (!this.isDisplayingMessage) {
            this.processMessageQueue();
        }
    }

    processSalesAndExpenses() {
        // Collect messages to return instead of showing immediately
        const messages = [];
        
        console.log("processSalesAndExpenses called on turn:", this.turn);
        
        // For 5-day cycle, use (turn % 5 === 0) for turns 5, 10, 15, etc.
        // If turn is not properly aligned, use modulus on 5-day intervals
        const shouldSellNoodles = (this.turn > 0 && this.turn % 5 === 0);
        
        console.log("Should sell noodles?", shouldSellNoodles, "Turn:", this.turn);
        
        // Process sales every 5 days (production cycle)
        if (shouldSellNoodles) {
            console.log("Sales should happen now (turn % 5 === 0)");
            const maxSales = Math.floor(20 + (this.state.playerStats.pastaPrestige * 0.5));
            const availableNoodles = this.state.playerStats.noodles;
            const dailySales = Math.min(maxSales, availableNoodles);
            
            console.log("Available noodles:", availableNoodles, "Max sales:", maxSales, "Actual sales:", dailySales);

            if (dailySales > 0) {
                const income = dailySales * this.state.playerStats.noodleSalePrice;
                this.state.playerStats.noodles -= dailySales;
                this.state.playerStats.money += income;
                console.log("Sales completed:", dailySales, "noodles for $", income);
                messages.push({
                    message: `Sales: ${dailySales} noodles sold for $${income}!`,
                    type: 'feedback'
                });
            } else {
                console.log("No noodles available to sell");
                // Add a message even when no noodles are sold
                messages.push({
                    message: `Sales day: No noodles available to sell!`,
                    type: 'feedback'
                });
            }
        }

        // Process weekly expenses
        if (this.turn % 7 === 0) {
            const expenses = this.state.playerStats.weeklyExpenses;
            this.state.playerStats.money = Math.max(0, this.state.playerStats.money - expenses);
            messages.push({
                message: `Weekly expenses: -$${expenses}`,
                type: 'feedback'
            });
        }
        
        return messages;
    }

    addUpgradeClickHandler(upgradeElement, card) {
        upgradeElement.addEventListener('click', () => {
            const confirmDialog = document.createElement('div');
            confirmDialog.className = 'sell-confirm';
            confirmDialog.innerHTML = `
                <p class="sell-text">Sell this upgrade?</p>
                <div class="sell-buttons">
                    <button class="sell-yes">Yes</button>
                    <button class="sell-no">No</button>
                </div>
            `;
            
            upgradeElement.appendChild(confirmDialog);
            
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
                
                // Add benefits from selling
                const chaosReduction = 3 + Math.random() * 4; // Random 3-7 reduction
                const ingredientGain = 2 + Math.floor(Math.random() * 3); // Random 2-4 ingredients
                
                // Apply benefits
                this.state.playerStats.chaosLevel = Math.max(0, 
                    this.state.playerStats.chaosLevel - chaosReduction);
                this.state.playerStats.ingredients = Math.min(20, 
                    this.state.playerStats.ingredients + ingredientGain);
                
                // Show feedback message
                this.showEffectMessage(
                    `Sold upgrade: +${ingredientGain} ingredients, -${Math.round(chaosReduction)} chaos!`
                );
                
                // Remove permanent stats
                if (card.permanentStats) {
                    this.removeUpgradeStats(card.permanentStats);
                }
                
                // Remove from state - ensure we completely remove it
                delete this.state.playerStats.factoryUpgrades[cardName];
                
                // Animate removal
                upgradeElement.classList.add('disappearing');
                setTimeout(() => upgradeElement.remove(), 300);
                
                // Update display
                this.updateDisplay();
            };
            
            noButton.onclick = (e) => {
                e.stopPropagation();
                confirmDialog.remove();
            };
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
    }

    pinUpgradeCard(cardName, card) {
        const upgradesGrid = document.querySelector('.upgrades-grid');
        const existingUpgrades = upgradesGrid.querySelectorAll('.upgrade-card');
        
        if (existingUpgrades.length >= 2) {
            gameSounds.playUpgradeBlockedSound();
            this.showEffectMessage(`<span style="color: #ff6347;">Maximum of 2 factory upgrades allowed! Sell an upgrade first.</span>`);
            return false;
        }
        
        const originalCard = document.querySelector('.card[data-selected="true"]');
        if (!originalCard) return false;

        const origRect = originalCard.getBoundingClientRect();
        const gridRect = upgradesGrid.getBoundingClientRect();
        
        const slotWidth = 120;
        const slotGap = 10;
        const slot = existingUpgrades.length;
        
        const totalWidth = (slotWidth * 2) + slotGap;
        const startX = gridRect.left + (gridRect.width - totalWidth) / 2;
        const targetX = startX + (slot * (slotWidth + slotGap));
        const targetY = gridRect.top;
        
        const upgradeElement = document.createElement('div');
        upgradeElement.className = 'upgrade-card pinning';
        upgradeElement.setAttribute('data-name', cardName); // Add this line to set the data-name attribute
        upgradeElement.style.position = 'fixed';
        upgradeElement.style.left = `${origRect.left}px`;
        upgradeElement.style.top = `${origRect.top}px`;
        upgradeElement.style.width = `${origRect.width}px`;
        upgradeElement.style.height = `${origRect.height}px`;
        upgradeElement.innerHTML = `
            <h4>${cardName}</h4>
            <div class="upgrade-effects">
                ${card.permanentStats || card.priceBonus ? 
                    `<div class="effects-label">Passive Effects:</div>
                    ${this.formatPermanentEffects(card.permanentStats, card)}` : ''
                }
            </div>
        `;
        
        document.body.appendChild(upgradeElement);

        // Force a reflow
        void upgradeElement.offsetHeight;
        
        // Animate to final position
        requestAnimationFrame(() => {
            upgradeElement.style.transition = 'all 0.5s ease-out';
            upgradeElement.style.transform = 'scale(0.4)';
            upgradeElement.style.left = `${targetX}px`;
            upgradeElement.style.top = `${targetY}px`;
            
            setTimeout(() => {
                upgradeElement.style = ''; // Reset styles
                upgradesGrid.appendChild(upgradeElement);
                
                try {
                    gameSounds.playUpgradePinSound();
                } catch (e) {
                    console.error('Error playing upgrade pin sound:', e);
                }
                
                // Add click handler for selling upgrades
                this.addUpgradeClickHandler(upgradeElement, card);
            }, 500);
        });
        
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
        }, 4500);
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
        }

        // Stop background music
        if (window.musicLoops && window.musicLoops.stopLoop) {
            window.musicLoops.stopLoop();
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
                noodles: 0,
                noodleProductionRate: 1,
                noodleSalePrice: 5,
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
                ingredientGainRate: 0.2 // Add base ingredient gain rate
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
    }

    triggerChaosEvent(message) {
        const messageBox = document.getElementById('game-messages');
        if (!messageBox) return;

        // Add randomization for sounds
        if (Math.random() > 0.85) {
            gameSounds.playChaosSound();
            gameSounds.createGrumbleSound(this.state.playerStats.chaosLevel / 50);
        }

        // Add message to queue with lower priority if a card was just played
        const wasProbablyCardAction = Date.now() - this.lastCardPlayTime < 1000;
        
        this.showChaosMessage(message);
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
    }

    showEffectMessage(message) {
        // When a card is clicked, we want to:
        // 1. Stop any current message display
        // 2. Show the action message immediately
        // 3. Add it to the queue with proper timing
        
        if (this.isDisplayingMessage) {
            // If we're already showing a message, clear its timeout
            if (this._messageTimeout) {
                clearTimeout(this._messageTimeout);
                this._messageTimeout = null;
            }
        }
        
        // Add action message to the front of the queue
        this.messageQueue.unshift({
            message: message,
            type: 'feedback'
        });
        
        // Set flag that we're displaying a message
        this.isDisplayingMessage = true;
        
        // Show the message right away
        const messageBox = document.getElementById('game-messages');
        if (messageBox) {
            // Split the message into words and wrap each in a span
            const words = message.split(' ');
            const wrappedWords = words.map((word, index) => 
                `<span style="--word-index: ${index}">${word}</span>`
            ).join(' ');
            
            // Create text container
            const textSpan = document.createElement('span');
            textSpan.className = 'message-text';
            textSpan.innerHTML = wrappedWords;
            
            // Clear and update message box
            messageBox.innerHTML = '';
            messageBox.appendChild(textSpan);
            messageBox.className = 'message-box feedback';
            
            // Schedule the next message after the standard display time
            this._messageTimeout = setTimeout(() => {
                this.isDisplayingMessage = false;
                // Remove this message from the queue since we've shown it
                if (this.messageQueue.length > 0 && this.messageQueue[0].type === 'feedback') {
                    this.messageQueue.shift();
                }
                this.processMessageQueue();
            }, this.messageDisplayTime);
        }
    }

    showSituationMessage(message) {
        this.messageQueue.push({
            message: message,
            type: 'situation'
        });
        
        if (!this.isDisplayingMessage) {
            this.processMessageQueue();
        }
    }

    showChaosMessage(message) {
        // Only add chaos message if there are no card action messages already in the queue
        // This ensures card messages always take priority
        const hasPendingActionMessages = this.messageQueue.some(msg => msg.type === 'feedback');
        
        // Add chaos message to queue with lower priority
        this.messageQueue.push({
            message: message,
            type: 'chaos-warning',
            priority: hasPendingActionMessages ? 'low' : 'normal'
        });
        
        // Sort the queue to place low priority messages at the end
        this.messageQueue.sort((a, b) => {
            // If a has low priority and b doesn't, place a after b
            if (a.priority === 'low' && b.priority !== 'low') return 1;
            // If b has low priority and a doesn't, place a before b
            if (b.priority === 'low' && a.priority !== 'low') return -1;
            // Otherwise keep their relative order
            return 0;
        });
        
        // Start processing the queue if not already doing so
        if (!this.isDisplayingMessage) {
            this.processMessageQueue();
        }
    }

    processMessageQueue() {
        // If no messages or already displaying, exit
        if (this.messageQueue.length === 0 || this.isDisplayingMessage) {
            return;
        }
        
        this.isDisplayingMessage = true;
        
        const messageData = this.messageQueue.shift();
        
        // Before displaying sales or production messages, ensure UI is updated
        if (messageData.type === 'feedback' && 
            (messageData.message.includes('Sales:') || 
             messageData.message.includes('production:') ||
             messageData.message.includes('expenses:'))) {
            // Update display to ensure values are current before showing the message
            this.updateDisplay();
        }
        
        // Determine message type color
        let messageColor = '#ffd700'; // Default yellow for feedback messages
        if (messageData.type === 'situation') {
            messageColor = '#3498db'; // Blue for situation messages
        } else if (messageData.type === 'chaos-warning') {
            messageColor = '#e74c3c'; // Red for chaos warnings
        } else if (messageData.type === 'feedback') {
            // Special case handling for different feedback message types
            if (messageData.message.includes('Sales:')) {
                messageColor = '#2ecc71'; // Green for sales messages
            } else if (messageData.message.includes('production:')) {
                messageColor = '#f39c12'; // Orange for production messages
            } else if (messageData.message.includes('expenses:')) {
                messageColor = '#e67e22'; // Darker orange for expenses messages
            } else if (messageData.message.includes('generated a bonus') || 
                      messageData.message.includes('bonus ingredient')) {
                messageColor = '#9b59b6'; // Purple for bonus messages
            }
        }
        
        const messageBox = document.getElementById('game-messages');
        if (messageBox) {
            const words = messageData.message.split(' ');
            const wrappedWords = words.map((word, index) => 
                `<span style="--word-index: ${index}; color: ${messageColor};">${word}</span>`
            ).join(' ');
            
            const textSpan = document.createElement('span');
            textSpan.className = 'message-text';
            textSpan.innerHTML = wrappedWords;

            messageBox.innerHTML = '';
            messageBox.appendChild(textSpan);

            messageBox.className = `message-box ${messageData.type}`;
            
            // Store the timeout so it can be cleared if needed
            this._messageTimeout = setTimeout(() => {
                this.isDisplayingMessage = false;
                this.processMessageQueue();
            }, this.messageDisplayTime);
        }
    }

    loadGame() {
        const savedState = loadGameState();
        if (!savedState) {
            return;
        }

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

        this.showCards();

        this.updateDisplay();
        this.drawNewCards();

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
    }

    async init() {
        if (this.initialized) return;
        
        try {
            const musicTrack = localStorage.getItem('selectedMusicTrack');
            console.log("Initializing music with track:", musicTrack);
            
            // If random is selected, pick a new random track each time
            if (musicTrack === 'random') {
                const availableTracks = ['default', 'lounge', 'dnb'];
                const randomTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
                console.log("Random music selection chose:", randomTrack);
                
                if (randomTrack === 'lounge') {
                    const { loungeMusic } = await import('../audio/music/bgm2.js');
                    window.loungeMusic = loungeMusic;  // Attach to window
                    if (window.loungeMusic.enabled) {
                        await window.loungeMusic.startLoop();
                        console.log("Lounge music started from random selection");
                    }
                } else if (randomTrack === 'dnb') {
                    const { dnbMusic } = await import('../audio/music/bgm3.js');
                    window.dnbMusic = dnbMusic;  // Attach to window
                    if (window.dnbMusic.enabled) {
                        await window.dnbMusic.startLoop();
                        console.log("Drum and bass music started from random selection");
                    }
                } else {
                    const { musicLoops } = await import('../audio/music/bgm.js');
                    window.musicLoops = musicLoops;  // Attach to window
                    if (window.musicLoops.enabled) {
                        await window.musicLoops.startLoop();
                        console.log("Default music started from random selection");
                    }
                }
            } else if (musicTrack === 'lounge') {
                const { loungeMusic } = await import('../audio/music/bgm2.js');
                window.loungeMusic = loungeMusic;  // Attach to window
                if (window.loungeMusic.enabled) {
                    await window.loungeMusic.startLoop();
                    console.log("Lounge music started");
                }
            } else if (musicTrack === 'dnb') {
                const { dnbMusic } = await import('../audio/music/bgm3.js');
                window.dnbMusic = dnbMusic;  // Attach to window
                if (window.dnbMusic.enabled) {
                    await window.dnbMusic.startLoop();
                    console.log("Drum and bass music started");
                }
            } else {
                const { musicLoops } = await import('../audio/music/bgm.js');
                window.musicLoops = musicLoops;  // Attach to window
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
            gain1.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.05);
            gain1.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
            osc1.connect(gain1);
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

const soundManager = new SoundManager();

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