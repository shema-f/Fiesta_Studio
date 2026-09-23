/**
 * FIesta Studio - Professional Mixer Console
 * Multitrack channel strips, Bus routing (Drums, Vocals, Instruments, Master),
 * volume faders in dB, stereo meters, inserts, and pan controls.
 */

import React, { useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Sliders,
  Activity,
  Layers,
  Sparkles,
  Radio,
} from 'lucide-react';
import { ProjectState } from '../engine/projectStore';
import { audioEngine } from '../audio/audioEngine';

interface MixerRackProps {
  project: ProjectState;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
  onOpenEffectSlot?: (trackId: string, effectId: string) => void;
}

export const MixerRack: React.FC<MixerRackProps> = ({ project, onUpdateProject }) => {
  const spectrumCanvasRef = useRef<HTMLCanvasElement>(null);

  // Global solo status
  const hasAnySolo = project.tracks.some((t) => t.solo);
  const soloedTrackCount = project.tracks.filter((t) => t.solo).length;

  // Animate master spectrum analyzer
  useEffect(() => {
    let animId: number;
    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.getMasterAnalyser();
    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animId = requestAnimationFrame(render);
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (analyser && project.isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        dataArray.fill(0);
      }

      // Draw Spectrum Bars
      const barWidth = (width / 48) - 1;
      let x = 0;

      for (let i = 0; i < 48; i++) {
        const val = dataArray[i * 2] || 0;
        const percent = val / 255;
        const barHeight = Math.max(2, percent * height);

        const grad = ctx.createLinearGradient(0, height, 0, 0);
        grad.addColorStop(0, '#00f0a8');
        grad.addColorStop(0.7, '#f59e0b');
        grad.addColorStop(1.0, '#ff3b69');

        ctx.fillStyle = grad;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [project.isPlaying]);

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

  const clearAllSolo = () => {
    onUpdateProject((p) => ({
      ...p,
      tracks: p.tracks.map((t) => ({ ...t, solo: false })),
    }));
  };

  const handleVolumeChange = (trackId: string, val: number) => {
    onUpdateProject((p) => ({
      ...p,
      tracks: p.tracks.map((t) => (t.id === trackId ? { ...t, volume: val } : t)),
    }));
  };

  const handlePanChange = (trackId: string, pan: number) => {
    onUpdateProject((p) => ({
      ...p,
      tracks: p.tracks.map((t) => (t.id === trackId ? { ...t, pan } : t)),
    }));
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b0e14] overflow-hidden select-none">
      {/* Top Mixer Info Bar */}
      <div className="h-10 bg-[#121620] border-b border-[#1f2633] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sliders size={14} className="text-[#00f0a8]" />
            MIXER CONSOLE
          </span>
          <span className="text-[10px] text-[#55657e] font-mono-daw hidden sm:inline">
            32-BIT FLOATING BUSING | 44.1 kHz
          </span>

          {/* Solo Status Indicator & Clear Solo Button */}
          {hasAnySolo && (
            <div className="flex items-center space-x-2 pl-2 border-l border-[#263142]">
              <span className="text-[10px] bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/50 px-2 py-0.5 rounded font-mono-daw font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-ping" />
                SOLO ACTIVE ({soloedTrackCount})
              </span>
              <button
                onClick={clearAllSolo}
                className="text-[10px] text-[#718299] hover:text-white hover:bg-[#1a2332] px-1.5 py-0.5 rounded border border-[#263142] transition-colors"
                title="Clear all track solos"
              >
                Clear Solo
              </button>
            </div>
          )}
        </div>

        {/* Master Frequency Spectrum Display */}
        <div className="flex items-center space-x-2">
          <span className="text-[9px] text-[#55657e] font-mono-daw hidden sm:inline">RTA SPECTRUM</span>
          <canvas
            ref={spectrumCanvasRef}
            width={120}
            height={20}
            className="rounded bg-[#090b0e] border border-[#1f2633]"
          />
        </div>
      </div>

      {/* Channel Strips Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 flex space-x-2">
        {/* MASTER CHANNEL STRIP (Pinned Left) */}
        <div className="w-24 bg-[#141924] border-2 border-[#00f0a8]/60 rounded-xl p-2.5 flex flex-col justify-between shrink-0 shadow-lg relative">
          <div className="text-center">
            <span className="text-[10px] font-black text-[#00f0a8] tracking-wider block">MASTER</span>
            <span className="text-[8px] text-[#718299] font-mono-daw">0.0 dB</span>
          </div>

          {/* Master VU Meter Bar */}
          <div className="flex-1 my-3 flex justify-center items-center space-x-1">
            <div className="w-3 h-44 bg-[#090b0e] rounded-sm p-0.5 border border-[#1f2633] flex flex-col justify-end overflow-hidden">
              <div
                className="w-full bg-gradient-to-t from-[#00f0a8] via-[#f59e0b] to-[#ff3b69] rounded-xs transition-all duration-75"
                style={{
                  height:
                    project.isPlaying &&
                    project.tracks.some((t) => !t.mute && (!hasAnySolo || t.solo))
                      ? '68%'
                      : '0%',
                }}
              />
            </div>
            <div className="w-3 h-44 bg-[#090b0e] rounded-sm p-0.5 border border-[#1f2633] flex flex-col justify-end overflow-hidden">
              <div
                className="w-full bg-gradient-to-t from-[#00f0a8] via-[#f59e0b] to-[#ff3b69] rounded-xs transition-all duration-75"
                style={{
                  height:
                    project.isPlaying &&
                    project.tracks.some((t) => !t.mute && (!hasAnySolo || t.solo))
                      ? '65%'
                      : '0%',
                }}
              />
            </div>
          </div>

          {/* Master Volume Fader */}
          <div className="flex flex-col items-center space-y-1">
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.01"
              value={project.masterVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateProject((p) => ({ ...p, masterVolume: val }));
                if (audioEngine.masterGain) {
                  audioEngine.masterGain.gain.setValueAtTime(val, audioEngine.getContext().currentTime);
                }
              }}
              className="w-full accent-[#00f0a8] cursor-pointer"
            />
            <span className="text-[9px] font-bold text-white font-mono-daw">
              {Math.round((project.masterVolume - 1) * 6)} dB
            </span>
          </div>
        </div>

        {/* BUS CHANNEL STRIPS (Drums, Vocals, Instruments) */}
        {project.buses
          .filter((b) => b.id !== 'bus_master')
          .map((bus) => {
            const busTracks = project.tracks.filter((t) => t.busId === bus.id);
            const isBusAudible = busTracks.some(
              (t) => !t.mute && (!hasAnySolo || t.solo)
            );

            return (
              <div
                key={bus.id}
                className={`w-20 bg-[#10141d] border rounded-xl p-2 flex flex-col justify-between shrink-0 shadow-sm transition-all ${
                  isBusAudible
                    ? 'border-[#202735]'
                    : 'border-[#191f2a] opacity-60'
                }`}
              >
                <div className="text-center">
                  <span className="text-[9px] font-extrabold text-[#38bdf8] truncate block">
                    {bus.name}
                  </span>
                  <span className="text-[8px] text-[#55657e] font-mono-daw">BUS</span>
                </div>

                {/* Bus VU Meter */}
                <div className="flex-1 my-2 flex justify-center items-center">
                  <div className="w-2.5 h-36 bg-[#090b0e] rounded-xs p-0.5 border border-[#1b2230] flex flex-col justify-end overflow-hidden">
                    <div
                      className="w-full bg-gradient-to-t from-[#00f0a8] to-[#f59e0b] rounded-xs transition-all duration-75"
                      style={{
                        height: project.isPlaying && isBusAudible ? '55%' : '0%',
                      }}
                    />
                  </div>
                </div>

                {/* Bus Volume Fader */}
                <div className="flex flex-col items-center">
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.02"
                    value={bus.volume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onUpdateProject((p) => ({
                        ...p,
                        buses: p.buses.map((b) => (b.id === bus.id ? { ...b, volume: val } : b)),
                      }));
                    }}
                    className="w-full accent-[#38bdf8] cursor-pointer"
                  />
                </div>
              </div>
            );
          })}

        {/* Divider */}
        <div className="w-[1px] bg-[#1f2633] my-4 shrink-0" />

        {/* TRACK CHANNEL STRIPS */}
        {project.tracks.map((track) => {
          const isSoloed = track.solo;
          const isMutedBySolo = hasAnySolo && !track.solo;
          const isAudible = !track.mute && !isMutedBySolo;

          return (
            <div
              key={track.id}
              className={`w-24 bg-[#0e121a] rounded-xl p-2 flex flex-col justify-between shrink-0 transition-all shadow-sm relative ${
                isSoloed
                  ? 'border-2 border-[#f59e0b] shadow-lg shadow-[#f59e0b]/15 bg-[#12161f]'
                  : isMutedBySolo
                  ? 'border border-[#1b2230] opacity-55 hover:opacity-85'
                  : 'border border-[#1b2230] hover:border-[#2a374d]'
              }`}
            >
              {/* Track Color Accent */}
              <div
                className="absolute top-0 left-3 right-3 h-1 rounded-t-sm"
                style={{ backgroundColor: track.color }}
              />

              {/* Track Name & Bus */}
              <div className="text-center pt-1">
                <span className="text-[10px] font-bold text-white truncate block" title={track.name}>
                  {track.name}
                </span>
                <span className="text-[8px] text-[#55657e] font-mono-daw uppercase block">
                  {track.busId.replace('bus_', '')}
                </span>

                {/* Solo-Muted Status Badge */}
                {isMutedBySolo && (
                  <span className="text-[7px] text-[#f59e0b]/80 bg-[#f59e0b]/10 px-1 py-0.2 rounded font-mono-daw inline-block mt-0.5">
                    SOLO MUTED
                  </span>
                )}
                {isSoloed && (
                  <span className="text-[7px] text-black bg-[#f59e0b] font-bold px-1 py-0.2 rounded font-mono-daw inline-block mt-0.5">
                    SOLOED
                  </span>
                )}
              </div>

              {/* Track Pan Dial */}
              <div className="flex flex-col items-center my-1">
                <span className="text-[8px] text-[#55657e] font-mono-daw">
                  {track.pan === 0 ? 'C' : track.pan > 0 ? `R${Math.round(track.pan * 50)}` : `L${Math.round(Math.abs(track.pan) * 50)}`}
                </span>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={track.pan}
                  onChange={(e) => handlePanChange(track.id, parseFloat(e.target.value))}
                  className="w-12 accent-[#f59e0b] h-1 bg-[#1a2230] rounded cursor-pointer"
                  title="Stereo Pan"
                />
              </div>

              {/* Track VU Meter Bar */}
              <div className="flex-1 my-1 flex justify-center items-center">
                <div className="w-2.5 h-32 bg-[#090b0e] rounded-xs p-0.5 border border-[#1b2230] flex flex-col justify-end overflow-hidden">
                  <div
                    className="w-full rounded-xs transition-all duration-75"
                    style={{
                      height: project.isPlaying && isAudible ? '60%' : '0%',
                      backgroundColor: track.color,
                    }}
                  />
                </div>
              </div>

              {/* Mute and Solo Buttons */}
              <div className="flex items-center justify-center space-x-1 my-1">
                <button
                  onClick={() => toggleMute(track.id)}
                  className={`w-5 h-5 rounded text-[8px] font-bold transition-all ${
                    track.mute
                      ? 'bg-[#ff3b69] text-white shadow-xs shadow-[#ff3b69]/40'
                      : 'bg-[#18202d] text-[#6b7c93] hover:text-white'
                  }`}
                  title={track.mute ? 'Unmute Track' : 'Mute Track'}
                >
                  M
                </button>
                <button
                  onClick={() => toggleSolo(track.id)}
                  className={`w-5 h-5 rounded text-[8px] font-extrabold transition-all ${
                    isSoloed
                      ? 'bg-[#f59e0b] text-black ring-2 ring-[#f59e0b]/50 shadow-md shadow-[#f59e0b]/30'
                      : 'bg-[#18202d] text-[#6b7c93] hover:text-white hover:bg-[#222d3e]'
                  }`}
                  title={isSoloed ? 'Turn off Solo' : 'Solo Track (mutes all others)'}
                >
                  S
                </button>
              </div>

              {/* Track Volume Fader */}
              <div className="flex flex-col items-center">
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.02"
                  value={track.volume}
                  onChange={(e) => handleVolumeChange(track.id, parseFloat(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ accentColor: track.color }}
                />
                <span className="text-[8px] text-[#6b7c93] font-mono-daw mt-0.5">
                  {Math.round((track.volume - 1) * 6)} dB
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
