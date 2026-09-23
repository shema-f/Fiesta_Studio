/**
 * FIesta Studio - Central DAW Project State Management
 * Handles multitrack arrangement, drum channels, mixer routing,
 * playback timeline, undo/redo history, and autosave.
 */

import { Track, DrumChannel, Bus, Clip, Note, ViewMode, EffectPlugin, InstrumentType } from '../types/daw';
import { audioEngine, midiToNoteName } from '../audio/audioEngine';

export type { Track, DrumChannel, Bus, Clip, Note, ViewMode, EffectPlugin, InstrumentType };

export interface ProjectState {
  id: string;
  name: string;
  bpm: number;
  timeSignature: [number, number];
  key: string;
  scale: string;
  swing: number; // 0.0 to 0.75
  playheadBar: number;
  isPlaying: boolean;
  isRecording: boolean;
  isLooping: boolean;
  loopStartBar: number;
  loopEndBar: number;
  current16thStep: number;
  metronome: boolean;
  masterVolume: number;

  tracks: Track[];
  buses: Bus[];
  drumChannels: DrumChannel[];
  activeTrackId: string | null;
  activeClipId: string | null;
  activePatternStepCount: 16 | 32 | 64;

  viewMode: ViewMode;
  bottomPanelOpen: boolean;
  activeInstrumentType: InstrumentType;

  // History for Undo / Redo
  past: string[];
  future: string[];

  // CPU and Engine status
  cpuLoad: number;
  latencyMs: number;
  lastSavedAt: number;
}

const DEFAULT_DRUM_CHANNELS: DrumChannel[] = [
  {
    id: 'drum_kick',
    name: 'Kick',
    type: 'kick',
    steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
    velocities: [0.95, 0, 0, 0, 0.95, 0, 0, 0, 0.95, 0, 0, 0, 0.95, 0, 0, 0],
    volume: 1.0,
    pan: 0,
    pitch: 0,
    mute: false,
    solo: false,
  },
  {
    id: 'drum_snare',
    name: 'Snare',
    type: 'snare',
    steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    velocities: [0, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 0, 0, 0.9, 0, 0, 0],
    volume: 0.9,
    pan: 0,
    pitch: 0,
    mute: false,
    solo: false,
  },
  {
    id: 'drum_clap',
    name: 'Clap',
    type: 'clap',
    steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    velocities: [0, 0, 0, 0, 0.85, 0, 0, 0, 0, 0, 0, 0, 0.85, 0, 0, 0],
    volume: 0.85,
    pan: 0.1,
    pitch: 0,
    mute: false,
    solo: false,
  },
  {
    id: 'drum_hat',
    name: 'Closed Hat',
    type: 'hihat_closed',
    steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    velocities: [0.7, 0.4, 0.6, 0.4, 0.7, 0.4, 0.6, 0.4, 0.7, 0.4, 0.6, 0.4, 0.7, 0.4, 0.6, 0.4],
    volume: 0.75,
    pan: -0.2,
    pitch: 0,
    mute: false,
    solo: false,
  },
  {
    id: 'drum_openhat',
    name: 'Open Hat',
    type: 'hihat_open',
    steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
    velocities: [0, 0, 0.7, 0, 0, 0, 0.7, 0, 0, 0, 0.7, 0, 0, 0, 0.7, 0],
    volume: 0.65,
    pan: 0.25,
    pitch: 0,
    mute: false,
    solo: false,
  },
  {
    id: 'drum_log',
    name: 'Amapiano Log Drum',
    type: 'amapiano_logdrum',
    steps: [true, false, true, false, false, true, false, true, false, true, true, false, false, true, false, false],
    velocities: [1.0, 0, 0.85, 0, 0, 0.9, 0, 0.8, 0, 0.9, 0.95, 0, 0, 0.85, 0, 0],
    volume: 1.1,
    pan: 0,
    pitch: 0,
    mute: false,
    solo: false,
  },
  {
    id: 'drum_shaker',
    name: 'Amayugi Shaker',
    type: 'perc_shaker',
    steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    velocities: [0.55, 0.35, 0.75, 0.4, 0.55, 0.35, 0.8, 0.4, 0.55, 0.35, 0.75, 0.4, 0.6, 0.35, 0.85, 0.4],
    volume: 0.7,
    pan: 0.3,
    pitch: 0,
    mute: false,
    solo: false,
  },
  {
    id: 'drum_808',
    name: '808 Sub',
    type: '808_sub',
    steps: [true, false, false, false, false, false, false, true, false, false, true, false, false, false, false, false],
    velocities: [0.95, 0, 0, 0, 0, 0, 0, 0.85, 0, 0, 0.9, 0, 0, 0, 0, 0],
    volume: 1.0,
    pan: 0,
    pitch: 0,
    mute: false,
    solo: false,
  },
  {
    id: 'drum_rim',
    name: 'African Rim Tap',
    type: 'rim',
    steps: [false, false, true, false, false, false, false, true, false, false, true, false, false, false, true, false],
    velocities: [0, 0, 0.8, 0, 0, 0, 0, 0.8, 0, 0, 0.8, 0, 0, 0, 0.8, 0],
    volume: 0.8,
    pan: -0.15,
    pitch: 0,
    mute: false,
    solo: false,
  },
];

