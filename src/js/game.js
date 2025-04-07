import { CARDS, getRandomCard } from './cards.js';
import events from './events.js';
import { gameState, updateResource, resetGameState } from './state.js';
import { ACHIEVEMENTS } from './achievements.js';
import { updateHighScore, getHighScore } from './highscore.js';
import { triggerNoodleRoll } from './animation.js';

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
    "Something stirs in the depths of the sauce reservoir."
];

class Game {
    constructor() {
        this.state = resetGameState();
        this.isGameOver = false;
        this.turn = 0;
        this.achievements = new Set();
        this.unlocks = {
            tier1: false,
            tier2: false,
            tier3: false
        };

        // Clear any existing chaos effects
        document.body.classList.remove('chaos-level-1', 'chaos-level-2', 'chaos-level-3', 'chaos-level-max', 'chaos-noise');

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
        document.getElementById('prestige').textContent = this.state.playerStats.pastaPrestige;
        document.getElementById('chaos').textContent = this.state.playerStats.chaosLevel;
        document.getElementById('ingredients').textContent = this.state.playerStats.ingredients.length;
        document.getElementById('energy').textContent = this.state.playerStats.workerCount;
        document.getElementById('turn').textContent = this.turn;

        // Update progress bars
        document.getElementById('prestige-progress').style.width = 
            `${(this.state.playerStats.pastaPrestige / 100) * 100}%`;
        document.getElementById('chaos-progress').style.width = 
            `${(this.state.playerStats.chaosLevel / 100) * 100}%`;
        document.getElementById('ingredients-progress').style.width = 
            `${(this.state.playerStats.ingredients.length / 20) * 100}%`;
        document.getElementById('workers-progress').style.width = 
            `${(this.state.playerStats.workerCount / 100) * 100}%`;
        document.getElementById('turn-progress').style.width = 
            `${(this.turn / 50) * 100}%`;  // Assuming 50 turns is "full"

        // Fix: Get stats bar reference
        const statsBar = document.getElementById('stats');
        
        // Add initial transition style if not already present
        if (!statsBar.style.transition) {
            statsBar.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }

        // Function to slightly rotate the stats bar
        const rotateStats = () => {
            const rotation = (Math.random() * 1 - 0.5); // Random between -0.5 and 0.5 degrees
            statsBar.style.transform = `rotate(${rotation}deg)`;
        };

        // Clear any existing interval
        if (statsBar.dataset.intervalId) {
            clearInterval(parseInt(statsBar.dataset.intervalId));
        }

        // Add periodic tiny movements
        const intervalId = setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance to move
                rotateStats();
            }
        }, Math.random() * 4000 + 3000); // Random interval between 3-7 seconds

        // Store interval ID for cleanup
        statsBar.dataset.intervalId = intervalId;

        // Add initial rotation
        rotateStats(); // Add this line to ensure initial movement

        this.checkAchievements();
    }

    drawNewCards() {
        const leftCard = getRandomCard();
        let rightCard;
        do {
            rightCard = getRandomCard();
        } while (rightCard === leftCard);

        // Check if both cards are unplayable due to no ingredients
        if (!this.checkCardRequirements(CARDS[leftCard]) && 
            !this.checkCardRequirements(CARDS[rightCard])) {
            this.endGame('ingredients');
            return;
        }

        // Update card displays with more detail
        const leftCardEl = document.getElementById('card-left');
        const rightCardEl = document.getElementById('card-right');

        leftCardEl.querySelector('h3').textContent = leftCard;
        rightCardEl.querySelector('h3').textContent = rightCard;

        leftCardEl.querySelector('.card-description').textContent = CARDS[leftCard].description || '';
        rightCardEl.querySelector('.card-description').textContent = CARDS[rightCard].description || '';

        // Add stat modifiers
        const leftEffects = this.getStatModifiersHTML(CARDS[leftCard].statModifiers);
        const rightEffects = this.getStatModifiersHTML(CARDS[rightCard].statModifiers);
        
        leftCardEl.querySelector('.card-effects').innerHTML = leftEffects;
        rightCardEl.querySelector('.card-effects').innerHTML = rightEffects;

        // Add base transition style for smooth animations
        const transitionStyle = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        leftCardEl.style.transition = transitionStyle;
        rightCardEl.style.transition = transitionStyle;

        // Function to randomly rotate a card
        const rotateCard = (cardEl) => {
            const rotation = (Math.random() * 6 - 3); // Random between -3 and 3 degrees
            cardEl.style.transform = `rotate(${rotation}deg)`;
        };

        // Clear previous event listeners
        const newLeftCard = leftCardEl.cloneNode(true);
        const newRightCard = rightCardEl.cloneNode(true);
        leftCardEl.parentNode.replaceChild(newLeftCard, leftCardEl);
        rightCardEl.parentNode.replaceChild(newRightCard, rightCardEl);

        // Add new event listeners
        newLeftCard.addEventListener('click', () => this.playCard(leftCard));
        newRightCard.addEventListener('click', () => this.playCard(rightCard));

        // Initial rotation with delay
        setTimeout(() => rotateCard(newLeftCard), 300);
        setTimeout(() => rotateCard(newRightCard), 500);

        // Add periodic movements
        const addLifeToCard = (cardEl) => {
            const intervalId = setInterval(() => {
                if (Math.random() < 0.4) { // 40% chance to move
                    rotateCard(cardEl);
                }
            }, Math.random() * 2000 + 3000); // Random interval between 3-5 seconds
            
            // Store interval ID on the element to clear it later
            cardEl.dataset.intervalId = intervalId;
        };

        // Start the movements
        setTimeout(() => {
            addLifeToCard(newLeftCard);
            addLifeToCard(newRightCard);
        }, 1000);

        // Add visual feedback for unplayable cards
        this.updateCardPlayability(newLeftCard, CARDS[leftCard]);
        this.updateCardPlayability(newRightCard, CARDS[rightCard]);
    }

    updateCardPlayability(cardElement, card) {
        const isPlayable = this.checkCardRequirements(card);
        cardElement.classList.toggle('unplayable', !isPlayable);
        
        // Add requirement text if card is unplayable
        if (!isPlayable && card.requirements) {
            const reqText = document.createElement('div');
            reqText.className = 'requirement-text';
            reqText.textContent = `Requires ${card.requirements.ingredients} ingredients`;
            cardElement.querySelector('.card-effects').appendChild(reqText);
        }
    }

    checkCardRequirements(card) {
        // Only check card-specific requirements
        if (!card.requirements) return true;
        
        if (card.requirements.ingredients) {
            return this.state.playerStats.ingredients.length >= card.requirements.ingredients;
        }
        return true;
    }

    getStatModifiersHTML(modifiers) {
        if (!modifiers) return '';
        
        let html = '';
        for (const [stat, value] of Object.entries(modifiers)) {
            const className = value > 0 ? 'positive' : 'negative';
            const prefix = value > 0 ? '+' : '';
            // Update display text for workers
            const displayStat = stat === 'workers' ? 'workers' : stat;
            const colorClass = {
                'prestige': 'prestige-color',
                'chaos': 'chaos-color',
                'ingredients': 'ingredients-color',
                'workers': 'energy-color'  // Keep same CSS class for now
            }[stat] || '';
            
            html += `<div class="stat-modifier ${colorClass}">
                ${displayStat}: <span class="${className}">${prefix}${value}</span>
            </div>`;
        }
        return html;
    }

    playCard(cardName) {
        if (this.isGameOver) return;

        const card = CARDS[cardName];
        
        // Check card-specific requirements
        if (!this.checkCardRequirements(card)) {
            const messageBox = document.getElementById('game-messages');
            messageBox.textContent = "Not enough ingredients to play this card!";
            messageBox.classList.remove('situation');
            messageBox.classList.add('feedback');
            return;
        }

        // Apply card effects
        const message = card.effect(this.state);
        const messageBox = document.getElementById('game-messages');
        
        // Show feedback message
        messageBox.textContent = `${message}`;
        messageBox.classList.remove('situation');
        messageBox.classList.add('feedback');

        // Increased to 4 seconds (4000ms)
        setTimeout(() => {
            messageBox.classList.add('fade-out');
            
            setTimeout(() => {
                const situation = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
                messageBox.textContent = situation;
                messageBox.classList.remove('feedback');
                messageBox.classList.add('situation');
                messageBox.classList.remove('fade-out');
            }, 500);
        }, 4000); // Changed from 2000 to 4000

        this.turn++;
        
        // Update chaos effects
        updateChaosEffects(this.state.playerStats.chaosLevel);

        // Check chaos events before game over condition
        this.checkChaosEvents();

        // Check game over conditions
        if (this.state.playerStats.chaosLevel >= 100) {
            this.endGame('chaos');
            return;
        }
        if (this.state.playerStats.workerCount <= 0) {
            this.endGame('workers');
            return;
        }

        this.checkAchievements();

        this.updateDisplay();
        this.drawNewCards();
    }

    checkAchievements() {
        for (const [name, achievement] of Object.entries(ACHIEVEMENTS)) {
            if (!this.achievements.has(name) && achievement.check(this.state.playerStats)) {
                this.unlockAchievement(name, achievement);
            }
        }
    }

    unlockAchievement(name, achievement) {
        this.achievements.add(name);
        this.showAchievementPopup(name, achievement);
        
        // If achievement has a reward, apply it
        if (achievement.reward) {
            // Handle reward logic here
            console.log(`Achievement reward unlocked: ${achievement.reward}`);
        }
    }

    showAchievementPopup(name, achievement) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <h3>Achievement Unlocked!</h3>
            <p>${name}</p>
            <p>${achievement.description}</p>
        `;
        document.body.appendChild(popup);

        // Remove popup after animation
        setTimeout(() => {
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 500);
        }, 3000);
    }

    endGame(reason = '') {
        this.isGameOver = true;
        let message = '';
        
        // Reset all chaos effects
        const body = document.body;
        body.classList.remove('chaos-level-1', 'chaos-level-2', 'chaos-level-3', 'chaos-level-max', 'chaos-noise');
        
        // Create game over screen
        const gameContainer = document.getElementById('game-container');
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over-screen';
        
        // Determine end game message
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

        // Update the game over screen HTML to include high score
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
                            <span>${this.state.playerStats.ingredients.length}</span>
                        </div>
                        <div class="final-stat energy-color">
                            <span>Workers</span>
                            <span>${this.state.playerStats.workerCount}</span>
                        </div>
                    </div>
                </div>
                
                <div class="achievements-section">
                    <h3>Achievements Earned</h3>
                    <div class="achievements-grid">
                        ${Array.from(this.achievements).map(achievement => `
                            <div class="achievement-item">
                                <span class="achievement-name">${achievement}</span>
                                <span class="achievement-desc">${ACHIEVEMENTS[achievement].description}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <button id="new-game" class="button">Start New Run</button>
            </div>
        `;

        // Hide cards and old message box
        this.hideCards();
        document.getElementById('game-messages').style.display = 'none';
        
        // Add game over screen
        gameContainer.appendChild(gameOverScreen);
        this.checkHighScore(); // Add this line
        
        // Add event listener to new game button
        document.getElementById('new-game').addEventListener('click', () => {
            // Remove game over screen
            gameOverScreen.remove();
            // Show message box again
            document.getElementById('game-messages').style.display = 'block';
            // Start new game
            this.start();
        });
    }

    start() {
        resetGameState();
        this.state = gameState;
        this.isGameOver = false;
        this.turn = 1;
        
        // Reset all chaos effects
        const body = document.body;
        body.classList.remove('chaos-level-1', 'chaos-level-2', 'chaos-level-3', 'chaos-level-max', 'chaos-noise');
        const messageBox = document.getElementById('game-messages');
        messageBox.classList.remove('chaos-warning');
        
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

    checkChaosEvents() {
        const chaos = this.state.playerStats.chaosLevel;
        const body = document.body;
        const messageBox = document.getElementById('game-messages');
        
        // Remove all chaos classes first
        body.classList.remove('chaos-level-1', 'chaos-level-2', 'chaos-level-3', 'chaos-level-max', 'chaos-noise');
        messageBox.classList.remove('chaos-warning');
        
        // More gradual chaos progression
        if (chaos >= 80) {
            body.classList.add('chaos-level-max', 'chaos-noise');
            this.triggerChaosEvent("Reality itself begins to melt!");
        }
        else if (chaos >= 65) {
            body.classList.add('chaos-level-3', 'chaos-noise');
            this.triggerChaosEvent("The factory exists in multiple dimensions!");
        }
        else if (chaos >= 45) {
            body.classList.add('chaos-level-2');
            this.triggerChaosEvent("Strange distortions appear in the corners of your vision...");
        }
        else if (chaos >= 25) {
            body.classList.add('chaos-level-1');
            this.triggerChaosEvent("Something feels slightly off...");
        }
    }

    triggerChaosEvent(message) {
        const messageBox = document.getElementById('game-messages');
        messageBox.textContent = message;
        messageBox.classList.add('chaos-warning');
        
        // Random negative effect
        const effects = [
            () => {
                if (this.state.playerStats.ingredients.length > 0) {
                    this.state.playerStats.ingredients.pop();
                    return "An ingredient vanishes into the chaos!";
                }
                return "The chaos searches for ingredients to consume...";
            },
            () => {
                this.state.playerStats.workerCount -= 5;
                return "The chaos drains worker energy!";
            },
            () => {
                this.state.playerStats.pastaPrestige -= 5;
                return "Your reputation suffers from the chaos!";
            }
        ];
        
        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
        const effectMessage = randomEffect();
        messageBox.textContent = `${message} ${effectMessage}`;
        
        this.updateDisplay();
    }

    checkHighScore() {
        const currentScore = this.turn;
        const previousHigh = getHighScore();
        const isNewHighScore = currentScore > previousHigh;
        
        if (isNewHighScore) {
            const scoreDisplay = document.querySelector('.score-display');
            scoreDisplay.classList.add('new-high-score');
        }
    }
}

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