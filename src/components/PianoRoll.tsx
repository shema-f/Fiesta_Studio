/**
 * FIesta Studio - Professional MIDI Piano Roll Editor
 * Interactive note grid, playable piano keyboard, scale quantization,
 * chord assistant, velocity lane, humanization, and MIDI file export.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Plus,
  Trash2,
  Download,
  Sparkles,
  Maximize2,
  Wand2,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { Note, ProjectState } from '../engine/projectStore';
import { audioEngine, midiToFreq, midiToNoteName } from '../audio/audioEngine';
import {
  SCALES,
  ROOT_NOTES,
  CHORD_PRESETS,
  isNoteInScale,
  humanizeNotes,
  transposeNotes,
  generateMidiFile,
} from '../midi/scales';

interface PianoRollProps {
  project: ProjectState;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
}

export const PianoRoll: React.FC<PianoRollProps> = ({ project, onUpdateProject }) => {
  const [selectedRoot, setSelectedRoot] = useState('F#');
  const [selectedScale, setSelectedScale] = useState('natural_minor');
  const [snapStep, setSnapStep] = useState<number>(1); // 1 = 16th note, 2 = 8th, 4 = 1/4 note
  const [activeMidiNote, setActiveMidiNote] = useState<number | null>(null);

  // Active track notes
  const activeTrack = project.tracks.find((t) => t.id === project.activeTrackId) || project.tracks[1];
  const activeClip = activeTrack.clips[0];
  const notes = activeClip?.notes || [];

  const minMidi = 36; // C2
  const maxMidi = 84; // C6
  const totalMidis = maxMidi - minMidi + 1;
  const totalSteps = 32; // 2 bars of 16ths

  // Play piano key note audition
  const playKey = (midi: number) => {
    setActiveMidiNote(midi);
    audioEngine.playInstrumentNote(activeTrack.instrumentType || 'piano', midi, 0.85, 0.4);
    setTimeout(() => setActiveMidiNote(null), 300);
  };

  // Add / Remove note on grid click
  const handleGridClick = (midi: number, step: number) => {
    const existingIndex = notes.findIndex((n) => n.midi === midi && n.startStep === step);

    if (existingIndex >= 0) {
      // Remove note
      const updatedNotes = notes.filter((_, idx) => idx !== existingIndex);
      updateTrackNotes(updatedNotes);
    } else {
      // Add note
      const newNote: Note = {
        id: 'n_' + Date.now() + Math.random().toString(36).slice(2, 6),
        midi,
        noteName: midiToNoteName(midi),
        startStep: step,
        durationSteps: snapStep || 2,
        velocity: 0.85,
      };
      playKey(midi);
      updateTrackNotes([...notes, newNote]);
    }
  };

  const updateTrackNotes = (newNotes: Note[]) => {
    onUpdateProject((p) => ({
      ...p,
      tracks: p.tracks.map((t) => {
        if (t.id !== activeTrack.id) return t;
        const updatedClips = t.clips.map((c, i) => (i === 0 ? { ...c, notes: newNotes } : c));
        return { ...t, clips: updatedClips };
      }),
    }));
  };

  // Chord Assistant: Stamp chord at step 0 or selected step
  const handleStampChord = (chordKey: string) => {
    const chord = CHORD_PRESETS[chordKey];
    if (!chord) return;
    const baseMidi = 60; // Middle C or scale root
    const newChordNotes: Note[] = chord.semitones.map((semi, idx) => ({
      id: 'chord_' + Date.now() + idx,
      midi: baseMidi + semi,
      noteName: midiToNoteName(baseMidi + semi),
      startStep: 0,
      durationSteps: 8,
      velocity: 0.8,
    }));

    updateTrackNotes([...notes, ...newChordNotes]);
    newChordNotes.forEach((n) => playKey(n.midi));
  };

  // Humanize
  const handleHumanize = () => {
    const humanized = humanizeNotes(notes, 0.05, 0.12);
    updateTrackNotes(humanized);
  };

  // Transpose
  const handleTranspose = (semitones: number) => {
    const transposed = transposeNotes(notes, semitones);
    updateTrackNotes(transposed);
  };

  // Export MIDI file
  const handleExportMidi = () => {
    const blob = generateMidiFile(notes, project.bpm);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}_${activeTrack.name}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isBlackKey = (midi: number) => {
    const note = midi % 12;
    return [1, 3, 6, 8, 10].includes(note);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b0e14] overflow-hidden select-none">
      {/* Top Piano Roll Toolbar */}
      <div className="h-10 bg-[#121620] border-b border-[#1f2633] px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          {/* Active Instrument / Track Indicator */}
          <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-[#18212e] rounded border border-[#243347]">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeTrack.color }} />
            <span className="text-xs font-bold text-white truncate max-w-[130px]">
              {activeTrack.name}
            </span>
          </div>

          {/* Scale & Key Highlighting Selector */}
          <div className="flex items-center space-x-1 text-xs bg-[#090b0e] border border-[#1f2633] p-0.5 rounded">
            <select
              value={selectedRoot}
              onChange={(e) => setSelectedRoot(e.target.value)}
              className="bg-transparent text-[#00f0a8] font-bold text-xs outline-none px-1 cursor-pointer"
            >
              {ROOT_NOTES.map((r) => (
                <option key={r} value={r} className="bg-[#121620] text-white">
                  {r}
                </option>
              ))}
            </select>
            <select
              value={selectedScale}
              onChange={(e) => setSelectedScale(e.target.value)}
              className="bg-transparent text-white font-medium text-xs outline-none px-1 cursor-pointer"
            >
              {Object.entries(SCALES).map(([k, s]) => (
                <option key={k} value={k} className="bg-[#121620] text-white">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Snap Selector */}
          <div className="hidden sm:flex items-center space-x-1 text-xs bg-[#090b0e] border border-[#1f2633] px-1.5 py-0.5 rounded">
            <span className="text-[10px] text-[#55657e]">SNAP</span>
            <select
              value={snapStep}
              onChange={(e) => setSnapStep(parseInt(e.target.value, 10))}
              className="bg-transparent text-white text-xs outline-none cursor-pointer"
            >
              <option value={1} className="bg-[#121620]">1/16</option>
              <option value={2} className="bg-[#121620]">1/8</option>
              <option value={4} className="bg-[#121620]">1/4</option>
              <option value={8} className="bg-[#121620]">1/2</option>
            </select>
          </div>
        </div>

        {/* Action Controls: Chords, Transpose, Humanize, Export MIDI */}
        <div className="flex items-center space-x-1.5">
          {/* Chord Dropdown Stamp */}
          <div className="hidden md:flex items-center space-x-1 bg-[#18212e] border border-[#243347] px-2 py-0.5 rounded">
            <span className="text-[10px] text-[#55657e]">CHORD:</span>
            <button
              onClick={() => handleStampChord('min9')}
              className="text-[11px] text-[#00f0a8] hover:underline font-bold"
              title="Amapiano Min9 Chord"
            >
              Min9
            </button>
            <span className="text-[#3b4759]">|</span>
            <button
              onClick={() => handleStampChord('maj7')}
              className="text-[11px] text-[#00f0a8] hover:underline font-bold"
              title="Major 7th Chord"
            >
              Maj7
            </button>
          </div>

          {/* Transpose +/- */}
          <div className="flex items-center bg-[#18212e] border border-[#243347] rounded p-0.5 text-xs font-mono-daw">
            <button
              onClick={() => handleTranspose(-1)}
              className="px-1.5 py-0.5 hover:bg-[#253347] text-white rounded"
              title="Transpose -1 Semitone"
            >
              -1
            </button>
            <button
              onClick={() => handleTranspose(1)}
              className="px-1.5 py-0.5 hover:bg-[#253347] text-white rounded"
              title="Transpose +1 Semitone"
            >
              +1
            </button>
          </div>

          {/* Humanize */}
          <button
            onClick={handleHumanize}
            title="Humanize timing & velocity"
            className="px-2 py-1 bg-[#18212e] hover:bg-[#253347] text-[#8e9eb5] hover:text-white rounded text-xs flex items-center space-x-1 transition-colors"
          >
            <Wand2 size={12} />
            <span className="hidden sm:inline">Humanize</span>
          </button>

          {/* Export MIDI */}
          <button
            onClick={handleExportMidi}
            title="Export as .MID file"
            className="px-2 py-1 bg-[#00f0a8]/10 hover:bg-[#00f0a8]/20 text-[#00f0a8] border border-[#00f0a8]/30 rounded text-xs font-bold flex items-center space-x-1 transition-colors"
          >
            <Download size={12} />
            <span className="hidden sm:inline">MIDI</span>
          </button>
        </div>
      </div>

      {/* Main Piano Roll Workspace (Keyboard + Grid) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Playable Piano Keyboard on Left */}
        <div className="w-16 md:w-20 bg-[#0d1015] border-r border-[#1f2633] flex flex-col shrink-0 overflow-y-auto select-none">
          {Array.from({ length: totalMidis }).map((_, idx) => {
            const midi = maxMidi - idx;
            const black = isBlackKey(midi);
            const inScale = isNoteInScale(midi, selectedRoot, selectedScale);
            const isPlaying = activeMidiNote === midi;

            return (
              <div
                key={midi}
                onClick={() => playKey(midi)}
                className={`h-5 border-b border-[#1b2230] px-1 flex items-center justify-between text-[9px] font-mono-daw cursor-pointer transition-all active:brightness-150 ${
                  black
                    ? 'bg-[#14171f] text-[#6b7c93] hover:bg-[#222938]'
                    : 'bg-[#222936] text-[#b3c2d6] hover:bg-[#2e3748]'
                } ${isPlaying ? 'bg-[#00f0a8] text-black font-extrabold' : ''}`}
              >
                <span>{midiToNoteName(midi)}</span>
                {inScale && <span className="w-1 h-1 rounded-full bg-[#00f0a8]" />}
              </div>
            );
          })}
        </div>

        {/* Note Grid */}
        <div className="flex-1 overflow-x-auto overflow-y-auto relative bg-[#090b0e]">
          <div
            className="relative"
            style={{
              width: `${totalSteps * 28}px`,
              height: `${totalMidis * 20}px`,
            }}
          >
            {/* Horizontal pitch rows */}
            {Array.from({ length: totalMidis }).map((_, idx) => {
              const midi = maxMidi - idx;
              const black = isBlackKey(midi);
              const inScale = isNoteInScale(midi, selectedRoot, selectedScale);

              return (
                <div
                  key={midi}
                  style={{ top: `${idx * 20}px` }}
                  className={`absolute left-0 right-0 h-5 border-b border-[#141922] ${
                    inScale ? (black ? 'bg-[#0e121a]' : 'bg-[#121620]') : 'bg-[#08090d] opacity-50'
                  }`}
                />
              );
            })}

            {/* Vertical step columns */}
            {Array.from({ length: totalSteps }).map((_, stepIdx) => {
              const isBeat = stepIdx % 4 === 0;
              const isBar = stepIdx % 16 === 0;

              return (
                <div
                  key={stepIdx}
                  style={{ left: `${stepIdx * 28}px` }}
                  className={`absolute top-0 bottom-0 w-[28px] border-r ${
                    isBar ? 'border-[#2d3a4f]' : isBeat ? 'border-[#1b2330]' : 'border-[#121720]'
                  }`}
                />
              );
            })}

            {/* Moving Playhead */}
            {project.isPlaying && (
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-[#00f0a8] z-20 pointer-events-none shadow-[0_0_8px_#00f0a8]"
                style={{
                  left: `${(project.current16thStep % totalSteps) * 28}px`,
                }}
              />
            )}

            {/* Clickable Note Cells */}
            {Array.from({ length: totalMidis }).map((_, idx) => {
              const midi = maxMidi - idx;
              return Array.from({ length: totalSteps }).map((_, stepIdx) => (
                <div
                  key={`${midi}_${stepIdx}`}
                  onClick={() => handleGridClick(midi, stepIdx)}
                  style={{
                    top: `${idx * 20}px`,
                    left: `${stepIdx * 28}px`,
                    width: '28px',
                    height: '20px',
                  }}
                  className="absolute cursor-pointer hover:bg-white/5 transition-colors"
                />
              ));
            })}

            {/* Render Notes */}
            {notes.map((note) => {
              const rowIdx = maxMidi - note.midi;
              const noteLeft = note.startStep * 28;
              const noteWidth = Math.max(28, note.durationSteps * 28 - 2);

              return (
                <div
                  key={note.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGridClick(note.midi, note.startStep);
                  }}
                  style={{
                    top: `${rowIdx * 20 + 1}px`,
                    left: `${noteLeft}px`,
                    width: `${noteWidth}px`,
                    height: '18px',
                    backgroundColor: activeTrack.color,
                  }}
                  className="absolute rounded-sm border border-white/60 shadow-md cursor-pointer z-10 flex items-center px-1 text-[9px] font-bold text-black overflow-hidden hover:brightness-125 transition-all"
                >
                  <span className="truncate">{note.noteName}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
