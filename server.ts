import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini AI client initialization
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. AI Co-Producer Endpoint
app.post('/api/ai/co-producer', async (req: Request, res: Response) => {
  const { prompt, currentProject } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // If Gemini client is available, call gemini-3.8-flash
  if (aiClient) {
    try {
      const systemInstruction = `You are FIesta AI, an elite Grammy-winning music producer, sound designer, and co-producer in FIesta Studio DAW.
Your role is to understand user natural language music instructions and translate them into precise, structured DAW actions and data.
Specialties include: Amapiano, Afrobeats, Afro House, Rwandan traditional modern fusion, Trap, Hip Hop, R&B, Electronic.

Return ONLY valid JSON matching this schema:
{
  "summary": "Brief executive description of what was created/adjusted",
  "tempo": number (60 - 200, optional if unchanged),
  "key": string (e.g. "A minor", "F# minor", optional),
  "scale": string ("minor" | "major" | "pentatonic" | "harmonic_minor" | "dorian", optional),
  "drumPatterns": [
    {
      "channel": "Kick" | "Snare" | "Clap" | "HiHat_Closed" | "HiHat_Open" | "Amapiano_LogDrum" | "Perc_Shaker" | "808_Sub" | "Rim",
      "steps": [boolean] (array of 16 booleans, true if triggered on that 16th step),
      "velocities": [number] (optional, 0.0 to 1.0 for each step)
    }
  ],
  "chords": [
    {
      "name": string,
      "notes": [
        { "midi": number, "note": string, "step": number (0-15), "duration": number (1-16), "velocity": number (0.1-1.0) }
      ]
    }
  ],
  "bassline": [
    { "midi": number, "note": string, "step": number (0-15), "duration": number (1-8), "velocity": number (0.1-1.0) }
  ],
  "melody": [
    { "midi": number, "note": string, "step": number (0-15), "duration": number (1-8), "velocity": number (0.1-1.0) }
  ],
  "mixerSuggestions": [
    {
      "channelName": string,
      "volumeDeltaDb": number,
      "pan": number (-1 to 1),
      "eq": { "low": number (-12 to 12), "mid": number (-12 to 12), "high": number (-12 to 12) },
      "reverbSend": number (0 to 1),
      "recommendation": string
    }
  ],
  "arrangementSections": [
    { "name": string, "bars": number, "energy": "low" | "medium" | "high" }
  ]
}`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `User DAW request: "${prompt}".
Current DAW Project context:
Tempo: ${currentProject?.tempo || 120} BPM
Key: ${currentProject?.key || 'C Major'}
Active tracks: ${JSON.stringify(currentProject?.tracks?.map((t: any) => t.name) || [])}
Produce rich, professional musical patterns suited for FIesta Studio.`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const responseText = aiResponse.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json({ success: true, data: parsed, engine: 'gemini-3.8-flash' });
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, switching to algorithmic producer:', err?.message);
    }
  }

  // Fallback high-fidelity Algorithmic Co-Producer (guaranteed to always work offline)
  const algorithmicData = generateAlgorithmicMusic(prompt, currentProject);
  return res.json({ success: true, data: algorithmicData, engine: 'fiesta-dsp-engine' });
});

