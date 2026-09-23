# Contributing to FIesta Studio

Thank you for your interest in contributing to **FIesta Studio**, the open-source browser Digital Audio Workstation created by **Ferrivox**!

Whether you are a developer in Rwanda, Kenya, Nigeria, South Africa, Germany, Japan, the United States, Brazil, or anywhere else in the world, your contributions are welcome.

---

## 1. The Controlled Contribution Workflow

To maintain production-grade audio stability, prevent audio thread stutter, and keep the codebase clean, all contributions follow a structured path:

```text
GitHub Issue ──► Discussion ──► Fork / Branch ──► Pull Request ──► CI Checks ──► Code Review ──► Merge
```

1. **GitHub Issue:**
   - Always search existing issues first.
   - For bug reports or feature ideas, open an issue using the appropriate template (`bug_report.md`, `audio_bug.md`, or `feature_request.md`).
2. **Discussion:**
   - Wait for a maintainer or community discussion before writing large amounts of code.
   - For major architectural shifts, discuss via an RFC first.
3. **Fork & Branch:**
   - Fork the repository to your personal GitHub account.
   - Create a clean topic branch from `main`:
     - `feature/piano-roll-quantize`
     - `fix/scheduler-drift`
     - `docs/audio-engine-guide`
     - `perf/waveform-canvas-cache`
     - `ai/generative-midi-tools`
4. **Pull Request (PR):**
   - Open a PR against `main` using our PR template (`.github/PULL_REQUEST_TEMPLATE.md`).
   - Fill out all required checklist items (testing, license, audio impact).
5. **Continuous Integration (CI):**
   - Automated GitHub Actions run type-checking (`tsc --noEmit`), linting, and build tests.
   - PRs cannot be merged if CI fails.
6. **Code Review:**
   - At least one core maintainer will review your code.
   - Any comments or requested changes will be discussed constructively in the PR thread.
7. **Merge:**
   - Once approved and CI is green, maintainers will squash-and-merge your contribution into `main`.
   - Your name is added to [CONTRIBUTORS.md](./CONTRIBUTORS.md)!

---

## 2. Contributor Levels: Where to Start

We welcome developers of all skill levels:

### 🟢 Level 1: Beginner
*Start here if you are new to Web Audio or open-source contribution.*
- **Documentation:** Fixing typos, improving setup instructions, writing tutorials.
- **Translations / i18n:** Translating UI strings into Kinyarwanda, Swahili, French, Spanish, Japanese, etc.
- **UI & Accessibility:** Tailwind CSS refinements, color contrast, keyboard navigation hints.
- **Good First Issues:** Look for issues tagged `good-first-issue` on GitHub.

### 🟡 Level 2: Intermediate
*For developers comfortable with React 19, TypeScript, and state management.*
- **Components:** Channel rack enhancements, piano roll tools, mixer controls.
- **State Management:** Immutable state updates, project JSON (.fiesta) serialization.
- **MIDI & Music Theory:** Adding scales, chord presets, MIDI file parsing.
- **Testing:** Unit tests for scale calculations, project store undo/redo history.

### 🔴 Level 3: Advanced
*For audio DSP and systems engineers.*
- **Web Audio DSP:** Custom synthesis voices, AudioWorklet node implementations, filter algorithms.
- **Audio Scheduling:** Lookahead precision timing, drift compensation, Web Worker clocking.
- **Offline Audio Context:** High-speed multi-stem audio rendering and bit-depth quantization.
- **Performance:** Minimizing garbage collection, memory profiling, canvas waveform caching.

### 🟣 Level 4: Research
*For AI researchers, music technologists, and sound designers.*
- **Generative Music AI:** Server-side Gemini tool calling, structured MIDI composition models.
- **African Music Technology:** Authentic microtonal tunings, polyrhythm engines, Inanga physical modeling.
- **Music Information Retrieval (MIR):** Beat detection, pitch estimation, automatic mixing analysis.

---

## 3. Critical Audio Engine Rules

The Web Audio API operates in a strict real-time environment. Violating these rules will cause audible clicks, pops, and timing stutter:

1. **NEVER use standard `setInterval` or `setTimeout` for audio sample timing.**
   - JavaScript timers drift significantly under main thread load.
   - Always schedule Web Audio parameters against `audioContext.currentTime` using the lookahead scheduler.
2. **Avoid Object Allocations in Audio Render Loops:**
   - Allocating objects inside high-frequency audio callbacks triggers garbage collection pauses.
   - Reuse typed arrays (`Float32Array`, `Uint8Array`) and pre-allocated buffers where possible.
3. **No Blocking Synchronous Calls:**
   - Never run synchronous heavy math, regex, or large loops while playback is active.
   - Offload heavy tasks to Web Workers or background asynchronous tasks.
4. **Isolate AI and Network Calls to the Server:**
   - Never invoke external AI APIs directly from browser client code.
   - All external model interactions go through server endpoints (`/api/ai/*`) to protect secrets.

---

## 4. Local Development Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **Package Manager:** `npm`, `pnpm`, or `bun`

### Setup Instructions
```bash
# 1. Clone your fork
git clone https://github.com/<your-username>/fiesta-studio.git
cd fiesta-studio

# 2. Install dependencies
npm install

# 3. Copy environment configuration
cp .env.example .env

# 4. Start local development server (Express + Vite)
npm run dev

# 5. Open browser at http://localhost:3000
```

### Pre-Submission Verification
Before opening a pull request, run all verification commands locally:
```bash
# Run TypeScript compilation check
npm run lint

# Run production build
npm run build
```

---

## 5. Developer Certificate of Origin (DCO)

FIesta Studio utilizes the Developer Certificate of Origin (DCO) to verify the provenance of all contributions.

By signing your commits with `git commit -s`, you certify that:
- The contribution was created in whole or in part by you, and you have the right to submit it under the Apache License 2.0; OR
- The contribution is based upon previous open-source work that is appropriately licensed and attributed; OR
- The contribution was provided directly to you by someone who satisfied one of the above conditions.

### How to Sign Off:
Simply add the `-s` flag to your git commit:
```bash
git commit -s -m "feat: implement scale quantization in piano roll"
```
This appends a sign-off trailer to your commit message:
```text
Signed-off-by: Jane Doe <jane.doe@example.com>
```

---

## 6. Commit Message Guidelines

We follow Conventional Commits:
- `feat:` A new user-facing feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `perf:` A code change that improves performance or latency
- `refactor:` Code refactoring without behavioral change
- `test:` Adding or updating tests
- `chore:` Tooling, dependency updates, configuration
