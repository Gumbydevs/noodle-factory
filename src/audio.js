export class GameSounds {
    constructor() {
        this.ctx = null;
        this.gainNode = null;
        this.isInitialized = false;
        
        // Load saved preferences
        const sfxEnabled = localStorage.getItem('sfxEnabled') !== 'false';
        this.volume = sfxEnabled ? 0.8 : 0;
        
        // Add touch event listeners for mobile
        ['touchstart', 'click'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                if (!this.isInitialized) {
                    this.initAudio();
                }
            }, { once: true });
        });

        this.chatterInterval = null;
        this.lastChatterTime = 0;
        this.startRandomChatter();
    }

    initAudio() {
        try {
            // Resume audio context for mobile
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }

            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                this.gainNode = this.ctx.createGain();
                this.gainNode.connect(this.ctx.destination);
                this.gainNode.gain.value = this.volume;
            }
            
            this.isInitialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    // Add this method to ensure audio context is ready
    ensureAudioContext() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        if (!this.isInitialized) {
            this.initAudio();
        }
    }

    createEnvelope(gainNode, attackTime = 0.01, decayTime = 0.1, sustainLevel = 0.7, releaseTime = 0.1) {
        const now = this.ctx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(1, now + attackTime);
        gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        return now + attackTime + decayTime + releaseTime;
    }

    playCardSound(volumeMultiplier = 1) {
        this.ensureAudioContext();
        if (!this.ctx) return;
        try {
            const mainGain = this.ctx.createGain();
            const beepGain = this.ctx.createGain();
            const noiseGain = this.ctx.createGain();
            
            // Multiply base volume by the volume multiplier
            mainGain.gain.value = 1.2 * volumeMultiplier;
            
            // Add frequency variation
            const freqVariation = 1 + (Math.random() * 0.2 - 0.1); // ±10% variation

            // Create noise buffer for card swoosh with slight variations
            const bufferSize = this.ctx.sampleRate * (0.08 + Math.random() * 0.04); // 80-120ms noise
            const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            // Generate noise with randomized curve
            for (let i = 0; i < bufferSize; i++) {
                const t = i / bufferSize;
                // Increased decay rate and lower initial amplitude
                const envelope = Math.pow(1 - t, 4) * Math.exp(-12 * t); // More aggressive decay
                output[i] = (Math.random() * 2 - 1) * envelope * 1.0; // Reduced amplitude
            }

            // Create and setup noise source with variations
            const noiseSource = this.ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.playbackRate.value = 0.9 + Math.random() * 0.2; // Vary speed

            // Create filter for swoosh sound with variations
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 2000 * freqVariation;
            filter.Q.value = 1.5;

            // Setup beep oscillators with variations
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            osc1.type = 'triangle';
            osc2.type = 'sine';
            osc1.frequency.value = 440 * freqVariation;
            osc2.frequency.value = 880 * freqVariation;

            // Connect paths
            noiseSource.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(mainGain);
            noiseGain.gain.value = 0.8;

            osc1.connect(beepGain);
            osc2.connect(beepGain);
            beepGain.connect(mainGain);
            beepGain.gain.value = 0.03; // Lower this value from 0.2 to reduce just the beep sound when drawing cards
            
            mainGain.connect(this.gainNode);

            const now = this.ctx.currentTime;
            const endTime = this.createEnvelope(mainGain, 0.005, 0.1, 0.3, 0.1);

            noiseSource.start(now);
            osc1.start(now);
            osc2.start(now);

            noiseSource.stop(now + 0.1);
            osc1.stop(endTime);
            osc2.stop(endTime);

            setTimeout(() => mainGain.disconnect(), endTime * 1000);
        } catch (e) {
            console.warn('Error playing card sound:', e);
        }
    }

    playDrawCardsSound() {
        this.ensureAudioContext();
        if (!this.ctx) return;
        try {
            const mainGain = this.ctx.createGain();
            mainGain.gain.value = 0.03; // Increase volume for draw sound
            
            // Play two card sounds with variations
            const delay = 0.08 + (Math.random() * 0.04); // Random delay between cards
            this.playCardSound();
            setTimeout(() => this.playCardSound(), delay * 1000);

            // Add extra swoosh effect for card draw
            const swooshGain = this.ctx.createGain();
            const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            for (let i = 0; i < noiseBuffer.length; i++) {
                const t = i / noiseBuffer.length;
                const envelope = Math.pow(1 - t, 3);
                output[i] = (Math.random() * 2 - 1) * envelope;
            }

            const noiseSource = this.ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            noiseSource.playbackRate.value = 0.8 + Math.random() * 0.4;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1500 + Math.random() * 1000;
            filter.Q.value = 2;

            noiseSource.connect(filter);
            filter.connect(swooshGain);
            swooshGain.connect(mainGain);
            mainGain.connect(this.gainNode);

            const now = this.ctx.currentTime;
            swooshGain.gain.setValueAtTime(0, now);
            swooshGain.gain.linearRampToValueAtTime(0.4, now + 0.05);
            swooshGain.gain.linearRampToValueAtTime(0, now + 0.2);

            noiseSource.start(now);
            noiseSource.stop(now + 0.2);

            setTimeout(() => mainGain.disconnect(), 300);
        } catch (e) {
            console.warn('Error playing draw cards sound:', e);
        }
    }

    playChaosSound() {
        this.ensureAudioContext();
        if (!this.ctx) return;
        try {
            const gainNode = this.ctx.createGain();
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();

            // Create a sweeping chaos effect
            osc.type = 'sawtooth';
            osc.frequency.value = 100;
            
            // Add filter sweep
            filter.type = 'bandpass';
            filter.frequency.value = 1000;
            filter.Q.value = 10;

            // Modulate filter frequency
            filter.frequency.linearRampToValueAtTime(3000, this.ctx.currentTime + 0.3);

            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.gainNode);

            const endTime = this.createEnvelope(gainNode, 0.05, 0.2, 0.4, 0.1);

            osc.start();
            osc.frequency.linearRampToValueAtTime(200, endTime);
            osc.stop(endTime);

            setTimeout(() => gainNode.disconnect(), endTime * 1000);
        } catch (e) {
            console.warn('Error playing chaos sound:', e);
        }
    }

    playLowChaosSound() {
        this.ensureAudioContext();
        if (!this.ctx) return;
        try {
            const gainNode = this.ctx.createGain();
            gainNode.gain.value = 0.15; // Much lower base volume
            
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            
            // Use softer waveforms
            osc1.type = 'triangle';
            osc2.type = 'sine';
            
            // Lower frequencies for subtle unease
            osc1.frequency.value = 110; // A2
            osc2.frequency.value = 113; // Slightly detuned for organic movement
            
            // Add subtle filter sweep
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.Q.value = 1;
            filter.frequency.value = 800;
            
            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.gainNode);

            const now = this.ctx.currentTime;
            const duration = 1.2;
            
            // Gentle envelope
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.15, now + 0.2);
            gainNode.gain.linearRampToValueAtTime(0, now + duration);
            
            // Subtle filter movement
            filter.frequency.linearRampToValueAtTime(400, now + duration);
            
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + duration);
            osc2.stop(now + duration);

            setTimeout(() => gainNode.disconnect(), duration * 1000);
        } catch (e) {
            console.warn('Error playing low chaos sound:', e);
        }
    }

    playMidChaosSound() {
        this.ensureAudioContext();
        if (!this.ctx) return;
        try {
            const gainNode = this.ctx.createGain();
            gainNode.gain.value = 0.2;
            
            // Create three oscillators for richer texture
            const oscs = [];
            const freqs = [146.83, 220, 293.66]; // D3, A3, D4 - minor triad
            
            freqs.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const oscGain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                oscGain.gain.value = 0.3;
                
                osc.connect(oscGain);
                oscGain.connect(gainNode);
                oscs.push({ osc, gain: oscGain });
            });
            
            // Add gentle modulation
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.value = 3;
            lfoGain.gain.value = 0.15;
            
            lfo.connect(lfoGain);
            lfoGain.connect(gainNode.gain);
            
            gainNode.connect(this.gainNode);
            
            const now = this.ctx.currentTime;
            const duration = 1.0;
            
            // Stagger the oscillator starts for organic feel
            oscs.forEach((osc, i) => {
                const startTime = now + (i * 0.1);
                osc.osc.start(startTime);
                osc.osc.stop(now + duration);
                osc.gain.gain.setValueAtTime(0, startTime);
                osc.gain.gain.linearRampToValueAtTime(0.3, startTime + 0.1);
                osc.gain.gain.linearRampToValueAtTime(0, now + duration);
            });
            
            lfo.start(now);
            lfo.stop(now + duration);

            setTimeout(() => gainNode.disconnect(), duration * 1000);
        } catch (e) {
            console.warn('Error playing mid chaos sound:', e);
        }
    }

    playHighChaosSound() {
        this.ensureAudioContext();
        if (!this.ctx) return;
        try {
            const gainNode = this.ctx.createGain();
            const oscillators = [];
            const filter = this.ctx.createBiquadFilter();

            // Create dissonant chord
            const frequencies = [220, 277.18, 440]; // Dissonant intervals
            
            frequencies.forEach(freq => {
                const osc = this.ctx.createOscillator();
                osc.type = 'sawtooth';
                osc.frequency.value = freq;
                oscillators.push(osc);
                
                const oscGain = this.ctx.createGain();
                oscGain.gain.value = 0.3;
                
                osc.connect(oscGain);
                oscGain.connect(filter);
            });

            filter.type = 'bandpass';
            filter.frequency.value = 800;
            filter.Q.value = 3;

            filter.connect(gainNode);
            gainNode.connect(this.gainNode);

            const endTime = this.createEnvelope(gainNode, 0.05, 0.2, 0.5, 0.3);

            oscillators.forEach(osc => {
                osc.start();
                osc.stop(endTime);
            });

            // Add frequency sweep
            filter.frequency.exponentialRampToValueAtTime(2000, endTime);

            setTimeout(() => gainNode.disconnect(), endTime * 1000);
        } catch (e) {
            console.warn('Error playing high chaos sound:', e);
        }
    }

    playChaosSoundForLevel(chaosLevel) {
        if (chaosLevel >= 90) {
            this.playChaosSound(); // Original intense chaos sound
        } else if (chaosLevel >= 75) {
            this.playHighChaosSound();
        } else if (chaosLevel >= 45) {
            this.playMidChaosSound();
        } else if (chaosLevel >= 25) {
            this.playLowChaosSound();
        }
    }

    playAchievementSound() {
        this.ensureAudioContext();
        if (!this.ctx) return;
        try {
            const gainNode = this.ctx.createGain();
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const osc3 = this.ctx.createOscillator();

            // Create a happy achievement jingle
            osc1.type = 'sine';
            osc2.type = 'triangle';
            osc3.type = 'sine';

            // Major chord arpeggio
            osc1.frequency.value = 440; // A4
            osc2.frequency.value = 554.37; // C#5
            osc3.frequency.value = 659.25; // E5

            osc1.connect(gainNode);
            osc2.connect(gainNode);
            osc3.connect(gainNode);
            gainNode.connect(this.gainNode);

            // Initial gain set to an even lower value
            gainNode.gain.value = 0.01; // Reduced from 0.02

            // Stagger the notes for an arpeggio effect
            const now = this.ctx.currentTime;
            osc1.start(now);
            osc2.start(now + 0.1);
            osc3.start(now + 0.2);

            osc1.stop(now + 0.3);
            osc2.stop(now + 0.4);
            osc3.stop(now + 0.5);

            // Add sparkle with frequency modulation
            osc3.frequency.setValueCurveAtTime(
                [659.25, 880, 659.25], 
                now + 0.2, 
                0.3
            );

            // Further reduced sustain and overall envelope values
            this.createEnvelope(gainNode, 0.01, 0.1, 0.15, 0.2); // Reduced sustain from 0.3 to 0.15
            setTimeout(() => gainNode.disconnect(), 600);
        } catch (e) {
            console.warn('Error playing achievement sound:', e);
        }
    }

    playGameOverSound() {
        this.ensureAudioContext();
        if (!this.ctx) return;
        try {
            const gainNode = this.ctx.createGain();
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();

            // Create a dramatic game over sound
            osc1.type = 'sawtooth';
            osc2.type = 'square';
            filter.type = 'lowpass';
            filter.frequency.value = 1000;
            filter.Q.value = 5;

            osc1.frequency.value = 110;
            osc2.frequency.value = 55;

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.gainNode);

            const now = this.ctx.currentTime;
            const duration = 1.6; // Reduced from 1.5 to 0.8 seconds

            // Faster fade out
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.6, now + 0.1);
            gainNode.gain.linearRampToValueAtTime(0.3, now + duration - 0.2);
            gainNode.gain.linearRampToValueAtTime(0, now + duration);

            // Faster pitch bend
            osc1.frequency.setValueCurveAtTime(
                [110, 80, 55], 
                now, 
                duration - 0.1
            );
            osc2.frequency.setValueCurveAtTime(
                [55, 40, 27.5], 
                now, 
                duration - 0.1
            );

            // Faster filter sweep
            filter.frequency.exponentialRampToValueAtTime(100, now + duration - 0.1);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + duration);
            osc2.stop(now + duration);

            // Remove createEnvelope call and handle cleanup after full duration
            setTimeout(() => gainNode.disconnect(), (duration + 0.1) * 1000);
        } catch (e) {
            console.warn('Error playing game over sound:', e);
        }
    }

    playStartGameSound() {
        this.ensureAudioContext();
        if (!this.ctx) return;
        try {
            const gainNode = this.ctx.createGain();
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();

            // Setup oscillators for melody
            osc1.type = 'triangle';
            osc2.type = 'sine';
            
            filter.type = 'lowpass';
            filter.frequency.value = 2000;
            filter.Q.value = 2;

            // Connect everything
            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.gainNode);

            const now = this.ctx.currentTime;
            const noteLength = 0.15; // Length of each note

            // Create ascending melody
            const melody1 = [220, 330, 440, 550]; // Base melody
            const melody2 = [440, 660, 880, 1100]; // Harmony notes

            // Setup envelope with even lower volume (reduced to 0.07 from 0.1)
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.07, now + 0.1);

            // Play each note in sequence
            melody1.forEach((freq, i) => {
                const time = now + (i * noteLength);
                osc1.frequency.setValueAtTime(freq, time);
                osc2.frequency.setValueAtTime(melody2[i], time);
                
                // Create slight pulse for each note (reduced to 0.15/0.08)
                gainNode.gain.setValueAtTime(0.15, time);
                gainNode.gain.linearRampToValueAtTime(0.08, time + noteLength * 0.8);
            });

            // Final fade out
            const duration = noteLength * melody1.length;
            gainNode.gain.linearRampToValueAtTime(0, now + duration);

            // Play the sounds
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + duration);
            osc2.stop(now + duration);

            // Increase delay to 3.5 seconds before music starts (was 3 seconds)
            setTimeout(() => {
                if (window.musicLoops && typeof window.musicLoops.startLoop === 'function') {
                    window.musicLoops.startLoop();
                }
            }, 3500);

            // Cleanup
            setTimeout(() => gainNode.disconnect(), duration * 1000);
        } catch (e) {
            console.warn('Error playing start game sound:', e);
        }
    }

    createGrumbleSound(intensity = 1) {
        this.ensureAudioContext();
        if (!this.ctx) return;
        try {
            const gainNode = this.ctx.createGain();
            const oscCount = 3;
            const oscillators = [];
            
            for (let i = 0; i < oscCount; i++) {
                const osc = this.ctx.createOscillator();
                const oscGain = this.ctx.createGain();
                
                // Create grumbly frequencies
                osc.type = 'sawtooth';
                osc.frequency.value = 50 + (i * 30) + (Math.random() * 20);
                
                // Add modulation
                const modOsc = this.ctx.createOscillator();
                modOsc.type = 'sine';
                modOsc.frequency.value = 2 + (Math.random() * 4);
                const modGain = this.ctx.createGain();
                modGain.gain.value = 20 * intensity;
                
                modOsc.connect(modGain);
                modGain.connect(osc.frequency);
                
                osc.connect(oscGain);
                oscGain.connect(gainNode);
                oscGain.gain.value = 0.15; // Reduced from 0.2 to 0.15
                
                oscillators.push(osc, modOsc);
            }
            
            gainNode.connect(this.gainNode);
            
            // Envelope with reduced intensity
            const now = this.ctx.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.2 * intensity, now + 0.1); // Reduced from 0.3 to 0.2
            gainNode.gain.linearRampToValueAtTime(0, now + 1.5);
            
            oscillators.forEach(osc => {
                osc.start(now);
                osc.stop(now + 1.5);
            });
            
            setTimeout(() => gainNode.disconnect(), 2000);
        } catch (e) {
            console.warn('Error playing grumble sound:', e);
        }
    }

    playPowerUpSound() {
        this.ensureAudioContext();
        if (!this.ctx) return;
        try {
            const gainNode = this.ctx.createGain();
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            
            // Use notes from C minor pentatonic scale (same as BGM)
            const notes = [261.63, 311.13, 349.23, 392.00, 466.16]; // C4, Eb4, F4, G4, Bb4
            const startNote = notes[0];  // C4
            const peakNote = notes[4];   // Bb4
            const endNote = notes[2];    // F4
            
            osc.type = 'triangle'; // Softer waveform for better blend
            osc.frequency.setValueCurveAtTime(
                [startNote, peakNote, endNote], 
                this.ctx.currentTime, 
                0.2
            );
            
            // Add filter sweep for more musical tone
            filter.type = 'bandpass';
            filter.frequency.value = 800;
            filter.Q.value = 2;
            
            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.gainNode);
            
            gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.2);
            
            setTimeout(() => {
                gainNode.disconnect();
                filter.disconnect();
            }, 300);
        } catch (e) {
            console.warn('Error playing power up sound:', e);
        }
    }

    playBadCardSound() {
        this.ensureAudioContext();
        if (!this.ctx) return;
        try {
            const gainNode = this.ctx.createGain();
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            
            // Use descending notes from C minor pentatonic (same as BGM)
            const notes = [466.16, 392.00, 311.13]; // Bb4, G4, Eb4
            
            osc.type = 'triangle'; // Changed from sawtooth for better blend
            osc.frequency.setValueCurveAtTime(
                notes,
                this.ctx.currentTime, 
                0.3
            );
            
            // Resonant filter for darker tone
            filter.type = 'lowpass';
            filter.frequency.value = 2000;
            filter.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.3);
            filter.Q.value = 4;
            
            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.gainNode);
            
            gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.3);
            
            setTimeout(() => {
                gainNode.disconnect();
                filter.disconnect();
            }, 400);
        } catch (e) {
            console.warn('Error playing bad card sound:', e);
        }
    }

    playRandomChatter() {
        this.ensureAudioContext();
        if (!this.ctx) return;
        try {
            const gainNode = this.ctx.createGain();
            // More variation in duration (0.6 to 1.4 seconds)
            const duration = 0.6 + (Math.random() * 0.8);
            
            // Random base pitch for the entire phrase
            const phrasePitch = 0.8 + (Math.random() * 0.8); // 0.8 to 1.6 pitch multiplier
            
            // Create multiple syllables for duck speech
            const syllables = Math.floor(2 + Math.random() * 5); // 2-6 syllables
            
            for (let i = 0; i < syllables; i++) {
                const carrier = this.ctx.createOscillator();
                const modulator = this.ctx.createOscillator();
                const modulatorGain = this.ctx.createGain();
                const syllableGain = this.ctx.createGain();
                
                // Create formant filter for duck-like sound
                const formantFilter = this.ctx.createBiquadFilter();
                formantFilter.type = 'bandpass';
                formantFilter.Q.value = 5;
                
                // Varied frequencies for each syllable with overall pitch variation
                const syllablePitch = 1 + (Math.random() * 0.4 - 0.2); // ±20% pitch variation per syllable
                const baseFreq = (120 + (Math.random() * 60)) * phrasePitch * syllablePitch;
                
                carrier.type = 'sawtooth';
                carrier.frequency.value = baseFreq;
                modulator.frequency.value = 12 + (Math.random() * 12); // More modulation variation
                modulatorGain.gain.value = baseFreq * 0.7;
                formantFilter.frequency.value = (500 + (Math.random() * 600)) * phrasePitch;
                
                // Connect the audio graph
                modulator.connect(modulatorGain);
                modulatorGain.connect(carrier.frequency);
                carrier.connect(formantFilter);
                formantFilter.connect(syllableGain);
                syllableGain.connect(gainNode);
                
                // Create envelope for each syllable
                const syllableTime = this.ctx.currentTime + (i * (duration / syllables));
                const syllableDuration = (duration / syllables) * (0.5 + Math.random() * 0.4); // Variable syllable length
                
                syllableGain.gain.setValueAtTime(0, syllableTime);
                syllableGain.gain.linearRampToValueAtTime(0.6, syllableTime + 0.02);
                syllableGain.gain.linearRampToValueAtTime(0.3, syllableTime + syllableDuration * 0.5);
                syllableGain.gain.linearRampToValueAtTime(0, syllableTime + syllableDuration);
                
                carrier.start(syllableTime);
                modulator.start(syllableTime);
                carrier.stop(syllableTime + syllableDuration);
                modulator.stop(syllableTime + syllableDuration);
            }
            
            gainNode.connect(this.gainNode);
            gainNode.gain.value = 0.3 + (Math.random() * 0.2); // Random volume between 0.3 and 0.5
            
            setTimeout(() => gainNode.disconnect(), duration * 1000 + 200);
        } catch (e) {
            console.warn('Error playing random chatter:', e);
        }
    }

    startRandomChatter() {
        if (this.chatterInterval) {
            clearInterval(this.chatterInterval);
        }

        const scheduleNextChatter = () => {
            const now = Date.now();
            const timeSinceLastChatter = now - this.lastChatterTime;
            
            // Base interval between 25-65 seconds
            let minInterval = 25000;
            let maxInterval = 65000;
            
            // Check chaos level using window.gameInstance instead of window.game
            const chaosLevel = window.gameInstance?.state?.playerStats?.chaosLevel;
            if (chaosLevel > 50) {
                const reductionFactor = Math.min(0.5, (chaosLevel - 50) / 100);
                minInterval *= (1 - reductionFactor);
                maxInterval *= (1 - reductionFactor);
            }
            
            // Only play if enough time has passed
            if (timeSinceLastChatter > minInterval) {
                this.playRandomChatter();
                this.lastChatterTime = now;
            }
            
            // Schedule next chatter
            const nextInterval = minInterval + Math.random() * (maxInterval - minInterval);
            this.chatterInterval = setTimeout(scheduleNextChatter, nextInterval);
        };

        // Start the cycle
        scheduleNextChatter();
    }

    setVolume(value) {
        this.volume = value;
        if (this.gainNode) {
            this.gainNode.gain.value = value;
        }
        localStorage.setItem('sfxEnabled', value > 0);
    }
}

export const gameSounds = new GameSounds();