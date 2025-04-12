import { resetAchievements } from './achievements.js';
import { gameSounds } from '../audio.js';
import { musicLoops } from '../audio/music/bgm.js';
import { loungeMusic } from '../audio/music/bgm2.js';

document.addEventListener('DOMContentLoaded', () => {
    const sfxToggle = document.getElementById('sfx-toggle');
    const musicToggle = document.getElementById('music-toggle');
    const resetButton = document.getElementById('reset-progress');
    const backButton = document.getElementById('back-button');
    const musicSelect = document.getElementById('music-select');

    // Load saved preferences
    const sfxEnabled = localStorage.getItem('sfxEnabled') !== 'false';
    sfxToggle.checked = sfxEnabled;
    gameSounds.setVolume(sfxEnabled ? 0.2 : 0);

    // Handle SFX toggle and volume
    sfxToggle.addEventListener('change', (e) => {
        gameSounds.setVolume(e.target.checked ? 0.2 : 0);
        localStorage.setItem('sfxEnabled', e.target.checked);
    });

    const sfxVolume = document.getElementById('sfx-volume');
    const sfxVolumeValue = document.querySelector('.sfx-volume-value');
    
    const savedSfxVolume = localStorage.getItem('sfxVolume') || 0.2;
    sfxVolume.value = savedSfxVolume * 100;
    sfxVolumeValue.textContent = `${Math.round(savedSfxVolume * 100)}%`;

    sfxVolume.addEventListener('input', (e) => {
        const value = e.target.value / 100;
        sfxVolumeValue.textContent = `${e.target.value}%`;
        gameSounds.setVolume(value);
        localStorage.setItem('sfxVolume', value);
    });

    // Update initial SFX volume
    gameSounds.setVolume(savedSfxVolume);

    // Update music toggle
    musicToggle.disabled = false;
    musicToggle.checked = localStorage.getItem('musicEnabled') === 'true';

    // Handle music toggle - now updates both music systems
    musicToggle.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        const currentTrack = localStorage.getItem('selectedMusicTrack') || 'default';
        
        if (currentTrack === 'lounge') {
            loungeMusic.setEnabled(enabled);
            if (musicLoops.enabled) musicLoops.setEnabled(false);
        } else {
            musicLoops.setEnabled(enabled);
            if (loungeMusic.enabled) loungeMusic.setEnabled(false);
        }
    });

    // Handle music track selection
    if (musicSelect) {
        const savedTrack = localStorage.getItem('selectedMusicTrack') || 'default';
        musicSelect.value = savedTrack;

        musicSelect.addEventListener('change', (e) => {
            const newTrack = e.target.value;
            localStorage.setItem('selectedMusicTrack', newTrack);
            
            // Stop current track
            musicLoops.setEnabled(false);
            loungeMusic.setEnabled(false);
            
            // Start new track if music is enabled
            if (musicToggle.checked) {
                if (newTrack === 'lounge') {
                    loungeMusic.setEnabled(true);
                } else {
                    musicLoops.setEnabled(true);
                }
            }
        });
    }

    // Handle music volume - now updates both music systems
    const musicVolume = document.getElementById('music-volume');
    const volumeValue = document.querySelector('.volume-value');
    
    const savedVolume = localStorage.getItem('musicVolume') || 1.0;
    musicVolume.value = savedVolume * 100;
    volumeValue.textContent = `${Math.round(savedVolume * 100)}%`;

    musicVolume.addEventListener('input', (e) => {
        const value = e.target.value / 100;
        volumeValue.textContent = `${e.target.value}%`;
        musicLoops.setVolume(value);
        loungeMusic.setVolume(value);
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
