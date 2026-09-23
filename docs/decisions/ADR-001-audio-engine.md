# ADR-001: Web Audio Lookahead Precision Scheduler

## Context
A digital audio workstation requires microsecond-level timing precision to sequence drum hits and MIDI note events without jitter or audible drift. Standard JavaScript timers (`setInterval`, `setTimeout`) are subject to unpredictable main-thread queuing delays caused by UI layout calculations and Garbage Collection (GC).

## Problem
How can FIesta Studio guarantee rock-solid, jitter-free audio sequencing within a browser environment while running alongside a React 19 user interface?

## Options Considered
1. **Direct `setInterval` Triggering:** Triggering synthesis nodes directly inside `setInterval(callback, stepDuration)`.
2. **Web Worker Timing Clock:** Running a high-resolution timer inside a dedicated Web Worker and posting `postMessage` ticks to the main thread.
3. **Lookahead AudioContext Parameter Scheduling:** Using a short 25ms timer to schedule Web Audio events 100ms into the future using `audioContext.currentTime`.

## Decision
We adopted **Option 3: Lookahead AudioContext Parameter Scheduling**.

The main thread runs a 25ms polling loop that looks ahead 100ms. When steps fall within this lookahead window, their start times and parameter automations are scheduled directly on Web Audio native audio nodes using hardware timestamps (`audioContext.currentTime`).

## Consequences
- **Positive:** Timing is hardware-accurate and unaffected by temporary main thread delays up to 100ms.
- **Positive:** Zero third-party dependencies required for audio timing.
- **Negative:** Events must be scheduled slightly in advance; changes made within the 100ms window take effect on the next lookahead cycle.
