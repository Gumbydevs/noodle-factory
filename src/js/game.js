import { CARDS, getRandomCard } from './cards.js';
import events from './events.js';
import { gameState, updateResource, resetGameState } from './state.js';

// Add these situation messages at the top of the file after the imports
const SITUATIONS = [
    "Your workers are looking at you expectantly. What's your next move?",
    "The factory floor buzzes with nervous energy. Choose wisely.",
    "Steam rises from the pasta machines. Time for another decision.",
    "The smell of noodles fills the air. What will you do?",
    "Your employees await your next brilliant (or disastrous) decision.",
];

class Game {
    constructor() {
        this.state = gameState;
        this.isGameOver = false;
        this.turn = 1;
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
    }

    drawNewCards() {
        const leftCard = getRandomCard();
        let rightCard;
        do {
            rightCard = getRandomCard();
        } while (rightCard === leftCard);

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

        // Clear previous event listeners
        leftCardEl.replaceWith(leftCardEl.cloneNode(true));
        rightCardEl.replaceWith(rightCardEl.cloneNode(true));

        // Add new event listeners
        document.getElementById('card-left').addEventListener('click', () => this.playCard(leftCard));
        document.getElementById('card-right').addEventListener('click', () => this.playCard(rightCard));
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
        const message = card.effect(this.state);
        const messageBox = document.getElementById('game-messages');
        
        // Show feedback message
        messageBox.textContent = message;
        messageBox.classList.remove('situation');
        messageBox.classList.add('feedback');

        // After 2 seconds, fade to situation message
        setTimeout(() => {
            messageBox.classList.add('fade-out');
            
            setTimeout(() => {
                const situation = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
                messageBox.textContent = situation;
                messageBox.classList.remove('feedback');
                messageBox.classList.add('situation');
                messageBox.classList.remove('fade-out');
            }, 500);
        }, 2000);

        this.turn++;
        
        // Check game over conditions
        if (this.state.playerStats.chaosLevel >= 100 || 
            this.state.playerStats.workerEnergy <= 0) {
            this.endGame();
            return;
        }

        this.updateDisplay();
        this.drawNewCards();
    }

    endGame() {
        this.isGameOver = true;
        const message = this.state.playerStats.chaosLevel >= 100 
            ? 'Your factory descended into total chaos!' 
            : 'Your workers have collapsed from exhaustion!';
            
        document.getElementById('game-messages').textContent = 
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
        
        // Hide start button and show cards
        document.getElementById('start-game').classList.add('hidden');
        this.showCards();
        
        this.updateDisplay();
        this.drawNewCards();
        const messageBox = document.getElementById('game-messages');
        messageBox.textContent = "Welcome to your first day as Noodle Factory Manager! What's your first move?";
        messageBox.classList.remove('feedback');
        messageBox.classList.add('situation');
    }
}

// Initialize game but don't auto-start
const game = new Game();
document.getElementById('start-game').addEventListener('click', () => game.start());