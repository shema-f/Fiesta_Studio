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
  MoreVertical,
  Edit2,
  Palette,
  Laptop,
  Sparkles,
  FolderOpen,
  Layers,
  Upload,
  Check,
  X,
} from 'lucide-react';
import { Track, Clip, ProjectState } from '../engine/projectStore';
import { InstrumentType, ViewMode } from '../types/daw';

const TRACK_COLORS = [
  '#00f0a8',
  '#ff3b69',
  '#a855f7',
  '#38bdf8',
  '#f59e0b',
  '#ff6200',
  '#00ff88',
  '#818cf8',
  '#ec4899',
  '#64748b',
];

interface VstPresetOption {
  id: string;
  name: string;
  type: 'midi' | 'audio' | 'drums';
  instrumentType: InstrumentType;
  category: 'synths' | 'drums' | 'african' | 'audio' | 'pc_vst';
  badge: string;
  description: string;
  color: string;
}

const VST_OPTIONS: VstPresetOption[] = [
  // Synths & FL Generators
  {
    id: 'fl_3xosc',
    name: '3xOSC Multi-Waveform Synth',
    type: 'midi',
    instrumentType: 'synth',
    category: 'synths',
    badge: 'FL GENERATOR',
    description: 'Triple oscillator subtractive synth with detuning, fat unison, and warm analog sweeps',
    color: '#00f0a8',
  },
  {
    id: 'fl_sytrus',
    name: 'Sytrus FM Synthesizer',
    type: 'midi',
    instrumentType: 'synth',
    category: 'synths',
    badge: 'FM VST',
    description: '6-operator FM & ring modulation synthesizer for crystalline bells, metallic leads & deep basses',
    color: '#38bdf8',
  },
  {
    id: 'fl_harmless',
    name: 'Harmless Additive Synth',
    type: 'midi',
    instrumentType: 'synth',
    category: 'synths',
    badge: 'ADDITIVE VST',
    description: 'Warm harmonics generator with automated timbre shaping and resonant multi-mode filters',
    color: '#f59e0b',
  },
  {
    id: 'fl_flex',
    name: 'FLEX Studio Multi-Instrument',
    type: 'midi',
    instrumentType: 'keys',
    category: 'synths',
    badge: 'ROMLER VST',
    description: 'High-definition sampled acoustic guitars, synth strings, hyper-leads and modern pads',
    color: '#818cf8',
  },
  {
    id: 'fl_minisynth',
    name: 'MiniSynth Vintage Lead',
    type: 'midi',
    instrumentType: 'synth',
    category: 'synths',
    badge: 'MONO LEAD',
    description: 'Classic dual-saw lead synthesizer with glide, drive and tape flutter',
    color: '#ff6200',
  },
  {
    id: 'inst_lounge_lizard',
    name: 'Lounge Lizard E-Piano',
    type: 'midi',
    instrumentType: 'lounge_lizard',
    category: 'synths',
    badge: 'PHYSICAL MODEL',
    description: 'Authentic 70s Rhodes & Wurlitzer electric piano with tine bell chime and stereo tremolo',
    color: '#f59e0b',
  },
  {
    id: 'inst_grand_piano',
    name: 'Grand Concert Acoustic Piano',
    type: 'midi',
    instrumentType: 'piano',
    category: 'synths',
    badge: 'PIANO',
    description: 'Triple-harmonic acoustic concert grand piano with hammer velocity sensitivity',
    color: '#00f0a8',
  },
  {
    id: 'inst_sub_808',
    name: 'Sub 808 Analog Bass Machine',
    type: 'midi',
    instrumentType: '808',
    category: 'synths',
    badge: '808 BASS',
    description: 'Low-end tuned sub oscillator with punchy pitch envelope and tape tube saturation',
    color: '#ff3b69',
  },
  {
    id: 'inst_ambient_pad',
    name: 'Ethereal Ambient Pad',
    type: 'midi',
    instrumentType: 'pad',
    category: 'synths',
    badge: 'PAD',
    description: 'Cinematic wide stereo lush pads with chorused air and slow evolving attack',
    color: '#c084fc',
  },
  {
    id: 'inst_clean_pluck',
    name: 'Plucked Synth Melody',
    type: 'midi',
    instrumentType: 'pluck',
    category: 'synths',
    badge: 'PLUCK',
    description: 'Fast transient melodic pluck with short decay and stereo ping-pong bounce',
    color: '#2dd4bf',
  },

  // Drums
  {
    id: 'drum_808_trap',
    name: 'Trap 808 Drum Machine Track',
    type: 'drums',
    instrumentType: 'drums',
    category: 'drums',
    badge: 'DRUM RACK',
    description: 'Sub kicks, snappy 200Hz claps, tight rolling sizzle hats and 808 percussion',
    color: '#ff3b69',
  },
  {
    id: 'drum_afrobeats',
    name: 'Afrobeats Percussion Kit',
    type: 'drums',
    instrumentType: 'drums',
    category: 'drums',
    badge: 'AFROBEATS',
    description: 'Syncopated afro-kick groove, warm wooden rimshots, and organic seed shakers',
    color: '#ff6200',
  },
  {
    id: 'drum_amapiano',
    name: 'Amapiano Log Drum Rack',
    type: 'drums',
    instrumentType: 'drums',
    category: 'drums',
    badge: 'AMAPIANO',
    description: 'Woody log-drum sub bass slides, crisp shakers, and south african snare bouncers',
    color: '#eab308',
  },
  {
    id: 'drum_acoustic_studio',
    name: 'Acoustic Studio Drum Kit',
    type: 'drums',
    instrumentType: 'drums',
    category: 'drums',
    badge: 'ACOUSTIC',
    description: 'Organic recorded kick, brass snare, real hi-hats, and room ambient air',
    color: '#00f0a8',
  },

  // African Traditional
  {
    id: 'af_inanga',
    name: 'Rwandan Inanga Zither Harp',
    type: 'midi',
    instrumentType: 'inanga',
    category: 'african',
    badge: 'RWANDA',
    description: 'Authentic 8-string wooden trough zither acoustic plucked strings (East African Heritage)',
    color: '#10b981',
  },
  {
    id: 'af_balafon',
    name: 'Balafon Wooden Marimba',
    type: 'midi',
    instrumentType: 'balafon',
    category: 'african',
    badge: 'WEST AFRICA',
    description: 'Tuned resonant hardwood bars with dried spider-egg gourd buzzers',
    color: '#f59e0b',
  },
  {
    id: 'af_kalimba',
    name: 'Kalimba / Mbira Thumb Piano',
    type: 'midi',
    instrumentType: 'kalimba',
    category: 'african',
    badge: 'CHIMES',
    description: 'Acoustic steel tines on hollow carved mahogany box with harmonic chime ringing',
    color: '#06b6d4',
  },

  // Audio / Vocal
  {
    id: 'audio_vocal_lead',
    name: 'Lead Vocal Audio Track',
    type: 'audio',
    instrumentType: 'pad',
    category: 'audio',
    badge: 'VOCAL',
    description: 'Stereo audio track optimized with vocal EQ, pitch compressor and delay routing',
    color: '#a855f7',
  },
  {
    id: 'audio_backing_stem',
    name: 'Audio Stem / Backing Track',
    type: 'audio',
    instrumentType: 'keys',
    category: 'audio',
    badge: 'STEM',
    description: 'Full-bandwidth audio lane for importing external stems, guitars or recorded beats',
    color: '#3b82f6',
  },

  // PC VST & Local Files
  {
    id: 'pc_vst_bridge',
    name: 'PC VST2 / VST3 Plugin Bridge',
    type: 'midi',
    instrumentType: 'synth',
    category: 'pc_vst',
    badge: 'PC VST BRIDGE',
    description: 'Simulated native Windows & Mac PC VST scanner connecting to local VstPlugins directory',
    color: '#00f0a8',
  },
  {
    id: 'pc_soundfont_player',
    name: 'SoundFont Player (.sf2)',
    type: 'midi',
    instrumentType: 'keys',
    category: 'pc_vst',
    badge: 'SF2 SAMPLER',
    description: 'Load General MIDI soundfonts, soundbanks, and multi-sampled PC instrument archives',
    color: '#ec4899',
  },
  {
    id: 'pc_sample_track',
    name: 'Custom PC Audio File Track',
    type: 'audio',
    instrumentType: 'piano',
    category: 'pc_vst',
    badge: 'LOCAL FILE',
    description: 'Load and trigger any WAV, MP3, or AIFF audio file directly from your computer',
    color: '#f97316',
  },
];

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
  const [isAddTrackModalOpen, setIsAddTrackModalOpen] = useState(false);
  const [selectedTrackKind, setSelectedTrackKind] = useState<'instrument' | 'audio'>('instrument');
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackColor, setNewTrackColor] = useState('#00f0a8');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('vst_sytrus');
  const [addTrackCategory, setAddTrackCategory] = useState<'all' | 'synths' | 'drums' | 'african' | 'audio' | 'pc_vst'>('all');
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [contextMenuTrackId, setContextMenuTrackId] = useState<string | null>(null);
  const [colorPickerTrackId, setColorPickerTrackId] = useState<string | null>(null);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [editingTrackName, setEditingTrackName] = useState('');
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

  // Delete Track from Track List
  const handleDeleteTrack = (trackId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onUpdateProject((p) => {
      const remaining = p.tracks.filter((t) => t.id !== trackId);
      return {
        ...p,
        tracks: remaining,
        activeTrackId: p.activeTrackId === trackId ? (remaining[0]?.id || null) : p.activeTrackId,
      };
    });
    setContextMenuTrackId(null);
  };

  // Duplicate Track
  const handleDuplicateTrack = (trackId: string) => {
    const orig = project.tracks.find((t) => t.id === trackId);
    if (!orig) return;
    const newId = 'track_' + Date.now();
    const clonedTrack: Track = {
      ...orig,
      id: newId,
      name: `${orig.name} (Copy)`,
      clips: orig.clips.map((c) => ({
        ...c,
        id: 'clip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        trackId: newId,
      })),
    };
    onUpdateProject((p) => ({
      ...p,
      tracks: [...p.tracks, clonedTrack],
      activeTrackId: newId,
    }));
    setContextMenuTrackId(null);
  };

  // Rename Track
  const handleSaveRename = (trackId: string) => {
    if (editingTrackName.trim()) {
      onUpdateProject((p) => ({
        ...p,
        tracks: p.tracks.map((t) => (t.id === trackId ? { ...t, name: editingTrackName.trim() } : t)),
      }));
    }
    setEditingTrackId(null);
  };

  // Change Track Color
  const handleChangeTrackColor = (trackId: string, color: string) => {
    onUpdateProject((p) => ({
      ...p,
      tracks: p.tracks.map((t) => (t.id === trackId ? { ...t, color } : t)),
    }));
    setColorPickerTrackId(null);
    setContextMenuTrackId(null);
  };

  // Clear Track Clips
  const handleClearTrackClips = (trackId: string) => {
    onUpdateProject((p) => ({
      ...p,
      tracks: p.tracks.map((t) => (t.id === trackId ? { ...t, clips: [] } : t)),
    }));
    setContextMenuTrackId(null);
  };

  // Add Track from preset / VST modal
  const handleAddTrackFromPreset = (preset: VstPresetOption) => {
    const newTrack: Track = {
      id: 'track_' + Date.now(),
      name: preset.name,
      type: preset.type,
      color: preset.color,
      instrumentType: preset.instrumentType,
      volume: 0.9,
      pan: 0,
      mute: false,
      solo: false,
      busId: preset.type === 'drums' ? 'bus_drums' : preset.type === 'audio' ? 'bus_vocals' : 'bus_instruments',
      inserts: [],
      clips: [],
    };

    onUpdateProject((p) => ({
      ...p,
      tracks: [...p.tracks, newTrack],
      activeTrackId: newTrack.id,
    }));

    setIsAddTrackModalOpen(false);
  };

  // Create track from explicit dialog selection (Audio or Instrument)
  const handleCreateTrackFromDialog = () => {
    const isAudio = selectedTrackKind === 'audio';
    const selectedPreset = VST_OPTIONS.find((o) => o.id === selectedPresetId);
    const instType: InstrumentType = isAudio ? 'pad' : (selectedPreset?.instrumentType || 'synth');
    const trackType = isAudio ? 'audio' : (selectedPreset?.type || 'midi');
    const finalName =
      newTrackName.trim() ||
      (isAudio ? 'Audio Track' : selectedPreset?.name || 'Instrument Track');

    const newTrack: Track = {
      id: 'track_' + Date.now(),
      name: finalName,
      type: trackType,
      color: newTrackColor,
      instrumentType: instType,
      volume: 0.9,
      pan: 0,
      mute: false,
      solo: false,
      busId: isAudio
        ? 'bus_vocals'
        : trackType === 'drums'
        ? 'bus_drums'
        : 'bus_instruments',
      inserts: [],
      clips: [],
    };

    onUpdateProject((p) => ({
      ...p,
      tracks: [...p.tracks, newTrack],
      activeTrackId: newTrack.id,
    }));

    setIsAddTrackModalOpen(false);
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

  // Filtered VST Options in modal
  const filteredVstOptions = VST_OPTIONS.filter((opt) => {
    const matchesCat = addTrackCategory === 'all' || opt.category === addTrackCategory;
    const matchesSearch =
      trackSearchQuery === '' ||
      opt.name.toLowerCase().includes(trackSearchQuery.toLowerCase()) ||
      opt.description.toLowerCase().includes(trackSearchQuery.toLowerCase()) ||
      opt.badge.toLowerCase().includes(trackSearchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0b0d11] overflow-hidden select-none">
      {/* Timeline Toolbar */}
      <div className="h-10 bg-[#12161f] border-b border-[#1f2633] px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          {/* Tool selectors: Pointer, Cut, Duplicate, Delete Clip & Delete Track */}
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
            <div className="w-[1px] h-3.5 bg-[#252d3d] mx-0.5" />
            <button
              onClick={() => {
                if (project.activeTrackId) {
                  handleDeleteTrack(project.activeTrackId);
                }
              }}
              disabled={!project.activeTrackId || project.tracks.length <= 1}
              title="Delete Active Track from Track List"
              className="p-1.5 rounded text-[#7e8ea3] hover:text-[#ff3b69] hover:bg-[#ff3b69]/10 disabled:opacity-30 disabled:hover:text-[#7e8ea3] disabled:hover:bg-transparent transition-colors flex items-center gap-1 text-xs"
            >
              <Trash2 size={13} />
              <span className="text-[10px] hidden sm:inline">Del Track</span>
            </button>
          </div>

          {/* Snap Selector */}
          <div className="hidden sm:flex items-center space-x-1 text-xs text-[#7e8ea3] bg-[#090b0e] border border-[#202735] px-2 py-1 rounded-lg">
            <span className="text-[10px] text-[#55657e]">SNAP</span>
            <span className="text-white font-mono-daw">1/4 Bar</span>
          </div>

          {/* Create New Track Trigger Button */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                setSelectedTrackKind('instrument');
                setNewTrackName('New Instrument Track');
                setNewTrackColor('#00f0a8');
                setIsAddTrackModalOpen(true);
              }}
              className="px-2.5 py-1 bg-gradient-to-r from-[#00f0a8]/25 to-[#00f0a8]/10 hover:from-[#00f0a8]/40 hover:to-[#00f0a8]/20 text-[#00f0a8] border border-[#00f0a8]/50 rounded text-xs font-extrabold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
              title="Open Create New Track Dialog (Audio or Instrument)"
            >
              <Plus size={14} />
              <span>Create New Track</span>
            </button>

            {/* Quick Add Presets */}
            <button
              onClick={() => handleAddTrack('midi', 'synth')}
              className="px-2 py-1 bg-[#1a2230] hover:bg-[#232e42] text-[#00f0a8] border border-[#2b3952] rounded text-xs font-semibold hidden md:flex items-center space-x-1 transition-colors"
            >
              <span>+ Synth</span>
            </button>
            <button
              onClick={() => handleAddTrack('drums', 'drums')}
              className="px-2 py-1 bg-[#1a2230] hover:bg-[#232e42] text-[#ff3b69] border border-[#2b3952] rounded text-xs font-semibold hidden md:flex items-center space-x-1 transition-colors"
            >
              <span>+ Drums</span>
            </button>
            <button
              onClick={() => handleAddTrack('audio', 'pad')}
              className="px-2 py-1 bg-[#1a2230] hover:bg-[#232e42] text-[#a855f7] border border-[#2b3952] rounded text-xs font-semibold hidden md:flex items-center space-x-1 transition-colors"
            >
              <span>+ Audio</span>
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
        <div className="w-56 md:w-64 bg-[#0f131a] border-r border-[#1f2633] flex flex-col shrink-0 overflow-y-auto">
          {/* Header Spacer aligning with timeline ruler */}
          <div className="h-7 bg-[#131720] border-b border-[#1f2633] px-3 flex items-center justify-between text-[10px] font-bold text-[#55657e]">
            <span>TRACK LIST ({project.tracks.length})</span>
            <button
              onClick={() => setIsAddTrackModalOpen(true)}
              className="text-[#00f0a8] hover:text-white flex items-center gap-0.5 text-[9px] font-bold"
              title="Add New Track"
            >
              <Plus size={10} />
              <span>ADD</span>
            </button>
          </div>

          {/* Track Header Items */}
          {project.tracks.map((track) => {
            const isSelected = project.activeTrackId === track.id;
            return (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenuTrackId(track.id);
                }}
                className={`h-16 border-b border-[#1b2230] px-3 flex flex-col justify-center cursor-pointer transition-colors relative group ${
                  isSelected ? 'bg-[#18202d]' : 'hover:bg-[#131822]'
                }`}
              >
                {/* Color Accent Indicator */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 transition-colors"
                  style={{ backgroundColor: track.color }}
                />

                {/* Track Name & Instrument Badge & Delete Button */}
                <div className="flex items-center justify-between mb-1 pl-1">
                  <div className="flex items-center space-x-1.5 truncate flex-1 min-w-0 pr-1">
                    {track.type === 'drums' ? (
                      <Grid size={13} style={{ color: track.color }} className="shrink-0" />
                    ) : track.type === 'audio' ? (
                      <Mic size={13} style={{ color: track.color }} className="shrink-0" />
                    ) : (
                      <Music size={13} style={{ color: track.color }} className="shrink-0" />
                    )}

                    {editingTrackId === track.id ? (
                      <input
                        type="text"
                        value={editingTrackName}
                        onChange={(e) => setEditingTrackName(e.target.value)}
                        onBlur={() => handleSaveRename(track.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(track.id);
                          if (e.key === 'Escape') setEditingTrackId(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#090b0e] text-white text-xs px-1 rounded outline-none border border-[#00f0a8] w-28"
                      />
                    ) : (
                      <span
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingTrackId(track.id);
                          setEditingTrackName(track.name);
                        }}
                        title="Double-click to rename"
                        className="text-xs font-bold text-white truncate"
                      >
                        {track.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-[#090b0e] text-[#6b7c93] border border-[#1f2633]">
                      {track.instrumentType}
                    </span>

                    {/* Quick Delete Track Button */}
                    <button
                      onClick={(e) => handleDeleteTrack(track.id, e)}
                      title="Delete Track from Track List"
                      className="p-1 rounded text-[#56657e] hover:text-[#ff3b69] hover:bg-[#ff3b69]/10 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>

                    {/* More Options Menu Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setContextMenuTrackId(contextMenuTrackId === track.id ? null : track.id);
                      }}
                      title="Track Options (Rename, Color, Duplicate, Delete)"
                      className="p-1 rounded text-[#56657e] hover:text-white hover:bg-[#1f2838] transition-colors"
                    >
                      <MoreVertical size={12} />
                    </button>
                  </div>
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

                {/* Track Context Menu Popover */}
                {contextMenuTrackId === track.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-10 right-2 z-50 w-44 bg-[#0f141f] border border-[#2b3952] rounded-xl shadow-2xl p-1.5 text-xs animate-in fade-in zoom-in-95 duration-100"
                  >
                    <button
                      onClick={() => {
                        setEditingTrackId(track.id);
                        setEditingTrackName(track.name);
                        setContextMenuTrackId(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#1a2333] text-white flex items-center gap-2"
                    >
                      <Edit2 size={12} className="text-[#38bdf8]" />
                      <span>Rename Track</span>
                    </button>
                    <button
                      onClick={() => handleDuplicateTrack(track.id)}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#1a2333] text-white flex items-center gap-2"
                    >
                      <Copy size={12} className="text-[#00f0a8]" />
                      <span>Duplicate Track</span>
                    </button>
                    <button
                      onClick={() => setColorPickerTrackId(colorPickerTrackId === track.id ? null : track.id)}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#1a2333] text-white flex items-center gap-2"
                    >
                      <Palette size={12} className="text-[#f59e0b]" />
                      <span>Change Color...</span>
                    </button>

                    {/* Color palette popover */}
                    {colorPickerTrackId === track.id && (
                      <div className="grid grid-cols-5 gap-1 p-1.5 bg-[#0a0d14] rounded-lg my-1 border border-[#1f283a]">
                        {TRACK_COLORS.map((c) => (
                          <div
                            key={c}
                            onClick={() => handleChangeTrackColor(track.id, c)}
                            style={{ backgroundColor: c }}
                            className="w-5 h-5 rounded-md cursor-pointer hover:scale-110 transition-transform shadow-xs"
                          />
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleClearTrackClips(track.id)}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#1a2333] text-[#f59e0b] flex items-center gap-2"
                    >
                      <Scissors size={12} />
                      <span>Clear All Clips</span>
                    </button>
                    <div className="h-[1px] bg-[#1e2738] my-1" />
                    <button
                      onClick={() => handleDeleteTrack(track.id)}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#3b151e] text-[#ff3b69] font-bold flex items-center gap-2"
                    >
                      <Trash2 size={12} />
                      <span>Delete Track</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Bottom Create New Track Button */}
          <div className="p-2 border-t border-[#1b2230]">
            <button
              onClick={() => {
                setSelectedTrackKind('instrument');
                setNewTrackName('New Instrument Track');
                setNewTrackColor('#00f0a8');
                setIsAddTrackModalOpen(true);
              }}
              className="w-full py-2 px-3 bg-[#131822] hover:bg-[#1c2433] text-[#8e9eb5] hover:text-[#00f0a8] border border-dashed border-[#2b3548] hover:border-[#00f0a8]/50 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Create New Track</span>
            </button>
          </div>
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

              {/* Clips on this track */}
              {track.clips.map((clip) => {
                const clipLeft = (clip.startBar - 1) * pixelsPerBar;
                const clipWidth = clip.lengthBars * pixelsPerBar;
                const isSelected = selectedClipId === clip.id;

                return (
                  <div
                    key={clip.id}
                    onClick={(e) => handleClipAction(track.id, clip, e)}
                    className={`absolute top-1 bottom-1 rounded-md border shadow-md flex flex-col justify-between overflow-hidden cursor-pointer select-none transition-all ${
                      isSelected
                        ? 'border-white ring-2 ring-white/50 brightness-110 z-10'
                        : 'border-white/10 hover:brightness-105'
                    }`}
                    style={{
                      left: `${clipLeft}px`,
                      width: `${clipWidth}px`,
                      backgroundColor: clip.color || track.color,
                    }}
                  >
                    {/* Clip Title Banner */}
                    <div className="h-4 bg-black/40 px-1.5 flex items-center justify-between text-[9px] font-bold text-white/90">
                      <span className="truncate">{clip.name}</span>
                      <span className="font-mono-daw opacity-70 text-[8px]">{clip.lengthBars}b</span>
                    </div>

                    {/* Clip Body Waveform / MIDI Visualization */}
                    <div className="flex-1 flex items-center justify-center px-1">
                      {clip.type === 'audio' && clip.waveformPoints ? (
                        <div className="w-full h-7 flex items-center justify-between space-x-[1px] opacity-75">
                          {clip.waveformPoints.map((pt, idx) => (
                            <div
                              key={idx}
                              className="bg-white/80 rounded-full flex-1"
                              style={{ height: `${Math.max(10, pt * 100)}%` }}
                            />
                          ))}
                        </div>
                      ) : clip.notes ? (
                        <div className="w-full h-full flex flex-col justify-center space-y-0.5 opacity-60">
                          {clip.notes.slice(0, 4).map((n, i) => (
                            <div
                              key={i}
                              className="h-1 bg-white/70 rounded-xs"
                              style={{
                                marginLeft: `${(n.startStep / (clip.lengthBars * 16)) * 100}%`,
                                width: `${Math.max(5, (n.durationSteps / (clip.lengthBars * 16)) * 100)}%`,
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-[10px] text-white/40 font-mono-daw uppercase tracking-wider">
                          {clip.type}
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

      {/* Add Track & VST Modal */}
      {isAddTrackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-[#0e121a] border border-[#2b3952] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#1f283a] flex items-center justify-between bg-[#131924]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1a2333] border border-[#2c3d59] flex items-center justify-center text-[#00f0a8]">
                  <Plus size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    Create New Track
                  </h2>
                  <p className="text-xs text-[#6e8099]">
                    Select either an Audio or Instrument track type to append to your project
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddTrackModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#18202d] hover:bg-[#253248] text-[#8e9eb5] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Primary Track Type Selection (Audio vs Instrument) */}
            <div className="p-4 bg-[#0d1118] border-b border-[#1c2436] grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedTrackKind('instrument');
                  setNewTrackName('Synth Lead Track');
                  setNewTrackColor('#00f0a8');
                  setAddTrackCategory('all');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedTrackKind === 'instrument'
                    ? 'bg-[#15232d] border-[#00f0a8] shadow-lg shadow-[#00f0a8]/10'
                    : 'bg-[#111622] border-[#222c3d] hover:border-[#33425b]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#1a2936] text-[#00f0a8] flex items-center justify-center">
                      <Music size={16} />
                    </div>
                    <span className="font-extrabold text-sm text-white">
                      Instrument Track
                    </span>
                  </div>
                  {selectedTrackKind === 'instrument' && (
                    <span className="text-[10px] bg-[#00f0a8] text-black font-extrabold px-2 py-0.5 rounded-full">
                      SELECTED
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#7586a0]">
                  Synths, FL Studio generators, African instruments (Inanga, Balafon, Kalimba), drum machines & PC VST plugins.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTrackKind('audio');
                  setNewTrackName('Vocal / Audio Track');
                  setNewTrackColor('#a855f7');
                  setAddTrackCategory('audio');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedTrackKind === 'audio'
                    ? 'bg-[#231730] border-[#a855f7] shadow-lg shadow-[#a855f7]/10'
                    : 'bg-[#111622] border-[#222c3d] hover:border-[#33425b]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#2d1b3e] text-[#a855f7] flex items-center justify-center">
                      <Mic size={16} />
                    </div>
                    <span className="font-extrabold text-sm text-white">
                      Audio Track
                    </span>
                  </div>
                  {selectedTrackKind === 'audio' && (
                    <span className="text-[10px] bg-[#a855f7] text-white font-extrabold px-2 py-0.5 rounded-full">
                      SELECTED
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#7586a0]">
                  Vocal recording lanes, audio stems, backing tracks, sound effects, and microphone inputs.
                </p>
              </button>
            </div>

            {/* Track Name & Color Configuration Strip */}
            <div className="p-3 bg-[#111622] border-b border-[#1e2738] flex flex-wrap gap-3 items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <span className="text-xs font-bold text-[#8e9eb5] whitespace-nowrap">
                  Track Name:
                </span>
                <input
                  type="text"
                  value={newTrackName}
                  onChange={(e) => setNewTrackName(e.target.value)}
                  placeholder="Enter track name..."
                  className="flex-1 bg-[#18202d] border border-[#27354a] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#00f0a8]"
                />
              </div>

              {/* Color Picker Swatches */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#8e9eb5]">Color:</span>
                {['#00f0a8', '#ff3b69', '#38bdf8', '#f59e0b', '#a855f7', '#10b981', '#ff6b4a'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewTrackColor(c)}
                    className={`w-5 h-5 rounded-full border transition-all ${
                      newTrackColor === c ? 'scale-125 border-white shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleCreateTrackFromDialog}
                className={`px-4 py-1.5 rounded-lg font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                  selectedTrackKind === 'audio'
                    ? 'bg-[#a855f7] hover:bg-[#ba68c8] text-white shadow-[#a855f7]/30'
                    : 'bg-[#00f0a8] hover:bg-[#34d399] text-black shadow-[#00f0a8]/30'
                }`}
              >
                <Plus size={14} />
                <span>Append Track to Project</span>
              </button>
            </div>

            {/* Category Filter Tabs & Search */}
            <div className="p-3 bg-[#111622] border-b border-[#1e2738] flex flex-wrap gap-2 items-center justify-between">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {[
                  { id: 'all', label: 'All Instruments' },
                  { id: 'synths', label: '🎹 Synths & VSTs' },
                  { id: 'drums', label: '🥁 Drum Racks' },
                  { id: 'african', label: '🌍 African Instruments' },
                  { id: 'audio', label: '🎙️ Audio & Vocals' },
                  { id: 'pc_vst', label: '💻 PC VSTs & Files' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setAddTrackCategory(cat.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      addTrackCategory === cat.id
                        ? 'bg-[#00f0a8] text-black font-extrabold shadow-sm'
                        : 'bg-[#18202d] text-[#8e9eb5] hover:text-white hover:bg-[#232d40]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="w-full sm:w-56">
                <input
                  type="text"
                  placeholder="Search instruments or VSTs..."
                  value={trackSearchQuery}
                  onChange={(e) => setTrackSearchQuery(e.target.value)}
                  className="w-full bg-[#18202d] border border-[#27354a] rounded-lg px-2.5 py-1 text-xs text-white placeholder-[#55657e] focus:outline-none focus:border-[#00f0a8]"
                />
              </div>
            </div>

            {/* Presets Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredVstOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleAddTrackFromPreset(opt)}
                  className="bg-[#141a26] hover:bg-[#1a2333] border border-[#212b3d] hover:border-[#00f0a8]/50 rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition-all group shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: opt.color }}
                        />
                        <span className="font-bold text-sm text-white group-hover:text-[#00f0a8] transition-colors">
                          {opt.name}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono-daw px-1.5 py-0.5 rounded bg-[#1c2638] text-[#8fa0b8] border border-[#2a384f] font-bold">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[#71829e] line-clamp-2">
                      {opt.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#1e2738] flex items-center justify-between">
                    <span className="text-[10px] text-[#55657e] font-mono-daw uppercase">
                      Track Type: {opt.type}
                    </span>
                    <button className="px-2.5 py-1 bg-[#1e2738] group-hover:bg-[#00f0a8] text-[#8e9eb5] group-hover:text-black font-bold text-xs rounded transition-all flex items-center gap-1">
                      <Plus size={12} />
                      <span>Add to Track List</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 bg-[#111622] border-t border-[#1e2738] flex items-center justify-between text-xs text-[#55657e]">
              <span>{filteredVstOptions.length} tracks & instruments available</span>
              <span>Click any preset to add to timeline</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
