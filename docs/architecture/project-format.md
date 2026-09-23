# FIesta Project Format (.fiesta) Specification

The `.fiesta` project format is an open, human-readable, schema-validated JSON document representing the entire musical arrangement, sequences, patterns, mixer routings, and metadata.

---

## 1. Schema Specification (v1.0.0)

```json
{
  "version": "1.0.0",
  "metadata": {
    "title": "Kigali Sunset Groove",
    "creator": "Ferrivox",
    "created": "2026-09-23T12:00:00Z",
    "modified": "2026-09-23T12:30:00Z",
    "bpm": 118,
    "key": "F# Minor",
    "timeSignature": "4/4"
  },
  "settings": {
    "swing": 25,
    "masterVolume": 1.0,
    "stepCount": 16
  },
  "drumChannels": [
    {
      "id": "ch_kick",
      "name": "Punch Kick",
      "type": "kick",
      "mute": false,
      "solo": false,
      "pitch": 0,
      "steps": [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      "velocities": [0.95, 0, 0, 0, 0.9, 0, 0, 0, 0.95, 0, 0, 0, 0.9, 0, 0, 0]
    }
  ],
  "tracks": [
    {
      "id": "trk_inanga",
      "name": "Rwandan Inanga Lead",
      "type": "synth",
      "busId": "bus_inst",
      "color": "#00f0a8",
      "volume": 0.85,
      "pan": 0.1,
      "mute": false,
      "solo": false,
      "clips": [
        {
          "id": "clip_01",
          "name": "Inanga Theme",
          "startBar": 1,
          "durationBars": 4,
          "notes": [
            { "id": "n1", "note": "F#4", "step": 0, "duration": 2, "velocity": 0.8 },
            { "id": "n2", "note": "A4", "step": 4, "duration": 2, "velocity": 0.85 }
          ]
        }
      ]
    }
  ],
  "buses": [
    { "id": "bus_master", "name": "Master", "volume": 1.0, "pan": 0.0 },
    { "id": "bus_drums", "name": "Drums Bus", "volume": 1.0, "pan": 0.0 },
    { "id": "bus_inst", "name": "Instruments", "volume": 0.9, "pan": 0.0 },
    { "id": "bus_vocals", "name": "Vocals", "volume": 1.0, "pan": 0.0 }
  ]
}
```

---

## 2. Backward Compatibility Guarantees

All future versions of FIesta Studio MUST support loading earlier `.fiesta` project files:
- Missing optional properties are automatically assigned defaults upon deserialization.
- Deprecated attributes are gracefully ignored without corrupting valid project states.
