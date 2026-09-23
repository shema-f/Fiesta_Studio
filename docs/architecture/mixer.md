# Multitrack Mixer Console Architecture

The **FIesta Mixer Console** (`src/components/MixerRack.tsx`) manages signal levels, stereo panning, sub-bus summing, insert effects, and master metering.

---

## 1. Channel Strip Architecture

Each channel strip contains:
- **Calibrated dB Fader:** Converts slider values (0.0 to 1.5) to decibel readouts using standard audio logarithmic curves:
  $$\text{Gain} = 10^{\frac{\text{dB}}{20}}$$
- **Stereo Pan Control:** Constant-power stereo panning using Web Audio `StereoPannerNode` with balance range $-1.0$ (hard left) to $+1.0$ (hard right).
- **Mute & Solo Logic:**
  - Individual track solo button (`S`) triggers priority audition.
  - When active, all non-soloed tracks are muted in real-time, accompanied by visual `SOLO MUTED` badges and meter attenuation.
  - A global `SOLO ACTIVE` counter with a single-click "Clear Solo" restores full mix auditioning.
- **Dual Peak/RMS VU Meters:** Dynamic animated meters reflecting live track loudness.

---

## 2. Bus Routing Hierarchy

```text
Track 1 (Kick) ──────┐
Track 2 (Snare) ─────┼──► [Bus: Drums] ────────┐
Track 3 (Hats) ──────┘                         │
                                               ▼
Track 4 (Synth) ─────┐                  [Bus: Master] ──► [Limiter] ──► [DAC Output]
Track 5 (Inanga) ────┴──► [Bus: Inst] ─────────▲
                                               │
Track 6 (Vocals) ───────► [Bus: Vocals] ───────┘
```

---

## 3. Real-Time Master Spectrum Analyzer

- Implemented using Web Audio `AnalyserNode` connected directly to the master output.
- Configured with `fftSize = 64` (32 discrete frequency bins) and smoothing time constant $0.8$.
- Rendered to HTML5 `<canvas>` using a logarithmic frequency scale, giving high resolution in the low-frequency bass region (20Hz - 250Hz) where kick drums and 808 subs reside.
