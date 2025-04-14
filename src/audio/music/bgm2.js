export class LoungeMusic {
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
        this.baseVolume = 0.13; // Reduced overall volume further
        this.volume = parseFloat(localStorage.getItem('musicVolume')) || 1.0;
        this.chaosLevel = 0;
        this.loopTimeout = null;
        this.currentTime = 0;
        this.nextScheduleTime = 0;
        this.scheduleAheadTime = 0.2;
        this.originalBpm = 88;
        this.baseBpm = 84; // Slightly slower initial tempo
        this.sequencerSteps = 16;
        this.currentStep = 0;
        this.enabled = localStorage.getItem('musicEnabled') !== 'false';
        this.lastChordTime = 0;

        // Separate patterns for Latin and hip-hop drums
        this.latinPatterns = {
            brush: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            clave: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
            shaker: [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1]
        };

        this.hipHopPatterns = {
            kick: [1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
        };

        // Volume controls for each drum set
        this.drumLevels = {
            latin: 1.0,
            hipHop: 5.0
        };

        // Add DFAM-style synthesis parameters
        this.dfamParams = {
            kickFreq: 60,
            kickDecay: 0.3,
            kickSweep: 0.08,
            snareNoiseFreq: 2000,
            snareOscFreq: 180,
            snareDecay: 0.2,
            snareMix: 0.7 // Mix between noise and osc for snare
        };

        // Jazz chords with extensions (7ths, 9ths, 13ths)
        this.jazzChords = {
            'Cmaj7': ['C3', 'E3', 'G3', 'B3'],
            'Cmaj9': ['C3', 'E3', 'G3', 'B3', 'D4'],
            'Dm7': ['D3', 'F3', 'A3', 'C4'],
            'Dm9': ['D3', 'F3', 'A3', 'C4', 'E4'],
            'Em7b5': ['E3', 'G3', 'Bb3', 'D4'],
            'G7': ['G2', 'B2', 'D3', 'F3'],
            'G13': ['G2', 'B2', 'D3', 'F3', 'E4'],
            'Am7': ['A2', 'C3', 'E3', 'G3'],
            'Am9': ['A2', 'C3', 'E3', 'G3', 'B3']
        };

        // Classic jazz progressions
        this.chordProgressions = [
            // ii-V-I in C
            [
                { chord: 'Dm7', duration: 2 },
                { chord: 'G7', duration: 2 },
                { chord: 'Cmaj7', duration: 4 }
            ],
            // Minor bossa progression
            [
                { chord: 'Am9', duration: 2 },
                { chord: 'Dm7', duration: 2 },
                { chord: 'G7', duration: 2 },
                { chord: 'Cmaj7', duration: 2 }
            ],
            // Extended jazz progression
            [
                { chord: 'Cmaj9', duration: 2 },
                { chord: 'Am7', duration: 2 },
                { chord: 'Dm7', duration: 2 },
                { chord: 'G13', duration: 2 }
            ]
        ];

        // Walking bass patterns
        this.bassPatterns = [
            // Basic walking bass
            ['C2', 'E2', 'G2', 'A2'],
            // Chromatic approach
            ['C2', 'B2', 'Bb2', 'A2'],
            // Scalar pattern
            ['C2', 'D2', 'E2', 'G2']
        ];

        // Add Latin jazz scale for melodies
        this.latinScale = ['C4', 'D4', 'Eb4', 'F4', 'G4', 'A4', 'Bb4', 'C5'];

        this.notes = {
            // Bass range
            'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
            'Bb2': 116.54, 'Eb2': 77.78,
            // Middle range
            'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
            'Bb3': 233.08, 'Eb3': 155.56,
            // Higher range for melodies
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
            'Bb4': 466.16, 'Eb4': 311.13,
            'C5': 523.25, 'D5': 587.33, 'Eb5': 622.25, 'F5': 698.46, 'G5': 783.99
        };

        // Piano voicing parameters
        this.pianoParams = {
            attack: 0.02,
            decay: 0.2,
            sustain: 0.7,
            release: 0.5,
            harmonics: [1.0, 0.6, 0.2, 0.05] // Harmonics ratios for rich piano tone
        };

        // Effects parameters
        this.effectsParams = {
            reverbTime: 2.5,
            reverbWet: 0.1,
            reverbDry: 0.7,
            chorusRate: 2.5,
            chorusDepth: 0.02,
            chorusWet: 0.3,
            delayTime: 0.3,
            delayFeedback: 0.2,
            delayWet: 0.1
        };
    }

    createPianoOscillator(freq) {
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Create multiple oscillators for rich piano tone
        const harmonics = [];
        this.pianoParams.harmonics.forEach((ratio, i) => {
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

    playPianoNote(note, time, duration, velocity = 1.0) {
        if (!this.notes[note]) return;

        const freq = this.notes[note];
        const { mainOsc, gainNode, harmonics } = this.createPianoOscillator(freq);
        
        // Apply ADSR envelope
        const now = time;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(velocity, now + this.pianoParams.attack);
        gainNode.gain.linearRampToValueAtTime(velocity * this.pianoParams.sustain, now + this.pianoParams.attack + this.pianoParams.decay);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        // Add subtle chorus for richness
        const chorus = this.createChorus();
        gainNode.connect(chorus.input);
        chorus.output.connect(this.gainNode);

        // Start all oscillators
        harmonics.forEach(({ osc }) => {
            osc.start(now);
            osc.stop(now + duration + this.pianoParams.release);
        });

        setTimeout(() => {
            harmonics.forEach(({ osc, gain }) => {
                osc.disconnect();
                gain.disconnect();
            });
            gainNode.disconnect();
            chorus.input.disconnect();
            chorus.output.disconnect();
        }, (duration + this.pianoParams.release + 0.1) * 1000);
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
        for (let i = 0; i < 3; i++) {
            const delay = this.audioContext.createDelay();
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            
            delay.delayTime.value = 0.03 + (i * 0.01);
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

    async preload() {
        if (this.isPreloaded) return;

        try {
            // Initialize audio context if needed
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.gainNode = this.audioContext.createGain();
                this.gainNode.gain.value = this.enabled ? this.volume * this.baseVolume : 0;

                // Initialize the audio chain
                const reverb = this.createReverb();
                const lowShelf = this.audioContext.createBiquadFilter();
                const highShelf = this.audioContext.createBiquadFilter();
                const compressor = this.audioContext.createDynamicsCompressor();

                // Set up EQ
                lowShelf.type = 'lowshelf';
                lowShelf.frequency.value = 250;
                lowShelf.gain.value = 3;

                highShelf.type = 'highshelf';
                highShelf.frequency.value = 8000;
                highShelf.gain.value = 2;

                // Set up compressor
                compressor.threshold.value = -18;
                compressor.knee.value = 12;
                compressor.ratio.value = 2.5;
                compressor.attack.value = 0.008;
                compressor.release.value = 0.2;

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

            this.isPreloaded = true;
        } catch (e) {
            console.warn('Error preloading lounge music system:', e);
            throw e; // Re-throw to be caught by the asset loader
        }
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Main gain node
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = this.enabled ? this.volume * this.baseVolume : 0;

            // Create reverb
            const reverb = this.createReverb();
            
            // Create EQ section
            const lowShelf = this.audioContext.createBiquadFilter();
            lowShelf.type = 'lowshelf';
            lowShelf.frequency.value = 250;
            lowShelf.gain.value = 3;

            const highShelf = this.audioContext.createBiquadFilter();
            highShelf.type = 'highshelf';
            highShelf.frequency.value = 8000;
            highShelf.gain.value = 2;

            // Create compressor for glue
            const compressor = this.audioContext.createDynamicsCompressor();
            compressor.threshold.value = -18;
            compressor.knee.value = 12;
            compressor.ratio.value = 2.5;
            compressor.attack.value = 0.008;
            compressor.release.value = 0.2;

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
        const stepDuration = 60 / this.baseBpm / 4; // Quarter note duration

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
        
        // If audio context exists and we have a gain node, update the volume immediately
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
            this.chaosLevel = level;
            
            if (this.audioContext && this.isPlaying) {
                const now = this.audioContext.currentTime;
                
                // Control hip-hop drums - only play when chaos is above 20
                if (level >= 20) {
                    this.drumLevels.hipHop = 5.0; // Full volume
                } else {
                    this.drumLevels.hipHop = 0; // Silent
                }

                // Adjust tempo based on chaos - gradually speed up
                this.baseBpm = this.originalBpm + (level * 0.002);
                
                // Adjust effects based on chaos level
                if (this.nodes) {
                    // More extreme EQ at higher chaos
                    this.nodes.lowShelf.frequency.linearRampToValueAtTime(
                        250 + (level * 2),
                        now + 0.1
                    );
                    this.nodes.highShelf.frequency.linearRampToValueAtTime(
                        8000 - (level * 30),
                        now + 0.1
                    );

                    // More compression at higher chaos
                    this.nodes.compressor.threshold.linearRampToValueAtTime(
                        -18 - (level / 4),
                        now + 0.1
                    );
                    this.nodes.compressor.ratio.linearRampToValueAtTime(
                        2.5 + (level / 20),
                        now + 0.1
                    );

                    // More reverb at higher chaos
                    this.nodes.reverb.wetGain.gain.linearRampToValueAtTime(
                        this.effectsParams.reverbWet + (level / 200),
                        now + 0.1
                    );
                }
            }
        }
    }

    playJazzChord(chordName, time, duration, velocity = 0.4) { // Reduced from 0.7
        const notes = this.jazzChords[chordName];
        if (!notes) return;

        // Stagger note timings slightly for more natural feel
        notes.forEach((note, i) => {
            const offset = i * 0.02;
            const noteVelocity = velocity * (1 - (i * 0.15)); // Steeper reduction for upper notes
            this.playPianoNote(note, time + offset, duration, noteVelocity);
        });
    }

    playWalkingBass(notes, time, duration, velocity = 0.5) { // Reduced from 0.8
        notes.forEach((note, i) => {
            const noteTime = time + (i * duration / notes.length);
            const noteDuration = (duration / notes.length) * 0.8;
            
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.value = this.notes[note];

            filter.type = 'lowpass';
            filter.frequency.value = 200; // Lower from 300 for warmer tone
            filter.Q.value = 1;

            gainNode.gain.setValueAtTime(0, noteTime);
            gainNode.gain.linearRampToValueAtTime(velocity * this.volume * this.baseVolume, noteTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, noteTime + noteDuration);

            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.gainNode);

            osc.start(noteTime);
            osc.stop(noteTime + noteDuration);

            setTimeout(() => {
                osc.disconnect();
                filter.disconnect();
                gainNode.disconnect();
            }, (noteTime - time + noteDuration + 0.1) * 1000);
        });
    }

    playBrushNoise(time, { frequency = 2000, gain = 0.15, duration = 0.1, type = 'bandpass', Q = 1 }) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Create more realistic brush sound
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
        filter.type = type;
        filter.frequency.value = frequency;
        filter.Q.value = Q;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(gain * this.volume * this.baseVolume, time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.gainNode);

        noiseSource.start(time);
        noiseSource.stop(time + duration);

        setTimeout(() => {
            noiseSource.disconnect();
            filter.disconnect();
            gainNode.disconnect();
        }, (duration + 0.1) * 1000);
    }

    playDfamKick(time, { gain = 1.2 } = {}) {
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        const softClipper = this.audioContext.createWaveShaper();

        // Add soft clipping for more aggressive kick
        function createSoftClipCurve() {
            const k = 5; // Adjust for desired amount of saturation
            const n_samples = 44100;
            const curve = new Float32Array(n_samples);
            for (let i = 0; i < n_samples; ++i) {
                const x = (i * 2) / n_samples - 1;
                curve[i] = Math.tanh(k * x);
            }
            return curve;
        }
        softClipper.curve = createSoftClipCurve();

        // Set up kick oscillator with more extreme pitch envelope
        osc.type = 'sine';
        osc.frequency.setValueAtTime(this.dfamParams.kickFreq * 1.5, time);
        osc.frequency.exponentialRampToValueAtTime(this.dfamParams.kickFreq * 0.08, time + this.dfamParams.kickSweep);

        // Enhanced filter envelope for more impact
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, time);
        filter.frequency.exponentialRampToValueAtTime(35, time + this.dfamParams.kickDecay);
        filter.Q.value = 3.5; // Higher resonance for more character

        // Punchier envelope
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(gain * this.volume * this.baseVolume * 1.2, time + 0.002);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + this.dfamParams.kickDecay);

        osc.connect(filter);
        filter.connect(softClipper);
        softClipper.connect(gainNode);
        gainNode.connect(this.gainNode);

        osc.start(time);
        osc.stop(time + this.dfamParams.kickDecay);

        setTimeout(() => {
            osc.disconnect();
            filter.disconnect();
            softClipper.disconnect();
            gainNode.disconnect();
        }, (this.dfamParams.kickDecay + 0.1) * 1000);
    }

    play909Snare(time, { bodyGain = 0.9, noiseGain = 0.7 } = {}) {
        // Create body tone with two oscillators for richer sound
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const oscGain1 = this.audioContext.createGain();
        const oscGain2 = this.audioContext.createGain();
        
        osc1.type = 'triangle';
        osc2.type = 'sine';
        osc1.frequency.value = this.dfamParams.snareOscFreq;
        osc2.frequency.value = this.dfamParams.snareOscFreq * 1.5;
        
        // Create enhanced noise for the snap
        const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.2, this.audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBuffer.length; i++) {
            noiseData[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        
        // Two bandpass filters in series for more focused snap
        const noiseFilter1 = this.audioContext.createBiquadFilter();
        const noiseFilter2 = this.audioContext.createBiquadFilter();
        
        noiseFilter1.type = 'bandpass';
        noiseFilter1.frequency.value = this.dfamParams.snareNoiseFreq;
        noiseFilter1.Q.value = 4;
        
        noiseFilter2.type = 'bandpass';
        noiseFilter2.frequency.value = this.dfamParams.snareNoiseFreq * 1.5;
        noiseFilter2.Q.value = 6;
        
        const noiseGainNode = this.audioContext.createGain();
        
        // Punchier envelopes
        oscGain1.gain.setValueAtTime(0, time);
        oscGain1.gain.linearRampToValueAtTime(bodyGain * this.volume * this.baseVolume, time + 0.002);
        oscGain1.gain.exponentialRampToValueAtTime(0.001, time + this.dfamParams.snareDecay * 0.7);
        
        oscGain2.gain.setValueAtTime(0, time);
        oscGain2.gain.linearRampToValueAtTime(bodyGain * 0.5 * this.volume * this.baseVolume, time + 0.002);
        oscGain2.gain.exponentialRampToValueAtTime(0.001, time + this.dfamParams.snareDecay * 0.5);
        
        noiseGainNode.gain.setValueAtTime(0, time);
        noiseGainNode.gain.linearRampToValueAtTime(noiseGain * this.volume * this.baseVolume, time + 0.001);
        noiseGainNode.gain.exponentialRampToValueAtTime(0.001, time + this.dfamParams.snareDecay);
        
        // Connect everything
        osc1.connect(oscGain1);
        osc2.connect(oscGain2);
        noise.connect(noiseFilter1);
        noiseFilter1.connect(noiseFilter2);
        noiseFilter2.connect(noiseGainNode);
        
        oscGain1.connect(this.gainNode);
        oscGain2.connect(this.gainNode);
        noiseGainNode.connect(this.gainNode);
        
        // Start all components
        osc1.start(time);
        osc2.start(time);
        noise.start(time);
        osc1.stop(time + this.dfamParams.snareDecay);
        osc2.stop(time + this.dfamParams.snareDecay);
        noise.stop(time + this.dfamParams.snareDecay * 1.2);
        
        setTimeout(() => {
            osc1.disconnect();
            osc2.disconnect();
            noise.disconnect();
            noiseFilter1.disconnect();
            noiseFilter2.disconnect();
            oscGain1.disconnect();
            oscGain2.disconnect();
            noiseGainNode.disconnect();
        }, (this.dfamParams.snareDecay * 1.2 + 0.1) * 1000);
    }

    scheduleNotes(step, time) {
        // Play hip-hop drums
        Object.entries(this.hipHopPatterns).forEach(([instrument, pattern]) => {
            if (pattern[step]) {
                switch (instrument) {
                    case 'kick':
                        this.playDfamKick(time, {
                            gain: 2.4 * this.drumLevels.hipHop
                        });
                        break;
                    case 'snare':
                        this.play909Snare(time, {
                            bodyGain: 1.8 * this.drumLevels.hipHop,
                            noiseGain: 1.4 * this.drumLevels.hipHop
                        });
                        break;
                }
            }
        });

        // Play Latin percussion
        Object.entries(this.latinPatterns).forEach(([instrument, pattern]) => {
            if (pattern[step]) {
                switch (instrument) {
                    case 'brush':
                        this.playBrushNoise(time, { 
                            frequency: 3000,
                            gain: 0.5 * this.drumLevels.latin,
                            duration: 0.15,
                            type: 'bandpass',
                            Q: 1.5
                        });
                        break;
                    case 'hihat':
                        this.playBrushNoise(time, {
                            frequency: 8000,
                            gain: 0.36 * this.drumLevels.latin,
                            duration: 0.08,
                            type: 'highpass',
                            Q: 2
                        });
                        break;
                    case 'shaker':
                        this.playBrushNoise(time, {
                            frequency: 6000,
                            gain: 0.3 * this.drumLevels.latin,
                            duration: 0.06,
                            type: 'bandpass',
                            Q: 3
                        });
                        break;
                }
            }
        });

        // Play chord progression with further reduced velocity
        if (step % 8 === 0) {
            const progressionIndex = Math.floor(step / 32) % this.chordProgressions.length;
            const progression = this.chordProgressions[progressionIndex];
            const chordIndex = (step / 8) % progression.length;
            const chord = progression[chordIndex];
            
            this.playJazzChord(chord.chord, time, (chord.duration * 60 / this.baseBpm), 0.4);

            const bassLine = this.bassPatterns[progressionIndex % this.bassPatterns.length];
            this.playWalkingBass(bassLine, time, (chord.duration * 60 / this.baseBpm), 0.5);
        }

        // Add even quieter melodic fills
        if (this.chaosLevel > 30 && step % 4 === 2 && Math.random() < this.chaosLevel / 200) {
            const scale = this.latinScale;
            const note = scale[Math.floor(Math.random() * scale.length)];
            this.playPianoNote(note, time, 0.1, 0.1); // Reduced from 0.3
        }
    }

    setDrumLevels(latinLevel, hipHopLevel) {
        this.drumLevels.latin = latinLevel;
        this.drumLevels.hipHop = hipHopLevel;
    }
}

export const loungeMusic = new LoungeMusic();