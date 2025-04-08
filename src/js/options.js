import { resetAchievements } from './achievements.js';
import { gameSounds } from '../audio.js';

document.addEventListener('DOMContentLoaded', () => {
    const sfxToggle = document.getElementById('sfx-toggle');
    const musicToggle = document.getElementById('music-toggle');
    const resetButton = document.getElementById('reset-progress');
    const backButton = document.getElementById('back-button');

    // Load saved preferences
    const sfxEnabled = localStorage.getItem('sfxEnabled') !== 'false';
    sfxToggle.checked = sfxEnabled;
    gameSounds.setVolume(sfxEnabled ? 0.2 : 0);

    // Handle SFX toggle
    sfxToggle.addEventListener('change', (e) => {
        gameSounds.setVolume(e.target.checked ? 0.2 : 0);
        localStorage.setItem('sfxEnabled', e.target.checked);
    });

    // Disable music toggle
    musicToggle.checked = false;
    musicToggle.disabled = true;

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
