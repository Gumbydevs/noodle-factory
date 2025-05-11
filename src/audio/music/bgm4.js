// Rolling Boil 


export class LoungeMusic2 {
    constructor() {
        this.ctx = null;
        this.gainNode = null;
        this.isLooping = false;
        this.currentLoop = null;
        this.nextLoop = null;
        this.isPreloaded = false;
        this.buffers = {};
        this.audioContext = null;
        this.isPlaying = false;
        
        // Bossa nova requires a softer, more gentle volume - increase overall volume
        this.baseVolume = 0.25; // Increased from 0.15
        this.volume = parseFloat(localStorage.getItem('musicVolume')) || 0.02;
        this.chaosLevel = 0;
        this.loopTimeout = null;
        this.currentTime = 0;
        this.nextScheduleTime = 0;
        this.scheduleAheadTime = 0.2;
        this.originalBpm = 76; // Classic bossa nova tempo
        this.baseBpm = 76;
        this.sequencerSteps = 16;
        this.currentStep = 0;
        this.enabled = localStorage.getItem('musicEnabled') !== 'false';
        this.lastChordTime = 0;

        // Bossa nova percussion patterns - more variation for interest
        this.bossaPatterns = {
            brush: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            rim: [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1], // Added extra hit
            shaker: [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
            tamborim: [0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1] // More varied pattern
        };

        // Authentic brazilian bass drum pattern - made more prominent
        this.surdo = {
            kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0] // Added extra hit
        };

        // Volume controls for each drum set - increase percussion volume
        this.drumLevels = {
            bossa: 1.5, // Increased from 1.0
            surdo: 1.2  // Increased from 0.7
        };

        // Sound parameters for bossa nova percussion - adjust for better audibility
        this.bossaParams = {
            brushFreq: 3000,
            brushDecay: 0.15,
            rimFreq: 1800,
            rimDecay: 0.1, // Increased from 0.08
            shakerFreq: 4500,
            shakerDecay: 0.12, // Increased from 0.1
            surdoFreq: 60,
            surdoDecay: 0.4 // Increased from 0.3
        };

        // COMPLETELY NEW: Use local audio samples for hip-hop drums instead of external URLs
        this.drumSampleUrls = {
            kick: '/audio/drums/kick.mp3',
            snare: '/audio/drums/snare.mp3',
            hihat: '/audio/drums/hihat.mp3'
        };
        
        this.drumSamples = {};
        this.drumSampleBuffers = {};
        
        // Much more musical and varied chord progressions (completely different than bgm2)
        this.newProgressions = [
            // Progression 1: Neo-soul with interesting tensions and voice leading
            [
                { chord: 'F#m9', duration: 2, notes: ['F#2', 'A2', 'C#3', 'E3', 'G#3'] },
                { chord: 'B9sus4', duration: 2, notes: ['B2', 'E3', 'F#3', 'A3', 'C#4'] },
                { chord: 'Dmaj9', duration: 2, notes: ['D3', 'F#3', 'A3', 'C#4', 'E4'] },
                { chord: 'G#m7b5', duration: 2, notes: ['G#2', 'B2', 'D3', 'F#3'] }
            ],
            
            // Progression 2: Modal jazz with interesting voice motion
            [
                { chord: 'Amaj13', duration: 2, notes: ['A2', 'C#3', 'E3', 'G#3', 'F#4'] },
                { chord: 'F#m11', duration: 2, notes: ['F#2', 'A2', 'C#3', 'E3', 'B3'] },
                { chord: 'E13', duration: 2, notes: ['E2', 'G#2', 'B2', 'D3', 'C#4'] },
                { chord: 'DMaj7#11', duration: 2, notes: ['D2', 'F#2', 'A2', 'C#3', 'G#3'] }
            ],
            
            // Progression 3: Complex jazz changes with chromatic motion
            [
                { chord: 'Bm11', duration: 1, notes: ['B2', 'D3', 'F#3', 'A3', 'E4'] },
                { chord: 'E9', duration: 1, notes: ['E2', 'G#2', 'B2', 'D3', 'F#3'] },
                { chord: 'Amaj9', duration: 1, notes: ['A2', 'C#3', 'E3', 'G#3', 'B3'] },
                { chord: 'F#m7', duration: 1, notes: ['F#2', 'A2', 'C#3', 'E3'] },
                { chord: 'Gmaj7', duration: 1, notes: ['G2', 'B2', 'D3', 'F#3'] },
                { chord: 'F#m7b5', duration: 1, notes: ['F#2', 'A2', 'C3', 'E3'] },
                { chord: 'B7alt', duration: 1, notes: ['B2', 'D#3', 'F3', 'A3'] },
                { chord: 'E7#9', duration: 1, notes: ['E2', 'G#2', 'B2', 'D3', 'G3'] }
            ]
        ];
        
        // Which progression we're currently playing
        this.currentProgressionIndex = 0;
        this.currentChordIndex = 0;
        
        // Hip-hop pattern that gets activated when chaos exceeds 15
        this.hipHopPattern = {
            kick: [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        };
        
        // New variables for handling sample-based drums
        this.drumSamplesLoaded = false;
        this.drumSampleVolume = 5.0; // Start with high volume

        // Bossa nova jazz chords (maj7, m7, 7) with more varied voicings - COMPLETELY NEW KEY (D/Bm)
        this.bossaChords = {
            // Major 7th chords with different voicings - NEW KEY
            'Dmaj7': ['D3', 'F#3', 'A3', 'C#4'],
            'Dmaj7_2': ['A2', 'D3', 'F#3', 'C#4'], // 2nd inversion
            'Dmaj7_3': ['F#2', 'A2', 'C#3', 'D3'], // 1st inversion
            
            'Emaj7': ['E3', 'G#3', 'B3', 'D#4'],
            'Emaj7_2': ['B2', 'E3', 'G#3', 'D#4'], // 2nd inversion
            'Emaj7_3': ['G#2', 'B2', 'D#3', 'E3'], // 1st inversion
            
            'Amaj7': ['A2', 'C#3', 'E3', 'G#3'],
            'Amaj7_2': ['E2', 'A2', 'C#3', 'G#3'], // 2nd inversion
            'Amaj7_3': ['C#2', 'E2', 'G#2', 'A2'], // 1st inversion
            
            'Gmaj7': ['G2', 'B2', 'D3', 'F#3'],
            'Gmaj7_2': ['D2', 'G2', 'B2', 'F#3'], // 2nd inversion
            'Gmaj7_3': ['B1', 'D2', 'F#2', 'G2'], // 1st inversion
            
            // Minor 7th chords with different voicings - NEW KEY
            'Bm7': ['B2', 'D3', 'F#3', 'A3'],
            'Bm7_2': ['F#2', 'B2', 'D3', 'A3'], // 2nd inversion
            'Bm7_3': ['D2', 'F#2', 'A2', 'B2'], // 1st inversion
            
            'F#m7': ['F#2', 'A2', 'C#3', 'E3'],
            'F#m7_2': ['C#2', 'F#2', 'A2', 'E3'], // 2nd inversion
            'F#m7_3': ['A1', 'C#2', 'E2', 'F#2'], // 1st inversion
            
            // Dominant 7th chords with different voicings - NEW KEY
            'E7': ['E2', 'G#2', 'B2', 'D3'],
            'E7_2': ['B1', 'E2', 'G#2', 'D3'], // 2nd inversion
            'E7_3': ['G#1', 'B1', 'D2', 'E2'], // 1st inversion
            
            'A7': ['A2', 'C#3', 'E3', 'G3'],
            'A7_2': ['E2', 'A2', 'C#3', 'G3'], // 2nd inversion
            'A7_3': ['C#2', 'E2', 'G2', 'A2'], // 1st inversion
            
            // Added minor-major chords for unique Brazilian sound
            'Bm(maj7)': ['B2', 'D3', 'F#3', 'A#3'],
            'F#m(maj7)': ['F#2', 'A2', 'C#3', 'E#3'],
            
            // Added some altered and extended chords for variety
            'D9': ['D3', 'F#3', 'A3', 'C3', 'E4'],
            'E13': ['E2', 'G#2', 'B2', 'D3', 'C#4'],
            'A7b9': ['A2', 'C#3', 'E3', 'G3', 'Bb3'],
            'Bm11': ['B2', 'D3', 'F#3', 'A3', 'E4']
        };

        // Authentic bossa nova progressions - COMPLETELY NEW KEY
        this.chordProgressions = [
            // New progression 1: Bossa in D major 
            [
                { chord: 'Dmaj7', duration: 2 },
                { chord: 'Bm7', duration: 2 },
                { chord: 'Gmaj7', duration: 2 },
                { chord: 'A7', duration: 2 }
            ],
            // New progression 2: Modal bossa with minor-major
            [
                { chord: 'Bm7', duration: 2 },
                { chord: 'E7', duration: 2 },
                { chord: 'A7', duration: 2 },
                { chord: 'F#m7', duration: 2 }
            ],
            // New progression 3: Brazilian altered chords
            [
                { chord: 'Bm(maj7)', duration: 2 },
                { chord: 'E7', duration: 2 },
                { chord: 'A7b9', duration: 2 },
                { chord: 'D9', duration: 2 }
            ]
        ];

        // Bossa nova bass patterns with D/B centered patterns
        this.bassPatterns = [
            // Standard bossa nova bass - in D major/B minor
            ['D2', 'A2', 'F#2', 'A2'],
            // Jobim-style walking bass - in D major/B minor
            ['B2', 'F#2', 'D2', 'E2'],
            // With chromatic approach - in D major/B minor
            ['D2', 'C#2', 'C2', 'B1']
        ];

        // Brazilian scale for melodies - now in D/B
        this.bossaScale = ['B3', 'C#4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5'];

        // Note frequencies
        this.notes = {
            // Bass register
            'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
            'Bb2': 116.54, 'Eb2': 77.78, 'F#2': 92.50, 'Ab2': 103.83, 'C#2': 69.30,
            
            // Middle register (guitar focus)
            'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
            'Bb3': 233.08, 'Eb3': 155.56, 'F#3': 185.00, 'Ab3': 207.65, 'C#3': 138.59,
            
            // Higher register for melody
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
            'Bb4': 466.16, 'Eb4': 311.13, 'F#4': 369.99, 'Ab4': 415.30, 'C#4': 277.18,
            'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99
        };

        // Guitar voicing parameters for bossa nova
        this.guitarParams = {
            attack: 0.01,
            decay: 0.1,
            sustain: 0.8,
            release: 0.3,
            harmonics: [1.0, 0.5, 0.2, 0.1] // Harmonics for nylon string guitar tone
        };

        // Effects parameters
        this.effectsParams = {
            reverbTime: 1.5, // Shorter reverb for intimate bossa sound
            reverbWet: 0.15,
            reverbDry: 0.85,
            chorusRate: 1.2, // Subtle chorus for bossa guitar
            chorusDepth: 0.015,
            chorusWet: 0.2
        };
    }

    async preload() {
        if (this.isPreloaded) return;

        try {
            // Initialize audio context if needed
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.gainNode = this.audioContext.createGain();
                this.gainNode.gain.value = this.enabled ? this.volume * this.baseVolume : 0;

                // Initialize the hip-hop gain node
                this.hipHopGain = this.audioContext.createGain();
                // Set hip-hop gain to a much lower level
                this.hipHopGain.gain.value = 0.15; // Reduced from 0.7 to 0.15
                // Connect hip-hop directly to output for impact
                this.hipHopGain.connect(this.audioContext.destination);
                
                console.log("🔊 Hip-hop gain initialized at:", this.hipHopGain.gain.value);

                // Initialize the audio chain
                const reverb = this.createReverb();
                const lowShelf = this.audioContext.createBiquadFilter();
                const highShelf = this.audioContext.createBiquadFilter();
                const compressor = this.audioContext.createDynamicsCompressor();

                // Set up EQ for bossa nova sound
                lowShelf.type = 'lowshelf';
                lowShelf.frequency.value = 200;
                lowShelf.gain.value = 2;

                highShelf.type = 'highshelf';
                highShelf.frequency.value = 4000;
                highShelf.gain.value = 1.5;

                // Set up compressor
                compressor.threshold.value = -16;
                compressor.knee.value = 10;
                compressor.ratio.value = 2;
                compressor.attack.value = 0.01;
                compressor.release.value = 0.25;

                // Connect the chain
                this.gainNode.connect(lowShelf);
                lowShelf.connect(highShelf);
                highShelf.connect(reverb.convolver);
                reverb.convolver.connect(reverb.wetGain);
                highShelf.connect(reverb.dryGain);
                reverb.wetGain.connect(compressor);
                reverb.dryGain.connect(compressor);
                compressor.connect(this.audioContext.destination);

                // Store nodes for later
                this.nodes = { reverb, lowShelf, highShelf, compressor };
            }
            
            // IMPORTANT: Load the drum samples immediately
            await this.loadDrumSamples();

            this.isPreloaded = true;
        } catch (e) {
            console.warn('Error preloading bossa nova music system:', e);
            throw e;
        }
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Main gain node
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = this.enabled ? this.volume * this.baseVolume : 0;

            // Create dedicated hip-hop gain node that bypasses other processing
            this.hipHopGain = this.audioContext.createGain();
            // IMPORTANT: Initialize hip-hop gain at reasonable level when enabled
            this.hipHopGain.gain.value = this.enabled ? 0.15 : 0; // Reduced from 0.7 to 0.15
            
            // Connect hip-hop directly to output with NO processing for impact
            this.hipHopGain.connect(this.audioContext.destination);
            
            console.log("🔊 Hip-hop gain node initialized at:", this.hipHopGain.gain.value);

            // Create reverb
            const reverb = this.createReverb();
            
            // Create EQ section for bossa nova sound
            const lowShelf = this.audioContext.createBiquadFilter();
            lowShelf.type = 'lowshelf';
            lowShelf.frequency.value = 200;
            lowShelf.gain.value = 2;

            const highShelf = this.audioContext.createBiquadFilter();
            highShelf.type = 'highshelf';
            highShelf.frequency.value = 4000;
            highShelf.gain.value = 1.5;

            // Create compressor for glue
            const compressor = this.audioContext.createDynamicsCompressor();
            compressor.threshold.value = -16;
            compressor.knee.value = 10;
            compressor.ratio.value = 2;
            compressor.attack.value = 0.01;
            compressor.release.value = 0.25;

            // Connect everything
            this.gainNode.connect(lowShelf);
            lowShelf.connect(highShelf);
            
            // Split to dry/wet paths
            highShelf.connect(reverb.dryGain);
            highShelf.connect(reverb.convolver);
            reverb.convolver.connect(reverb.wetGain);
            
            // Mix dry/wet and compress
            reverb.dryGain.connect(compressor);
            reverb.wetGain.connect(compressor);
            
            // Final output
            compressor.connect(this.audioContext.destination);

            // Store nodes for later parameter updates
            this.nodes = {
                reverb,
                lowShelf,
                highShelf,
                compressor
            };
        }
    }

    createReverb() {
        const convolver = this.audioContext.createConvolver();
        const impulseLength = this.audioContext.sampleRate * this.effectsParams.reverbTime;
        const impulse = this.audioContext.createBuffer(2, impulseLength, this.audioContext.sampleRate);

        // Create stereo reverb impulse
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < impulseLength; i++) {
                // Decay curve with randomization for natural reverb
                const decay = Math.exp(-i / (this.audioContext.sampleRate * (this.effectsParams.reverbTime / 3)));
                channelData[i] = (Math.random() * 2 - 1) * decay;
            }
        }

        convolver.buffer = impulse;

        const wetGain = this.audioContext.createGain();
        const dryGain = this.audioContext.createGain();
        wetGain.gain.value = this.effectsParams.reverbWet;
        dryGain.gain.value = this.effectsParams.reverbDry;

        return { convolver, wetGain, dryGain };
    }

    createChorus() {
        const input = this.audioContext.createGain();
        const output = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();
        const dryGain = this.audioContext.createGain();
        
        wetGain.gain.value = this.effectsParams.chorusWet;
        dryGain.gain.value = 1 - this.effectsParams.chorusWet;

        // Create chorus voices
        const voices = [];
        for (let i = 0; i < 2; i++) { // Only 2 voices for subtle chorus
            const delay = this.audioContext.createDelay();
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            
            delay.delayTime.value = 0.02 + (i * 0.01);
            lfo.frequency.value = this.effectsParams.chorusRate + (i * 0.1);
            lfoGain.gain.value = this.effectsParams.chorusDepth;

            lfo.connect(lfoGain);
            lfoGain.connect(delay.delayTime);
            input.connect(delay);
            delay.connect(wetGain);
            
            lfo.start();
            voices.push({ delay, lfo, lfoGain });
        }

        input.connect(dryGain);
        dryGain.connect(output);
        wetGain.connect(output);

        return { input, output, voices };
    }

    createGuitarSound(freq) {
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Create multiple oscillators for nylon string guitar tone
        const harmonics = [];
        this.guitarParams.harmonics.forEach((ratio, i) => {
            const harmOsc = this.audioContext.createOscillator();
            const harmGain = this.audioContext.createGain();
            harmOsc.type = i === 0 ? 'triangle' : 'sine';
            harmOsc.frequency.value = freq * (i + 1);
            harmGain.gain.value = ratio;
            harmOsc.connect(harmGain);
            harmGain.connect(gainNode);
            harmonics.push({ osc: harmOsc, gain: harmGain });
        });

        return { mainOsc: osc, gainNode, harmonics };
    }

    playGuitarChord(notes, time, duration, velocity = 0.4) {
        if (!Array.isArray(notes) || notes.length === 0) return;

        // Stagger note timings for arpeggio effect (classic bossa guitar technique)
        notes.forEach((note, i) => {
            const staggerOffset = i * 0.03;
            const noteVelocity = velocity * (1 - (i * 0.1));
            this.playGuitarNote(note, time + staggerOffset, duration, noteVelocity);
        });
    }

    playGuitarNote(note, time, duration, velocity = 0.4) {
        if (!this.notes[note]) return;

        const freq = this.notes[note];
        const { mainOsc, gainNode, harmonics } = this.createGuitarSound(freq);
        
        // Apply ADSR envelope
        const now = time;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(velocity, now + this.guitarParams.attack);
        gainNode.gain.linearRampToValueAtTime(velocity * this.guitarParams.sustain, now + this.guitarParams.attack + this.guitarParams.decay);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        // Add subtle chorus for guitar richness
        const chorus = this.createChorus();
        gainNode.connect(chorus.input);
        chorus.output.connect(this.gainNode);

        // Start all oscillators
        harmonics.forEach(({ osc }) => {
            osc.start(now);
            osc.stop(now + duration + this.guitarParams.release);
        });

        setTimeout(() => {
            harmonics.forEach(({ osc, gain }) => {
                osc.disconnect();
                gain.disconnect();
            });
            gainNode.disconnect();
            chorus.input.disconnect();
            chorus.output.disconnect();
        }, (duration + this.guitarParams.release + 0.1) * 1000);
    }

    playBassNote(note, time, duration, velocity = 0.5) {
        if (!this.notes[note]) return;
        
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // Softer, rounder bass sound for bossa
        osc.type = 'sine';
        osc.frequency.value = this.notes[note];

        filter.type = 'lowpass';
        filter.frequency.value = 180; // Warm bass tone
        filter.Q.value = 0.8;

        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(velocity * this.volume * this.baseVolume, time + 0.04);
        gainNode.gain.linearRampToValueAtTime(0, time + duration);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.gainNode);

        osc.start(time);
        osc.stop(time + duration);

        setTimeout(() => {
            osc.disconnect();
            filter.disconnect();
            gainNode.disconnect();
        }, (duration + 0.1) * 1000);
    }

    playBossaBass(notes, time, duration, velocity = 0.5) {
        notes.forEach((note, i) => {
            const noteTime = time + (i * duration / notes.length);
            const noteDuration = (duration / notes.length) * 0.8;
            this.playBassNote(note, noteTime, noteDuration, velocity);
        });
    }

    playPercussion(type, time, velocity = 0.4) {
        switch (type) {
            case 'rim':
                this.playRimClick(time, velocity);
                break;
            case 'brush':
                this.playBrushSound(time, velocity);
                break;
            case 'shaker':
                this.playShakerSound(time, velocity);
                break;
            case 'tamborim':
                this.playTamborimSound(time, velocity);
                break;
            case 'kick':
                this.playSurdoSound(time, velocity);
                break;
        }
    }

    playRimClick(time, velocity = 0.4) {
        const bufferSize = this.audioContext.sampleRate * 0.1;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const position = i / bufferSize;
            let intensity;
            
            // Create rim click sound
            if (position < 0.02) {
                intensity = 1 - (position / 0.02);
            } else {
                intensity = Math.pow(1 - position, 2);
            }
            
            data[i] = (Math.random() * 2 - 1) * intensity;
        }

        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = this.bossaParams.rimFreq;
        filter.Q.value = 3;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(velocity * this.volume * this.baseVolume, time + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + this.bossaParams.rimDecay);

        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.gainNode);

        noiseSource.start(time);
        noiseSource.stop(time + this.bossaParams.rimDecay);

        setTimeout(() => {
            noiseSource.disconnect();
            filter.disconnect();
            gainNode.disconnect();
        }, (this.bossaParams.rimDecay + 0.1) * 1000);
    }

    playBrushSound(time, velocity = 0.4) {
        const bufferSize = this.audioContext.sampleRate * this.bossaParams.brushDecay;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const position = i / bufferSize;
            let brushIntensity;

            // Simulate brush movement
            if (position < 0.1) {
                brushIntensity = Math.pow(position * 10, 0.7);
            } else {
                brushIntensity = Math.pow(1 - position, 0.7);
                // Add micro-variations for more realism
                if (Math.random() < 0.2) {
                    brushIntensity *= 0.7 + Math.random() * 0.6;
                }
            }

            data[i] = (Math.random() * 2 - 1) * brushIntensity;
        }

        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = this.bossaParams.brushFreq;
        filter.Q.value = 1;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(velocity * this.volume * this.baseVolume, time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + this.bossaParams.brushDecay);

        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.gainNode);

        noiseSource.start(time);
        noiseSource.stop(time + this.bossaParams.brushDecay);

        setTimeout(() => {
            noiseSource.disconnect();
            filter.disconnect();
            gainNode.disconnect();
        }, (this.bossaParams.brushDecay + 0.1) * 1000);
    }

    playShakerSound(time, velocity = 0.3) {
        const bufferSize = this.audioContext.sampleRate * this.bossaParams.shakerDecay;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const position = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - position, 1.5);
        }

        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = this.bossaParams.shakerFreq;
        filter.Q.value = 0.8;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(velocity * this.volume * this.baseVolume, time + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + this.bossaParams.shakerDecay);

        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.gainNode);

        noiseSource.start(time);
        noiseSource.stop(time + this.bossaParams.shakerDecay);

        setTimeout(() => {
            noiseSource.disconnect();
            filter.disconnect();
            gainNode.disconnect();
        }, (this.bossaParams.shakerDecay + 0.1) * 1000);
    }

    playTamborimSound(time, velocity = 0.4) {
        const osc = this.audioContext.createOscillator();
        const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < noiseBuffer.length; i++) {
            noiseData[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const oscGain = this.audioContext.createGain();
        const noiseGain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'triangle';
        osc.frequency.value = 440;
        
        filter.type = 'bandpass';
        filter.frequency.value = 900;
        filter.Q.value = 2;
        
        oscGain.gain.setValueAtTime(0, time);
        oscGain.gain.linearRampToValueAtTime(velocity * 0.7 * this.volume * this.baseVolume, time + 0.005);
        oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        
        noiseGain.gain.setValueAtTime(0, time);
        noiseGain.gain.linearRampToValueAtTime(velocity * 0.3 * this.volume * this.baseVolume, time + 0.005);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        
        osc.connect(oscGain);
        noise.connect(filter);
        filter.connect(noiseGain);
        oscGain.connect(this.gainNode);
        noiseGain.connect(this.gainNode);
        
        osc.start(time);
        noise.start(time);
        osc.stop(time + 0.1);
        noise.stop(time + 0.1);
        
        setTimeout(() => {
            osc.disconnect();
            noise.disconnect();
            filter.disconnect();
            oscGain.disconnect();
            noiseGain.disconnect();
        }, 200);
    }

    playSurdoSound(time, velocity = 0.5) {
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = this.bossaParams.surdoFreq;
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(velocity * this.volume * this.baseVolume, time + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + this.bossaParams.surdoDecay);
        
        osc.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        osc.start(time);
        osc.stop(time + this.bossaParams.surdoDecay);
        
        setTimeout(() => {
            osc.disconnect();
            gainNode.disconnect();
        }, (this.bossaParams.surdoDecay + 0.1) * 1000);
    }

    playHipHopKick(time, velocity = 1.0) {
        console.log("🔊 Playing hip-hop kick at time:", time, "with velocity:", velocity);
        
        if (!this.hipHopGain) {
            console.error("Hip-hop gain node not initialized!");
            return;
        }
        
        // Create oscillator for the fundamental frequency
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        
        // Create second oscillator for harmonics
        const osc2 = this.audioContext.createOscillator();
        osc2.type = 'triangle';
        
        // Create a third oscillator for extra sub-bass
        const subOsc = this.audioContext.createOscillator();
        subOsc.type = 'sine';
        
        // Create compressor for maximum loudness
        const compressor = this.audioContext.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-50, time);
        compressor.knee.setValueAtTime(0, time);
        compressor.ratio.setValueAtTime(20, time);
        compressor.attack.setValueAtTime(0, time);
        compressor.release.setValueAtTime(0.25, time);
        
        // Create gain nodes with reasonable values
        const gain = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();
        const subGain = this.audioContext.createGain();
        
        // Create distortion for added presence
        const distortion = this.audioContext.createWaveShaper();
        function makeDistortionCurve(amount) {
            const k = amount;
            const samples = 44100;
            const curve = new Float32Array(samples);
            for (let i = 0; i < samples; ++i) {
                const x = (i * 2) / samples - 1;
                curve[i] = (Math.PI + k) * x / (Math.PI + k * Math.abs(x));
            }
            return curve;
        }
        distortion.curve = makeDistortionCurve(150);
        
        // Set frequency envelopes for a powerful kick
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.15);
        
        osc2.frequency.setValueAtTime(120, time);
        osc2.frequency.exponentialRampToValueAtTime(40, time + 0.2);
        
        subOsc.frequency.setValueAtTime(60, time);
        subOsc.frequency.linearRampToValueAtTime(30, time + 0.3);
        
        // Set volume envelopes with reasonable values
        gain.gain.setValueAtTime(velocity * 1.5, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
        
        gain2.gain.setValueAtTime(velocity * 1.0, time);
        gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
        
        subGain.gain.setValueAtTime(velocity * 2.0, time);
        subGain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
        
        // Connect oscillators to their respective gain nodes
        osc.connect(gain);
        osc2.connect(gain2);
        subOsc.connect(subGain);
        
        // Connect gain nodes to compressor for maximum power
        gain.connect(compressor);
        gain2.connect(compressor);
        subGain.connect(compressor);
        
        // Connect to distortion for added presence
        compressor.connect(distortion);
        
        // Connect only to hip-hop gain, not directly to output
        distortion.connect(this.hipHopGain);
        
        // Start and stop
        osc.start(time);
        osc2.start(time);
        subOsc.start(time);
        
        osc.stop(time + 0.5);
        osc2.stop(time + 0.4);
        subOsc.stop(time + 0.8);
        
        // Clean up
        setTimeout(() => {
            osc.disconnect();
            osc2.disconnect();
            subOsc.disconnect();
            gain.disconnect();
            gain2.disconnect();
            subGain.disconnect();
            compressor.disconnect();
            distortion.disconnect();
        }, 1000);
        
        // Visual confirmation with normal styling
        console.log(`Hip-hop kick played (chaos level: ${this.chaosLevel})`);
    }

    playHipHopSnare(time, velocity = 1.0) {
        console.log("🔊 Playing hip-hop snare at time:", time, "with velocity:", velocity);
        
        if (!this.hipHopGain) {
            console.error("Hip-hop gain node not initialized!");
            return;
        }
        
        // Create noise for the snare body
        const noiseBuffer = this.createNoiseBuffer();
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        
        // Create oscillator for the snare tone component
        const tone = this.audioContext.createOscillator();
        tone.type = 'triangle';
        tone.frequency.setValueAtTime(250, time);
        
        // Create secondary oscillator for added presence
        const tone2 = this.audioContext.createOscillator();
        tone2.type = 'square';
        tone2.frequency.setValueAtTime(350, time);
        
        // Create bandpass filter for the noise
        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(3000, time);
        noiseFilter.Q.setValueAtTime(0.8, time);
        
        // Create high-pass filter to cut low frequencies
        const highpass = this.audioContext.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(800, time);
        
        // Create gain nodes with reasonable values
        const noiseGain = this.audioContext.createGain();
        const toneGain = this.audioContext.createGain();
        const tone2Gain = this.audioContext.createGain();
        
        // Create compressor for better punch
        const compressor = this.audioContext.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-50, time);
        compressor.knee.setValueAtTime(0, time);
        compressor.ratio.setValueAtTime(20, time);
        compressor.attack.setValueAtTime(0, time);
        compressor.release.setValueAtTime(0.1, time);
        
        // Create distortion for added presence
        const distortion = this.audioContext.createWaveShaper();
        function makeDistortionCurve(amount) {
            const k = amount;
            const samples = 44100;
            const curve = new Float32Array(samples);
            for (let i = 0; i < samples; ++i) {
                const x = (i * 2) / samples - 1;
                curve[i] = (Math.PI + k) * x / (Math.PI + k * Math.abs(x));
            }
            return curve;
        }
        distortion.curve = makeDistortionCurve(150);
        
        // Set volume envelopes with reasonable values
        noiseGain.gain.setValueAtTime(0, time);
        noiseGain.gain.linearRampToValueAtTime(velocity * 1.5, time + 0.001);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        
        toneGain.gain.setValueAtTime(0, time);
        toneGain.gain.linearRampToValueAtTime(velocity * 1.3, time + 0.001);
        toneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        
        tone2Gain.gain.setValueAtTime(0, time);
        tone2Gain.gain.linearRampToValueAtTime(velocity * 1.0, time + 0.001);
        tone2Gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        
        // Connect oscillators and noise to their respective filters and gain nodes
        noise.connect(noiseFilter);
        noiseFilter.connect(highpass);
        highpass.connect(noiseGain);
        
        tone.connect(toneGain);
        tone2.connect(tone2Gain);
        
        // Connect gain nodes to compressor for better sound
        noiseGain.connect(compressor);
        toneGain.connect(compressor);
        tone2Gain.connect(compressor);
        
        // Connect to distortion for added presence
        compressor.connect(distortion);
        
        // Connect only to hip-hop gain, not directly to output
        distortion.connect(this.hipHopGain);
        
        // Start and stop
        noise.start(time);
        tone.start(time);
        tone2.start(time);
        
        noise.stop(time + 0.2);
        tone.stop(time + 0.1);
        tone2.stop(time + 0.08);
        
        // Clean up
        setTimeout(() => {
            noise.disconnect();
            tone.disconnect();
            tone2.disconnect();
            noiseFilter.disconnect();
            highpass.disconnect();
            noiseGain.disconnect();
            toneGain.disconnect();
            tone2Gain.disconnect();
            compressor.disconnect();
            distortion.disconnect();
        }, 300);
        
        // Visual confirmation with normal styling
        console.log(`Hip-hop snare played (chaos level: ${this.chaosLevel})`);
    }
    
    createNoiseBuffer() {
        // Create a buffer for white noise
        const bufferSize = this.audioContext.sampleRate * 2.0; // 2 seconds of noise
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        // Fill the buffer with noise
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        return buffer;
    }

    playHipHopHiHat(time, velocity = 1.0) {
        console.log("🔊 Playing hip-hop hi-hat at time:", time, "with velocity:", velocity);
        
        if (!this.hipHopGain) {
            console.error("Hip-hop gain node not initialized!");
            return;
        }
        
        // Create noise for the hi-hat
        const noiseBuffer = this.createNoiseBuffer();
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        
        // Create highpass filter for hi-hat character
        const highpass = this.audioContext.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(6000, time);
        highpass.Q.setValueAtTime(8, time);
        
        // Create bandpass filter for hi-hat character
        const bandpass = this.audioContext.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(8000, time);
        bandpass.Q.setValueAtTime(4, time);
        
        // Create gain node with reasonable value
        const noiseGain = this.audioContext.createGain();
        
        // Create compressor for better sound
        const compressor = this.audioContext.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-50, time);
        compressor.knee.setValueAtTime(0, time);
        compressor.ratio.setValueAtTime(20, time);
        compressor.attack.setValueAtTime(0, time);
        compressor.release.setValueAtTime(0.05, time);
        
        // Set volume envelope with reasonable values
        noiseGain.gain.setValueAtTime(0, time);
        noiseGain.gain.linearRampToValueAtTime(velocity * 1.2, time + 0.001);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        
        // Connect everything
        noise.connect(highpass);
        highpass.connect(bandpass);
        bandpass.connect(noiseGain);
        noiseGain.connect(compressor);
        compressor.connect(this.hipHopGain);
        
        // Start and stop
        noise.start(time);
        noise.stop(time + 0.1);
        
        // Clean up
        setTimeout(() => {
            noise.disconnect();
            highpass.disconnect();
            bandpass.disconnect();
            noiseGain.disconnect();
            compressor.disconnect();
        }, 200);
        
        // Visual confirmation with normal styling
        console.log(`Hip-hop hi-hat played (chaos level: ${this.chaosLevel})`);
    }

    async startLoop() {
        await this.ensureAudioContext();
        if (!this.enabled) return;

        this.isPlaying = true;
        this.nextScheduleTime = this.audioContext.currentTime;
        this.currentStep = 0;
        this.scheduleLoop();
    }

    async ensureAudioContext() {
        if (!this.audioContext) {
            this.initAudio();
        }

        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (e) {
                console.error("Failed to resume audio context:", e);
                return false;
            }
        }
        return true;
    }

    scheduleLoop() {
        if (!this.enabled || !this.isPlaying || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const stepDuration = 60 / this.baseBpm / 4; // 16th notes

        while (this.nextScheduleTime < now + this.scheduleAheadTime) {
            this.scheduleNotes(this.currentStep, this.nextScheduleTime);
            this.currentStep = (this.currentStep + 1) % this.sequencerSteps;
            this.nextScheduleTime += stepDuration;
        }

        this.loopTimeout = setTimeout(() => {
            if (this.isPlaying) {
                this.scheduleLoop();
            }
        }, 25);
    }

    scheduleNotes(step, time) {
        // Play bossa percussion
        Object.entries(this.bossaPatterns).forEach(([instrument, pattern]) => {
            if (pattern[step]) {
                this.playPercussion(instrument, time, 0.5 * this.drumLevels.bossa);
            }
        });

        // Play surdo (bass drum)
        Object.entries(this.surdo).forEach(([instrument, pattern]) => {
            if (pattern[step]) {
                this.playPercussion(instrument, time, 0.6 * this.drumLevels.surdo);
            }
        });

        // NEW HIP-HOP DRUMS APPROACH: Play hip-hop beats directly using samples when chaos level is high
        if (this.chaosLevel >= 15) {
            // Make sure hip-hop gain is at maximum
            if (this.hipHopGain && this.hipHopGain.gain.value < 0.15) {
                console.log("⚠️ FIXING HIP-HOP GAIN - Setting to reasonable level!", this.hipHopGain.gain.value);
                this.hipHopGain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
            }
            
            // Log to confirm drums are being scheduled
            if (step === 0) {
                console.log("%c 🔊 SCHEDULING HIP-HOP DRUMS - CHAOS LEVEL: " + this.chaosLevel, 
                          "background: #FF3300; color: white; font-size: 16px; padding: 5px;");
            }
            
            // Play hip-hop kick drums
            if (this.hipHopPattern.kick[step]) {
                this.playSampleDrum('kick', time, 10.0); // EXTRA LOUD
            }
            
            // Play hip-hop snare drums
            if (this.hipHopPattern.snare[step]) {
                this.playSampleDrum('snare', time, 10.0); // EXTRA LOUD
            }
            
            // Play hip-hop hi-hats on EVERY step for unmistakable presence
            if (step % 2 === 0) { // Every other step for hi-hats
                this.playSampleDrum('hihat', time, 8.0);
            }
            
            // Add random extra kicks for emphasis
            if (step % 8 === 4 && Math.random() < 0.7) {
                this.playSampleDrum('kick', time, 12.0); // SUPER EXTRA LOUD random kicks
            }
        }

        // Play new chord progression with more interesting voicings
        const progressionIndex = Math.floor(this.currentStep / 32) % this.newProgressions.length;
        const progression = this.newProgressions[progressionIndex];
        
        // Play a chord when step is divisible by 8 (less frequent chords = more space between them)
        if (step % 8 === 0) {
            // Choose which chord to play based on current step
            const chordIndex = Math.floor((step % 32) / 8);
            // Make sure we don't go out of bounds
            const safeChordIndex = chordIndex % progression.length;
            const chordInfo = progression[safeChordIndex];
            
            // Log which chord we're playing for debugging
            console.log(`Playing chord: ${chordInfo.chord} at step ${step}`);
            
            // Play the exact notes from our new progressions
            const chordDuration = (chordInfo.duration * 60 / this.baseBpm) * 0.9;
            
            // Use explicit note definitions from our new progressions
            this.playGuitarChord(chordInfo.notes, time, chordDuration, 0.7);
            
            // Play bass note (root of the chord)
            this.playBassNote(chordInfo.notes[0], time, chordDuration, 0.8);
        }
    }

    stopLoop() {
        this.isPlaying = false;
        if (this.loopTimeout) {
            clearTimeout(this.loopTimeout);
            this.loopTimeout = null;
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('musicEnabled', enabled);
        
        if (this.gainNode) {
            const now = this.audioContext ? this.audioContext.currentTime : 0;
            this.gainNode.gain.cancelScheduledValues(now);
            this.gainNode.gain.linearRampToValueAtTime(
                enabled ? this.volume * this.baseVolume : 0,
                now + 0.1
            );
        }
        
        if (this.hipHopGain) {
            const now = this.audioContext ? this.audioContext.currentTime : 0;
            this.hipHopGain.gain.cancelScheduledValues(now);
            // CRITICAL FIX: Set hip-hop gain to reasonable level when enabled
            this.hipHopGain.gain.linearRampToValueAtTime(
                enabled ? 0.15 : 0, // Reduced from 0.7 to 0.15
                now + 0.1
            );
            console.log("🔊 Hip-hop gain set to:", enabled ? "REASONABLE (0.15)" : "OFF");
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
            this.gainNode.gain.linearRampToValueAtTime(
                value * this.baseVolume,
                this.audioContext.currentTime + 0.1
            );
        }
    }

    setBaseVolume(value) {
        this.baseVolume = value;
        
        if (this.gainNode) {
            const currentVolume = this.enabled ? this.volume * value : 0;
            this.gainNode.gain.linearRampToValueAtTime(
                currentVolume,
                this.audioContext ? this.audioContext.currentTime + 0.1 : 0
            );
        }
    }

    updateChaosLevel(level) {
        if (level !== this.chaosLevel) {
            const previousChaosLevel = this.chaosLevel;
            this.chaosLevel = level;
            
            // CRITICAL: Log when crossing the threshold for hip hop drums
            if (previousChaosLevel < 15 && level >= 15) {
                console.log("%c 💥 ACTIVATING HIP HOP DRUMS - Chaos level reached: " + level, 
                           "background: red; color: white; font-size: 24px; padding: 10px;");
                
                // Force hip-hop gain to reasonable level when crossing the threshold
                if (this.hipHopGain) {
                    // Set reasonable volume for hip-hop drums
                    this.hipHopGain.gain.setValueAtTime(0.15, this.audioContext.currentTime); // Reduced from 0.7 to 0.15
                    console.log("HIP HOP GAIN SET TO REASONABLE LEVEL:", this.hipHopGain.gain.value);
                    
                    // Play a test pattern immediately to confirm drums are working
                    const now = this.audioContext.currentTime;
                    this.playHipHopKick(now, 10.0);
                    this.playHipHopSnare(now + 0.2, 10.0);
                    this.playHipHopHiHat(now + 0.3, 10.0);
                }
            }
            
            if (this.audioContext && this.isPlaying) {
                const now = this.audioContext.currentTime;
                
                // Handle hip-hop drum volume based on chaos level
                if (level >= 15) {
                    // Set reasonable volume for hip-hop
                    if (this.hipHopGain) {
                        this.hipHopGain.gain.setValueAtTime(0.15, now); // Reduced from 0.7 to 0.15
                        console.log(`Hip-hop gain at chaos ${level}: ${this.hipHopGain.gain.value}`);
                    }
                    
                    // Play immediate kick drum to verify it's working
                    this.playHipHopKick(now, 10.0);
                } else {
                    // No hip-hop below threshold
                    if (this.hipHopGain) {
                        this.hipHopGain.gain.setValueAtTime(0, now);
                    }
                }
                
                // Adjust surdo volume based on chaos
                if (level >= 40) {
                    this.drumLevels.surdo = 0.7 + (level / 100) * 0.3;
                } else {
                    this.drumLevels.surdo = 0.7;
                }

                // Adjust tempo based on chaos - bossa nova stays relatively stable
                this.baseBpm = this.originalBpm + (level * 0.0015); // Very subtle tempo increase
                
                // Adjust effects based on chaos level
                if (this.nodes) {
                    // More extreme EQ at higher chaos
                    this.nodes.lowShelf.frequency.linearRampToValueAtTime(
                        200 + (level * 1.5),
                        now + 0.1
                    );
                    this.nodes.highShelf.frequency.linearRampToValueAtTime(
                        4000 - (level * 20),
                        now + 0.1
                    );

                    // More compression at higher chaos
                    this.nodes.compressor.threshold.linearRampToValueAtTime(
                        -16 - (level / 5),
                        now + 0.1
                    );
                    this.nodes.compressor.ratio.linearRampToValueAtTime(
                        2 + (level / 25),
                        now + 0.1
                    );

                    // More reverb at higher chaos
                    this.nodes.reverb.wetGain.gain.linearRampToValueAtTime(
                        this.effectsParams.reverbWet + (level / 250),
                        now + 0.1
                    );
                }
            }
        }
    }

    setDrumLevels(bossaLevel, surdoLevel) {
        this.drumLevels.bossa = bossaLevel;
        this.drumLevels.surdo = surdoLevel;
    }

    // Load actual audio samples for hip-hop drums
    async loadDrumSamples() {
        if (this.drumSamplesLoaded) return;
        
        try {
            console.log("Loading hip-hop drum samples...");
            const samples = this.drumSampleUrls;
            
            for (const [name, url] of Object.entries(samples)) {
                console.log(`Loading sample: ${name} from ${url}`);
                try {
                    const response = await fetch(url);
                    const arrayBuffer = await response.arrayBuffer();
                    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                    this.drumSampleBuffers[name] = audioBuffer;
                    console.log(`✅ Successfully loaded ${name} sample`);
                } catch (error) {
                    console.error(`❌ Failed to load ${name} sample:`, error);
                }
            }
            
            this.drumSamplesLoaded = true;
            console.log("All hip-hop drum samples loaded successfully!");
        } catch (error) {
            console.error("Error loading drum samples:", error);
        }
    }

    // Play a drum sample with extreme volume
    playSampleDrum(type, time, velocity = 5.0) {
        // Safety check
        if (!this.drumSampleBuffers[type]) {
            console.warn(`Sample ${type} not loaded yet, using fallback`);
            // Use fallback synthesized drum if sample not available
            switch(type) {
                case 'kick': this.playHipHopKick(time, velocity); break;
                case 'snare': this.playHipHopSnare(time, velocity); break;
                case 'hihat': this.playHipHopHiHat(time, velocity); break;
            }
            return;
        }
        
        // Get the buffer
        const buffer = this.drumSampleBuffers[type];
        
        // Create source and gain
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        // Create a compressor for more punch
        const compressor = this.audioContext.createDynamicsCompressor();
        compressor.threshold.value = -24;
        compressor.knee.value = 4;
        compressor.ratio.value = 12; // Heavy compression for punch
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;
        
        // Create a distortion for more presence
        const distortion = this.audioContext.createWaveShaper();
        function makeDistortionCurve(amount) {
            const k = amount;
            const n_samples = 44100;
            const curve = new Float32Array(n_samples);
            for (let i = 0; i < n_samples; ++i) {
                const x = (i * 2) / n_samples - 1;
                curve[i] = (Math.PI + k) * x / (Math.PI + k * Math.abs(x));
            }
            return curve;
        }
        distortion.curve = makeDistortionCurve(50);
        
        // Create gain node with EXTREME volume
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = velocity * 5.0; // 5x the already high velocity
        
        // Connect everything with parallel paths for maximum volume
        source.connect(compressor);
        source.connect(distortion);
        source.connect(gainNode); // Direct connection for raw sound
        
        compressor.connect(this.hipHopGain);
        distortion.connect(this.hipHopGain);
        gainNode.connect(this.hipHopGain);
        
        // Start the sample
        source.start(time);
        
        // Visual confirmation
        console.log(`%c 🔊 PLAYING ${type.toUpperCase()} SAMPLE AT ${Math.round(velocity * 5)} VOLUME`, 
                    'background: red; color: white; font-size: 16px');
        
        // Clean up
        setTimeout(() => {
            source.disconnect();
            compressor.disconnect();
            distortion.disconnect();
            gainNode.disconnect();
        }, 1000);
    }
}

export const loungeMusic2 = new LoungeMusic2();
