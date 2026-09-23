# Changelog

All notable changes to **FIesta Studio** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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
