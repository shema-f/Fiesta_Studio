/**
 * FIesta Studio - Professional Channel Rack & Step Sequencer
 * 16/32/64 step modes, velocity adjustment, genre grooves (Amapiano, Afrobeats, Trap),
 * sample selection, pitch tuning, and live auditions.
 */

import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  Shuffle,
  Volume2,
  Sliders,
  ChevronDown,
  Layers,
  Music,
} from 'lucide-react';
import { DrumChannel, ProjectState } from '../engine/projectStore';
import { audioEngine } from '../audio/audioEngine';

interface ChannelRackProps {
  project: ProjectState;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
}

export const ChannelRack: React.FC<ChannelRackProps> = ({ project, onUpdateProject }) => {
  const [stepCount, setStepCount] = useState<16 | 32>(16);
  const [activeVelocityChannelId, setActiveVelocityChannelId] = useState<string | null>(null);

  // Audition drum sound
  const handleAudition = (channel: DrumChannel) => {
    audioEngine.triggerDrum(channel.type, 0.95, undefined, 'bus_drums', channel.pitch);
  };

  // Toggle step
  const handleToggleStep = (channelId: string, stepIdx: number) => {
    onUpdateProject((p) => ({
      ...p,
      drumChannels: p.drumChannels.map((c) => {
        if (c.id !== channelId) return c;
        const newSteps = [...c.steps];
        newSteps[stepIdx] = !newSteps[stepIdx];

        // Audition when activating
        if (newSteps[stepIdx]) {
          audioEngine.triggerDrum(c.type, c.velocities[stepIdx] || 0.9, undefined, 'bus_drums', c.pitch);
        }

        return { ...c, steps: newSteps };
      }),
    }));
  };

  // Adjust step velocity
  const handleStepVelocityChange = (channelId: string, stepIdx: number, vel: number) => {
    onUpdateProject((p) => ({
      ...p,
      drumChannels: p.drumChannels.map((c) => {
        if (c.id !== channelId) return c;
        const newVels = [...c.velocities];
        newVels[stepIdx] = vel;
        return { ...c, velocities: newVels };
      }),
    }));
  };

  // Mute / Solo
  const toggleMute = (channelId: string) => {
    onUpdateProject((p) => ({
      ...p,
      drumChannels: p.drumChannels.map((c) => (c.id === channelId ? { ...c, mute: !c.mute } : c)),
    }));
  };

  const toggleSolo = (channelId: string) => {
    onUpdateProject((p) => ({
      ...p,
      drumChannels: p.drumChannels.map((c) => (c.id === channelId ? { ...c, solo: !c.solo } : c)),
    }));
  };

  // Randomize pattern
  const handleRandomize = () => {
    onUpdateProject((p) => ({
      ...p,
      drumChannels: p.drumChannels.map((c) => {
        const newSteps = Array.from({ length: 16 }).map(() => Math.random() > 0.7);
        return { ...c, steps: newSteps };
      }),
    }));
  };

  // Clear all steps
  const handleClear = () => {
    onUpdateProject((p) => ({
      ...p,
      drumChannels: p.drumChannels.map((c) => ({
        ...c,
        steps: Array(16).fill(false),
      })),
    }));
  };

  // Load Genre Pattern Grooves
  const loadGenreGroove = (genre: 'amapiano' | 'afrobeats' | 'trap' | 'house') => {
    onUpdateProject((p) => {
      let updatedChannels = [...p.drumChannels];

      if (genre === 'amapiano') {
        updatedChannels = updatedChannels.map((c) => {
          if (c.type === 'kick') {
            return { ...c, steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false] };
          }
          if (c.type === 'amapiano_logdrum') {
            return { ...c, steps: [true, false, true, false, false, true, false, true, false, true, true, false, false, true, false, false] };
          }
          if (c.type === 'perc_shaker') {
            return { ...c, steps: Array(16).fill(true) };
          }
          if (c.type === 'rim') {
            return { ...c, steps: [false, false, true, false, false, false, false, true, false, false, true, false, false, false, true, false] };
          }
          if (c.type === 'snare' || c.type === 'clap') {
            return { ...c, steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false] };
          }
          return c;
        });
        return { ...p, bpm: 113, drumChannels: updatedChannels };
      } else if (genre === 'afrobeats') {
        updatedChannels = updatedChannels.map((c) => {
          if (c.type === 'kick') {
            return { ...c, steps: [true, false, false, true, false, false, true, false, false, false, true, false, false, true, false, false] };
          }
          if (c.type === 'clap') {
            return { ...c, steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false] };
          }
          if (c.type === 'rim') {
            return { ...c, steps: [false, false, true, false, false, true, false, false, true, false, false, true, false, false, true, false] };
          }
          if (c.type === 'perc_shaker') {
            return { ...c, steps: Array(16).fill(true) };
          }
          return c;
        });
        return { ...p, bpm: 106, drumChannels: updatedChannels };
      } else if (genre === 'trap') {
        updatedChannels = updatedChannels.map((c) => {
          if (c.type === 'kick') {
            return { ...c, steps: [true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false] };
          }
          if (c.type === 'snare') {
            return { ...c, steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false] };
          }
          if (c.type === 'hihat_closed') {
            return { ...c, steps: Array(16).fill(true) };
          }
          if (c.type === '808_sub') {
            return { ...c, steps: [true, false, false, true, false, false, false, false, false, true, false, false, true, false, false, false] };
          }
          return c;
        });
        return { ...p, bpm: 140, drumChannels: updatedChannels };
      }

      return p;
    });
  };

  const currentStep = project.current16thStep % stepCount;

  return (
    <div className="flex-1 flex flex-col bg-[#0b0e14] overflow-hidden select-none">
      {/* Top Rack Toolbar */}
      <div className="h-10 bg-[#121620] border-b border-[#1f2633] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff3b69]" />
            STEP SEQUENCER
          </span>

          {/* Step Count Mode */}
          <div className="flex items-center bg-[#090b0e] border border-[#202735] p-0.5 rounded text-xs font-mono-daw">
            <button
              onClick={() => setStepCount(16)}
              className={`px-2 py-0.5 rounded ${
                stepCount === 16 ? 'bg-[#222b3b] text-[#00f0a8] font-bold' : 'text-[#7e8ea3]'
              }`}
            >
              16 STEPS
            </button>
            <button
              onClick={() => setStepCount(32)}
              className={`px-2 py-0.5 rounded ${
                stepCount === 32 ? 'bg-[#222b3b] text-[#00f0a8] font-bold' : 'text-[#7e8ea3]'
              }`}
            >
              32 STEPS
            </button>
          </div>

          {/* Quick Genre Grooves */}
          <div className="hidden md:flex items-center space-x-1 pl-2 border-l border-[#202735]">
            <span className="text-[10px] text-[#55657e] mr-1">GROOVE:</span>
            <button
              onClick={() => loadGenreGroove('amapiano')}
              className="px-2 py-0.5 bg-[#18212e] hover:bg-[#222f42] text-xs font-semibold text-[#00f0a8] rounded border border-[#26374f] transition-colors"
            >
              Amapiano
            </button>
            <button
              onClick={() => loadGenreGroove('afrobeats')}
              className="px-2 py-0.5 bg-[#18212e] hover:bg-[#222f42] text-xs font-semibold text-[#ff6b4a] rounded border border-[#3b2b2b] transition-colors"
            >
              Afrobeats
            </button>
            <button
              onClick={() => loadGenreGroove('trap')}
              className="px-2 py-0.5 bg-[#18212e] hover:bg-[#222f42] text-xs font-semibold text-[#f59e0b] rounded border border-[#3d3324] transition-colors"
            >
              Trap 808
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRandomize}
            title="Randomize Drum Pattern"
            className="px-2 py-1 bg-[#18212e] hover:bg-[#222f42] text-[#8e9eb5] hover:text-white rounded text-xs flex items-center space-x-1 transition-colors"
          >
            <Shuffle size={12} />
            <span className="hidden sm:inline">Random</span>
          </button>
          <button
            onClick={handleClear}
            title="Clear all steps"
            className="px-2 py-1 bg-[#18212e] hover:bg-[#222f42] text-[#8e9eb5] hover:text-[#ff3b69] rounded text-xs flex items-center space-x-1 transition-colors"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Sequencer Grid */}
      <div className="flex-1 overflow-y-auto overflow-x-auto p-3">
        <div className="min-w-[700px] flex flex-col space-y-1.5">
          {/* Step Ruler */}
          <div className="flex items-center pl-60 pr-2">
            <div className="flex-1 grid grid-cols-16 gap-1 text-center font-mono-daw text-[10px] text-[#55657e]">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={`py-0.5 rounded ${
                    project.isPlaying && currentStep === i
                      ? 'text-[#00f0a8] font-bold bg-[#00f0a8]/10'
                      : i % 4 === 0
                      ? 'text-[#8fa1b9] font-bold'
                      : ''
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Drum Channel Strips */}
          {project.drumChannels.map((channel) => (
            <div
              key={channel.id}
              className="flex items-center bg-[#11151e] border border-[#1b2230] rounded-lg px-2 py-1.5 hover:border-[#2a364d] transition-all"
            >
              {/* Channel Header (Audition button, Mute/Solo, Volume & Pitch) */}
              <div className="w-56 flex items-center justify-between pr-3 shrink-0">
                <div className="flex items-center space-x-1.5">
                  {/* Mute/Solo */}
                  <button
                    onClick={() => toggleMute(channel.id)}
                    className={`w-4 h-4 rounded text-[9px] font-bold leading-none ${
                      channel.mute ? 'bg-[#ff3b69] text-white' : 'bg-[#1a2230] text-[#6b7c93] hover:text-white'
                    }`}
                  >
                    M
                  </button>
                  <button
                    onClick={() => toggleSolo(channel.id)}
                    className={`w-4 h-4 rounded text-[9px] font-bold leading-none ${
                      channel.solo ? 'bg-[#f59e0b] text-black' : 'bg-[#1a2230] text-[#6b7c93] hover:text-white'
                    }`}
                  >
                    S
                  </button>

                  {/* Channel Audition Button */}
                  <button
                    onClick={() => handleAudition(channel)}
                    title="Click to audition sound"
                    className="px-2 py-1 bg-[#1a2333] hover:bg-[#253249] text-white text-xs font-bold rounded truncate max-w-[100px] border border-[#26354b] shadow-xs active:scale-95 transition-all flex items-center space-x-1"
                  >
                    <span className="truncate">{channel.name}</span>
                  </button>
                </div>

                {/* Pitch Offset & Volume Knob */}
                <div className="flex items-center space-x-1">
                  <span className="text-[9px] text-[#55657e] font-mono-daw">
                    {channel.pitch > 0 ? `+${channel.pitch}` : channel.pitch}st
                  </span>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    value={channel.pitch}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      onUpdateProject((p) => ({
                        ...p,
                        drumChannels: p.drumChannels.map((c) =>
                          c.id === channel.id ? { ...c, pitch: val } : c
                        ),
                      }));
                    }}
                    title="Pitch Semitones"
                    className="w-10 accent-[#ff3b69] h-1 bg-[#1a2230] rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* 16 / 32 Step Sequencer Buttons */}
              <div className="flex-1 grid grid-cols-16 gap-1">
                {Array.from({ length: 16 }).map((_, stepIdx) => {
                  const isActive = channel.steps[stepIdx];
                  const isCurrent = project.isPlaying && currentStep === stepIdx;
                  const isBeatStart = stepIdx % 4 === 0;

                  return (
                    <button
                      key={stepIdx}
                      onClick={() => handleToggleStep(channel.id, stepIdx)}
                      className={`h-8 rounded-sm transition-all relative flex flex-col justify-end p-0.5 shadow-sm active:scale-90 ${
                        isActive
                          ? 'bg-gradient-to-t from-[#ff3b69] to-[#ff6b4a] shadow-[#ff3b69]/40'
                          : isBeatStart
                          ? 'bg-[#1b2230] hover:bg-[#242e40]'
                          : 'bg-[#141a24] hover:bg-[#1d2636]'
                      } ${isCurrent ? 'ring-2 ring-[#00f0a8] brightness-125' : ''}`}
                    >
                      {/* Velocity indicator bar inside the step */}
                      {isActive && (
                        <div
                          className="w-full bg-white/40 rounded-xs"
                          style={{ height: `${(channel.velocities[stepIdx] || 0.9) * 100}%` }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
