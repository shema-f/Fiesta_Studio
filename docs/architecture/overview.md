# FIesta Studio Architecture Overview

FIesta Studio is architected around a clear separation between **Reactive Presentation**, **Deterministic Project State**, and a **Real-Time Audio DSP Engine**.

---

## 1. System Topology

```mermaid
flowchart TB
    subgraph Browser_Main_Thread [Browser Main Thread]
        direction TB
        subgraph UI [React 19 User Interface]
            App[DAW Orchestrator App.tsx]
            CR[ChannelRack.tsx]
            PR[PianoRollModal.tsx]
            AV[ArrangementView.tsx]
            MR[MixerRack.tsx]
            AI[AIAssistant.tsx]
        end

        subgraph Engine [State & Transport Engine]
            Store[Project State Store]
            Midi[MIDI & Scales Engine]
            History[Undo / Redo Vault]
        end
    end

    subgraph Audio_Hardware [Audio Processing Pipeline]
        direction TB
        Sched[Lookahead Scheduler 25ms]
        Voices[DSP Voice Generators]
        Routing[Busing Graph: Tracks -> SubBuses -> Master]
        Limiter[Dynamics Brickwall Limiter]
        Speakers[Hardware Audio Destination]
        Offline[OfflineAudioContext WAV Renderer]
    end

    subgraph Backend_Cloud [Backend Proxy & AI Services]
        Server[Express Server (server.ts)]
        Gemini[Google Gemini 2.5 Generative Music API]
    end

    UI -->|Dispatches Actions| Store
    Store -->|Provides State Snapshot| UI
    Store -->|Updates Transport / BPM / Steps| Sched
    Sched -->|Hardware Timestamped Events| Voices
    Voices --> Routing
    Routing --> Limiter
    Limiter --> Speakers
    Store -->|Export Action| Offline
    AI -->|HTTPS POST /api/ai/*| Server
    Server -->|SDK Tool Calls| Gemini
    Server -->|Validated Tool Mutations| Store
```

---

## 2. Key Subsystem Modules

| Subsystem | Source Location | Responsibility |
| :--- | :--- | :--- |
| **Audio Engine** | `src/audio/audioEngine.ts` | Lookahead clock, AudioContext initialization, synthesis voices, sub-buses, offline rendering |
| **Channel Rack** | `src/components/ChannelRack.tsx` | Step sequencer grid, velocity controls, swing, channel mute/solo, pattern selection |
| **Piano Roll** | `src/components/PianoRollModal.tsx` | 88-key canvas grid, scale quantize (including Inanga scale), chord assistant, MIDI file export |
| **Arrangement** | `src/components/ArrangementView.tsx` | Multitrack timeline clips, audio waveform peak rendering, loop markers, clip slicing |
| **Mixer Rack** | `src/components/MixerRack.tsx` | Channel strips, dB volume faders, stereo pan dials, track solo/mute routing, master FFT analyzer |
| **AI Co-Producer** | `src/components/AIAssistant.tsx` & `server.ts` | Server-side Gemini 2.5 generative music integration using structured DAW tools |
| **Scale & Theory Math**| `src/engine/scales.ts` | Microtonal intervals, pentatonic scales, chord templates, frequency calculations |
