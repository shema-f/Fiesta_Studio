/**
 * FIesta Studio - Core Data Models and Type Definitions
 */

export type InstrumentType =
  | 'piano'
  | 'keys'
  | 'bass'
  | '808'
  | 'synth'
  | 'drums'
  | 'pluck'
  | 'pad';

export type EffectType =
  | 'eq'
  | 'compressor'
  | 'limiter'
  | 'reverb'
  | 'delay'
  | 'distortion'
  | 'chorus'
  | 'filter';

export interface Note {
  id: string;
  midi: number;
  noteName: string;
  startStep: number;     // In 16th notes (e.g. 0 = bar 1 beat 1, 16 = bar 2 beat 1)
  durationSteps: number; // Duration in 16th notes (e.g. 1 = 16th, 4 = quarter note)
  velocity: number;      // 0.0 to 1.0
  probability?: number;  // 0.0 to 1.0
}

export interface DrumStep {
  active: boolean;
  velocity: number;
  probability?: number;
}

export interface DrumChannel {
  id: string;
  name: string;
  type: string; // 'kick' | 'snare' | 'clap' | 'hihat' | 'openhat' | '808' | 'logdrum' | 'shaker' | 'rim' | 'conga' | 'african'
  steps: boolean[]; // 16 or 32 steps
  velocities: number[];
  volume: number; // 0 to 1.5
  pan: number; // -1.0 to 1.0
  pitch: number; // -12 to 12 semitones
  mute: boolean;
  solo: boolean;
  customSampleUrl?: string;
  audioBuffer?: AudioBuffer;
}

export type ClipType = 'pattern' | 'audio' | 'midi';

export interface Clip {
  id: string;
  trackId: string;
  type: ClipType;
  name: string;
  startBar: number;   // 1.0, 1.25, 2.0 etc.
  lengthBars: number; // e.g. 4 bars
  color: string;
  patternId?: string;
  notes?: Note[];
  audioBufferId?: string;
  audioBuffer?: AudioBuffer;
  waveformPoints?: number[];
  fadeInBars?: number;
  fadeOutBars?: number;
  volume?: number;
}

export interface EffectPlugin {
  id: string;
  type: EffectType;
  name: string;
  enabled: boolean;
  params: Record<string, number>;
}

export interface Track {
  id: string;
  name: string;
  type: 'midi' | 'audio' | 'drums';
  color: string;
  instrumentType: InstrumentType;
  instrumentPreset?: string;
  volume: number; // 0.0 to 1.5 (1.0 = 0dB)
  pan: number;    // -1.0 to 1.0
  mute: boolean;
  solo: boolean;
  busId: string;
  inserts: EffectPlugin[];
  clips: Clip[];
}

export interface Bus {
  id: string;
  name: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  inserts: EffectPlugin[];
}

export interface Pattern {
  id: string;
  name: string;
  lengthSteps: number; // 16, 32, 64
  drumChannels?: DrumChannel[];
}

export interface SampleMetadata {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  durationSec: number;
  bpm?: number;
  key?: string;
  source: string;
  creator: string;
  license: 'CC0' | 'CC-BY' | 'Royalty-Free' | 'Public Domain';
  attributionRequired: boolean;
  commercialUse: 'Allowed' | 'Attribution Required' | 'Non-Commercial';
  url: string;
  tags: string[];
}

export interface ProjectMetadata {
  id: string;
  name: string;
  artist: string;
  bpm: number;
  timeSignature: [number, number];
  key: string;
  scale: string;
  swing: number; // 0.0 to 0.75
  createdAt: number;
  updatedAt: number;
  version: string;
}

export type ViewMode =
  | 'arrangement'
  | 'channelRack'
  | 'pianoRoll'
  | 'mixer'
  | 'instruments'
  | 'effects'
  | 'sampleHub'
  | 'aiAssistant'
  | 'mastering';
