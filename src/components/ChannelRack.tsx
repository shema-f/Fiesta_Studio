/**
 * FIesta Studio - Fruity Loops Style Channel Rack & Step Sequencer
 * Faithful reproduction of the classic FL Studio Channel Rack:
 * - Storing Instruments and Samples: Holds instruments, VST/AU plugins, sound samples (kicks, snares, hats, 808s)
 * - Step Sequencer: Supports up to 512 steps per pattern with 4-beat alternating beveled buttons
 * - Piano Roll: Each channel is linked to Piano Roll via dedicated icon and context menu
 * - Sound Controls: Mini rotary PAN and VOL knobs with detents and tooltips
 * - Mute/Solo Indicator (LED): Authentic green light LED button (click to mute, right-click to solo)
 * - Mixer Routing: Numeric LCD box with up/down arrows and Ctrl+L shortcut
 * - Graph Editor: Step parameter editor for Velocity, Pitch, Pan, and Filter Cutoff
 * - Organizing and Painting: Channel groups, color palette customization, renaming, cloning, and deletion
 * - Themes: FL Studio themes (Classic 11/12, Modern Dark 21/24, Fruit Punch, Kigali Gold, Cyber Neon, Vaporwave, Synthwave, Arctic, Toxic)
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
  BarChart2,
  Edit2,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  SlidersHorizontal,
  X,
  Wand2,
} from 'lucide-react';
import { DrumChannel, ProjectState } from '../engine/projectStore';
import { audioEngine } from '../audio/audioEngine';
import { FruityKnob } from './FruityKnob';
import { FruitySamplePluginHub } from './FruitySamplePluginHub';
import { THEMES, ThemeColors } from '../theme/themeConfig';
import { DawTheme } from '../types/daw';

const FL_COLORS = [
  '#00ff88',
  '#00f0a8',
  '#38bdf8',
  '#818cf8',
  '#c084fc',
  '#ff3b69',
  '#ff6200',
  '#f59e0b',
  '#f43f5e',
  '#64748b',
];

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
  // Step Count: Supports up to 512 steps!
  const [stepCount, setStepCount] = useState<number>(() => {
    return project.activePatternStepCount || 16;
  });
  const [selectedGroup, setSelectedGroup] = useState<'all' | 'drums' | 'synths' | 'african' | 'audio'>('all');
  const [isSampleHubOpen, setIsSampleHubOpen] = useState(false);
  const [targetChannelForHub, setTargetChannelForHub] = useState<string | null>(null);
  const [contextMenuChannelId, setContextMenuChannelId] = useState<string | null>(null);
  const [colorPickerChannelId, setColorPickerChannelId] = useState<string | null>(null);
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);
  const [editingChannelName, setEditingChannelName] = useState('');
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(project.drumChannels[0]?.id || null);

  // Graph Editor State
  const [isGraphEditorOpen, setIsGraphEditorOpen] = useState(false);
  const [graphParam, setGraphParam] = useState<'velocity' | 'pitch' | 'pan' | 'cutoff'>('velocity');

  // Mouse painting state for FL Studio click-and-drag step sequencer
  const isPaintingRef = useRef<boolean>(false);
  const paintModeRef = useRef<'set' | 'clear'>('set');

  // Graph editor dragging state
  const isDraggingGraphRef = useRef<boolean>(false);

  const theme: ThemeColors = THEMES[currentTheme] || THEMES['fl-classic'];

  // Keep project.activePatternStepCount synced with local stepCount
  const handleSetStepCount = (newCount: number) => {
    const clamped = Math.max(4, Math.min(512, newCount));
    setStepCount(clamped);
    onUpdateProject((p) => ({
      ...p,
      activePatternStepCount: clamped,
      drumChannels: p.drumChannels.map((c) => {
        // Pad steps array if shorter
        if (c.steps.length < clamped) {
          const paddedSteps = [...c.steps];
          const paddedVelocities = [...c.velocities];
          while (paddedSteps.length < clamped) {
            paddedSteps.push(false);
            paddedVelocities.push(0.85);
          }
          return { ...c, steps: paddedSteps, velocities: paddedVelocities };
        }
        return c;
      }),
    }));
  };

  // Audition sound
  const handleAudition = (channel: DrumChannel) => {
    setSelectedChannelId(channel.id);
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
    setSelectedChannelId(channelId);

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
        (channel.velocities[stepIdx] || 0.85) * (channel.volume ?? 1.0),
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
          (channel.velocities[stepIdx] || 0.85) * (channel.volume ?? 1.0),
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
      isDraggingGraphRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Mute / Solo (LED Indicator)
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
        const next = Math.max(1, Math.min(64, cur + delta));
        return { ...c, mixerTrack: next };
      }),
    }));
  };

  // Route to free mixer track (Ctrl+L)
  const handleRouteToFreeMixer = (channelId: string) => {
    onUpdateProject((p) => {
      const maxMixerTrack = Math.max(0, ...p.drumChannels.map((c) => c.mixerTrack ?? 1));
      const nextFree = Math.min(64, maxMixerTrack + 1);
      return {
        ...p,
        drumChannels: p.drumChannels.map((c) =>
          c.id === channelId ? { ...c, mixerTrack: nextFree } : c
        ),
      };
    });
  };

  // Ctrl+L Keyboard Shortcut for selected channel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        if (selectedChannelId) {
          e.preventDefault();
          handleRouteToFreeMixer(selectedChannelId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedChannelId]);

  // Rename Channel
  const handleSaveRename = (channelId: string) => {
    if (editingChannelName.trim()) {
      onUpdateProject((p) => ({
        ...p,
        drumChannels: p.drumChannels.map((c) =>
          c.id === channelId ? { ...c, name: editingChannelName.trim() } : c
        ),
      }));
    }
    setEditingChannelId(null);
  };

  // Change Channel Color
  const handleChangeColor = (channelId: string, color: string) => {
    onUpdateProject((p) => ({
      ...p,
      drumChannels: p.drumChannels.map((c) =>
        c.id === channelId ? { ...c, color } : c
      ),
    }));
    setColorPickerChannelId(null);
    setContextMenuChannelId(null);
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
      console.error('Could not load audio sample:', err);
    }
  };

  // Direct Audio File Input for PC
  const handleDirectPcFileUpload = async (channelId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
      console.error('Error loading PC file:', err);
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
    setSelectedChannelId(newChan.id);
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
      stepPitches: channel.stepPitches ? [...channel.stepPitches] : undefined,
      stepPans: channel.stepPans ? [...channel.stepPans] : undefined,
    };
    onUpdateProject((p) => ({
      ...p,
      drumChannels: [...p.drumChannels, clone],
    }));
    setSelectedChannelId(clone.id);
    setContextMenuChannelId(null);
  };

  // Delete Channel (Supports prompt requirement: delete something from the track list / delete track)
  const handleDeleteChannel = (channelId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onUpdateProject((p) => {
      const remaining = p.drumChannels.filter((c) => c.id !== channelId);
      return {
        ...p,
        drumChannels: remaining,
      };
    });
    if (selectedChannelId === channelId) {
      setSelectedChannelId(project.drumChannels.find((c) => c.id !== channelId)?.id || null);
    }
    setContextMenuChannelId(null);
  };

  // Switch pattern: save current channels into active pattern, then switch to new pattern
  const handleSelectPattern = (newPatternId: string) => {
    onUpdateProject((p) => {
      const currentPatterns = p.patterns || [];
      // 1. Save current drumChannels into current activePattern
      const updatedPatterns = currentPatterns.map((pat) =>
        pat.id === p.activePatternId
          ? { ...pat, lengthSteps: stepCount, drumChannels: p.drumChannels }
          : pat
      );

      // 2. Find target pattern
      const target = updatedPatterns.find((pat) => pat.id === newPatternId);
      if (!target) return p;

      if (target.lengthSteps) {
        setStepCount(target.lengthSteps);
      }

      return {
        ...p,
        patterns: updatedPatterns,
        activePatternId: newPatternId,
        drumChannels: target.drumChannels || p.drumChannels,
      };
    });
  };

  // Create New Pattern (FL Studio signature feature)
  const handleCreateNewPattern = (customName?: string) => {
    onUpdateProject((p) => {
      const currentPatterns = p.patterns || [];
      const updatedPatterns = currentPatterns.map((pat) =>
        pat.id === p.activePatternId
          ? { ...pat, lengthSteps: stepCount, drumChannels: p.drumChannels }
          : pat
      );

      const nextNum = updatedPatterns.length + 1;
      const name = customName || `Pattern ${nextNum}`;
      const color = FL_COLORS[nextNum % FL_COLORS.length];

      // Clean empty steps for new pattern
      const freshChannels: DrumChannel[] = p.drumChannels.map((c) => ({
        ...c,
        steps: Array(stepCount).fill(false),
        velocities: Array(stepCount).fill(0.85),
      }));

      const newPat = {
        id: `pattern_${Date.now()}`,
        name,
        color,
        lengthSteps: stepCount,
        drumChannels: freshChannels,
      };

      return {
        ...p,
        patterns: [...updatedPatterns, newPat],
        activePatternId: newPat.id,
        drumChannels: freshChannels,
      };
    });
  };

  // Clone Pattern
  const handleClonePattern = () => {
    onUpdateProject((p) => {
      const currentPatterns = p.patterns || [];
      const curPat = currentPatterns.find((pat) => pat.id === p.activePatternId) || {
        id: p.activePatternId || 'pattern_1',
        name: 'Pattern 1',
        color: '#00f0a8',
        lengthSteps: stepCount,
        drumChannels: p.drumChannels,
      };

      const clonedPat = {
        ...curPat,
        id: `pattern_${Date.now()}`,
        name: `${curPat.name} (Clone)`,
        color: FL_COLORS[(currentPatterns.length + 1) % FL_COLORS.length],
        lengthSteps: stepCount,
        drumChannels: p.drumChannels.map((c) => ({
          ...c,
          steps: [...c.steps],
          velocities: [...c.velocities],
          stepPitches: c.stepPitches ? [...c.stepPitches] : undefined,
          stepPans: c.stepPans ? [...c.stepPans] : undefined,
        })),
      };

      return {
        ...p,
        patterns: [...currentPatterns, clonedPat],
        activePatternId: clonedPat.id,
      };
    });
  };

  // Stamp / Place Active Pattern into Timeline
  const handleStampPatternToPlaylist = () => {
    onUpdateProject((p) => {
      const currentPatterns = p.patterns || [];
      const activePat =
        currentPatterns.find((pat) => pat.id === p.activePatternId) || currentPatterns[0];
      const patName = activePat?.name || 'Pattern';
      const patColor = activePat?.color || '#ff3b69';

      const drumTrack = p.tracks.find((t) => t.type === 'drums') || p.tracks[0];
      if (!drumTrack) return p;

      const newClip = {
        id: `clip_pat_${Date.now()}`,
        trackId: drumTrack.id,
        type: 'pattern' as const,
        name: patName,
        startBar: p.playheadBar || 1,
        lengthBars: Math.max(2, Math.ceil(stepCount / 16)),
        color: patColor,
      };

      return {
        ...p,
        tracks: p.tracks.map((t) =>
          t.id === drumTrack.id ? { ...t, clips: [...t.clips, newClip] } : t
        ),
      };
    });
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

  // Graph Editor: Set Step Velocity, Pitch, or Pan
  const handleGraphBarChange = (channelId: string, stepIdx: number, clientY: number, rect: DOMRect) => {
    const normalizedY = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));

    onUpdateProject((p) => ({
      ...p,
      drumChannels: p.drumChannels.map((c) => {
        if (c.id !== channelId) return c;

        if (graphParam === 'velocity') {
          const newVels = [...(c.velocities || Array(stepCount).fill(0.85))];
          newVels[stepIdx] = Math.max(0.05, Math.min(1.0, Math.round(normalizedY * 100) / 100));
          return { ...c, velocities: newVels };
        } else if (graphParam === 'pitch') {
          // -12 to +12 semitones
          const semitones = Math.round((normalizedY - 0.5) * 24);
          const newPitches = [...(c.stepPitches || Array(stepCount).fill(0))];
          newPitches[stepIdx] = semitones;
          return { ...c, stepPitches: newPitches };
        } else if (graphParam === 'pan') {
          // -1 to +1
          const panVal = Math.round((normalizedY - 0.5) * 200) / 100;
          const newPans = [...(c.stepPans || Array(stepCount).fill(0))];
          newPans[stepIdx] = panVal;
          return { ...c, stepPans: newPans };
        }
        return c;
      }),
    }));
  };

  // Quick Graph Tools: Humanize
  const handleHumanizeVelocities = (channelId: string) => {
    onUpdateProject((p) => ({
      ...p,
      drumChannels: p.drumChannels.map((c) => {
        if (c.id !== channelId) return c;
        const newVels = (c.velocities || Array(stepCount).fill(0.85)).map((v, i) => {
          if (!c.steps[i]) return v;
          const delta = (Math.random() - 0.5) * 0.25;
          return Math.max(0.2, Math.min(1.0, Math.round((v + delta) * 100) / 100));
        });
        return { ...c, velocities: newVels };
      }),
    }));
  };

  // Quick Graph Tools: Crescendo ramp
  const handleCrescendo = (channelId: string) => {
    onUpdateProject((p) => ({
      ...p,
      drumChannels: p.drumChannels.map((c) => {
        if (c.id !== channelId) return c;
        const newVels = Array(stepCount).fill(0.85).map((_, i) => {
          return Math.round((0.3 + (i / Math.max(1, stepCount - 1)) * 0.7) * 100) / 100;
        });
        return { ...c, velocities: newVels };
      }),
    }));
  };

  // Filter channels by group
  const displayedChannels = project.drumChannels.filter((c) => {
    if (selectedGroup === 'all') return true;
    if (selectedGroup === 'drums') return ['kick', 'snare', 'clap', 'hihat_closed', 'hihat_open', 'rim'].includes(c.type);
    if (selectedGroup === 'african') return c.type.includes('logdrum') || c.type.includes('inanga') || c.type.includes('djembe') || c.type.includes('amayugi') || c.type.includes('african');
    if (selectedGroup === 'synths') return c.type.includes('lizard') || c.type.includes('piano') || c.type.includes('keys') || c.type.includes('synth') || c.type.includes('kalimba') || c.type.includes('808');
    if (selectedGroup === 'audio') return c.type === 'custom' || c.audioBuffer;
    return true;
  });

  const activeChannelForGraph = project.drumChannels.find((c) => c.id === selectedChannelId) || project.drumChannels[0];
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
        {/* Left: Window menu dropdown arrow, group filter selector, rack title */}
        <div className="flex items-center space-x-2.5">
          {/* Menu dropdown arrow (Theme Picker Trigger) */}
          <button
            onClick={() => setThemePickerOpen(!themePickerOpen)}
            title="Channel Rack Menu & Themes"
            className="w-5 h-5 rounded bg-[#1c222c] hover:bg-[#2c3646] text-[#8e9eb5] hover:text-white flex items-center justify-center text-[10px] font-bold border border-[#323d4f] shadow-xs cursor-pointer"
          >
            ▼
          </button>

          {/* Group Filter Dropdown */}
          <div className="flex items-center bg-[#131720] border border-[#273244] rounded px-2 py-0.5 text-xs font-mono-daw">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value as any)}
              className="bg-transparent text-[#9bb0cf] font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#141822] text-white">All Channels</option>
              <option value="drums" className="bg-[#141822] text-white">🥁 Drums & Percs</option>
              <option value="synths" className="bg-[#141822] text-white">🎹 Synths & VSTs</option>
              <option value="african" className="bg-[#141822] text-white">🍎 African & Rwandan</option>
              <option value="audio" className="bg-[#141822] text-white">🎙️ Audio Samples</option>
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

        {/* Right: Swing control, Step Length selector (up to 512 steps), Graph Editor Toggle, Themes */}
        <div className="flex items-center space-x-2.5">
          {/* Swing Slider */}
          <div className="flex items-center space-x-1.5 bg-[#131720] border border-[#273244] px-2 py-0.5 rounded shadow-inner">
            <Shuffle size={11} className={project.swing > 0.01 ? 'text-[#00f0a8]' : 'text-[#64748b]'} />
            <span className="text-[10px] font-bold text-[#71829d] font-mono-daw hidden sm:inline">
              Swing
            </span>
            <input
              type="range"
              min="0"
              max="75"
              value={Math.round(project.swing * 100)}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) / 100;
                onUpdateProject((p) => ({ ...p, swing: val }));
                audioEngine.setSwing(val);
              }}
              title={`Drum Quantization Swing: ${Math.round(project.swing * 100)}%`}
              className="w-12 sm:w-14 accent-[#00f0a8] h-1.5 bg-[#252f40] rounded cursor-pointer"
            />
            <span className="text-[10px] font-mono-daw text-[#00f0a8] w-6 text-right">
              {Math.round(project.swing * 100)}%
            </span>
          </div>

          {/* Step Sequencer Length Mode (Supports up to 512 steps per FL Studio pattern!) */}
          <div className="flex items-center bg-[#131720] border border-[#273244] rounded p-0.5 text-[11px] font-mono-daw">
            {[16, 32, 64, 128].map((cnt) => (
              <button
                key={cnt}
                onClick={() => handleSetStepCount(cnt)}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  stepCount === cnt
                    ? 'bg-[#29364b] text-[#00f0a8] font-black shadow-xs'
                    : 'text-[#6e8099] hover:text-white'
                }`}
              >
                {cnt}
              </button>
            ))}

            {/* Stepper for up to 512 steps */}
            <div className="flex items-center border-l border-[#273244] pl-1 ml-0.5 space-x-1">
              <button
                onClick={() => handleSetStepCount(stepCount - 16)}
                title="Decrease steps (-16)"
                className="text-[#6e8099] hover:text-white text-[10px] px-1"
              >
                -
              </button>
              <input
                type="number"
                min={4}
                max={512}
                value={stepCount}
                onChange={(e) => handleSetStepCount(parseInt(e.target.value, 10) || 16)}
                className="w-10 bg-[#090b0e] text-[#00f0a8] font-mono-daw text-[10px] font-bold text-center rounded outline-none border border-[#2b3548]"
                title="Pattern Step Length (up to 512 steps)"
              />
              <button
                onClick={() => handleSetStepCount(stepCount + 16)}
                title="Increase steps (+16)"
                className="text-[#6e8099] hover:text-white text-[10px] px-1"
              >
                +
              </button>
            </div>
          </div>

          {/* Graph Editor Toggle Button (Signature FL Studio feature!) */}
          <button
            onClick={() => setIsGraphEditorOpen(!isGraphEditorOpen)}
            title={`Graph Editor (${isGraphEditorOpen ? 'OPEN' : 'CLOSED'}) • Edit Velocity, Pitch & Pan per step`}
            className={`px-2 py-1 rounded text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
              isGraphEditorOpen
                ? 'bg-[#00f0a8] text-black shadow-md shadow-[#00f0a8]/20'
                : 'bg-[#1c2330] hover:bg-[#283244] text-[#8e9eb5] hover:text-white border border-[#2e3a4e]'
            }`}
          >
            <BarChart2 size={13} />
            <span className="hidden sm:inline text-[10px]">Graph</span>
          </button>

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
            title="Clear all steps in current pattern"
            className="p-1 rounded bg-[#1c2330] hover:bg-[#382329] text-[#8e9eb5] hover:text-[#ff3b69] border border-[#2e3a4e] cursor-pointer"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Theme Picker Dropdown Popover (Full 10 FL Studio Themes) */}
      {themePickerOpen && (
        <div className="absolute top-10 left-3 z-50 w-80 bg-[#141824] border border-[#344158] rounded-xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#242f44]">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Palette size={14} className="text-[#00f0a8]" />
              Fruity Loops Themes ({Object.keys(THEMES).length})
            </span>
            <button
              onClick={() => setThemePickerOpen(false)}
              className="text-xs text-[#6e8099] hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {Object.values(THEMES).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  if (onSelectTheme) onSelectTheme(t.id);
                  setThemePickerOpen(false);
                }}
                className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                  currentTheme === t.id
                    ? 'bg-[#253248] text-white border border-[#00f0a8]/40 ring-1 ring-[#00f0a8]/40'
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
                <div
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm border border-white/20"
                  style={{ backgroundColor: t.accentColor }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 1.5 PATTERN BAR (Fruity Loops Pattern Creator & Selector) */}
      <div
        className={`h-8 px-3 border-b ${theme.borderColor} bg-[#10141e] flex items-center justify-between shrink-0 text-xs select-none`}
      >
        {/* Left: Pattern Selector & Creator */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-[#090b10] border border-[#252f42] rounded px-2 py-0.5">
            <span className="text-[10px] text-[#62748e] font-mono-daw uppercase font-bold">
              Pattern:
            </span>
            <select
              value={project.activePatternId || (project.patterns && project.patterns[0]?.id) || 'pattern_1'}
              onChange={(e) => handleSelectPattern(e.target.value)}
              className="bg-transparent text-white font-extrabold text-xs outline-none cursor-pointer"
            >
              {(project.patterns || []).map((pat) => (
                <option key={pat.id} value={pat.id} className="bg-[#10141e] text-white">
                  {pat.name}
                </option>
              ))}
            </select>
          </div>

          {/* "+ New Pattern" button */}
          <button
            onClick={() => handleCreateNewPattern()}
            title="Create New Pattern (+)"
            className="px-2 py-0.5 bg-[#18202d] hover:bg-[#253248] text-[#00f0a8] hover:text-white border border-[#2b3952] rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
          >
            <Plus size={12} />
            <span>New Pattern</span>
          </button>

          {/* Clone Pattern */}
          <button
            onClick={handleClonePattern}
            title="Clone Current Pattern"
            className="px-2 py-0.5 bg-[#18202d] hover:bg-[#253248] text-[#8e9eb5] hover:text-white border border-[#2b3952] rounded text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Copy size={11} />
            <span>Clone</span>
          </button>
        </div>

        {/* Right: Stamp to Timeline / Playlist */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleStampPatternToPlaylist}
            title="Stamp active pattern into arrangement playlist at playhead"
            className="px-2.5 py-0.5 bg-gradient-to-r from-[#00f0a8]/20 to-[#00f0a8]/10 hover:from-[#00f0a8]/30 hover:to-[#00f0a8]/20 text-[#00f0a8] border border-[#00f0a8]/40 rounded text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Layers size={12} />
            <span>Stamp to Timeline</span>
          </button>
        </div>
      </div>

      {/* 2. SEQUENCER WORKSPACE (Channel strips + Step grid) */}
      <div className="flex-1 overflow-y-auto overflow-x-auto p-2.5">
        <div
          className="flex flex-col space-y-1"
          style={{ minWidth: `${300 + stepCount * 22}px` }}
        >
          {/* Step Beat Ruler */}
          <div className="flex items-center pl-[288px] pr-2 pb-1 text-center font-mono-daw text-[10px] text-[#5b6e8a]">
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
                    className={`py-0.5 rounded transition-colors select-none ${
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
          {displayedChannels.map((channel) => {
            const isSelected = selectedChannelId === channel.id;
            return (
              <div
                key={channel.id}
                onClick={() => setSelectedChannelId(channel.id)}
                className={`flex items-center h-8 group transition-all rounded-xs ${
                  isSelected ? 'bg-white/[0.03]' : ''
                }`}
              >
                {/* Channel Controls (LED, PAN, VOL, Channel Name Button, Mixer Track) */}
                <div className="w-[288px] flex items-center justify-between pr-2 shrink-0">
                  {/* 1. Mute / Activity Green LED Dot Button */}
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

                  {/* 4. Channel Name Button (Authentic beveled button with vertical green LED & selection light) */}
                  <div
                    className="relative flex-1 px-1"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDropSample(channel.id, e)}
                  >
                    {editingChannelId === channel.id ? (
                      <input
                        type="text"
                        value={editingChannelName}
                        onChange={(e) => setEditingChannelName(e.target.value)}
                        onBlur={() => handleSaveRename(channel.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(channel.id);
                          if (e.key === 'Escape') setEditingChannelId(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="w-full h-7 px-2 bg-[#090b0e] text-white text-xs font-bold rounded outline-none border border-[#00f0a8]"
                      />
                    ) : (
                      <button
                        onClick={() => handleAudition(channel)}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          if (onOpenPianoRollForChannel) onOpenPianoRollForChannel(channel);
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenuChannelId(channel.id);
                        }}
                        title="Click to audition • Double-click to open Piano Roll • Right-click for options • Drag & drop audio file"
                        className={`w-full h-7 px-2 ${theme.channelButtonBg} border ${theme.channelButtonBorder} rounded-sm shadow-md flex items-center justify-between text-left group active:translate-y-0.5 transition-all cursor-pointer relative`}
                      >
                        {/* Channel Color Indicator strip */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xs"
                          style={{ backgroundColor: channel.color || '#00f0a8' }}
                        />

                        <span className="text-xs font-extrabold text-white tracking-wide truncate max-w-[105px] drop-shadow-sm pl-1">
                          {channel.name}
                        </span>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          {/* Channel Selection Light Indicator (Classic FL Studio rectangle) */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChannelId(channel.id);
                            }}
                            title="Selected Channel Indicator"
                            className={`w-1.5 h-3 rounded-xs border transition-colors ${
                              isSelected
                                ? 'bg-[#00f0a8] border-[#00f0a8] shadow-[0_0_4px_#00f0a8]'
                                : 'bg-[#181f2a] border-[#2c3648]'
                            }`}
                          />

                          {/* Vertical Activity LED Strip */}
                          <div
                            className={`w-1 h-3.5 rounded-xs transition-colors ${
                              channel.mute ? 'bg-[#3b4352]' : 'bg-[#00ff88] shadow-[0_0_3px_#00ff88]'
                            }`}
                          />
                        </div>
                      </button>
                    )}

                    {/* Context Menu for this channel */}
                    {contextMenuChannelId === channel.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-8 left-1 z-50 w-48 bg-[#141824] border border-[#344158] rounded-xl shadow-2xl p-1.5 text-xs animate-in fade-in zoom-in-95 duration-100"
                      >
                        <button
                          onClick={() => {
                            if (onOpenPianoRollForChannel) onOpenPianoRollForChannel(channel);
                            setContextMenuChannelId(null);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#253248] text-white font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <Music size={13} className="text-[#00f0a8]" />
                          <span>Open in Piano Roll</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingChannelId(channel.id);
                            setEditingChannelName(channel.name);
                            setContextMenuChannelId(null);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#253248] text-white font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 size={13} className="text-[#38bdf8]" />
                          <span>Rename Channel</span>
                        </button>
                        <button
                          onClick={() => setColorPickerChannelId(colorPickerChannelId === channel.id ? null : channel.id)}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#253248] text-white font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <Palette size={13} className="text-[#f59e0b]" />
                          <span>Change Color...</span>
                        </button>

                        {/* Color palette popup */}
                        {colorPickerChannelId === channel.id && (
                          <div className="grid grid-cols-5 gap-1 p-1.5 bg-[#0a0d14] rounded-lg my-1 border border-[#1f283a]">
                            {FL_COLORS.map((c) => (
                              <div
                                key={c}
                                onClick={() => handleChangeColor(channel.id, c)}
                                style={{ backgroundColor: c }}
                                className="w-5 h-5 rounded-md cursor-pointer hover:scale-110 transition-transform shadow-xs"
                              />
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setTargetChannelForHub(channel.id);
                            setIsSampleHubOpen(true);
                            setContextMenuChannelId(null);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#253248] text-white font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <FolderOpen size={13} className="text-[#ff6b4a]" />
                          <span>Replace with VST / Sound...</span>
                        </button>
                        <button
                          onClick={() => handleRouteToFreeMixer(channel.id)}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#253248] text-white font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <SlidersHorizontal size={13} className="text-[#00ff88]" />
                          <span>Route to Free Mixer (Ctrl+L)</span>
                        </button>
                        <button
                          onClick={() => handleCloneChannel(channel)}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#253248] text-white font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <Copy size={13} className="text-[#38bdf8]" />
                          <span>Clone Channel</span>
                        </button>

                        {/* Direct PC file loader */}
                        <label className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#253248] text-white font-semibold flex items-center gap-2 cursor-pointer">
                          <Upload size={13} className="text-[#c084fc]" />
                          <span>Load Audio from PC...</span>
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                              handleDirectPcFileUpload(channel.id, e);
                              setContextMenuChannelId(null);
                            }}
                            className="hidden"
                          />
                        </label>

                        <div className="h-[1px] bg-[#222c3d] my-1" />
                        <button
                          onClick={() => handleDeleteChannel(channel.id)}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#3b1d24] text-[#ff3b69] font-bold flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Delete Channel</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 5. Quick Piano Roll & Delete Buttons */}
                  <div className="flex items-center space-x-0.5">
                    <button
                      onClick={() => {
                        if (onOpenPianoRollForChannel) onOpenPianoRollForChannel(channel);
                      }}
                      title="Open Channel in Piano Roll"
                      className="p-1 text-[#64748b] hover:text-[#00f0a8] hover:bg-[#1a2230] rounded transition-colors"
                    >
                      <Music size={11} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteChannel(channel.id, e)}
                      title="Delete Channel from Rack"
                      className="p-1 text-[#64748b] hover:text-[#ff3b69] hover:bg-[#381a22] rounded transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>

                  {/* 6. Mixer Track Routing Box (Numeric LCD) */}
                  <div
                    title="Mixer Track Number (Click arrows or press Ctrl+L to auto-assign)"
                    className="w-9 h-6 bg-[#0c0f16] border border-[#2b3548] rounded flex items-center justify-between px-1 text-[11px] font-mono-daw text-[#00f0a8] select-none ml-1"
                  >
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

                {/* Step Sequencer Buttons Grid (4-beat block alternation, up to 512 steps) */}
                <div
                  className="flex-1 grid gap-1 h-7"
                  style={{ gridTemplateColumns: `repeat(${stepCount}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: stepCount }).map((_, stepIdx) => {
                    const isActive = channel.steps[stepIdx] ?? false;
                    const isCurrent = project.isPlaying && currentPlayStep === stepIdx;

                    // 4-beat block alternation (FL Studio signature):
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
                            className="w-full bg-white/60 rounded-xs transition-all pointer-events-none"
                            style={{
                              height: `${(channel.velocities[stepIdx] || 0.85) * 100}%`,
                            }}
                          />
                        ) : (
                          <div className="w-full h-1 bg-black/20 rounded-xs pointer-events-none" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. GRAPH EDITOR DRAWER (Velocity, Pitch, Panning, Cutoff per step) */}
      {isGraphEditorOpen && activeChannelForGraph && (
        <div className="h-44 bg-[#0d1016] border-t border-[#232c3d] flex flex-col shrink-0 animate-in slide-in-from-bottom-2 duration-150 shadow-inner">
          {/* Graph Editor Header */}
          <div className="h-8 bg-[#121620] border-b border-[#1f2838] px-3 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white flex items-center gap-1.5 font-mono-daw text-[11px]">
                <BarChart2 size={13} className="text-[#00f0a8]" />
                GRAPH EDITOR:
              </span>

              {/* Target Channel Selector */}
              <select
                value={activeChannelForGraph.id}
                onChange={(e) => setSelectedChannelId(e.target.value)}
                className="bg-[#18202d] text-[#00f0a8] font-bold text-xs rounded border border-[#2b3952] px-2 py-0.5 focus:outline-none"
              >
                {project.drumChannels.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#141822] text-white">
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Parameter Tabs */}
              <div className="flex items-center bg-[#090b0e] border border-[#202736] rounded p-0.5 text-[10px] font-mono-daw">
                {[
                  { id: 'velocity', label: 'Velocity' },
                  { id: 'pitch', label: 'Pitch' },
                  { id: 'pan', label: 'Pan' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setGraphParam(tab.id as any)}
                    className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                      graphParam === tab.id
                        ? 'bg-[#00f0a8] text-black shadow-xs'
                        : 'text-[#7e8fa6] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Tools */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handleHumanizeVelocities(activeChannelForGraph.id)}
                title="Add human velocity variation (±12%)"
                className="px-2 py-0.5 bg-[#18202d] hover:bg-[#253246] text-[#f59e0b] rounded border border-[#2c3d59] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Wand2 size={10} />
                <span>Humanize</span>
              </button>
              <button
                onClick={() => handleCrescendo(activeChannelForGraph.id)}
                title="Apply smooth crescendo ramp across the pattern"
                className="px-2 py-0.5 bg-[#18202d] hover:bg-[#253246] text-[#00f0a8] rounded border border-[#2c3d59] text-[10px] font-bold cursor-pointer"
              >
                Crescendo
              </button>
              <button
                onClick={() => setIsGraphEditorOpen(false)}
                className="text-[#64748b] hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Graph Editor Sliders Grid */}
          <div className="flex-1 overflow-x-auto p-2">
            <div
              className="h-full flex items-end pl-[288px] pr-2"
              style={{ minWidth: `${300 + stepCount * 22}px` }}
            >
              <div
                className="flex-1 h-full grid gap-1 items-end bg-[#080a0e] rounded p-1 border border-[#1b2230]"
                style={{ gridTemplateColumns: `repeat(${stepCount}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: stepCount }).map((_, stepIdx) => {
                  const isActive = activeChannelForGraph.steps[stepIdx] ?? false;
                  const isCurrent = project.isPlaying && currentPlayStep === stepIdx;

                  let valuePct = 0.85;
                  let displayVal = '85%';

                  if (graphParam === 'velocity') {
                    valuePct = activeChannelForGraph.velocities[stepIdx] ?? 0.85;
                    displayVal = `${Math.round(valuePct * 100)}%`;
                  } else if (graphParam === 'pitch') {
                    const st = activeChannelForGraph.stepPitches?.[stepIdx] ?? 0;
                    valuePct = 0.5 + st / 24;
                    displayVal = `${st > 0 ? '+' : ''}${st}st`;
                  } else if (graphParam === 'pan') {
                    const panVal = activeChannelForGraph.stepPans?.[stepIdx] ?? 0;
                    valuePct = 0.5 + panVal * 0.5;
                    displayVal = panVal === 0 ? 'C' : panVal < 0 ? `${Math.round(-panVal * 100)}%L` : `${Math.round(panVal * 100)}%R`;
                  }

                  return (
                    <div
                      key={stepIdx}
                      onMouseDown={(e) => {
                        isDraggingGraphRef.current = true;
                        const rect = e.currentTarget.getBoundingClientRect();
                        handleGraphBarChange(activeChannelForGraph.id, stepIdx, e.clientY, rect);
                      }}
                      onMouseEnter={(e) => {
                        if (!isDraggingGraphRef.current) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        handleGraphBarChange(activeChannelForGraph.id, stepIdx, e.clientY, rect);
                      }}
                      title={`Step ${stepIdx + 1}: ${displayVal} (Drag to adjust)`}
                      className={`h-full flex flex-col justify-end items-center relative rounded-xs transition-colors cursor-ns-resize group ${
                        isCurrent ? 'bg-[#00f0a8]/10 ring-1 ring-[#00f0a8]' : 'hover:bg-[#18212e]'
                      }`}
                    >
                      {/* Vertical Value Bar */}
                      <div
                        className={`w-full rounded-xs transition-all pointer-events-none ${
                          isActive
                            ? 'bg-gradient-to-t from-[#00f0a8] to-[#00d696] shadow-[0_0_6px_rgba(0,240,168,0.4)]'
                            : 'bg-[#2a3648] opacity-50'
                        }`}
                        style={{ height: `${Math.max(5, valuePct * 100)}%` }}
                      />

                      {/* Step Indicator Dot */}
                      <div
                        className={`w-1.5 h-1.5 rounded-full mb-0.5 pointer-events-none ${
                          isActive ? 'bg-white' : 'bg-[#3b4759]'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. BOTTOM CHANNEL RACK DOCK: "+" Button, Channel Count, & Sound Library */}
      <div
        className={`h-11 ${theme.headerBg} border-t ${theme.borderColor} px-4 flex items-center justify-between shrink-0 select-none`}
      >
        {/* Left: Big FL Studio "+" Button to add plugins/samples/VSTs */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setTargetChannelForHub(null);
              setIsSampleHubOpen(true);
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-[#ff3b69] to-[#ff6b4a] hover:from-[#ff4d79] hover:to-[#ff7b5a] text-white font-black text-xs rounded-lg shadow-md shadow-[#ff3b69]/30 flex items-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Sound / VST Plugin</span>
          </button>

          <span className="text-xs text-[#6e8099] font-mono-daw">
            {project.drumChannels.length} Channels Loaded
          </span>
        </div>

        {/* Right: Splice Hub & PC Sample Importer */}
        <div className="flex items-center space-x-2">
          {/* Direct PC Audio File Importer */}
          <label className="px-2.5 py-1 bg-[#1a2230] hover:bg-[#253046] text-[#c084fc] hover:text-white text-xs font-semibold rounded border border-[#2b3952] flex items-center gap-1.5 transition-colors cursor-pointer">
            <Upload size={13} />
            <span>Import Audio from PC</span>
            <input
              type="file"
              accept="audio/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const ab = await file.arrayBuffer();
                  const buffer = await audioEngine.decodeAudioData(ab);
                  const name = file.name.replace(/\.[^/.]+$/, '');
                  const newChan: DrumChannel = {
                    id: 'custom_' + Date.now(),
                    name,
                    type: 'custom',
                    steps: Array(stepCount).fill(false),
                    velocities: Array(stepCount).fill(0.85),
                    volume: 1.0,
                    pan: 0,
                    pitch: 0,
                    mute: false,
                    solo: false,
                    audioBuffer: buffer,
                  };
                  handleAddNewChannel(newChan);
                } catch (err) {
                  console.error('Failed to import file:', err);
                }
              }}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              setTargetChannelForHub(null);
              setIsSampleHubOpen(true);
            }}
            className="px-2.5 py-1 bg-[#1a2230] hover:bg-[#253046] text-[#00f0a8] hover:text-white text-xs font-semibold rounded border border-[#2b3952] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FolderOpen size={13} />
            <span>Sample & VST Hub</span>
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
