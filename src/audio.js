export class GameSounds {
    constructor() {
        this.ctx = null;
        this.gainNode = null;
        this.isInitialized = false;
        
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
                this.gainNode.gain.value = 0.2;
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

    playCardSound() {
        this.ensureAudioContext();
        if (!this.ctx) return;
        try {
            const mainGain = this.ctx.createGain();
            const beepGain = this.ctx.createGain();
            const noiseGain = this.ctx.createGain();
            
            // Create noise buffer for card swoosh
            const bufferSize = this.ctx.sampleRate * 0.1; // 100ms noise
            const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            // Generate noise with curve for swoosh effect
            for (let i = 0; i < bufferSize; i++) {
                const t = i / bufferSize;
                // Envelope curve for swoosh effect
                const envelope = Math.pow(1 - t, 2) * Math.exp(-8 * t);
                output[i] = (Math.random() * 2 - 1) * envelope;
            }

            // Create and setup noise source
            const noiseSource = this.ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;

            // Create filter for swoosh sound
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 2000;
            filter.Q.value = 1.5;

            // Setup beep oscillators (quieter now)
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            osc1.type = 'triangle';
            osc1.frequency.value = 440;
            osc2.type = 'sine';
            osc2.frequency.value = 880;

            // Connect noise path
            noiseSource.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(mainGain);
            noiseGain.gain.value = 0.7; // Noise volume

            // Connect beep path
            osc1.connect(beepGain);
            osc2.connect(beepGain);
            beepGain.connect(mainGain);
            beepGain.gain.value = 0.15; // Reduced beep volume

            // Connect to main output
            mainGain.connect(this.gainNode);

            // Timing setup
            const now = this.ctx.currentTime;
            const endTime = this.createEnvelope(mainGain, 0.005, 0.1, 0.3, 0.1);

            // Start all sounds
            noiseSource.start(now);
            osc1.start(now);
            osc2.start(now);

            // Stop sounds
            noiseSource.stop(now + 0.1);
            osc1.stop(endTime);
            osc2.stop(endTime);

            // Cleanup
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
            const noiseGain1 = this.ctx.createGain();
            const noiseGain2 = this.ctx.createGain();
            
            // Create noise buffers for two card swooshes
            const bufferSize = this.ctx.sampleRate * 0.1;
            const noiseBuffer1 = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const noiseBuffer2 = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output1 = noiseBuffer1.getChannelData(0);
            const output2 = noiseBuffer2.getChannelData(0);
            
            // Generate noise with curve for swoosh effects
            for (let i = 0; i < bufferSize; i++) {
                const t = i / bufferSize;
                const envelope = Math.pow(1 - t, 2) * Math.exp(-8 * t);
                output1[i] = (Math.random() * 2 - 1) * envelope;
                output2[i] = (Math.random() * 2 - 1) * envelope;
            }

            // Create and setup noise sources
            const noiseSource1 = this.ctx.createBufferSource();
            const noiseSource2 = this.ctx.createBufferSource();
            noiseSource1.buffer = noiseBuffer1;
            noiseSource2.buffer = noiseBuffer2;

            // Create filters for swoosh sounds
            const filter1 = this.ctx.createBiquadFilter();
            const filter2 = this.ctx.createBiquadFilter();
            filter1.type = 'bandpass';
            filter2.type = 'bandpass';
            filter1.frequency.value = 2000;
            filter2.frequency.value = 2000;
            filter1.Q.value = 1.5;
            filter2.Q.value = 1.5;

            // Connect noise paths
            noiseSource1.connect(filter1);
            noiseSource2.connect(filter2);
            filter1.connect(noiseGain1);
            filter2.connect(noiseGain2);
            noiseGain1.connect(mainGain);
            noiseGain2.connect(mainGain);
            noiseGain1.gain.value = 0.7;
            noiseGain2.gain.value = 0.7;

            // Connect to main output
            mainGain.connect(this.gainNode);

            // Timing setup
            const now = this.ctx.currentTime;
            mainGain.gain.setValueAtTime(0, now);
            mainGain.gain.linearRampToValueAtTime(0.7, now + 0.01);
            mainGain.gain.linearRampToValueAtTime(0, now + 0.2);

            // Start sounds with slight delay between them
            noiseSource1.start(now);
            noiseSource2.start(now + 0.08); // Slight delay for second card

            // Cleanup
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
            const duration = 1.5;

            // Add proper fade out to prevent clicking
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.6, now + 0.1);
            gainNode.gain.linearRampToValueAtTime(0.4, now + duration - 0.3);
            gainNode.gain.linearRampToValueAtTime(0, now + duration); // Smooth fade to zero

            // Dramatic pitch bend down
            osc1.frequency.setValueCurveAtTime(
                [110, 80, 55], 
                now, 
                duration - 0.1 // End slightly before gain fade
            );
            osc2.frequency.setValueCurveAtTime(
                [55, 40, 27.5], 
                now, 
                duration - 0.1 // End slightly before gain fade
            );

            // Filter sweep down with smoother ending
            filter.frequency.exponentialRampToValueAtTime(100, now + duration - 0.2);

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

            // Setup envelope
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.4, now + 0.1);

            // Play each note in sequence
            melody1.forEach((freq, i) => {
                const time = now + (i * noteLength);
                osc1.frequency.setValueAtTime(freq, time);
                osc2.frequency.setValueAtTime(melody2[i], time);
                
                // Create slight pulse for each note
                gainNode.gain.setValueAtTime(0.4, time);
                gainNode.gain.linearRampToValueAtTime(0.2, time + noteLength * 0.8);
            });

            // Final fade out
            const duration = noteLength * melody1.length;
            gainNode.gain.linearRampToValueAtTime(0, now + duration);

            // Play the sounds
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + duration);
            osc2.stop(now + duration);

            // Cleanup
            setTimeout(() => gainNode.disconnect(), duration * 1000);
        } catch (e) {
            console.warn('Error playing start game sound:', e);
        }
    }

    setVolume(value) {
        if (this.gainNode) {
            this.gainNode.gain.value = Math.max(0, Math.min(1, value));
        }
    }
}

export const gameSounds = new GameSounds();