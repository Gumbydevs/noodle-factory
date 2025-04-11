export class LoungeMusic {
    constructor() {
        this.ctx = null;
        this.gainNode = null;
        this.isLooping = false;
        this.currentLoop = null;
        this.nextLoop = null;
        this.isPreloaded = false;
        this.buffers = {};
        
        // Load saved preference
        const musicEnabled = localStorage.getItem('loungeEnabled') !== 'false';
        this.enabled = musicEnabled;
        this.volume = musicEnabled ? 0.4 : 0;

        this.audioContext = null;
        this.currentLoop = null;
        this.isPlaying = false;
        this.baseVolume = 0.125; // Slightly louder than original
        this.volume = parseFloat(localStorage.getItem('loungeVolume')) || 1.0;
        this.chaosLevel = 0;
        this.loopTimeout = null;
        this.currentTime = 0;
        this.nextScheduleTime = 0;
        this.scheduleAheadTime = 0.2;
        this.baseBpm = 92; // Slightly faster for bossa nova feel
        this.sequencerSteps = 16; // Keep 16 steps for patterns
        
        // Sequencer patterns (16 steps) - more bossa nova and lounge rhythms
        this.patterns = {
            // Light kick pattern for lounge feel
            kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            // Brushed snare/rim on 2 and 4
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            // Soft hi-hats
            hihat: [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
            // Bossa nova rim pattern
            rim: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
            // Latin percussion elements
            conga: [0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1],
            // Bossa clave pattern
            clave: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0]
        };
        
        // Alternative patterns for variation
        this.altPatterns = {
            kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
            snare: [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
            hihat: [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1],
            rim: [0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1],
            conga: [1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0],
            clave: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0]
        };
        
        // Lounge synth settings - softer and mellower
        this.synthParams = {
            waveforms: ['sine', 'triangle', 'sine'],  // More sine waves for smooth lounge sound
            filterTypes: ['lowpass', 'bandpass'],
            filterResonance: 3, // Lower resonance for smoother sounds
            baseCutoff: 1200  // Brighter base cutoff for sparkly tone
        };
        
        // Effects parameters
        this.effectsParams = {
            reverbTime: 1.5,
            chorusRate: 1.2,
            chorusDepth: 0.02,
            vibratoAmount: 0.03
        };
        
        // Modulation parameters
        this.modulationParams = {
            pitchMod: 0,
            filterMod: 0,
            velocityMod: 0,
            timingMod: 0,
            filterDecay: 0,
            chorusAmount: 0,
            vibratoRate: 0
        };
        
        // Notes with more jazz extensions
        this.notes = {
            'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
            'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
            'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
            
            // Jazz chord notes with flats and sharps
            'Eb2': 77.78, 'Bb2': 116.54, 'Ab2': 103.83, 'F#2': 92.50, 'Db3': 138.59,
            'Eb3': 155.56, 'F#3': 185.00, 'Ab3': 207.65, 'Bb3': 233.08, 'Db4': 277.18,
            'Eb4': 311.13, 'F#4': 369.99, 'Ab4': 415.30, 'Bb4': 466.16,
            // Additional jazz extensions
            'Gb2': 92.50, 'Gb3': 185.00, 'Gb4': 369.99,
            'A#2': 116.54, 'A#3': 233.08, 'A#4': 466.16,
            'D#3': 155.56, 'D#4': 311.13
        };

        // Load saved preferences
        this.enabled = localStorage.getItem('loungeEnabled') === 'true';
        
        // Track current pattern variation for smooth transitions
        this.currentPatternMix = 0;

        // Jazz and bossa nova scales
        this.musicalScales = {
            majorSixth: ['C3', 'E3', 'G3', 'A3', 'C4', 'E4', 'G4', 'A4'],
            minorNinth: ['C3', 'Eb3', 'G3', 'Bb3', 'D4', 'F4', 'Ab4'],
            bossaNova: ['C3', 'E3', 'F#3', 'G3', 'A3', 'C4', 'D4', 'E4'],
            lydianDominant: ['F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'Eb4', 'F4']
        };

        // Lounge bass patterns
        this.bassPatterns = [
            // Smooth walking bass
            ['C2', 'A2', 'Ab2', 'G2'],
            // Bossa nova bass
            ['C2', 'G2', 'B2', 'Bb2'],
            // Latin feel
            ['F2', 'C3', 'E2', 'Eb2'],
            // Modal jazz
            ['Eb2', 'Bb2', 'D3', 'Db3']
        ];

        // Chord progressions for lounge feel
        this.chordProgressions = [
            // Classic bossa
            [
                ['C3', 'E3', 'G3', 'A3'], // Cmaj6
                ['A2', 'C3', 'E3', 'G3'], // Am7
                ['D3', 'F3', 'A3', 'C4'], // Dm7
                ['G2', 'B2', 'D3', 'F3']  // G7
            ],
            // Minor bossa
            [
                ['C3', 'Eb3', 'G3', 'Bb3'], // Cm7
                ['F3', 'A3', 'C4', 'Eb4'],  // F7
                ['Bb2', 'D3', 'F3', 'A3'],  // Bbmaj7
                ['Eb3', 'G3', 'Bb3', 'D4']  // Ebmaj7
            ],
            // Jobim-style
            [
                ['F3', 'A3', 'C4', 'E4'],   // Fmaj7
                ['Bb2', 'D3', 'F3', 'A3'],  // Bbmaj7
                ['Eb3', 'G3', 'Bb3', 'D4'], // Ebmaj7
                ['Ab2', 'C3', 'Eb3', 'G3']  // Abmaj7
            ]
        ];

        // Vibraphone melodic patterns
        this.vibratoPatterns = [
            ['C4', 'E4', 'G4', 'A4', 'G4', 'E4'],
            ['Bb3', 'D4', 'F4', 'G4', 'F4', 'D4'],
            ['A3', 'C4', 'E4', 'G4', 'E4', 'C4'],
            ['G3', 'B3', 'D4', 'F4', 'D4', 'B3']
        ];
    }

    async preload() {
        if (this.isPreloaded) return;

        try {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                this.gainNode = this.ctx.createGain();
                this.gainNode.connect(this.ctx.destination);
                this.gainNode.gain.value = this.volume;
            }

            // Pre-create common nodes
            this.filter = this.ctx.createBiquadFilter();
            this.filter.type = 'lowpass';
            this.filter.frequency.value = 22050;
            this.filter.connect(this.gainNode);

            // Initialize oscillator bank
            this.oscillatorBank = {
                sine: this.ctx.createOscillator(),
                triangle: this.ctx.createOscillator(),
            };

            Object.entries(this.oscillatorBank).forEach(([type, osc]) => {
                osc.type = type;
            });

            this.isPreloaded = true;
        } catch (e) {
            console.warn('Error preloading lounge music system:', e);
        }
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master signal chain
            this.gainNode = this.audioContext.createGain();
            
            // Create reverb for lounge ambience
            this.reverb = this.createReverb(this.effectsParams.reverbTime);
            
            // Add a compressor for smoother dynamics
            this.compressor = this.audioContext.createDynamicsCompressor();
            this.compressor.threshold.value = -18; // Higher threshold for less compression
            this.compressor.knee.value = 12;       // Softer knee for smoother compression
            this.compressor.ratio.value = 2.5;     // Gentler ratio
            this.compressor.attack.value = 0.008;  // Quick attack
            this.compressor.release.value = 0.35;  // Longer release for smoother decay
            
            // EQ for tone shaping
            this.lowShelf = this.audioContext.createBiquadFilter();
            this.lowShelf.type = 'lowshelf';
            this.lowShelf.frequency.value = 250;   // Lower frequency for bass emphasis
            this.lowShelf.gain.value = 2;          // Subtle bass boost
            
            this.highShelf = this.audioContext.createBiquadFilter();
            this.highShelf.type = 'highshelf';
            this.highShelf.frequency.value = 8000; // Higher frequency for air
            this.highShelf.gain.value = 3;         // More high-end sparkle
            
            // Mid cut for that vintage lounge sound
            this.midCut = this.audioContext.createBiquadFilter();
            this.midCut.type = 'peaking';
            this.midCut.frequency.value = 800;     // Mid frequency
            this.midCut.Q.value = 1.2;             // Wide Q
            this.midCut.gain.value = -2;           // Gentle cut
            
            // Signal chain
            this.gainNode.gain.value = this.enabled ? this.volume * this.baseVolume : 0;
            this.gainNode.connect(this.lowShelf);
            this.lowShelf.connect(this.highShelf);
            this.highShelf.connect(this.midCut);
            this.midCut.connect(this.reverb.input);
            this.reverb.output.connect(this.compressor);
            this.compressor.connect(this.audioContext.destination);
        }
    }

    createReverb(reverbTime) {
        // Create a convolution reverb for the lounge space feel
        const convolver = this.audioContext.createConvolver();
        const rate = this.audioContext.sampleRate;
        const length = rate * reverbTime;
        const impulse = this.audioContext.createBuffer(2, length, rate);
        
        // Create left and right channels
        const leftChannel = impulse.getChannelData(0);
        const rightChannel = impulse.getChannelData(1);
        
        // Create smooth decay for vintage reverb feel
        for (let i = 0; i < length; i++) {
            // Exponential decay
            const decay = Math.exp(-i / (rate * (reverbTime / 3)));
            
            // Add some color variations for stereo width
            leftChannel[i] = (Math.random() * 2 - 1) * decay;
            rightChannel[i] = (Math.random() * 2 - 1) * decay;
        }
        
        convolver.buffer = impulse;
        
        // Create wet/dry mix
        const wetGain = this.audioContext.createGain();
        const dryGain = this.audioContext.createGain();
        const output = this.audioContext.createGain();
        
        wetGain.gain.value = 0.25; // 25% wet signal for subtle reverb
        dryGain.gain.value = 0.75; // 75% dry signal
        
        // Create the routing
        const input = this.audioContext.createGain();
        input.connect(convolver);
        input.connect(dryGain);
        convolver.connect(wetGain);
        wetGain.connect(output);
        dryGain.connect(output);
        
        return { input, output };
    }

    createChorus() {
        // Create chorus effect for electric piano, vibes etc.
        const delay1 = this.audioContext.createDelay();
        const delay2 = this.audioContext.createDelay();
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        
        // Set delay times
        delay1.delayTime.value = 0.025; // 25ms base delay
        delay2.delayTime.value = 0.027; // slightly different for stereo width
        
        // Configure LFO for modulation
        lfo.type = 'sine';
        lfo.frequency.value = this.effectsParams.chorusRate; // Rate in Hz
        lfoGain.gain.value = this.effectsParams.chorusDepth; // Depth
        
        // Connect LFO to delay time
        lfo.connect(lfoGain);
        lfoGain.connect(delay1.delayTime);
        lfoGain.connect(delay2.delayTime);
        
        // Start the LFO
        lfo.start();
        
        // Create wet/dry mix
        const wetGain = this.audioContext.createGain();
        const dryGain = this.audioContext.createGain();
        const output = this.audioContext.createGain();
        
        wetGain.gain.value = 0.35; // 35% wet signal
        dryGain.gain.value = 0.65; // 65% dry signal
        
        // Create the routing
        const input = this.audioContext.createGain();
        input.connect(delay1);
        input.connect(delay2);
        input.connect(dryGain);
        delay1.connect(wetGain);
        delay2.connect(wetGain);
        wetGain.connect(output);
        dryGain.connect(output);
        
        return { input, output, lfo, lfoGain };
    }

    async ensureAudioContext() {
        if (!this.audioContext) {
            this.initAudio();
        }

        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log("Lounge audio context resumed");
            } catch (e) {
                console.error("Failed to resume lounge audio context:", e);
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
        this.scheduleLoop();
    }

    scheduleLoop() {
        if (!this.enabled || !this.isPlaying || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        // Calculate BPM with subtle variation based on chaos
        const chaosBpmVariation = Math.min(15, this.chaosLevel * 0.2); // More subtle tempo changes
        const currentBpm = this.baseBpm + chaosBpmVariation;
        const stepDuration = 60 / currentBpm / 4; // 16th notes
        
        // Schedule events until scheduleAheadTime
        while (this.nextStepTime < now + this.scheduleAheadTime) {
            this.scheduleNotes(this.currentStep, this.nextStepTime);
            
            // Apply subtle bossa nova swing
            let swingAmount = 0;
            if (this.chaosLevel < 60) {
                // Lighter swing for bossa nova feel
                swingAmount = (this.currentStep % 2) * 0.08 * (0.3 + Math.min(50, this.chaosLevel)/150);
            }
            
            // Very subtle timing randomization for human feel
            const randomTiming = (Math.random() * 0.01 - 0.005) * (Math.min(40, this.chaosLevel)/100);
            
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
        }, 25); // Check frequently for tight timing
    }

    scheduleNotes(step, time) {
        // Update modulation parameters based on chaos level
        this.updateModulationParams();
        
        // Update pattern mix for smooth transitions
        const targetMix = Math.min(1, this.chaosLevel / 100);
        this.currentPatternMix = this.currentPatternMix * 0.95 + targetMix * 0.05;
        
        // Rhythm section
        this.playLoungeSequencerStep(step, time);
        
        // Bass line - classic walking bass pattern
        if (step % 4 === 0 || (this.chaosLevel > 30 && step % 8 === 4)) {
            this.playLoungeBass(step, time);
        }
        
        // Chord progression - play chords on downbeats
        if (step % 8 === 0 || (this.chaosLevel > 40 && step % 16 === 8)) {
            this.playLoungeChord(step, time);
        }
        
        // Vibraphone accents
        if (this.chaosLevel > 20 && (step % 8 === 2 || step % 8 === 6)) {
            this.playVibraphone(step, time);
        }
        
        // Piano fills at higher chaos levels
        if (this.chaosLevel > 50 && step % 16 === 12) {
            this.playPianoFill(step, time);
        }
        
        // Bossa nova guitar accents
        if (step % 4 === 2 || (step % 8 === 6 && Math.random() < 0.4)) {
            this.playGuitarAccent(step, time);
        }
    }
    
    updateModulationParams() {
        // Gentle modulation based on chaos level
        const chaos = this.chaosLevel / 100;
        
        this.modulationParams = {
            pitchMod: chaos * 12,        // Up to 1 octave of variation (less extreme)
            filterMod: 400 + (chaos * 1200), // Gentler filter modulation
            velocityMod: 0.1 + (chaos * 0.4), // More consistent velocities
            timingMod: chaos * 0.1,      // Subtle timing variation
            filterDecay: 0.3 + (chaos * 0.6), // Smoother decays
            chorusAmount: 0.2 + (chaos * 0.4), // More chorus at higher chaos
            vibratoRate: 5 + (chaos * 4)  // Vibrato for vibraphone
        };
        
        // Update effects based on chaos
        this.effectsParams.chorusRate = 1.2 + (chaos * 1.5); // 1.2 to 2.7 Hz
        this.effectsParams.chorusDepth = 0.02 + (chaos * 0.03); // 0.02 to 0.05
        this.effectsParams.vibratoAmount = 0.03 + (chaos * 0.04); // 0.03 to 0.07
    }
    
    getPatternValue(instrument, step) {
        // Blend between regular and alternative patterns based on chaos
        const regularVal = this.patterns[instrument][step];
        const altVal = this.altPatterns[instrument][step];
        
        // Probabilistic mixing of patterns with smoother transitions
        if (Math.random() < this.currentPatternMix) {
            return altVal;
        }
        return regularVal;
    }
    
    playLoungeSequencerStep(step, time) {
        // Play drum sounds with more lounge/jazz feel
        
        // Soft kick
        if (this.getPatternValue('kick', step)) {
            this.playLoungeDrum({
                type: 'kick',
                time: time,
                baseFreq: 55,  // Higher frequency for softer kick
                startFreq: 120, // Less dramatic pitch fall
                endFreq: 50,
                gain: 0.8 + (Math.random() * this.modulationParams.velocityMod),
                decay: 0.25 + (Math.random() * this.modulationParams.filterDecay * 0.1),
                filterFreq: 200 + (this.modulationParams.filterMod * 0.3)
            });
        }
        
        // Brushed snare/rim for jazz feel
        if (this.getPatternValue('snare', step)) {
            this.playLoungeDrum({
                type: 'brushed',
                time: time,
                gain: 0.6 + (Math.random() * this.modulationParams.velocityMod),
                decay: 0.18 + (Math.random() * this.modulationParams.filterDecay * 0.1),
                filterFreq: 2000 + (this.modulationParams.filterMod * 0.5)
            });
        }
        
        // Soft hi-hat
        if (this.getPatternValue('hihat', step)) {
            const isOpen = step % 8 === 4 || Math.random() < 0.2;
            
            this.playLoungeDrum({
                type: 'hihat',
                time: time,
                gain: 0.25 + (Math.random() * this.modulationParams.velocityMod * 0.3),
                decay: isOpen ? 0.3 : 0.1,
                filterFreq: 7000 + (this.modulationParams.filterMod * 0.6),
                resonance: 1 + (this.chaosLevel / 30)
            });
        }
        
        // Bossa nova rim clicks
        if (this.getPatternValue('rim', step)) {
            this.playLoungeDrum({
                type: 'rim',
                time: time,
                gain: 0.4 + (Math.random() * this.modulationParams.velocityMod),
                decay: 0.06,
                filterFreq: 3000 + (Math.random() * 300),
                resonance: 8 + (this.chaosLevel / 12)
            });
        }
        
        // Bossa conga
        if (this.getPatternValue('conga', step)) {
            this.playLoungeDrum({
                type: 'conga',
                time: time,
                baseFreq: 180,
                startFreq: 220,
                endFreq: 160,
                gain: 0.45 + (Math.random() * this.modulationParams.velocityMod),
                decay: 0.2 + (Math.random() * this.modulationParams.filterDecay * 0.1),
                filterFreq: 900 + (this.modulationParams.filterMod * 0.3)
            });
        }
        
        // Clave or woodblock
        if (this.getPatternValue('clave', step)) {
            this.playLoungeDrum({
                type: 'clave',
                time: time,
                baseFreq: 1800,
                gain: 0.3 + (Math.random() * this.modulationParams.velocityMod),
                decay: 0.15,
                filterFreq: 2000 + (Math.random() * this.modulationParams.filterMod * 0.2)
            });
        }
    }
    
    playLoungeDrum(options) {
        const { 
            type, time, baseFreq, startFreq, endFreq, gain, decay, 
            filterFreq, resonance = 1
        } = options;
        
        const actualGain = gain * this.volume * this.baseVolume;
        
        if (type === 'kick') {
            // Softer lounge kick drum
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(startFreq, time);
            osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.06);
            
            // Softer attack for lounge feel
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(actualGain, time + 0.005);
            gainNode.gain.linearRampToValueAtTime(actualGain * 0.7, time + 0.03);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(filterFreq * 3, time);
            filter.frequency.exponentialRampToValueAtTime(filterFreq, time + decay * 0.4);
            filter.Q.value = 1 + (this.chaosLevel / 50);
            
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
        else if (type === 'brushed') {
            // Brushed snare effect with mostly noise
            const brushGain = 0.9;
            
            // Create brushed sound with noise
            this.playBrushedNoise(time, {
                duration: decay,
                frequency: filterFreq,
                gain: actualGain * brushGain,
                type: 'bandpass',
                Q: 0.8 + (this.chaosLevel / 40)
            });
            
            playBrushedNoise(time, options) {
                // Special noise technique for jazz brush sounds
                const { duration = 0.1, frequency = 2000, gain = 0.1, type = 'bandpass', Q = 1 } = options;
                
                // Create a buffer of white noise
                const bufferSize = this.audioContext.sampleRate * duration;
                const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
                const data = buffer.getChannelData(0);
                
                // Fill with noise, but create brush-like patterns
                for (let i = 0; i < bufferSize; i++) {
                    // Create a brush-like envelope - more attack at start
                    const position = i / bufferSize;
                    let brushIntensity;
                    
                    if (position < 0.1) {
                        // Initial brush attack
                        brushIntensity = position * 10; // Quick ramp up
                    } else {
                        // Decay with some variations to simulate brush strokes
                        brushIntensity = 1 - (position - 0.1) * (1 / 0.9);
                        
                        // Add some random variations for brush texture
                        if (Math.random() < 0.1) {
                            brushIntensity *= 0.8 + Math.random() * 0.4;
                        }
                    }
                    
                    // Fill with shaped noise
                    data[i] = (Math.random() * 2 - 1) * brushIntensity;
                }
                
                // Create a buffer source
                const noiseSource = this.audioContext.createBufferSource();
                noiseSource.buffer = buffer;
                
                // Create a filter for brush tone
                const filter = this.audioContext.createBiquadFilter();
                filter.type = type;
                filter.frequency.value = frequency;
                filter.Q.value = Q;
                
                // Volume envelope for brush
                const gainNode = this.audioContext.createGain();
                gainNode.gain.setValueAtTime(0, time);
                gainNode.gain.linearRampToValueAtTime(gain, time + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
                
                // Connect
                noiseSource.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.gainNode);
                
                // Start and stop
                noiseSource.start(time);
                noiseSource.stop(time + duration);
                
                setTimeout(() => {
                    noiseSource.disconnect();
                    filter.disconnect();
                    gainNode.disconnect();
                }, (duration + 0.1) * 1000);
            }
            
            playLoungeDrum(options) {
                const { 
                    type, time, baseFreq, startFreq, endFreq, gain, decay, 
                    filterFreq, resonance = 1
                } = options;
                
                const actualGain = gain * this.volume * this.baseVolume;
                
                if (type === 'hihat') {
                    // Softer hi-hat with less harshness
                    this.playFilmNoise(time, {
                        duration: decay,
                        frequency: filterFreq + (Math.random() * 500 * (this.chaosLevel/100)),
                        gain: actualGain,
                        type: 'highpass',
                        Q: resonance
                    });
                    
                    // Add a subtle metallic component for realism
                    if (decay > 0.15) { // Only for open hats
                        const osc1 = this.audioContext.createOscillator();
                        const osc2 = this.audioContext.createOscillator();
                        const gainNode = this.audioContext.createGain();
                        
                        osc1.type = 'triangle'; // Softer waveform
                        osc1.frequency.value = 3500 + (Math.random() * 300);
                        
                        osc2.type = 'triangle';
                        osc2.frequency.value = 4200 + (Math.random() * 300);
                        
                        gainNode.gain.setValueAtTime(0, time);
                        gainNode.gain.linearRampToValueAtTime(actualGain * 0.03, time + 0.001);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay * 0.7);
                        
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
                    // Rim click for bossa nova
                    const osc = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    const filter = this.audioContext.createBiquadFilter();
                    
                    osc.type = 'triangle';
                    osc.frequency.value = 2000 + (Math.random() * 200);
                    
                    // Very short envelope for click sound
                    gainNode.gain.setValueAtTime(0, time);
                    gainNode.gain.linearRampToValueAtTime(actualGain, time + 0.001);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay);
                    
                    filter.type = 'bandpass';
                    filter.frequency.value = filterFreq;
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
                else if (type === 'conga') {
                    // Bossa-style conga
                    const osc = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    const filter = this.audioContext.createBiquadFilter();
                    
                    osc.type = 'sine';
                    if (startFreq && endFreq) {
                        osc.frequency.setValueAtTime(startFreq, time);
                        osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.08);
                    } else {
                        osc.frequency.value = baseFreq;
                    }
                    
                    // More natural conga envelope
                    gainNode.gain.setValueAtTime(0, time);
                    gainNode.gain.linearRampToValueAtTime(actualGain, time + 0.005);
                    gainNode.gain.exponentialRampToValueAtTime(actualGain * 0.3, time + 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay);
                    
                    filter.type = 'lowpass';
                    filter.frequency.value = filterFreq;
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
                else if (type === 'clave') {
                    // Wooden clave sound
                    const osc = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    const filter = this.audioContext.createBiquadFilter();
                    
                    osc.type = 'sine';
                    osc.frequency.value = baseFreq + (Math.random() * 50);
                    
                    // Short percussive envelope
                    gainNode.gain.setValueAtTime(0, time);
                    gainNode.gain.linearRampToValueAtTime(actualGain, time + 0.002);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay);
                    
                    filter.type = 'bandpass';
                    filter.frequency.value = filterFreq;
                    filter.Q.value = 8 + (this.chaosLevel / 20);
                    
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
            
            playFilmNoise(time, options) {
                // Gentler noise for jazz/lounge percussion
                const { duration = 0.1, frequency = 1000, gain = 0.1, type = 'bandpass', Q = 1 } = options;
                
                // Create noise buffer
                const bufferSize = this.audioContext.sampleRate * duration;
                const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
                const data = buffer.getChannelData(0);
                
                // Generate filtered noise
                let lastSample = 0;
                const filterAmount = 0.2; // Softer noise
                
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    // Apply simple 1-pole filter for colored noise
                    lastSample = (lastSample + white * filterAmount) / (1 + filterAmount);
                    data[i] = lastSample;
                }
                
                // Create source
                const noise = this.audioContext.createBufferSource();
                noise.buffer = buffer;
                
                // Filter chain
                const filter = this.audioContext.createBiquadFilter();
                filter.type = type;
                filter.frequency.value = frequency;
                filter.Q.value = Q;
                
                // Envelope
                const gainNode = this.audioContext.createGain();
                gainNode.gain.setValueAtTime(0, time);
                gainNode.gain.linearRampToValueAtTime(gain * 0.8, time + 0.005); // Softer attack
                gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
                
                // Connect
                noise.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.gainNode);
                
                // Play
                noise.start(time);
                noise.stop(time + duration);
                
                setTimeout(() => {
                    noise.disconnect();
                    filter.disconnect();
                    gainNode.disconnect();
                }, (duration + 0.1) * 1000);
            }
            
            playLoungeBass(step, time) {
                // Determine bass note pattern based on current step and section
                let bassNote;
                const currentBar = Math.floor(step / 16);
                const beatInBar = Math.floor(step / 4) % 4;
                
                // Choose bass pattern based on current section with smoother transitions
                const patternIndex = (currentBar % 4);
                const pattern = this.bassPatterns[patternIndex];
                
                // Get the note from the pattern
                if (pattern && pattern.length > 0) {
                    bassNote = pattern[beatInBar % pattern.length];
                } else {
                    // Fallback
                    bassNote = 'C2';
                }
                
                // Play the note with appropriate envelope
                this.playLoungeBassNote(bassNote, time, 0.5, 0.4);
            }
        
            playLoungeBassNote(note, time, duration, gain) {
                if (!this.notes[note]) return;
                
                const freq = this.notes[note];
                const actualGain = gain * this.volume * this.baseVolume;
                
                // Double bass sound with softer attack
                const osc = this.audioContext.createOscillator();
                
                // Smooth bass tone
                osc.type = 'triangle';
                
                // Slight detune for more organic feel
                const detune = (Math.random() * 8 - 4) * (1 + this.chaosLevel/150);
                osc.detune.value = detune;
                osc.frequency.value = freq;
                
                // Filter for upright bass tone
                const filter = this.audioContext.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 500 + (this.modulationParams.filterMod * 0.2);
                filter.Q.value = 1.5 + (this.chaosLevel / 80);
                
                // Slow attack for upright bass feel
                filter.frequency.setValueAtTime(filter.frequency.value * 0.7, time);
                filter.frequency.exponentialRampToValueAtTime(filter.frequency.value, time + 0.1);
                
                // Volume envelope - slower attack for finger style
                const gainNode = this.audioContext.createGain();
                gainNode.gain.setValueAtTime(0, time);
                gainNode.gain.linearRampToValueAtTime(actualGain * 0.5, time + 0.03);
                gainNode.gain.linearRampToValueAtTime(actualGain, time + 0.08);
                gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
                
                // Connect
                osc.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.gainNode);
                
                // Start and stop
                osc.start(time);
                osc.stop(time + duration + 0.1);
                
                // Clean up
                setTimeout(() => {
                    osc.disconnect();
                    filter.disconnect();
                    gainNode.disconnect();
                }, (duration + 0.2) * 1000);
            }
            
            playLoungeChord(step, time) {
                // Choose appropriate chord progression
                const currentBar = Math.floor(step / 16);
                const progressionIndex = currentBar % this.chordProgressions.length;
                const chordIndex = (Math.floor(step / 16) % 4);
                
                // Get chord notes
                const chordNotes = this.chordProgressions[progressionIndex][chordIndex];
                
                if (!chordNotes || chordNotes.length === 0) return;
                
                // Create Rhodes-like sound for chord
                const duration = 1.5 + (Math.random() * 0.5); // Longer sustained chords
                
                // Staggered timing for gentle arpeggio effect
                chordNotes.forEach((note, i) => {
                    const noteTime = time + (i * 0.02);
                    this.playRhodesNote(note, noteTime, duration, 0.12 - (i * 0.02));
                });
            }
        
            playRhodesNote(note, time, duration, gain) {
                if (!this.notes[note]) return;
                
                const freq = this.notes[note];
                const actualGain = gain * this.volume * this.baseVolume;
                
                // Create the oscillator bank for Rhodes-like tone
                const oscSine = this.audioContext.createOscillator();
                const oscTine = this.audioContext.createOscillator();
                
                // Rhodes has both sine fundamental and tine harmonics
                oscSine.type = 'sine';
                oscSine.frequency.value = freq;
                
                oscTine.type = 'triangle';
                oscTine.frequency.value = freq * 1.01; // Slight detune for beating
                oscTine.detune.value = 5 + (Math.random() * 5); // Additional detune
                
                // Create filter for the characteristic Rhodes tone
                const filter = this.audioContext.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 1200 + (this.modulationParams.filterMod * 0.5);
                filter.Q.value = 2 + (this.chaosLevel / 60);
                
                // Create chorus effect for Rhodes
                const chorus = this.createChorus();
                
                // Rhodes has a characteristic attack transient
                const attackGain = this.audioContext.createGain();
                attackGain.gain.setValueAtTime(actualGain * 1.5, time);
                attackGain.gain.exponentialRampToValueAtTime(actualGain * 0.2, time + 0.08);
                
                // Main envelope
                const sustainGain = this.audioContext.createGain();
                sustainGain.gain.setValueAtTime(0, time);
                sustainGain.gain.linearRampToValueAtTime(actualGain, time + 0.05);
                sustainGain.gain.setValueAtTime(actualGain, time + 0.05);
                sustainGain.gain.exponentialRampToValueAtTime(0.001, time + duration);
                
                // Mix oscillators with different weights
                const sineGain = this.audioContext.createGain();
                sineGain.gain.value = 0.6; // More fundamental
                
                const tineGain = this.audioContext.createGain();
                tineGain.gain.value = 0.4; // Less harmonic content
                
                // Connections for the attack portion
                oscSine.connect(attackGain);
                attackGain.connect(filter);
                
                // Connections for sustained portion
                oscSine.connect(sineGain);
                oscTine.connect(tineGain);
                sineGain.connect(sustainGain);
                tineGain.connect(sustainGain);
                sustainGain.connect(filter);
                
                // Apply chorus and connect to output
                filter.connect(chorus.input);
                chorus.output.connect(this.gainNode);
                
                // Start oscillators
                oscSine.start(time);
                oscTine.start(time);
                oscSine.stop(time + duration);
                oscTine.stop(time + duration);
                
                // Cleanup
                setTimeout(() => {
                    oscSine.disconnect();
                    oscTine.disconnect();
                    sineGain.disconnect();
                    tineGain.disconnect();
                    attackGain.disconnect();
                    sustainGain.disconnect();
                    filter.disconnect();
                    
                    // Stop the chorus LFO
                    chorus.lfo.stop();
                    chorus.lfo.disconnect();
                    chorus.lfoGain.disconnect();
                }, (duration + 0.2) * 1000);
            }
            
            playVibraphone(step, time) {
                // Get vibraphone pattern
                const patternIndex = Math.floor(step / 8) % this.vibratoPatterns.length;
                const pattern = this.vibratoPatterns[patternIndex];
                
                // Determine which note to play based on step
                const noteIndex = step % 8 % pattern.length;
                const note = pattern[noteIndex];
                
                if (!note) return;
                
                // Play vibraphone note with characteristic tremolo
                const duration = 0.6 + (Math.random() * 0.4);
                this.playVibesNote(note, time, duration, 0.2);
            }
        
            playVibesNote(note, time, duration, gain) {
                if (!this.notes[note]) return;
                
                const freq = this.notes[note];
                const actualGain = gain * this.volume * this.baseVolume;
                
                // Vibraphone oscillator
                const osc = this.audioContext.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                // Create tremolo effect with LFO
                const tremoloFreq = this.modulationParams.vibratoRate; // Vibrato speed
                const tremolo = this.audioContext.createOscillator();
                const tremoloGain = this.audioContext.createGain();
                
                tremolo.type = 'sine';
                tremolo.frequency.value = tremoloFreq;
                tremoloGain.gain.value = this.effectsParams.vibratoAmount; // Vibrato depth
                
                // Main gain node for envelope
                const gainNode = this.audioContext.createGain();
                
                // Characteristic vibraphone envelope - fast attack, sustain, gentle decay
                gainNode.gain.setValueAtTime(0, time);
                gainNode.gain.linearRampToValueAtTime(actualGain, time + 0.02);
                gainNode.gain.setValueAtTime(actualGain, time + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
                
                // Brightness filter
                const filter = this.audioContext.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 6000 + (this.modulationParams.filterMod * 0.3);
                filter.Q.value = 1 + (this.chaosLevel / 100);
                
                // Create connections for tremolo
                tremolo.connect(tremoloGain);
                tremoloGain.connect(gainNode.gain);
                
                // Main signal path
                osc.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.gainNode);
                
                // Start oscillators
                tremolo.start(time);
                osc.start(time);
                osc.stop(time + duration);
                tremolo.stop(time + duration);
                
                // Cleanup
                setTimeout(() => {
                    osc.disconnect();
                    tremolo.disconnect();
                    tremoloGain.disconnect();
                    filter.disconnect();
                    gainNode.disconnect();
                }, (duration + 0.2) * 1000);
            }
            
            playPianoFill(step, time) {
                // Create jazz piano fill using chord scale
                const currentBar = Math.floor(step / 16);
                const progressionIndex = currentBar % this.chordProgressions.length;
                const chordIndex = (Math.floor(step / 16) % 4);
                
                // Use chord notes as basis for fill
                const chordNotes = this.chordProgressions[progressionIndex][chordIndex];
                
                if (!chordNotes || chordNotes.length === 0) return;
                
                // Create a jazz fill pattern
                const numNotes = 3 + Math.floor(Math.random() * 3); // 3-5 notes
                const direction = Math.random() < 0.5 ? 1 : -1;     // Up or down
                
                // Start with a random chord tone
                let currentNote = chordNotes[Math.floor(Math.random() * chordNotes.length)];
                let duration = 0.15 + (Math.random() * 0.1);
                
                // Play notes in sequence
                for (let i = 0; i < numNotes; i++) {
                    // Get current note
                    const noteName = currentNote;
                    
                    // Calculate next note in sequence
                    if (noteName && this.notes[noteName]) {
                        // Play current note
                        this.playPianoNote(noteName, time + (i * duration), duration * 0.8, 0.15);
                        
                        // Find next note in scale
                        const currentScale = Object.values(this.musicalScales)[progressionIndex % Object.values(this.musicalScales).length];
                        const noteIndex = currentScale.indexOf(noteName);
                        
                        if (noteIndex !== -1) {
                            // Move to next note in scale
                            let nextIndex = (noteIndex + direction + currentScale.length) % currentScale.length;
                            currentNote = currentScale[nextIndex];
                        } else {
                            // If not in scale, choose random chord tone
                            currentNote = chordNotes[Math.floor(Math.random() * chordNotes.length)];
                        }
                    }
                }
            }
        
            playPianoNote(note, time, duration, gain) {
                if (!this.notes[note]) return;
                
                const freq = this.notes[note];
                const actualGain = gain * this.volume * this.baseVolume;
                
                // Create piano-like oscillator mix
                const oscString = this.audioContext.createOscillator();
                const oscHammer = this.audioContext.createOscillator();
                
                oscString.type = 'triangle';
                oscString.frequency.value = freq;
                
                oscHammer.type = 'sine';
                oscHammer.frequency.value = freq * 1.003; // Slight detune
                
                // Piano hammer attack
                const attackGain = this.audioContext.createGain();
                attackGain.gain.setValueAtTime(actualGain * 1.2, time);
                attackGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
                
                // Sustained piano tone
                const sustainGain = this.audioContext.createGain();
                sustainGain.gain.setValueAtTime(0, time);
                sustainGain.gain.linearRampToValueAtTime(actualGain * 0.8, time + 0.01);
                sustainGain.gain.exponentialRampToValueAtTime(0.001, time + duration);
                
                // Filter for piano tone
                const filter = this.audioContext.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 2500 + (this.modulationParams.filterMod * 0.3);
                filter.Q.value = 0.5;
                
                // Connect hammer attack sound
                oscHammer.connect(attackGain);
                attackGain.connect(this.gainNode);
                
                // Connect sustained string sound
                oscString.connect(sustainGain);
                sustainGain.connect(filter);
                filter.connect(this.gainNode);
                
                // Start oscillators
                oscString.start(time);
                oscHammer.start(time);
                oscString.stop(time + duration);
                oscHammer.stop(time + 0.1); // Hammer sound is shorter
                
                // Cleanup
                setTimeout(() => {
                    oscString.disconnect();
                    oscHammer.disconnect();
                    attackGain.disconnect();
                    sustainGain.disconnect();
                    filter.disconnect();
                }, (duration + 0.2) * 1000);
            }
            
            playGuitarAccent(step, time) {
                // Get current chord for guitar accent
                const currentBar = Math.floor(step / 16);
                const progressionIndex = currentBar % this.chordProgressions.length;
                const chordIndex = (Math.floor(step / 16) % 4);
                
                // Get chord notes
                const chordNotes = this.chordProgressions[progressionIndex][chordIndex];
                
                if (!chordNotes || chordNotes.length === 0) return;
                
                // Bossa nova guitar typically plays chord accents
                const duration = 0.18 + (Math.random() * 0.08);
                
                // Play a quick strum
                const strumSpread = 0.015; // 15ms between strings
                chordNotes.forEach((note, i) => {
                    const strumTime = time + (i * strumSpread);
                    this.playGuitarString(note, strumTime, duration, 0.1 - (i * 0.01));
                });
            }
        
            playGuitarString(note, time, duration, gain) {
                if (!this.notes[note]) return;
                
                const freq = this.notes[note];
                const actualGain = gain * this.volume * this.baseVolume;
                
                // Nylon string sound
                const osc = this.audioContext.createOscillator();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                
                // Add a subtle detune for realism
                const detune = (Math.random() * 6 - 3);
                osc.detune.value = detune;
                
                // String pluck envelope
                const gainNode = this.audioContext.createGain();
                gainNode.gain.setValueAtTime(0, time);
                gainNode.gain.linearRampToValueAtTime(actualGain * 1.2, time + 0.005); // Fast attack
                gainNode.gain.exponentialRampToValueAtTime(actualGain * 0.4, time + 0.04); // Quick initial decay
                gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration); // Sustain decay
                
                // Filter for nylon string tone
                const filter = this.audioContext.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 3000 + (Math.random() * 1000);
                filter.Q.value = 1;
                
                // String pluck has characteristic filter sweep
                filter.frequency.setValueAtTime(filter.frequency.value * 2, time);
                filter.frequency.exponentialRampToValueAtTime(filter.frequency.value * 0.7, time + 0.1);
                
                // Connect
                osc.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.gainNode);
                
                // Start and stop
                osc.start(time);
                osc.stop(time + duration);
                
                // Cleanup
                setTimeout(() => {
                    osc.disconnect();
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
                    const oldLevel = this.chaosLevel;
                    this.chaosLevel = level;
                    
                    // Only restart if actually playing and significant change
                    if (this.isPlaying && this.enabled && Math.abs(oldLevel - level) > 5) {
                        // Don't fully restart, just update parameters
                        this.updateModulationParams();
                    }
                }
            }
        
            setEnabled(enabled) {
                this.enabled = enabled;
                localStorage.setItem('loungeEnabled', enabled);
                
                if (this.gainNode) {
                    const now = this.audioContext ? this.audioContext.currentTime : 0;
                    this.gainNode.gain.cancelScheduledValues(now);
                    this.gainNode.gain.linearRampToValueAtTime(
                        enabled ? this.volume * this.baseVolume : 0,
                        now + 0.1
                    );
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
                localStorage.setItem('loungeVolume', value);
                if (this.gainNode) {
                    // Smooth transition for volume change
                    this.gainNode.gain.linearRampToValueAtTime(
                        value * this.baseVolume,
                        this.audioContext.currentTime + 0.1
                    );
                }
            }
        }
        
        export const loungeMusic = new LoungeMusic();