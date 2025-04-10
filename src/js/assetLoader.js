export class AssetLoader {
    constructor() {
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.progressBar = document.querySelector('.progress-bar');
        this.gameContainer = document.getElementById('game-container');
        this.preloader = document.getElementById('preloader');
    }

    async preloadAudio() {
        const audioFiles = [
            { ctx: new (window.AudioContext || window.webkitAudioContext)(), buffers: [] }
        ];

        // Pre-create audio contexts and gain nodes
        audioFiles[0].gainNode = audioFiles[0].ctx.createGain();
        audioFiles[0].gainNode.connect(audioFiles[0].ctx.destination);

        return new Promise(resolve => {
            // We'll consider audio context creation as one asset
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