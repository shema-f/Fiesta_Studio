# FIesta Studio Product & Technology Roadmap

This roadmap transparently communicates the current state of **FIesta Studio**, near-term engineering priorities, and the long-term vision stewarded by **Ferrivox**.

We use standardized status indicators:
- :white_check_mark: **Implemented:** Shipped in active release.
- :test_tube: **Experimental:** Active in codebase, undergoing optimization.
- :construction: **In Development:** High-priority active engineering focus.
- :clipboard: **Planned:** Scheduled on the product backlog.
- :microscope: **Research:** Exploratory technology and feasibility analysis.

---

## 1. NOW (Shipped in v0.1.0)

- :white_check_mark: **Pure Web Audio DSP Engine:** Drift-free lookahead precision step scheduler.
- :white_check_mark: **Channel Rack / Drum Sequencer:** 16/32-step grid, swing, velocity bars, Amapiano log drums, 808s.
- :white_check_mark: **MIDI Piano Roll:** 88-key canvas grid, scale snapping, chord assistant, Rwandan Inanga scales, .mid export.
- :white_check_mark: **Multitrack Timeline:** Audio/MIDI/Pattern clips, waveform peaks, loop range, slicing.
- :white_check_mark: **Multitrack Mixer Console:** dB faders, stereo pan, individual track solo/mute routing, master FFT analyzer.
- :white_check_mark: **Studio Inserts:** Parametric EQ curve canvas, compressor, reverb, stereo echo delay.
- :white_check_mark: **African & Rwandan Sound Hub:** Verified CC0 / Royalty-Free samples, license metadata inspection.
- :white_check_mark: **Microphone Audio Recording:** Direct voice recording onto timeline audio tracks.
- :white_check_mark: **Offline WAV Rendering:** High-resolution 16-bit, 24-bit PCM, and 32-bit float stereo export.
- :white_check_mark: **FIesta AI Co-Producer:** Server-side Gemini 2.5 generative music tool calling.
- :white_check_mark: **Command Palette (Ctrl+K):** Fast universal action launcher.
- :white_check_mark: **Project State Vault:** Local autosave and `.fiesta` JSON project export.

---

## 2. NEXT (Upcoming Milestone v0.2.0 - v0.3.0)

- :construction: **AudioWorklet DSP Migration:** Moving synthesis voices from legacy `AudioNode` chains into dedicated `AudioWorkletNode` processors for zero-overhead background audio computation.
- :construction: **Advanced Automation Clips:** Parametric automation lanes on the arrangement timeline (volume, pan, filter cutoff, reverb wet/dry).
- :construction: **Comprehensive Internationalization (i18n):** Full localization in Kinyarwanda, French, Swahili, and Spanish.
- :construction: **WebAssembly (WASM) Audio Filters:** High-performance C++/Rust DSP filter algorithms compiled to WASM.
- :construction: **Expanded Drum Synthesis:** Add physical modeling synthesis for African acoustic percussion (Ngoma, Intore, Djembe).
- :clipboard: **Custom Soundfont / SFZ Sampler:** Support for loading multi-sampled SFZ acoustic instrument libraries.
- :clipboard: **Automated Unit & E2E Audio Timing Tests:** Automated Vitest and Playwright CI audio timing benchmarks.

---

## 3. LATER (v0.4.0 - v0.8.0)

- :clipboard: **Web MIDI API Hardware Integration:** Plug-and-play USB MIDI keyboard, pad controller, and hardware knob mapping.
- :clipboard: **FIesta Open Plugin SDK (AudioWorklet / WebAssembly):** Standardized specification allowing third-party developers to package and distribute custom synths and effects.
- :clipboard: **Cloud Project Collaboration:** Peer-to-peer or server-mediated WebRTC collaborative DAW sessions.
- :clipboard: **Stem Separation Engine:** Browser-side or server-assisted vocal and drum stem isolation.
- :clipboard: **Intelligent Auto-Mixing Assistant:** Automated frequency conflict detection (e.g., sidechain masking between kick and 808).
- :clipboard: **PWA Native Desktop Wrapper:** Electron/Tauri desktop build with native ASIO/CoreAudio low-latency driver support.

---

## 4. LONG-TERM VISION (v1.0.0+)

- :microscope: **Global Creator & Producer Marketplace:** An open ecosystem where sound designers and producers across Africa and worldwide can distribute and monetize presets, samples, and plugins.
- :microscope: **AI-Native Music Studio:** AI acting as a real-time responsive studio collaborator that listens, adapts, suggests chord voicing, and automates tedious production tasks while leaving artistic control with the human artist.
- :microscope: **Pan-African Music Technology Hub:** Establishing Rwanda and the broader African continent as a premier origin for world-class music technology, software engineering, and cultural music education.
