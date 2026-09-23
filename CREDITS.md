# Project Credits and Acknowledgments

FIesta Studio is made possible through original engineering by **Ferrivox**, contributions from the international open-source community, and the foundational work of the global audio engineering ecosystem.

---

### 1. FIesta Original Work
*Created and architected by Ferrivox (Kigali, Rwanda) and core maintainers:*
- **Custom Native Web Audio Engine:** Pure browser-native DSP architecture featuring a 25ms lookahead precision step scheduler, dynamic bus graph (Track -> Sub-bus -> Master), and offline audio renderer.
- **FIesta Channel Rack:** 16/32-step polyrhythmic drum sequencer with per-step velocity dials, swing timing, and live pitch tuning.
- **FIesta Piano Roll:** Canvas/SVG 88-key MIDI grid with scale highlighting (including traditional Rwandan Inanga pentatonic scales), chord assistant, and standard `.mid` file generator.
- **Multitrack Arrangement Timeline:** Non-destructive timeline featuring audio clip peak rendering, loop boundaries, clip slicing, and volume envelopes.
- **Mixer Console:** 32-bit floating-point busing console with real-time stereo peak/RMS metering, dB calibrated faders, pan dials, and individual track solo/mute routing.
- **Synthesis DSP Voice Models:** Subtractive dual-saw synths, FM keys, concert grand piano physical models, acoustic drums, and tuned 808 sub generators.
- **FIesta AI Co-Producer Engine:** Server-side generative music tool calling abstraction using Google Gemini 2.5 SDK.

---

### 2. Third-Party Open Source
*Open-source libraries powering the FIesta Studio runtime:*
- **React 19 & React DOM** (`MIT`): Declarative user interface layer created by Meta and the React community.
- **Vite 8** (`MIT`): Next-generation frontend build tooling and development server created by Evan You and the Vite core team.
- **TypeScript 7** (`Apache-2.0`): Type-safe JavaScript superset developed by Microsoft.
- **Tailwind CSS v4** (`MIT`): High-performance utility-first CSS styling engine created by Adam Wathan and Tailwind Labs.
- **Express 4** (`MIT`): Minimalist, resilient web application framework for Node.js.
- **Lucide Icons** (`ISC`): Clean, accessible, beautiful SVG iconography maintained by Lucide community contributors.
- **Motion** (`MIT`): Fluid hardware-accelerated animations created by Framer B.V.
- **@google/genai** (`Apache-2.0`): Official TypeScript SDK for Google Generative AI / Gemini models.
- **tsx & esbuild** (`MIT`): Rapid TypeScript execution and bundling engine created by Evan Wallace.

---

### 3. Third-Party Assets & Verified Sound Libraries
*Audio samples, waveforms, and cultural sound design assets included in FIesta Studio:*
- **Rwandan Cultural Heritage Sound Archive:** Synthesized and verified royalty-free acoustic models of the Rwandan Inanga (trough zither), Amayugi (ceremonial ankle rattles), and Intore drums, modeled under Creative Commons Zero (CC0) / Royalty-Free cultural research archives.
- **Amapiano & Afrobeats Drum Kits:** Royalty-free synthesized acoustic & electronic percussion (Log Drums, Shakers, Kicks, Snares, Claps) crafted by Ferrivox Sound Labs.
- **Standard Scale & Music Theory Datasets:** Open public-domain frequency and MIDI note mathematical tables (A440 equal temperament, microtonal intervals).

---

### 4. Community Contributions
FIesta Studio welcomes international contributions from engineers, sound designers, and musicians worldwide.
- **Contributors:** All pull request authors, issue reporters, documentation editors, and translators are recognized in [CONTRIBUTORS.md](./CONTRIBUTORS.md) and Git commit history.
- **International Community:** Developers from Rwanda, Kenya, Nigeria, South Africa, Japan, Germany, United States, and across the globe contributing to internationalization, testing, and audio DSP.

---

### 5. Inspiration & References
While FIesta Studio's codebase, architecture, visual design, and DSP implementations are 100% original, we honor the historical evolution of music production software:
- **DAW Workflows:** The ergonomic pattern sequencing and step-entry workflows popularized by classic grooveboxes (Roland TR-808, TR-909, Akai MPC) and modern DAWs (FL Studio, Ableton Live, Logic Pro, Bitwig Studio).
- **Web Audio Explorers:** The W3C Audio Working Group for pioneering the Web Audio API, AudioWorklet specification, and making real-time audio computation viable in standard web browsers.
- **African Music Traditions:** The rich rhythmic polyrhythms, syncopation, and microtonal tunings of traditional Rwandan music, East African Benga, South African Amapiano, and West African Afrobeats.
