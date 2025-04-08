export class GameSounds {
    constructor() {
        this.ctx = null;
        this.gainNode = null;
        this.isInitialized = false;
        
        // Load saved preferences
        const sfxEnabled = localStorage.getItem('sfxEnabled') !== 'false';
        this.volume = sfxEnabled ? 0.5 : 0;
        
        // Add touch event listeners for mobile
        ['touchstart', 'click'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                if (!this.isInitialized) {
                    this.initAudio();
                }
            }, { once: true });
        });
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
                output[i] = (Math.random() * 2 - 1) * envelope * 0.6; // Reduced amplitude
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

            this.createEnvelope(gainNode, 0.01, 0.1, 0.5, 0.3);
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
                oscGain.gain.value = 0.2;
                
                oscillators.push(osc, modOsc);
            }
            
            gainNode.connect(this.gainNode);
            
            // Envelope
            const now = this.ctx.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3 * intensity, now + 0.1);
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
            
            osc.type = 'sine';
            osc.frequency.setValueCurveAtTime(
                [300, 600, 900, 1200], 
                this.ctx.currentTime, 
                0.2
            );
            
            osc.connect(gainNode);
            gainNode.connect(this.gainNode);
            
            gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.2);
            
            setTimeout(() => gainNode.disconnect(), 300);
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
            
            osc.type = 'sawtooth';
            osc.frequency.setValueCurveAtTime(
                [200, 150, 100], 
                this.ctx.currentTime, 
                0.3
            );
            
            filter.type = 'lowpass';
            filter.frequency.value = 1000;
            filter.Q.value = 10;
            
            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.gainNode);
            
            gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.3);
            
            setTimeout(() => gainNode.disconnect(), 400);
        } catch (e) {
            console.warn('Error playing bad card sound:', e);
        }
    }

    playRandomChatter() {
        this.ensureAudioContext();
        if (!this.ctx) return;
        try {
            const gainNode = this.ctx.createGain();
            const duration = 0.2 + (Math.random() * 0.3);
            const notes = [];
            
            for (let i = 0; i < 5; i++) {
                const osc = this.ctx.createOscillator();
                const oscGain = this.ctx.createGain();
                
                osc.type = ['sine', 'triangle'][Math.floor(Math.random() * 2)];
                osc.frequency.value = 200 + (Math.random() * 400);
                
                osc.connect(oscGain);
                oscGain.connect(gainNode);
                
                oscGain.gain.setValueAtTime(0, this.ctx.currentTime + (i * duration / 5));
                oscGain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + (i * duration / 5) + 0.02);
                oscGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + (i * duration / 5) + 0.04);
                
                notes.push(osc);
            }
            
            gainNode.connect(this.gainNode);
            gainNode.gain.value = 0.3;
            
            notes.forEach(osc => osc.start());
            notes.forEach(osc => osc.stop(this.ctx.currentTime + duration));
            
            setTimeout(() => gainNode.disconnect(), duration * 1000 + 100);
        } catch (e) {
            console.warn('Error playing random chatter:', e);
        }
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