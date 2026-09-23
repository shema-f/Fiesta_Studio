# Project Maintainers

This document defines the current maintainers of FIesta Studio, their scopes of responsibility, and the path for active contributors to become maintainers.

---

## 1. Current Maintainers

| Name / Handle | Role | Primary Focus Areas | Location |
| :--- | :--- | :--- | :--- |
| **Ferrivox Core** (`@ferrivox`) | Lead Maintainer / Organization | Project Governance, Releases, Security, Strategy | Kigali, Rwanda |
| **Fiston Shema** (`@fistonshema`) | Lead Technical Architect | Audio Engine, DSP, Lookahead Scheduler, Gemini AI | Kigali, Rwanda |

---

## 2. Areas of Technical Responsibility
To protect audio fidelity and real-time execution guarantees, pull requests touch distinct technical subsystems requiring specific domain reviews:

- **Audio Engine & DSP (`/src/audio/`):** Strict latency, garbage collection, and precision timing constraints. Requires approval from Audio Engine Maintainers.
- **State Management & Data Schema (`/src/engine/`, `/src/types/`):** Backward-compatible schema evolution, undo/redo state immutability.
- **User Interface & Components (`/src/components/`):** Tailwind CSS styling, responsive layout, 60fps rendering, keyboard navigation.
- **AI Integration (`/server.ts`, `/src/components/AIAssistant.tsx`):** Server-side Gemini tool calling, prompt schemas, rate limiting, and secrets isolation.
- **Documentation & Localization (`/docs/`, `/src/i18n/`):** Clarity, architectural decision records, multi-language accuracy.

---

## 3. How Contributors Become Maintainers
FIesta Studio is committed to growing an international team of maintainers across Africa, Asia, Europe, the Americas, and Oceania.

### Path to Maintainership:
1. **Sustained Contributions:** Consistent, high-quality contributions over a period of at least 3 to 6 months (code, code reviews, bug fixes, or documentation).
2. **Technical Mastery & Domain Understanding:** Demonstrating deep comprehension of Web Audio constraints, state immutability, and project architecture.
3. **Collaborative & Constructive Conduct:** Adhering strictly to the [Code of Conduct](./CODE_OF_CONDUCT.md), conducting polite and thorough code reviews, and mentoring newcomers.
4. **Nomination & Review:** Existing maintainers nominate the candidate. Upon consensus agreement, the candidate is invited to the maintainer team with triage and write permissions.

---

## 4. Inactive Maintainers
If a maintainer is unable to participate for more than 6 months, their status may be transitioned to Emeritus Maintainer to ensure operational agility, with full public gratitude for their foundational service.
