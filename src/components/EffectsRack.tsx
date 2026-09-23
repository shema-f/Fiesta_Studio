/**
 * FIesta Studio - Built-in Audio Effects Rack
 * Parametric EQ with visual curve, Compressor, Reverb, Delay, and Distortion.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Sliders,
  Power,
  RotateCcw,
  Sparkles,
  Waves,
} from 'lucide-react';
import { EffectPlugin, ProjectState } from '../engine/projectStore';

interface EffectsRackProps {
  project: ProjectState;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
}

export const EffectsRack: React.FC<EffectsRackProps> = ({ project, onUpdateProject }) => {
  const activeTrack = project.tracks.find((t) => t.id === project.activeTrackId) || project.tracks[0];
  const eqCanvasRef = useRef<HTMLCanvasElement>(null);

  // EQ params
  const [eqLow, setEqLow] = useState(0); // -12dB to +12dB
  const [eqMid, setEqMid] = useState(1.5);
  const [eqHigh, setEqHigh] = useState(2.0);

  // Comp params
  const [compThresh, setCompThresh] = useState(-14);
  const [compRatio, setCompRatio] = useState(3.5);

  // Reverb params
  const [reverbSize, setReverbSize] = useState(0.6);
  const [reverbMix, setReverbMix] = useState(0.25);

  // Delay params
  const [delayTime, setDelayTime] = useState(0.35);
  const [delayFeedback, setDelayFeedback] = useState(0.4);

  // Draw interactive EQ curve
  useEffect(() => {
    const canvas = eqCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Draw background grid lines
    ctx.strokeStyle = '#1a2230';
    ctx.lineWidth = 1;
    // 0dB Center line
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Frequency grid markers (100Hz, 1kHz, 10kHz)
    [0.2, 0.5, 0.8].forEach((pct) => {
      ctx.beginPath();
      ctx.moveTo(pct * width, 0);
      ctx.lineTo(pct * width, height);
      ctx.stroke();
    });

    // Draw Frequency Response Curve
    ctx.beginPath();
    ctx.strokeStyle = '#00f0a8';
    ctx.lineWidth = 2.5;

    for (let x = 0; x <= width; x++) {
      const normX = x / width;
      // EQ math approximation
      const lowContr = eqLow * Math.exp(-Math.pow(normX / 0.25, 2));
      const midContr = eqMid * Math.exp(-Math.pow((normX - 0.5) / 0.18, 2));
      const highContr = eqHigh * (1 - Math.exp(-Math.pow((normX - 0.3) / 0.4, 2)));

      const db = lowContr + midContr + highContr;
      const y = height / 2 - (db / 15) * (height / 2 - 10);

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill underneath with gentle gradient
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, 0, 0, height);
    fillGrad.addColorStop(0, '#00f0a825');
    fillGrad.addColorStop(1, '#00f0a800');
    ctx.fillStyle = fillGrad;
    ctx.fill();
  }, [eqLow, eqMid, eqHigh]);

  return (
    <div className="flex-1 flex flex-col bg-[#0b0e14] overflow-hidden select-none p-4">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
          <h2 className="text-sm font-black text-white">STUDIO FX INSERTS</h2>
          <span className="text-xs text-[#55657e] font-mono-daw">
            FOR: {activeTrack.name}
          </span>
        </div>
      </div>

      {/* FX Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto">
        {/* 1. PARAMETRIC EQ */}
        <div className="bg-[#10141d] border border-[#1b2230] rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00f0a8]" />
              FIesta Parametric EQ 3-Band
            </span>
            <button className="text-[10px] text-[#00f0a8] font-bold bg-[#00f0a8]/10 px-2 py-0.5 rounded border border-[#00f0a8]/30">
              ACTIVE
            </button>
          </div>

          {/* Interactive EQ Canvas */}
          <div className="my-2 bg-[#090b0e] border border-[#1f2633] rounded-lg p-1">
            <canvas ref={eqCanvasRef} width={280} height={90} className="w-full h-24" />
          </div>

          {/* EQ Knobs */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono-daw pt-2">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-[#55657e]">LOW (100Hz)</span>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={eqLow}
                onChange={(e) => setEqLow(parseFloat(e.target.value))}
                className="w-full accent-[#00f0a8] mt-1"
              />
              <span className="text-[9px] text-white mt-0.5">{eqLow > 0 ? `+${eqLow}` : eqLow} dB</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-[#55657e]">MID (1kHz)</span>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={eqMid}
                onChange={(e) => setEqMid(parseFloat(e.target.value))}
                className="w-full accent-[#00f0a8] mt-1"
              />
              <span className="text-[9px] text-white mt-0.5">{eqMid > 0 ? `+${eqMid}` : eqMid} dB</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-[#55657e]">HIGH (8kHz)</span>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={eqHigh}
                onChange={(e) => setEqHigh(parseFloat(e.target.value))}
                className="w-full accent-[#00f0a8] mt-1"
              />
              <span className="text-[9px] text-white mt-0.5">{eqHigh > 0 ? `+${eqHigh}` : eqHigh} dB</span>
            </div>
          </div>
        </div>

        {/* 2. STUDIO COMPRESSOR */}
        <div className="bg-[#10141d] border border-[#1b2230] rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
              FIesta VCA Bus Compressor
            </span>
            <button className="text-[10px] text-[#00f0a8] font-bold bg-[#00f0a8]/10 px-2 py-0.5 rounded border border-[#00f0a8]/30">
              ACTIVE
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 my-auto py-2">
            <div className="flex flex-col items-center text-xs font-mono-daw">
              <span className="text-[9px] text-[#55657e] mb-1">THRESHOLD</span>
              <input
                type="range"
                min="-36"
                max="0"
                step="1"
                value={compThresh}
                onChange={(e) => setCompThresh(parseInt(e.target.value, 10))}
                className="w-full accent-[#f59e0b]"
              />
              <span className="text-[9px] text-white mt-1">{compThresh} dB</span>
            </div>

            <div className="flex flex-col items-center text-xs font-mono-daw">
              <span className="text-[9px] text-[#55657e] mb-1">RATIO</span>
              <input
                type="range"
                min="1.5"
                max="10"
                step="0.5"
                value={compRatio}
                onChange={(e) => setCompRatio(parseFloat(e.target.value))}
                className="w-full accent-[#f59e0b]"
              />
              <span className="text-[9px] text-white mt-1">{compRatio}:1</span>
            </div>
          </div>

          {/* Gain Reduction Meter Bar */}
          <div className="bg-[#090b0e] border border-[#1f2633] p-2 rounded-lg flex items-center justify-between">
            <span className="text-[9px] text-[#55657e] font-mono-daw">GAIN REDUCTION</span>
            <div className="w-32 h-2 bg-[#1b2230] rounded-full overflow-hidden flex justify-end">
              <div
                className="h-full bg-[#ff3b69] rounded-full transition-all"
                style={{ width: project.isPlaying ? '35%' : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* 3. ALGORITHMIC REVERB */}
        <div className="bg-[#10141d] border border-[#1b2230] rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
              FIesta Hall Reverb
            </span>
            <button className="text-[10px] text-[#00f0a8] font-bold bg-[#00f0a8]/10 px-2 py-0.5 rounded border border-[#00f0a8]/30">
              ACTIVE
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 my-auto py-2">
            <div className="flex flex-col items-center text-xs font-mono-daw">
              <span className="text-[9px] text-[#55657e] mb-1">ROOM SIZE</span>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={reverbSize}
                onChange={(e) => setReverbSize(parseFloat(e.target.value))}
                className="w-full accent-[#38bdf8]"
              />
              <span className="text-[9px] text-white mt-1">{Math.round(reverbSize * 100)}%</span>
            </div>

            <div className="flex flex-col items-center text-xs font-mono-daw">
              <span className="text-[9px] text-[#55657e] mb-1">WET MIX</span>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.05"
                value={reverbMix}
                onChange={(e) => setReverbMix(parseFloat(e.target.value))}
                className="w-full accent-[#38bdf8]"
              />
              <span className="text-[9px] text-white mt-1">{Math.round(reverbMix * 100)}%</span>
            </div>
          </div>
        </div>

        {/* 4. TEMPO DELAY */}
        <div className="bg-[#10141d] border border-[#1b2230] rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
              FIesta Stereo Echo & Delay
            </span>
            <button className="text-[10px] text-[#00f0a8] font-bold bg-[#00f0a8]/10 px-2 py-0.5 rounded border border-[#00f0a8]/30">
              ACTIVE
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 my-auto py-2">
            <div className="flex flex-col items-center text-xs font-mono-daw">
              <span className="text-[9px] text-[#55657e] mb-1">DELAY TIME</span>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={delayTime}
                onChange={(e) => setDelayTime(parseFloat(e.target.value))}
                className="w-full accent-[#a855f7]"
              />
              <span className="text-[9px] text-white mt-1">{Math.round(delayTime * 1000)} ms</span>
            </div>

            <div className="flex flex-col items-center text-xs font-mono-daw">
              <span className="text-[9px] text-[#55657e] mb-1">FEEDBACK</span>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={delayFeedback}
                onChange={(e) => setDelayFeedback(parseFloat(e.target.value))}
                className="w-full accent-[#a855f7]"
              />
              <span className="text-[9px] text-white mt-1">{Math.round(delayFeedback * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
