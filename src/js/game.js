import { CARDS, getRandomCard } from './cards.js';
import events from './events.js';
import { gameState, updateResource, resetGameState, updateChaosEffects } from './state.js';
import { ACHIEVEMENTS, checkAchievements, getUnlockedAchievements, resetAchievements } from './achievements.js';
import { updateHighScore, getHighScore } from './highscore.js';
import { triggerNoodleRoll } from './animation.js';
import { gameSounds } from '../audio.js'; // Note the .js extension

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
        // Update all stat displays
        const stats = {
            'prestige': this.state.playerStats.pastaPrestige,
            'chaos': this.state.playerStats.chaosLevel,
            'ingredients': this.state.playerStats.ingredients,
            'energy': this.state.playerStats.workerCount,
            'turn': this.turn
        };

        // Update text values
        Object.entries(stats).forEach(([stat, value]) => {
            const element = document.getElementById(stat);
            if (element) {
                element.textContent = value;
            }
        });

        // Update progress bars
        const progressBars = {
            'prestige-progress': (this.state.playerStats.pastaPrestige / 100) * 100,
            'chaos-progress': (this.state.playerStats.chaosLevel / 100) * 100,
            'ingredients-progress': (this.state.playerStats.ingredients / 20) * 100,
            'workers-progress': (this.state.playerStats.workerCount / 100) * 100,
            'turn-progress': (this.turn / 50) * 100
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
        
        // Remove all chaos classes first
        body.classList.remove('chaos-level-1', 'chaos-level-2', 'chaos-level-3', 'chaos-level-max', 'chaos-noise');
        messageBox.classList.remove('chaos-warning');
        
        // Add proper mobile-friendly chaos classes
        if (chaos >= 100) {
            body.classList.add('chaos-level-max');
            // Only add noise effect on desktop
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
        
        return Object.entries(modifiers)
            .map(([stat, value]) => {
                const sign = value > 0 ? '<span style="color: #2ecc71;">+</span>' : '<span style="color: #e74c3c;">-</span>';
                const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
                const absValue = Math.abs(value);
                return `<span class="stat-modifier ${colorClasses[stat]}">${statName}: ${sign}${absValue}</span>`;
            })
            .join('');
    }

    playCard(cardName) {
        if (this.isGameOver) return;  // This check exists but isGameOver wasn't being set

        // Play card sound only if audio is enabled
        if (soundManager.enabled) {
            gameSounds.playCardSound();
        }

        const card = CARDS[cardName];
        if (!card) return;

        // Get the clicked card element more reliably
        const clickedCard = Array.from(document.querySelectorAll('.card')).find(
            card => card.querySelector('h3').textContent === cardName
        );
        const otherCard = Array.from(document.querySelectorAll('.card')).find(
            card => card !== clickedCard
        );

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
            clickedCard.classList.add('played');
            clickedCard.style.transform = 'scale(0.8) translateY(-20px)';
            clickedCard.style.opacity = '0';
            clickedCard.style.pointerEvents = 'none';  // Prevent any further interactions
        }
        
        if (otherCard) {
            otherCard.setAttribute('data-selected', 'false');
            otherCard.classList.add('played');
            otherCard.style.transform = 'scale(0.5)';
            otherCard.style.opacity = '0';
            otherCard.style.pointerEvents = 'none';  // Prevent any further interactions
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

            // Apply any chaos ingredient loss before checking game over
            if (projectedStats.chaosLevel >= 75 && projectedStats.ingredients > 0) {
                projectedStats.ingredients = Math.max(1, projectedStats.ingredients - 1);
            }

            // Now check game-ending conditions with all effects considered
            if (projectedStats.ingredients <= 0 && !card.statModifiers.ingredients) {
                gameSounds.playGameOverSound();
                this.endGame('ingredients');
                this.isGameOver = true;  // Add this line for redundancy
                return;
            }

            if (projectedStats.workerCount <= 0) {
                gameSounds.playGameOverSound();
                this.endGame('workers');
                this.isGameOver = true;  // Add this line for redundancy
                return;
            }
        }

        // Apply stat modifications
        if (card.statModifiers) {
            Object.entries(card.statModifiers).forEach(([stat, value]) => {
                const statKey = stat === 'workers' ? 'workerCount' : 
                              stat === 'prestige' ? 'pastaPrestige' : 
                              stat === 'chaos' ? 'chaosLevel' : 
                              stat;
                
                const currentValue = this.state.playerStats[statKey] || 0;
                let newValue = currentValue + Number(value);
                
                // Apply bounds
                if (statKey === 'chaosLevel') {
                    newValue = Math.min(100, Math.max(0, newValue));
                } else if (statKey === 'ingredients') {
                    newValue = Math.min(20, Math.max(0, newValue));
                } else {
                    newValue = Math.max(0, newValue);
                }
                
                this.state.playerStats[statKey] = newValue;
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
        this.turn++;

        // Check win/lose conditions
        if (this.state.playerStats.chaosLevel >= 100) {
            gameSounds.playGameOverSound();
            this.endGame('chaos');
            this.isGameOver = true;  // Add this line for redundancy
            return;  // Make sure we return here to prevent further card processing
        }
        if (this.state.playerStats.workerCount <= 0) {
            gameSounds.playGameOverSound();
            this.endGame('workers');
            this.isGameOver = true;  // Add this line for redundancy
            return;
        }
        if (this.state.playerStats.ingredients <= 0) {
            gameSounds.playGameOverSound();
            this.endGame('ingredients');
            this.isGameOver = true;  // Add this line for redundancy
            return;
        }

        // Add this before drawing new cards
        const cleanup = () => {
            document.querySelectorAll('.card').forEach(card => {
                card.remove();  // Completely remove old cards
            });
        };

        // Draw new cards if game continues
        if (!this.isGameOver) {
            setTimeout(() => {
                cleanup();
                this.drawNewCards();
            }, 500);
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
            <p>${name}</p>
            <p>${achievement.description}</p>
            <p class="reward">${achievement.reward}</p>
        `;
        document.body.appendChild(popup);

        // Remove popup after animation
        setTimeout(() => {
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 500);
        }, 3000);
    }

    endGame(reason = '') {
        this.isGameOver = true;  // Add this line at the start of endGame
        this.checkHighScore();
        
        // Reset all chaos effects
        const body = document.body;
        body.classList.remove('chaos-level-1', 'chaos-level-2', 'chaos-level-3', 'chaos-level-max', 'chaos-noise');
        
        // Remove CRT effect
        document.querySelector('.crt-overlay').classList.remove('active');

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
                            <span>${this.state.playerStats.pastaPrestige}</span>
                        </div>
                        <div class="final-stat chaos-color">
                            <span>Chaos</span>
                            <span>${this.state.playerStats.chaosLevel}</span>
                        </div>
                        <div class="final-stat ingredients-color">
                            <span>Ingredients</span>
                            <span>${this.state.playerStats.ingredients}</span>
                        </div>
                        <div class="final-stat energy-color">
                            <span>Workers</span>
                            <span>${this.state.playerStats.workerCount}</span>
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
        this.checkHighScore(); // Add this line
        
        // Update the reset handler to show clear confirmation
        document.getElementById('reset-achievements').addEventListener('click', () => {
            resetAchievements();
            this.achievements = new Set(); // Clear local achievements
            // Update achievements display without triggering new checks
            document.querySelector('.achievements-grid').innerHTML = 'All progress has been reset!';
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
        // Initialize audio on game start (first user interaction)
        soundManager.init();

        // Now play the start game sound
        if (soundManager.enabled) {
            gameSounds.playStartGameSound();
        }

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
        // Play chaos sound
        gameSounds.playChaosSound();

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
        // Prestige effects:
        // 1. Higher prestige gives bonus ingredients
        if (this.turn % 5 === 0) { // Every 5 turns
            const prestigeBonus = Math.floor(this.state.playerStats.pastaPrestige / 20); // Every 20 prestige = +1 ingredient
            if (prestigeBonus > 0) {
                this.state.playerStats.ingredients = Math.min(20, 
                    this.state.playerStats.ingredients + prestigeBonus);
                this.showEffectMessage(`Your prestige attracted ${prestigeBonus} bonus ingredients!`);
            }
        }

        // 2. Modified: Higher prestige reduces worker loss from chaos
        if (this.state.playerStats.chaosLevel >= 50) {
            const prestigeProtection = Math.min(0.7, this.state.playerStats.pastaPrestige / 100); // Increased from 0.5 to 0.7
            if (Math.random() > prestigeProtection && Math.random() < 0.3) { // Added 30% chance to trigger
                this.reduceWorkers(1);
            }
        }

        // 3. Prestige helps recover from chaos
        if (this.state.playerStats.pastaPrestige >= 50) {
            const chaosReduction = Math.floor(this.state.playerStats.pastaPrestige / 50);
            if (this.state.playerStats.chaosLevel > 0) {
                this.state.playerStats.chaosLevel = Math.max(0, 
                    this.state.playerStats.chaosLevel - chaosReduction);
            }
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

    // Add this method to the Game class
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

// Add this after game class declaration but before initialization

class SoundManager {
    constructor() {
        this.enabled = false;
        this.initialized = false;
        this.context = null;
        this.soundsLoaded = false;
    }

    // Initialize audio context on first user interaction
    init() {
        if (this.initialized) return;
        
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            
            // Resume context for iOS/Safari
            if (this.context.state === 'suspended') {
                this.context.resume();
            }
            
            this.enabled = true;
            this.initialized = true;
            
            // Re-enable sounds in gameSounds
            if (gameSounds) {
                gameSounds.enableSounds();
            }
        } catch (e) {
            console.log('Audio initialization failed:', e);
        }
    }
}

// Create global sound manager
const soundManager = new SoundManager();

// Initialize game but don't auto-start
const game = new Game();
document.getElementById('start-game').addEventListener('click', () => game.start());

// Add Noodle text animation
function setupNoodleWiggle() {
    const noodleText = document.querySelector('.jiggly');
    if (!noodleText) return; // Guard clause in case element isn't found

    // Initial wiggle
    noodleText.classList.add('active');
    
    setInterval(() => {
        if (Math.random() < 0.2) { // 20% chance every 3 seconds
            noodleText.classList.remove('active');
            // Force reflow
            void noodleText.offsetWidth;
            noodleText.classList.add('active');
        }
    }, 3000);
}

// Call the function after DOM is loaded
document.addEventListener('DOMContentLoaded', setupNoodleWiggle);

// Add event listeners for mobile touch
document.addEventListener('touchstart', () => {
    soundManager.init();
}, { once: true });

// Add click listener for desktop
document.addEventListener('click', () => {
    soundManager.init();
}, { once: true });

// New functions added
function canPlayCard(card) {
    // Don't check ingredient requirements if the card grants ingredients
    if (card.effects.some(effect => effect.type === 'ingredients' && effect.value > 0)) {
        return true;
    }
    
    // Only grey out cards if they would consume ingredients and player has none
    if (card.effects.some(effect => effect.type === 'ingredients' && effect.value < 0)) {
        return gameState.ingredients >= Math.abs(Math.min(...card.effects
            .filter(e => e.type === 'ingredients')
            .map(e => e.value)));
    }
    
    return true;
}

function processTurn() {
    // Add 0-3 random workers each turn
    const newWorkers = Math.floor(Math.random() * 4); // Random number between 0-3
    gameState.workers += newWorkers;
    
    // Prevent automatic ingredient loss when at 0
    if (gameState.ingredients > 0) {
        gameState.ingredients = Math.max(0, gameState.ingredients - 1);
    }
    // ... rest of turn processing
}

// Debug keyboard shortcuts for testing
document.addEventListener('keydown', (e) => {
    // Only process if game exists and Control key is pressed
    if (!game || !e.ctrlKey) return;

    switch (e.key.toLowerCase()) {
        // Chaos controls
        case 'c':
            game.state.playerStats.chaosLevel = Math.min(100, game.state.playerStats.chaosLevel + 15);
            game.updateDisplay();
            break;
        case 'x':
            game.state.playerStats.chaosLevel = Math.max(0, game.state.playerStats.chaosLevel - 15);
            game.updateDisplay();
            break;
        
        // Prestige controls
        case 'p':
            game.state.playerStats.pastaPrestige = Math.min(100, game.state.playerStats.pastaPrestige + 15);
            game.updateDisplay();
            break;
        case 'o':
            game.state.playerStats.pastaPrestige = Math.max(0, game.state.playerStats.pastaPrestige - 15);
            game.updateDisplay();
            break;
    }
});

export default Game;