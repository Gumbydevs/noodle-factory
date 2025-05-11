//NOT USED
// This file is not used in the current version of the code.
// It is a copy of the original bgm file with some modifications.
export class MusicLoops {
    constructor() {
        this.audioContext = null;
        this.gainNode = null;
        this.currentLoop = null;
        this.isPlaying = false;
        this.baseVolume = 1.2; // Increased for better audibility
        this.volume = parseFloat(localStorage.getItem('musicVolume')) || 1.0; // Now represents multiplier
        this.chaosLevel = 0;
        this.loopTimeout = null;
        this.currentTime = 0;
        this.nextScheduleTime = 0;
        this.scheduleAheadTime = 0.2;
        this.notes = {
            'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61,
            'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
            'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25
        };

        // Load saved preferences
        this.enabled = localStorage.getItem('musicEnabled') === 'true';
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = this.enabled ? this.volume * this.baseVolume : 0;
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
        this.initAudio();
        if (!this.enabled) return;

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.isPlaying = true;
        this.playBaseLoop();
    }

    createNoiseBuffer(duration) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Colored noise for more musical character
        let lastValue = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastValue + (0.02 * white)) / 1.02;
            lastValue = data[i];
            data[i] *= 3.5; // Increased amplitude
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
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(gain * this.volume * this.baseVolume, startTime + 0.005);
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

    playBaseLoop() {
        if (!this.enabled || !this.isPlaying || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const baseBPM = 92 + (this.chaosLevel * 0.3); // Speed up with chaos
        const beatLength = 60 / baseBPM;

        // DFAM-inspired pattern - 16 steps
        const steps = 16;
        const stepTime = beatLength / 4;

        // Basic groove pattern (inspired by DFAM and jazz drums)
        const basePattern = [
            // Kick (deep analog-style)
            { type: 'kick', steps: [0, 4, 8, 14], gain: 2.0 },
            
            // Snare (noise-based with resonance)
            { type: 'snare', steps: [4, 12], gain: 1.5 },
            
            // Hi-hats (varied pattern)
            { type: 'hihat', steps: [0, 2, 3, 6, 7, 8, 10, 11, 14, 15], gain: 0.6 },
            
            // Rim (accent beats)
            { type: 'rim', steps: [2, 6, 10, 14], gain: 0.4 }
        ];

        // Add chaos variations
        if (this.chaosLevel >= 30) {
            basePattern[2].steps.push(1, 5, 9, 13); // More hi-hats
        }
        if (this.chaosLevel >= 50) {
            basePattern[1].steps.push(6, 14); // Extra snares
            basePattern[3].steps.push(3, 7, 11, 15); // More rim shots
        }
        if (this.chaosLevel >= 75) {
            basePattern[0].steps.push(2, 6, 10); // Extra kicks
            basePattern[2].steps = Array.from({ length: 16 }, (_, i) => i); // Constant hi-hats
        }

        // Play each instrument's pattern
        basePattern.forEach(instrument => {
            instrument.steps.forEach(step => {
                const startTime = now + (step * stepTime);
                
                switch(instrument.type) {
                    case 'kick':
                        this.playKick(startTime, instrument.gain);
                        break;
                    case 'snare':
                        this.playSnare(startTime, instrument.gain);
                        break;
                    case 'hihat':
                        this.playHihat(startTime, instrument.gain);
                        break;
                    case 'rim':
                        this.playRim(startTime, instrument.gain);
                        break;
                }
            });
        });

        // Schedule next loop
        if (this.loopTimeout) clearTimeout(this.loopTimeout);
        this.loopTimeout = setTimeout(() => {
            if (this.isPlaying) this.playBaseLoop();
        }, beatLength * 4 * 1000 - 20);
    }

    playKick(startTime, gain) {
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc.frequency.setValueAtTime(150, startTime);
        osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.08);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(gain * this.baseVolume, startTime + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
        
        osc.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        osc.start(startTime);
        osc.stop(startTime + 0.2);
    }

    playSnare(startTime, gain) {
        // Body
        const noise = this.audioContext.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.2);
        
        // Resonance
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 900;
        filter.Q.value = 3;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(gain * this.baseVolume, startTime + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        noise.start(startTime);
        noise.stop(startTime + 0.2);
    }

    playHihat(startTime, gain) {
        const noise = this.audioContext.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.1);
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;
        filter.Q.value = 4;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(gain * this.baseVolume * 0.7, startTime + 0.001);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        noise.start(startTime);
        noise.stop(startTime + 0.05);
    }

    playRim(startTime, gain) {
        const noise = this.audioContext.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.05);
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 3000;
        filter.Q.value = 15;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(gain * this.baseVolume, startTime + 0.001);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.03);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        noise.start(startTime);
        noise.stop(startTime + 0.05);
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
            this.chaosLevel = level;
            if (this.isPlaying && this.enabled) {
                this.startLoop(); // Restart loop with new chaos level
            }
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('musicEnabled', enabled);
        
        if (this.gainNode) {
            const now = this.audioContext ? this.audioContext.currentTime : 0;
            this.gainNode.gain.cancelScheduledValues(now);
            this.gainNode.gain.setValueAtTime(
                enabled ? this.volume * this.baseVolume : 0,
                now
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

    createOscillator(type) {
        const osc = this.audioContext.createOscillator();
        osc.type = type;
        return osc;
    }
}

export const musicLoops = new MusicLoops();
