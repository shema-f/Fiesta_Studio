---
name: Audio / DSP Bug
about: Report audio stutter, clock drift, latency, clicks, pops, or DSP distortion
title: '[AUDIO BUG] '
labels: ['audio', 'bug', 'high-priority']
assignees: ''
---

**Describe the Audio Issue**
A concise description of the audio symptom (e.g. clicks/pops, timing drift, silent output, stuck MIDI note, distortion on export).

**Audio Engine Specifics**
- **Sample Rate:** [e.g. 44100 Hz, 48000 Hz, 96000 Hz]
- **Audio Output Hardware:** [e.g. MacBook Pro Speakers, Focusrite Scarlett 2i2, Realtek HD Audio, AirPods]
- **Audio Driver / Platform:** [e.g. macOS CoreAudio, Windows WASAPI, Linux PipeWire/ALSA]
- **Project BPM:** [e.g. 120]
- **Active Tracks / Channel Count:** [e.g. 4 drum channels, 2 synth tracks]

**Steps to Reproduce**
1. Start playback at BPM '...'
2. Enable track '...'
3. Adjust parameter '...'
4. Listen for glitch at step '...'

**Console Logs / AudioContext State**
Paste output from browser developer console:
- `audioEngine.getState()`
- Any Web Audio warnings (e.g., "AudioContext was not allowed to start", "Buffer underrun")

**Does this happen during real-time playback, offline WAV export, or both?**
- [ ] Real-time playback
- [ ] Offline WAV export
- [ ] Both
