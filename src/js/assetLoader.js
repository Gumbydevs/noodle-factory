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
    }    async preloadAudio() {
        const audioFiles = [
            { ctx: new (window.AudioContext || window.webkitAudioContext)(), buffers: [] }
        ];

        // Pre-create audio contexts and gain nodes
        audioFiles[0].gainNode = audioFiles[0].ctx.createGain();
        audioFiles[0].gainNode.connect(audioFiles[0].ctx.destination);

        // Load all music modules first
        const [bgmModule, bgm2Module, bgm3Module] = await Promise.all([
            import('../audio/music/bgm.js'),
            import('../audio/music/bgm2.js'),
            import('../audio/music/bgm3.js')
        ]);
        
        // Attach all music to window
        window.musicLoops = bgmModule.musicLoops;
        window.loungeMusic = bgm2Module.loungeMusic;
        window.dnbMusic = bgm3Module.dnbMusic;
        
        // Preload all music tracks but don't start any
        await Promise.all([
            window.musicLoops.preload(),
            window.loungeMusic.preload(),
            window.dnbMusic.preload()
        ]);

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