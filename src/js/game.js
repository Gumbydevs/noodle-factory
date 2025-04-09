import { CARDS, getRandomCard, applyStatModifiers, applyUpgradeEffects } from './cards.js';
import events from './events.js';
import { gameState, updateResource, resetGameState, updateChaosEffects, saveGameState, loadGameState, clearSavedGame, hasSavedGame } from './state.js';
import { ACHIEVEMENTS, checkAchievements, getUnlockedAchievements, resetAchievements } from './achievements.js';
import { updateHighScore, getHighScore } from './highscore.js';
import { triggerNoodleRoll } from './animation.js';
import { gameSounds } from '../audio.js'; // Note the .js extension
import { musicLoops } from '../audio/music/bgm.js';
import { AssetLoader } from './assetLoader.js';

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
    "The number of plus (+) or minus (<span class=\"negative\">-</span>) signs indicates the strength of the effect.",
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

        this.state = {
            playerStats: {
                pastaPrestige: 0,
                chaosLevel: 0,
                ingredients: Math.floor(Math.random() * 6) + 5,
                workerCount: Math.floor(Math.random() * 6) + 15,
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
                continueButton.textContent = 'Continue Run';
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
            ingredients: parseFloat(document.getElementById('ingredients').textContent),
            energy: parseFloat(document.getElementById('energy').textContent)
        };
        
        // Update all stat displays with formatted values
        const stats = {
            prestige: Math.round(this.state.playerStats.pastaPrestige * 10) / 10, // Round to 1 decimal
            chaos: Math.round(this.state.playerStats.chaosLevel),  // Keep chaos as whole number
            ingredients: this.state.playerStats.ingredients,
            energy: Math.round(this.state.playerStats.workerCount),
            turn: this.turn
        };

        // Update values and add animations
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
                    
                    // Remove animation classes after they complete
                    setTimeout(() => {
                        element.classList.remove('increase', 'decrease');
                    }, 600);
                }
                element.textContent = value;
            }
        });

        // Update progress bars
        const progressBars = {
            'prestige-progress': (this.state.playerStats.pastaPrestige / 100) * 100,
            'chaos-progress': (this.state.playerStats.chaosLevel / 100) * 100,
            'ingredients-progress': (this.state.playerStats.ingredients / 20) * 100,
            'workers-progress': (this.state.playerStats.workerCount / 50) * 100,
            'turn-progress': 100 // Always full but color changes with chaos
        };

        Object.entries(progressBars).forEach(([barId, percentage]) => {
            const bar = document.getElementById(barId);
            if (bar) {
                bar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
            }
        });

        this.checkChaosEvents();
        this.checkAchievements();
    }

    checkChaosEvents() {
        const chaos = this.state.playerStats.chaosLevel;
        const body = document.body;
        const messageBox = document.getElementById('game-messages');
        
        // Update music based on chaos level
        musicLoops.updateChaosLevel(chaos);
        
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

    drawNewCards() {
        document.querySelectorAll('.card').forEach(card => {
            card.style.cssText = '';  // Reset all inline styles
            card.classList.remove('hover', 'wiggle', 'active', 'played');  // Remove all animation classes
        });

        gameSounds.playDrawCardsSound();
        
        const cardsContainer = document.getElementById('cards-container');
        
        // Get two random cards
        const availableCards = Object.keys(CARDS).filter(cardName => {
            // Only include "Return of Reggie" if Reggie has escaped
            if (cardName === "Return of Reggie") {
                return this.state.playerStats.reggieEscaped === true;
            }
            // Filter out upgrade cards that don't meet prestige requirements
            if (CARDS[cardName].type === "upgrade") {
                const requiredPrestige = CARDS[cardName].requirements?.prestige || 0;
                return this.state.playerStats.pastaPrestige >= requiredPrestige;
            }
            return true;
        });

        // NEW CODE: Modify card selection based on prestige and upgrade slots
        let shuffledCards;
        const upgradesGrid = document.querySelector('.upgrades-grid');
        const existingUpgrades = upgradesGrid.querySelectorAll('.upgrade-card');
        const slotsAreFull = existingUpgrades.length >= 2;

        if (this.state.playerStats.pastaPrestige >= 25) {
            const upgradeCards = availableCards.filter(name => CARDS[name].type === "upgrade");
            const regularCards = availableCards.filter(name => CARDS[name].type !== "upgrade");
            
            // New scaled chances based on prestige
            let upgradeChance;
            if (this.state.playerStats.pastaPrestige >= 50) {
                // Reduced chance for 50+ prestige (was 0.75)
                upgradeChance = Math.min(0.45, (this.state.playerStats.pastaPrestige - 50) / 150);
            } else {
                // Reduced chance for 25-49 prestige (was 0.35)
                upgradeChance = Math.min(0.25, (this.state.playerStats.pastaPrestige - 25) / 150);
            }
            
            if (Math.random() < upgradeChance && upgradeCards.length > 0) {
                shuffledCards = [
                    upgradeCards[Math.floor(Math.random() * upgradeCards.length)],
                    regularCards[Math.floor(Math.random() * regularCards.length)]
                ];
                // Randomize order
                if (Math.random() < 0.5) {
                    shuffledCards.reverse();
                }
            } else {
                shuffledCards = [...regularCards].sort(() => Math.random() - 0.5);
            }
        } else {
            shuffledCards = [...availableCards].sort(() => Math.random() - 0.5);
        }

        const [leftCard, rightCard] = shuffledCards.slice(0, 2);

        cardsContainer.innerHTML = `
            <div class="card ${this.checkCardPlayable(CARDS[leftCard]) ? '' : 'disabled'}" id="card-left">
                ${CARDS[leftCard].type === "upgrade" ? `<div class="upgrade-label" style="animation: rainbowText 2s infinite"}>Upgrade</div>` : ''}
                <h3>${leftCard}</h3>
                <div class="card-description">${CARDS[leftCard].description}</div>
                <div class="card-effects">
                    ${this.formatCardEffects(CARDS[leftCard].statModifiers)}
                </div>
                ${CARDS[leftCard].type === "upgrade" ? 
                    `<div class="requirement" style="animation: rainbowText 3s infinite">Prestigious Upgrade</div>` : ''}
            </div>
            <div class="card ${this.checkCardPlayable(CARDS[rightCard]) ? '' : 'disabled'}" id="card-right">
                ${CARDS[rightCard].type === "upgrade" ? `<div class="upgrade-label" style="animation: rainbowText 2s infinite">Upgrade</div>` : ''}
                <h3>${rightCard}</h3>
                <div class="card-description">${CARDS[rightCard].description}</div>
                <div class="card-effects">
                    ${this.formatCardEffects(CARDS[rightCard].statModifiers)}
                </div>
                ${CARDS[rightCard].type === "upgrade" ? 
                    `<div class="requirement" style="animation: rainbowText 3s infinite">Prestigious Upgrade</div>` : ''}
            </div>
        `;

        // Add click handlers with requirement checks
        document.getElementById('card-left').onclick = () => {
            if (!this.checkCardPlayable(CARDS[leftCard], true)) { // Pass true for clicks
                return;
            }
            this.playCard(leftCard);
        };
        document.getElementById('card-right').onclick = () => {
            if (!this.checkCardPlayable(CARDS[rightCard], true)) { // Pass true for clicks
                return;
            }
            this.playCard(rightCard);
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
        const card = CARDS[cardName];
        if (!card) return;

        // Get the clicked card element more reliably
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
                // Store the upgrade in state
                this.state.playerStats.factoryUpgrades[cardName] = card;
            }

            // Update display after all changes
            this.updateDisplay();
            
            // Increment turn counter
            this.turn++;
            
            // Process turn effects
            this.processTurnEffects();
            
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
                    `<span style="color: #4CAF50">Recycled upgrade: -${Math.round(chaosReduction)} chaos, +${ingredientGain} ingredients</span>`
                );
                
                // Remove permanent stats
                if (card.permanentStats) {
                    this.removeUpgradeStats(card.permanentStats);
                }
                
                // Remove from state
                delete this.state.playerStats.factoryUpgrades[card.name];
                
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
            this.state.playerStats.chaosControlTurns = (this.state.playerStats.chaosControlTurns || 0) + 1; // Add this line
            this.state.playerStats.hadMaxChaos = true;
            
            if (this.state.playerStats.turnsAtMaxChaos >= 3) {
                gameSounds.playGameOverSound();
                this.endGame('chaos');
                this.isGameOver = true;
                return true;
            }
        } else {
            this.state.playerStats.turnsAtMaxChaos = 0;
            // Don't reset chaosControlTurns here as it's for the achievement
        }

        // Rest of the existing checks remain unchanged
        if (this.state.playerStats.workerCount <= 0) {
            gameSounds.playGameOverSound();
            this.endGame('workers');
            this.isGameOver = true;
            return true;
        }
        if (this.state.playerStats.ingredients <= 0) {
            gameSounds.playGameOverSound();
            this.endGame('ingredients');
            this.isGameOver = true;
            return true;
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
        
        // Calculate the target position - the position of the next empty slot
        const slotWidth = 120; // Width of upgrade card
        const slotGap = 10; // Gap between cards
        const slot = existingUpgrades.length; // Which slot to use (0 or 1)
        
        // Center the upgrades within the grid
        const totalWidth = (slotWidth * 2) + slotGap; // Width of both slots + gap
        const startX = gridRect.left + (gridRect.width - totalWidth) / 2; // Start position to center cards
        const targetX = startX + (slot * (slotWidth + slotGap));
        const targetY = gridRect.top;
        
        const upgradeElement = document.createElement('div');
        upgradeElement.className = 'upgrade-card pinning';
        upgradeElement.style.position = 'fixed';
        upgradeElement.style.left = `${origRect.left}px`;
        upgradeElement.style.top = `${origRect.top}px`;
        upgradeElement.style.width = `${origRect.width}px`;
        upgradeElement.style.height = `${origRect.height}px`;
        upgradeElement.innerHTML = `
            <h4>${cardName}</h4>
            <div class="upgrade-effects">
                ${this.formatPermanentEffects(card.permanentStats)}
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

    formatPermanentEffects(permanentStats) {
        if (!permanentStats) return '';
        
        return Object.entries(permanentStats)
            .map(([stat, value]) => {
                // Convert value to appropriate number of signs
                const absValue = Math.abs(value * 100);
                let signs;
                if (absValue <= 15) {
                    signs = (value > 0 ? '+' : '-').repeat(1);
                } else if (absValue <= 25) {
                    signs = (value > 0 ? '+' : '-').repeat(2);
                } else if (absValue <= 35) {
                    signs = (value > 0 ? '+' : '-').repeat(3);
                } else {
                    signs = (value > 0 ? '+' : '-').repeat(4);
                }
                
                // Map stats to display names
                const statDisplay = {
                    'prestigeGain': 'Prestige',
                    'chaosReduction': 'Chaos',
                    'workerEfficiency': 'Workers',
                    'workerLossRate': 'Workers',
                    'ingredientGain': 'Ingredients'
                }[stat] || stat;

                // Get color class
                const colorClass = {
                    'prestigeGain': 'prestige-color',
                    'chaosReduction': 'chaos-color',
                    'workerEfficiency': 'energy-color',
                    'workerLossRate': 'energy-color',
                    'ingredientGain': 'ingredients-color'
                }[stat] || '';
                
                const signClass = value > 0 ? 'positive' : 'negative';
                
                return `<div class="permanent-effect">
                    <span class="${colorClass}">${statDisplay}:</span>
                    <span class="${signClass}">${signs}</span>
                </div>`;
            })
            .join('');
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
        
        // Add popup to container but hide it initially
        popup.style.opacity = '0';
        container.appendChild(popup);
        
        // Force a reflow to get accurate height
        void popup.offsetHeight;
        
        // Get actual popup content height plus 1px gap
        const popupHeight = popup.getBoundingClientRect().height + 1;
        
        // Show popup and position all popups
        popup.style.opacity = '1';
        
        // Immediately position all popups with correct spacing
        Array.from(container.children).forEach((p, index) => {
            p.style.transform = `translateY(${index * popupHeight}px)`;
        });

        // Remove popup after animation
        setTimeout(() => {
            popup.style.opacity = '0';
            popup.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                popup.remove();
                // Adjust positions of remaining popups
                Array.from(container.children).forEach((remaining, index) => {
                    remaining.style.transform = `translateY(${index * popupHeight}px)`;
                });
            }, 500);
        }, 4500);
    }

    endGame(reason = '') {
        // Convert reason to descriptive message
        const gameOverMessages = {
            'workers': 'Your workforce has abandoned the factory, leaving production at a standstill.',
            'chaos': 'The factory has been consumed by chaos, lost to an interdimensional pasta incident.',
            'ingredients': 'Production has ceased - the pantry is empty, and not a single noodle can be made.'
        };

        const endMessage = gameOverMessages[reason] || '';
        
        this.isGameOver = true;
        this.checkHighScore();
        
        // Reset all chaos effects
        const body = document.body;
        body.classList.remove('chaos-level-1', 'chaos-level-2', 'chaos-level-3', 'chaos-level-max', 'chaos-noise');
        
        // Remove CRT effect
        document.querySelector('.crt-overlay').classList.remove('active');

        // Stop background music
        musicLoops.stopLoop();

        // Create game over screen
        const gameContainer = document.getElementById('game-container');
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over-screen';
        
        // Add game over screen
        gameContainer.appendChild(gameOverScreen);

        // Set the inner HTML after appending to DOM
        gameOverScreen.innerHTML = `
            <div class="game-over-content">
                <h2>Game Over!</h2>
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

        // Hide cards and old message box
        this.hideCards();
        document.getElementById('game-messages').style.display = 'none';
        
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
                document.getElementById('game-messages').style.display = 'block';
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

        // Hide start screen elements
        const startButton = document.getElementById('start-game');
        if (startButton) {
            startButton.classList.add('hidden');
        }

        // Hide options button when game starts
        const optionsButton = document.getElementById('options-button');
        if (optionsButton) {
            optionsButton.style.display = 'none';
        }
        
        // Initialize audio on game start (first user interaction)
        soundManager.init();

        // Start background music if enabled (before any other sounds)
        musicLoops.startLoop();

        // Now play the start game sound
        gameSounds.playStartGameSound();

        resetGameState();
        this.state = {
            playerStats: {
                pastaPrestige: 0,
                chaosLevel: 0,
                ingredients: Math.floor(Math.random() * 6) + 5, // Random 5-10 ingredients
                workerCount: Math.floor(Math.random() * 6) + 15,
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
                workerLossRate: 1
            }
        };
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
        messageBox.textContent = "Welcome to your first day as Noodle Factory Manager! What's your first move?";
        messageBox.classList.remove('feedback');
        messageBox.classList.add('situation');

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

        // Split chaos message into words
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

        // Update classes in the correct order
        messageBox.className = 'message-box chaos-warning active';
        
        // Store the type of message for restoration
        messageBox.setAttribute('data-previous-type', 'chaos');
        
        // Return to previous message state after delay
        setTimeout(() => {
            messageBox.className = 'message-box situation';
            const situationMessage = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
            const situationWords = situationMessage.split(' ');
            const wrappedSituation = situationWords.map((word, index) => 
                `<span style="--word-index: ${index}">${word}</span>`
            ).join(' ');
            textSpan.innerHTML = wrappedSituation;
        }, 2000);
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

    processTurnEffects() {
        // Apply upgrade effects first
        applyUpgradeEffects(this.state);

        // Cap prestige at 100
        this.state.playerStats.pastaPrestige = Math.min(100, this.state.playerStats.pastaPrestige);

        // Natural progression effects - chaos increases every 3-5 turns
        if (this.turn % (3 + Math.floor(Math.random() * 3)) === 0) {
            const chaosBase = this.turn < 10 ? 0.3 : 0.8;
            const chaosRandom = Math.random() * 0.4;
            
            const currentChaos = Number(this.state.playerStats.chaosLevel) || 0;
            const currentPrestige = Number(this.state.playerStats.pastaPrestige) || 0;
            
            // Modify chaos calculation based on prestige
            const prestigeMultiplier = currentPrestige >= 100 ? 1.2 : // 50% more chaos at max prestige
                                     currentPrestige >= 66 ? 1.2 : 1;
            const chaosMultiplier = currentChaos > 75 ? 0.6 : currentChaos > 50 ? 0.8 : 1;
            
            // Apply the chaosGainRate from upgrades
            const chaosIncrease = Number((chaosBase + chaosRandom) * chaosMultiplier * prestigeMultiplier * this.state.playerStats.chaosGainRate);
            
            this.state.playerStats.chaosLevel = Math.min(100, Number(currentChaos + chaosIncrease));
        }
        
        // Rest of the existing code...
        // ...existing worker and prestige decay logic...

        // Auto-save at the end of every turn
        if (!this.isGameOver) {
            this.autoSave();
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

            // Add proper classes in the correct order
            messageBox.className = 'message-box feedback';
            
            // Schedule return to random situation or tooltip message
            setTimeout(() => {
                // Modify the ratio to show more tooltips
                const shouldShowTooltip = Math.random() < 0.3; // 30% chance for tooltips
                
                let nextMessage;
                if (shouldShowTooltip) {
                    nextMessage = TOOLTIPS[Math.floor(Math.random() * TOOLTIPS.length)];
                    messageBox.className = 'message-box tooltip'; // Add tooltip class
                    textSpan.style.color = '#ffd700'; // Gold color for tooltips
                    textSpan.style.fontStyle = 'italic'; // Italic for tooltips
                } else {
                    nextMessage = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
                    messageBox.className = 'message-box situation';
                    textSpan.style.color = ''; // Reset color
                    textSpan.style.fontStyle = ''; // Reset style
                }
                
                // Split message into words
                const messageWords = nextMessage.split(' ');
                const wrappedMessage = messageWords.map((word, index) => 
                    `<span style="--word-index: ${index}">${word}</span>`
                ).join(' ');
                
                textSpan.innerHTML = wrappedMessage;
            }, 3000);
        }
    }

    loadGame() {
        const savedState = loadGameState();
        if (!savedState) {
            return;
        }

        // Set game started flag first
        this.isGameStarted = true;

        // Hide start screen elements, continue button, and options button
        document.getElementById('start-game').classList.add('hidden');
        const continueButton = document.getElementById('continue-game');
        if (continueButton) {
            continueButton.remove();
        }
        
        // Hide options button when loading game
        const optionsButton = document.getElementById('options-button');
        if (optionsButton) {
            optionsButton.style.display = 'none';
        }

        // Reset current game state
        this.state = savedState;
        this.turn = savedState.turn;
        this.isGameOver = false;

        // Clear and reset UI
        document.body.classList.remove('chaos-level-1', 'chaos-level-2', 'chaos-level-3', 'chaos-level-max', 'chaos-noise');
        document.getElementById('game-messages').style.display = 'block';

        // Show cards container (it might be hidden)
        this.showCards();

        // Update display and draw cards
        this.updateDisplay();
        this.drawNewCards();

        // Play sound and show message
        gameSounds.playStartGameSound();
        this.showEffectMessage("Game loaded successfully!");
    }

    shareGameResults() {
        // Create canvas from game over screen
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
    
    // Random movement
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 100;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 100;
    
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    
    document.body.appendChild(particle);
    
    // Add animation
    particle.style.animation = 'smoke 1s ease-out forwards';
    
    // Remove after animation
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
            // Initialize music system first
            if (musicLoops.enabled) {
                await musicLoops.startLoop();
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
            
            // Use the pentatonic scale from musicLoops for in-key notes
            const pentatonicNotes = {
                'C3': 130.81, 'Eb3': 155.56, 'F3': 174.61, 
                'G3': 196.00, 'Bb3': 233.08, 'C4': 261.63
            };

            // Get random notes from the pentatonic scale
            const notes = Object.values(pentatonicNotes);
            const note1 = notes[Math.floor(Math.random() * notes.length)];
            const note2 = notes[Math.floor(Math.random() * notes.length)];
            
            mainGain.gain.value = 1.2 * volumeMultiplier;
            
            // Keep existing noise generation code
            // ...existing code...

            // Setup beep oscillators with pentatonic notes
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            osc1.type = 'triangle';
            osc2.type = 'sine';
            osc1.frequency.value = note1;
            osc2.frequency.value = note2;

            // Keep rest of the existing code
            // ...existing code...
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
            
            // Use notes from C minor pentatonic scale to match background music
            const musicalNotes = {
                'C4': 261.63,
                'Eb4': 311.13,
                'F4': 349.23,
                'G4': 392.00,
                'Bb4': 466.16
            };

            // Create musical interval by selecting two adjacent notes
            const notesList = Object.values(musicalNotes);
            const startIndex = Math.floor(Math.random() * (notesList.length - 1));
            const note1 = notesList[startIndex];
            const note2 = notesList[startIndex + 1];

            // Play first note
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

            // Play second note slightly later
            const osc2 = this.ctx.createOscillator();
            osc2.type = 'sine';
            osc2.frequency.value = note2;
            const gain2 = this.ctx.createGain();
            gain2.gain.setValueAtTime(0, this.ctx.currentTime + 0.1);
            gain2.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.15);
            gain2.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
            osc2.connect(gain2);
            gain2.connect(mainGain);

            osc1.start(this.ctx.currentTime);
            osc2.start(this.ctx.currentTime + 0.1);
            osc1.stop(this.ctx.currentTime + 0.2);
            osc2.stop(this.ctx.currentTime + 0.3);

            // Keep the swoosh effect code
            // ...existing code...

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
    // Initialize asset loader first
    const assetLoader = new AssetLoader();
    await assetLoader.init();

    // After assets are loaded, initialize game components
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