const DEFAULT_EFFECTS: EffectPlugin[] = [
  {
    id: 'eff_eq_1',
    type: 'eq',
    name: 'FIesta Parametric EQ',
    enabled: true,
    params: { low: 0, mid: 0, high: 1.5, lowCut: 30, highCut: 18000 },
  },
  {
    id: 'eff_comp_1',
    type: 'compressor',
    name: 'FIesta Bus Compressor',
    enabled: true,
    params: { threshold: -12, ratio: 3.0, attack: 20, release: 120, makeupGain: 1.2 },
  },
  {
    id: 'eff_reverb_1',
    type: 'reverb',
    name: 'FIesta Studio Reverb',
    enabled: true,
    params: { roomSize: 0.5, damping: 0.4, mix: 0.22 },
  },
  {
    id: 'eff_delay_1',
    type: 'delay',
    name: 'FIesta Ping-Pong Delay',
    enabled: false,
    params: { time: 0.35, feedback: 0.4, mix: 0.25 },
  },
];

const INITIAL_PIANO_NOTES: Note[] = [
  // F#m9 Chord (Amapiano/Soul vibe)
  { id: 'n1', midi: 54, noteName: 'F#3', startStep: 0, durationSteps: 8, velocity: 0.8 },
  { id: 'n2', midi: 57, noteName: 'A3', startStep: 0, durationSteps: 8, velocity: 0.75 },
  { id: 'n3', midi: 61, noteName: 'C#4', startStep: 0, durationSteps: 8, velocity: 0.75 },
  { id: 'n4', midi: 64, noteName: 'E4', startStep: 0, durationSteps: 8, velocity: 0.7 },
  { id: 'n5', midi: 68, noteName: 'G#4', startStep: 0, durationSteps: 8, velocity: 0.7 },

  // Bm7 Chord
  { id: 'n6', midi: 59, noteName: 'B3', startStep: 8, durationSteps: 8, velocity: 0.8 },
  { id: 'n7', midi: 62, noteName: 'D4', startStep: 8, durationSteps: 8, velocity: 0.75 },
  { id: 'n8', midi: 66, noteName: 'F#4', startStep: 8, durationSteps: 8, velocity: 0.75 },
  { id: 'n9', midi: 69, noteName: 'A4', startStep: 8, durationSteps: 8, velocity: 0.7 },
];

