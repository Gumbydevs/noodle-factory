import { CARDS, getRandomCard, applyStatModifiers, applyUpgradeEffects } from './cards.js';
import events from './events.js';
import { gameState, updateResource, resetGameState, updateChaosEffects } from './state.js';
import { ACHIEVEMENTS, checkAchievements, getUnlockedAchievements, resetAchievements } from './achievements.js';
import { updateHighScore, getHighScore } from './highscore.js';
import { triggerNoodleRoll } from './animation.js';
import { gameSounds } from '../audio.js'; // Note the .js extension
import { musicLoops } from '../audio/music/bgm.js';

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
    "The emergency pasta button got pressed. There is no emergency pasta button.",
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

class Game {
    constructor() {
        // Add static reference to game instance
        window.gameInstance = this;

        this.state = {
            playerStats: {
                pastaPrestige: 0,
                chaosLevel: 0,
                ingredients: Math.floor(Math.random() * 6) + 5, // Random 5-10 ingredients
                workerCount: Math.floor(Math.random() * 6) + 15,
                lostWorkers: 0,
                lostIngredients: 0,
                chaosSteadyTurns: 0,
                turnsAtMaxChaos: 0, // Add this to track turns at max chaos
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
            upgradesContainer.innerHTML = '<h3>Factory Upgrades</h3><div class="upgrades-grid"></div>';
            document.getElementById('game-container').appendChild(upgradesContainer);
        }

        // Initial display update
        this.updateInitialDisplay();

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
        const shuffledCards = [...availableCards].sort(() => Math.random() - 0.5);
        const [leftCard, rightCard] = shuffledCards.slice(0, 2);

        cardsContainer.innerHTML = `
            <div class="card ${this.checkCardPlayable(CARDS[leftCard]) ? '' : 'disabled'}" id="card-left">
                ${CARDS[leftCard].type === "upgrade" ? '<div class="upgrade-label">Upgrade</div>' : ''}
                <h3>${leftCard}</h3>
                <div class="card-description">${CARDS[leftCard].description}</div>
                <div class="card-effects">
                    ${this.formatCardEffects(CARDS[leftCard].statModifiers)}
                </div>
                ${CARDS[leftCard].type === "upgrade" && CARDS[leftCard].requirements?.prestige ? 
                    `<div class="requirement">Requires ${CARDS[leftCard].requirements.prestige} Prestige</div>` : ''}
            </div>
            <div class="card ${this.checkCardPlayable(CARDS[rightCard]) ? '' : 'disabled'}" id="card-right">
                ${CARDS[rightCard].type === "upgrade" ? '<div class="upgrade-label">Upgrade</div>' : ''}
                <h3>${rightCard}</h3>
                <div class="card-description">${CARDS[rightCard].description}</div>
                <div class="card-effects">
                    ${this.formatCardEffects(CARDS[rightCard].statModifiers)}
                </div>
                ${CARDS[rightCard].type === "upgrade" && CARDS[rightCard].requirements?.prestige ? 
                    `<div class="requirement">Requires ${CARDS[rightCard].requirements.prestige} Prestige</div>` : ''}
            </div>
        `;

        // Add click handlers with requirement checks
        document.getElementById('card-left').onclick = () => 
            this.checkCardPlayable(CARDS[leftCard]) ? this.playCard(leftCard) : this.showDisabledCardFeedback(leftCard);
        document.getElementById('card-right').onclick = () => 
            this.checkCardPlayable(CARDS[rightCard]) ? this.playCard(rightCard) : this.showDisabledCardFeedback(rightCard);
    }

    checkCardPlayable(card) {
        if (!card) return true;
        
        // For upgrades, check prestige requirement
        if (card.type === "upgrade") {
            if (card.requirements?.prestige && 
                this.state.playerStats.pastaPrestige < card.requirements.prestige) {
                return false;
            }
        }
        
        // For all cards, check if we have enough resources for negative modifiers
        if (card.statModifiers) {
            if (card.statModifiers.workers < 0 && 
                this.state.playerStats.workerCount + card.statModifiers.workers < 1) {
                return false;
            }
            if (card.statModifiers.ingredients < 0 && 
                this.state.playerStats.ingredients + card.statModifiers.ingredients < 0) {
                return false;
            }
        }
        
        return true;
    }

    playCard(cardName) {
        const card = CARDS[cardName];
        if (!card) return;

        // Apply immediate stat changes for upgrades
        if (card.type === "upgrade") {
            if (card.statModifiers) {
                Object.entries(card.statModifiers).forEach(([stat, value]) => {
                    const statKey = stat === 'workers' ? 'workerCount' : 
                                stat === 'prestige' ? 'pastaPrestige' : 
                                stat === 'chaos' ? 'chaosLevel' : stat;
                    
                    this.state.playerStats[statKey] = (this.state.playerStats[statKey] || 0) + value;
                });
            }
        }

        // Increment turn counter BEFORE card effects
        this.turn++;
        this.updateDisplay();

        // Get the clicked card element more reliably
        const clickedCard = Array.from(document.querySelectorAll('.card')).find(
            card => card.querySelector('h3').textContent === cardName
        );
        const otherCard = Array.from(document.querySelectorAll('.card')).find(
            card => card !== clickedCard
        );

        // Add wiggle animation to selected card before other effects
        if (clickedCard) {
            clickedCard.classList.add('wiggle-selected');
            // Remove the class after animation completes
            setTimeout(() => {
                clickedCard.classList.remove('wiggle-selected');
            }, 500);
        }

        // Immediately remove all hover and animation related classes/styles
        document.querySelectorAll('.card').forEach(card => {
            card.style.cssText = '';  // Clear all inline styles
            card.classList.remove('hover', 'wiggle', 'active');  // Remove any animation classes
            
            // Force removal of any :hover pseudo states
            card.addEventListener('touchend', function() {
                this.blur();
            }, { once: true });
        });

        // Set data-selected attributes and played class
        if (clickedCard) {
            clickedCard.setAttribute('data-selected', 'true');
            clickedCard.classList.add('dissolving');
            clickedCard.style.pointerEvents = 'none';
            
            // Create smoke effect synchronized with card animation
            const rect = clickedCard.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Add visual effects based on card type
            if (card.statModifiers) {
                let isPositiveCard = false;
                let isNegativeCard = false;

                // Check if card is generally positive or negative
                Object.entries(card.statModifiers).forEach(([stat, value]) => {
                    if (stat === 'chaos') {
                        if (value < 0) isPositiveCard = true;
                        if (value > 10) isNegativeCard = true;
                    } else {
                        if (value > 0) isPositiveCard = true;
                        if (value < 0) isNegativeCard = true;
                    }
                });

                // Play random effects based on card type
                if (isPositiveCard && !isNegativeCard) {
                    const effect = Math.random();
                    if (effect < 0.33) {
                        createMoneyEffect(centerX, centerY);
                    } else if (effect < 0.66) {
                        createNoodleExplosion(centerX, centerY);
                    } else {
                        createWaterSplash(centerX, centerY);
                    }
                } else if (isNegativeCard && !isPositiveCard) {
                    // Only create smoke for negative cards
                    createFireParticle(centerX, centerY);
                    for (let i = 0; i < 8; i++) {
                        setTimeout(() => {
                            createSmokeParticle(
                                rect.left + (Math.random() * rect.width),
                                rect.top + (Math.random() * rect.height)
                            );
                        }, i * 50);
                    }
                } else {
                    // Mixed effects for cards with both positive and negative effects
                    if (Math.random() < 0.5) {
                        createNoodleExplosion(centerX, centerY);
                    } else {
                        createWaterSplash(centerX, centerY);
                    }
                }
            }
        }
        
        if (otherCard) {
            otherCard.setAttribute('data-selected', 'false');
            otherCard.classList.add('played');
            otherCard.style.transform = 'scale(0.5)';
            otherCard.style.opacity = '0';
            otherCard.style.pointerEvents = 'none';
        }

        // Check if playing this card would cause game over BEFORE applying effects
        if (card.statModifiers) {
            const projectedStats = { ...this.state.playerStats };
            
            // Calculate all changes first including chaos effects
            Object.entries(card.statModifiers).forEach(([stat, value]) => {
                const statKey = stat === 'workers' ? 'workerCount' : 
                              stat === 'prestige' ? 'pastaPrestige' : 
                              stat === 'chaos' ? 'chaosLevel' : 
                              stat;
                
                projectedStats[statKey] = (projectedStats[statKey] || 0) + Number(value);
            });

            // Check for chaos game over BEFORE applying any bounds
            if (projectedStats.chaosLevel >= 100) {
                // Track turns at max chaos
                projectedStats.turnsAtMaxChaos = (this.state.playerStats.turnsAtMaxChaos || 0) + 1;
                
                // Only trigger game over if we've been at max chaos for more than 2 turns
                if (projectedStats.turnsAtMaxChaos > 2) {
                    gameSounds.playGameOverSound();
                    this.endGame('chaos');
                    this.isGameOver = true;
                    return;
                }
            } else {
                // Reset turns at max chaos if chaos drops below 100
                projectedStats.turnsAtMaxChaos = 0;
            }
            
            // Apply bounds after game over check
            if (projectedStats.chaosLevel > 100) {
                projectedStats.chaosLevel = 100;
            }

            // Apply any chaos ingredient loss before checking game over
            if (projectedStats.chaosLevel >= 75 && projectedStats.ingredients > 0) {
                projectedStats.ingredients = Math.max(1, projectedStats.ingredients - 1);
            }

            // Now check game-ending conditions with all effects considered
            if (projectedStats.ingredients <= 0 && !card.statModifiers.ingredients) {
                gameSounds.playGameOverSound();
                this.endGame('ingredients');
                this.isGameOver = true;
                return;
            }

            if (projectedStats.workerCount <= 0) {
                gameSounds.playGameOverSound();
                this.endGame('workers');
                this.isGameOver = true;
                return;
            }
        }

        // Apply stat modifications with balance checks
        if (card.statModifiers) {
            const balancedModifiers = applyStatModifiers(this.state, {...card.statModifiers});
            Object.entries(balancedModifiers).forEach(([stat, value]) => {
                const statKey = stat === 'workers' ? 'workerCount' : 
                              stat === 'prestige' ? 'pastaPrestige' : 
                              stat === 'chaos' ? 'chaosLevel' : 
                              stat;
                
                // Apply natural progression
                if (statKey === 'chaosLevel') {
                    value += 2; // Chaos increases naturally each turn
                } else if (statKey === 'pastaPrestige') {
                    value -= 1; // Prestige decays slightly each turn
                }

                const currentValue = this.state.playerStats[statKey] || 0;
                this.state.playerStats[statKey] = Math.max(0, currentValue + Number(value));
            });
        }

        if (card.type === "upgrade") {
            if (card.requirements) {
                const { prestige } = card.requirements;
                if (prestige && this.state.playerStats.pastaPrestige < prestige) {
                    gameSounds.playBadCardSound();
                    this.showEffectMessage("Not enough prestige for this upgrade!");
                    return;
                }
            }
            
            // Pin the upgrade card BEFORE hiding other cards
            this.pinUpgradeCard(cardName, card);
            
            // Apply permanent upgrade effects
            const upgradeEffect = card.effect(this.state);
            this.showEffectMessage(upgradeEffect);
            
            // Update permanent stats
            this.applyUpgradeStats(card.permanentStats);
            
            // Don't immediately draw new cards for upgrades
            setTimeout(() => {
                document.querySelectorAll('.card').forEach(card => {
                    card.classList.add('played');
                    card.style.transform = 'scale(0.5)';
                    card.style.opacity = '0';
                });
                
                // Draw new cards after animation
                setTimeout(() => {
                    this.drawNewCards();
                }, 500);
            }, 1000);
            
            return; // Exit early after handling upgrade
        }

        // Process turn effects including prestige
        this.processTurnEffects();

        // Visual feedback for card play
        const cardElements = document.querySelectorAll('.card');
        cardElements.forEach(card => card.classList.add('played'));

        // Show effect message
        if (card.effect) {
            const message = card.effect(this.state);
            this.showEffectMessage(message);
        }

        // Update display and check game state
        this.updateDisplay();

        // Check win/lose conditions
        if (this.state.playerStats.chaosLevel >= 100) {
            gameSounds.playGameOverSound();
            this.endGame('chaos');
            this.isGameOver = true;
            return;
        }
        if (this.state.playerStats.workerCount <= 0) {
            gameSounds.playGameOverSound();
            this.endGame('workers');
            this.isGameOver = true;
            return;
        }
        if (this.state.playerStats.ingredients <= 0) {
            gameSounds.playGameOverSound();
            this.endGame('ingredients');
            this.isGameOver = true;
            return;
        }

        // Add this before drawing new cards
        const cleanup = () => {
            document.querySelectorAll('.card').forEach(card => {
                card.remove();  // Completely remove old cards
            });
            // Draw new cards immediately after cleanup
            this.drawNewCards();
        };

        // Schedule cleanup and new cards if game continues
        if (!this.isGameOver) {
            setTimeout(cleanup, 500);
        }
    }

    pinUpgradeCard(cardName, card) {
        const upgradesGrid = document.querySelector('.upgrades-grid');
        
        // Create miniature upgrade card
        const upgradeElement = document.createElement('div');
        upgradeElement.className = 'upgrade-card';
        upgradeElement.innerHTML = `
            <h4>${cardName}</h4>
            <div class="upgrade-effects">
                ${this.formatPermanentEffects(card.permanentStats)}
            </div>
        `;
        
        // Animate the card shrinking and moving
        const originalCard = document.querySelector('.card[data-selected="true"]');
        if (originalCard) {
            const origRect = originalCard.getBoundingClientRect();
            const targetRect = upgradesGrid.getBoundingClientRect();
            
            upgradeElement.style.position = 'fixed';
            upgradeElement.style.left = `${origRect.left}px`;
            upgradeElement.style.top = `${origRect.top}px`;
            upgradeElement.style.width = `${origRect.width}px`;
            upgradeElement.style.height = `${origRect.height}px`;
            
            document.body.appendChild(upgradeElement);
            
            requestAnimationFrame(() => {
                upgradeElement.style.transition = 'all 0.5s ease-out';
                upgradeElement.style.transform = 'scale(0.5)';
                upgradeElement.style.left = `${targetRect.left}px`;
                upgradeElement.style.top = `${targetRect.top}px`;
            });
            
            setTimeout(() => {
                upgradeElement.style = ''; // Reset styles
                upgradesGrid.appendChild(upgradeElement);
            }, 500);
        } else {
            upgradesGrid.appendChild(upgradeElement);
        }
    }

    formatPermanentEffects(permanentStats) {
        if (!permanentStats) return '';
        
        return Object.entries(permanentStats)
            .map(([stat, value]) => {
                const prefix = value > 0 ? '+' : '';
                const percent = value * 100;
                return `<div class="permanent-effect ${stat}-color">
                    ${stat}: ${prefix}${percent}%
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
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <h3>Achievement Unlocked!</h3>
            <p class="achievement-name">${name}</p>
            <p class="achievement-desc">${achievement.description}</p>
            <p class="achievement-reward">${achievement.reward}</p>
        `;
        document.body.appendChild(popup);

        // Remove popup after animation (increased from 3000 to 4500ms)
        setTimeout(() => {
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 500);
        }, 4500);
    }

    endGame(reason = '') {
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
                <p class="end-reason">${reason}</p>
                
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
    }

    start() {
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
                turnsAtMaxChaos: 0, // Add this to track turns at max chaos
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

        // Natural progression effects - chaos increases every 3-5 turns
        if (this.turn % (3 + Math.floor(Math.random() * 3)) === 0) {  // Random interval between 3-5 turns
            const chaosBase = this.turn < 10 ? 0.3 : 0.8; // Reduced base values
            const chaosRandom = Math.random() * 0.4; // Reduced randomness
            
            // Add scaling based on current chaos level and prestige
            const currentChaos = Number(this.state.playerStats.chaosLevel) || 0;
            const currentPrestige = Number(this.state.playerStats.pastaPrestige) || 0;
            
            // Add prestige multiplier when prestige is between 66-100
            const prestigeMultiplier = (currentPrestige >= 66 && currentPrestige <= 100) ? 1.2 : 1;
            
            const chaosMultiplier = currentChaos > 75 ? 0.6 : 
                                   currentChaos > 50 ? 0.8 : 1;
            
            const chaosIncrease = Number((chaosBase + chaosRandom) * chaosMultiplier * prestigeMultiplier);
            
            this.state.playerStats.chaosLevel = Math.min(100, 
                Number(currentChaos + chaosIncrease)
            );
        }
        
        // Prestige decay scales with game progress but is now more predictable
        const prestigeDecay = this.turn < 5 ? 0.2 : 
                             this.turn < 10 ? 0.3 :
                             this.turn < 15 ? 0.4 : 0.5;
        
        this.state.playerStats.pastaPrestige = Number(
            Math.max(0, this.state.playerStats.pastaPrestige - prestigeDecay).toFixed(1)
        );
        
        // Workers get tired more gradually and predictably
        if (this.state.playerStats.workerCount > 15) {
            const workerFatigue = this.turn < 8 ? 0.5 : 1;
            this.state.playerStats.workerCount = Math.max(15, 
                Math.round(this.state.playerStats.workerCount - workerFatigue)
            );
        }

        // High chaos affects ingredients less in early game
        if (this.state.playerStats.chaosLevel >= 75) {
            gameSounds.createGrumbleSound(1.5); // More intense grumble at high chaos
            const ingredientLoss = this.turn < 12 ? 0.5 : 1;
            this.state.playerStats.ingredients = Math.max(0, 
                Math.round(this.state.playerStats.ingredients - ingredientLoss)
            );
        }

        // Add random chatter sound occasionally
        if (Math.random() < 0.2) { // 20% chance each turn
            gameSounds.playRandomChatter();
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
            
            // Schedule return to situation message
            setTimeout(() => {
                const randomSituation = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
                
                // Split situation message into words
                const situationWords = randomSituation.split(' ');
                const wrappedSituation = situationWords.map((word, index) => 
                    `<span style="--word-index: ${index}">${word}</span>`
                ).join(' ');
                
                // Update classes in correct order
                messageBox.className = 'message-box situation';
                textSpan.innerHTML = wrappedSituation;
            }, 3000);
        }
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

document.addEventListener('DOMContentLoaded', () => {
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