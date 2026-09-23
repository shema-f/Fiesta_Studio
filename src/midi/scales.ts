/**
 * FIesta Studio - Musical Scales, Chord Assistant & MIDI Engine
 */

export interface ScaleDefinition {
  name: string;
  intervals: number[]; // semitone intervals from root
  description: string;
}

export const SCALES: Record<string, ScaleDefinition> = {
  natural_minor: {
    name: 'Natural Minor (Aeolian)',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: 'The classic emotive, soulful minor scale for Afro-pop, Trap & House.',
  },
  major: {
    name: 'Major (Ionian)',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: 'Bright, uplifting, and anthemic.',
  },
  pentatonic_minor: {
    name: 'Minor Pentatonic',
    intervals: [0, 3, 5, 7, 10],
    description: 'Universal 5-note soulful scale, impossible to hit a wrong note.',
  },
  pentatonic_major: {
    name: 'Major Pentatonic',
    intervals: [0, 2, 4, 7, 9],
    description: 'Warm, folk, gospel, and bright African melodies.',
  },
  harmonic_minor: {
    name: 'Harmonic Minor',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    description: 'Exotic, dramatic tension with raised 7th.',
  },
  melodic_minor: {
    name: 'Melodic Minor',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    description: 'Sophisticated jazz and contemporary RnB lines.',
  },
  blues: {
    name: 'Blues Scale',
    intervals: [0, 3, 5, 6, 7, 10],
    description: 'Iconic blues with flattened 5th blue note.',
  },
  dorian: {
    name: 'Dorian Mode',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    description: 'Smooth, jazzy minor with natural 6th, staples in Amapiano & Deep House.',
  },
  rwandan_inanga: {
    name: 'Rwandan Inanga Pentatonic',
    intervals: [0, 2, 5, 7, 9], // Anhemitonic pentatonic used in traditional Rwandan Inanga & Umuduri
    description: 'Traditional Rwandan Inanga harp scale, deeply meditative and harmonic.',
  },
};

export const CHORD_PRESETS: Record<string, { name: string; semitones: number[] }> = {
  maj: { name: 'Major Triad', semitones: [0, 4, 7] },
  min: { name: 'Minor Triad', semitones: [0, 3, 7] },
  maj7: { name: 'Major 7th', semitones: [0, 4, 7, 11] },
  min7: { name: 'Minor 7th', semitones: [0, 3, 7, 10] },
  dom7: { name: 'Dominant 7th', semitones: [0, 4, 7, 10] },
  min9: { name: 'Minor 9th (Amapiano Jazz)', semitones: [0, 3, 7, 10, 14] },
  maj9: { name: 'Major 9th (Lush)', semitones: [0, 4, 7, 11, 14] },
  sus4: { name: 'Suspended 4th', semitones: [0, 5, 7] },
  dim7: { name: 'Diminished 7th', semitones: [0, 3, 6, 9] },
};

export const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Returns whether a MIDI note number falls within the active root note & scale
 */
export function isNoteInScale(midi: number, rootNote: string = 'A', scaleKey: string = 'natural_minor'): boolean {
  const rootIndex = ROOT_NOTES.indexOf(rootNote);
  if (rootIndex === -1) return true;
  const scale = SCALES[scaleKey] || SCALES.natural_minor;
  const noteIndex = midi % 12;
  const interval = (noteIndex - rootIndex + 12) % 12;
  return scale.intervals.includes(interval);
}

/**
 * Quantize a step or tick to the nearest snap value (1/4, 1/8, 1/16, 1/32)
 */
export function quantizeStep(step: number, snapGrid: number = 1): number {
  return Math.round(step / snapGrid) * snapGrid;
}

/**
 * Humanize notes: subtle random variations in timing and velocity
 */
export function humanizeNotes<T extends { startStep: number; velocity: number }>(
  notes: T[],
  timingAmount: number = 0.05,
  velocityAmount: number = 0.08
): T[] {
  return notes.map((n) => {
    const timeDelta = (Math.random() * 2 - 1) * timingAmount;
    const velDelta = (Math.random() * 2 - 1) * velocityAmount;
    return {
      ...n,
      startStep: Math.max(0, n.startStep + timeDelta),
      velocity: Math.max(0.1, Math.min(1.0, n.velocity + velDelta)),
    };
  });
}

/**
 * Transpose notes by semitones
 */
export function transposeNotes<T extends { midi: number; noteName?: string }>(
  notes: T[],
  semitones: number
): T[] {
  return notes.map((n) => {
    const newMidi = Math.max(12, Math.min(127, n.midi + semitones));
    return {
      ...n,
      midi: newMidi,
    };
  });
}

/**
 * Simple Standard MIDI File (SMF 0) generator for MIDI export
 */
export function generateMidiFile(notes: { midi: number; startStep: number; durationSteps: number; velocity: number }[], bpm: number = 120): Blob {
  // Simple SMF Format 0 Writer
  const ppq = 480; // Pulses per quarter note (each 16th note = ppq / 4 = 120 ticks)
  const ticksPer16th = ppq / 4;

  const events: { tick: number; type: 'on' | 'off'; midi: number; velocity: number }[] = [];

  for (const n of notes) {
    const onTick = Math.round(n.startStep * ticksPer16th);
    const offTick = Math.round((n.startStep + n.durationSteps) * ticksPer16th);
    const vel = Math.round(Math.min(127, Math.max(1, (n.velocity || 0.8) * 127)));

    events.push({ tick: onTick, type: 'on', midi: n.midi, velocity: vel });
    events.push({ tick: offTick, type: 'off', midi: n.midi, velocity: 0 });
  }

  // Sort events chronologically
  events.sort((a, b) => a.tick - b.tick);

  const trackBytes: number[] = [];
  let lastTick = 0;

  function writeVarInt(value: number) {
    let buffer = value & 0x7f;
    while ((value >>= 7)) {
      buffer <<= 8;
      buffer |= (value & 0x7f) | 0x80;
    }
    while (true) {
      trackBytes.push(buffer & 0xff);
      if (buffer & 0x80) buffer >>= 8;
      else break;
    }
  }

  // Tempo meta event: 500,000 microseconds per quarter note for 120 bpm = (60,000,000 / bpm)
  const uspB = Math.round(60000000 / bpm);
  trackBytes.push(0x00, 0xff, 0x51, 0x03, (uspB >> 16) & 0xff, (uspB >> 8) & 0xff, uspB & 0xff);

  for (const e of events) {
    const delta = e.tick - lastTick;
    lastTick = e.tick;
    writeVarInt(delta);

    if (e.type === 'on') {
      trackBytes.push(0x90, e.midi, e.velocity);
    } else {
      trackBytes.push(0x80, e.midi, 0);
    }
  }

  // End of track meta event
  trackBytes.push(0x00, 0xff, 0x2f, 0x00);

  // MThd Header
  const header = [
    0x4d, 0x54, 0x68, 0x64, // "MThd"
    0x00, 0x00, 0x00, 0x06, // length = 6
    0x00, 0x00,             // format 0
    0x00, 0x01,             // 1 track
    (ppq >> 8) & 0xff, ppq & 0xff, // PPQ
  ];

  // MTrk Header
  const trackLen = trackBytes.length;
  const trackHeader = [
    0x4d, 0x54, 0x72, 0x6b, // "MTrk"
    (trackLen >> 24) & 0xff,
    (trackLen >> 16) & 0xff,
    (trackLen >> 8) & 0xff,
    trackLen & 0xff,
  ];

  const fullFile = new Uint8Array([...header, ...trackHeader, ...trackBytes]);
  return new Blob([fullFile], { type: 'audio/midi' });
}
