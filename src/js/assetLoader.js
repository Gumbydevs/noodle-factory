export class AssetLoader {
    constructor() {
        this.totalAssets = 0;
        this.loadedAssets = 0;
        
        // Available music tracks for random selection
        this.availableTracks = ['default', 'lounge', 'dnb'];
        
        // Check if we have a persisted track selection
        const persistedTrack = localStorage.getItem('selectedMusicTrack');
        
        // If track is set to random, pick a random one. Otherwise use the persisted track or default
        if (persistedTrack === 'random') {
            this.selectedTrack = this.getRandomMusicTrack();
            console.log(`Random music selected: ${this.selectedTrack}`);
        } else {
            this.selectedTrack = persistedTrack || 'default';
        }
        
        this.progressBar = document.querySelector('.progress-bar');
        this.gameContainer = document.getElementById('game-container');
        this.preloader = document.getElementById('preloader');
    }

    // Helper function to get a random music track
    getRandomMusicTrack() {
        return this.availableTracks[Math.floor(Math.random() * this.availableTracks.length)];
    }

    async preloadAudio() {
        const audioFiles = [
            { ctx: new (window.AudioContext || window.webkitAudioContext)(), buffers: [] }
        ];

        // Pre-create audio contexts and gain nodes
        audioFiles[0].gainNode = audioFiles[0].ctx.createGain();
        audioFiles[0].gainNode.connect(audioFiles[0].ctx.destination);

        // Preload the selected track and attach to window
        if (this.selectedTrack === 'lounge') {
            const { loungeMusic } = await import('../audio/music/bgm2.js');
            window.loungeMusic = loungeMusic; // Attach to window
            await loungeMusic.preload();
        } else if (this.selectedTrack === 'dnb') {
            const { dnbMusic } = await import('../audio/music/bgm3.js');
            window.dnbMusic = dnbMusic; // Attach to window
            await dnbMusic.preload();
        } else {
            const { musicLoops } = await import('../audio/music/bgm.js');
            window.musicLoops = musicLoops; // Attach to window
            await musicLoops.preload();
        }

        // If the original selection was random, save that rather than the specific track we chose
        // This ensures the next time the game loads it will choose a new random track
        const originalSelection = localStorage.getItem('selectedMusicTrack');
        if (originalSelection === 'random') {
            localStorage.setItem('selectedMusicTrack', 'random');
        } else {
            localStorage.setItem('selectedMusicTrack', this.selectedTrack);
        }

        return new Promise(resolve => {
            this.updateProgress();
            resolve();
        });
    }

    async preloadCards() {
        // Simulate card preloading - in a real scenario we might be loading card images
        return new Promise(resolve => {
            setTimeout(() => {
                this.updateProgress();
                resolve();
            }, 100);
        });
    }

    updateProgress() {
        this.loadedAssets++;
        const progress = (this.loadedAssets / this.totalAssets) * 100;
        if (this.progressBar) {
            this.progressBar.style.width = `${progress}%`;
        }

        if (this.loadedAssets === this.totalAssets) {
            this.showGame();
        }
    }

    showGame() {
        // Fade out preloader
        if (this.preloader) {
            this.preloader.style.opacity = '0';
            setTimeout(() => {
                if (this.preloader) {
                    this.preloader.style.display = 'none';
                }
                if (this.gameContainer) {
                    this.gameContainer.style.display = 'block';
                }
            }, 500);
        }
    }

    async init() {
        this.totalAssets = 2; // Audio and cards
        this.loadedAssets = 0;

        // Start preloading everything in parallel
        await Promise.all([
            this.preloadAudio(),
            this.preloadCards()
        ]);
    }
}