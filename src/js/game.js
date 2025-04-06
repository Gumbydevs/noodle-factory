import { CARDS, getRandomCard } from './cards.js';
import events from './events.js';
import { gameState, updateResource, resetGameState } from './state.js';
import { ACHIEVEMENTS } from './achievements.js';

const SITUATIONS = [
    "The factory floor hums with the sound of pasta machines.",
    "Steam clouds drift between the massive industrial vats.",
    "Noodles of various shapes snake through the conveyor belts.",
    "The air is thick with the aroma of fresh pasta.",
    "Workers bustle between the towering vats of boiling water.",
    "A mysterious fog rolls out from beneath Vat 7.",
    "The ancient pasta spirits demand their tribute.",
    "The factory's ancient machinery groans ominously.",
    "Shadows dance between the steam vents.",
    "Something stirs in the depths of the sauce reservoir."
];

class Game {
    constructor() {
        this.state = gameState;
        this.isGameOver = false;
        this.turn = 1;

        // Add progression tracking
        this.unlocks = {
            tier1: false,
            tier2: false,
            tier3: false
        };
        this.achievements = new Set();
        this.checkAchievements(); // Initial check

        // Ensure cards are hidden and start button is visible on initial load
        this.hideCards();
        document.getElementById('start-game').classList.remove('hidden');
        
        // Add initial message
        const messageBox = document.getElementById('game-messages');
        messageBox.textContent = "Click below to start managing your Noodle Factory!";
        messageBox.classList.remove('feedback');
        messageBox.classList.add('situation');
    }

    hideCards() {
        document.getElementById('cards-container').classList.add('hidden');
    }

    showCards() {
        document.getElementById('cards-container').classList.remove('hidden');
    }

    updateDisplay() {
        // Update all stats
        document.getElementById('prestige').textContent = this.state.playerStats.pastaPrestige;
        document.getElementById('chaos').textContent = this.state.playerStats.chaosLevel;
        document.getElementById('ingredients').textContent = this.state.playerStats.ingredients.length;
        document.getElementById('energy').textContent = this.state.playerStats.workerEnergy;
        document.getElementById('turn').textContent = this.turn;

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

        // Add random animation delays
        leftCardEl.style.setProperty('--animation-delay', Math.random() * 2);
        rightCardEl.style.setProperty('--animation-delay', Math.random() * 2);

        // Clear previous event listeners
        leftCardEl.replaceWith(leftCardEl.cloneNode(true));
        rightCardEl.replaceWith(rightCardEl.cloneNode(true));

        // Add new event listeners
        document.getElementById('card-left').addEventListener('click', () => this.playCard(leftCard));
        document.getElementById('card-right').addEventListener('click', () => this.playCard(rightCard));

        // Add visual feedback for unplayable cards
        this.updateCardPlayability(leftCardEl, CARDS[leftCard]);
        this.updateCardPlayability(rightCardEl, CARDS[rightCard]);
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
        const state = this.state;
        
        // Check base requirements first
        if (state.playerStats.ingredients.length < 1 || state.playerStats.workerEnergy < 1) {
            return false;
        }
        
        // Then check card-specific requirements
        if (!card.requirements) return true;
        
        if (card.requirements.ingredients) {
            return state.playerStats.ingredients.length >= (card.requirements.ingredients + 1); // +1 for base cost
        }
        return true;
    }

    getStatModifiersHTML(modifiers) {
        if (!modifiers) return '';
        
        let html = '';
        for (const [stat, value] of Object.entries(modifiers)) {
            const className = value > 0 ? 'positive' : 'negative';
            const prefix = value > 0 ? '+' : '';
            const colorClass = {
                'prestige': 'prestige-color',
                'chaos': 'chaos-color',
                'ingredients': 'ingredients-color',
                'energy': 'energy-color'
            }[stat] || '';
            
            html += `<div class="stat-modifier ${colorClass}">
                ${stat}: <span class="${className}">${prefix}${value}</span>
            </div>`;
        }
        return html;
    }

    playCard(cardName) {
        if (this.isGameOver) return;

        const card = CARDS[cardName];
        
        // Check if card can be played (including minimum costs)
        if (this.state.playerStats.ingredients.length < 1 || this.state.playerStats.workerEnergy < 1) {
            const messageBox = document.getElementById('game-messages');
            messageBox.textContent = "Not enough resources! Cards require at least 1 ingredient and 1 energy.";
            messageBox.classList.remove('situation');
            messageBox.classList.add('feedback');
            return;
        }

        // Check card-specific requirements
        if (!this.checkCardRequirements(card)) {
            const messageBox = document.getElementById('game-messages');
            messageBox.textContent = "Not enough ingredients to play this card!";
            messageBox.classList.remove('situation');
            messageBox.classList.add('feedback');
            return;
        }

        // Apply base costs first
        this.state.playerStats.ingredients.pop(); // Remove one ingredient
        this.state.playerStats.workerEnergy -= 1; // Remove one energy

        // Then apply card effects
        const message = card.effect(this.state);
        const messageBox = document.getElementById('game-messages');
        
        // Show feedback message with base cost included
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
        
        // Check chaos events before game over condition
        this.checkChaosEvents();

        // Check game over conditions
        if (this.state.playerStats.chaosLevel >= 100) {
            this.endGame('chaos');
            return;
        }
        if (this.state.playerStats.workerEnergy <= 0) {
            this.endGame('energy');
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
        const messageBox = document.getElementById('game-messages');
        messageBox.classList.remove('chaos-warning');
        
        switch(reason) {
            case 'ingredients':
                message = 'You ran out of ingredients and cannot play any cards!';
                break;
            case 'chaos':
                message = 'Your factory descended into total chaos!';
                break;
            case 'energy':
                message = 'Your workers have collapsed from exhaustion!';
                break;
            default:
                message = 'The factory has ceased operations!';
        }
            
        messageBox.textContent = 
            `Game Over! ${message} Final Prestige: ${this.state.playerStats.pastaPrestige}`;
        
        // Hide cards and show start button
        this.hideCards();
        document.getElementById('start-game').classList.remove('hidden');
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
                this.state.playerStats.workerEnergy -= 5;
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
}

// Initialize game but don't auto-start
const game = new Game();
document.getElementById('start-game').addEventListener('click', () => game.start());