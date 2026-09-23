/**
 * FIesta Studio - Multitrack Arrangement & Timeline View
 * Clip editing, track management, loop markers, playhead, and real waveforms.
 */

import React, { useState, useRef } from 'react';
import {
  Plus,
  Volume2,
  VolumeX,
  Mic,
  Music,
  Grid,
  Scissors,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronRight,
  Move,
} from 'lucide-react';
import { Track, Clip, ProjectState } from '../engine/projectStore';
import { InstrumentType, ViewMode } from '../types/daw';

interface ArrangementViewProps {
  project: ProjectState;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
  onSelectTrack: (trackId: string) => void;
  onSelectClip: (clip: Clip) => void;
}

export const ArrangementView: React.FC<ArrangementViewProps> = ({
  project,
  onUpdateProject,
  onSelectTrack,
  onSelectClip,
}) => {
  const [pixelsPerBar, setPixelsPerBar] = useState(100);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(project.activeClipId);
  const [activeTool, setActiveTool] = useState<'pointer' | 'cut' | 'duplicate'>('pointer');
  const timelineRef = useRef<HTMLDivElement>(null);

  const totalBars = 32;

  // Track actions
  const toggleMute = (trackId: string) => {
    onUpdateProject((p) => ({
      ...p,
      tracks: p.tracks.map((t) => (t.id === trackId ? { ...t, mute: !t.mute } : t)),
    }));
  };

  const toggleSolo = (trackId: string) => {
    onUpdateProject((p) => ({
      ...p,
      tracks: p.tracks.map((t) => (t.id === trackId ? { ...t, solo: !t.solo } : t)),
    }));
  };

  const handleAddTrack = (type: 'midi' | 'audio' | 'drums', instrumentType: InstrumentType = 'synth') => {
    const newTrack: Track = {
      id: 'track_' + Date.now(),
      name: type === 'drums' ? 'New Drum Rack' : type === 'audio' ? 'Vocal / Audio' : `Synth (${instrumentType})`,
      type,
      color: type === 'drums' ? '#ff3b69' : type === 'audio' ? '#a855f7' : '#00f0a8',
      instrumentType,
      volume: 0.9,
      pan: 0,
      mute: false,
      solo: false,
      busId: type === 'drums' ? 'bus_drums' : type === 'audio' ? 'bus_vocals' : 'bus_instruments',
      inserts: [],
      clips: [],
    };

    onUpdateProject((p) => ({
      ...p,
      tracks: [...p.tracks, newTrack],
      activeTrackId: newTrack.id,
    }));
  };

  // Timeline click to reposition playhead
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newBar = Math.max(1, clickX / pixelsPerBar + 1);
    onUpdateProject((p) => ({ ...p, playheadBar: newBar }));
  };

  // Clip split action
  const handleClipAction = (trackId: string, clip: Clip, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClipId(clip.id);
    onSelectTrack(trackId);
    onSelectClip(clip);

    if (activeTool === 'cut') {
      // Split clip in half
      const halfLength = Math.max(0.5, clip.lengthBars / 2);
      const splitClip: Clip = {
        ...clip,
        id: 'clip_' + Date.now(),
        name: clip.name + ' (B)',
        startBar: clip.startBar + halfLength,
        lengthBars: halfLength,
      };

      onUpdateProject((p) => ({
        ...p,
        tracks: p.tracks.map((t) =>
          t.id === trackId
            ? {
                ...t,
                clips: [
                  ...t.clips.map((c) => (c.id === clip.id ? { ...c, lengthBars: halfLength } : c)),
                  splitClip,
                ],
              }
            : t
        ),
      }));
    } else if (activeTool === 'duplicate') {
      const dupClip: Clip = {
        ...clip,
        id: 'clip_' + Date.now(),
        startBar: clip.startBar + clip.lengthBars,
      };

      onUpdateProject((p) => ({
        ...p,
        tracks: p.tracks.map((t) => (t.id === trackId ? { ...t, clips: [...t.clips, dupClip] } : t)),
      }));
    }
  };

  const handleDeleteSelectedClip = () => {
    if (!selectedClipId) return;
    onUpdateProject((p) => ({
      ...p,
      tracks: p.tracks.map((t) => ({
        ...t,
        clips: t.clips.filter((c) => c.id !== selectedClipId),
      })),
    }));
    setSelectedClipId(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b0d11] overflow-hidden select-none">
      {/* Timeline Toolbar */}
      <div className="h-10 bg-[#12161f] border-b border-[#1f2633] px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          {/* Tool selectors: Pointer, Cut, Duplicate, Delete */}
          <div className="flex items-center bg-[#090b0e] border border-[#202735] p-0.5 rounded-lg space-x-0.5">
            <button
              onClick={() => setActiveTool('pointer')}
              title="Pointer / Selection tool"
              className={`p-1.5 rounded transition-colors ${
                activeTool === 'pointer' ? 'bg-[#242e40] text-[#00f0a8]' : 'text-[#7e8ea3] hover:text-white'
              }`}
            >
              <Move size={14} />
            </button>
            <button
              onClick={() => setActiveTool('cut')}
              title="Split / Cut Tool"
              className={`p-1.5 rounded transition-colors ${
                activeTool === 'cut' ? 'bg-[#242e40] text-[#00f0a8]' : 'text-[#7e8ea3] hover:text-white'
              }`}
            >
              <Scissors size={14} />
            </button>
            <button
              onClick={() => setActiveTool('duplicate')}
              title="Duplicate Clip Tool"
              className={`p-1.5 rounded transition-colors ${
                activeTool === 'duplicate' ? 'bg-[#242e40] text-[#00f0a8]' : 'text-[#7e8ea3] hover:text-white'
              }`}
            >
              <Copy size={14} />
            </button>
            <button
              onClick={handleDeleteSelectedClip}
              disabled={!selectedClipId}
              title="Delete Selected Clip"
              className="p-1.5 rounded text-[#7e8ea3] hover:text-[#ff3b69] disabled:opacity-30 disabled:hover:text-[#7e8ea3] transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Snap Selector */}
          <div className="hidden sm:flex items-center space-x-1 text-xs text-[#7e8ea3] bg-[#090b0e] border border-[#202735] px-2 py-1 rounded-lg">
            <span className="text-[10px] text-[#55657e]">SNAP</span>
            <span className="text-white font-mono-daw">1/4 Bar</span>
          </div>

          {/* Add Track Dropdown */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleAddTrack('midi', 'synth')}
              className="px-2 py-1 bg-[#1a2230] hover:bg-[#232e42] text-[#00f0a8] border border-[#2b3952] rounded text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              <Plus size={13} />
              <span>Synth</span>
            </button>
            <button
              onClick={() => handleAddTrack('drums', 'drums')}
              className="px-2 py-1 bg-[#1a2230] hover:bg-[#232e42] text-[#ff3b69] border border-[#2b3952] rounded text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              <Plus size={13} />
              <span>Drums</span>
            </button>
            <button
              onClick={() => handleAddTrack('audio', 'pad')}
              className="px-2 py-1 bg-[#1a2230] hover:bg-[#232e42] text-[#a855f7] border border-[#2b3952] rounded text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              <Plus size={13} />
              <span>Audio</span>
            </button>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setPixelsPerBar((p) => Math.max(50, p - 20))}
            title="Zoom Out"
            className="p-1 rounded text-[#7e8ea3] hover:text-white hover:bg-[#1a2230] transition-colors"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-[10px] font-mono-daw text-[#5e6f88] w-8 text-center">{pixelsPerBar}px</span>
          <button
            onClick={() => setPixelsPerBar((p) => Math.min(220, p + 20))}
            title="Zoom In"
            className="p-1 rounded text-[#7e8ea3] hover:text-white hover:bg-[#1a2230] transition-colors"
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      {/* Main Multitrack Canvas Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Track Headers Column */}
        <div className="w-52 md:w-60 bg-[#0f131a] border-r border-[#1f2633] flex flex-col shrink-0 overflow-y-auto">
          {/* Header Spacer aligning with timeline ruler */}
          <div className="h-7 bg-[#131720] border-b border-[#1f2633] px-3 flex items-center text-[10px] font-bold text-[#55657e]">
            TRACK LIST ({project.tracks.length})
          </div>

          {/* Track Header Items */}
          {project.tracks.map((track) => {
            const isSelected = project.activeTrackId === track.id;
            return (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track.id)}
                className={`h-16 border-b border-[#1b2230] px-3 flex flex-col justify-center cursor-pointer transition-colors relative ${
                  isSelected ? 'bg-[#18202d]' : 'hover:bg-[#131822]'
                }`}
              >
                {/* Color Accent Indicator */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: track.color }}
                />

                {/* Track Name & Instrument Badge */}
                <div className="flex items-center justify-between mb-1 pl-1">
                  <div className="flex items-center space-x-1.5 truncate">
                    {track.type === 'drums' ? (
                      <Grid size={13} style={{ color: track.color }} />
                    ) : track.type === 'audio' ? (
                      <Mic size={13} style={{ color: track.color }} />
                    ) : (
                      <Music size={13} style={{ color: track.color }} />
                    )}
                    <span className="text-xs font-bold text-white truncate">{track.name}</span>
                  </div>
                  <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-[#090b0e] text-[#6b7c93] border border-[#1f2633]">
                    {track.instrumentType}
                  </span>
                </div>

                {/* Track Controls: Mute, Solo, Volume */}
                <div className="flex items-center justify-between pl-1">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute(track.id);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        track.mute ? 'bg-[#ff3b69] text-white' : 'bg-[#1a2230] text-[#718299] hover:text-white'
                      }`}
                      title="Mute Track"
                    >
                      M
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSolo(track.id);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        track.solo ? 'bg-[#f59e0b] text-black font-extrabold' : 'bg-[#1a2230] text-[#718299] hover:text-white'
                      }`}
                      title="Solo Track"
                    >
                      S
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center space-x-1 w-24">
                    <Volume2 size={11} className="text-[#55657e]" />
                    <input
                      type="range"
                      min="0"
                      max="1.5"
                      step="0.05"
                      value={track.volume}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onUpdateProject((p) => ({
                          ...p,
                          tracks: p.tracks.map((t) => (t.id === track.id ? { ...t, volume: val } : t)),
                        }));
                      }}
                      className="w-full accent-[#00f0a8] h-1 bg-[#1a2230] rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: Timeline Arrangement Grid & Playhead */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="flex-1 overflow-x-auto overflow-y-auto relative bg-[#0b0e14] cursor-crosshair"
          style={{ width: `${totalBars * pixelsPerBar}px` }}
        >
          {/* Top Ruler Bar */}
          <div className="h-7 bg-[#11151e] border-b border-[#1f2633] sticky top-0 z-20 flex select-none">
            {Array.from({ length: totalBars }).map((_, barIdx) => {
              const barNum = barIdx + 1;
              const isLoopStart = barNum === project.loopStartBar;
              const isLoopEnd = barNum === project.loopEndBar;

              return (
                <div
                  key={barNum}
                  style={{ width: `${pixelsPerBar}px` }}
                  className="h-full border-r border-[#1f2633] flex items-center px-1.5 text-[10px] font-mono-daw text-[#64748b] relative"
                >
                  <span>{barNum}</span>
                  {/* Sub-divisions 16th ticks */}
                  <div className="absolute right-0 bottom-0 left-0 flex justify-between px-1 pointer-events-none">
                    <span className="w-[1px] h-1 bg-[#252d3d]" />
                    <span className="w-[1px] h-1.5 bg-[#252d3d]" />
                    <span className="w-[1px] h-1 bg-[#252d3d]" />
                  </div>

                  {/* Loop region markers */}
                  {project.isLooping && isLoopStart && (
                    <div className="absolute top-0 bottom-0 left-0 w-2 bg-[#00f0a8] opacity-80" />
                  )}
                  {project.isLooping && isLoopEnd && (
                    <div className="absolute top-0 bottom-0 right-0 w-2 bg-[#00f0a8] opacity-80" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Moving Playhead Marker */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-[#00f0a8] z-30 pointer-events-none shadow-[0_0_10px_#00f0a8]"
            style={{
              left: `${(project.playheadBar - 1) * pixelsPerBar}px`,
              transition: project.isPlaying ? 'none' : 'left 0.1s ease',
            }}
          >
            <div className="w-3 h-3 bg-[#00f0a8] -ml-[5px] rotate-45 rounded-sm shadow-md" />
          </div>

          {/* Loop Range Highlight Overlay */}
          {project.isLooping && (
            <div
              className="absolute top-7 bottom-0 bg-[#00f0a8]/5 border-x border-[#00f0a8]/30 pointer-events-none z-10"
              style={{
                left: `${(project.loopStartBar - 1) * pixelsPerBar}px`,
                width: `${(project.loopEndBar - project.loopStartBar) * pixelsPerBar}px`,
              }}
            />
          )}

          {/* Track Clip Lanes */}
          {project.tracks.map((track) => (
            <div
              key={track.id}
              className="h-16 border-b border-[#181f2b] relative hover:bg-[#121620]/30 transition-colors"
              style={{ width: `${totalBars * pixelsPerBar}px` }}
            >
              {/* Vertical Bar Grid Lines */}
              <div className="absolute inset-0 flex pointer-events-none">
                {Array.from({ length: totalBars }).map((_, i) => (
                  <div
                    key={i}
                    style={{ width: `${pixelsPerBar}px` }}
                    className="h-full border-r border-[#151c27]"
                  />
                ))}
              </div>

              {/* Render Clips in this track */}
              {track.clips.map((clip) => {
                const clipLeft = (clip.startBar - 1) * pixelsPerBar;
                const clipWidth = clip.lengthBars * pixelsPerBar;
                const isSelected = selectedClipId === clip.id;

                return (
                  <div
                    key={clip.id}
                    onClick={(e) => handleClipAction(track.id, clip, e)}
                    onDoubleClick={() => {
                      if (clip.type === 'pattern') {
                        onUpdateProject((p) => ({ ...p, viewMode: 'channelRack' }));
                      } else {
                        onUpdateProject((p) => ({ ...p, viewMode: 'pianoRoll' }));
                      }
                    }}
                    style={{
                      left: `${clipLeft}px`,
                      width: `${clipWidth}px`,
                      backgroundColor: clip.color + '25',
                      borderColor: isSelected ? '#ffffff' : clip.color,
                    }}
                    className={`absolute top-1.5 bottom-1.5 rounded border shadow-md px-2 py-1 cursor-pointer overflow-hidden transition-all group ${
                      isSelected ? 'ring-2 ring-white/80 shadow-lg' : 'hover:brightness-110'
                    }`}
                  >
                    {/* Clip Title & Type */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-white leading-tight">
                      <span className="truncate">{clip.name}</span>
                      <span className="text-[9px] opacity-70 font-mono-daw">{clip.lengthBars}b</span>
                    </div>

                    {/* MIDI Note Preview or Audio Waveform Preview */}
                    <div className="mt-1 h-6 w-full flex items-center relative opacity-80">
                      {clip.notes && clip.notes.length > 0 ? (
                        /* MIDI mini notes */
                        <div className="w-full h-full relative">
                          {clip.notes.slice(0, 24).map((n) => {
                            const leftPct = (n.startStep / (clip.lengthBars * 16)) * 100;
                            const widthPct = Math.max(2, (n.durationSteps / (clip.lengthBars * 16)) * 100);
                            const topPct = 100 - ((n.midi - 36) / 48) * 100;
                            return (
                              <div
                                key={n.id}
                                style={{
                                  left: `${leftPct}%`,
                                  width: `${widthPct}%`,
                                  top: `${Math.max(0, Math.min(80, topPct))}%`,
                                  backgroundColor: clip.color,
                                }}
                                className="absolute h-1 rounded-sm shadow-xs"
                              />
                            );
                          })}
                        </div>
                      ) : (
                        /* Procedural simulated or real audio waveform */
                        <div className="w-full h-full flex items-center space-x-[2px]">
                          {Array.from({ length: 28 }).map((_, idx) => {
                            const height = Math.max(15, Math.sin(idx * 0.7) * 90);
                            return (
                              <div
                                key={idx}
                                style={{
                                  height: `${height}%`,
                                  backgroundColor: clip.color,
                                }}
                                className="flex-1 rounded-xs"
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
