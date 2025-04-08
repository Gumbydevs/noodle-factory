import { CARDS, getRandomCard } from './cards.js';
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
                usedMagicCards: false,
                survivedStrikes: 0,
                strikeDeaths: 0,
                perfectCooks: 0,
                highestPrestigeDish: 0
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
            return true;
        });
        const shuffledCards = [...availableCards].sort(() => Math.random() - 0.5);
        const [leftCard, rightCard] = shuffledCards.slice(0, 2);

        // Create new card elements
        cardsContainer.innerHTML = `
            <div class="card" id="card-left">
                <h3>${leftCard}</h3>
                <div class="card-description">${CARDS[leftCard].description}</div>
                <div class="card-effects">
                    ${this.formatCardEffects(CARDS[leftCard].statModifiers)}
                </div>
            </div>
            <div class="card" id="card-right">
                <h3>${rightCard}</h3>
                <div class="card-description">${CARDS[rightCard].description}</div>
                <div class="card-effects">
                    ${this.formatCardEffects(CARDS[rightCard].statModifiers)}
                </div>
            </div>
        `;

        // Add click handlers
        document.getElementById('card-left').onclick = () => this.playCard(leftCard);
        document.getElementById('card-right').onclick = () => this.playCard(rightCard);
    }

    formatCardEffects(modifiers) {
        if (!modifiers) return '';
        
        const colorClasses = {
            prestige: 'prestige-color',
            chaos: 'chaos-color',
            ingredients: 'ingredients-color',
            workers: 'energy-color'
        };

        function getIntensitySymbols(value) {
            const absValue = Math.abs(value);
            const isPositive = value > 0;
            const symbol = isPositive ? 
                '<span style="color: #2ecc71;">+</span>' : 
                '<span style="color: #e74c3c;">-</span>';
                
            if (absValue >= 8) return symbol.repeat(3);
            if (absValue >= 4) return symbol.repeat(2);
            return symbol;
        }
        
        return Object.entries(modifiers)
            .map(([stat, value]) => {
                const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
                const symbols = getIntensitySymbols(value);
                return `<span class="stat-modifier ${colorClasses[stat]}">${statName}: ${symbols}</span>`;
            })
            .join('');
    }

    applyStatModifiers(state, modifiers) {
        // Copy modifiers to avoid mutating the original
        let balancedMods = { ...modifiers };
        
        // Add small random chaos variation (-2 to +2)
        if (balancedMods.chaos) {
            const chaosVariation = (Math.random() * 4) - 2; // Random number between -2 and +2
            balancedMods.chaos = Number((balancedMods.chaos + chaosVariation).toFixed(1));
        }

        // Ensure chaos doesn't drop too low
        if (balancedMods.chaos && balancedMods.chaos < 0) {
            const minChaos = 5;
            if (state.playerStats.chaosLevel + balancedMods.chaos < minChaos) {
                balancedMods.chaos = minChaos - state.playerStats.chaosLevel;
            }
        }

        // Cap stats at their maximum values
        if (balancedMods.prestige) {
            const maxPrestige = 100;
            const currentPrestige = state.playerStats.pastaPrestige;
            if (currentPrestige + balancedMods.prestige > maxPrestige) {
                balancedMods.prestige = maxPrestige - currentPrestige;
            }
        }

        if (balancedMods.workers) {
            const maxWorkers = 50;
            const currentWorkers = state.playerStats.workerCount;
            if (currentWorkers + balancedMods.workers > maxWorkers) {
                balancedMods.workers = maxWorkers - currentWorkers;
            }
        }

        return balancedMods;
    }

    playCard(cardName) {
        if (this.isGameOver) return;

        const card = CARDS[cardName];
        if (!card) return;

        // Play appropriate sound based on card effects
        if (card.statModifiers) {
            let isPositiveCard = false;
            let isNegativeCard = false;

            // Check if card is generally positive or negative
            Object.entries(card.statModifiers).forEach(([stat, value]) => {
                if (stat === 'chaos') {
                    // Negative chaos change is good
                    if (value < 0) isPositiveCard = true;
                    if (value > 10) isNegativeCard = true;
                } else {
                    // Positive changes to other stats are good
                    if (value > 0) isPositiveCard = true;
                    if (value < 0) isNegativeCard = true;
                }
            });

            // Play appropriate sound
            if (isPositiveCard && !isNegativeCard) {
                gameSounds.playPowerUpSound();
            } else if (isNegativeCard && !isPositiveCard) {
                gameSounds.playBadCardSound();
            } else {
                // Mixed or neutral cards just use regular card sound
                gameSounds.playCardSound();
            }
        } else {
            // Default card sound if no modifiers
            gameSounds.playCardSound();
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
            // Delay smoke to start during wiggle animation
            setTimeout(() => {
                for (let i = 0; i < 12; i++) {
                    setTimeout(() => {
                        createSmokeParticle(
                            rect.left + (Math.random() * rect.width),
                            rect.top + (Math.random() * rect.height)
                        );
                    }, i * 40); // Spread smoke creation over 480ms
                }
            }, 200); // Start smoke after initial wiggle
        }
        
        if (otherCard) {
            otherCard.setAttribute('data-selected', 'false');
            otherCard.classList.add('played');
            otherCard.style.transform = 'scale(0.5)';
            otherCard.style.opacity = '0';
            otherCard.style.pointerEvents = 'none';
        }

        // Add smoke effect
        if (clickedCard) {
            const rect = clickedCard.getBoundingClientRect();
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    createSmokeParticle(
                        rect.left + Math.random() * rect.width,
                        rect.top + Math.random() * rect.height
                    );
                }, i * 50);
            }
        }

        clickedCard.classList.add('dissolving');

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
                gameSounds.playGameOverSound();
                this.endGame('chaos');
                this.isGameOver = true;
                return;
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
            const balancedModifiers = this.applyStatModifiers(this.state, {...card.statModifiers});
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

        // Process turn effects including prestige
        this.processTurnEffects();

        // Visual feedback for card play
        const cardElements = document.querySelectorAll('.card');
        cardElements.forEach(card => card.classList.add('played'));

        // Show effect message
        if (card.effect) {
            const message = card.effect(this.state);
            const messageBox = document.getElementById('game-messages');
            const textSpan = document.createElement('span');
            textSpan.className = 'message-text';
            messageBox.innerHTML = ''; // Clear existing content
            messageBox.appendChild(textSpan);
            
            // Immediately show the card effect message (no fade)
            textSpan.textContent = message;
            messageBox.classList.remove('situation');
            messageBox.classList.add('feedback');

            // Longer display time (4 seconds) before next transition
            setTimeout(() => {
                textSpan.classList.add('fading');
                
                setTimeout(() => {
                    const randomSituation = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
                    messageBox.classList.remove('feedback');
                    messageBox.classList.add('situation');
                    textSpan.textContent = randomSituation;
                    textSpan.classList.remove('fading');
                }, 500);
            }, 4000);
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
        
        // Determine end game message
        let message = '';
        switch(reason) {
            case 'ingredients':
                message = 'You ran out of ingredients and cannot play any cards!';
                break;
            case 'chaos':
                message = 'Your factory descended into total chaos!';
                break;
            case 'workers':
                message = 'Your workers have all quit!';
                break;
            default:
                message = 'The factory has ceased operations!';
        }

        // Get and update high score before creating game over screen
        const highScore = updateHighScore(this.turn);

        // Update the game over screen HTML to change button text
        gameOverScreen.innerHTML = `
            <div class="game-over-content">
                <h2>Game Over!</h2>
                <p class="end-reason">${message}</p>
                
                <div class="score-display">
                    <div class="current-score">
                        <h3>Your Score</h3>
                        <span class="score-value turn-score">${this.turn}</span>
                        <span class="score-label">TURNS</span>
                    </div>
                    <div class="high-score">
                        <h3>Best Score</h3>
                        <span class="score-value">${highScore}</span>
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
                    <button id="reset-achievements" class="button secondary small">Reset Progress</button>
                </div>
            </div>
        `;

        // Hide cards and old message box
        this.hideCards();
        document.getElementById('game-messages').style.display = 'none';
        
        // Add game over screen
        gameContainer.appendChild(gameOverScreen);
        this.checkHighScore();
        
        // Update the reset handler to show clear confirmation
        document.getElementById('reset-achievements').addEventListener('click', () => {
            resetAchievements();
            this.achievements = new Set(); // Clear local achievements
            localStorage.removeItem('noodleFactoryHighScore'); // Reset high score
            // Update achievements display and high score display
            document.querySelector('.achievements-grid').innerHTML = 'All progress has been reset!';
            document.querySelector('.high-score .score-value').textContent = '0';
        });

        // Add event listener to new game button
        document.getElementById('new-game').addEventListener('click', () => {
            // Remove game over screen
            gameOverScreen.remove();
            // Show message box again
            document.getElementById('game-messages').style.display = 'block';
            // Start new game
            this.start();
        });

        // Add event listener to share results button
        document.getElementById('share-results').addEventListener('click', () => {
            this.shareGameResults();
        });
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
                usedMagicCards: false,
                survivedStrikes: 0,
                strikeDeaths: 0,
                perfectCooks: 0,
                highestPrestigeDish: 0,
                chosenLesserWeevil: false
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
        // Play chaos sound AND grumble sound for more impact
        gameSounds.playChaosSound();
        gameSounds.createGrumbleSound(this.state.playerStats.chaosLevel / 50); // Intensity based on chaos level

        const messageBox = document.getElementById('game-messages');
        messageBox.textContent = message;
        messageBox.classList.add('chaos-warning', 'active');
        
        // Remove animation classes after they complete
        setTimeout(() => {
            messageBox.classList.remove('active');
        }, 3000);
        
        // Random negative effect
        const effects = [
            () => {
                if (this.state.playerStats.ingredients > 0) {
                    return "An ingredient vanishes into the chaos!";
                }
                return "The chaos searches for ingredients to consume...";
            },
            () => {
                if (this.reduceWorkers(2)) {
                    return "The chaos drains worker energy!";
                }
                return "The workers resist the chaos!";
            },
            () => {
                this.state.playerStats.pastaPrestige = Math.max(0, this.state.playerStats.pastaPrestige - 5);
                return "Your reputation suffers from the chaos!";
            }
        ];
        
        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
        const effectMessage = randomEffect();
        messageBox.textContent = `${message} ${effectMessage}`;
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
        // Natural progression effects each turn
        // Add small random chaos increase
        const chaosBase = this.turn < 10 ? 0.5 : 1;
        const chaosRandom = Math.random() * 0.5; // 0 to 0.5 additional chaos
        const chaosIncrease = Number((chaosBase + chaosRandom).toFixed(1));
        
        this.state.playerStats.chaosLevel = Math.min(100, 
            Number((this.state.playerStats.chaosLevel + chaosIncrease).toFixed(1))
        );
        
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
            messageBox.textContent = message;
            messageBox.classList.remove('situation');
            messageBox.classList.add('feedback');
            
            setTimeout(() => {
                messageBox.classList.remove('feedback');
                messageBox.classList.add('situation');
                messageBox.textContent = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
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