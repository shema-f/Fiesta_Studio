# Channel Rack & Step Sequencer Architecture

The **FIesta Channel Rack** (`src/components/ChannelRack.tsx`) is the primary rhythm sequencing environment, optimized for high-speed drum programming, swing groove injection, and multi-pattern management.

---

## 1. Domain Concepts

- **Channel:** An individual sound generator assigned to a drum voice (e.g., Acoustic Kick, Snare, Amapiano Log Drum, Rwandan Amayugi Shaker).
- **Pattern:** A rhythmic matrix of steps (typically 16 or 32 steps per bar). Multiple patterns can be arranged independently on the timeline.
- **Step Event:** A boolean activation state representing a 16th-note trigger point.
- **Velocity:** Dynamic hit strength (0.0 to 1.0) controlling oscillator gain and filter envelope brightness.
- **Swing:** Micro-timing displacement applied to even-numbered 16th steps (giving Amapiano and Afrobeats their signature bounce).
- **Pitch:** Semitone transposition (-12 to +12 semitones) for tuning kicks, 808s, and log drums to the song's musical key.

---

## 2. Timing and Swing Algorithm

When swing is applied, the scheduler delays the even 16th-note steps according to:

$$\Delta t_{swing} = \text{step} \bmod 2 \times \left(\text{secondsPer16th} \times \frac{\text{swingPercentage}}{100} \times 0.5\right)$$

This guarantees that the downbeats (1, 5, 9, 13) stay locked to the metronome, while upbeats gain rhythmic swing.

---

## 3. Separation of UI State, Project State, and Audio Engine State

To maintain 60fps responsiveness and zero audio drift, state is strictly partitioned:
1. **UI State:** Local React states (active tab, open modals, hover effects, dial drags).
2. **Project State:** The immutable `.fiesta` project model containing track arrays, pattern step matrices, notes, and mixer gains.
3. **Audio Engine State:** Live Web Audio DSP objects (`AudioContext`, active `OscillatorNode` instances, lookahead scheduling pointers).

---

## 4. Polyrhythmic Sequencing

Each channel can operate with independent step counts (e.g., 12-step Afrobeat triplet shakers against a 16-step four-on-the-floor kick), allowing complex African polyrhythms without global grid distortion.
