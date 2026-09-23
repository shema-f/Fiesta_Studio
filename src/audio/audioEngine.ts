/**
 * FIesta Studio - Professional Web Audio Engine
 * Pure Web Audio API architecture with lookahead scheduler, high-precision clocks,
 * synthesis DSP, effects rack, mixer busing, and offline export rendering.
 */

import { InstrumentType, EffectPlugin, Note, DrumChannel } from '../types/daw';

// Algorithmic impulse response for reverb
function createReverbImpulse(ctx: BaseAudioContext, duration: number = 2.0, decay: number = 2.0): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const n = i / length;
    const env = Math.pow(1 - n, decay);
    left[i] = (Math.random() * 2 - 1) * env;
    right[i] = (Math.random() * 2 - 1) * env;
  }
  return impulse;
}

// Distortion transfer curve
function makeDistortionCurve(amount: number = 20): Float32Array {
  const k = amount;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

// Convert MIDI note number to frequency in Hz
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Note name to MIDI
export function noteNameToMidi(noteName: string): number {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const regex = /^([A-G][#b]?)(-?\d+)$/;
  const match = noteName.match(regex);
  if (!match) return 60;
  let name = match[1];
  const octave = parseInt(match[2], 10);
  if (name.includes('b')) {
    const flats: Record<string, string> = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };
    name = flats[name] || name;
  }
  const noteIndex = notes.indexOf(name);
  return (octave + 1) * 12 + noteIndex;
}

export function midiToNoteName(midi: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${notes[noteIndex]}${octave}`;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;

  // Master nodes
  public masterGain: GainNode | null = null;
  public masterLimiter: DynamicsCompressorNode | null = null;
  public masterAnalyser: AnalyserNode | null = null;

  // Buses
  public buses: Map<string, { gain: GainNode; panner: StereoPannerNode; analyser: AnalyserNode }> = new Map();

  // Reverb buffer cache
  private reverbBuffer: AudioBuffer | null = null;

  // Lookahead Scheduler State
  private isPlaying = false;
  private bpm = 120;
  private swing = 0.0;
  private currentStep = 0; // 0 to 63
  private nextStepTime = 0.0;
  private timerId: number | null = null;
  private lookaheadMs = 25.0; // Interval to run scheduler
  private scheduleAheadSec = 0.1; // Schedule events ahead
  private stepCallbacks: ((step: number, time: number) => void)[] = [];

  // Metronome node
  private metronomeEnabled = false;

  // CPU / Latency monitoring
  public lastLatencyMs = 0;
  public estimatedCpu = 0;

  constructor() {
    // Lazy initialized on first user interaction
  }

  public async init(): Promise<void> {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass({ latencyHint: 'interactive' });

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    this.masterLimiter = this.ctx.createDynamicsCompressor();
    this.masterLimiter.threshold.setValueAtTime(-0.5, this.ctx.currentTime);
    this.masterLimiter.knee.setValueAtTime(0.0, this.ctx.currentTime);
    this.masterLimiter.ratio.setValueAtTime(20.0, this.ctx.currentTime);
    this.masterLimiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.masterLimiter.release.setValueAtTime(0.05, this.ctx.currentTime);

    this.masterAnalyser = this.ctx.createAnalyser();
    this.masterAnalyser.fftSize = 1024;
    this.masterAnalyser.smoothingTimeConstant = 0.8;

    // Chain: MasterGain -> Limiter -> Analyser -> Destination
    this.masterGain.connect(this.masterLimiter);
    this.masterLimiter.connect(this.masterAnalyser);
    this.masterAnalyser.connect(this.ctx.destination);

    // Create default sub-buses (Drums, Vocals, Instruments, FX)
    const busNames = ['bus_master', 'bus_drums', 'bus_vocals', 'bus_instruments', 'bus_fx'];
    for (const name of busNames) {
      this.createBus(name);
    }

    // Pre-render reverb impulse
    this.reverbBuffer = createReverbImpulse(this.ctx, 2.5, 2.2);

    this.isInitialized = true;
  }

  public getContext(): AudioContext {
    if (!this.ctx) {
      throw new Error('AudioContext not initialized. Call init() on user gesture.');
    }
    return this.ctx;
  }

  public getMasterAnalyser(): AnalyserNode | null {
    return this.masterAnalyser;
  }

  public createBus(id: string) {
    if (!this.ctx || !this.masterGain) return;
    if (this.buses.has(id)) return this.buses.get(id)!;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    let panner: StereoPannerNode;
    try {
      panner = this.ctx.createStereoPanner();
    } catch {
      panner = this.ctx.createGain() as any;
    }

    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 256;

    gain.connect(panner);
    panner.connect(analyser);

    if (id === 'bus_master') {
      analyser.connect(this.masterGain);
    } else {
      // Connect sub-buses to master gain
      analyser.connect(this.masterGain);
    }

    const bus = { gain, panner, analyser };
    this.buses.set(id, bus);
    return bus;
  }

  // --- SOLO & MUTE AUDITION HELPERS ---
  public isTrackAudible(
    track: { mute: boolean; solo: boolean },
    allTracks: { mute: boolean; solo: boolean }[]
  ): boolean {
    if (track.mute) return false;
    const hasSolo = allTracks.some((t) => t.solo);
    if (hasSolo) {
      return track.solo;
    }
    return true;
  }

  public isDrumAudible(
    drumChannelMuted: boolean,
    tracks: { type?: string; id?: string; mute: boolean; solo: boolean }[]
  ): boolean {
    if (drumChannelMuted) return false;
    const hasSolo = tracks.some((t) => t.solo);
    if (hasSolo) {
      const drumTrackSoloed = tracks.some(
        (t) => (t.type === 'drums' || (t.id ? t.id.includes('drum') : false)) && t.solo
      );
      return drumTrackSoloed;
    }
    return true;
  }

  public getBus(id: string) {
    return this.buses.get(id) || this.buses.get('bus_master');
  }

  // --- LOOKAHEAD SCHEDULER ---
  public startPlayback(startStep: number = 0): void {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.currentStep = startStep;
    this.nextStepTime = this.ctx.currentTime + 0.05;

    this.runScheduler();
  }

  public stopPlayback(): void {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public setBpm(newBpm: number): void {
    this.bpm = Math.max(30, Math.min(300, newBpm));
  }

  public getBpm(): number {
    return this.bpm;
  }

  public setSwing(swingAmount: number): void {
    this.swing = Math.max(0, Math.min(0.75, swingAmount));
  }

  public setMetronome(enabled: boolean): void {
    this.metronomeEnabled = enabled;
  }

  public onStep(callback: (step: number, time: number) => void): () => void {
    this.stepCallbacks.push(callback);
    return () => {
      this.stepCallbacks = this.stepCallbacks.filter((cb) => cb !== callback);
    };
  }

  private runScheduler = () => {
    if (!this.isPlaying || !this.ctx) return;

    // While there are notes that will need to play before next interval, schedule them
    while (this.nextStepTime < this.ctx.currentTime + this.scheduleAheadSec) {
      this.scheduleStep(this.currentStep, this.nextStepTime);
      this.advanceStep();
    }

    this.timerId = window.setTimeout(this.runScheduler, this.lookaheadMs);
  };

  private advanceStep(): void {
    // 16th note duration = (60 / bpm) / 4 seconds
    const secondsPer16th = 60.0 / this.bpm / 4.0;

    // Apply swing on odd steps (16th notes 1, 3, 5...)
    let swingOffset = 0;
    if (this.currentStep % 2 === 1) {
      swingOffset = secondsPer16th * (this.swing * 0.5);
    }

    this.nextStepTime += secondsPer16th + swingOffset;
    this.currentStep++;
  }

  private scheduleStep(step: number, time: number): void {
    // Trigger metronome if enabled
    if (this.metronomeEnabled && this.ctx) {
      const beatInBar = Math.floor((step % 16) / 4);
      const isFirst16thOfBeat = step % 4 === 0;
      if (isFirst16thOfBeat) {
        this.playMetronomeTick(time, beatInBar === 0);
      }
    }

    // Call registered step callbacks
    for (const cb of this.stepCallbacks) {
      cb(step, time);
    }
  }

  private playMetronomeTick(time: number, isAccent: boolean): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isAccent ? 1600 : 900, time);

    gain.gain.setValueAtTime(isAccent ? 0.35 : 0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  // --- VIRTUAL SYNTHESIZERS & DRUM DSP VOICES ---

  /**
   * Synthesize or trigger an authentic drum hit
   */
  public triggerDrum(
    type: string,
    velocity: number = 0.9,
    time?: number,
    busId: string = 'bus_drums',
    pitchOffset: number = 0
  ): void {
    if (!this.ctx) return;
    const playTime = time ?? this.ctx.currentTime;
    const destination = this.getBus(busId)?.gain || this.masterGain;
    if (!destination) return;

    const basePitchRatio = Math.pow(2, pitchOffset / 12);

    switch (type.toLowerCase()) {
      case 'kick': {
        // Deep punchy acoustic/electronic kick
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        // Pitch sweep
        osc.frequency.setValueAtTime(155 * basePitchRatio, playTime);
        osc.frequency.exponentialRampToValueAtTime(45 * basePitchRatio, playTime + 0.08);

        // Click transient
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(450 * basePitchRatio, playTime);
        clickGain.gain.setValueAtTime(0.4 * velocity, playTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.015);
        clickOsc.connect(clickGain);
        clickGain.connect(destination);
        clickOsc.start(playTime);
        clickOsc.stop(playTime + 0.02);

        // Sub body envelope
        gain.gain.setValueAtTime(1.0 * velocity, playTime);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.35);

        osc.connect(gain);
        gain.connect(destination);

        osc.start(playTime);
        osc.stop(playTime + 0.4);
        break;
      }

      case 'snare': {
        // Body tone
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(190 * basePitchRatio, playTime);
        osc.frequency.exponentialRampToValueAtTime(80 * basePitchRatio, playTime + 0.07);
        oscGain.gain.setValueAtTime(0.6 * velocity, playTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.12);
        osc.connect(oscGain);
        oscGain.connect(destination);
        osc.start(playTime);
        osc.stop(playTime + 0.15);

        // Filtered white noise snap
        const noiseBuffer = this.createNoiseBuffer(0.2);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1000 * basePitchRatio, playTime);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.8 * velocity, playTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.18);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(destination);

        noiseSource.start(playTime);
        noiseSource.stop(playTime + 0.2);
        break;
      }

      case 'clap': {
        // Multi-burst clap
        const bursts = [0, 0.012, 0.024];
        bursts.forEach((offset, idx) => {
          if (!this.ctx) return;
          const noiseBuffer = this.createNoiseBuffer(0.18);
          const noiseSource = this.ctx.createBufferSource();
          noiseSource.buffer = noiseBuffer;

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1200 * basePitchRatio, playTime + offset);
          filter.Q.setValueAtTime(2.0, playTime + offset);

          const gain = this.ctx.createGain();
          const amp = (idx === 2 ? 0.9 : 0.4) * velocity;
          gain.gain.setValueAtTime(amp, playTime + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, playTime + offset + (idx === 2 ? 0.16 : 0.018));

          noiseSource.connect(filter);
          filter.connect(gain);
          gain.connect(destination);

          noiseSource.start(playTime + offset);
          noiseSource.stop(playTime + offset + 0.2);
        });
        break;
      }

      case 'hihat':
      case 'hihat_closed': {
        // Crisp high metallic noise
        const noiseBuffer = this.createNoiseBuffer(0.06);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(8000 * basePitchRatio, playTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.7 * velocity, playTime);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.045);

        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        noiseSource.start(playTime);
        noiseSource.stop(playTime + 0.06);
        break;
      }

      case 'openhat':
      case 'hihat_open': {
        const noiseBuffer = this.createNoiseBuffer(0.35);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000 * basePitchRatio, playTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.65 * velocity, playTime);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.32);

        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        noiseSource.start(playTime);
        noiseSource.stop(playTime + 0.35);
        break;
      }

      case 'amapiano_logdrum':
      case 'logdrum': {
        // Characteristic South African Amapiano Log Drum:
        // Deep square/sine pitch sweep with woody mid slap and thick sub harmonics
        const osc = this.ctx.createOscillator();
        const oscSub = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'square';
        oscSub.type = 'sine';

        const rootHz = 55 * basePitchRatio;
        osc.frequency.setValueAtTime(rootHz * 2.8, playTime);
        osc.frequency.exponentialRampToValueAtTime(rootHz, playTime + 0.06);

        oscSub.frequency.setValueAtTime(rootHz * 1.5, playTime);
        oscSub.frequency.exponentialRampToValueAtTime(rootHz * 0.5, playTime + 0.09);

        // Lowpass filter envelope for woody knock
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800 * basePitchRatio, playTime);
        filter.frequency.exponentialRampToValueAtTime(140 * basePitchRatio, playTime + 0.08);
        filter.Q.setValueAtTime(3.5, playTime);

        gain.gain.setValueAtTime(1.1 * velocity, playTime);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.45);

        osc.connect(filter);
        oscSub.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        osc.start(playTime);
        oscSub.start(playTime);
        osc.stop(playTime + 0.5);
        oscSub.stop(playTime + 0.5);
        break;
      }

      case 'shaker':
      case 'perc_shaker':
      case 'amayugi': {
        // Rwandan Amayugi / Afrobeats Shaker:
        // Multi-grain metallic seed shaker burst
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.1);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(4500 * basePitchRatio, playTime);
        filter.Q.setValueAtTime(3.0, playTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, playTime);
        gain.gain.linearRampToValueAtTime(0.7 * velocity, playTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.085);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        noise.start(playTime);
        noise.stop(playTime + 0.09);
        break;
      }

      case 'rim':
      case 'rimshot': {
        // High wooden acoustic rim
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(900 * basePitchRatio, playTime);
        osc.frequency.exponentialRampToValueAtTime(350 * basePitchRatio, playTime + 0.03);

        gain.gain.setValueAtTime(0.8 * velocity, playTime);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.06);

        osc.connect(gain);
        gain.connect(destination);

        osc.start(playTime);
        osc.stop(playTime + 0.07);
        break;
      }

      case '808':
      case '808_sub': {
        // Tuned 808 Sub Bass
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const shaper = this.ctx.createWaveShaper();
        shaper.curve = makeDistortionCurve(10) as any;

        osc.type = 'sine';
        const startFreq = 140 * basePitchRatio;
        const subFreq = 42 * basePitchRatio;

        osc.frequency.setValueAtTime(startFreq, playTime);
        osc.frequency.exponentialRampToValueAtTime(subFreq, playTime + 0.07);

        gain.gain.setValueAtTime(1.0 * velocity, playTime);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.85);

        osc.connect(shaper);
        shaper.connect(gain);
        gain.connect(destination);

        osc.start(playTime);
        osc.stop(playTime + 0.9);
        break;
      }

      default: {
        // Fallback acoustic tom/conga
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240 * basePitchRatio, playTime);
        osc.frequency.exponentialRampToValueAtTime(110 * basePitchRatio, playTime + 0.1);
        gain.gain.setValueAtTime(0.7 * velocity, playTime);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.22);
        osc.connect(gain);
        gain.connect(destination);
        osc.start(playTime);
        osc.stop(playTime + 0.25);
      }
    }
  }

  /**
   * Play a polyphonic or melodic synthesizer note for virtual instruments
   */
  public playInstrumentNote(
    instrument: InstrumentType,
    midi: number,
    velocity: number = 0.8,
    durationSec: number = 0.5,
    time?: number,
    busId: string = 'bus_instruments',
    customPreset?: any
  ): { stop: () => void } {
    if (!this.ctx) return { stop: () => {} };
    const playTime = time ?? this.ctx.currentTime;
    const destination = this.getBus(busId)?.gain || this.masterGain;
    if (!destination) return { stop: () => {} };

    const freq = midiToFreq(midi);

    switch (instrument) {
      case 'piano': {
        // FIesta Grand Piano: 3 harmonic sines + acoustic hammer tap + damper release
        const fundamental = this.ctx.createOscillator();
        const harmonic2 = this.ctx.createOscillator();
        const harmonic3 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        fundamental.type = 'triangle';
        fundamental.frequency.setValueAtTime(freq, playTime);

        harmonic2.type = 'sine';
        harmonic2.frequency.setValueAtTime(freq * 2, playTime);

        harmonic3.type = 'sine';
        harmonic3.frequency.setValueAtTime(freq * 3, playTime);

        // Filter velocity sensitivity
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(Math.min(12000, freq * 4.5 * (0.4 + 0.6 * velocity)), playTime);
        filter.frequency.exponentialRampToValueAtTime(Math.max(200, freq * 1.5), playTime + durationSec);

        // Hammer transient click
        const hammer = this.ctx.createOscillator();
        const hammerGain = this.ctx.createGain();
        hammer.type = 'sine';
        hammer.frequency.setValueAtTime(freq * 6, playTime);
        hammerGain.gain.setValueAtTime(0.15 * velocity, playTime);
        hammerGain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.02);
        hammer.connect(hammerGain);
        hammerGain.connect(filter);
        hammer.start(playTime);
        hammer.stop(playTime + 0.025);

        // Piano envelope
        gain.gain.setValueAtTime(0.001, playTime);
        gain.gain.linearRampToValueAtTime(0.85 * velocity, playTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.4 * velocity, playTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + durationSec + 0.25);

        fundamental.connect(filter);
        harmonic2.connect(filter);
        harmonic3.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        fundamental.start(playTime);
        harmonic2.start(playTime);
        harmonic3.start(playTime);

        const stopTime = playTime + durationSec + 0.3;
        fundamental.stop(stopTime);
        harmonic2.stop(stopTime);
        harmonic3.stop(stopTime);

        return {
          stop: () => {
            try {
              gain.gain.cancelScheduledValues(this.ctx!.currentTime);
              gain.gain.linearRampToValueAtTime(0.001, this.ctx!.currentTime + 0.05);
            } catch {}
          },
        };
      }

      case 'keys': {
        // FIesta Keys: Electric Rhodes/Wurlitzer FM style
        const carrier = this.ctx.createOscillator();
        const modulator = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const gain = this.ctx.createGain();

        carrier.type = 'sine';
        carrier.frequency.setValueAtTime(freq, playTime);

        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(freq * 2, playTime); // 2:1 FM ratio

        modGain.gain.setValueAtTime(freq * 1.5 * velocity, playTime);
        modGain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.3);

        modulator.connect(modGain);
        modGain.connect(carrier.frequency);

        gain.gain.setValueAtTime(0.001, playTime);
        gain.gain.linearRampToValueAtTime(0.8 * velocity, playTime + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.5 * velocity, playTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + durationSec + 0.3);

        carrier.connect(gain);
        gain.connect(destination);

        carrier.start(playTime);
        modulator.start(playTime);

        const stopTime = playTime + durationSec + 0.35;
        carrier.stop(stopTime);
        modulator.stop(stopTime);

        return {
          stop: () => {
            try {
              gain.gain.cancelScheduledValues(this.ctx!.currentTime);
              gain.gain.linearRampToValueAtTime(0.001, this.ctx!.currentTime + 0.05);
            } catch {}
          },
        };
      }

      case 'bass': {
        // FIesta Bass: Dual Saw/Square analog synth bass with punch
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, playTime);

        osc2.type = 'square';
        osc2.frequency.setValueAtTime(freq * 0.5, playTime); // Sub octave

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 5 * velocity, playTime);
        filter.frequency.exponentialRampToValueAtTime(freq * 1.2, playTime + 0.15);
        filter.Q.setValueAtTime(4.0, playTime);

        gain.gain.setValueAtTime(0.001, playTime);
        gain.gain.linearRampToValueAtTime(0.9 * velocity, playTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.7 * velocity, playTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + durationSec + 0.08);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        osc1.start(playTime);
        osc2.start(playTime);

        const stopTime = playTime + durationSec + 0.1;
        osc1.stop(stopTime);
        osc2.stop(stopTime);

        return {
          stop: () => {
            try {
              gain.gain.cancelScheduledValues(this.ctx!.currentTime);
              gain.gain.linearRampToValueAtTime(0.001, this.ctx!.currentTime + 0.04);
            } catch {}
          },
        };
      }

      case '808': {
        // Melodic tuned 808
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const shaper = this.ctx.createWaveShaper();
        shaper.curve = makeDistortionCurve(15) as any;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 1.8, playTime);
        osc.frequency.exponentialRampToValueAtTime(freq, playTime + 0.05);

        gain.gain.setValueAtTime(1.0 * velocity, playTime);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + Math.max(0.6, durationSec + 0.2));

        osc.connect(shaper);
        shaper.connect(gain);
        gain.connect(destination);

        osc.start(playTime);
        const stopTime = playTime + Math.max(0.65, durationSec + 0.25);
        osc.stop(stopTime);

        return {
          stop: () => {
            try {
              gain.gain.cancelScheduledValues(this.ctx!.currentTime);
              gain.gain.linearRampToValueAtTime(0.001, this.ctx!.currentTime + 0.04);
            } catch {}
          },
        };
      }

      case 'pluck': {
        // FIesta Pluck / Inanga Pluck: Fast transient string pluck with resonant decay
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, playTime);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 1.003, playTime); // Micro-detune

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 8 * velocity, playTime);
        filter.frequency.exponentialRampToValueAtTime(freq * 1.5, playTime + 0.09);
        filter.Q.setValueAtTime(5.0, playTime);

        gain.gain.setValueAtTime(0.001, playTime);
        gain.gain.linearRampToValueAtTime(0.9 * velocity, playTime + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + Math.min(0.4, durationSec + 0.1));

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        osc.start(playTime);
        osc2.start(playTime);

        const stopTime = playTime + Math.min(0.45, durationSec + 0.15);
        osc.stop(stopTime);
        osc2.stop(stopTime);

        return {
          stop: () => {
            try {
              gain.gain.cancelScheduledValues(this.ctx!.currentTime);
              gain.gain.linearRampToValueAtTime(0.001, this.ctx!.currentTime + 0.03);
            } catch {}
          },
        };
      }

      case 'pad': {
        // FIesta Ambient Pad: Warm detuned supersaw/triangle pad with slow attack
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq * 0.996, playTime);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 1.004, playTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(Math.min(4500, freq * 3.5), playTime);
        filter.Q.setValueAtTime(1.8, playTime);

        // Slow warm attack
        const attack = 0.2;
        gain.gain.setValueAtTime(0.001, playTime);
        gain.gain.linearRampToValueAtTime(0.65 * velocity, playTime + attack);
        gain.gain.setValueAtTime(0.65 * velocity, playTime + durationSec);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + durationSec + 0.4);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        osc1.start(playTime);
        osc2.start(playTime);

        const stopTime = playTime + durationSec + 0.5;
        osc1.stop(stopTime);
        osc2.stop(stopTime);

        return {
          stop: () => {
            try {
              gain.gain.cancelScheduledValues(this.ctx!.currentTime);
              gain.gain.linearRampToValueAtTime(0.001, this.ctx!.currentTime + 0.15);
            } catch {}
          },
        };
      }

      case 'synth':
      default: {
        // FIesta Subtractive Synth
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = customPreset?.oscWave || 'sawtooth';
        osc.frequency.setValueAtTime(freq, playTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(customPreset?.cutoff || freq * 4, playTime);
        filter.Q.setValueAtTime(customPreset?.resonance || 2.0, playTime);

        gain.gain.setValueAtTime(0.001, playTime);
        gain.gain.linearRampToValueAtTime(0.8 * velocity, playTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + durationSec + 0.1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        osc.start(playTime);
        const stopTime = playTime + durationSec + 0.15;
        osc.stop(stopTime);

        return {
          stop: () => {
            try {
              gain.gain.cancelScheduledValues(this.ctx!.currentTime);
              gain.gain.linearRampToValueAtTime(0.001, this.ctx!.currentTime + 0.05);
            } catch {}
          },
        };
      }
    }
  }

  // --- AUDIO FILE / SAMPLE PLAYBACK ---
  public playAudioBuffer(
    buffer: AudioBuffer,
    time?: number,
    busId: string = 'bus_master',
    volume: number = 1.0,
    pan: number = 0.0
  ): AudioBufferSourceNode | null {
    if (!this.ctx) return null;
    const playTime = time ?? this.ctx.currentTime;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, playTime);

    let panner: StereoPannerNode | null = null;
    try {
      panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(pan, playTime);
    } catch {}

    const destination = this.getBus(busId)?.gain || this.masterGain;
    if (!destination) return null;

    if (panner) {
      source.connect(gain);
      gain.connect(panner);
      panner.connect(destination);
    } else {
      source.connect(gain);
      gain.connect(destination);
    }

    source.start(playTime);
    return source;
  }

  // --- DECODE AUDIO FILE FROM BLOB / ARRAYBUFFER ---
  public async decodeAudioData(data: ArrayBuffer): Promise<AudioBuffer> {
    await this.init();
    return await this.ctx!.decodeAudioData(data);
  }

  // Helper for generating white noise buffer
  private createNoiseBuffer(duration: number): AudioBuffer {
    const sampleRate = this.ctx!.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = this.ctx!.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // --- OFFLINE RENDERING & EXPORT (WAV 16/24/32-bit) ---
  public async renderProjectToWav(
    tracks: any[],
    drumChannels: DrumChannel[],
    bpm: number,
    totalBars: number,
    sampleRate: number = 44100,
    bitDepth: 16 | 24 | 32 = 16
  ): Promise<Blob> {
    const totalBeats = totalBars * 4;
    const durationSeconds = (totalBeats * 60) / bpm + 2.0; // Add 2s tail for reverb/delay

    const OfflineCtxClass = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
    const offlineCtx = new OfflineCtxClass(2, Math.ceil(durationSeconds * sampleRate), sampleRate);

    const masterGain = offlineCtx.createGain();
    masterGain.gain.setValueAtTime(0.85, 0);

    const limiter = offlineCtx.createDynamicsCompressor();
    limiter.threshold.setValueAtTime(-0.5, 0);
    limiter.ratio.setValueAtTime(20.0, 0);
    masterGain.connect(limiter);
    limiter.connect(offlineCtx.destination);

    // Check solo state across tracks
    const hasAnySolo = tracks.some((t) => t.solo);

    // Schedule drum channels if audible
    const drumTrack = tracks.find((t) => t.id === 'track_drums' || t.type === 'drums');
    const drumsAudible = (!drumTrack || !drumTrack.mute) && (!hasAnySolo || (drumTrack && drumTrack.solo));

    const secondsPer16th = 60.0 / bpm / 4.0;
    const totalSteps = totalBars * 16;

    if (drumsAudible) {
      for (let step = 0; step < totalSteps; step++) {
        const stepTime = step * secondsPer16th;
        const patternStep = step % 16;

        for (const channel of drumChannels) {
          if (!channel.mute && channel.steps[patternStep]) {
            const vel = channel.velocities[patternStep] ?? 0.85;
            // Render drum hit in offline context
            this.renderDrumHitOffline(offlineCtx, channel.type, vel, stepTime, masterGain);
          }
        }
      }
    }

    // Schedule tracks and clips
    for (const track of tracks) {
      if (track.mute) continue;
      if (hasAnySolo && !track.solo) continue;
      for (const clip of track.clips || []) {
        const clipStartTime = (clip.startBar - 1) * 4 * (60.0 / bpm);
        if (clip.notes && clip.notes.length > 0) {
          for (const note of clip.notes) {
            const noteStartTime = clipStartTime + note.startStep * secondsPer16th;
            const noteDuration = note.durationSteps * secondsPer16th;
            this.renderNoteOffline(
              offlineCtx,
              track.instrumentType || 'piano',
              note.midi,
              note.velocity || 0.8,
              noteStartTime,
              noteDuration,
              masterGain
            );
          }
        }
      }
    }

    const renderedBuffer = await offlineCtx.startRendering();
    return this.encodeWav(renderedBuffer, bitDepth);
  }

  private renderDrumHitOffline(ctx: BaseAudioContext, type: string, velocity: number, time: number, dest: AudioNode) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type.includes('kick')) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(45, time + 0.08);
      gain.gain.setValueAtTime(velocity, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.36);
    } else if (type.includes('snare') || type.includes('clap')) {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, time);
      osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);
      gain.gain.setValueAtTime(velocity * 0.7, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.16);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, time);
      gain.gain.setValueAtTime(velocity * 0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.07);
    }
  }

  private renderNoteOffline(
    ctx: BaseAudioContext,
    instrument: InstrumentType,
    midi: number,
    velocity: number,
    time: number,
    duration: number,
    dest: AudioNode
  ) {
    const freq = midiToFreq(midi);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = instrument === 'bass' ? 'sawtooth' : instrument === 'pad' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.8 * velocity, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration + 0.1);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + duration + 0.15);
  }

  private encodeWav(audioBuffer: AudioBuffer, bitDepth: 16 | 24 | 32 = 16): Blob {
    const numOfChan = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChan * (bitDepth / 8) + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels: Float32Array[] = [];
    let sample = 0;
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) {
      out.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      out.setUint32(pos, data, true);
      pos += 4;
    }

    // RIFF chunk descriptor
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    // FMT sub-chunk
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // Subchunk1Size (16 for PCM)
    setUint16(bitDepth === 32 ? 3 : 1); // AudioFormat 1 = PCM, 3 = IEEE float
    setUint16(numOfChan);
    setUint32(audioBuffer.sampleRate);
    setUint32(audioBuffer.sampleRate * numOfChan * (bitDepth / 8)); // byte rate
    setUint16(numOfChan * (bitDepth / 8)); // block align
    setUint16(bitDepth); // bits per sample

    // Data sub-chunk
    setUint32(0x61746164); // "data" chunk
    setUint32(length - pos - 4); // Subchunk2Size

    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        if (bitDepth === 16) {
          sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
          out.setInt16(pos, sample, true);
          pos += 2;
        } else if (bitDepth === 24) {
          sample = (0.5 + sample < 0 ? sample * 8388608 : sample * 8388607) | 0;
          out.setUint8(pos, sample & 0xff);
          out.setUint8(pos + 1, (sample >> 8) & 0xff);
          out.setUint8(pos + 2, (sample >> 16) & 0xff);
          pos += 3;
        } else {
          out.setFloat32(pos, sample, true);
          pos += 4;
        }
      }
      offset++;
    }

    return new Blob([out.buffer], { type: 'audio/wav' });
  }
}

// Singleton AudioEngine instance
export const audioEngine = new AudioEngine();