const INITIAL_LEAD_NOTES: Note[] = [
  { id: 'l1', midi: 69, noteName: 'A4', startStep: 0, durationSteps: 2, velocity: 0.85 },
  { id: 'l2', midi: 71, noteName: 'B4', startStep: 3, durationSteps: 2, velocity: 0.8 },
  { id: 'l3', midi: 73, noteName: 'C#5', startStep: 6, durationSteps: 3, velocity: 0.9 },
  { id: 'l4', midi: 76, noteName: 'E5', startStep: 10, durationSteps: 4, velocity: 0.85 },
];

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'track_drums',
    name: 'Drum Rack & Beats',
    type: 'drums',
    color: '#ff3b69', // Ruby
    instrumentType: 'drums',
    volume: 1.0,
    pan: 0,
    mute: false,
    solo: false,
    busId: 'bus_drums',
    inserts: [DEFAULT_EFFECTS[0]],
    clips: [
      {
        id: 'clip_drums_1',
        trackId: 'track_drums',
        type: 'pattern',
        name: 'Amapiano Bounce 01',
        startBar: 1,
        lengthBars: 4,
        color: '#ff3b69',
      },
      {
        id: 'clip_drums_2',
        trackId: 'track_drums',
        type: 'pattern',
        name: 'Amapiano Bounce 02',
        startBar: 5,
        lengthBars: 4,
        color: '#ff3b69',
      },
    ],
  },
  {
    id: 'track_piano',
    name: 'FIesta Grand Piano',
    type: 'midi',
    color: '#00f0a8', // Emerald
    instrumentType: 'piano',
    volume: 0.85,
    pan: -0.1,
    mute: false,
    solo: false,
    busId: 'bus_instruments',
    inserts: [DEFAULT_EFFECTS[1], DEFAULT_EFFECTS[2]],
    clips: [
      {
        id: 'clip_piano_1',
        trackId: 'track_piano',
        type: 'midi',
        name: 'Chords - F#m9 Progression',
        startBar: 1,
        lengthBars: 4,
        color: '#00f0a8',
        notes: INITIAL_PIANO_NOTES,
      },
      {
        id: 'clip_piano_2',
        trackId: 'track_piano',
        type: 'midi',
        name: 'Chords - F#m9 Progression',
        startBar: 5,
        lengthBars: 4,
        color: '#00f0a8',
        notes: INITIAL_PIANO_NOTES,
      },
    ],
  },
  {
    id: 'track_keys',
    name: 'FIesta Rhodes Keys',
    type: 'midi',
    color: '#38bdf8', // Sky
    instrumentType: 'keys',
    volume: 0.8,
    pan: 0.15,
    mute: false,
    solo: false,
    busId: 'bus_instruments',
    inserts: [],
    clips: [
      {
        id: 'clip_keys_1',
        trackId: 'track_keys',
        type: 'midi',
        name: 'Electric Tines Counter-Melody',
        startBar: 3,
        lengthBars: 4,
        color: '#38bdf8',
        notes: INITIAL_LEAD_NOTES,
      },
    ],
  },
  {
    id: 'track_bass',
    name: 'FIesta Bass / 808',
    type: 'midi',
    color: '#f59e0b', // Amber
    instrumentType: 'bass',
    volume: 0.95,
    pan: 0,
    mute: false,
    solo: false,
    busId: 'bus_drums',
    inserts: [],
    clips: [
      {
        id: 'clip_bass_1',
        trackId: 'track_bass',
        type: 'midi',
        name: 'Log Sub Bassline',
        startBar: 1,
        lengthBars: 8,
        color: '#f59e0b',
        notes: [
          { id: 'b1', midi: 42, noteName: 'F#2', startStep: 0, durationSteps: 4, velocity: 0.9 },
          { id: 'b2', midi: 45, noteName: 'A2', startStep: 4, durationSteps: 4, velocity: 0.85 },
          { id: 'b3', midi: 47, noteName: 'B2', startStep: 8, durationSteps: 4, velocity: 0.9 },
          { id: 'b4', midi: 42, noteName: 'F#2', startStep: 12, durationSteps: 4, velocity: 0.95 },
        ],
      },
    ],
  },
  {
    id: 'track_pluck',
    name: 'Rwandan Inanga Pluck',
    type: 'midi',
    color: '#ec4899', // Pink
    instrumentType: 'pluck',
    volume: 0.85,
    pan: 0.2,
    mute: false,
    solo: false,
    busId: 'bus_instruments',
    inserts: [DEFAULT_EFFECTS[2]],
    clips: [
      {
        id: 'clip_pluck_1',
        trackId: 'track_pluck',
        type: 'midi',
        name: 'Inanga Traditional Arp',
        startBar: 5,
        lengthBars: 4,
        color: '#ec4899',
        notes: [
          { id: 'p1', midi: 69, noteName: 'A4', startStep: 0, durationSteps: 2, velocity: 0.8 },
          { id: 'p2', midi: 73, noteName: 'C#5', startStep: 2, durationSteps: 2, velocity: 0.85 },
          { id: 'p3', midi: 76, noteName: 'E5', startStep: 4, durationSteps: 2, velocity: 0.8 },
          { id: 'p4', midi: 78, noteName: 'F#5', startStep: 6, durationSteps: 2, velocity: 0.9 },
        ],
      },
    ],
  },
  {
    id: 'track_audio',
    name: 'Vocal / Audio Stems',
    type: 'audio',
    color: '#a855f7', // Purple
    instrumentType: 'pad',
    volume: 0.9,
    pan: 0,
    mute: false,
    solo: false,
    busId: 'bus_vocals',
    inserts: [DEFAULT_EFFECTS[2]],
    clips: [],
  },
];

