import { resetAchievements } from './achievements.js';
import { setMusicEnabled, setMusicVolume } from '../audio.js';
import { gameSounds } from '../audio.js';
import { musicLoops } from '../audio/music/bgm.js';
import { loungeMusic } from '../audio/music/bgm2.js';
import { dnbMusic } from '../audio/music/bgm3.js';

// Available music tracks for random selection
const AVAILABLE_MUSIC_TRACKS = ['default', 'lounge', 'dnb'];

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

    // Make sure all music engines are initialized
    const initializeAllMusicEngines = async () => {
        // Ensure all music engines are preloaded
        await Promise.all([
            musicLoops.preload(),
            loungeMusic.preload(),
            dnbMusic.preload()
        ]);
        console.log("All music engines initialized");
    };
    
    // Initialize all music engines at startup
    initializeAllMusicEngines();

    // Update music toggle
    musicToggle.disabled = false;
    musicToggle.checked = localStorage.getItem('musicEnabled') === 'true';

    // Function to get a random music track
    const getRandomMusicTrack = () => {
        return AVAILABLE_MUSIC_TRACKS[Math.floor(Math.random() * AVAILABLE_MUSIC_TRACKS.length)];
    };

    // Function to get the actual track to use based on selection
    const getEffectiveTrack = (selectedTrack) => {
        if (selectedTrack === 'random') {
            return getRandomMusicTrack();
        }
        return selectedTrack;
    };

    // Handle music toggle - now updates all music systems
    musicToggle.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        const selectedTrack = localStorage.getItem('selectedMusicTrack') || 'default';
        const effectiveTrack = getEffectiveTrack(selectedTrack);
        
        console.log(`Music toggle: ${enabled}, selected track: ${selectedTrack}, using: ${effectiveTrack}`);
        
        // Ensure all music tracks are stopped first
        musicLoops.setEnabled(false);
        loungeMusic.setEnabled(false);
        dnbMusic.setEnabled(false);
        
        // Enable only the selected track
        if (enabled) {
            if (effectiveTrack === 'lounge') {
                console.log("Starting lounge music");
                loungeMusic.setEnabled(true);
            } else if (effectiveTrack === 'dnb') {
                console.log("Starting drum and bass music");
                dnbMusic.setEnabled(true);
            } else {
                console.log("Starting default music");
                musicLoops.setEnabled(true);
            }
        }
        
        localStorage.setItem('musicEnabled', enabled);
    });

    // Handle music track selection
    if (musicSelect) {
        const savedTrack = localStorage.getItem('selectedMusicTrack') || 'default';
        musicSelect.value = savedTrack;
        console.log(`Initial music track: ${savedTrack}`);

        musicSelect.addEventListener('change', (e) => {
            const newTrack = e.target.value;
            console.log(`Changing music track to: ${newTrack}`);
            localStorage.setItem('selectedMusicTrack', newTrack);
            
            // Stop all music tracks first
            musicLoops.setEnabled(false);
            loungeMusic.setEnabled(false);
            dnbMusic.setEnabled(false);
            
            // Start new track if music is enabled
            if (musicToggle.checked) {
                const effectiveTrack = getEffectiveTrack(newTrack);
                console.log(`Selected ${newTrack}, using: ${effectiveTrack}`);
                
                if (effectiveTrack === 'lounge') {
                    console.log("Starting lounge music");
                    loungeMusic.setEnabled(true);
                } else if (effectiveTrack === 'dnb') {
                    console.log("Starting drum and bass music");
                    dnbMusic.setEnabled(true);
                } else {
                    console.log("Starting default music");
                    musicLoops.setEnabled(true);
                }
            }
        });
    }

    // Handle music volume - now updates all music systems
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
        dnbMusic.setVolume(value);
        localStorage.setItem('musicVolume', value);
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
