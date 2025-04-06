import { CARDS, getRandomCard } from './cards.js';
import events from './events.js';
import { gameState, updateResource, resetGameState } from './state.js';

class Game {
    constructor() {
        this.state = gameState;
        this.isGameOver = false;
        this.turn = 1;
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

        // Clear previous event listeners
        leftCardEl.replaceWith(leftCardEl.cloneNode(true));
        rightCardEl.replaceWith(rightCardEl.cloneNode(true));

        // Add new event listeners
        document.getElementById('card-left').addEventListener('click', () => this.playCard(leftCard));
        document.getElementById('card-right').addEventListener('click', () => this.playCard(rightCard));
    }

    playCard(cardName) {
        if (this.isGameOver) return;

        const card = CARDS[cardName];
        const message = card.effect(this.state);
        
        document.getElementById('game-messages').textContent = message;
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
        
        // Enable start button
        document.getElementById('start-game').disabled = false;
    }

    start() {
        resetGameState();
        this.state = gameState;
        this.isGameOver = false;
        this.turn = 1;
        this.updateDisplay();
        this.drawNewCards();
        document.getElementById('game-messages').textContent = 'Welcome to the Noodle Factory!';
        document.getElementById('start-game').disabled = true;
    }
}

// Initialize game
const game = new Game();
document.getElementById('start-game').addEventListener('click', () => game.start());
window.addEventListener('load', () => game.start());