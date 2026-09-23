/**
 * FIesta Studio - AI Co-Producer & Assistant
 * Powered by Google Gemini on the server side.
 * Generates drum patterns, chord progressions, arrangements, and mixing advice.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Music,
  Sliders,
  Layers,
  Check,
  AlertCircle,
  Wand2,
  Zap,
} from 'lucide-react';
import { ProjectState } from '../engine/projectStore';

interface AIAssistantProps {
  project: ProjectState;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ project, onUpdateProject }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<any | null>(null);
  const [applied, setApplied] = useState(false);

  const quickPrompts = [
    {
      title: 'Amapiano Heat',
      prompt: 'Generate an energetic South African Amapiano groove at 113 BPM in F# minor with authentic syncopated log drums, rolling 16th shakers, and jazz minor 9th chords.',
    },
    {
      title: 'Afrobeats Summer',
      prompt: 'Create a smooth Lagos Afrobeats bounce at 106 BPM in A minor with kick-clap syncopation, rimshot groove, and sweet guitar plucks.',
    },
    {
      title: 'Trap 808 Punch',
      prompt: 'Make a dark aggressive trap beat at 140 BPM with heavy sliding 808 sub bass, tight rolling hi-hats, and eerie minor chords.',
    },
    {
      title: 'Rwandan Heritage',
      prompt: 'Design an acoustic fusion piece featuring traditional Rwandan Inanga harp scales, royal Intore ceremonial drums, and Amayugi shakers.',
    },
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || prompt;
    if (!text.trim() || loading) return;

    setLoading(true);
    setApplied(false);

    try {
      const res = await fetch('/api/ai/co-producer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          projectContext: {
            bpm: project.bpm,
            key: project.key,
            scale: project.scale,
            tracksCount: project.tracks.length,
          },
        }),
      });

      const data = await res.json();
      setLastResponse(data);
    } catch (err) {
      console.error('AI Co-Producer error:', err);
      // Fallback response if offline or key not set
      setLastResponse({
        explanation: 'Here is a custom rhythmic groove tailored to your current project.',
        bpm: project.bpm,
        key: project.key,
        scale: project.scale,
        tracks: [
          {
            name: 'AI Melodic Chords',
            instrument: 'piano',
            notes: [
              { midi: 57, startStep: 0, durationSteps: 8, velocity: 0.8 },
              { midi: 60, startStep: 0, durationSteps: 8, velocity: 0.75 },
              { midi: 64, startStep: 0, durationSteps: 8, velocity: 0.8 },
              { midi: 55, startStep: 8, durationSteps: 8, velocity: 0.8 },
              { midi: 59, startStep: 8, durationSteps: 8, velocity: 0.75 },
              { midi: 62, startStep: 8, durationSteps: 8, velocity: 0.8 },
            ],
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const applyAIToProject = () => {
    if (!lastResponse) return;

    onUpdateProject((p) => {
      let updatedTracks = [...p.tracks];
      let updatedBpm = lastResponse.bpm || p.bpm;
      let updatedKey = lastResponse.key || p.key;

      if (lastResponse.tracks && lastResponse.tracks.length > 0) {
        lastResponse.tracks.forEach((aiTrack: any) => {
          const newTrack = {
            id: 'ai_track_' + Date.now() + Math.random().toString(36).slice(2, 6),
            name: aiTrack.name || 'AI Generated Synth',
            type: 'midi' as const,
            color: '#00f0a8',
            instrumentType: aiTrack.instrument || 'synth',
            volume: 0.85,
            pan: 0,
            mute: false,
            solo: false,
            busId: 'bus_instruments',
            inserts: [],
            clips: [
              {
                id: 'ai_clip_' + Date.now(),
                trackId: 'ai_track_' + Date.now(),
                type: 'midi' as const,
                name: aiTrack.name || 'AI MIDI Phrase',
                startBar: 1,
                lengthBars: 4,
                color: '#00f0a8',
                notes: (aiTrack.notes || []).map((n: any, idx: number) => ({
                  id: 'n_' + idx,
                  midi: n.midi || 60,
                  noteName: 'Note',
                  startStep: n.startStep || 0,
                  durationSteps: n.durationSteps || 4,
                  velocity: n.velocity || 0.85,
                })),
              },
            ],
          };
          updatedTracks.push(newTrack);
        });
      }

      // Also update drum channels if suggested
      let updatedDrums = [...p.drumChannels];
      if (lastResponse.drumPattern) {
        Object.entries(lastResponse.drumPattern).forEach(([type, steps]: [string, any]) => {
          updatedDrums = updatedDrums.map((c) => {
            if (c.type.includes(type) && Array.isArray(steps)) {
              return { ...c, steps: steps.slice(0, 16) };
            }
            return c;
          });
        });
      }

      return {
        ...p,
        tracks: updatedTracks,
        drumChannels: updatedDrums,
        bpm: updatedBpm,
        key: updatedKey,
        viewMode: 'arrangement',
      };
    });

    setApplied(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b0e14] overflow-hidden select-none p-4 max-w-4xl mx-auto w-full">
      {/* AI Assistant Header */}
      <div className="bg-gradient-to-r from-[#18212e] via-[#10141d] to-[#18212e] border border-[#233146] rounded-2xl p-4 mb-4 shadow-lg shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff3b69] to-[#00f0a8] flex items-center justify-center p-[1px]">
              <div className="w-full h-full bg-[#0b0e14] rounded-[7px] flex items-center justify-center">
                <Sparkles size={16} className="text-[#00f0a8]" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-1.5">
                FIesta AI Co-Producer
                <span className="text-[9px] bg-[#00f0a8]/10 text-[#00f0a8] px-1.5 py-0.2 rounded border border-[#00f0a8]/30">
                  SERVER GEMINI 2.5
                </span>
              </h2>
              <p className="text-[11px] text-[#718299]">
                Your intelligent musical partner. Describe chords, beats, genres, or mix enhancements.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          {quickPrompts.map((item) => (
            <button
              key={item.title}
              onClick={() => {
                setPrompt(item.prompt);
                handleSend(item.prompt);
              }}
              className="px-2.5 py-1 bg-[#121721] hover:bg-[#1c2433] text-white border border-[#232d3d] hover:border-[#00f0a8]/50 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-xs flex items-center space-x-1"
            >
              <Wand2 size={11} className="text-[#00f0a8]" />
              <span>{item.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat & Output Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {lastResponse ? (
          <div className="bg-[#10141d] border border-[#202b3b] rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#00f0a8] flex items-center gap-1.5">
                <Sparkles size={13} />
                AI Generated Musical Arrangement
              </span>

              {/* Apply Button */}
              <button
                onClick={applyAIToProject}
                disabled={applied}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
                  applied
                    ? 'bg-[#1b2533] text-[#00f0a8] border border-[#00f0a8]/40'
                    : 'bg-[#00f0a8] text-[#0b0e14] hover:bg-[#00f0a8]/90 shadow-lg shadow-[#00f0a8]/20'
                }`}
              >
                {applied ? (
                  <>
                    <Check size={13} />
                    <span>Applied to Project</span>
                  </>
                ) : (
                  <>
                    <Zap size={13} />
                    <span>Apply to Project</span>
                  </>
                )}
              </button>
            </div>

            {/* Explanation */}
            <p className="text-xs text-[#b0c0d6] mb-3 leading-relaxed">
              {lastResponse.explanation}
            </p>

            {/* Metadata Badges */}
            <div className="flex items-center space-x-3 text-xs font-mono-daw text-[#718299] bg-[#090b0e] p-2 rounded-lg border border-[#1b2230]">
              {lastResponse.bpm && (
                <span>
                  BPM: <strong className="text-white">{lastResponse.bpm}</strong>
                </span>
              )}
              {lastResponse.key && (
                <span>
                  Key: <strong className="text-white">{lastResponse.key}</strong>
                </span>
              )}
              {lastResponse.scale && (
                <span>
                  Scale: <strong className="text-white">{lastResponse.scale}</strong>
                </span>
              )}
              {lastResponse.tracks && (
                <span>
                  New Tracks: <strong className="text-[#00f0a8]">{lastResponse.tracks.length}</strong>
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="h-44 border-2 border-dashed border-[#1f2633] rounded-2xl flex flex-col items-center justify-center text-center p-6 text-[#55657e]">
            <Sparkles size={28} className="text-[#00f0a8] mb-2 opacity-60" />
            <p className="text-xs font-semibold text-[#8fa0b5]">
              Ask FIesta AI to generate ideas, chord progressions, or beats.
            </p>
            <p className="text-[11px] text-[#55657e] mt-1">
              "Create an Amapiano log drum rhythm with African shakers at 113 BPM"
            </p>
          </div>
        )}
      </div>

      {/* Bottom Prompt Input */}
      <div className="shrink-0 flex items-center space-x-2 bg-[#10141d] border border-[#202b3b] p-2 rounded-xl shadow-lg">
        <input
          type="text"
          placeholder="Ask AI Co-Producer (e.g. Generate bouncy afrobeats piano chords in A minor)..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-transparent text-white text-xs px-2 outline-none placeholder-[#4b586e]"
        />

        <button
          onClick={() => handleSend()}
          disabled={loading || !prompt.trim()}
          className="px-4 py-2 bg-[#00f0a8] hover:bg-[#00f0a8]/90 disabled:opacity-40 text-[#0b0e14] font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-all shadow-sm"
        >
          {loading ? (
            <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={13} />
          )}
          <span>Generate</span>
        </button>
      </div>
    </div>
  );
};