export const INITIAL_BUSES: Bus[] = [
  { id: 'bus_master', name: 'Master Out', volume: 1.0, pan: 0, mute: false, solo: false, inserts: [] },
  { id: 'bus_drums', name: 'Drum Bus', volume: 1.0, pan: 0, mute: false, solo: false, inserts: [] },
  { id: 'bus_vocals', name: 'Vocal Bus', volume: 1.0, pan: 0, mute: false, solo: false, inserts: [] },
  { id: 'bus_instruments', name: 'Instrument Bus', volume: 1.0, pan: 0, mute: false, solo: false, inserts: [] },
  { id: 'bus_fx', name: 'FX Return', volume: 1.0, pan: 0, mute: false, solo: false, inserts: [] },
];

export function getInitialProjectState(): ProjectState {
  // Check local storage for autosaved project
  try {
    const saved = localStorage.getItem('fiesta_autosave_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.tracks && parsed.drumChannels) {
        return {
          ...parsed,
          isPlaying: false,
          isRecording: false,
          playheadBar: 1,
          current16thStep: 0,
          past: [],
          future: [],
          cpuLoad: 2,
          latencyMs: 5.8,
        };
      }
    }
  } catch (e) {
    console.warn('Could not restore autosave, using defaults');
  }

  return {
    id: 'fiesta_proj_' + Date.now(),
    name: 'Amapiano Sunset in Kigali',
    bpm: 113,
    timeSignature: [4, 4],
    key: 'F#',
    scale: 'natural_minor',
    swing: 0.15,
    playheadBar: 1,
    isPlaying: false,
    isRecording: false,
    isLooping: true,
    loopStartBar: 1,
    loopEndBar: 9,
    current16thStep: 0,
    metronome: false,
    masterVolume: 1.0,

    tracks: INITIAL_TRACKS,
    buses: INITIAL_BUSES,
    drumChannels: DEFAULT_DRUM_CHANNELS,
    activeTrackId: 'track_piano',
    activeClipId: 'clip_piano_1',
    activePatternStepCount: 16,

    viewMode: 'arrangement',
    bottomPanelOpen: true,
    activeInstrumentType: 'piano',

    past: [],
    future: [],

    cpuLoad: 3,
    latencyMs: 4.8,
    lastSavedAt: Date.now(),
  };
}
