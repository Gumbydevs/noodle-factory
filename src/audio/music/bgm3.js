export class SoulfulDrumAndBassMusic {
    constructor() {
        this.ctx = null;
        this.gainNode = null;
        this.isLooping = false;
        this.currentLoop = null;
        this.nextLoop = null;
        this.isPreloaded = false;
        this.buffers = {};
        
        // Load saved preference
        const musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
        this.enabled = musicEnabled;
        this.volume = musicEnabled ? 0.4 : 0;

        this.audioContext = null;
        this.currentLoop = null;
        this.isPlaying = false;
        this.baseVolume = 0.125; // MUSIC GLOBAL VOLUME - same as bgm.js
        this.volume = parseFloat(localStorage.getItem('musicVolume')) || 1.0;
        this.chaosLevel = 0;
        this.loopTimeout = null;
        this.currentTime = 0;
        this.nextScheduleTime = 0;
        this.scheduleAheadTime = 0.2;
        
        // Slightly slower BPM for more soulful groove
        this.baseBpm = 160; 
        this.sequencerSteps = 32; // 32 steps for detailed rhythm programming
        
        // Add state tracking for transitions
        this.previousChaosLevel = 0;
        this.transitionInProgress = false;
        this.transitionProgress = 0;
        this.transitionDuration = 16; // in steps
        
        // Track the current musical phrase
        this.currentPhrase = 0;
        this.phraseLength = 32; // Length of a musical phrase in steps
        this.stateTransitionPending = false;
        
        // Sequencer patterns (32 steps) - DnB patterns
        this.patterns = {
            // Looser kick pattern with more syncopation for soul
            kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
            // Classic snare on 5, 13, 21, 29 (second beat of each bar)
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            // Ghost snares for more soul
            ghost: [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            // Hi-hats with subtle variation
            hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            // Open hats for groove
            openhh: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
            // Soul-inspired rim for more bounce
            rim: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            // Soulful percussion elements
            perc: [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
            // Soulful chord stabs
            chords: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
        };
        
        // Medium energy patterns - more complex, but still groovy
        this.mediumPatterns = {
            kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            ghost: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
            hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            openhh: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
            rim: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            perc: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
            chords: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0]
        };
        
        // High energy patterns - complex and driving
        this.highPatterns = {
            kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1],
            snare: [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0],
            ghost: [1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1],
            hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            openhh: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            rim: [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1],
            perc: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            chords: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]
        };
        
        // Breakdown patterns for transitions
        this.breakdownPatterns = {
            kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ghost: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            openhh: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
            rim: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            perc: [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            chords: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        };
        
        // Buildup patterns for transitions
        this.buildupPatterns = {
            kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
            ghost: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            openhh: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1],
            rim: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            perc: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            chords: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]
        };
        
        // Track current pattern variation for smooth transitions
        this.currentPatternMix = {
            low: 1.0,
            medium: 0.0,
            high: 0.0,
            breakdown: 0.0,
            buildup: 0.0
        };

        // Synth sound design parameters - more soulful, warm settings
        this.synthParams = {
            waveforms: ['sine', 'triangle', 'sawtooth'],
            filterTypes: ['lowpass', 'bandpass'],
            filterResonance: 8, // More moderate resonance for warmer tone
            baseCutoff: 1000  // Lower base cutoff for a warmer tone
        };
        
        // More soulful modulation parameters
        this.modulationParams = {
            pitchMod: 0,
            filterMod: 0,
            velocityMod: 0,
            timingMod: 0,
            filterDecay: 0,
            noiseAmount: 0,
            resonanceMod: 0,
            // Soul-specific parameters
            soulfulness: 0,     // Controls bluesy pitch bends and vibrato
            humanization: 0.5,  // Default humanization - increases timing variation
            warmth: 0.5         // Controls harmonic content and filter shapes
        };
        
        // Notes including soul-centric flat fifths and blues notes
        this.notes = {
            'C1': 32.70, 'D1': 36.71, 'E1': 41.20, 'F1': 43.65, 'G1': 49.00, 'A1': 55.00, 'B1': 61.74,
            'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
            'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
            'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
            
            // Additional soul-centric notes with flats and sharps
            'Eb1': 38.89, 'Bb1': 58.27, 'Ab1': 51.91, 'F#1': 46.25, 'Db2': 69.30,
            'Eb2': 77.78, 'F#2': 92.50, 'Ab2': 103.83, 'Bb2': 116.54, 'Db3': 138.59,
            'Eb3': 155.56, 'F#3': 185.00, 'Ab3': 207.65, 'Bb3': 233.08, 'Db4': 277.18,
            'Eb4': 311.13, 'F#4': 369.99, 'Ab4': 415.30, 'Bb4': 466.16,
            'G#1': 51.91, 'D#2': 77.78, 'G#2': 103.83, 'C#3': 138.59, 'D#3': 155.56,
            'G#3': 207.65, 'C#4': 277.18, 'D#4': 311.13, 'G#4': 415.30
        };

        // Load saved preferences
        this.enabled = localStorage.getItem('musicEnabled') === 'true';
        
        // Scales for soulful bass
        this.musicalScales = {
            minor: ['C1', 'D1', 'Eb1', 'F1', 'G1', 'Ab1', 'Bb1', 'C2'],
            dorian: ['D1', 'E1', 'F1', 'G1', 'A1', 'B1', 'C2', 'D2'], // Jazz/soul mode
            // Classic soulful minor pentatonic
            soulPentatonic: ['C1', 'Eb1', 'F1', 'G1', 'Bb1', 'C2'],
            // Adding blues scale for expressive basslines
            bluesScale: ['C1', 'Eb1', 'F1', 'F#1', 'G1', 'Bb1', 'C2'],
            // Gospel-influenced mixolydian
            mixolydian: ['G1', 'A1', 'B1', 'C2', 'D2', 'E2', 'F2', 'G2'],
            // Neo-soul harmonic minor
            harmonicMinor: ['A1', 'B1', 'C2', 'D2', 'E2', 'F2', 'G#2', 'A2']
        };

        // Soulful bass patterns - more groove oriented
        this.bassPatterns = [
            // Soul-jazz walking bass with chromatic movement
            ['C1', 'Eb1', 'E1', 'F1', 'G1', 'Bb1', 'A1', 'G1'],
            // Gospel-influenced pattern with soulful 7ths
            ['F1', 'A1', 'C2', 'Eb2', 'F1', 'A1', 'C2', 'D2'],
            // R&B pattern with rich movement
            ['G1', 'D1', 'G1', 'Bb1', 'D2', 'C2', 'Bb1', 'G1'],
            // Neo-soul inspired with voice-leading
            ['C1', 'G1', 'Bb1', 'C2', 'Eb2', 'D2', 'C2', 'Bb1']
        ];

        // More complex bass patterns for higher energy
        this.complexBassPatterns = [
            // Chromatic walkups with bluesy touches
            ['C1', 'C#1', 'D1', 'Eb1', 'E1', 'F1', 'F#1', 'G1'],
            // Liquid DnB bass movement
            ['F1', 'C2', 'Bb1', 'A1', 'G1', 'F1', 'Eb1', 'D1'],
            // Gospel-influenced pattern with more syncopation
            ['Bb1', 'F1', 'Bb1', 'D2', 'F2', 'Eb2', 'D2', 'C2'],
            // Extended soul chords as bass notes
            ['G1', 'B1', 'D2', 'F2', 'E2', 'Eb2', 'D2', 'B1']
        ];
        
        // Jazz chord progressions for stabs and pads
        this.chordProgressions = [
            // Minor 7th - classic soul
            [
                ['C3', 'Eb3', 'G3', 'Bb3'],  // Cm7
                ['F3', 'A3', 'C4', 'Eb4'],   // Fm7
                ['Bb2', 'D3', 'F3', 'Ab3'],  // Bb7
                ['Eb3', 'G3', 'Bb3', 'D4']   // Ebmaj7
            ],
            // Modal interchange - neo-soul style
            [
                ['G2', 'B2', 'D3', 'F3'],    // G7
                ['C3', 'E3', 'G3', 'B3'],    // Cmaj7
                ['A2', 'C3', 'E3', 'G3'],    // Am7
                ['D3', 'F#3', 'A3', 'C4']    // D7
            ],
            // Gospel progression
            [
                ['F3', 'A3', 'C4', 'E4'],    // Fmaj7
                ['Bb3', 'D4', 'F4', 'A4'],   // Bbmaj7
                ['C3', 'E3', 'G3', 'Bb3'],   // C7
                ['F3', 'A3', 'C4', 'E4']     // Fmaj7
            ]
        ];
        
        // Soul-centric piano voicings
        this.pianoVoicings = [
            // Minor 9th voicings - smooth neo-soul
            [
                ['C3', 'Eb3', 'G3', 'Bb3', 'D4'],  // Cm9
                ['F3', 'Ab3', 'C4', 'Eb4', 'G4'],  // Fm9
                ['Bb2', 'D3', 'F3', 'Ab3', 'C4'],  // Bb9
                ['Eb3', 'G3', 'Bb3', 'D4', 'F4']   // Ebmaj9
            ],
            // Add11 voicings - rich texture
            [
                ['G2', 'B2', 'D3', 'F3', 'C4'],    // G11
                ['C3', 'E3', 'G3', 'B3', 'F4'],    // Cmaj11
                ['A2', 'C3', 'E3', 'G3', 'D4'],    // Am11
                ['D3', 'F#3', 'A3', 'C4', 'G4']    // D11
            ]
        ];
        
        // Percussion sample types for more variety
        this.percussionSamples = {
            lowRim: { freq: 300, decay: 0.08, filter: 800 },
            highRim: { freq: 600, decay: 0.05, filter: 1500 },
            shaker: { freq: 3000, decay: 0.1, filter: 5000, noise: true },
            tamb: { freq: 4000, decay: 0.15, filter: 6000, noise: true },
            clap: { freq: 1200, decay: 0.2, filter: 2000, noise: true },
            snap: { freq: 2000, decay: 0.07, filter: 3500, noise: true }
        };
        
        // Store melody fragments
        this.melodyFragments = [
            ['G4', 'Bb4', 'C5', 'D5', 'Eb5', 'D5', 'C5', 'Bb4'],
            ['C5', 'Bb4', 'G4', 'F4', 'Eb4', 'F4', 'G4', 'Bb4'],
            ['D5', 'C5', 'Bb4', 'C5', 'D5', 'F5', 'Eb5', 'D5'],
            ['Bb4', 'C5', 'D5', 'F5', 'G5', 'F5', 'Eb5', 'D5']
        ];
        
        // Melodic stabs for high-intensity sections
        this.stabs = ['C3', 'Eb3', 'G3', 'Bb3', 'D4', 'F4'];
        
        // Track a slow LFO for soulful evolution of sounds
        this.soulLFO = 0;
        this.soulLFOSpeed = 0.01;
    }

    async preload() {
        if (this.isPreloaded) return;

        try {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                this.audioContext = this.ctx; // Ensure both references point to same context
                this.gainNode = this.ctx.createGain();
                this.gainNode.connect(this.ctx.destination);
                this.gainNode.gain.value = this.enabled ? this.volume * this.baseVolume : 0;
            }

            // Pre-create common nodes
            this.filter = this.ctx.createBiquadFilter();
            this.filter.type = 'lowpass';
            this.filter.frequency.value = 22050;
            this.filter.connect(this.gainNode);

            // Initialize signal chain for soulful drum and bass
            this.compressor = this.ctx.createDynamicsCompressor();
            this.compressor.threshold.value = -15;  // Higher threshold for less pumping
            this.compressor.knee.value = 8;        // Softer knee for smoother compression
            this.compressor.ratio.value = 4;       // Gentler ratio
            this.compressor.attack.value = 0.01;   // Slower attack for more transients
            this.compressor.release.value = 0.15;  // Longer release for smoother sound
            
            // Add warm saturation 
            this.saturation = this.ctx.createWaveShaper();
            function createWarmSaturationCurve(amount) {
                const samples = 44100;
                const curve = new Float32Array(samples);
                
                for (let i = 0; i < samples; ++i) {
                    const x = (i * 2) / samples - 1;
                    // Softer, warmer saturation curve
                    curve[i] = Math.tanh(amount * x) * (1 - 0.15 * Math.abs(x));
                }
                return curve;
            }
            this.saturation.curve = createWarmSaturationCurve(2); // Gentler saturation
            this.saturation.oversample = '4x';
            
            // EQ for soulful character
            this.lowShelf = this.ctx.createBiquadFilter();
            this.lowShelf.type = 'lowshelf';
            this.lowShelf.frequency.value = 200;
            this.lowShelf.gain.value = 3; // Warm bass boost
            
            this.midEQ = this.ctx.createBiquadFilter();
            this.midEQ.type = 'peaking';
            this.midEQ.frequency.value = 1500; // Critical frequency for soul
            this.midEQ.Q.value = 0.8;
            this.midEQ.gain.value = 1; // Slight mid boost for presence
            
            this.highShelf = this.ctx.createBiquadFilter();
            this.highShelf.type = 'highshelf';
            this.highShelf.frequency.value = 6000;
            this.highShelf.gain.value = 1.5; // Subtle high boost for shimmer
            
            // Signal chain
            this.gainNode.gain.value = this.enabled ? this.volume * this.baseVolume : 0;
            this.gainNode.connect(this.lowShelf);
            this.lowShelf.connect(this.midEQ);
            this.midEQ.connect(this.highShelf);
            this.highShelf.connect(this.saturation);
            this.saturation.connect(this.compressor);
            this.compressor.connect(this.ctx.destination);

            this.isPreloaded = true;
            console.log("DnB Music System Preloaded Successfully");
        } catch (e) {
            console.warn('Error preloading soulful drum and bass music system:', e);
        }
    }

    initAudio() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.audioContext = this.ctx; // Ensure both references point to same context
            
            // Create basic signal chain
            this.gainNode = this.ctx.createGain();
            this.gainNode.gain.value = this.enabled ? this.volume * this.baseVolume : 0;
            this.gainNode.connect(this.ctx.destination);
            
            console.log("DnB Music Audio Context Initialized");
        }
    }

    async ensureAudioContext() {
        if (!this.ctx) {
            this.initAudio();
        }

        if (this.ctx.state === 'suspended') {
            try {
                await this.ctx.resume();
                console.log("Soulful DnB audio context resumed");
            } catch (e) {
                console.error("Failed to resume soulful DnB audio context:", e);
                return false;
            }
        }
        return true;
    }

    async startLoop() {
        await this.ensureAudioContext();
        if (!this.enabled) return;

        this.isPlaying = true;
        this.nextStepTime = this.audioContext.currentTime;
        this.currentStep = 0;
        this.currentPhrase = 0;
        this.scheduleLoop();
    }

    scheduleLoop() {
        if (!this.enabled || !this.isPlaying || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        // Calculate BPM based on chaos level with smoother changes
        // Less extreme BPM changes for more musical flow
        const chaosBpmIncrease = Math.min(15, this.chaosLevel * 0.15); // More subtle increase
        const currentBpm = this.baseBpm + chaosBpmIncrease;
        const stepDuration = 60 / currentBpm / 4; // 16th notes
        
        // Update the soul LFO
        this.soulLFO = (this.soulLFO + this.soulLFOSpeed) % (2 * Math.PI);
        
        // Schedule events until scheduleAheadTime
        while (this.nextStepTime < now + this.scheduleAheadTime) {
            // Track musical phrases for natural transitions
            if (this.currentStep % this.phraseLength === 0) {
                this.currentPhrase++;
                
                // Check if we need to transition between states
                if (this.stateTransitionPending && !this.transitionInProgress) {
                    this.beginStateTransition();
                }
                
                // Update transition progress if in progress
                if (this.transitionInProgress) {
                    this.updateTransition();
                }
            }
            
            this.scheduleNotes(this.currentStep, this.nextStepTime);
            
            // Apply timing variations for groove - swing and humanization
            let swingAmount = 0;
            const isSwingNote = this.currentStep % 2 === 1;
            
            if (isSwingNote) {
                // Soul-influenced swing
                swingAmount = 0.04 + (this.modulationParams.humanization * 0.06);
            }
            
            // Add subtle randomization for human feel - more prominent at low chaos
            const humanizeAmount = 0.01 * this.modulationParams.humanization;
            const randomTiming = (Math.random() * humanizeAmount - humanizeAmount/2);
            
            // Move to next step
            this.currentStep = (this.currentStep + 1) % this.sequencerSteps;
            this.nextStepTime += stepDuration + swingAmount + randomTiming;
        }
        
        // Schedule next loop iteration
        if (this.loopTimeout) {
            clearTimeout(this.loopTimeout);
        }
        
        this.loopTimeout = setTimeout(() => {
            if (this.isPlaying) {
                this.scheduleLoop();
            }
        }, 25);
    }

    beginStateTransition() {
        this.transitionInProgress = true;
        this.transitionProgress = 0;
        
        // Determine if we should have a breakdown or buildup
        if (this.chaosLevel > this.previousChaosLevel + 20) {
            // Moving to a much higher energy level - use buildup
            this.currentPatternMix.buildup = 1.0;
            console.log("Starting buildup transition");
        } else if (this.chaosLevel < this.previousChaosLevel - 20) {
            // Moving to a much lower energy level - use breakdown
            this.currentPatternMix.breakdown = 1.0;
            console.log("Starting breakdown transition");
        }
    }

    updateTransition() {
        this.transitionProgress++;
        
        // Transition is complete
        if (this.transitionProgress >= this.transitionDuration) {
            this.transitionInProgress = false;
            this.stateTransitionPending = false;
            this.previousChaosLevel = this.chaosLevel;
            
            // Reset transition mixes
            this.currentPatternMix.breakdown = 0;
            this.currentPatternMix.buildup = 0;
            
            // Update to the new target state
            this.updatePatternMixForChaos();
            console.log("Transition completed, now at chaos level:", this.chaosLevel);
        } 
        // In the middle of transition, start fading to target state
        else if (this.transitionProgress >= this.transitionDuration / 2) {
            const fadeProgress = (this.transitionProgress - this.transitionDuration / 2) / (this.transitionDuration / 2);
            
            // Start fading out breakdown/buildup
            if (this.currentPatternMix.breakdown > 0) {
                this.currentPatternMix.breakdown = 1.0 - fadeProgress;
            }
            if (this.currentPatternMix.buildup > 0) {
                this.currentPatternMix.buildup = 1.0 - fadeProgress;
            }
            
            // Start fading in the target state
            this.updatePatternMixForChaos(fadeProgress);
        }
    }

    updatePatternMixForChaos(transitionFactor = 1.0) {
        // Determine pattern mix based on chaos level
        let targetLow = 0, targetMedium = 0, targetHigh = 0;
        
        if (this.chaosLevel < 30) {
            // Low energy
            targetLow = 1.0;
        } else if (this.chaosLevel < 60) {
            // Blend low and medium
            const blend = (this.chaosLevel - 30) / 30;
            targetLow = 1.0 - blend;
            targetMedium = blend;
        } else if (this.chaosLevel < 90) {
            // Blend medium and high
            const blend = (this.chaosLevel - 60) / 30;
            targetMedium = 1.0 - blend;
            targetHigh = blend;
        } else {
            // High energy
            targetHigh = 1.0;
        }
        
        // Apply transition factor (for smooth transitions)
        if (transitionFactor < 1.0) {
            this.currentPatternMix.low += (targetLow - this.currentPatternMix.low) * transitionFactor;
            this.currentPatternMix.medium += (targetMedium - this.currentPatternMix.medium) * transitionFactor;
            this.currentPatternMix.high += (targetHigh - this.currentPatternMix.high) * transitionFactor;
        } else {
            // Immediate set
            this.currentPatternMix.low = targetLow;
            this.currentPatternMix.medium = targetMedium;
            this.currentPatternMix.high = targetHigh;
        }
    }

    scheduleNotes(step, time) {
        // Update modulation amounts based on chaos and soul parameters
        this.updateModulationParams();
        
        // Get current pattern values based on mix of different energy levels
        this.playDrumSequencerStep(step, time);
        
        // Add bass notes only when chaos level is above 45
        if (this.chaosLevel > 45) {
            // Use the original bass pattern scheduling
            if (step % 8 === 0 || step % 8 === 4 || step % 4 === 2) {
                this.playBassNote(step, time);
            }
        }
        
        // Add chord stabs based on step
        const chordValue = this.getBlendedPatternValue('chords', step);
        if (chordValue > 0.5) {
            this.playChordStab(step, time, chordValue);
        }
        
        // Add melodic elements at higher chaos/complexity levels
        if (this.chaosLevel > 60 && step % 16 === 8) {
            // Add melodic phrases at higher energy levels
            this.playMelodicPhrase(step, time);
        }
        
        // Add special transition effects
        if (this.transitionInProgress) {
            if (this.currentPatternMix.buildup > 0 && step % 4 === 0) {
                // Add filter sweep during buildup
                this.playFilterSweep(time, 0.5);
            }
            if (this.currentPatternMix.breakdown > 0 && step % 16 === 0) {
                // Add atmospheric pad during breakdown
                this.playAtmosphericPad(time, 4.0);
            }
        }
    }
    
    updateModulationParams() {
        // Modulate parameters based on chaos level for soulful DnB
        const chaos = this.chaosLevel / 100;
        
        // Enhance soulfulness at lower chaos levels, more aggressive at higher levels
        const soulfulness = Math.max(0.3, 1.0 - (chaos * 0.5));
        
        // Humanization decreases with chaos for more machine-like precision at high energy
        const humanization = Math.max(0.2, 0.7 - (chaos * 0.4));
        
        // Warmth decreases with chaos but never disappears completely
        const warmth = Math.max(0.3, 0.8 - (chaos * 0.5));
        
        this.modulationParams = {
            // More moderate modulation for musical sound
            pitchMod: chaos * 24, // Up to 2 octaves of pitch variation
            filterMod: 800 + (chaos * 3000), // Less extreme filter modulation
            velocityMod: 0.2 + (chaos * 0.5), // More velocity variation
            timingMod: chaos * 0.05, // Less timing randomization for tighter beats
            filterDecay: 0.2 + (chaos * 0.4), // More moderate filter decays
            noiseAmount: chaos * 0.3, // Less noise for cleaner sound
            resonanceMod: 5 + (chaos * 10), // Less extreme resonance
            
            // Soul-specific parameters
            soulfulness: soulfulness,
            humanization: humanization,
            warmth: warmth
        };
    }
    
    getBlendedPatternValue(instrument, step) {
        // Get values from each pattern set
        const lowVal = this.patterns[instrument][step];
        const medVal = this.mediumPatterns[instrument][step];
        const highVal = this.highPatterns[instrument][step];
        const breakVal = this.breakdownPatterns[instrument][step];
        const buildVal = this.buildupPatterns[instrument][step];
        
        // Blend based on current mix
        let value = (lowVal * this.currentPatternMix.low) +
                   (medVal * this.currentPatternMix.medium) +
                   (highVal * this.currentPatternMix.high) +
                   (breakVal * this.currentPatternMix.breakdown) +
                   (buildVal * this.currentPatternMix.buildup);
                   
        // Add rhythmic variations based on chaos level
        if (this.chaosLevel > 50 && Math.random() < (this.chaosLevel - 50) / 100) {
            // Random fills and variations at higher chaos levels
            if (value === 0 && Math.random() < 0.2) {
                return 0.7; // Add ghost notes
            } else if (value > 0 && Math.random() < 0.1) {
                return 0; // Occasionally drop notes
            }
        }
                   
        return value;
    }
    
    playDrumSequencerStep(step, time) {
        // Play drum sounds based on blended sequence patterns
        const kickValue = this.getBlendedPatternValue('kick', step);
        if (kickValue > 0) {
            this.playDrumSound({
                type: 'kick',
                time: time,
                baseFreq: 40, // Deeper freq for soulful kick
                startFreq: 160, 
                endFreq: 35,
                gain: 1.0 * kickValue + (Math.random() * this.modulationParams.velocityMod * 0.2),
                decay: 0.25 + (Math.random() * this.modulationParams.filterDecay * 0.1), // Longer decay for fuller kick
                filterFreq: 100 + (this.modulationParams.filterMod * 0.2)
            });
        }
        
        const snareValue = this.getBlendedPatternValue('snare', step);
        if (snareValue > 0) {
            this.playDrumSound({
                type: 'snare',
                time: time,
                gain: 0.85 * snareValue + (Math.random() * this.modulationParams.velocityMod * 0.3),
                decay: 0.2 + (Math.random() * this.modulationParams.filterDecay * 0.15), 
                filterFreq: 1500 + (this.modulationParams.filterMod * 0.4)
            });
        }
        
        const ghostValue = this.getBlendedPatternValue('ghost', step);
        if (ghostValue > 0) {
            // Softer ghost snares for soul rhythm
            this.playDrumSound({
                type: 'snare',
                time: time,
                gain: 0.4 * ghostValue + (Math.random() * this.modulationParams.velocityMod * 0.2),
                decay: 0.15 + (Math.random() * this.modulationParams.filterDecay * 0.1),
                filterFreq: 2000 + (this.modulationParams.filterMod * 0.5)
            });
        }
        
        const hihatValue = this.getBlendedPatternValue('hihat', step);
        if (hihatValue > 0) {
            this.playDrumSound({
                type: 'hihat',
                time: time,
                gain: 0.3 * hihatValue + (Math.random() * this.modulationParams.velocityMod * 0.15),
                decay: 0.05 + (Math.random() * 0.02),
                filterFreq: 7000 + (this.modulationParams.filterMod * 0.6),
                resonance: 1.5 + (this.chaosLevel / 40)
            });
        }
        
        const openHHValue = this.getBlendedPatternValue('openhh', step);
        if (openHHValue > 0) {
            this.playDrumSound({
                type: 'hihat',
                time: time,
                gain: 0.25 * openHHValue + (Math.random() * this.modulationParams.velocityMod * 0.2),
                decay: 0.3 + (Math.random() * 0.1),
                filterFreq: 8000 + (this.modulationParams.filterMod * 0.7),
                resonance: 2 + (this.chaosLevel / 35)
            });
        }
        
        const rimValue = this.getBlendedPatternValue('rim', step);
        if (rimValue > 0) {
            // Soul-inspired rim clicks
            this.playDrumSound({
                type: 'rim',
                time: time,
                gain: 0.5 * rimValue + (Math.random() * this.modulationParams.velocityMod * 0.2),
                decay: 0.08 + (Math.random() * 0.03),
                filterFreq: 2500 + (Math.random() * 1000),
                resonance: 8 + (this.chaosLevel / 15)
            });
        }
        
        const percValue = this.getBlendedPatternValue('perc', step);
        if (percValue > 0) {
            // Choose percussion type based on step
            let percType;
            if (step % 16 < 4) percType = 'lowRim';
            else if (step % 16 < 8) percType = 'shaker';
            else if (step % 16 < 12) percType = 'tamb';
            else percType = Math.random() < 0.5 ? 'clap' : 'snap';
            
            const percSettings = this.percussionSamples[percType];
            
            if (percSettings.noise) {
                this.playNoiseHit(time, {
                    duration: percSettings.decay,
                    frequency: percSettings.filter,
                    gain: 0.4 * percValue + (Math.random() * this.modulationParams.velocityMod * 0.2),
                    type: 'bandpass',
                    Q: 3 + (Math.random() * 5)
                });
            } else {
                this.playDrumSound({
                    type: 'perc',
                    time: time,
                    baseFreq: percSettings.freq,
                    gain: 0.45 * percValue + (Math.random() * this.modulationParams.velocityMod * 0.2),
                    decay: percSettings.decay + (Math.random() * 0.05),
                    filterFreq: percSettings.filter + (this.modulationParams.filterMod * 0.3)
                });
            }
        }
    }
    
    playDrumSound(options) {
        const { 
            type, time, baseFreq, startFreq, endFreq, gain, decay, 
            filterFreq, resonance = 1
        } = options;
        
        const actualGain = gain * this.volume * this.baseVolume;
        
        if (type === 'kick') {
            // Soulful kick with more body
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            // Add slight noise component for texture
            if (this.modulationParams.noiseAmount > 0) {
                this.playNoiseHit(time, {
                    duration: decay * 0.4,
                    frequency: 80,
                    gain: actualGain * 0.1 * this.modulationParams.noiseAmount,
                    type: 'lowpass',
                    Q: 0.8
                });
            }
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(startFreq, time);
            osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.08); // Slower pitch envelope
            
            // More rounded attack for soulful kick
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(actualGain, time + 0.004);
            gainNode.gain.exponentialRampToValueAtTime(actualGain * 0.7, time + 0.10);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(filterFreq * 4, time);
            filter.frequency.exponentialRampToValueAtTime(filterFreq, time + decay * 0.5);
            filter.Q.value = 0.8 + (this.chaosLevel / 50); // Less resonant for warmer tone
            
            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.gainNode);
            
            osc.start(time);
            osc.stop(time + decay + 0.1);
            
            setTimeout(() => {
                osc.disconnect();
                filter.disconnect();
                gainNode.disconnect();
            }, (decay + 0.2) * 1000);
        } 
        else if (type === 'snare') {
            // More soul-influenced snare with body and snap
            const noiseGain = 0.8 + (this.modulationParams.warmth * 0.3); // More body at higher warmth
            this.playNoiseHit(time, {
                duration: decay,
                frequency: filterFreq,
                gain: actualGain * noiseGain,
                type: 'bandpass',
                Q: 0.8 + (this.chaosLevel / 35)
            });
            
            // Add tone component for more snap and tone
            const osc1 = this.audioContext.createOscillator();
            const osc2 = this.audioContext.createOscillator(); // Add second oscillator for more complex tone
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc1.type = 'triangle';
            osc1.frequency.value = 180 + (Math.random() * this.modulationParams.pitchMod);
            
            osc2.type = 'sine';
            osc2.frequency.value = 330 + (Math.random() * this.modulationParams.pitchMod); // Higher harmonic
            
            // Sharper attack, smoother decay
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(actualGain * 0.6, time + 0.003);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay * 0.6);
            
            filter.type = 'bandpass';
            filter.frequency.value = filterFreq * 0.8;
            filter.Q.value = 1.2 + (this.chaosLevel / 40);
            
            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.gainNode);
            
            osc1.start(time);
            osc2.start(time);
            osc1.stop(time + decay);
            osc2.stop(time + decay);
            
            setTimeout(() => {
                osc1.disconnect();
                osc2.disconnect();
                filter.disconnect();
                gainNode.disconnect();
            }, decay * 1000);
        }
        else if (type === 'hihat') {
            // Soulful hi-hat with more tone
            const hihatResonance = resonance + (Math.random() * this.modulationParams.resonanceMod * 0.15);
            
            this.playNoiseHit(time, {
                duration: decay,
                frequency: filterFreq + (Math.random() * 1000 * (this.chaosLevel/100)),
                gain: actualGain,
                type: 'highpass',
                Q: hihatResonance
            });
            
            // Add metallic component for more character
            if (this.chaosLevel > 40 || decay > 0.1) {
                const osc1 = this.audioContext.createOscillator();
                const osc2 = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                osc1.type = 'square';
                osc1.frequency.value = 3000 + (Math.random() * 800);
                
                osc2.type = 'square';
                osc2.frequency.value = 4200 + (Math.random() * 800);
                
                gainNode.gain.setValueAtTime(0, time);
                gainNode.gain.linearRampToValueAtTime(actualGain * 0.05, time + 0.002);
                gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay * 0.6);
                
                osc1.connect(gainNode);
                osc2.connect(gainNode);
                gainNode.connect(this.gainNode);
                
                osc1.start(time);
                osc2.start(time);
                osc1.stop(time + decay);
                osc2.stop(time + decay);
                
                setTimeout(() => {
                    osc1.disconnect();
                    osc2.disconnect();
                    gainNode.disconnect();
                }, decay * 1000);
            }
        }
        else if (type === 'rim') {
            // Soul-inspired rim/click with more character
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'triangle';
            osc.frequency.value = 1200 + (Math.random() * this.modulationParams.pitchMod * 0.5);
            
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(actualGain, time + 0.001);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay);
            
            filter.type = 'bandpass';
            filter.frequency.value = 2000 + (Math.random() * 1000);
            filter.Q.value = resonance;
            
            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.gainNode);
            
            osc.start(time);
            osc.stop(time + decay);
            
            setTimeout(() => {
                osc.disconnect();
                filter.disconnect();
                gainNode.disconnect();
            }, decay * 1000);
        }
        else if (type === 'perc') {
            // Generic percussion with tonal quality
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.value = baseFreq + (Math.random() * this.modulationParams.pitchMod * 0.3);
            
            // Percussive envelope
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(actualGain, time + 0.002);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay);
            
            filter.type = 'bandpass';
            filter.frequency.value = baseFreq * 2;
            filter.Q.value = 2 + (this.chaosLevel / 30);
            
            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.gainNode);
            
            osc.start(time);
            osc.stop(time + decay);
            
            setTimeout(() => {
                osc.disconnect();
                filter.disconnect();
                gainNode.disconnect();
            }, decay * 1000);
        }
    }

    playBassNote(step, time) {
        // Determine which note pattern to use based on chaos level
        let bassNote;
        const patternLength = 8;
        // Choose which pattern set to use based on chaos level
        let bassPatternSet;
        let scaleChoice;
        
        if (this.chaosLevel < 50) {
            // Use more soulful patterns at low chaos
            bassPatternSet = this.bassPatterns;
            
            // Use more soulful scales at low chaos
            if (Math.random() < 0.6) {
                scaleChoice = this.musicalScales.soulPentatonic;
            } else if (Math.random() < 0.8) {
                scaleChoice = this.musicalScales.bluesScale;
            } else {
                scaleChoice = this.musicalScales.dorian;
            }
        } else {
            // Use more complex patterns at higher chaos
            bassPatternSet = this.complexBassPatterns;
            
            // Use more complex scales at high chaos
            if (Math.random() < 0.4) {
                scaleChoice = this.musicalScales.dorian; 
            } else if (Math.random() < 0.7) {
                scaleChoice = this.musicalScales.harmonicMinor;
            } else {
                scaleChoice = this.musicalScales.mixolydian;
            }
        }
        
        // Select a pattern based on the current musical phrase
        const patternIndex = (Math.floor(this.currentPhrase / 2) % bassPatternSet.length);
        const pattern = bassPatternSet[patternIndex];
        
        // Get the note from the pattern
        bassNote = pattern[step % patternLength];
        
        // Occasionally add variation based on scales at higher chaos
        if (this.chaosLevel > 60 && Math.random() < 0.3) {
            const scaleIndex = Math.floor(Math.random() * scaleChoice.length);
            bassNote = scaleChoice[scaleIndex];
        }
        
        // Higher chance of subtle variations at high soulfulness
        if (this.modulationParams.soulfulness > 0.6 && Math.random() < 0.2) {
            // Add occasional octave jumps for soulful bass variation
            if (bassNote.endsWith('1') && Math.random() < 0.5) {
                bassNote = bassNote.replace('1', '2');
            }
            
            // Add occasional chromatic approach notes for jazz feeling
            if (Math.random() < 0.3) {
                const noteChar = bassNote.charAt(0);
                const chromaticApproach = (Math.random() < 0.5) ? 
                    this.getChromatic(noteChar, -1) : 
                    this.getChromatic(noteChar, 1);
                
                // Play quick approach note
                this.playBassSound(chromaticApproach + bassNote.substring(1), time - 0.1, 0.08);
            }
        }
        
        // Calculate duration based on the step and chaos level
        let duration = 0.35;  // Default longer duration for soulful sound
        
        // Shorter notes at higher chaos/energy levels
        if (this.chaosLevel > 70) {
            duration = 0.2;
        }
        
        // Longer notes on downbeats
        if (step % 8 === 0) {
            duration += 0.1;
        }
        
        // Play the bass sound
        this.playBassSound(bassNote, time, duration);
    }
    
    // Helper to get chromatic notes for approach notes
    getChromatic(noteChar, direction) {
        const notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
        const index = notes.indexOf(noteChar);
        
        if (index !== -1) {
            const newIndex = (index + direction + notes.length) % notes.length;
            return notes[newIndex];
        }
        
        return noteChar; // Fallback if note not found
    }

    playBassSound(note, time, duration) {
        if (!this.notes[note]) return;
        
        const freq = this.notes[note];
        const actualGain = 0.8 * this.volume * this.baseVolume; // Slightly louder bass for soul
        
        // Adjust parameters based on the soul LFO for evolving bass sound
        const soulLFOValue = Math.sin(this.soulLFO) * 0.5 + 0.5;
        
        // Primary oscillator for the fundamental
        const osc1 = this.audioContext.createOscillator();
        // Second oscillator for richness
        const osc2 = this.audioContext.createOscillator();
        // Third oscillator for harmonics - more important in soulful bass
        const osc3 = this.audioContext.createOscillator();
        
        // Use sine and triangle mixture for warmer tone
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc3.type = 'sawtooth';
        
        // Apply subtle detuning for thickness
        const detune = 5 + (this.chaosLevel / 30); 
        osc1.frequency.value = freq;
        osc2.frequency.value = freq * 1.005; // Subtle detuning
        osc2.detune.value = detune;
        
        // Third oscillator plays an octave higher with lower volume for harmonics
        osc3.frequency.value = freq * 2;
        
        // Create a filter for the bass - critical for soul sound
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        
        // Slightly resonant filter for more character at low chaos
        const resonanceAmount = 3 + (this.modulationParams.soulfulness * 5); 
        filter.Q.value = resonanceAmount;
        
        // Filter envelope - more dramatic at higher chaos
        const filterStart = 500 + (this.chaosLevel * 10) + (soulLFOValue * 300); 
        const filterEnd = 80 + (this.chaosLevel * 5);
        
        filter.frequency.setValueAtTime(filterStart, time);
        
        // Slower filter movement for more soulful sound at low chaos
        if (this.chaosLevel < 50) {
            filter.frequency.setTargetAtTime(filterEnd, time + 0.05, 0.2 + (soulLFOValue * 0.2));
        } else {
            filter.frequency.exponentialRampToValueAtTime(filterEnd, time + 0.15);
        }
        
        // Main volume envelope
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, time);
        
        // Slightly slower attack for more rounded tone
        gainNode.gain.linearRampToValueAtTime(actualGain, time + 0.02 + (this.modulationParams.soulfulness * 0.01));
        
        // Add a subtle swell in the middle for more expression at high soulfulness
        if (this.modulationParams.soulfulness > 0.6 && duration > 0.3) {
            gainNode.gain.setTargetAtTime(
                actualGain * 1.1,
                time + duration * 0.3,
                0.1
            );
        }
        
        // Smooth release based on soulfulness
        gainNode.gain.setTargetAtTime(0.001, time + duration * 0.8, 0.1 + (this.modulationParams.soulfulness * 0.1));
        
        // Second gain node for the harmonic oscillator - lower volume
        const harmGainNode = this.audioContext.createGain();
        harmGainNode.gain.setValueAtTime(0, time);
        harmGainNode.gain.linearRampToValueAtTime(actualGain * 0.15, time + 0.03);
        harmGainNode.gain.setTargetAtTime(0.001, time + duration * 0.7, 0.1);
        
        // Add saturation for richness at higher chaos
        if (this.chaosLevel > 40) {
            const distortion = this.audioContext.createWaveShaper();
            
            // Warm saturation curve for soulful character
            function makeWarmCurve(amount) {
                const k = amount;
                const n_samples = 44100;
                const curve = new Float32Array(n_samples);
                
                for (let i = 0; i < n_samples; ++i) {
                    const x = i * 2 / n_samples - 1;
                    // Subtle, warm distortion
                    curve[i] = Math.tanh(k * x) * (1 - Math.abs(x) * 0.2);
                }
                return curve;
            }
            
            // Less distortion at higher chaos to maintain definition
            const distAmount = 0.3 + (Math.min(30, this.chaosLevel) / 150);
            distortion.curve = makeWarmCurve(distAmount);
            distortion.oversample = '4x';
            
            // Connect with distortion
            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(distortion);
            distortion.connect(gainNode);
            
            // Harmonic oscillator bypass the distortion for clarity
            osc3.connect(harmGainNode);
            
            gainNode.connect(this.gainNode);
            harmGainNode.connect(this.gainNode);
            
            setTimeout(() => {
                distortion.disconnect();
            }, (duration + 0.2) * 1000);
        } else {
            // Connect directly at lower chaos for cleaner sound
            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gainNode);
            osc3.connect(harmGainNode);
            
            gainNode.connect(this.gainNode);
            harmGainNode.connect(this.gainNode);
        }
        
        // Start and stop oscillators
        osc1.start(time);
        osc2.start(time);
        osc3.start(time);
        
        osc1.stop(time + duration + 0.2);
        osc2.stop(time + duration + 0.2);
        osc3.stop(time + duration + 0.2);
        
        // Clean up
        setTimeout(() => {
            osc1.disconnect();
            osc2.disconnect();
            osc3.disconnect();
            filter.disconnect();
            gainNode.disconnect();
            harmGainNode.disconnect();
        }, (duration + 0.3) * 1000);
    }
    
    playChordStab(step, time, intensity) {
        // Select chord progression based on musical phrase
        const progIndex = Math.floor(this.currentPhrase / 4) % this.chordProgressions.length;
        const progression = this.chordProgressions[progIndex];
        
        // Determine which chord to play based on step
        const chordIndex = Math.floor((step % 32) / 8) % progression.length;
        const chord = progression[chordIndex];
        
        // Adjust duration based on chaos level - shorter at higher energy
        let stabDuration = 0.5;
        if (this.chaosLevel > 70) {
            stabDuration = 0.3;
        } else if (this.chaosLevel > 40) {
            stabDuration = 0.4;
        }
        
        // Apply velocity variation
        const velocity = 0.4 * intensity + (Math.random() * this.modulationParams.velocityMod * 0.2);
        
        // Play the chord
        this.playChord(chord, time, stabDuration, velocity);
    }
    
    playChord(chord, time, duration, velocity) {
        const actualGain = velocity * this.volume * this.baseVolume * 0.7; // Lower for chords
        
        // Create oscillators for each note in the chord
        const oscillators = [];
        const gainNodes = [];
        const filters = [];
        
        // Use chord voicing variation based on soulfulness
        let voicing = chord;
        
        // At high soulfulness, occasionally use extended voicings
        if (this.modulationParams.soulfulness > 0.6 && Math.random() < 0.3) {
            // Get a random piano voicing for more soul
            const voicingSet = this.pianoVoicings[Math.floor(Math.random() * this.pianoVoicings.length)];
            const voicingIndex = Math.floor(Math.random() * voicingSet.length);
            voicing = voicingSet[voicingIndex];
        }
        
        // Create a shared filter
        const mainFilter = this.audioContext.createBiquadFilter();
        mainFilter.type = 'lowpass';
        
        // Less resonant filter for warmer chord sound
        mainFilter.Q.value = 1 + (this.modulationParams.warmth * 3);
        
        // Filter envelope - brighter attack, warm sustain
        const filterStart = 3000 + (this.modulationParams.warmth * 2000);
        const filterEnd = 800 + (this.chaosLevel * 20);
        
        mainFilter.frequency.setValueAtTime(filterStart, time);
        mainFilter.frequency.exponentialRampToValueAtTime(filterEnd, time + 0.1);
        
        // Create oscillators for each note
        for (let i = 0; i < voicing.length; i++) {
            const note = voicing[i];
            if (!this.notes[note]) continue;
            
            const freq = this.notes[note];
            
            // Create oscillator
            const osc = this.audioContext.createOscillator();
            
            // Choose waveform based on position in chord - warmer for lower notes
            if (i === 0) {
                osc.type = 'triangle'; // Root gets triangle for warmer tone
            } else if (i === voicing.length - 1) {
                osc.type = 'sine'; // Top note gets sine for clarity
            } else {
                osc.type = Math.random() < 0.7 ? 'triangle' : 'sine'; // Inner voices mixed
            }
            
            osc.frequency.value = freq;
            
            // Add subtle detune for richness
            osc.detune.value = (Math.random() * 10 - 5) * this.modulationParams.warmth;
            
            // Create gain node with unique envelope for each note
            const gainNode = this.audioContext.createGain();
            
            // Start at zero
            gainNode.gain.setValueAtTime(0, time);
            
            // Each note has slightly different attack time for more natural sound
            const attackOffset = (i / voicing.length) * 0.02 * this.modulationParams.humanization;
            const attackTime = 0.01 + attackOffset;
            
            // Apply different gain to each note in the chord for voice leading
            let noteGain;
            if (i === 0) {
                noteGain = actualGain * 0.9; // Root slightly lower
            } else if (i === voicing.length - 1) {
                noteGain = actualGain * 1.1; // Top voice stronger
            } else {
                noteGain = actualGain * (0.7 + (i / voicing.length) * 0.4); // Middle voices gradual
            }
            
            // Apply envelope
            gainNode.gain.linearRampToValueAtTime(noteGain, time + attackTime);
            
            // Smoother release for soul
            gainNode.gain.setTargetAtTime(0.001, time + duration * 0.8, 0.1);
            
            // Connect the oscillator to gain
            osc.connect(gainNode);
            gainNode.connect(mainFilter);
            
            // Store for cleanup
            oscillators.push(osc);
            gainNodes.push(gainNode);
            
            // Start the oscillator
            osc.start(time);
            osc.stop(time + duration + 0.2);
        }
        
        // Connect the main filter to output
        mainFilter.connect(this.gainNode);
        
        // Clean up
        setTimeout(() => {
            oscillators.forEach(osc => osc.disconnect());
            gainNodes.forEach(gain => gain.disconnect());
            mainFilter.disconnect();
        }, (duration + 0.3) * 1000);
    }
    
    playMelodicPhrase(step, time) {
        // Only play melodies at higher chaos levels and occasionally
        if (this.chaosLevel < 60 || Math.random() > 0.7) return;
        
        // Get melody fragment based on the current phrase
        const melodyIndex = Math.floor(this.currentPhrase / 2) % this.melodyFragments.length;
        const melody = this.melodyFragments[melodyIndex];
        
        // Determine number of notes to play - more at higher chaos
        const numNotes = 4 + Math.floor((this.chaosLevel - 60) / 10);
        const phraseLength = Math.min(numNotes, melody.length);
        
        // Calculate total duration and time between notes
        const totalDuration = 2.0; // 2 seconds total
        const noteSpacing = totalDuration / phraseLength;
        
        // Play each note in the sequence
        for (let i = 0; i < phraseLength; i++) {
            const noteTime = time + (i * noteSpacing);
            const noteDuration = noteSpacing * 0.8; // Slightly shorter than spacing
            
            // Get the note from the melody
            const note = melody[i];
            
            // Play with varying velocity for expression
            const velocity = 0.3 + (Math.random() * 0.2) + 
                           (i === 0 ? 0.1 : 0) +  // Emphasize first note
                           (i === phraseLength - 1 ? 0.1 : 0); // And last note
            
            this.playMelodicNote(note, noteTime, noteDuration, velocity);
        }
    }
    
    playMelodicNote(note, time, duration, velocity) {
        if (!this.notes[note]) return;
        
        const freq = this.notes[note];
        const actualGain = velocity * this.volume * this.baseVolume * 0.5; // Lower gain for melodic elements
        
        // Create primary oscillator
        const osc1 = this.audioContext.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = freq;
        
        // Create secondary oscillator for richness
        const osc2 = this.audioContext.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = freq;
        osc2.detune.value = 10; // Slight detune for warmth
        
        // Create filter
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        
        // Moderate filter resonance for character
        filter.Q.value = 2 + (this.modulationParams.soulfulness * 5);
        
        // Filter envelope - brighter attack, then settle
        const filterStart = 5000 + (this.modulationParams.warmth * 3000);
        const filterEnd = 1500 + (this.chaosLevel * 30);
        
        filter.frequency.setValueAtTime(filterStart, time);
        filter.frequency.exponentialRampToValueAtTime(filterEnd, time + 0.1);
        
        // Create gain node
        const gainNode = this.audioContext.createGain();
        
        // Apply envelope
        gainNode.gain.setValueAtTime(0, time);
        
        // Slightly slower attack for more expressive notes
        gainNode.gain.linearRampToValueAtTime(actualGain, time + 0.03);
        
        // Add subtle swell for soul expression
        if (this.modulationParams.soulfulness > 0.7 && duration > 0.2) {
            gainNode.gain.setTargetAtTime(
                actualGain * 1.2,
                time + duration * 0.4,
                0.1
            );
        }
        
        // Smooth release
        gainNode.gain.setTargetAtTime(0.001, time + duration * 0.7, 0.1);
        
        // Connect oscillators to filter
        osc1.connect(filter);
        osc2.connect(filter);
        
        // Connect filter to gain
        filter.connect(gainNode);
        
        // Connect gain to output
        gainNode.connect(this.gainNode);
        
        // Start oscillators
        osc1.start(time);
        osc2.start(time);
        
        // Stop oscillators
        osc1.stop(time + duration + 0.2);
        osc2.stop(time + duration + 0.2);
        
        // Clean up
        setTimeout(() => {
            osc1.disconnect();
            osc2.disconnect();
            filter.disconnect();
            gainNode.disconnect();
        }, (duration + 0.3) * 1000);
    }
    
    playFilterSweep(time, duration) {
        // Create noise source for filter sweep
        const noise = this.audioContext.createBufferSource();
        noise.buffer = this.createNoiseBuffer(duration * 1.2);
        
        // Create filter
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        
        // Start at low frequency
        filter.frequency.setValueAtTime(100, time);
        
        // High resonance for audible sweep
        filter.Q.value = 15 + (this.chaosLevel / 5);
        
        // Sweep upward
        filter.frequency.exponentialRampToValueAtTime(8000, time + duration);
        
        // Create gain node
        const gainNode = this.audioContext.createGain();
        
        // Fade in and out
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.2 * this.volume * this.baseVolume, time + 0.1);
        gainNode.gain.setValueAtTime(0.2 * this.volume * this.baseVolume, time + duration - 0.1);
        gainNode.gain.linearRampToValueAtTime(0, time + duration);
        
        // Connect
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        // Start and stop
        noise.start(time);
        noise.stop(time + duration);
        
        // Clean up
        setTimeout(() => {
            noise.disconnect();
            filter.disconnect();
            gainNode.disconnect();
        }, duration * 1000 + 100);
    }
    
    playAtmosphericPad(time, duration) {
        // Create chord for pad
        const chordIndex = Math.floor(this.currentPhrase / 2) % this.chordProgressions.length;
        const chord = this.chordProgressions[chordIndex][0]; // Use first chord in progression
        
        // Create oscillators for each note with pad-like qualities
        const oscillators = [];
        const gainNodes = [];
        const filters = [];
        
        // Shared LFO for subtle movement
        const lfoRate = 0.5 + (Math.random() * 0.5);
        const lfoAmount = 50 + (this.modulationParams.soulfulness * 30);
        
        const lfo = this.audioContext.createOscillator();
        lfo.frequency.value = lfoRate;
        
        const lfoGain = this.audioContext.createGain();
        lfoGain.gain.value = lfoAmount;
        
        lfo.connect(lfoGain);
        lfo.start(time);
        lfo.stop(time + duration + 0.5);
        
        // Create oscillators for each note
        for (let i = 0; i < chord.length; i++) {
            const note = chord[i];
            if (!this.notes[note]) continue;
            
            const freq = this.notes[note];
            
            // Create oscillators for pad texture - 2 per note
            const osc1 = this.audioContext.createOscillator();
            const osc2 = this.audioContext.createOscillator();
            
            // Use sine and triangle for warm pad sound
            osc1.type = 'sine';
            osc2.type = 'triangle';
            
            osc1.frequency.value = freq;
            osc2.frequency.value = freq;
            
            // Detune for richness
            osc1.detune.value = Math.random() * 10 - 5;
            osc2.detune.value = -1 * (Math.random() * 10 - 5);
            
            // Connect LFO to detune for subtle movement
            lfoGain.connect(osc1.detune);
            lfoGain.connect(osc2.detune);
            
            // Create individual filter per note
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 1000 + (i * 400); // Higher filter for higher notes
            filter.Q.value = 0.7; // Low resonance for smooth pad
            
            // Create gain node for note
            const gainNode = this.audioContext.createGain();
            
            // Long attack and release
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(0.1 * this.volume * this.baseVolume * (1 - i * 0.1), time + 0.5);
            gainNode.gain.setValueAtTime(0.1 * this.volume * this.baseVolume * (1 - i * 0.1), time + duration - 0.5);
            gainNode.gain.linearRampToValueAtTime(0, time + duration);
            
            // Connect oscillators to filter
            osc1.connect(filter);
            osc2.connect(filter);
            
            // Connect filter to gain
            filter.connect(gainNode);
            
            // Connect gain to output
            gainNode.connect(this.gainNode);
            
            // Store for cleanup
            oscillators.push(osc1, osc2);
            gainNodes.push(gainNode);
            filters.push(filter);
            
            // Start oscillators
            osc1.start(time);
            osc2.start(time);
            osc1.stop(time + duration + 0.1);
            osc2.stop(time + duration + 0.1);
        }
        
        // Clean up
        setTimeout(() => {
            oscillators.forEach(osc => osc.disconnect());
            gainNodes.forEach(gain => gain.disconnect());
            filters.forEach(filter => filter.disconnect());
            lfo.disconnect();
            lfoGain.disconnect();
        }, (duration + 0.5) * 1000);
    }

    createNoiseBuffer(duration) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Create colored noise for warmer texture
        let lastOutput = 0;
        const colorFactor = 0.1 + (this.modulationParams.warmth * 0.15);
        
        for (let i = 0; i < bufferSize; ++i) {
            const white = Math.random() * 2 - 1;
            lastOutput = (lastOutput + (white * colorFactor)) / (1 + colorFactor);
            data[i] = lastOutput * 3;
        }
        
        return buffer;
    }

    playNoiseHit(startTime, options = {}) {
        const { duration = 0.1, frequency = 1000, gain = 0.1, type = 'bandpass', Q = 1 } = options;
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = this.createNoiseBuffer(duration);
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = frequency;
        filter.Q.value = Q;
        
        // Subtle filter modulation for soul
        if (this.modulationParams.soulfulness > 0.5) {
            filter.frequency.setValueAtTime(frequency * 1.5, startTime);
            filter.frequency.exponentialRampToValueAtTime(
                frequency * 0.8, 
                startTime + duration * 0.8
            );
        }
        
        const gainNode = this.audioContext.createGain();
        
        // Smoother attack for soul sounds
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.005);
        
        // Smoother decay
        gainNode.gain.setTargetAtTime(0.001, startTime + duration * 0.7, 0.05 + (0.05 * this.modulationParams.soulfulness));
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        noise.start(startTime);
        noise.stop(startTime + duration);
        
        setTimeout(() => {
            noise.disconnect();
            filter.disconnect();
            gainNode.disconnect();
        }, (duration + 0.1) * 1000);
    }

    stopLoop() {
        this.isPlaying = false;
        if (this.loopTimeout) {
            clearTimeout(this.loopTimeout);
            this.loopTimeout = null;
        }
    }

    updateChaosLevel(level) {
        if (level !== this.chaosLevel) {
            // Store previous level for transition calculation
            this.previousChaosLevel = this.chaosLevel;
            this.chaosLevel = level;
            
            // Check if we need a musical transition
            if (Math.abs(this.previousChaosLevel - level) > 15) {
                this.stateTransitionPending = true;
                console.log(`Scheduling transition from ${this.previousChaosLevel} to ${level}`);
            } else {
                // Small changes don't need a transition, just gradually update
                this.updatePatternMixForChaos(0.1); // Smooth blend
            }
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('musicEnabled', enabled);
        
        if (this.gainNode) {
            const now = this.audioContext ? this.audioContext.currentTime : 0;
            this.gainNode.gain.cancelScheduledValues(now);
            
            // Smoother transition when enabling/disabling
            if (enabled) {
                this.gainNode.gain.setValueAtTime(0, now);
                this.gainNode.gain.linearRampToValueAtTime(
                    this.volume * this.baseVolume,
                    now + 0.5 // Fade in over 0.5 seconds
                );
            } else {
                this.gainNode.gain.setValueAtTime(this.volume * this.baseVolume,
                    now
                );
                this.gainNode.gain.linearRampToValueAtTime(
                    0,
                    now + 0.5 // Fade out over 0.5 seconds
                );
            }
        }
        
        if (enabled) {
            this.initAudio();
            this.startLoop();
        } else {
            this.stopLoop();
        }
    }

    setVolume(value) {
        this.volume = value;
        localStorage.setItem('musicVolume', value);
        if (this.gainNode) {
            // Smooth transition for volume change
            this.gainNode.gain.linearRampToValueAtTime(
                value * this.baseVolume,
                this.audioContext.currentTime + 0.1
            );
        }
    }

    // Method to set the base volume
    setBaseVolume(value) {
        this.baseVolume = value;
        
        // If audio context exists and we have a gain node, update the volume immediately
        if (this.gainNode) {
            const currentVolume = this.enabled ? this.volume * value : 0;
            this.gainNode.gain.linearRampToValueAtTime(
                currentVolume,
                this.audioContext ? this.audioContext.currentTime + 0.1 : 0
            );
        }
    }
    
    // Method to increase soulfulness temporarily
    increaseSoulfulness(duration = 8) {
        // Store original soulfulness
        const originalSoulfulness = this.modulationParams.soulfulness;
        
        // Maximize soulfulness
        this.modulationParams.soulfulness = 1.0;
        
        // Reset after specified duration
        setTimeout(() => {
            // Smoothly transition back
            const steps = 10;
            const stepTime = 200; // ms
            const stepChange = (1.0 - originalSoulfulness) / steps;
            
            const stepDown = () => {
                this.modulationParams.soulfulness -= stepChange;
                if (this.modulationParams.soulfulness > originalSoulfulness) {
                    setTimeout(stepDown, stepTime);
                } else {
                    this.modulationParams.soulfulness = originalSoulfulness;
                }
            };
            
            stepDown();
        }, duration * 1000);
    }
    
    // Method to inject a special fill - useful for game events
    injectFill() {
        if (!this.audioContext || !this.isPlaying) return;
        
        const now = this.audioContext.currentTime;
        const fillDuration = 0.5; // Half second
        
        // Determine fill type based on chaos level
        if (this.chaosLevel < 40) {
            // Low energy - subtle fill
            this.playAtmosphericPad(now, fillDuration);
        } else if (this.chaosLevel < 70) {
            // Medium energy - filter sweep
            this.playFilterSweep(now, fillDuration);
        } else {
            // High energy - all out
            this.playFilterSweep(now, fillDuration);
            setTimeout(() => {
                if (this.isPlaying) {
                    this.playAtmosphericPad(now + 0.1, fillDuration - 0.1);
                }
            }, 100);
        }
    }
}

// Create singleton instance
export const dnbMusic = new SoulfulDrumAndBassMusic();
