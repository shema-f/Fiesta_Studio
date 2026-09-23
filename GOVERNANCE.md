# Project Governance

## 1. Overview
**FIesta Studio** is an open-source browser-based Digital Audio Workstation created and maintained by **Ferrivox** (Kigali, Rwanda) alongside international open-source contributors.

This document outlines the governance model, decision-making framework, and technical steering procedures for the FIesta Studio ecosystem.

---

## 2. Governance Philosophy: Open Stewardship
FIesta Studio operates under a model of **Transparent Benevolent Stewardship**:
- **Origin & Anchor:** Ferrivox initiated the codebase and stewards the project vision, release signing, trademark protection, and brand integrity.
- **Open Technology:** The entire source code is licensed under Apache 2.0. Anyone may inspect, run, fork, or build upon the software.
- **Meritocratic Community Path:** Contributors who demonstrate technical excellence, reliability, and positive community engagement are given progressively higher roles and review responsibilities.
- **No False Pretense:** We do not claim to be a decentralized foundation when Ferrivox currently holds primary maintenance responsibility; rather, we provide a clear, documented path for the governance to evolve into an international Technical Steering Committee (TSC).

---

## 3. Roles and Decision-Making Structure

### Roles
1. **Users & Creators:** Musicians, producers, sound designers, and developers using FIesta Studio.
2. **Contributors:** Anyone who submits issues, pull requests, translations, sound packs, or documentation.
3. **Domain Reviewers:** Experienced contributors with write/triage permissions over specific areas (e.g., UI, DSP, Docs).
4. **Core Maintainers:** Leaders responsible for final PR approval, releases, architecture, and security coordination.
5. **Lead Maintainer (Ferrivox):** Retains ultimate architectural veto to protect system integrity, performance constraints, and project sustainability.

---

## 4. Decision-Making Process

### Routine Changes (Bugs, Enhancements, Docs)
- Discussed directly in GitHub Issues and Pull Requests.
- Reviewed and merged by maintainers once CI checks pass and reviews are resolved.

### Major Architectural Changes (RFC Process)
For major structural shifts—such as redesigning the audio scheduler, altering the `.fiesta` project format, changing the plugin API, or introducing native WASM modules—a formal **Request for Comments (RFC)** is required:
1. **Open an RFC Issue:** Use the GitHub Discussion / RFC template detailing context, problem, proposed solution, trade-offs, and backward compatibility.
2. **Community Discussion:** Minimum 14-day public review period for feedback from developers and producers.
3. **Consensus Seeking:** Maintainers seek technical consensus with the community.
4. **Architectural Decision Record (ADR):** Once approved, the decision is formalized as an ADR in `docs/decisions/`.

---

## 5. Conflict Resolution
If technical disagreements arise:
1. Discussion is conducted respectfully with evidence (benchmarks, Web Audio specs, profiler outputs).
2. The relevant Domain Maintainers seek a compromise.
3. If consensus cannot be reached, the Lead Maintainer (Ferrivox) makes the final call in the best interest of audio timing stability, user experience, and long-term project viability.

---

## 6. Long-Term Evolution: Toward a Technical Steering Committee (TSC)
As the project grows in contributor breadth across Africa, Asia, Europe, and the Americas:
- A formal **Technical Steering Committee (TSC)** will be established with elected seats for active external community maintainers.
- Charter rules, voting thresholds, and working group structures will be established openly in collaboration with the community.
