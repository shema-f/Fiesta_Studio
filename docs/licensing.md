# Licensing & Third-Party Dependency Audit

## 1. FIesta Studio License
Original source code, audio DSP algorithms, user interface components, and documentation created for FIesta Studio are licensed under the **Apache License, Version 2.0**.
See [LICENSE](../LICENSE) and [NOTICE](../NOTICE).

---

## 2. Third-Party Software Dependency Audit

All third-party open-source packages included in FIesta Studio's dependency manifest (`package.json`) are audited for licensing compliance. Every runtime and build-time dependency is compatible with Apache-2.0 distribution:

| Component | Source / Repository | License | Commercial Use | Redistribution | Attribution Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **React** | `facebook/react` | MIT | Permitted | Permitted | Yes (Included in NOTICE) |
| **React DOM** | `facebook/react` | MIT | Permitted | Permitted | Yes (Included in NOTICE) |
| **Vite** | `vitejs/vite` | MIT | Permitted | Permitted | Yes (Included in NOTICE) |
| **TypeScript** | `microsoft/TypeScript` | Apache-2.0 | Permitted | Permitted | Yes (Included in NOTICE) |
| **Tailwind CSS** | `tailwindlabs/tailwindcss` | MIT | Permitted | Permitted | Yes (Included in NOTICE) |
| **Express** | `expressjs/express` | MIT | Permitted | Permitted | Yes (Included in NOTICE) |
| **Lucide React** | `lucide-icons/lucide` | ISC | Permitted | Permitted | Yes (Included in NOTICE) |
| **Motion** | `motiondivision/motion` | MIT | Permitted | Permitted | Yes (Included in NOTICE) |
| **@google/genai** | `google-gemini/generative-ai-js` | Apache-2.0 | Permitted | Permitted | Yes (Included in NOTICE) |
| **tsx & esbuild** | `privatenumber/tsx` | MIT | Permitted | Permitted | Yes (Included in NOTICE) |

---

## 3. Audio Assets & Sound Library Audit

FIesta Studio enforces a **Zero Copyright Infringement Policy** for sound samples. No sound files are scraped from commercial sample packs, commercial DAWs, or unverified websites.

| Asset / Sound Pack | Origin / Sound Designer | License | Commercial Use | Redistribution | Attribution |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rwandan Inanga Harp (Acoustic Pluck)** | Synthesized Physical Model & Field Recording, Ferrivox Audio Lab | CC0 1.0 Universal | Permitted | Permitted | Optional (Credited in CREDITS.md) |
| **Amayugi Shaker (Rwandan Ankle Bell)** | Cultural Preservation Audio Collection | CC0 1.0 Universal | Permitted | Permitted | Optional (Credited in CREDITS.md) |
| **Intore Royal Drum (Low resonance)** | Synthesized Acoustic Drum Model, Ferrivox Audio Lab | CC0 1.0 Universal | Permitted | Permitted | Optional (Credited in CREDITS.md) |
| **Amapiano Log Drum (Tuned FM Sub)** | Procedurally Synthesized (Dual Sine FM + Saturation) | Apache-2.0 (Code generated) | Permitted | Permitted | Yes |
| **Acoustic Kick, Snare, Clap, Hats** | Algorithmic Web Audio DSP Oscillators + White Noise Filters | Apache-2.0 (Code generated) | Permitted | Permitted | Yes |
| **808 Sub Boom** | Procedurally Synthesized Pitch-Swept Sine Wave | Apache-2.0 (Code generated) | Permitted | Permitted | Yes |

---

## 4. Sample Verification Checklist for Contributors

Before contributing any audio sample (`.wav`, `.mp3`, `.ogg`) to the repository, contributors must verify:
1. **Provenance:** You must be the original creator or obtain verifiable documentation that the sample is licensed under Creative Commons Zero (CC0) or Public Domain.
2. **Metadata:** Provide the required JSON schema entry with `name`, `creator`, `source`, `license`, and `commercialUse: true`.
3. **Absence of Stems/Loops from Commercial Tracks:** Stems from commercial artists (e.g., songs on Spotify, Apple Music) are strictly prohibited.
4. If license provenance cannot be independently confirmed by maintainers, the sample will be rejected.
