# Security Policy

## 1. Supported Versions

We release patches and security fixes for the active development versions of FIesta Studio:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

---

## 2. Reporting a Vulnerability

**DO NOT report security vulnerabilities via public GitHub issues, discussions, or social media.**

If you discover a security vulnerability or sensitive flaw in FIesta Studio, please report it privately:

- **Email:** `security@ferrivox.com` or `contact@ferrivox.com`
- **Subject:** `[SECURITY] FIesta Studio Vulnerability Report`

Please include:
1. Description of the vulnerability and affected components.
2. Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
3. Potential impact (e.g., Cross-Site Scripting, prototype pollution, unauthorized API invocation).
4. Any proposed remediations or patches.

### Our Response Process:
- **Acknowledgment:** Within 48 hours of receipt.
- **Assessment:** Maintainers will evaluate and confirm the vulnerability severity.
- **Fix & Release:** A patch will be prepared in a private branch, verified, and released.
- **Public Disclosure & Credit:** Once the patch is deployed, a public advisory will be published acknowledging your responsible disclosure.

---

## 3. Security Architecture & Threat Models

FIesta Studio is designed with defensive isolation principles:

### A. API Key Protection (Zero Client Secrets)
- **Constraint:** External AI API keys (e.g., `GEMINI_API_KEY`) must **NEVER** be compiled into client JavaScript or accessible via browser network inspector.
- **Enforcement:** All Gemini calls are proxied through the server backend (`/api/ai/*`) using server-side environment variables.

### B. Untrusted Audio File Uploads
- **Constraint:** User-uploaded audio samples (WAV, MP3, OGG) are untrusted input.
- **Enforcement:** Files are processed exclusively through native browser `AudioContext.decodeAudioData` in an isolated memory buffer. No native binary executables or server-side shell commands are executed on uploaded audio.

### C. Plugin Sandboxing
- **Constraint:** Custom third-party synthesis and effect plugins must not access unauthorized browser APIs or execute arbitrary DOM manipulation.
- **Enforcement:** Future plugin architectures will execute within isolated `AudioWorkletGlobalScope` threads without access to `window`, `document`, `fetch`, or `localStorage`.

### D. Cross-Site Scripting (XSS) & Content Security
- Modern React rendering guarantees automatic escaping of user project names and track labels.
- Strict Content Security Policy (CSP) headers are configured on production server deployments.

### E. Dependency & Supply Chain Audits
- Automated dependency audits run via GitHub Actions and Dependabot.
- Zero untrusted dependencies are introduced into the core DSP loop.
