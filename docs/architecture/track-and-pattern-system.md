# Track & FL Studio Pattern Architecture Specification

## 1. Executive Summary

This document details the architecture and implementation of the **Track Provisioning Engine** and the **Fruity Loops Pattern Management System** introduced in FIesta Studio v0.2.0. These features provide intuitive DAW track management, audio vs. instrument differentiation, hardcoded native sound generators, and pattern creation, cloning, and arrangement stamping.

---

## 2. Track Creation System (`ArrangementView.tsx`)

### 2.1 Trigger Points
Users can initiate new track creation from three distinct UI locations:
- **Arrangement Toolbar:** Primary `Create New Track` action button with plus icon.
- **Track List Header:** Header button adjacent to global track count.
- **Track List Footer:** Convenient button at the bottom of the arrangement channel list.

### 2.2 Track Type Selection Dialog
The creation modal provides two distinct track architectures:

#### A. Instrument Track (`trackType: 'midi' | 'drums'`)
- Designed for melodic instruments, synthesizers, and drum kits triggered via MIDI clips or the piano roll.
- **Hardcoded Built-in Instruments & Generators:**
  - **Sytrus FM Synthesizer:** 6-operator algorithmic FM/additive synthesizer engine with harmonic richness.
  - **3xOsc Multi-Waveform Synth:** Classic subtractive 3-oscillator synth with detune and stereo spread.
  - **African Inanga Pluck:** Authentic sampled Rwandan zither plucked strings.
  - **Amapiano Log Drum:** Tuned percussive sub-bass generator with authentic transient saturation.
  - **Amayugi Shaker:** Traditional Rwandan seed rattle with polyrhythmic groove dynamics.
  - **Intore Royal Drums:** Resonant royal ceremony drums with dynamic acoustic response.
  - **Grand Piano:** Multi-sampled acoustic concert grand.
  - **Clean Electric Bass:** Warm, rounded fingerstyle electric bass.
  - **Rhodes Electric Piano:** Vintage bell-tine electric piano with chorus emulation.
- **Customization:**
  - Track naming with automatic preset name suggestions.
  - 10-shade FL Studio color palette (Electric Orange, Toxic Green, Cyber Cyan, Coral Red, Kigali Gold, Neon Purple, etc.).
  - Default MIDI clip generation placed at measure 0 for immediate composition in Piano Roll.

#### B. Audio Track (`trackType: 'audio'`)
- Dedicated channel for recorded audio signals, microphone live inputs, and imported audio files (WAV, MP3, OGG).
- Default gain staging (-inf to +6 dB), stereo panning, and automatic routing to Master Bus.
- Color coding with waveform preview readiness.

### 2.3 State Management & Integration
- Tracks are appended to `project.tracks` immutably.
- Automatically selects the newly created track as `activeTrackId`.
- Preserves all existing arrangement clips, automation curves, and mixer assignments.

---

## 3. Fruity Loops Pattern Management System (`ChannelRack.tsx`)

### 3.1 Pattern Control Bar
Located directly above the step sequencer grid in the Channel Rack:
- **Active Pattern Dropdown:** Selects and previews any pattern in `project.patterns` (e.g., `Pattern 1`, `Pattern 2`, `Pattern 3`).
- **Pattern Metadata Display:** Real-time feedback on pattern name, assigned color badge, and active step length (16, 32, 64, up to 512 steps).
- **`+ New Pattern` Action:** Generates a new clean pattern with unique UUID, incremented sequence number, distinct visual theme color, and appends it to project state.
- **Pattern Cloning (`handleClonePattern`):** Clones the exact drum channel steps, velocities, and pitch offsets of the active pattern into a new pattern variation.
- **Pattern Stamping:** Directly stamps the active pattern onto the active track at current playhead position in the Multitrack Arrangement timeline.

### 3.2 State Synchronization Engine
- Changing patterns triggers an automatic flush of current step states to the previous active pattern object in `project.patterns`.
- Loads the newly selected pattern's step data and channel configuration into active playback memory without audio engine dropouts.
- Full parity with arrangement timeline playback (`SONG` mode vs `PAT` mode).

---

## 4. Groove, Swing & Channel Rack Controls

### 4.1 Swing Quantization
- Dedicated **Swing Percentage Slider** on `TransportBar` and `ChannelRack`.
- Quantizes odd 16th steps with micro-timing offsets directly in `audioEngine.setSwing()`.
- Synchronized across the entire application state.

### 4.2 Precision Rotary Knobs (`FruityKnob.tsx`)
- Tactile rotary dials with drag sensitivity, double-click reset to center (12 o'clock / 0dB), and real-time numeric value tooltips.
- Green LED active indicators for Mute and Solo states.
- LCD numeric displays for Mixer routing with `Ctrl+L` auto-route shortcut.
