/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Audio Synthesizer Engine for Realistic Abacus Wood Sounds & Chimes
 * Uses browser-native Web Audio API — zero external mp3/asset dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public speechEnabled: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Realistic tactile wood bead click / clack
   */
  public playBeadClick(isUpper = false, isEngaged = true) {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Pitch: upper bead has slightly deeper resonant hollow wood tone
      const baseFreq = isUpper ? (isEngaged ? 380 : 420) : (isEngaged ? 540 : 580);
      const jitter = (Math.random() - 0.5) * 40;
      osc.frequency.setValueAtTime(baseFreq + jitter, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.045);

      // Bandpass wooden resonance
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isUpper ? 700 : 950, t);
      filter.Q.setValueAtTime(4.0, t);

      // Sharp percussive envelope
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(isUpper ? 0.35 : 0.25, t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);

      // Add a subtle click transient
      const click = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      click.type = 'triangle';
      click.frequency.setValueAtTime(1600, t);
      click.frequency.exponentialRampToValueAtTime(300, t + 0.015);
      clickGain.gain.setValueAtTime(0.15, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

      click.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      click.start(t);
      click.stop(t + 0.02);
    } catch {
      // Ignore audio failure
    }
  }

  /**
   * Swoosh / slide sound for clearing or resetting the abacus
   */
  public playClearSound() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(300, t + 0.14);
      filter.Q.setValueAtTime(2.0, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(t);
      whiteNoise.stop(t + 0.15);
    } catch {
      // Ignore
    }
  }

  /**
   * Correct answer positive musical chime
   */
  public playSuccess() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const noteStart = t + idx * 0.07;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);
        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.2, noteStart + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 0.36);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Gentle retry chime
   */
  public playError() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [330, 293.66]; // E4, D4
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const noteStart = t + idx * 0.1;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);
        gain.gain.setValueAtTime(0.15, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 0.21);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Spoken guidance via browser SpeechSynthesis
   */
  public speak(text: string, lang = 'en-US') {
    if (!this.speechEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore
    }
  }
}

export const sounds = new SoundEngine();
