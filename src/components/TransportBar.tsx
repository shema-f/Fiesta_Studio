/**
 * FIesta Studio - Top Transport Header
 * Playback controls, Tempo, Time signature, Metronome, Master Meter, Undo/Redo,
 * View toggles, and Project Management.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  Repeat,
  Volume2,
  VolumeX,
  Undo2,
  Redo2,
  Save,
  Download,
  Search,
  Sparkles,
  Sliders,
  Music,
  Grid,
  Layers,
  FolderOpen,
  Mic,
  Activity,
  Cpu,
  Shuffle,
} from 'lucide-react';
import { ProjectState } from '../engine/projectStore';
import { audioEngine } from '../audio/audioEngine';
import { ViewMode } from '../types/daw';

import { AppleLogo } from './AppleLogo';

export const MetronomeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 13, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 21h12" />
    <path d="M7.5 21 11 3h2l3.5 18" />
    <path d="m14 8-7 6" />
    <circle cx="12" cy="14" r="1.5" fill="currentColor" />
  </svg>
);

interface TransportBarProps {
  project: ProjectState;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
  onTogglePlay: () => void;
  onStop: () => void;
  onToggleRecord: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onOpenExport: () => void;
  onOpenCommandPalette: () => void;
  onOpenSplash?: () => void;
}

export const TransportBar: React.FC<TransportBarProps> = ({
  project,
  onUpdateProject,
  onTogglePlay,
  onStop,
  onToggleRecord,
  onUndo,
  onRedo,
  onSave,
  onOpenExport,
  onOpenCommandPalette,
  onOpenSplash,
}) => {
  const [isEditingBpm, setIsEditingBpm] = useState(false);
  const [bpmInput, setBpmInput] = useState(project.bpm.toString());
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(project.name);
  const [isMetronomePopOpen, setIsMetronomePopOpen] = useState(false);
  const metronomePopRef = useRef<HTMLDivElement>(null);
  const meterCanvasRef = useRef<HTMLCanvasElement>(null);

  // Close metronome popover when clicking outside
  useEffect(() => {
    if (!isMetronomePopOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (metronomePopRef.current && !metronomePopRef.current.contains(e.target as Node)) {
        setIsMetronomePopOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMetronomePopOpen]);

  const metronomeVol = typeof project.metronomeVolume === 'number' ? project.metronomeVolume : 0.75;
  const metronomePercent = Math.round(metronomeVol * 100);
  const isBeatStep = project.current16thStep % 4 === 0;

  const handleToggleMetronome = () => {
    const next = !project.metronome;
    if (next) {
      audioEngine.init().catch(console.error);
    }
    onUpdateProject((p) => ({ ...p, metronome: next }));
    audioEngine.setMetronome(next);
  };

  const handleMetronomeVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, Math.round(newVol * 100) / 100));
    onUpdateProject((p) => ({ ...p, metronomeVolume: clamped }));
    audioEngine.setMetronomeVolume(clamped);
  };

  const handleTestClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playMetronomeAudition();
  };

  const handleVolumeWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    handleMetronomeVolumeChange(metronomeVol + delta);
  };

  // Animate master meter
  useEffect(() => {
    let animId: number;
    const canvas = meterCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.getMasterAnalyser();
    const dataArray = new Uint8Array(analyser ? analyser.frequencyBinCount : 32);

    const render = () => {
      animId = requestAnimationFrame(render);
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      let peakL = 0;
      let peakR = 0;

      if (analyser && project.isPlaying) {
        analyser.getByteFrequencyData(dataArray);
        // Average low/mid/high to get a responsive stereo VU approximation
        for (let i = 0; i < dataArray.length / 2; i++) {
          peakL += dataArray[i];
        }
        for (let i = Math.floor(dataArray.length / 2); i < dataArray.length; i++) {
          peakR += dataArray[i];
        }
        peakL = Math.min(1.0, (peakL / (dataArray.length / 2) / 255) * 1.4);
        peakR = Math.min(1.0, (peakR / (dataArray.length / 2) / 255) * 1.35);
      }

      // Draw Left Bar
      const barH = 5;
      const fillL = peakL * width;
      const fillR = peakR * width;

      // Left Channel
      ctx.fillStyle = '#181f2a';
      ctx.fillRect(0, 2, width, barH);
      if (fillL > 0) {
        const gradL = ctx.createLinearGradient(0, 0, width, 0);
        gradL.addColorStop(0, '#00f0a8');
        gradL.addColorStop(0.7, '#f59e0b');
        gradL.addColorStop(1.0, '#ff3b69');
        ctx.fillStyle = gradL;
        ctx.fillRect(0, 2, fillL, barH);
      }

      // Right Channel
      ctx.fillStyle = '#181f2a';
      ctx.fillRect(0, 9, width, barH);
      if (fillR > 0) {
        const gradR = ctx.createLinearGradient(0, 0, width, 0);
        gradR.addColorStop(0, '#00f0a8');
        gradR.addColorStop(0.7, '#f59e0b');
        gradR.addColorStop(1.0, '#ff3b69');
        ctx.fillStyle = gradR;
        ctx.fillRect(0, 9, fillR, barH);
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [project.isPlaying]);

  const handleBpmSubmit = () => {
    const val = parseInt(bpmInput, 10);
    if (!isNaN(val) && val >= 40 && val <= 280) {
      onUpdateProject((p) => ({ ...p, bpm: val }));
      audioEngine.setBpm(val);
    } else {
      setBpmInput(project.bpm.toString());
    }
    setIsEditingBpm(false);
  };

  const handleNameSubmit = () => {
    if (nameInput.trim()) {
      onUpdateProject((p) => ({ ...p, name: nameInput.trim() }));
    }
    setIsEditingName(false);
  };

  const setView = (mode: ViewMode) => {
    onUpdateProject((p) => ({ ...p, viewMode: mode }));
  };

  return (
    <header className="h-14 bg-[#0d1015] border-b border-[#1f2633] px-3 flex items-center justify-between select-none z-30 shrink-0">
      {/* LEFT: Brand Logo & Project Title */}
      <div className="flex items-center space-x-3">
        <div
          className="flex items-center space-x-2 group cursor-pointer"
          onClick={() => (onOpenSplash ? onOpenSplash() : setView('arrangement'))}
          title="Click to open FIesta Studio / Ferrivox Info & Splash"
        >
          {/* Fruit / Apple Brand Badge */}
          <div className="w-8 h-8 rounded-lg bg-[#141822] border border-[#2b3548] p-0.5 shadow-sm flex items-center justify-center hover:border-[#00f0a8] transition-colors">
            <AppleLogo size={24} variant="neon" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-wider text-white flex items-center gap-1 font-mono-daw group-hover:text-[#00f0a8] transition-colors">
              FIesta <span className="text-[#00f0a8] font-bold">STUDIO</span>
              <span className="text-[9px] bg-[#1a2230] text-[#00f0a8] px-1 py-0.2 rounded border border-[#26354a]">
                PRO
              </span>
            </span>
            {isEditingName ? (
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                autoFocus
                className="bg-[#181f2b] text-white text-[11px] px-1 rounded outline-none border border-[#00f0a8] w-40"
              />
            ) : (
              <span
                onClick={() => {
                  setNameInput(project.name);
                  setIsEditingName(true);
                }}
                className="text-[11px] text-[#8e9eb5] hover:text-white cursor-pointer truncate max-w-[130px] md:max-w-[180px]"
                title="Click to rename project"
              >
                {project.name}
              </span>
            )}
          </div>
        </div>

        {/* Undo / Redo / Save Buttons */}
        <div className="hidden sm:flex items-center space-x-1 border-l border-[#1f2633] pl-2">
          <button
            onClick={onUndo}
            disabled={project.past.length === 0}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded hover:bg-[#181d26] text-[#8a99ad] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={onRedo}
            disabled={project.future.length === 0}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded hover:bg-[#181d26] text-[#8a99ad] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Redo2 size={14} />
          </button>
          <button
            onClick={onSave}
            title="Save Project (Autosaved locally)"
            className="p-1.5 rounded hover:bg-[#181d26] text-[#8a99ad] hover:text-[#00f0a8] transition-colors flex items-center space-x-1"
          >
            <Save size={14} />
            <span className="text-[10px] text-[#4b586e] hidden md:inline">Saved</span>
          </button>
        </div>
      </div>

      {/* CENTER: Audio Transport (Play, Stop, Record, BPM, Metronome) */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Playhead Time Counter in Bars:Beats:16ths */}
        <div className="bg-[#090b0e] border border-[#1f2633] px-2.5 py-1 rounded text-center font-mono-daw min-w-[70px] shadow-inner">
          <span className="text-[9px] text-[#55657e] block leading-none">BAR : BEAT</span>
          <span className="text-xs font-bold text-[#00f0a8] tracking-widest">
            {String(Math.floor(project.playheadBar)).padStart(2, '0')} :{' '}
            {String(Math.floor(((project.playheadBar % 1) * 4) + 1)).padStart(2, '0')}
          </span>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center bg-[#131720] border border-[#222936] p-0.5 rounded-lg shadow-sm">
          {/* Record button */}
          <button
            onClick={onToggleRecord}
            title="Record Microphone / Audio (R)"
            className={`p-2 rounded-md transition-all ${
              project.isRecording
                ? 'bg-[#ff3b69] text-white shadow-lg shadow-[#ff3b69]/40 animate-pulse'
                : 'text-[#8a99ad] hover:text-[#ff3b69] hover:bg-[#1a202c]'
            }`}
          >
            <Mic size={15} />
          </button>

          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            title="Play / Pause (Space)"
            className={`px-3 py-1.5 rounded-md font-bold flex items-center space-x-1 transition-all ${
              project.isPlaying
                ? 'bg-[#00f0a8] text-[#0b0d11] shadow-lg shadow-[#00f0a8]/30'
                : 'bg-[#1e2633] text-white hover:bg-[#283244]'
            }`}
          >
            {project.isPlaying ? <Pause size={15} /> : <Play size={15} className="fill-current" />}
          </button>

          {/* Stop */}
          <button
            onClick={onStop}
            title="Stop playback"
            className="p-2 rounded-md text-[#8a99ad] hover:text-white hover:bg-[#1a202c] transition-colors"
          >
            <Square size={14} className="fill-current" />
          </button>

          {/* Loop Mode */}
          <button
            onClick={() => onUpdateProject((p) => ({ ...p, isLooping: !p.isLooping }))}
            title={`Loop Mode (${project.isLooping ? 'Enabled' : 'Disabled'})`}
            className={`p-2 rounded-md transition-colors ${
              project.isLooping ? 'text-[#00f0a8] bg-[#00f0a8]/10' : 'text-[#5a677d] hover:text-white'
            }`}
          >
            <Repeat size={14} />
          </button>
        </div>

        {/* BPM & Metronome Display */}
        <div className="flex items-center space-x-1.5 bg-[#131720] border border-[#222936] px-2 py-1 rounded-lg">
          {/* BPM */}
          <div className="flex items-center space-x-1">
            <span className="text-[10px] text-[#5e6f88] font-bold">BPM</span>
            {isEditingBpm ? (
              <input
                type="number"
                value={bpmInput}
                onChange={(e) => setBpmInput(e.target.value)}
                onBlur={handleBpmSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleBpmSubmit()}
                autoFocus
                className="w-12 bg-[#090b0e] text-[#00f0a8] font-mono-daw text-xs font-bold text-center rounded outline-none border border-[#00f0a8]"
              />
            ) : (
              <span
                onClick={() => {
                  setBpmInput(project.bpm.toString());
                  setIsEditingBpm(true);
                }}
                className="font-mono-daw text-xs font-bold text-[#00f0a8] cursor-pointer hover:bg-[#1a2230] px-1 rounded transition-colors"
                title="Click to edit BPM"
              >
                {project.bpm}
              </span>
            )}
          </div>

          <div className="w-[1px] h-3.5 bg-[#252d3d]" />

          {/* Metronome Controls Container (Toggle + Volume) */}
          <div className="relative flex items-center" ref={metronomePopRef}>
            <div className="flex items-center bg-[#090b0e] border border-[#222936] rounded-md p-0.5 shadow-inner">
              {/* Metronome Toggle Button */}
              <button
                onClick={handleToggleMetronome}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setIsMetronomePopOpen((prev) => !prev);
                }}
                title={`Metronome (${project.metronome ? 'ON' : 'OFF'}) • Click on every beat (Right-click for volume)`}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono-daw transition-all flex items-center space-x-1 ${
                  project.metronome
                    ? 'bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/50 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                    : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-[#141a24]'
                }`}
              >
                <MetronomeIcon
                  size={12}
                  className={
                    project.metronome
                      ? isBeatStep && project.isPlaying
                        ? 'text-white scale-110 transition-transform'
                        : 'text-[#fbbf24]'
                      : 'text-[#64748b]'
                  }
                />
                <span className="hidden sm:inline font-black tracking-wide">MET</span>
                {/* Active Beat LED Indicator */}
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-75 ${
                    project.metronome
                      ? project.isPlaying && isBeatStep
                        ? 'bg-white shadow-[0_0_8px_#ffffff] scale-125'
                        : 'bg-[#fbbf24] shadow-[0_0_4px_#f59e0b]'
                      : 'bg-[#334155]'
                  }`}
                />
              </button>

              <div className="w-[1px] h-3 bg-[#1e2634] mx-0.5" />

              {/* Metronome Volume Control Button */}
              <button
                onClick={() => setIsMetronomePopOpen((prev) => !prev)}
                onWheel={handleVolumeWheel}
                title={`Metronome Click Volume: ${metronomePercent}% (Click to adjust slider)`}
                className={`px-1.5 py-0.5 rounded flex items-center space-x-1 text-[10px] font-mono-daw transition-colors ${
                  isMetronomePopOpen
                    ? 'bg-[#1e2736] text-[#00f0a8]'
                    : metronomePercent === 0
                    ? 'text-[#ef4444] hover:bg-[#141a24]'
                    : 'text-[#8a99ad] hover:text-white hover:bg-[#141a24]'
                }`}
              >
                {metronomePercent === 0 ? (
                  <VolumeX size={11} className="text-[#ef4444]" />
                ) : (
                  <Volume2 size={11} className={project.metronome ? 'text-[#fbbf24]' : 'text-[#8a99ad]'} />
                )}
                <span className="font-semibold text-[9px]">{metronomePercent}%</span>
              </button>
            </div>

            {/* Metronome Settings & Volume Popover */}
            {isMetronomePopOpen && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-64 bg-[#0d1117] border border-[#263143] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150 backdrop-blur-md">
                {/* Popover Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1b2330]">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-md bg-[#18202d] border border-[#2a3649] flex items-center justify-center text-[#fbbf24]">
                      <MetronomeIcon size={13} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block leading-none">Metronome Click</span>
                      <span className="text-[9px] text-[#6b7c93] leading-none">Plays click on every beat</span>
                    </div>
                  </div>
                  <span className="font-mono-daw text-xs font-bold px-1.5 py-0.5 rounded bg-[#18212e] text-[#fbbf24] border border-[#27354a]">
                    {metronomePercent}%
                  </span>
                </div>

                {/* Volume Slider Section */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-[10px] text-[#8a99ad]">
                    <span className="flex items-center gap-1 font-medium">
                      <Volume2 size={11} /> Click Volume
                    </span>
                    <span className="text-[#64748b]">0 - 100%</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={metronomePercent}
                      onChange={(e) => handleMetronomeVolumeChange(Number(e.target.value) / 100)}
                      className="w-full h-1.5 bg-[#1b2332] rounded-lg appearance-none cursor-pointer accent-[#fbbf24]"
                    />
                  </div>
                </div>

                {/* Quick Volume Preset Buttons */}
                <div className="grid grid-cols-4 gap-1 mb-3">
                  {[
                    { label: 'Mute', val: 0 },
                    { label: '30%', val: 0.3 },
                    { label: '70%', val: 0.7 },
                    { label: '100%', val: 1.0 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handleMetronomeVolumeChange(preset.val)}
                      className={`py-1 text-[10px] font-mono-daw rounded border transition-colors ${
                        Math.abs(metronomeVol - preset.val) < 0.05
                          ? 'bg-[#fbbf24]/20 border-[#fbbf24]/50 text-[#fbbf24]'
                          : 'bg-[#131923] border-[#202938] text-[#8a99ad] hover:text-white hover:bg-[#1a2230]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Actions: Test Click & Metronome Toggle */}
                <div className="pt-2 border-t border-[#1b2330] flex items-center justify-between gap-2">
                  <button
                    onClick={handleTestClick}
                    title="Audition metronome click at current volume"
                    className="flex-1 py-1.5 px-2 bg-[#161d28] hover:bg-[#202b3b] text-white border border-[#2b374a] rounded text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Volume2 size={12} className="text-[#fbbf24]" />
                    <span>Test Click</span>
                  </button>

                  <button
                    onClick={handleToggleMetronome}
                    className={`flex-1 py-1.5 px-2 rounded text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-all ${
                      project.metronome
                        ? 'bg-[#f59e0b] hover:bg-[#d97706] text-black font-extrabold shadow-md'
                        : 'bg-[#161d28] hover:bg-[#202b3b] text-[#8a99ad] border border-[#2b374a]'
                    }`}
                  >
                    <MetronomeIcon size={12} />
                    <span>{project.metronome ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-[1px] h-3.5 bg-[#252d3d]" />

          {/* Swing Percentage Slider */}
          <div className="flex items-center space-x-1.5 bg-[#090b0e] border border-[#222936] px-2 py-0.5 rounded-md shadow-inner">
            <div className="flex items-center space-x-1" title="Swing / Shuffle Quantization (Affects drum channel playback)">
              <Shuffle size={11} className={(project.swing || 0) > 0.01 ? 'text-[#00f0a8]' : 'text-[#64748b]'} />
              <span className="text-[10px] font-bold text-[#71829d] font-mono-daw hidden sm:inline">SWING</span>
            </div>
            <input
              type="range"
              min={0}
              max={75}
              step={1}
              value={Math.round((project.swing || 0) * 100)}
              onChange={(e) => {
                const percent = Number(e.target.value);
                const val = Math.round(percent) / 100;
                onUpdateProject((p) => ({ ...p, swing: val }));
                audioEngine.setSwing(val);
              }}
              onDoubleClick={() => {
                onUpdateProject((p) => ({ ...p, swing: 0 }));
                audioEngine.setSwing(0);
              }}
              title={`Drum Playback Swing: ${Math.round((project.swing || 0) * 100)}% (Drag slider to affect quantization • Double-click to reset to 0%)`}
              className="w-14 sm:w-16 h-1.5 bg-[#1b2332] rounded appearance-none cursor-pointer accent-[#00f0a8]"
            />
            <span
              onClick={() => {
                const cur = Math.round((project.swing || 0) * 100);
                const next = cur < 20 ? 0.25 : cur < 45 ? 0.50 : cur < 70 ? 0.75 : 0;
                onUpdateProject((p) => ({ ...p, swing: next }));
                audioEngine.setSwing(next);
              }}
              title="Click to cycle swing presets (0% → 25% → 50% → 75%)"
              className="font-mono-daw text-[10px] font-bold text-[#00f0a8] w-7 text-right cursor-pointer select-none hover:underline"
            >
              {Math.round((project.swing || 0) * 100)}%
            </span>
          </div>
        </div>

        {/* Master VU Meter Bar */}
        <div className="hidden lg:flex flex-col justify-center px-1">
          <span className="text-[8px] text-[#55657e] font-mono-daw leading-none mb-0.5">MASTER VU</span>
          <canvas ref={meterCanvasRef} width={64} height={16} className="rounded bg-[#090b0e] border border-[#1f2633]" />
        </div>
      </div>

      {/* RIGHT: View Selectors, Command Palette & AI Co-Producer */}
      <div className="flex items-center space-x-1.5">
        {/* View Mode Switchers */}
        <div className="hidden xl:flex items-center bg-[#131720] border border-[#222936] p-0.5 rounded-lg space-x-0.5">
          <button
            onClick={() => setView('arrangement')}
            title="Arrangement Timeline"
            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center space-x-1 transition-colors ${
              project.viewMode === 'arrangement' ? 'bg-[#222b3b] text-white' : 'text-[#7d8fa7] hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setView('channelRack')}
            title="Step Sequencer / Drum Rack"
            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center space-x-1 transition-colors ${
              project.viewMode === 'channelRack' ? 'bg-[#222b3b] text-white' : 'text-[#7d8fa7] hover:text-white'
            }`}
          >
            <Grid size={13} />
            <span>Channel Rack</span>
          </button>
          <button
            onClick={() => setView('pianoRoll')}
            title="MIDI Piano Roll"
            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center space-x-1 transition-colors ${
              project.viewMode === 'pianoRoll' ? 'bg-[#222b3b] text-white' : 'text-[#7d8fa7] hover:text-white'
            }`}
          >
            <Music size={13} />
            <span>Piano Roll</span>
          </button>
          <button
            onClick={() => setView('mixer')}
            title="Mixer Console"
            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center space-x-1 transition-colors ${
              project.viewMode === 'mixer' ? 'bg-[#222b3b] text-white' : 'text-[#7d8fa7] hover:text-white'
            }`}
          >
            <Sliders size={13} />
            <span>Mixer</span>
          </button>
          <button
            onClick={() => setView('sampleHub')}
            title="African Sound Hub & Samples"
            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center space-x-1 transition-colors ${
              project.viewMode === 'sampleHub' ? 'bg-[#222b3b] text-white' : 'text-[#7d8fa7] hover:text-white'
            }`}
          >
            <FolderOpen size={13} />
            <span>Sounds</span>
          </button>
        </div>

        {/* Command Palette (Ctrl+K) */}
        <button
          onClick={onOpenCommandPalette}
          title="Command Palette (Ctrl+K)"
          className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#131720] hover:bg-[#1b2230] text-[#8e9eb5] hover:text-white rounded-lg border border-[#222936] text-xs transition-colors"
        >
          <Search size={13} />
          <span className="text-[11px]">Search</span>
          <kbd className="text-[9px] bg-[#090b0e] text-[#55657e] px-1 py-0.5 rounded border border-[#1f2633] font-mono-daw">
            ⌘K
          </kbd>
        </button>

        {/* FIesta AI Co-Producer Button */}
        <button
          onClick={() => setView('aiAssistant')}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
            project.viewMode === 'aiAssistant'
              ? 'bg-gradient-to-r from-[#ff3b69] to-[#00f0a8] text-black font-extrabold shadow-lg shadow-[#00f0a8]/20'
              : 'bg-gradient-to-r from-[#ff3b69]/15 to-[#00f0a8]/15 border border-[#ff3b69]/40 text-white hover:border-[#00f0a8]'
          }`}
          title="Open FIesta AI Co-Producer"
        >
          <Sparkles size={13} className="text-[#00f0a8]" />
          <span className="hidden sm:inline">FIesta AI</span>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          title="Export Project (WAV, Stems, MIDI)"
          className="flex items-center space-x-1 px-2.5 py-1.5 bg-[#00f0a8] hover:bg-[#00f0a8]/90 text-[#0b0d11] font-bold rounded-lg text-xs transition-all shadow-sm"
        >
          <Download size={13} />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </header>
  );
};
