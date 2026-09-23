# New Contributor & Beginner Guide: Welcome to FIesta!

Welcome! We are thrilled you want to help build **FIesta Studio**. You do not need to be an expert in digital signal processing (DSP) or Web Audio to make a valuable contribution.

---

## 1. Where to Start?

Here is a map of where different parts of the project live:

| Area | Directory | Skill Level | What You Can Do |
| :--- | :--- | :--- | :--- |
| **Documentation** | `/docs` | Beginner | Fix typos, clarify setup guides, write tutorials |
| **Translations** | `/src/i18n` | Beginner | Add translations in your native language |
| **User Interface** | `/src/components` | Intermediate | Polish Tailwind styles, improve icons, add shortcuts |
| **Project State** | `/src/engine` | Intermediate | Add scale formulas, improve undo/redo, write unit tests |
| **Audio Engine** | `/src/audio` | Advanced | Synthesizer voices, DSP filters, AudioWorklet nodes |
| **AI Intelligence** | `/server.ts` | Research | Extend AI prompt schemas, add generative tools |

---

## 2. Safe Areas to Modify as a Beginner
- Any `.md` file in `/docs/`
- Adding a new scale to `src/engine/scales.ts`
- Adding keyboard shortcuts to `src/components/CommandPalette.tsx`
- Refactoring visual button states or tooltips in `src/components/`

---

## 3. Step-by-Step: Your First Contribution

1. **Find an Issue:** Look for issues tagged `good-first-issue` on GitHub.
2. **Comment on the Issue:** Leave a quick message: *"I'd like to work on this!"*
3. **Fork and Clone:**
   ```bash
   git clone https://github.com/<your-username>/fiesta-studio.git
   cd fiesta-studio
   git checkout -b feature/my-first-contribution
   ```
4. **Install & Run:**
   ```bash
   npm install
   npm run dev
   ```
5. **Make Your Change & Verify:**
   ```bash
   npm run lint
   npm run build
   ```
6. **Commit with DCO Sign-off:**
   ```bash
   git commit -s -m "docs: improve beginner setup instructions"
   ```
7. **Submit Pull Request:** Open a PR against `main` and fill out the checklist!
