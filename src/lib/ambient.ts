export type BreathPhase = "inhale" | "hold" | "exhale";

/**
 * Synthesised ambient soundscape for the 4-7-8 breathing pacer (Web Audio, no audio files).
 * A soft, slowly drifting pad plus a "breath" of filtered noise that swells on the inhale,
 * stays through the hold and ebbs away on the exhale.
 *
 * Browsers only allow audio after a user gesture, so call `unlock()` from a click handler.
 */
export class AmbientBreath {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private breathGain: GainNode | null = null;
  private breathFilter: BiquadFilterNode | null = null;
  private sources: AudioScheduledSourceNode[] = [];

  private static readonly LEVEL = 0.32;

  /** Create (once) and resume the audio graph. Must run inside a user gesture. */
  unlock() {
    if (!this.ctx) this.build();
    this.ctx?.resume().catch(() => {});
  }

  private build() {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return;
    const ctx: AudioContext = new Ctor();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.master = master;

    // --- Pad: a gentle open chord (C2, G2, C3, E3) that slowly "breathes" through a low-pass filter
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 520;
    padFilter.Q.value = 0.4;
    padFilter.connect(master);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 180;
    lfo.connect(lfoDepth).connect(padFilter.frequency);
    lfo.start();
    this.sources.push(lfo);

    const voices: [number, number, number][] = [
      [65.41, 0.5, -4],
      [98.0, 0.32, 3],
      [130.81, 0.26, -2],
      [164.81, 0.16, 5],
      [196.0, 0.08, -3],
    ];
    for (const [freq, level, detune] of voices) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = level * 0.5;
      osc.connect(g).connect(padFilter);
      osc.start();
      this.sources.push(osc);
    }

    // --- Breath: looping brown-ish noise through a band-pass filter
    const length = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 320;
    filter.Q.value = 0.6;
    const gain = ctx.createGain();
    gain.gain.value = 0.04;
    noise.connect(filter).connect(gain).connect(master);
    noise.start();
    this.sources.push(noise);
    this.breathFilter = filter;
    this.breathGain = gain;
  }

  private ramp(param: AudioParam, target: number, seconds: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(target, now + seconds);
  }

  /** Follow the breathing cycle; `seconds` is the length of this phase. */
  setPhase(phase: BreathPhase, seconds: number) {
    if (!this.ctx || !this.master || !this.breathGain || !this.breathFilter) return;
    this.master.gain.setTargetAtTime(AmbientBreath.LEVEL, this.ctx.currentTime, 0.8);
    if (phase === "inhale") {
      this.ramp(this.breathGain.gain, 0.2, seconds);
      this.ramp(this.breathFilter.frequency, 1100, seconds);
    } else if (phase === "hold") {
      this.ramp(this.breathGain.gain, 0.12, seconds);
      this.ramp(this.breathFilter.frequency, 800, seconds);
    } else {
      this.ramp(this.breathGain.gain, 0.03, seconds);
      this.ramp(this.breathFilter.frequency, 280, seconds);
    }
  }

  /** Fade to silence (pause / mute) without tearing down the graph. */
  fadeOut() {
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
  }

  /** Stop everything and release the audio device. */
  dispose() {
    const ctx = this.ctx;
    if (!ctx) return;
    this.fadeOut();
    const sources = this.sources;
    this.ctx = null;
    this.master = null;
    this.breathGain = null;
    this.breathFilter = null;
    this.sources = [];
    window.setTimeout(() => {
      sources.forEach((s) => {
        try { s.stop(); } catch { /* already stopped */ }
      });
      ctx.close().catch(() => {});
    }, 1500);
  }
}
