export class MusicLoops {
    constructor() {
        this.audioContext = null;
        this.gainNode = null;
        this.currentLoop = null;
        this.isPlaying = false;
        this.baseVolume = 0.15; // Increased significantly
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

    playBaseLoop() {
        if (!this.enabled || !this.isPlaying || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const bpm = 90;
        const beatLength = 60 / bpm;

        // Simple kick and hihat pattern
        [
            // Kick drum (every other beat)
            { time: 0, freq: 60, type: 'sine', gain: 1.0 },
            { time: beatLength * 2, freq: 60, type: 'sine', gain: 1.0 },
            
            // Hi-hat (offbeats)
            { time: beatLength, freq: 3000, type: 'triangle', gain: 0.3 },
            { time: beatLength * 3, freq: 3000, type: 'triangle', gain: 0.3 }
        ].forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            osc.type = note.type;
            osc.frequency.value = note.freq;

            gainNode.gain.setValueAtTime(0, now + note.time);
            gainNode.gain.linearRampToValueAtTime(
                note.gain * this.volume * this.baseVolume,
                now + note.time + 0.01
            );
            gainNode.gain.exponentialRampToValueAtTime(
                0.001,
                now + note.time + (note.type === 'sine' ? 0.15 : 0.05)
            );

            osc.connect(gainNode);
            gainNode.connect(this.gainNode);

            osc.start(now + note.time);
            osc.stop(now + note.time + (note.type === 'sine' ? 0.15 : 0.05));
        });

        // Schedule next loop
        if (this.loopTimeout) {
            clearTimeout(this.loopTimeout);
        }
        
        this.loopTimeout = setTimeout(() => {
            if (this.isPlaying) {
                this.playBaseLoop();
            }
        }, beatLength * 4 * 1000 - 50);
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
