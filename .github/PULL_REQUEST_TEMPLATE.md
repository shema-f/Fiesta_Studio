## Description of Changes

### What changed?
<!-- A clear, concise summary of the modifications. -->

### Why?
<!-- Reference the related GitHub issue (e.g. Fixes #123) and explain the motivation. -->

---

## Engineering & Audio Impact Checklist

- [ ] **How was it tested?**
  - [ ] Tested locally with active playback in browser (Chrome/Firefox/Safari)
  - [ ] Tested offline WAV export
  - [ ] Verified on mobile/small viewport (if UI)
- [ ] **Does it affect audio timing or scheduling?**
  - [ ] No audio timing alterations
  - [ ] Yes (Explain how drift, lookahead, or sample accuracy is preserved):
- [ ] **Does it affect performance or trigger Garbage Collection?**
  - [ ] No object allocations in tight audio render/DSP loops
  - [ ] Profiled with browser DevTools
- [ ] **Does it affect backward compatibility?**
  - [ ] Existing `.fiesta` project JSON files load without error
- [ ] **Does it introduce any new external dependencies?**
  - [ ] No new dependencies
  - [ ] Yes (Explain why, provide license, bundle size impact):
- [ ] **Does it introduce any copyright or licensing concerns?**
  - [ ] All code is original or compatible with Apache 2.0
  - [ ] Any sample/asset is verified CC0 / Royalty-Free and documented
- [ ] **Does it require documentation updates?**
  - [ ] Docs updated in `/docs`
  - [ ] Not applicable

---

## Contributor Certification (DCO)

- [ ] I certify that this contribution adheres to the **Developer Certificate of Origin (DCO)** and I have signed my commits with `git commit -s`.
- [ ] I agree that my contributions are licensed under the **Apache License, Version 2.0**.
