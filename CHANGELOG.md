# Changelog

All notable changes to **FIesta Studio** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-09-26

### Added
- **"Create New Track" Modal & Track Provisioning Engine:**
  - Added dedicated **"Create New Track"** trigger button across arrangement header, toolbar, and track list footer.
  - Interactive track configuration dialog featuring two dedicated track modes:
    - **Instrument Track**: Hardcoded built-in generators and synthesizers (Sytrus FM, 3xOsc Synth, African Inanga Pluck, Amapiano Log Drum, Amayugi Shaker, Intore Royal Drums, Grand Piano, Clean Electric Bass, Rhodes EP), FL-inspired color palette, custom naming, and direct MIDI clip initialization.
    - **Audio Track**: Audio timeline channel setup with microphone input routing, sample playback configuration, and color tags.
  - Automatic state appending to `project.tracks` and seamless focus synchronization to `activeTrackId`.
- **Fruity Loops Pattern Management System:**
  - Dedicated **Pattern Control Bar** in the Channel Rack (`ChannelRack.tsx`).
  - Active pattern selector dropdown displaying pattern name, index (`Pattern 1`, `Pattern 2`, etc.), and active step counts.
  - **`+ New Pattern` Creation**: Creates new independent pattern layers with distinct color coding and appends them to `project.patterns`.
  - **Pattern Cloning**: Clones all drum channel steps, velocities, and pitches from active patterns to new iterations.
  - **Timeline Pattern Stamping**: Directly places and stamps active patterns into the multitrack arrangement timeline as pattern clips.
  - Pattern state synchronization: Channel rack step edits persist seamlessly to the currently selected pattern.
- **Dynamic Groove & Swing Quantization:**
  - Swing percentage slider integrated into both `TransportBar` and `ChannelRack`.
  - True shuffle delay on odd 16th steps wired directly to Web Audio scheduler via `audioEngine.setSwing()`.
- **Enhanced Channel Rack & Sound Controls:**
  - High-precision rotary knobs (`FruityKnob`) for Pan and Volume with detents and numeric value tooltips.
  - Authentic green LED mute/solo indicator lamps.
  - Mixer track routing with LCD readout and auto-route assignment.
  - Per-step graph editor with velocity, pitch, pan, and filter cutoff modulation.
  - PC VST generator and sample hub with Sytrus FM, 3xOsc, Harmless, and custom audio file import.

## [0.1.0] - 2026-09-23

### Added
- **Native Web Audio Engine:**
  - 25ms lookahead precision step scheduler drift-free clock.
  - Sub-bus routing graph: Tracks -> Buses (Drums, Vocals, Instruments) -> Master -> Brickwall Limiter.
  - 32-bit floating point internal DSP mixing bus.
  - Offline audio rendering pipeline (`OfflineAudioContext`) supporting WAV export in 16-bit, 24-bit PCM, and 32-bit float.
- **FIesta Channel Rack / Step Sequencer:**
  - 16 and 32-step polyrhythmic drum grid.
  - Built-in drum voices: Acoustic Kick, Snare, Clap, Closed/Open Hats, Amapiano Log Drum, Amayugi Shaker, 808 Sub Boom, Rimshot.
  - Per-step velocity controls, swing timing parameter, and semitone pitch tuning.
  - Instant genre groove presets for Amapiano, Afrobeats, and Trap.
- **Interactive MIDI Piano Roll:**
  - 88-key interactive note grid with playable virtual preview keyboard.
  - Musical scale quantization and highlighting: Natural Minor, Major, Pentatonic, Blues, Dorian, and authentic Rwandan Inanga pentatonic scale.
  - Chord Assistant (Amapiano Min9, Maj7, Dom7, 9th chords), note velocity editing, and humanization.
  - Standard MIDI file (.mid) export.
- **Multitrack Arrangement Timeline:**
  - Non-destructive multitrack arrangement view for Audio, MIDI, and Drum pattern clips.
  - Canvas-rendered audio peak waveforms.
  - Interactive loop boundaries, clip slicing, duplicating, dragging, and deletion.
- **Mixer Console:**
  - Dedicated channel strips with dB calibrated faders (-inf to +6 dB).
  - Stereo pan dials, mute toggles, and individual track solo routing (with automatic muting of non-soloed tracks).
  - Animated dual-channel peak/RMS VU meters.
  - Real-time Fast Fourier Transform (FFT) master spectrum analyzer.
- **Studio Insert Effects Rack:**
  - 3-band Parametric EQ with interactive frequency curve canvas visualization.
  - VCA Bus Compressor with threshold, ratio, and gain-reduction metering.
  - Algorithmic Hall Reverb with room size, damping, and wet/dry mix.
  - Stereo Ping-Pong Delay with tempo-synced timing and feedback.
- **African & Rwandan Sound Hub:**
  - Authentic cultural instruments: Rwandan Inanga plucks, Amayugi shakers, Intore royal drums.
  - Strict license provenance metadata (CC0, Royalty-Free) on all sound assets.
  - Live sound auditioning with waveform visualization.
  - Custom audio file upload (WAV, MP3, OGG) with instant Web Audio decoding.
- **Direct Microphone Audio Recording:**
  - Browser microphone capture directly into timeline audio tracks with real-time waveform extraction.
- **FIesta AI Co-Producer Engine:**
  - Server-side Google Gemini 2.5 generative music integration.
  - Generates structured drum patterns, chord progressions, and arrangement outlines.
  - Single-click "Apply to Project" DAW automation.
- **Command Palette (Ctrl+K / Cmd+K):**
  - Universal search for navigation, transport actions, and export commands.
- **Open-Source Governance & Community Documentation:**
  - Apache 2.0 license, NOTICE, TRADEMARKS.md, CREDITS.md, GOVERNANCE.md, CONTRIBUTING.md, and SECURITY.md.
