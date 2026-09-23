# MIDI Piano Roll Architecture

The **FIesta Piano Roll** (`src/components/PianoRollModal.tsx`) provides note manipulation, melodic composition, scale snapping, and MIDI file generation.

---

## 1. Key Capabilities

- **88-Key Virtual Piano Keyboard:** Full MIDI octave range (C0 to B8 / MIDI notes 12 to 108) with interactive note preview.
- **Scale Highlighting & Snapping:** Visual quantization preventing out-of-key note entries.
- **Rwandan Inanga Pentatonic Support:** Dedicated mathematical scale intervals modeled on traditional Rwandan trough zither tuning.
- **Chord Assistant:** Single-click insertion of complex jazz and Amapiano chord voicings (Min9, Maj7, Dom7, Add9).
- **Standard MIDI Export:** Pure JavaScript binary generation of standard `.mid` Type 0 and Type 1 files.

---

## 2. Scale Intervals & Mathematical Representation

Scales are defined as semitone offsets from root note $N_{root}$:

| Scale | Interval Array | Cultural / Musical Genre |
| :--- | :--- | :--- |
| **Natural Minor** | `[0, 2, 3, 5, 7, 8, 10]` | Melodic Afrobeats, Hip-Hop, Pop |
| **Major** | `[0, 2, 4, 5, 7, 9, 11]` | Gospel, Pop, Classical |
| **Inanga Pentatonic** | `[0, 2, 4, 7, 9]` | Rwandan Traditional Music |
| **Minor Pentatonic** | `[0, 3, 5, 7, 10]` | Blues, Rock, African Folk |
| **Dorian Mode** | `[0, 2, 3, 5, 7, 9, 10]` | Deep House, Amapiano, Jazz |

---

## 3. Standard MIDI File Generator

The Piano Roll includes an in-memory binary `.mid` generator:
1. Emits standard MIDI header chunk (`MThd`) specifying 480 PPQ (Pulses Per Quarter note).
2. Encodes track chunk (`MTrk`) with variable-length quantity (VLQ) delta times.
3. Formats `NoteOn` (`0x90`), `NoteOff` (`0x80`), and End-Of-Track meta events (`0xFF 0x2F 0x00`).
4. Generates an instant downloadable Blob URL (`audio/midi`).
