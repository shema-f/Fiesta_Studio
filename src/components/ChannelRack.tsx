/**
 * FIesta Studio - Fruity Loops Style Channel Rack & Step Sequencer
 * Faithful reproduction of the classic FL Studio Channel Rack:
 * - 4-beat alternating silver-gray & burgundy-red 3D beveled step buttons
 * - Left-click drag-to-paint and right-click drag-to-erase
 * - Real-time running neon playhead sweep
 * - Mini rotary PAN and VOL knobs with detents and tooltips
 * - Channel name beveled buttons with green LED activity strips and audition
 * - Mixer track number routing LCD box
 * - Swing control knob/slider
 * - "+" Button to open Free Splice Sound Hub & African Plugins & Lizard Lounge
 * - Direct drag & drop audio file loading onto any channel
 * - Multiple FL Studio themes (Classic 11/12, Modern Dark 21/24, Fruit Punch, Kigali Gold, Cyber Neon)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Plus,
  Palette,
  Upload,
  MoreVertical,
  Trash2,
  Copy,
  FolderOpen,
} from 'lucide-react';
import { DrumChannel, ProjectState } from '../engine/projectStore';
import { audioEngine } from '../audio/audioEngine';
import { FruityKnob } from './FruityKnob';
import { FruitySamplePluginHub } from './FruitySamplePluginHub';
import { THEMES, ThemeColors } from '../theme/themeConfig';
import { DawTheme } from '../types/daw';

interface ChannelRackProps {
  project: ProjectState;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
  currentTheme?: DawTheme;
  onSelectTheme?: (theme: DawTheme) => void;
  onOpenPianoRollForChannel?: (channel: DrumChannel) => void;
}

export const ChannelRack: React.FC<ChannelRackProps> = ({
  project,
  onUpdateProject,
  currentTheme = 'fl-classic',
  onSelectTheme,
  onOpenPianoRollForChannel,
}) => {
  const [stepCount, setStepCount] = useState<16 | 32 | 48 | 64>(16);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'drums' | 'african' | 'plugins'>('all');
  const [isSampleHubOpen, setIsSampleHubOpen] = useState(false);
  const [targetChannelForHub, setTargetChannelForHub] = useState<string | null>(null);
  const [contextMenuChannelId, setContextMenuChannelId] = useState<string | null>(null);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  // Mouse painting state for FL Studio click-and-drag step sequencer
  const isPaintingRef = useRef<boolean>(false);
  const paintModeRef = useRef<'set' | 'clear'>('set');

  const theme: ThemeColors = THEMES[currentTheme] || THEMES['fl-classic'];

  // Audition sound
  const handleAudition = (channel: DrumChannel) => {
    audioEngine.triggerDrum(
      channel.type,
      (channel.volume ?? 1.0) * 0.95,
      undefined,
      'bus_drums',
      channel.pitch,
      channel.audioBuffer,
      channel.pan ?? 0
    );
  };

  // Mouse drag step toggling (like Fruity Loops!)
  const handleStepMouseDown = (channelId: string, stepIdx: number, e: React.MouseEvent) => {
    e.preventDefault();
    isPaintingRef.current = true;

    // Right click or already active step -> Erase mode
    const channel = project.drumChannels.find((c) => c.id === channelId);
    if (!channel) return;

    const isRightClick = e.button === 2;
    const currentActive = channel.steps[stepIdx];

    if (isRightClick || currentActive) {
      paintModeRef.current = 'clear';
      setStepValue(channelId, stepIdx, false);
    } else {
      paintModeRef.current = 'set';
      setStepValue(channelId, stepIdx, true);
      // Audition on activating
      audioEngine.triggerDrum(
        channel.type,
        (channel.velocities[stepIdx] || 0.9) * (channel.volume ?? 1.0),
        undefined,
        'bus_drums',
        channel.pitch,
        channel.audioBuffer,
        channel.pan ?? 0
      );
    }
  };

  const handleStepMouseEnter = (channelId: string, stepIdx: number) => {
    if (!isPaintingRef.current) return;
    const shouldActivate = paintModeRef.current === 'set';
    setStepValue(channelId, stepIdx, shouldActivate);
    if (shouldActivate) {
      const channel = project.drumChannels.find((c) => c.id === channelId);
      if (channel) {
        audioEngine.triggerDrum(
          channel.type,
          (channel.velocities[stepIdx] || 0.9) * (channel.volume ?? 1.0),
          undefined,
          'bus_drums',
          channel.pitch,
          channel.audioBuffer,
          channel.pan ?? 0
        );
      }
    }
  };

  const setStepValue = (channelId: string, stepIdx: number, val: boolean) => {
    onUpdateProject((p) => ({
      ...p,
      drumChannels: p.drumChannels.map((c) => {
        if (c.id !== channelId) return c;
        const newSteps = [...c.steps];
        newSteps[stepIdx] = val;
        return { ...c, steps: newSteps };
      }),
    }));
  };

  // Terminate painting on window mouseup
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isPaintingRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Mute / Solo
  const toggleMute = (channelId: string) => {
    onUpdateProject((p) => ({
      ...p,
      drumChannels: p.drumChannels.map((c) => (c.id === channelId ? { ...c, mute: !c.mute } : c)),
    }));
  };

  const toggleSolo = (channelId: string) => {
    onUpdateProject((p) => {
      const isCurrentlySoloed = p.drumChannels.find((c) => c.id === channelId)?.solo;
      return {
        ...p,
        drumChannels: p.drumChannels.map((c) =>
          c.id === channelId
            ? { ...c, solo: !isCurrentlySoloed, mute: false }
            : { ...c, solo: false }
        ),
      };
    });
  };

  // Knob adjustments
  const handleVolumeChange = (channelId: string, vol: number) => {
    onUpdateProject((p) => ({
      ...p,
      drumChannels: p.drumChannels.map((c) => (c.id === channelId ? { ...c, volume: vol } : c)),
    }));
  };

  const handlePanChange = (channelId: string, panVal: number) => {
    onUpdateProject((p) => ({
      ...p,
      drumChannels: p.drumChannels.map((c) => (c.id === channelId ? { ...c, pan: panVal } : c)),
    }));
  };

  // Mixer track assignment
  const handleMixerTrackChange = (channelId: string, delta: number) => {
    onUpdateProject((p) => ({
      ...p,
      drumChannels: p.drumChannels.map((c) => {
        if (c.id !== channelId) return c;
        const cur = c.mixerTrack ?? 1;
        const next = Math.max(1, Math.min(16, cur + delta));
        return { ...c, mixerTrack: next };
      }),
    }));
  };

  // Drag and drop sample files onto channel button
  const handleDropSample = async (channelId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioEngine.decodeAudioData(arrayBuffer);
      const name = file.name.replace(/\.[^/.]+$/, '');

      onUpdateProject((p) => ({
        ...p,
        drumChannels: p.drumChannels.map((c) =>
          c.id === channelId
            ? { ...c, name, type: 'custom', audioBuffer: buffer }
            : c
        ),
      }));
    } catch (err: any) {
      alert(`Could not load audio sample: ${err.message}`);
    }
  };

  // Quick Genre Patterns
  const loadGenrePattern = (genre: 'amapiano' | 'afrobeats' | 'trap') => {
    onUpdateProject((p) => {
      let updated = [...p.drumChannels];
      if (genre === 'amapiano') {
        updated = updated.map((c) => {
          if (c.type === 'kick') return { ...c, steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false] };
          if (c.type.includes('logdrum')) return { ...c, steps: [true, false, true, false, false, true, false, true, false, true, true, false, false, true, false, false] };
          if (c.type.includes('shaker') || c.type.includes('hat')) return { ...c, steps: Array(16).fill(true) };
          if (c.type === 'rim' || c.type === 'clap') return { ...c, steps: [false, false, true, false, false, false, false, true, false, false, true, false, false, false, true, false] };
          return c;
        });
        return { ...p, bpm: 113, drumChannels: updated };
      } else if (genre === 'afrobeats') {
        updated = updated.map((c) => {
          if (c.type === 'kick') return { ...c, steps: [true, false, false, true, false, false, true, false, false, false, true, false, false, true, false, false] };
          if (c.type === 'clap' || c.type === 'snare') return { ...c, steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false] };
          if (c.type.includes('shaker')) return { ...c, steps: Array(16).fill(true) };
          return c;
        });
        return { ...p, bpm: 106, drumChannels: updated };
      } else if (genre === 'trap') {
        updated = updated.map((c) => {
          if (c.type === 'kick') return { ...c, steps: [true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false] };
          if (c.type === 'snare' || c.type === 'clap') return { ...c, steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false] };
          if (c.type.includes('hat')) return { ...c, steps: Array(16).fill(true) };
          return c;
        });
        return { ...p, bpm: 140, drumChannels: updated };
      }
      return p;
    });
  };

  // Add a new channel from Hub
  const handleAddNewChannel = (newChan: DrumChannel) => {
    onUpdateProject((p) => ({
      ...p,
      drumChannels: [...p.drumChannels, newChan],
    }));
  };

  // Replace active channel sample from Hub
  const handleReplaceChannel = (channelId: string, name: string, type: string, buffer?: AudioBuffer) => {
    onUpdateProject((p) => ({
      ...p,
      drumChannels: p.drumChannels.map((c) =>
        c.id === channelId
          ? { ...c, name, type, audioBuffer: buffer || c.audioBuffer }
          : c
      ),
    }));
  };

  // Clone Channel
  const handleCloneChannel = (channel: DrumChannel) => {
    const clone: DrumChannel = {
      ...channel,
      id: `chan_${Date.now()}`,
      name: `${channel.name} #2`,
      steps: [...channel.steps],
      velocities: [...channel.velocities],
    };
    onUpdateProject((p) => ({
      ...p,
      drumChannels: [...p.drumChannels, clone],
    }));
    setContextMenuChannelId(null);
  };

  // Delete Channel
  const handleDeleteChannel = (channelId: string) => {
    onUpdateProject((p) => ({
      ...p,
      drumChannels: p.drumChannels.filter((c) => c.id !== channelId),
    }));
    setContextMenuChannelId(null);
  };

  // Clear all steps
  const handleClearAll = () => {
    onUpdateProject((p) => ({
      ...p,
      drumChannels: p.drumChannels.map((c) => ({
        ...c,
        steps: Array(stepCount).fill(false),
      })),
    }));
  };

  // Filter channels
  const displayedChannels = project.drumChannels.filter((c) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'drums') return ['kick', 'snare', 'clap', 'hihat_closed', 'hihat_open', 'rim'].includes(c.type);
    if (selectedFilter === 'african') return c.type.includes('logdrum') || c.type.includes('inanga') || c.type.includes('djembe') || c.type.includes('amayugi') || c.type.includes('african');
    if (selectedFilter === 'plugins') return c.type.includes('lizard') || c.type.includes('piano') || c.type.includes('keys') || c.type.includes('synth') || c.type.includes('kalimba');
    return true;
  });

  const currentPlayStep = project.current16thStep % stepCount;

  return (
    <div
      className={`flex-1 flex flex-col ${theme.windowBg} overflow-hidden select-none relative`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 1. TOP WINDOW HEADER (Fruity Loops Style Title Bar) */}
      <div
        className={`h-9 ${theme.headerBg} border-b ${theme.borderColor} px-3 flex items-center justify-between shrink-0 shadow-sm`}
      >
        {/* Left: Window menu dropdown arrow, filter selector, rack title */}
        <div className="flex items-center space-x-2.5">
          {/* Menu dropdown arrow */}
          <button
            onClick={() => setThemePickerOpen(!themePickerOpen)}
            title="Channel Rack Menu & Themes"
            className="w-5 h-5 rounded bg-[#1c222c] hover:bg-[#2c3646] text-[#8e9eb5] hover:text-white flex items-center justify-center text-[10px] font-bold border border-[#323d4f] shadow-xs cursor-pointer"
          >
            ▼
          </button>

          {/* Filter Dropdown */}
          <div className="flex items-center bg-[#131720] border border-[#273244] rounded px-2 py-0.5 text-xs font-mono-daw">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="bg-transparent text-[#9bb0cf] font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#141822] text-white">All</option>
              <option value="drums" className="bg-[#141822] text-white">Drums</option>
              <option value="african" className="bg-[#141822] text-white">🍎 African & Rwandan</option>
              <option value="plugins" className="bg-[#141822] text-white">🎹 Plugins & Keys</option>
            </select>
          </div>

          {/* Channel rack icon & title */}
          <div className="flex items-center space-x-1.5 pl-1">
            <Sliders size={13} className="text-[#00f0a8]" />
            <span className="text-xs font-extrabold text-white tracking-wide">
              Channel rack
            </span>
          </div>

          {/* Quick Genre Groove Buttons */}
          <div className="hidden lg:flex items-center space-x-1 pl-3 border-l border-[#2e3748]">
            <span className="text-[10px] text-[#6b7d96] font-mono-daw">GROOVE:</span>
            <button
              onClick={() => loadGenrePattern('amapiano')}
              className="px-2 py-0.5 bg-[#1a2333] hover:bg-[#253249] text-[11px] font-bold text-[#00f0a8] rounded border border-[#2c3d59] transition-all cursor-pointer"
            >
              Amapiano
            </button>
            <button
              onClick={() => loadGenrePattern('afrobeats')}
              className="px-2 py-0.5 bg-[#1a2333] hover:bg-[#253249] text-[11px] font-bold text-[#ff6b4a] rounded border border-[#482d28] transition-all cursor-pointer"
            >
              Afrobeats
            </button>
            <button
              onClick={() => loadGenrePattern('trap')}
              className="px-2 py-0.5 bg-[#1a2333] hover:bg-[#253249] text-[11px] font-bold text-[#f59e0b] rounded border border-[#483a21] transition-all cursor-pointer"
            >
              Trap 808
            </button>
          </div>
        </div>

        {/* Right: Swing control, Step Length selector, Theme button */}
        <div className="flex items-center space-x-3">
          {/* Swing Slider */}
          <div className="flex items-center space-x-1.5 bg-[#131720] border border-[#273244] px-2 py-0.5 rounded">
            <span className="text-[10px] font-bold text-[#71829d] font-mono-daw">
              Swing
            </span>
            <input
              type="range"
              min="0"
              max="70"
              value={Math.round(project.swing * 100)}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) / 100;
                onUpdateProject((p) => ({ ...p, swing: val }));
                audioEngine.setSwing(val);
              }}
              title={`Swing: ${Math.round(project.swing * 100)}%`}
              className="w-14 accent-[#00f0a8] h-1.5 bg-[#252f40] rounded cursor-pointer"
            />
            <span className="text-[10px] font-mono-daw text-[#00f0a8] w-6 text-right">
              {Math.round(project.swing * 100)}%
            </span>
          </div>

          {/* Step Length Mode */}
          <div className="flex items-center bg-[#131720] border border-[#273244] rounded p-0.5 text-[11px] font-mono-daw">
            {[16, 32, 48, 64].map((cnt) => (
              <button
                key={cnt}
                onClick={() => setStepCount(cnt as any)}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  stepCount === cnt
                    ? 'bg-[#29364b] text-[#00f0a8] font-black shadow-xs'
                    : 'text-[#6e8099] hover:text-white'
                }`}
              >
                {cnt}
              </button>
            ))}
          </div>

          {/* Theme Picker Trigger */}
          <button
            onClick={() => setThemePickerOpen(!themePickerOpen)}
            title="Change Fruity Loops Theme"
            className="p-1 rounded bg-[#1c2330] hover:bg-[#283244] text-[#8e9eb5] hover:text-white border border-[#2e3a4e] cursor-pointer"
          >
            <Palette size={13} />
          </button>

          {/* Clear Steps */}
          <button
            onClick={handleClearAll}
            title="Clear all steps"
            className="p-1 rounded bg-[#1c2330] hover:bg-[#382329] text-[#8e9eb5] hover:text-[#ff3b69] border border-[#2e3a4e] cursor-pointer"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Theme Picker Dropdown Popover */}
      {themePickerOpen && (
        <div className="absolute top-10 left-3 z-50 w-72 bg-[#141824] border border-[#344158] rounded-xl shadow-2xl p-3 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#242f44]">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Palette size={14} className="text-[#00f0a8]" />
              Fruity Loops Themes
            </span>
            <button
              onClick={() => setThemePickerOpen(false)}
              className="text-xs text-[#6e8099] hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5">
            {Object.values(THEMES).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  if (onSelectTheme) onSelectTheme(t.id);
                  setThemePickerOpen(false);
                }}
                className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                  currentTheme === t.id
                    ? 'bg-[#253248] text-white border border-[#00f0a8]/40'
                    : 'bg-[#181d2c] hover:bg-[#20273a] text-[#8fa1b8]'
                }`}
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{t.name}</span>
                    {currentTheme === t.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00f0a8]" />
                    )}
                  </div>
                  <div className="text-[10px] text-[#697c96] line-clamp-1">{t.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. SEQUENCER WORKSPACE (Channel strips + Step grid) */}
      <div className="flex-1 overflow-y-auto overflow-x-auto p-2.5">
        <div className="min-w-[820px] flex flex-col space-y-1">
          {/* Step Beat Ruler */}
          <div className="flex items-center pl-[280px] pr-2 pb-1 text-center font-mono-daw text-[10px] text-[#5b6e8a]">
            <div
              className="flex-1 grid gap-1"
              style={{ gridTemplateColumns: `repeat(${stepCount}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: stepCount }).map((_, i) => {
                const beatIdx = Math.floor(i / 4) + 1;
                const isBeatStart = i % 4 === 0;
                const isCurrent = project.isPlaying && currentPlayStep === i;
                return (
                  <div
                    key={i}
                    className={`py-0.5 rounded transition-colors ${
                      isCurrent
                        ? 'text-[#00f0a8] font-black bg-[#00f0a8]/20 ring-1 ring-[#00f0a8]'
                        : isBeatStart
                        ? 'text-[#9fb2cd] font-bold'
                        : ''
                    }`}
                  >
                    {isBeatStart ? beatIdx : i + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Channel Strips */}
          {displayedChannels.map((channel) => (
            <div
              key={channel.id}
              className="flex items-center h-8 group hover:brightness-110 transition-all"
            >
              {/* Channel Controls (LED, PAN, VOL, Channel Name Button, Mixer Track) */}
              <div className="w-[280px] flex items-center justify-between pr-2 shrink-0">
                {/* 1. Mute / Activity Green LED Dot */}
                <button
                  onClick={() => toggleMute(channel.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toggleSolo(channel.id);
                  }}
                  title="Click to Mute • Right-click to Solo"
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      channel.mute
                        ? 'bg-[#3b4352] opacity-40'
                        : channel.solo
                        ? 'bg-[#f59e0b] shadow-[0_0_6px_#f59e0b]'
                        : 'bg-[#00ff88] shadow-[0_0_6px_#00ff88]'
                    }`}
                  />
                </button>

                {/* 2. Mini Rotary Pan Knob */}
                <div className="px-1">
                  <FruityKnob
                    label="Pan"
                    value={channel.pan ?? 0}
                    min={-1}
                    max={1}
                    defaultValue={0}
                    isBipolar={true}
                    size={18}
                    accentColor={theme.accentColor}
                    onChange={(v) => handlePanChange(channel.id, v)}
                  />
                </div>

                {/* 3. Mini Rotary Volume Knob */}
                <div className="px-1">
                  <FruityKnob
                    label="Vol"
                    value={channel.volume ?? 1.0}
                    min={0}
                    max={1.25}
                    defaultValue={1.0}
                    size={18}
                    accentColor={theme.accentColor}
                    onChange={(v) => handleVolumeChange(channel.id, v)}
                  />
                </div>

                {/* 4. Channel Name Button (Authentic beveled button with vertical green LED) */}
                <div
                  className="relative flex-1 px-1.5"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropSample(channel.id, e)}
                >
                  <button
                    onClick={() => handleAudition(channel)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenuChannelId(channel.id);
                    }}
                    title="Click to audition • Right-click for options • Drag & drop sample file here"
                    className={`w-full h-7 px-2 ${theme.channelButtonBg} border ${theme.channelButtonBorder} rounded-sm shadow-md flex items-center justify-between text-left group active:translate-y-0.5 transition-all cursor-pointer`}
                  >
                    <span className="text-xs font-extrabold text-white tracking-wide truncate max-w-[110px] drop-shadow-sm">
                      {channel.name}
                    </span>

                    {/* Vertical Green / Cyan Activity LED Strip */}
                    <div
                      className={`w-1 h-4 rounded-xs transition-colors ${
                        channel.mute ? 'bg-[#3b4352]' : 'bg-[#00ff88] shadow-[0_0_4px_#00ff88]'
                      }`}
                    />
                  </button>

                  {/* Context Menu for this channel */}
                  {contextMenuChannelId === channel.id && (
                    <div className="absolute top-8 left-1 z-50 w-44 bg-[#141824] border border-[#344158] rounded-xl shadow-2xl p-1.5 text-xs animate-fadeIn">
                      <button
                        onClick={() => {
                          if (onOpenPianoRollForChannel) onOpenPianoRollForChannel(channel);
                          setContextMenuChannelId(null);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#253248] text-white font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <Music size={13} className="text-[#00f0a8]" />
                        <span>Piano Roll</span>
                      </button>
                      <button
                        onClick={() => {
                          setTargetChannelForHub(channel.id);
                          setIsSampleHubOpen(true);
                          setContextMenuChannelId(null);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#253248] text-white font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <FolderOpen size={13} className="text-[#ff6b4a]" />
                        <span>Replace Sample...</span>
                      </button>
                      <button
                        onClick={() => handleCloneChannel(channel)}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#253248] text-white font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <Copy size={13} className="text-[#38bdf8]" />
                        <span>Clone Channel</span>
                      </button>
                      <button
                        onClick={() => handleDeleteChannel(channel.id)}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#3b1d24] text-[#ff3b69] font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Delete Channel</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 5. Mixer Track Routing Box (Numeric LCD) */}
                <div className="w-9 h-6 bg-[#0c0f16] border border-[#2b3548] rounded flex items-center justify-between px-1 text-[11px] font-mono-daw text-[#00f0a8] select-none">
                  <button
                    onClick={() => handleMixerTrackChange(channel.id, -1)}
                    className="text-[#566885] hover:text-white text-[9px]"
                  >
                    ▼
                  </button>
                  <span className="font-bold">{channel.mixerTrack ?? 1}</span>
                  <button
                    onClick={() => handleMixerTrackChange(channel.id, 1)}
                    className="text-[#566885] hover:text-white text-[9px]"
                  >
                    ▲
                  </button>
                </div>
              </div>

              {/* Step Sequencer Buttons Grid */}
              <div
                className="flex-1 grid gap-1 h-7"
                style={{ gridTemplateColumns: `repeat(${stepCount}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: stepCount }).map((_, stepIdx) => {
                  const isActive = channel.steps[stepIdx] ?? false;
                  const isCurrent = project.isPlaying && currentPlayStep === stepIdx;

                  // 4-beat block alternation (FL Studio signature):
                  // Beat 1 (0..3): Light Gray/Silver
                  // Beat 2 (4..7): Dark Reddish-Brown / Burgundy
                  // Beat 3 (8..11): Light Gray/Silver
                  // Beat 4 (12..15): Dark Reddish-Brown / Burgundy
                  const beatBlock = Math.floor(stepIdx / 4) % 2;
                  const buttonStyle = beatBlock === 0 ? theme.beat1Button : theme.beat2Button;

                  return (
                    <button
                      key={stepIdx}
                      onMouseDown={(e) => handleStepMouseDown(channel.id, stepIdx, e)}
                      onMouseEnter={() => handleStepMouseEnter(channel.id, stepIdx)}
                      className={`h-full rounded-xs border transition-all relative flex flex-col justify-end p-0.5 shadow-sm select-none cursor-pointer ${
                        isActive
                          ? `${theme.activeStep.gradient} ${theme.activeStep.glow} ${theme.activeStep.border}`
                          : `${buttonStyle.bg} ${buttonStyle.topHighlight} ${buttonStyle.bottomShadow}`
                      } ${
                        isCurrent ? 'ring-2 ring-[#00f0a8] brightness-125 z-10' : ''
                      }`}
                    >
                      {/* Step Center Inset Groove / Velocity Bar */}
                      {isActive ? (
                        <div
                          className="w-full bg-white/50 rounded-xs transition-all pointer-events-none"
                          style={{
                            height: `${(channel.velocities[stepIdx] || 0.9) * 100}%`,
                          }}
                        />
                      ) : (
                        <div className="w-full h-1 bg-black/15 rounded-xs pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. BOTTOM CHANNEL RACK DOCK: "+" Button, Step Count Extender & Sound Library */}
      <div
        className={`h-11 ${theme.headerBg} border-t ${theme.borderColor} px-4 flex items-center justify-between shrink-0 select-none`}
      >
        {/* Left: Big FL Studio "+" Button to add plugins/samples */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setTargetChannelForHub(null);
              setIsSampleHubOpen(true);
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-[#ff3b69] to-[#ff6b4a] hover:from-[#ff4d79] hover:to-[#ff7b5a] text-white font-black text-xs rounded-lg shadow-md shadow-[#ff3b69]/30 flex items-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Sound / Plugin</span>
          </button>

          <span className="text-xs text-[#6e8099] font-mono-daw">
            {project.drumChannels.length} Channels Loaded
          </span>
        </div>

        {/* Right: Step length buttons & Quick presets */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setTargetChannelForHub(null);
              setIsSampleHubOpen(true);
            }}
            className="px-2.5 py-1 bg-[#1a2230] hover:bg-[#253046] text-[#00f0a8] hover:text-white text-xs font-semibold rounded border border-[#2b3952] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FolderOpen size={13} />
            <span>Splice & African Hub</span>
          </button>
        </div>
      </div>

      {/* Splice Sound & African Plugin Hub Modal */}
      <FruitySamplePluginHub
        isOpen={isSampleHubOpen}
        onClose={() => {
          setIsSampleHubOpen(false);
          setTargetChannelForHub(null);
        }}
        onAddChannel={handleAddNewChannel}
        onReplaceChannelSample={handleReplaceChannel}
        targetChannelId={targetChannelForHub}
      />
    </div>
  );
};
