// D-Fault

export class MusicLoops {
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
        this.baseVolume = 0.135; // MUSIC GLOBAL VOLUME - restored to original value
        this.volume = parseFloat(localStorage.getItem('musicVolume')) || 1.0;
        this.chaosLevel = 0;
        this.loopTimeout = null;
        this.currentTime = 0;
        this.nextScheduleTime = 0;
        this.scheduleAheadTime = 0.2;
        this.baseBpm = 78; // Slightly slower base tempo for more groove
        this.sequencerSteps = 16; // More steps for a more intricate pattern
        
        // Sequencer patterns (16 steps) - more classic DFAM-like patterns
        this.patterns = {
            // More driving kick pattern
            kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
            // Snare on 2 and 4 (classic jazz)
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            // Syncopated hi-hats
            hihat: [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
            // Rim for jazz feel
            rim: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
            // Latin-inspired percussion elements
            conga: [0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
            cowbell: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0]
        };
        
        // Alternative patterns that get mixed in with more chaos
        this.altPatterns = {
            kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0],
            hihat: [1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
            rim: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
            conga: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0],
            cowbell: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0]
        };
        
        // DFAM-inspired synth settings
        this.synthParams = {
            waveforms: ['triangle', 'sawtooth', 'square'],
            filterTypes: ['lowpass', 'bandpass'],
            filterResonance: 10, // Higher resonance for more DFAM character
            baseCutoff: 800  // Higher base cutoff for brighter tone
        };
        
        // DFAM-inspired modulation parameters
        this.modulationParams = {
            pitchMod: 0,
            filterMod: 0,
            velocityMod: 0,
            timingMod: 0,
            // Added modulation destinations
            filterDecay: 0,
            noiseAmount: 0
        };
        
        // Expanded notes for jazz chords and bass lines
        this.notes = {
            'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
            'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
            'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
            
            // Jazz chord notes with flats and sharps
            'Eb2': 77.78, 'Bb2': 116.54, 'Ab2': 103.83, 'F#2': 92.50, 'Db3': 138.59,
            'Eb3': 155.56, 'F#3': 185.00, 'Ab3': 207.65, 'Bb3': 233.08, 'Db4': 277.18,
            'Eb4': 311.13, 'F#4': 369.99, 'Ab4': 415.30, 'Bb4': 466.16
        };

        // Load saved preferences
        this.enabled = localStorage.getItem('musicEnabled') === 'true';
        
        // Track current pattern variation for smooth transitions
        this.currentPatternMix = 0;

        this.musicalScales = {
            pentatonic: ['C3', 'Eb3', 'F3', 'G3', 'Bb3', 'C4', 'Eb4', 'F4', 'G4', 'Bb4'],
            dorian: ['C3', 'D3', 'Eb3', 'F3', 'G3', 'A3', 'Bb3', 'C4'],
            mixolydian: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3'],
            // Add blues scale for more variation
            blues: ['C3', 'Eb3', 'F3', 'F#3', 'G3', 'Bb3', 'C4']
        };

        // More melodic bass patterns
        this.bassPatterns = [
            // C minor pentatonic groove
            ['C2', 'G2', 'Eb2', 'G2'],
            // G mixolydian feel
            ['G2', 'D3', 'B2', 'G2'],
            // F dorian movement
            ['F2', 'C3', 'Bb2', 'F2'],
            // Eb lydian colors
            ['Eb2', 'Bb2', 'G2', 'F2']
        ];

        // Melodic accent notes (pentatonic-based)
        this.accentNotes = ['Eb4', 'F4', 'G4', 'Bb4', 'C5', 'Eb5'];
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

            // Initialize oscillator bank for music generation
            this.oscillatorBank = {
                sine: this.ctx.createOscillator(),
                triangle: this.ctx.createOscillator(),
                square: this.ctx.createOscillator(),
            };

            Object.entries(this.oscillatorBank).forEach(([type, osc]) => {
                osc.type = type;
            });

            this.isPreloaded = true;
        } catch (e) {
            console.warn('Error preloading music system:', e);
        }
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create a more complex signal chain for better sound
            this.gainNode = this.audioContext.createGain();
            
            // Add a master compressor for that "glued together" sound
            this.compressor = this.audioContext.createDynamicsCompressor();
            this.compressor.threshold.value = -24;
            this.compressor.knee.value = 10;
            this.compressor.ratio.value = 4;
            this.compressor.attack.value = 0.005;
            this.compressor.release.value = 0.25;
            
            // Add a subtle distortion for warmth (retro character)
            this.distortion = this.audioContext.createWaveShaper();
            function createDistortionCurve(amount) {
                const samples = 44100;
                const curve = new Float32Array(samples);
                const deg = Math.PI / 180;
                
                for (let i = 0; i < samples; ++i) {
                    const x = (i * 2) / samples - 1;
                    // Soft clipping curve for warm distortion
                    curve[i] = (3 + amount) * x * 0.5 * (1 - Math.abs(x) / 3);
                }
                return curve;
            }
            this.distortion.curve = createDistortionCurve(2);
            this.distortion.oversample = '4x';
            
            // EQ for better tone shaping
            this.lowShelf = this.audioContext.createBiquadFilter();
            this.lowShelf.type = 'lowshelf';
            this.lowShelf.frequency.value = 300;
            this.lowShelf.gain.value = 3; // Boost bass a bit
            
            this.highShelf = this.audioContext.createBiquadFilter();
            this.highShelf.type = 'highshelf';
            this.highShelf.frequency.value = 6000;
            this.highShelf.gain.value = 2; // Boost highs slightly
            
            // Signal chain
            this.gainNode.gain.value = this.enabled ? this.volume * this.baseVolume : 0;
            this.gainNode.connect(this.lowShelf);
            this.lowShelf.connect(this.highShelf);
            this.highShelf.connect(this.distortion);
            this.distortion.connect(this.compressor);
            this.compressor.connect(this.audioContext.destination);
        }
    }

    async ensureAudioContext() {
        if (!this.audioContext) {
            this.initAudio();
        }

        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log("Audio context resumed");
            } catch (e) {
                console.error("Failed to resume audio context:", e);
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
        
        // Calculate BPM based on chaos level (increases with chaos)
        const chaosBpmIncrease = Math.min(40, this.chaosLevel * 0.4); // Cap at +40 BPM
        const currentBpm = this.baseBpm + chaosBpmIncrease;
        const stepDuration = 60 / currentBpm / 4; // 16th notes
        
        // Schedule events until scheduleAheadTime
        while (this.nextStepTime < now + this.scheduleAheadTime) {
            this.scheduleNotes(this.currentStep, this.nextStepTime);
            
            // Apply chaos to timing (swing and randomization)
            // More swing at medium chaos, more random at high chaos
            let swingAmount = 0;
            if (this.chaosLevel < 80) {
                swingAmount = (this.currentStep % 2) * 0.12 * (0.5 + Math.min(50, this.chaosLevel)/100);
            }
            
            // Reduce timing randomization
            const randomTiming = (Math.random() * 0.02 - 0.01) * (Math.min(50, this.chaosLevel)/100);
            
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
        }, 25); // Check more frequently for tighter timing
    }

    scheduleNotes(step, time) {
        // Calculate modulation amounts based on chaos
        this.updateModulationParams();
        
        // Update pattern mix based on chaos level (smooth transition between patterns)
        const targetMix = Math.min(1, this.chaosLevel / 75); // Full alt patterns above chaos 75
        // Smoothly transition between patterns
        this.currentPatternMix = this.currentPatternMix * 0.95 + targetMix * 0.05;
        
        // DFAM-inspired sequencer approach
        this.playDrumSequencerStep(step, time);
        
        // Bass and synth elements
        if ((step % 4 === 0) || (this.chaosLevel > 40 && step % 8 === 2 && Math.random() < 0.6)) {
            this.playBassNote(step, time);
        }
        
        // Every 8 steps, add a jazz chord stab (more at higher chaos)
        if (step % 8 === 0 || (this.chaosLevel > 40 && step % 7 === 0 && Math.random() < 0.4)) {
            this.playChordStab(step, time);
        }
        
        // Add synth accent notes for more melodic interest at high chaos
        if (this.chaosLevel > 60 && (step % 4 === 2 || step % 8 === 6)) {
            this.playSynthAccent(step, time);
        }
        
        // On high chaos levels, add glitchy percussion fills
        if (this.chaosLevel > 50 && Math.random() < this.chaosLevel/200) {
            this.playGlitchFill(time);
        }
    }
    
    updateModulationParams() {
        // Modulate all parameters based on chaos level
        const chaos = this.chaosLevel / 100;
        
        this.modulationParams = {
            // Basic DFAM parameters
            pitchMod: chaos * 36, // Up to 3 octaves of pitch variation
            filterMod: 800 + (chaos * 3000), // Filter cutoff modulation
            velocityMod: 0.2 + (chaos * 0.7), // Velocity/volume variation
            timingMod: chaos * 0.2, // Timing randomization
            
            // Extended parameters
            filterDecay: 0.2 + (chaos * 0.8), // Slower filter decays at high chaos
            noiseAmount: chaos * 0.3, // Add noise for grit at high chaos
            resonanceMod: 5 + (chaos * 15) // Filter resonance increases with chaos
        };
    }
    
    getPatternValue(instrument, step) {
        // Blend between regular and alternative patterns based on chaos
        const regularVal = this.patterns[instrument][step];
        const altVal = this.altPatterns[instrument][step];
        
        // Probabilistic mixing of patterns
        if (Math.random() < this.currentPatternMix) {
            return altVal;
        }
        return regularVal;
    }
    
    playDrumSequencerStep(step, time) {
        // Play drum sounds based on sequence patterns with pattern mixing
        if (this.getPatternValue('kick', step)) {
            // DFAM-style kick - frequency modulated sine with filter envelope
            this.playDrumSound({
                type: 'kick',
                time: time,
                baseFreq: 40, // Lower frequency for deeper kick
                startFreq: 200, // Higher start frequency for more punch
                endFreq: 35,  // Lower end frequency for more boom
                gain: 1.0 + (Math.random() * this.modulationParams.velocityMod),
                decay: 0.3 + (Math.random() * this.modulationParams.filterDecay * 0.2),
                filterFreq: 100 + (this.modulationParams.filterMod * 0.4)
            });
        }
        
        if (this.getPatternValue('snare', step)) {
            // Snare with noise and oscillator components - more DFAM-like
            this.playDrumSound({
                type: 'snare',
                time: time,
                gain: 0.8 + (Math.random() * this.modulationParams.velocityMod),
                decay: 0.12 + (Math.random() * this.modulationParams.filterDecay * 0.1),
                filterFreq: 1200 + (this.modulationParams.filterMod * 0.6)
            });
        }
        
        if (this.getPatternValue('hihat', step)) {
            // Hi-hat with filtered noise - more variation in open/closed
            const openProbability = 0.2 + (this.chaosLevel / 300); // More open hats at higher chaos
            const isOpen = step % 4 === 2 || Math.random() < openProbability;
            
            this.playDrumSound({
                type: 'hihat',
                time: time,
                gain: 0.3 + (Math.random() * this.modulationParams.velocityMod * 0.4),
                decay: isOpen ? 0.25 : 0.06,
                filterFreq: 6000 + (this.modulationParams.filterMod * 0.8),
                resonance: 3 + (this.chaosLevel / 20)
            });
        }
        
        if (this.getPatternValue('rim', step)) {
            // Rim shot with band-passed noise - more moog-like
            this.playDrumSound({
                type: 'rim',
                time: time,
                gain: 0.5 + (Math.random() * this.modulationParams.velocityMod),
                decay: 0.04,
                filterFreq: 2500 + (Math.random() * 500),
                resonance: 12 + (this.chaosLevel / 8)
            });
        }
        
        if (this.getPatternValue('conga', step)) {
            // DFAM-style conga with frequency modulation
            this.playDrumSound({
                type: 'conga',
                time: time,
                baseFreq: 200,
                startFreq: 280,
                endFreq: 180,
                gain: 0.5 + (Math.random() * this.modulationParams.velocityMod),
                decay: 0.15 + (Math.random() * this.modulationParams.filterDecay * 0.1),
                filterFreq: 800 + (this.modulationParams.filterMod * 0.4)
            });
        }
        
        if (this.getPatternValue('cowbell', step)) {
            // Retro synth cowbell
            this.playDrumSound({
                type: 'cowbell',
                time: time,
                baseFreq: 800,
                gain: 0.35 + (Math.random() * this.modulationParams.velocityMod),
                decay: 0.2,
                filterFreq: 1200 + (Math.random() * this.modulationParams.filterMod * 0.3)
            });
        }
    }
    
    playDrumSound(options) {
        const { 
            type, time, baseFreq, startFreq, endFreq, gain, decay, 
            filterFreq, resonance = 1
        } = options;
        
        const actualGain = gain * this.volume * this.baseVolume;
        
        if (type === 'kick') {
            // DFAM-style kick drum with more complex envelope
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            // Add slight noise component for more analog character
            if (this.modulationParams.noiseAmount > 0) {
                this.playNoiseHit(time, {
                    duration: decay * 0.5,
                    frequency: 100,
                    gain: actualGain * 0.1 * this.modulationParams.noiseAmount,
                    type: 'lowpass',
                    Q: 1
                });
            }
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(startFreq, time);
            osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.08);
            
            // More complex attack envelope for punchier kick
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(actualGain, time + 0.003);
            gainNode.gain.linearRampToValueAtTime(actualGain * 0.8, time + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(filterFreq * 5, time);
            filter.frequency.exponentialRampToValueAtTime(filterFreq, time + decay * 0.5);
            filter.Q.value = 1 + (this.chaosLevel / 40);
            
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
            // Noise component with more complex envelope
            const noiseGain = 0.8 + (this.chaosLevel / 300);
            this.playNoiseHit(time, {
                duration: decay,
                frequency: filterFreq,
                gain: actualGain * noiseGain,
                type: 'bandpass',
                Q: 1.5 + (this.chaosLevel / 25)
            });
            
            // Tone component
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'triangle';
            osc.frequency.value = 180 + (Math.random() * this.modulationParams.pitchMod);
            
            // DFAM-style envelope with better attack
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(actualGain * 0.6, time + 0.003);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay * 0.6);
            
            filter.type = 'bandpass';
            filter.frequency.value = filterFreq * 0.6;
            filter.Q.value = 1.5 + (this.chaosLevel / 30);
            
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
        else if (type === 'hihat') {
            // Hi-hat with filtered noise and resonance
            const hihatResonance = resonance + (Math.random() * this.modulationParams.resonanceMod * 0.2);
            
            this.playNoiseHit(time, {
                duration: decay,
                frequency: filterFreq + (Math.random() * 1000 * (this.chaosLevel/100)),
                gain: actualGain,
                type: 'highpass',
                Q: hihatResonance
            });
            
            // Add a metallic component for more realism
            if (decay > 0.1) { // Only for open hats
                const osc1 = this.audioContext.createOscillator();
                const osc2 = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                osc1.type = 'square';
                osc1.frequency.value = 3000 + (Math.random() * 500);
                
                osc2.type = 'square';
                osc2.frequency.value = 4000 + (Math.random() * 500);
                
                gainNode.gain.setValueAtTime(0, time);
                gainNode.gain.linearRampToValueAtTime(actualGain * 0.05, time + 0.005);
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
            // Rim shot with tight bandpass and slight pitch modulation
            this.playNoiseHit(time, {
                duration: decay,
                frequency: filterFreq + (Math.random() * 500 * (this.chaosLevel/100)),
                gain: actualGain,
                type: 'bandpass',
                Q: resonance
            });
            
            // Add a pitched component for more moog-like character
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = 1200 + (Math.random() * this.modulationParams.pitchMod * 0.5);
            
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(actualGain * 0.2, time + 0.001);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay);
            
            osc.connect(gainNode);
            gainNode.connect(this.gainNode);
            
            osc.start(time);
            osc.stop(time + decay);
            
            setTimeout(() => {
                osc.disconnect();
                gainNode.disconnect();
            }, decay * 1000);
        }
        else if (type === 'conga') {
            // DFAM-style conga with frequency modulation
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'sine';
            // More extreme pitch envelope for DFAM character
            if (startFreq && endFreq) {
                osc.frequency.setValueAtTime(startFreq, time);
                osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.07);
            } else {
                osc.frequency.value = baseFreq;
            }
            
            // DFAM-style envelope
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(actualGain, time + 0.001);
            gainNode.gain.linearRampToValueAtTime(actualGain * 0.7, time + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay);
            
            // More resonant filter for DFAM character
            filter.type = 'bandpass';
            filter.frequency.value = filterFreq;
            filter.Q.value = 3 + (this.chaosLevel / 20);
            
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
        else if (type === 'cowbell') {
            // Retro synth cowbell with two oscillators
            const osc1 = this.audioContext.createOscillator();
            const osc2 = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc1.type = 'square';
            osc1.frequency.value = baseFreq;
            
            osc2.type = 'square';
            osc2.frequency.value = baseFreq * 1.5 + (Math.random() * 50);
            
            // Sharper attack for more percussive sound
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(actualGain, time + 0.001);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay);
            
            // More resonant filter for more character
            filter.type = 'bandpass';
            filter.frequency.value = filterFreq;
            filter.Q.value = 4 + (this.chaosLevel / 25);
            
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
    }
    
    playBassNote(step, time) {
        // Use fixed patterns at low chaos, gradually introduce variations
        const basePatterns = [
            // Funky groove pattern
            ['C2', 'G2', 'Bb2', 'G2'],
            // Walking bass pattern
            ['C2', 'Eb2', 'F2', 'G2'],
            // Syncopated pattern
            ['C2', 'C2', 'G2', 'Bb2']
        ];

        let bassNote;
        if (this.chaosLevel < 40) {
            // Use fixed patterns for stable groove
            const patternIndex = Math.floor(step / 16) % basePatterns.length;
            const pattern = basePatterns[patternIndex];
            bassNote = pattern[step % 4];
        } else if (this.chaosLevel < 60) {
            // Use existing pattern logic
        } else {
            // More structured variation at high chaos
            const scale = this.musicalScales.pentatonic;
            const rootNotes = ['C2', 'G2', 'F2'];
            const rootNote = rootNotes[Math.floor(step / 8) % rootNotes.length];
            
            // Stay closer to pattern even at high chaos
            if (step % 8 < 6) {
                bassNote = rootNote;
            } else {
                // Occasional variation but more controlled
                const altNote = scale[Math.floor(step/2) % scale.length].replace('3', '2');
                bassNote = Math.random() < 0.6 ? rootNote : altNote;
            }
        }
        
        // Play the note with funky envelope
        this.playMoogBass(bassNote, time, 0.4, 0.5);
    }

    playMoogBass(note, time, duration, gain) {
        if (!this.notes[note]) return;
        
        const freq = this.notes[note];
        const actualGain = gain * this.volume * this.baseVolume * 0.55; //  bass
        
        // DFAM-style oscillator with richer harmonics
        const osc = this.audioContext.createOscillator();
        
        // More variation in waveforms at higher chaos
        osc.type = this.synthParams.waveforms[
            Math.floor(Math.random() * this.synthParams.waveforms.length)
        ];
        
        // Add slight detuning for analog feel
        const detune = (Math.random() * 15 - 7.5) * (1 + this.chaosLevel/80);
        osc.detune.value = detune;
        
        // Base frequency
        osc.frequency.value = freq;
        
        // Envelope generator for filter - key DFAM sound component
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = this.synthParams.filterResonance + (Math.random() * this.chaosLevel/15);
        
        // Filter envelope - critical for that DFAM sound
        const cutoffStart = this.synthParams.baseCutoff * 4;
        const cutoffEnd = this.synthParams.baseCutoff * 0.7 + (this.modulationParams.filterMod);
        
        filter.frequency.setValueAtTime(cutoffStart, time);
        filter.frequency.exponentialRampToValueAtTime(cutoffEnd, time + 0.15);
        
        // Volume envelope with more complex shape
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(actualGain, time + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(actualGain * 0.7, time + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        // Add a slight touch of distortion for grit at high chaos levels
        if (this.chaosLevel > 60) {
            const distortion = this.audioContext.createWaveShaper();
            function makeDistortionCurve(amount) {
                const k = amount;
                const n_samples = 44100;
                const curve = new Float32Array(n_samples);
                
                for (let i = 0; i < n_samples; ++i) {
                    const x = i * 2 / n_samples - 1;
                    curve[i] = (3 + k) * x * 0.5 * (1 - Math.abs(x)) / (3 + k * Math.abs(x));
                }
                return curve;
            }
            
            const distAmount = 0.2 + (this.chaosLevel / 500);
            distortion.curve = makeDistortionCurve(distAmount);
            distortion.oversample = '4x';
            
            // Connect with distortion
            osc.connect(filter);
            filter.connect(distortion);
            distortion.connect(gainNode);
            gainNode.connect(this.gainNode);
            
            setTimeout(() => {
                distortion.disconnect();
            }, (duration + 0.2) * 1000);
        } else {
            // Standard connection
            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.gainNode);
        }
        
        // Start and stop the note
        osc.start(time);
        osc.stop(time + duration + 0.1);
        
        // Clean up
        setTimeout(() => {
            osc.disconnect();
            filter.disconnect();
            gainNode.disconnect();
        }, (duration + 0.2) * 1000);
    }
    
    playChordStab(step, time) {
        // Jazz chord progressions
        const jazzProgressions = [
            // Minor 7th based progression
            [['C3', 'Eb3', 'G3', 'Bb3'], ['F3', 'Ab3', 'C4', 'Eb4']],
            // Minor 9th variations
            [['C3', 'Eb3', 'G3', 'D4'], ['G3', 'Bb3', 'D4', 'F4']]
        ];

        let chordNotes = [];  // Initialize as empty array
        if (this.chaosLevel < 50) {
            // Use fixed jazz progressions
            const progIndex = Math.floor(step / 8) % jazzProgressions.length;
            const chordIndex = (step / 4) % 2;
            chordNotes = jazzProgressions[progIndex][chordIndex] || [];  // Fallback to empty array
        } else {
            // Generate chord but maintain jazz feel
            const scale = this.musicalScales.pentatonic;
            const baseIndex = (step + Math.floor(this.chaosLevel / 25)) % scale.length;
            
            // Build jazz-like voicing
            const intervals = [0, 2, 4, 6]; // Minor 7th-like structure
            intervals.forEach(interval => {
                const noteIndex = (baseIndex + interval) % scale.length;
                const note = scale[noteIndex];
                if (note) chordNotes.push(note);  // Only add valid notes
            });
        }
        
        // Only proceed if we have notes to play
        if (chordNotes.length > 0) {
            const duration = 0.2 + (Math.random() * 0.1);
            
            // Arpeggiate with swing feel
            chordNotes.forEach((note, i) => {
                const swingOffset = i % 2 === 1 ? 0.03 : 0;
                const noteTime = time + (i * 0.02) + swingOffset;
                this.playChordNote(note, noteTime, duration, 0.15);
            });
        }
    }

    playChordNote(note, time, duration, gain) {
        if (!this.notes[note]) return;
        
        const freq = this.notes[note];
        const actualGain = gain * this.volume * this.baseVolume;
        
        // Jazz chord synth tone with DFAM-like filtering
        const osc = this.audioContext.createOscillator();
        
        // Slight waveform variation at higher chaos levels
        if (this.chaosLevel > 60 && Math.random() < 0.4) {
            osc.type = 'sawtooth';
        } else {
            osc.type = 'triangle'; // Softer waveform for chords
        }
        
        // Slight detuning for analog feel
        const detune = (Math.random() * 12 - 6) * (1 + this.chaosLevel/120);
        osc.detune.value = detune;
        osc.frequency.value = freq;
        
        // Filter for warmer tone with DFAM-like modulation
        const filter = this.audioContext.createBiquadFilter();
        filter.type = this.chaosLevel > 50 && Math.random() < 0.3 ? 'bandpass' : 'lowpass';
        filter.frequency.value = 1200 + (Math.random() * this.modulationParams.filterMod);
        filter.Q.value = 1 + (this.chaosLevel / 40);
        
        // DFAM-style envelope with filter modulation
        filter.frequency.setValueAtTime(filter.frequency.value * 2, time);
        filter.frequency.exponentialRampToValueAtTime(filter.frequency.value * 0.7, time + duration * 0.8);
        
        // Volume envelope - fast attack, medium decay
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(actualGain, time + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        // Connect everything
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
    
    playSynthAccent(step, time) {
        const scale = this.chaosLevel > 70 ? 
            this.musicalScales.blues : 
            this.musicalScales.pentatonic;
        
        // Create melodic movement based on step
        const baseIndex = (step * 2 + Math.floor(this.chaosLevel / 20)) % scale.length;
        const note = scale[baseIndex];
        
        if (!this.notes[note]) return;
        
        const freq = this.notes[note];
        const actualGain = 0.25 * this.volume * this.baseVolume;
        const duration = 0.15 + (Math.random() * 0.2);
        
        // DFAM-style accent with random waveform
        const osc = this.audioContext.createOscillator();
        osc.type = this.synthParams.waveforms[
            Math.floor(Math.random() * this.synthParams.waveforms.length)
        ];
        
        // Slight random detuning
        const detune = (Math.random() * 20 - 10) * (1 + this.chaosLevel/100);
        osc.detune.value = detune;
        osc.frequency.value = freq;
        
        // Filter with high resonance for that Moog accent sound
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = freq * 2;
        filter.Q.value = 8 + (Math.random() * this.modulationParams.resonanceMod);
        
        filter.frequency.setValueAtTime(filter.frequency.value * 1.5, time);
        filter.frequency.exponentialRampToValueAtTime(filter.frequency.value * 0.6, time + duration);
        
        // Sharp volume envelope
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(actualGain, time + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        // Connect everything
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        // Start and stop
        osc.start(time);
        osc.stop(time + duration);
        
        // Clean up
        setTimeout(() => {
            osc.disconnect();
            filter.disconnect();
            gainNode.disconnect();
        }, (duration + 0.1) * 1000);
    }
    
    playGlitchFill(time) {
        // Add glitchy fills on high chaos levels with DFAM-like character
        const numHits = 3 + Math.floor(Math.random() * 8 * (this.chaosLevel/100));
        const totalDuration = 0.3 + (Math.random() * 0.4);
        
        for (let i = 0; i < numHits; i++) {
            const hitTime = time + (i * totalDuration / numHits);
            
            // Random frequency range based on DFAM-like ranges
            let freq;
            const freqType = Math.random();
            
            if (freqType < 0.3) {
                // Low range - bass hits
                freq = 80 + (Math.random() * 200);
            } else if (freqType < 0.7) {
                // Mid range - percussive hits
                freq = 500 + (Math.random() * 2000);
            } else {
                // High range - zaps and blips
                freq = 3000 + (Math.random() * 5000);
            }
            
            const duration = 0.03 + (Math.random() * 0.1);
            const resonance = 10 + (Math.random() * 30);
            
            // More extreme filtering for DFAM-like character
            this.playNoiseHit(hitTime, {
                duration: duration,
                frequency: freq,
                gain: 0.35 * this.volume * this.baseVolume,
                type: Math.random() < 0.5 ? 'bandpass' : 'highpass',
                Q: resonance
            });
            
            // Sometimes add pitched component too for more interest
            if (Math.random() < 0.4) {
                const osc = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                osc.type = Math.random() < 0.5 ? 'sawtooth' : 'square';
                osc.frequency.value = freq * 0.5;
                
                gainNode.gain.setValueAtTime(0, hitTime);
                gainNode.gain.linearRampToValueAtTime(0.2 * this.volume * this.baseVolume, hitTime + 0.002);
                gainNode.gain.exponentialRampToValueAtTime(0.001, hitTime + duration);
                
                osc.connect(gainNode);
                gainNode.connect(this.gainNode);
                
                osc.start(hitTime);
                osc.stop(hitTime + duration);
                
                setTimeout(() => {
                    osc.disconnect();
                    gainNode.disconnect();
                }, duration * 1000 + 100);
            }
        }
    }

    createNoiseBuffer(duration) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // DFAM-like colored noise (slightly filtered)
        let lastOutput = 0;
        const colorFactor = 0.2 + (this.chaosLevel / 300); // More colored at higher chaos
        
        for (let i = 0; i < bufferSize; ++i) {
            const white = Math.random() * 2 - 1;
            // Simple 1-pole low-pass filter for colored noise
            lastOutput = (lastOutput + (white * colorFactor)) / (1 + colorFactor);
            data[i] = lastOutput * 3; // Boost amplitude
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
        
        // More DFAM-like filter modulation
        if (this.chaosLevel > 30) {
            filter.frequency.setValueAtTime(frequency * 1.5, startTime);
            filter.frequency.exponentialRampToValueAtTime(
                frequency * 0.7, 
                startTime + duration * 0.8
            );
        }
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
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
        localStorage.setItem('musicEnabled', enabled);
        
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
        localStorage.setItem('musicVolume', value);
        if (this.gainNode) {
            // Smooth transition for volume change
            this.gainNode.gain.linearRampToValueAtTime(
                value * this.baseVolume,
                this.audioContext.currentTime + 0.1
            );
        }
    }
}

export const musicLoops = new MusicLoops();