// 2. AI MIDI Generator Endpoint
app.post('/api/ai/midi-generator', async (req: Request, res: Response) => {
  const { type, style, key = 'A minor', bars = 4 } = req.body;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Generate a professional MIDI sequence for ${type} in style ${style}, key ${key}, ${bars} bars.
Return ONLY valid JSON format:
{
  "notes": [
    { "midi": number, "note": string, "startStep": number, "durationSteps": number, "velocity": number }
  ],
  "description": string
}`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      if (response.text) {
        return res.json({ success: true, data: JSON.parse(response.text) });
      }
    } catch (e: any) {
      console.warn('AI MIDI fallback:', e?.message);
    }
  }

  // Offline Algorithmic MIDI generator
  const notes = generateAlgorithmicMidi(type, style, key);
  return res.json({ success: true, data: { notes, description: `Algorithmic ${style} ${type} in ${key}` } });
});

// 3. AI Arranger Endpoint
app.post('/api/ai/arranger', async (req: Request, res: Response) => {
  const { genre = 'Amapiano', bpm = 113, key = 'F# minor', mood = 'Vibrant', durationMinutes = 3 } = req.body;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Generate a complete full-song DAW arrangement structure for genre "${genre}", ${bpm} BPM, ${key}, mood "${mood}", target length ~${durationMinutes} minutes.
Return JSON:
{
  "genre": "${genre}",
  "totalBars": number,
  "sections": [
    {
      "name": "Intro" | "Verse 1" | "Pre-Chorus" | "Chorus" | "Verse 2" | "Bridge" | "Final Chorus" | "Outro",
      "startBar": number,
      "lengthBars": number,
      "activeElements": ["Kick", "Log Drum", "Pads", "Lead Melody", "Vocal Chops", "Shaker"],
      "description": string
    }
  ]
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        return res.json({ success: true, data: JSON.parse(response.text) });
      }
    } catch (e: any) {
      console.warn('AI Arranger fallback:', e?.message);
    }
  }

  // Algorithmic arrangement
  const standardSections = [
    { name: 'Intro', startBar: 1, lengthBars: 8, activeElements: ['Pads', 'Shaker'], description: 'Atmospheric intro' },
    { name: 'Verse 1', startBar: 9, lengthBars: 16, activeElements: ['Kick', 'Shaker', 'Log Drum', 'Keys'], description: 'Groove builds with log bass' },
    { name: 'Pre-Chorus', startBar: 25, lengthBars: 8, activeElements: ['Snare Roll', 'Pads', 'Pluck'], description: 'Tension build-up' },
    { name: 'Chorus', startBar: 33, lengthBars: 16, activeElements: ['Kick', 'Snare', 'Log Drum', 'Lead', 'Shaker', '808'], description: 'Maximum energetic drop' },
    { name: 'Verse 2', startBar: 49, lengthBars: 16, activeElements: ['Kick', 'Log Drum', 'Keys'], description: 'Stripped back rhythmic verse' },
    { name: 'Bridge', startBar: 65, lengthBars: 8, activeElements: ['Pads', 'Vocal Chops'], description: 'Harmonic breath before drop' },
    { name: 'Final Chorus', startBar: 73, lengthBars: 16, activeElements: ['All Elements'], description: 'Peak climax with all synths and drums' },
    { name: 'Outro', startBar: 89, lengthBars: 8, activeElements: ['Pads', 'Shaker Fade'], description: 'Smooth outro transition' },
  ];

  return res.json({
    success: true,
    data: { genre, totalBars: 96, sections: standardSections },
  });
});

// 4. AI Mixing & Mastering Assistant
app.post('/api/ai/mix-master', async (req: Request, res: Response) => {
  const { channelStats, target = 'streaming' } = req.body;

  const masteringChains: Record<string, any> = {
    streaming: {
      targetLufs: -14,
      ceilingDb: -0.8,
      eq: { lowCut: 28, lowBoost: 1.2, midDip: -0.8, highAir: 1.8 },
      glueCompression: { ratio: 2.5, threshold: -12, attackMs: 30, releaseMs: 100 },
      stereoWidth: 1.15,
      description: 'Optimized for Spotify, Apple Music & YouTube without heavy distortion or ISP clipping.',
    },
    amapiano: {
      targetLufs: -11,
      ceilingDb: -0.3,
      eq: { lowCut: 25, lowBoost: 3.2, midDip: -1.5, highAir: 2.2 },
      glueCompression: { ratio: 3.5, threshold: -14, attackMs: 25, releaseMs: 80 },
      stereoWidth: 1.2,
      description: 'Heavy sub-bass presence tuned for log drums, punchy kick attack and crisp shaker top end.',
    },
    afrobeats: {
      targetLufs: -12,
      ceilingDb: -0.5,
      eq: { lowCut: 30, lowBoost: 2.0, midDip: 0, highAir: 2.5 },
      glueCompression: { ratio: 3.0, threshold: -13, attackMs: 20, releaseMs: 120 },
      stereoWidth: 1.18,
      description: 'Warm rhythmic drive, punchy mid-bass bounce, and sparkling vocal/percussion headroom.',
    },
    club: {
      targetLufs: -8.5,
      ceilingDb: -0.1,
      eq: { lowCut: 22, lowBoost: 4.0, midDip: -2.0, highAir: 2.0 },
      glueCompression: { ratio: 4.5, threshold: -16, attackMs: 15, releaseMs: 60 },
      stereoWidth: 1.25,
      description: 'Maximum loudness and sub-impact for festival sound systems and dance clubs.',
    },
    warm: {
      targetLufs: -14.5,
      ceilingDb: -1.0,
      eq: { lowCut: 32, lowBoost: 1.5, midDip: 0.5, highAir: -0.5 },
      glueCompression: { ratio: 2.0, threshold: -10, attackMs: 40, releaseMs: 150 },
      stereoWidth: 1.05,
      description: 'Analog tape warmth with smooth rounded transients and gentle saturation.',
    },
  };

  const selectedChain = masteringChains[target.toLowerCase()] || masteringChains.streaming;
  return res.json({ success: true, data: selectedChain });
});

// Helper for offline Algorithmic Producer
function generateAlgorithmicMusic(prompt: string, currentProject: any) {
  const p = prompt.toLowerCase();
  const isAmapiano = p.includes('amapiano') || p.includes('log drum');
  const isAfro = p.includes('afro') || p.includes('afrobeats') || p.includes('house');
  const isTrap = p.includes('trap') || p.includes('808');

  let tempo = 120;
  let key = 'A minor';
  let drumPatterns: any[] = [];
  let chords: any[] = [];
  let bassline: any[] = [];
  let melody: any[] = [];

  if (isAmapiano) {
    tempo = 113;
    key = 'F# minor';
    drumPatterns = [
      {
        channel: 'Kick',
        steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
        velocities: [0.95, 0, 0, 0, 0.95, 0, 0, 0, 0.95, 0, 0, 0, 0.95, 0, 0, 0],
      },
      {
        channel: 'Snare',
        steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true],
        velocities: [0, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 0, 0, 0.9, 0, 0, 0.7],
      },
      {
        channel: 'Amapiano_LogDrum',
        steps: [true, false, true, false, false, true, false, true, false, true, true, false, false, true, false, false],
        velocities: [1.0, 0, 0.85, 0, 0, 0.9, 0, 0.8, 0, 0.9, 0.95, 0, 0, 0.85, 0, 0],
      },
      {
        channel: 'Perc_Shaker',
        steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
        velocities: [0.6, 0.3, 0.8, 0.4, 0.6, 0.3, 0.85, 0.4, 0.6, 0.3, 0.8, 0.4, 0.6, 0.3, 0.9, 0.4],
      },
      {
        channel: 'Rim',
        steps: [false, false, true, false, false, false, false, true, false, false, true, false, false, false, true, false],
      },
    ];

    chords = [
      {
        name: 'F#m9 - Bm7 - C#m7 - F#m9',
        notes: [
          { midi: 54, note: 'F#3', step: 0, duration: 4, velocity: 0.8 },
          { midi: 57, note: 'A3', step: 0, duration: 4, velocity: 0.75 },
          { midi: 61, note: 'C#4', step: 0, duration: 4, velocity: 0.75 },
          { midi: 64, note: 'E4', step: 0, duration: 4, velocity: 0.7 },
          { midi: 68, note: 'G#4', step: 0, duration: 4, velocity: 0.7 },
          { midi: 59, note: 'B3', step: 4, duration: 4, velocity: 0.8 },
          { midi: 62, note: 'D4', step: 4, duration: 4, velocity: 0.75 },
          { midi: 66, note: 'F#4', step: 4, duration: 4, velocity: 0.75 },
          { midi: 69, note: 'A4', step: 4, duration: 4, velocity: 0.7 },
        ],
      },
    ];

    melody = [
      { midi: 69, note: 'A4', step: 2, duration: 2, velocity: 0.8 },
      { midi: 71, note: 'B4', step: 5, duration: 2, velocity: 0.85 },
      { midi: 73, note: 'C#5', step: 8, duration: 3, velocity: 0.9 },
      { midi: 71, note: 'B4', step: 12, duration: 2, velocity: 0.75 },
    ];
  } else if (isTrap) {
    tempo = 140;
    key = 'C minor';
    drumPatterns = [
      { channel: 'Kick', steps: [true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false] },
      { channel: 'Snare', steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false] },
      { channel: 'HiHat_Closed', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true] },
      { channel: '808_Sub', steps: [true, false, false, true, false, false, false, false, false, true, false, false, true, false, false, false] },
    ];
    chords = [
      {
        name: 'Cm - Ab - Eb - Bb',
        notes: [
          { midi: 48, note: 'C3', step: 0, duration: 4, velocity: 0.85 },
          { midi: 51, note: 'Eb3', step: 0, duration: 4, velocity: 0.8 },
          { midi: 55, note: 'G3', step: 0, duration: 4, velocity: 0.8 },
        ],
      },
    ];
  } else {
    // Default Afrobeats / Afro-pop
    tempo = 106;
    key = 'A minor';
    drumPatterns = [
      { channel: 'Kick', steps: [true, false, false, true, false, false, true, false, false, false, true, false, false, true, false, false] },
      { channel: 'Clap', steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false] },
      { channel: 'Perc_Shaker', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true] },
      { channel: 'Rim', steps: [false, false, true, false, false, true, false, false, true, false, false, true, false, false, true, false] },
    ];
    chords = [
      {
        name: 'Am - F - C - G',
        notes: [
          { midi: 57, note: 'A3', step: 0, duration: 4, velocity: 0.8 },
          { midi: 60, note: 'C4', step: 0, duration: 4, velocity: 0.75 },
          { midi: 64, note: 'E4', step: 0, duration: 4, velocity: 0.75 },
        ],
      },
    ];
    melody = [
      { midi: 69, note: 'A4', step: 0, duration: 2, velocity: 0.85 },
      { midi: 72, note: 'C5', step: 3, duration: 2, velocity: 0.8 },
      { midi: 71, note: 'B4', step: 6, duration: 2, velocity: 0.8 },
      { midi: 67, note: 'G4', step: 10, duration: 4, velocity: 0.75 },
    ];
  }

  return {
    summary: `Generated authentic ${isAmapiano ? 'Amapiano' : isTrap ? 'Trap' : 'Afrobeats'} groove at ${tempo} BPM in ${key}.`,
    tempo,
    key,
    scale: 'minor',
    drumPatterns,
    chords,
    bassline,
    melody,
    arrangementSections: [
      { name: 'Intro', bars: 8, energy: 'low' },
      { name: 'Verse', bars: 16, energy: 'medium' },
      { name: 'Drop / Chorus', bars: 16, energy: 'high' },
      { name: 'Outro', bars: 8, energy: 'low' },
    ],
  };
}

function generateAlgorithmicMidi(type: string, style: string, key: string) {
  // Return standard musical chord progression or melody
  if (type === 'chords') {
    return [
      { midi: 57, note: 'A3', startStep: 0, durationSteps: 4, velocity: 0.8 },
      { midi: 60, note: 'C4', startStep: 0, durationSteps: 4, velocity: 0.75 },
      { midi: 64, note: 'E4', startStep: 0, durationSteps: 4, velocity: 0.75 },
      { midi: 53, note: 'F3', startStep: 4, durationSteps: 4, velocity: 0.8 },
      { midi: 57, note: 'A3', startStep: 4, durationSteps: 4, velocity: 0.75 },
      { midi: 60, note: 'C4', startStep: 4, durationSteps: 4, velocity: 0.75 },
      { midi: 48, note: 'C3', startStep: 8, durationSteps: 4, velocity: 0.8 },
      { midi: 52, note: 'E3', startStep: 8, durationSteps: 4, velocity: 0.75 },
      { midi: 55, note: 'G3', startStep: 8, durationSteps: 4, velocity: 0.75 },
      { midi: 55, note: 'G3', startStep: 12, durationSteps: 4, velocity: 0.8 },
      { midi: 59, note: 'B3', startStep: 12, durationSteps: 4, velocity: 0.75 },
      { midi: 62, note: 'D4', startStep: 12, durationSteps: 4, velocity: 0.75 },
    ];
  }
  return [
    { midi: 69, note: 'A4', startStep: 0, durationSteps: 2, velocity: 0.85 },
    { midi: 72, note: 'C5', startStep: 2, durationSteps: 2, velocity: 0.8 },
    { midi: 76, note: 'E5', startStep: 4, durationSteps: 3, velocity: 0.9 },
    { midi: 74, note: 'D5', startStep: 8, durationSteps: 2, velocity: 0.75 },
    { midi: 71, note: 'B4', startStep: 10, durationSteps: 2, velocity: 0.8 },
    { midi: 69, note: 'A4', startStep: 12, durationSteps: 4, velocity: 0.85 },
  ];
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🍎 FIesta Studio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
