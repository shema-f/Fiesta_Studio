# ADR-004: Server-Side AI Tool-Calling Abstraction Layer

## Context
Generative AI features in music applications often fail when they attempt to generate audio end-to-end or produce conversational text that cannot be translated into musical action. Furthermore, exposing AI API keys in client JavaScript constitutes a severe security vulnerability.

## Problem
How should FIesta Studio integrate generative AI models to provide meaningful musical assistance while protecting secrets and ensuring project stability?

## Options Considered
1. **Client-Side Direct API Calls:** Call Gemini API directly from browser React components.
2. **Server-Side Streaming Text Assistant:** A standard chat assistant that gives musical advice as markdown text.
3. **Server-Side Structured Tool-Calling Proxy:** An isolated Express server endpoint that invokes the official `@google/genai` SDK with typed DAW function tools (`setDrumPattern`, `setBpm`, `insertMidiNotes`).

## Decision
We adopted **Option 3: Server-Side Structured Tool-Calling Proxy**.

All external AI communications flow through `/api/ai/*` on the server. The AI model is instructed to output strictly typed JSON tool mutations that the client-side state machine validates and applies with complete undo/redo history.

## Consequences
- **Positive:** Zero API key leakage to browser clients.
- **Positive:** AI acts directly on the project (programming real drum steps and notes), not merely generating conversational text.
- **Positive:** Works offline or gracefully degrades if the AI service is unavailable.
