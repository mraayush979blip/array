/* ==========================================================================
   ArrayLab — Sound Effects Engine (Web Audio API)
   Generates pleasant, subtle educational audio feedback with no external files.
   ========================================================================== */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = localStorage.getItem('arraylab_muted') === 'true';
  }

  init() {
    if (!this.audioCtx && typeof window.AudioContext !== 'undefined') {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('arraylab_muted', this.isMuted);
    return this.isMuted;
  }

  playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.05) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Audio might be blocked before user interaction
    }
  }

  playCompare() {
    this.playTone(440, 'triangle', 0.07, 0.04);
  }

  playShift() {
    this.playTone(330, 'sine', 0.09, 0.04);
  }

  playFound() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;
    // Pleasant 2-note ascending chime
    const now = this.audioCtx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.15, 0.06), idx * 80);
    });
  }

  playError() {
    this.playTone(220, 'sawtooth', 0.12, 0.04);
  }
}

window.soundEngine = new SoundEngine();
