# Realistic Good First Issues

These are realistic, bite-sized tasks specifically curated for new contributors to complete without requiring deep Web Audio DSP experience:

---

### Issue 1: Add Keyboard Shortcut Reference Modal (`good-first-issue`, `ui`)
- **Description:** Implement a clean modal popup or tooltip that lists standard DAW shortcuts (`Space` = Play/Stop, `R` = Record, `Ctrl+K` = Command Palette, `Ctrl+Z` = Undo, `1-4` = Switch Views).
- **Files to touch:** `src/components/CommandPalette.tsx`, `src/App.tsx`.

---

### Issue 2: Add Kinyarwanda & Swahili Translation Dictionaries (`good-first-issue`, `i18n`)
- **Description:** Populate `src/i18n/locales/rw.json` and `src/i18n/locales/sw.json` with accurate translations of transport, sequencer, and mixer strings.
- **Files to touch:** `src/i18n/locales/`.

---

### Issue 3: Add Phrygian Dominant & Harmonic Minor Scales (`good-first-issue`, `music-theory`)
- **Description:** Add the semitone intervals for Phrygian Dominant (`[0, 1, 4, 5, 7, 8, 10]`) and Harmonic Minor (`[0, 2, 3, 5, 7, 8, 11]`) to the scale selector.
- **Files to touch:** `src/engine/scales.ts`, `src/components/PianoRollModal.tsx`.

---

### Issue 4: Improve Waveform Contrast in Light/Dark Views (`good-first-issue`, `ui`)
- **Description:** Enhance the visual distinction of audio clip waveforms on the timeline when dragged over loop boundaries.
- **Files to touch:** `src/components/ArrangementView.tsx`.
