/**
 * FIesta Studio - Virtual Instruments & Synthesis Panel
 * Playable synthesizer keyboard, MPC drum pads, ADSR envelopes, filter controls,
 * and instrument preset selection.
 */

import React, { useState, useEffect } from 'react';
import {
  Music,
  Sliders,
  Volume2,
  Sparkles,
  Zap,
  Disc,
} from 'lucide-react';
import { InstrumentType } from '../types/daw';
import { audioEngine } from '../audio/audioEngine';

interface InstrumentPanelProps {
  currentInstrument: InstrumentType;
  onSelectInstrument: (inst: InstrumentType) => void;
}

export const InstrumentPanel: React.FC<InstrumentPanelProps> = ({
  currentInstrument,
  onSelectInstrument,
}) => {
  const [activeMidi, setActiveMidi] = useState<number | null>(null);
  const [cutoff, setCutoff] = useState(2500);
  const [resonance, setResonance] = useState(2.5);
  const [attack, setAttack] = useState(0.01);
  const [release, setRelease] = useState(0.4);

  const instruments: { id: InstrumentType; name: string; desc: string; icon: string }[] = [
    { id: 'piano', name: 'Grand Piano', desc: 'Acoustic concert grand with hammer resonance', icon: '🎹' },
    { id: 'keys', name: 'Vintage Keys', desc: 'FM Electric Rhodes & Wurlitzer chime', icon: '✨' },
    { id: 'bass', name: 'Analog Bass', desc: 'Punchy dual-saw sub bass synth', icon: '🎸' },
    { id: '808', name: 'Tuned 808', desc: 'Heavy saturated low-end sub boom', icon: '💥' },
    { id: 'pluck', name: 'Inanga Pluck', desc: 'Traditional Rwandan harp string pluck', icon: '🪕' },
    { id: 'pad', name: 'Ambient Pad', desc: 'Lush stereo atmosphere & evolving texture', icon: '🌌' },
    { id: 'synth', name: 'Lead Synth', desc: 'Bright subtractive synthesizer lead', icon: '⚡' },
    { id: 'drums', name: 'Drum Kit', desc: 'Acoustic and electronic drum machine', icon: '🥁' },
  ];

  // Play note
  const triggerNote = (midi: number) => {
    setActiveMidi(midi);
    audioEngine.playInstrumentNote(currentInstrument, midi, 0.9, 0.45);
    setTimeout(() => setActiveMidi(null), 250);
  };

  // Keyboard shortcut listener (QWERTY piano)
  useEffect(() => {
    const keyMap: Record<string, number> = {
      a: 60, // C4
      w: 61, // C#4
      s: 62, // D4
      e: 63, // D#4
      d: 64, // E4
      f: 65, // F4
      t: 66, // F#4
      g: 67, // G4
      y: 68, // G#4
      h: 69, // A4
      u: 70, // A#4
      j: 71, // B4
      k: 72, // C5
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (keyMap[key]) {
        triggerNote(keyMap[key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentInstrument]);

  const drumPads = [
    { label: 'KICK 1', type: 'kick' },
    { label: 'SNARE', type: 'snare' },
    { label: 'CLAP', type: 'clap' },
    { label: 'CLOSED HAT', type: 'hihat' },
    { label: 'OPEN HAT', type: 'openhat' },
    { label: 'AMAPIANO LOG', type: 'amapiano_logdrum' },
    { label: 'AMAYUGI SHAKER', type: 'shaker' },
    { label: '808 SUB', type: '808' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#0b0e14] overflow-hidden select-none p-4">
      {/* Instrument Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 mb-4 shrink-0">
        {instruments.map((inst) => {
          const isSelected = currentInstrument === inst.id;
          return (
            <button
              key={inst.id}
              onClick={() => onSelectInstrument(inst.id)}
              className={`p-2 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#182333] border-[#00f0a8] shadow-lg shadow-[#00f0a8]/10'
                  : 'bg-[#10141d] border-[#1b2230] hover:border-[#2a374d]'
              }`}
            >
              <div className="text-xl mb-1">{inst.icon}</div>
              <div>
                <span className="text-xs font-bold text-white block leading-tight truncate">
                  {inst.name}
                </span>
                <span className="text-[9px] text-[#55657e] truncate block">{inst.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Synthesis DSP Macro Knobs */}
      <div className="bg-[#10141d] border border-[#1b2230] rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-2">
          <Zap size={14} className="text-[#00f0a8]" />
          <span className="text-xs font-bold text-white">DSP SYNTHESIS PARAMETERS</span>
        </div>

        <div className="flex items-center space-x-6 text-xs font-mono-daw">
          {/* Cutoff */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-[#55657e] mb-1">CUTOFF</span>
            <input
              type="range"
              min="200"
              max="12000"
              value={cutoff}
              onChange={(e) => setCutoff(parseInt(e.target.value, 10))}
              className="w-20 accent-[#00f0a8] h-1 bg-[#1a2230] rounded"
            />
            <span className="text-[9px] text-white mt-1">{cutoff} Hz</span>
          </div>

          {/* Resonance */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-[#55657e] mb-1">RESONANCE</span>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={resonance}
              onChange={(e) => setResonance(parseFloat(e.target.value))}
              className="w-20 accent-[#00f0a8] h-1 bg-[#1a2230] rounded"
            />
            <span className="text-[9px] text-white mt-1">{resonance} Q</span>
          </div>

          {/* Attack */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-[#55657e] mb-1">ATTACK</span>
            <input
              type="range"
              min="0.005"
              max="0.5"
              step="0.01"
              value={attack}
              onChange={(e) => setAttack(parseFloat(e.target.value))}
              className="w-20 accent-[#00f0a8] h-1 bg-[#1a2230] rounded"
            />
            <span className="text-[9px] text-white mt-1">{Math.round(attack * 1000)} ms</span>
          </div>

          {/* Release */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-[#55657e] mb-1">RELEASE</span>
            <input
              type="range"
              min="0.05"
              max="2.0"
              step="0.05"
              value={release}
              onChange={(e) => setRelease(parseFloat(e.target.value))}
              className="w-20 accent-[#00f0a8] h-1 bg-[#1a2230] rounded"
            />
            <span className="text-[9px] text-white mt-1">{release} s</span>
          </div>
        </div>
      </div>

      {/* Main Playable Surface: MPC Drum Pads or Musical Keyboard */}
      <div className="flex-1 flex flex-col justify-end bg-[#090b0e] border border-[#1b2230] rounded-xl p-4 overflow-hidden relative">
        {currentInstrument === 'drums' ? (
          /* MPC Drum Pads */
          <div className="grid grid-cols-4 gap-3 h-full max-h-72">
            {drumPads.map((pad) => (
              <button
                key={pad.label}
                onClick={() => audioEngine.triggerDrum(pad.type, 0.95)}
                className="bg-[#141a24] hover:bg-[#1f2938] active:bg-[#ff3b69] border border-[#232e40] active:border-[#ff3b69] rounded-xl flex flex-col items-center justify-center p-3 transition-all active:scale-95 shadow-md group"
              >
                <Disc size={20} className="text-[#55657e] group-hover:text-[#ff3b69] mb-1 transition-colors" />
                <span className="text-xs font-black text-white">{pad.label}</span>
              </button>
            ))}
          </div>
        ) : (
          /* 2-Octave Playable Piano Keyboard */
          <div className="flex flex-col items-center">
            <div className="flex justify-center select-none relative h-48 w-full max-w-3xl">
              {/* White keys */}
              {[60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84].map((midi) => {
                const isPlaying = activeMidi === midi;
                return (
                  <button
                    key={midi}
                    onClick={() => triggerNote(midi)}
                    className={`flex-1 h-full border border-[#202735] rounded-b-lg flex flex-col justify-end pb-3 items-center text-[10px] font-mono-daw transition-colors ${
                      isPlaying
                        ? 'bg-[#00f0a8] text-black font-extrabold shadow-lg shadow-[#00f0a8]/40'
                        : 'bg-[#e2e8f0] hover:bg-white text-[#334155]'
                    }`}
                  >
                    <span>{midi}</span>
                  </button>
                );
              })}

              {/* Black keys overlaid */}
              <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none h-28">
                {/* Visual black key offsets */}
                <div className="flex w-full max-w-3xl px-3 pointer-events-auto">
                  {[61, 63, null, 66, 68, 70, null, 73, 75, null, 78, 80, 82].map((midi, i) => {
                    if (midi === null) return <div key={i} className="flex-1 opacity-0 pointer-events-none" />;
                    const isPlaying = activeMidi === midi;
                    return (
                      <button
                        key={midi}
                        onClick={() => triggerNote(midi)}
                        className={`flex-1 mx-1 h-full bg-[#0d1015] hover:bg-[#1a202c] border border-[#222938] rounded-b-md text-white text-[9px] font-mono-daw flex flex-col justify-end pb-2 items-center transition-colors shadow-md ${
                          isPlaying ? 'bg-[#00f0a8] text-black font-extrabold' : ''
                        }`}
                      >
                        <span>{midi}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-[#55657e] mt-2 font-mono-daw">
              TIP: Use Computer Keyboard keys (A, W, S, E, D, F, T, G, Y, H, U, J, K) to play live notes!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
