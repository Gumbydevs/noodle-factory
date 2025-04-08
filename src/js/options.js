import { resetAchievements } from './achievements.js';

document.addEventListener('DOMContentLoaded', () => {
    const sfxToggle = document.getElementById('sfx-toggle');
    const musicToggle = document.getElementById('music-toggle');
    const resetButton = document.getElementById('reset-progress');
    const backButton = document.getElementById('back-button');

    // Load saved preferences
    sfxToggle.checked = localStorage.getItem('noodleFactorySFX') !== 'false';
    musicToggle.checked = localStorage.getItem('noodleFactoryMusic') !== 'false';

    // Save preferences when toggled
    sfxToggle.addEventListener('change', () => {
        localStorage.setItem('noodleFactorySFX', sfxToggle.checked);
    });

    musicToggle.addEventListener('change', () => {
        localStorage.setItem('noodleFactoryMusic', musicToggle.checked);
    });

    // Reset progress
    resetButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            resetAchievements();
            localStorage.removeItem('noodleFactoryHighScore');
            localStorage.removeItem('noodleFactoryPlayedCards');
            alert('All progress has been reset!');
        }
    });

    // Back button
    backButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
