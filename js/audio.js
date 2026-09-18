// Simple synthesized audio using Web Audio API
const AudioSys = {
    ctx: null,
    
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    playTone(freq, type, duration, vol = 0.1) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    playDoorOpen() {
        this.playTone(200, 'sine', 0.5, 0.2);
        setTimeout(() => this.playTone(300, 'sine', 0.8, 0.2), 100);
    },

    playBomb() {
        // noise explosion
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 0.5; 
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        noise.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
    },

    playCorrect() {
        this.playTone(400, 'sine', 0.1, 0.2);
        setTimeout(() => this.playTone(600, 'sine', 0.3, 0.2), 100);
        setTimeout(() => this.playTone(800, 'sine', 0.5, 0.2), 200);
    },

    playWrong() {
        this.playTone(150, 'sawtooth', 0.3, 0.2);
        setTimeout(() => this.playTone(100, 'sawtooth', 0.5, 0.2), 200);
    },

    playTick() {
        this.playTone(800, 'square', 0.05, 0.05);
    },

    playVictory() {
        this.playTone(523.25, 'sine', 0.2); // C5
        setTimeout(() => this.playTone(659.25, 'sine', 0.2), 200); // E5
        setTimeout(() => this.playTone(783.99, 'sine', 0.2), 400); // G5
        setTimeout(() => this.playTone(1046.50, 'sine', 0.6), 600); // C6
    }
};

// Handle interaction to unlock audio
document.body.addEventListener('click', () => {
    AudioSys.init();
}, { once: true });
