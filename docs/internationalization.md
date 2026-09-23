# Internationalization (i18n) Guide

FIesta Studio is built for an international community of music creators and developers. This document outlines the internationalization architecture and provides a step-by-step guide for contributing translations.

---

## 1. Supported Languages & Roadmap

| Language Code | Language | Native Name | Status | Priority |
| :--- | :--- | :--- | :--- | :--- |
| `en` | English | English | Default / Complete | Primary Dev Language |
| `rw` | Kinyarwanda | Ikinyarwanda | :construction: In Development | High (Rwanda Origin) |
| `sw` | Swahili | Kiswahili | :construction: In Development | High (East Africa) |
| `fr` | French | Français | :clipboard: Planned | High (Francophone Africa / Global) |
| `es` | Spanish | Español | :clipboard: Planned | Medium |
| `pt` | Portuguese | Português | :clipboard: Planned | Medium (Angola, Mozambique, Brazil) |
| `ja` | Japanese | 日本語 | :clipboard: Planned | Medium |
| `ar` | Arabic | العربية | :clipboard: Planned | Medium |

---

## 2. Translation Architecture

UI strings are localized using a key-value dictionary pattern.

Location: `src/i18n/locales/{lang}.json`

### Example Translation Schema:
```json
{
  "transport": {
    "play": "Play",
    "stop": "Stop",
    "record": "Record",
    "tempo": "Tempo",
    "metronome": "Metronome"
  },
  "channel_rack": {
    "title": "Channel Rack",
    "add_channel": "Add Channel",
    "swing": "Swing",
    "velocity": "Velocity",
    "steps_16": "16 Steps",
    "steps_32": "32 Steps"
  },
  "mixer": {
    "master": "Master",
    "solo": "Solo",
    "mute": "Mute",
    "pan": "Pan",
    "volume": "Volume"
  },
  "instruments": {
    "inanga": "Rwandan Inanga Harp",
    "log_drum": "Amapiano Log Drum",
    "sub_boom": "808 Sub Boom"
  }
}
```

---

## 3. How to Contribute a Translation

1. Fork the repository and create a branch:
   ```bash
   git checkout -b docs/i18n-kinyarwanda
   ```
2. Copy the reference English template:
   ```bash
   cp src/i18n/locales/en.json src/i18n/locales/rw.json
   ```
3. Translate the string values while keeping all JSON keys identical.
4. Test that the JSON is valid:
   ```bash
   node -e "JSON.parse(fs.readFileSync('src/i18n/locales/rw.json'))"
   ```
5. Commit and submit a pull request with the title `[i18n] Add Kinyarwanda translation`.
