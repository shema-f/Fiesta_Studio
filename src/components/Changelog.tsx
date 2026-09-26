/**
 * FIesta Studio - Changelog & Release Notes Component
 * Displays recent contributions, architecture updates, and feature history in a clean, scrollable interface.
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  GitCommit,
  Tag,
  Calendar,
  Layers,
  Grid,
  Music,
  Sliders,
  FolderOpen,
  Zap,
  Activity,
  CheckCircle2,
  Search,
  X,
  Copy,
  Check,
  HelpCircle,
  Keyboard,
  FileText,
  ArrowUpRight,
  Filter,
  Volume2,
  Cpu,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AppleLogo } from './AppleLogo';
import { ViewMode } from '../types/daw';

export interface ChangelogItem {
  id: string;
  title: string;
  category: 'Feature' | 'Audio Engine' | 'Sequencer' | 'UI & Controls' | 'Cultural' | 'Docs';
  description: string;
  highlights: string[];
  viewModeTarget?: ViewMode;
  targetButtonLabel?: string;
  badge?: string;
}

export interface ReleaseVersion {
  version: string;
  releaseDate: string;
  title: string;
  badge: string;
  isLatest?: boolean;
  summary: string;
  items: ChangelogItem[];
}

export const RELEASES_DATA: ReleaseVersion[] = [
  {
    version: '0.2.0',
    releaseDate: 'September 26, 2026',
    title: 'Track Provisioning Engine & Fruity Patterns Update',
    badge: 'Latest Release',
    isLatest: true,
    summary:
      'Major update introducing the interactive "Create New Track" provisioning modal, dual Instrument/Audio track provisioning, Fruity Loops pattern management and stamping, real-time swing quantization, and analog rotary knobs.',
    items: [
      {
        id: 'create-new-track',
        title: '"Create New Track" Modal & Track Provisioning Engine',
        category: 'Feature',
        badge: 'Major Feature',
        description:
          'Dedicated track creation engine accessible from anywhere in the arrangement view with tailored settings for synthesizers, virtual instruments, and live microphone recording.',
        highlights: [
          'Added dedicated "+ Create New Track" trigger buttons across Arrangement header, track list toolbar, and track list bottom.',
          'Dual Track Architecture Dialog: Select between Instrument Track (MIDI synth) and Audio Track (recording/stem timeline channel).',
          'Built-in Generator Selector: Sytrus FM, 3xOsc Synth, Rwandan Inanga Pluck, Amapiano Log Drum, Amayugi Shaker, Intore Royal Drums, Grand Piano, and Rhodes EP.',
          'Full visual customization with FL Studio inspired color tags, custom naming, and initial MIDI clip seeding.',
          'Automatic state synchronization to project.tracks and immediate focus to activeTrackId.',
        ],
        viewModeTarget: 'arrangement',
        targetButtonLabel: 'Open Timeline',
      },
      {
        id: 'fl-pattern-system',
        title: 'Fruity Loops Pattern Management System',
        category: 'Sequencer',
        badge: 'Beat Rack',
        description:
          'Complete pattern lifecycle manager in the Channel Rack with pattern selection, provisioning, duplication, and timeline arrangement stamping.',
        highlights: [
          'Pattern Control Bar integrated directly above the step sequencer grid in Channel Rack.',
          'Active pattern dropdown showing pattern name, index (Pattern 1, Pattern 2, etc.), and active step counts.',
          '+ New Pattern instant provisioning: generates isolated pattern layers with custom color palettes and appends to project.patterns.',
          'Pattern Cloning engine: clones all drum channel triggers, per-step velocities, and pitch shifts to new iterations.',
          'Timeline Pattern Stamping: single-click stamps the active pattern as a clip onto the multitrack timeline.',
          'Real-time state persistence: channel rack step toggles update the active pattern state in project store.',
        ],
        viewModeTarget: 'channelRack',
        targetButtonLabel: 'Open Beat Rack',
      },
      {
        id: 'swing-quantization',
        title: 'Dynamic Groove & Swing Quantization',
        category: 'Audio Engine',
        badge: 'Web Audio DSP',
        description:
          'Hardware-grade swing percentage slider integrated into both TransportBar and ChannelRack, driving true odd-16th step shuffle delays directly into the audio scheduler.',
        highlights: [
          'Bilateral control: adjust swing from TransportBar or ChannelRack with immediate bi-directional synchronization.',
          'Direct Web Audio Scheduler hookup: audioEngine.setSwing() computes microsecond shuffle offsets on odd 16th steps.',
          'Preset cycling: click the percentage readout to jump between 0% (straight), 25% (subtle), 50% (Amapiano groove), and 75% (heavy shuffle).',
          'Double-click slider to instantly reset to 0% straight timing.',
        ],
        viewModeTarget: 'channelRack',
        targetButtonLabel: 'Test Swing',
      },
      {
        id: 'fruity-knobs-controls',
        title: 'High-Precision Rotary Knobs & LED Indicator Lamps',
        category: 'UI & Controls',
        badge: 'Hardware Polish',
        description:
          'Photorealistic analog knob component (FruityKnob) and retro studio LED indicators for mixer routing, panning, volume, and per-step graph editing.',
        highlights: [
          'Rotary dials with center detents, angular pointer lines, and numeric floating tooltips for pan and volume.',
          'Authentic green and red LED mute and solo lamps with glowing lens illumination.',
          'Mixer Track Routing with digital LCD readout for direct channel-to-bus assignments.',
          'Per-step Graph Editor for velocity, pitch transpose, stereo pan, and filter cutoffs.',
          'PC VST Generator and Sample Hub integration with Sytrus FM, 3xOsc, Harmless, and custom sample importer.',
        ],
        viewModeTarget: 'mixer',
        targetButtonLabel: 'Open Mixer',
      },
      {
        id: 'docs-architecture',
        title: 'Architecture Guide & System Specifications',
        category: 'Docs',
        badge: 'Documentation',
        description:
          'Comprehensive technical documentation covering track lifecycle provisioning, pattern data models, audio engine scheduler lookahead, and state persistence.',
        highlights: [
          'New docs/architecture/track-and-pattern-system.md document detailing the state flow between ProjectState, ChannelRack, and AudioEngine.',
          'Full CHANGELOG.md updated following Keep a Changelog standard and Semantic Versioning (v0.2.0).',
          'Open-source contribution guidelines and code architecture diagrams.',
        ],
      },
    ],
  },
  {
    version: '0.1.0',
    releaseDate: 'September 23, 2026',
    title: 'Initial Public Release & Web Audio DSP Foundation',
    badge: 'First Release',
    summary:
      'The initial release of FIesta Studio, bringing a full-fledged digital audio workstation into the browser with zero native plugins required.',
    items: [
      {
        id: 'web-audio-core',
        title: 'Native 32-Bit Floating Point Audio Engine',
        category: 'Audio Engine',
        badge: 'DSP Core',
        description:
          'High-performance Web Audio engine designed for professional latency (< 5ms) and drift-free scheduling.',
        highlights: [
          '25ms lookahead precision step scheduler drift-free audio clock.',
          'Sub-bus routing graph: Tracks -> Bus Groups (Drums, Vocals, Instruments) -> Master -> Brickwall Limiter.',
          '32-bit floating point internal DSP mixing bus for maximum dynamic range and headroom.',
          'Offline audio rendering pipeline (OfflineAudioContext) supporting WAV export in 16-bit, 24-bit PCM, and 32-bit float.',
        ],
      },
      {
        id: 'channel-rack-v1',
        title: 'FIesta Channel Rack & Drum Sequencer',
        category: 'Sequencer',
        badge: 'Drum Sequencer',
        description:
          '16 and 32-step polyrhythmic step sequencer inspired by Fruity Loops with modern velocity control.',
        highlights: [
          '16 and 32-step polyrhythmic drum grid with 4-beat color grouping.',
          'Built-in acoustic drum voices: Kick, Snare, Clap, Closed/Open Hats, 808 Sub Boom, and Rimshot.',
          'Authentic African percussion: Amapiano Log Drum, Amayugi Shaker, Intore Royal Drums.',
          'Instant genre groove presets for Amapiano, Afrobeats, and Trap.',
        ],
        viewModeTarget: 'channelRack',
        targetButtonLabel: 'Beat Rack',
      },
      {
        id: 'piano-roll-v1',
        title: 'Interactive MIDI Piano Roll & Chord Assistant',
        category: 'Feature',
        badge: 'MIDI Editor',
        description:
          'Full-featured 88-key interactive note editor with microtonal scale highlighting and chord builder.',
        highlights: [
          '88-key interactive note grid with playable virtual preview keyboard.',
          'Scale highlights: Natural Minor, Major, Pentatonic, Blues, Dorian, and authentic Rwandan Inanga pentatonic scale.',
          'Chord Assistant (Amapiano Min9, Maj7, Dom7, 9th chords), note velocity editing, and humanization.',
          'Standard MIDI file (.mid) export.',
        ],
        viewModeTarget: 'pianoRoll',
        targetButtonLabel: 'Piano Roll',
      },
      {
        id: 'mixer-and-fx',
        title: 'Mixer Console & Studio Insert Effects Rack',
        category: 'UI & Controls',
        badge: 'Audio Mixing',
        description:
          'Professional mixer console with calibrated faders, real-time VU meters, and studio insert effects.',
        highlights: [
          'dB calibrated channel faders (-inf to +6 dB) with stereo pan and solo/mute busing.',
          'Real-time dual-channel peak/RMS VU meters and FFT master spectrum analyzer.',
          '3-Band Parametric EQ with interactive frequency curve visualization.',
          'VCA Bus Compressor with threshold, ratio, attack, release, and gain-reduction meter.',
          'Algorithmic Hall Reverb and tempo-synced Stereo Ping-Pong Delay.',
        ],
        viewModeTarget: 'mixer',
        targetButtonLabel: 'Mixer',
      },
      {
        id: 'african-sound-hub',
        title: 'African & Rwandan Sound Hub',
        category: 'Cultural',
        badge: 'Cultural Heritage',
        description:
          'Curated library of cultural instruments recorded with authentic acoustic provenance.',
        highlights: [
          'Rwandan Inanga plucks, Amayugi shakers, and Intore royal drums.',
          'Strict license provenance metadata (CC0, Royalty-Free) on all sound assets.',
          'Live waveform auditioning with instantaneous Web Audio playback.',
          'Custom audio file upload (WAV, MP3, OGG) with local decoding.',
        ],
        viewModeTarget: 'sampleHub',
        targetButtonLabel: 'Sound Hub',
      },
      {
        id: 'gemini-co-producer',
        title: 'FIesta AI Co-Producer Engine',
        category: 'Feature',
        badge: 'AI Music Assistant',
        description:
          'Generative music assistant powered by Google Gemini for chord progressions, drum patterns, and arrangements.',
        highlights: [
          'Generates structured drum patterns, chords, and arrangement outlines tailored to BPM and genre.',
          'Single-click "Apply to Project" automation that populates the Channel Rack and Timeline.',
          'Full-featured chat and production ideas assistant.',
        ],
        viewModeTarget: 'aiAssistant',
        targetButtonLabel: 'AI Co-Producer',
      },
      {
        id: 'governance-docs',
        title: 'Open-Source Governance & Community Specs',
        category: 'Docs',
        badge: 'Open Source',
        description:
          'Complete repository governance documents adhering to Apache 2.0 open-source standards.',
        highlights: [
          'Apache 2.0 license, NOTICE, TRADEMARKS.md, CREDITS.md, GOVERNANCE.md, CONTRIBUTING.md, and SECURITY.md.',
          'Command Palette (Ctrl+K / Cmd+K) for fast keyboard navigation.',
        ],
      },
    ],
  },
];

const SHORTCUTS_DATA = [
  { key: 'Space', desc: 'Start or Pause Playback' },
  { key: 'Enter', desc: 'Stop Playback & Rewind to Start' },
  { key: 'R', desc: 'Toggle Microphone Audio Recording' },
  { key: 'Ctrl + Z / ⌘Z', desc: 'Undo last project edit' },
  { key: 'Ctrl + Shift + Z / ⌘Y', desc: 'Redo previously undone edit' },
  { key: 'Ctrl + S / ⌘S', desc: 'Save project locally into browser vault' },
  { key: 'Ctrl + K / ⌘K', desc: 'Open Universal Command Palette' },
  { key: '1', desc: 'Switch to Multitrack Arrangement Timeline' },
  { key: '2', desc: 'Switch to Beat Rack / Step Sequencer' },
  { key: '3', desc: 'Switch to MIDI Piano Roll' },
  { key: '4', desc: 'Switch to Mixer Console' },
  { key: '5', desc: 'Switch to Virtual Synthesizers & Instruments' },
  { key: '6', desc: 'Switch to African Sound Hub & Sample Importer' },
  { key: '7', desc: 'Switch to FIesta AI Co-Producer' },
];

interface ChangelogProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView?: (view: ViewMode) => void;
  initialTab?: 'changelog' | 'help';
}

export const Changelog: React.FC<ChangelogProps> = ({
  isOpen,
  onClose,
  onNavigateView,
  initialTab = 'changelog',
}) => {
  const [activeTab, setActiveTab] = useState<'changelog' | 'help'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    'create-new-track': true,
    'fl-pattern-system': true,
    'swing-quantization': true,
  });

  // Filter categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    RELEASES_DATA.forEach((r) => r.items.forEach((i) => set.add(i.category)));
    return ['all', ...Array.from(set)];
  }, []);

  // Filtered releases
  const filteredReleases = useMemo(() => {
    return RELEASES_DATA.map((rel) => {
      // Filter by version
      if (selectedVersion !== 'all' && rel.version !== selectedVersion) {
        return null;
      }

      const matchingItems = rel.items.filter((item) => {
        // Filter by category
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        // Filter by search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesHighlights = item.highlights.some((h) => h.toLowerCase().includes(q));
        const matchesCat = item.category.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesHighlights || matchesCat;
      });

      if (matchingItems.length === 0 && searchQuery.trim()) {
        return null;
      }

      return {
        ...rel,
        items: matchingItems,
      };
    }).filter(Boolean) as ReleaseVersion[];
  }, [selectedVersion, selectedCategory, searchQuery]);

  const toggleItemExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyMarkdown = () => {
    const summary = `# FIesta Studio - Recent Contributions & Changelog\n\n` +
      RELEASES_DATA.map(
        (r) =>
          `## [${r.version}] - ${r.releaseDate}\n${r.summary}\n\n` +
          r.items
            .map(
              (item) =>
                `### ${item.title} (${item.category})\n${item.description}\n` +
                item.highlights.map((h) => `- ${h}`).join('\n')
            )
            .join('\n\n')
      ).join('\n\n---\n\n');

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn select-none p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-[#10141d] border border-[#263246] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#cbd5e1] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00f0a8]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#ff3b69]/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. MODAL HEADER */}
        <div className="px-6 py-4 border-b border-[#1f293a] bg-[#141a26]/90 flex items-center justify-between shrink-0 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#0b0e14] border border-[#2b394e] p-1.5 flex items-center justify-center shadow-inner">
              <AppleLogo size={28} variant="neon" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white tracking-wide font-mono-daw">
                  FIesta Studio <span className="text-[#00f0a8]">Changelog</span>
                </h2>
                <span className="text-[10px] bg-[#00f0a8]/20 border border-[#00f0a8]/50 text-[#00f0a8] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0a8] animate-pulse" />
                  <span>v0.2.0 Current</span>
                </span>
              </div>
              <p className="text-xs text-[#8092a8]">
                Recent contributions, audio engine upgrades, and feature release notes.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Tab switchers: Changelog vs Help & Shortcuts */}
            <div className="flex bg-[#0b0e14] border border-[#222c3d] p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setActiveTab('changelog')}
                className={`px-3 py-1 rounded-md font-semibold flex items-center space-x-1.5 transition-all ${
                  activeTab === 'changelog'
                    ? 'bg-[#1e2738] text-white shadow-xs'
                    : 'text-[#7d8fa7] hover:text-white'
                }`}
              >
                <GitCommit size={13} className="text-[#00f0a8]" />
                <span>Changelog</span>
              </button>
              <button
                onClick={() => setActiveTab('help')}
                className={`px-3 py-1 rounded-md font-semibold flex items-center space-x-1.5 transition-all ${
                  activeTab === 'help'
                    ? 'bg-[#1e2738] text-white shadow-xs'
                    : 'text-[#7d8fa7] hover:text-white'
                }`}
              >
                <HelpCircle size={13} className="text-[#ff3b69]" />
                <span>Help & Keys</span>
              </button>
            </div>

            {/* Copy Markdown Button */}
            <button
              onClick={handleCopyMarkdown}
              title="Copy changelog summary to clipboard"
              className="p-2 rounded-lg bg-[#0b0e14] hover:bg-[#1b2332] text-[#8ea0b8] hover:text-white border border-[#222c3d] transition-colors"
            >
              {copiedSummary ? (
                <Check size={16} className="text-[#00f0a8]" />
              ) : (
                <Copy size={16} />
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              title="Close (Esc)"
              className="p-2 rounded-lg bg-[#0b0e14] hover:bg-[#ff3b69]/20 text-[#8ea0b8] hover:text-[#ff3b69] border border-[#222c3d] hover:border-[#ff3b69]/40 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 2. TAB 1: CHANGELOG VIEW */}
        {activeTab === 'changelog' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter & Search Bar */}
            <div className="px-6 py-3 border-b border-[#1b2332] bg-[#0d1118]/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Search Box */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={14} className="absolute left-3 top-2.5 text-[#5e7189]" />
                <input
                  type="text"
                  placeholder="Search contributions, tracks, synths, swing..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#131924] border border-[#222c3e] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#5e7189] focus:outline-none focus:border-[#00f0a8] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-[#5e7189] hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Version & Category Filters */}
              <div className="flex items-center space-x-2 overflow-x-auto text-xs">
                {/* Version Selector */}
                <div className="flex items-center space-x-1 bg-[#131924] border border-[#222c3e] p-0.5 rounded-lg">
                  <button
                    onClick={() => setSelectedVersion('all')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                      selectedVersion === 'all'
                        ? 'bg-[#222d40] text-white'
                        : 'text-[#708299] hover:text-white'
                    }`}
                  >
                    All Releases
                  </button>
                  <button
                    onClick={() => setSelectedVersion('0.2.0')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                      selectedVersion === '0.2.0'
                        ? 'bg-[#222d40] text-[#00f0a8]'
                        : 'text-[#708299] hover:text-white'
                    }`}
                  >
                    v0.2.0 (Latest)
                  </button>
                  <button
                    onClick={() => setSelectedVersion('0.1.0')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                      selectedVersion === '0.1.0'
                        ? 'bg-[#222d40] text-[#38bdf8]'
                        : 'text-[#708299] hover:text-white'
                    }`}
                  >
                    v0.1.0
                  </button>
                </div>

                {/* Category Pills */}
                <div className="flex items-center space-x-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        selectedCategory === cat
                          ? 'bg-[#00f0a8]/20 text-[#00f0a8] border border-[#00f0a8]/40'
                          : 'bg-[#131924] text-[#708299] hover:text-white border border-[#222c3e]'
                      }`}
                    >
                      {cat === 'all' ? 'All Tags' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="px-6 py-2.5 bg-[#090c12] border-b border-[#18202d] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs shrink-0">
              <div className="flex items-center space-x-2 text-[#7f91a8]">
                <Sparkles size={13} className="text-[#00f0a8]" />
                <span>
                  <strong className="text-white font-mono-daw">25+</strong> Key Capabilities
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[#7f91a8]">
                <Cpu size={13} className="text-[#38bdf8]" />
                <span>
                  <strong className="text-white font-mono-daw">32-Bit</strong> Floating Point DSP
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[#7f91a8]">
                <Zap size={13} className="text-[#f59e0b]" />
                <span>
                  <strong className="text-white font-mono-daw">8+</strong> Built-in Synths
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[#7f91a8]">
                <CheckCircle2 size={13} className="text-[#a855f7]" />
                <span>
                  <strong className="text-white font-mono-daw">100%</strong> In-Browser Engine
                </span>
              </div>
            </div>

            {/* Scrollable Changelog Timeline Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-thin">
              {filteredReleases.length === 0 ? (
                <div className="py-16 text-center text-[#6e8098]">
                  <Search size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold text-white">No contributions found</p>
                  <p className="text-xs mt-1">Try searching for other terms or resetting the filter tags.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedVersion('all');
                    }}
                    className="mt-3 px-3 py-1.5 bg-[#1b2332] text-[#00f0a8] rounded-lg text-xs font-bold hover:bg-[#232e42] transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredReleases.map((release) => (
                  <div key={release.version} className="relative">
                    {/* Release Header Banner */}
                    <div className="sticky top-0 z-10 bg-[#10141d]/95 backdrop-blur-sm py-2 border-b border-[#222d3e] flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-[#182130] border border-[#2d3b52] flex items-center justify-center">
                          <Tag size={15} className="text-[#00f0a8]" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-base font-black text-white font-mono-daw">
                              Version {release.version}
                            </h3>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                release.isLatest
                                  ? 'bg-[#00f0a8]/20 text-[#00f0a8] border border-[#00f0a8]/40'
                                  : 'bg-[#222d40] text-[#8e9eb5]'
                              }`}
                            >
                              {release.badge}
                            </span>
                          </div>
                          <span className="text-xs text-[#6e8098] flex items-center space-x-1">
                            <Calendar size={11} />
                            <span>Released {release.releaseDate}</span>
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono-daw text-[#5c6e85]">
                        {release.items.length} {release.items.length === 1 ? 'module' : 'modules'}
                      </span>
                    </div>

                    {/* Release Summary Text */}
                    <p className="text-xs text-[#9fb0c5] mb-4 bg-[#141b26] p-3 rounded-xl border border-[#202a3a] leading-relaxed">
                      {release.summary}
                    </p>

                    {/* Timeline Contributions Cards */}
                    <div className="space-y-4 ml-2 pl-4 border-l-2 border-[#1f293b] relative">
                      {release.items.map((item) => {
                        const isExpanded = !!expandedItems[item.id];
                        return (
                          <div
                            key={item.id}
                            className="bg-[#131924] border border-[#212b3b] hover:border-[#2f3d54] rounded-xl p-4 transition-all relative group"
                          >
                            {/* Timeline bullet dot */}
                            <div className="absolute -left-[23px] top-4 w-3 h-3 rounded-full bg-[#1e2738] border-2 border-[#00f0a8] group-hover:scale-125 transition-transform" />

                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                                  <span className="text-sm font-bold text-white tracking-wide">
                                    {item.title}
                                  </span>
                                  <span className="text-[10px] bg-[#1a2332] text-[#38bdf8] font-semibold px-2 py-0.5 rounded border border-[#2b3a50]">
                                    {item.category}
                                  </span>
                                  {item.badge && (
                                    <span className="text-[9px] bg-[#ff3b69]/15 text-[#ff3b69] font-bold px-1.5 py-0.2 rounded border border-[#ff3b69]/30">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#8da0b8] leading-relaxed">
                                  {item.description}
                                </p>
                              </div>

                              <div className="flex items-center space-x-2 shrink-0">
                                {/* Navigation Action Button (if applicable) */}
                                {item.viewModeTarget && onNavigateView && (
                                  <button
                                    onClick={() => {
                                      onNavigateView(item.viewModeTarget!);
                                      onClose();
                                    }}
                                    className="px-2.5 py-1 bg-[#1c2536] hover:bg-[#00f0a8] hover:text-[#0b0e14] text-[#00f0a8] rounded-md text-[11px] font-bold flex items-center space-x-1 border border-[#2b3a50] transition-colors"
                                    title={`Switch directly to ${item.targetButtonLabel || item.viewModeTarget}`}
                                  >
                                    <span>{item.targetButtonLabel || 'Jump to View'}</span>
                                    <ArrowUpRight size={12} />
                                  </button>
                                )}

                                {/* Expand/Collapse toggle */}
                                <button
                                  onClick={() => toggleItemExpand(item.id)}
                                  className="p-1 rounded text-[#64748b] hover:text-white transition-colors"
                                  title={isExpanded ? 'Collapse highlights' : 'Expand highlights'}
                                >
                                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                              </div>
                            </div>

                            {/* Detailed Feature Highlights List */}
                            {isExpanded && item.highlights.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-[#1c2433]">
                                <span className="text-[10px] font-mono-daw uppercase tracking-wider text-[#63768f] font-bold block mb-1.5">
                                  Key Contributions & Deliverables:
                                </span>
                                <ul className="space-y-1.5">
                                  {item.highlights.map((highlight, idx) => (
                                    <li
                                      key={idx}
                                      className="text-xs text-[#b8c7db] flex items-start space-x-2"
                                    >
                                      <CheckCircle2
                                        size={13}
                                        className="text-[#00f0a8] shrink-0 mt-0.5"
                                      />
                                      <span className="leading-snug">{highlight}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 3. TAB 2: HELP & KEYBOARD SHORTCUTS GUIDE */}
        {activeTab === 'help' && (
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div>
              <h3 className="text-base font-black text-white flex items-center space-x-2 font-mono-daw">
                <Keyboard size={18} className="text-[#00f0a8]" />
                <span>DAW Keyboard Shortcuts</span>
              </h3>
              <p className="text-xs text-[#7d8fa7] mt-1">
                Boost your music production speed with direct key bindings for transport, views, and track operations.
              </p>
            </div>

            {/* Shortcuts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SHORTCUTS_DATA.map((sc, i) => (
                <div
                  key={i}
                  className="bg-[#131924] border border-[#212b3b] rounded-lg p-2.5 flex items-center justify-between text-xs"
                >
                  <span className="text-[#cbd5e1] font-medium">{sc.desc}</span>
                  <kbd className="bg-[#0b0e14] border border-[#2a364a] text-[#00f0a8] px-2 py-0.5 rounded font-mono-daw font-bold text-[11px] shadow-inner ml-2 shrink-0">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>

            {/* Quick Architecture References */}
            <div className="bg-[#141b26] border border-[#222d3e] rounded-xl p-4 mt-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono-daw flex items-center space-x-2 mb-2">
                <FileText size={14} className="text-[#38bdf8]" />
                <span>Architecture & Contribution Docs</span>
              </h4>
              <p className="text-xs text-[#8fa0b5] leading-relaxed">
                Full technical guides, signal chains, pattern storage mechanics, and contribution guidelines are maintained in the repository:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="bg-[#0b0e14] px-2.5 py-1 rounded text-[11px] font-mono-daw text-[#00f0a8] border border-[#202b3d]">
                  /CHANGELOG.md
                </span>
                <span className="bg-[#0b0e14] px-2.5 py-1 rounded text-[11px] font-mono-daw text-[#38bdf8] border border-[#202b3d]">
                  /docs/architecture/track-and-pattern-system.md
                </span>
                <span className="bg-[#0b0e14] px-2.5 py-1 rounded text-[11px] font-mono-daw text-[#f59e0b] border border-[#202b3d]">
                  /CONTRIBUTING.md
                </span>
                <span className="bg-[#0b0e14] px-2.5 py-1 rounded text-[11px] font-mono-daw text-[#ec4899] border border-[#202b3d]">
                  /LICENSE (Apache-2.0)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. MODAL FOOTER */}
        <div className="px-6 py-3 border-t border-[#1f293a] bg-[#121722] flex items-center justify-between text-xs shrink-0 select-none">
          <div className="flex items-center space-x-2 text-[#64748b]">
            <AppleLogo size={14} variant="neon" />
            <span className="font-mono-daw text-[11px]">
              FIesta Studio • Ferrivox Open-Source Audio
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-lg bg-[#182130] hover:bg-[#202b3d] text-[#c5d3e6] border border-[#2a384e] transition-colors font-medium flex items-center space-x-1.5"
            >
              {copiedSummary ? (
                <>
                  <Check size={12} className="text-[#00f0a8]" />
                  <span className="text-[#00f0a8]">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy Notes</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#00f0a8] hover:bg-[#00f0a8]/90 text-[#0b0e14] font-black rounded-lg transition-colors shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
