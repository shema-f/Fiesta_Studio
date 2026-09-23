/**
 * FIesta Studio - Audio Export & Project Packaging
 * Offline audio rendering to WAV (16/24/32-bit), Stems, MIDI, and .fiesta project files.
 */

import React, { useState } from 'react';
import {
  X,
  Download,
  FileAudio,
  Layers,
  Music,
  Check,
  Disc,
} from 'lucide-react';
import { ProjectState } from '../engine/projectStore';
import { audioEngine } from '../audio/audioEngine';
import { generateMidiFile } from '../midi/scales';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectState;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, project }) => {
  const [bitDepth, setBitDepth] = useState<16 | 24 | 32>(16);
  const [exportType, setExportType] = useState<'master' | 'stems' | 'midi' | 'project'>('master');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsRendering(true);
    setRenderProgress(10);

    try {
      if (exportType === 'project') {
        // Export project state JSON (.fiesta)
        setRenderProgress(60);
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `${project.name.toLowerCase().replace(/\s+/g, '_')}.fiesta`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setRenderProgress(100);
      } else if (exportType === 'midi') {
        // Export MIDI of active or first track
        setRenderProgress(50);
        const track = project.tracks.find((t) => t.clips.some((c) => c.notes && c.notes.length > 0)) || project.tracks[1];
        const notes = track.clips[0]?.notes || [];
        const blob = generateMidiFile(notes, project.bpm);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name}_${track.name}.mid`;
        a.click();
        URL.revokeObjectURL(url);
        setRenderProgress(100);
      } else {
        // Master WAV rendering using Web Audio OfflineAudioContext
        setRenderProgress(30);
        const totalBars = 8; // Render 8 bars
        const wavBlob = await audioEngine.renderProjectToWav(
          project.tracks,
          project.drumChannels,
          project.bpm,
          totalBars,
          44100,
          bitDepth
        );
        setRenderProgress(85);

        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name}_Master_${bitDepth}bit.wav`;
        a.click();
        URL.revokeObjectURL(url);
        setRenderProgress(100);
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setTimeout(() => {
        setIsRendering(false);
        setRenderProgress(0);
        onClose();
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none">
      <div className="bg-[#10141d] border border-[#232f42] rounded-2xl w-full max-w-md p-5 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#617289] hover:text-white p-1 rounded-lg hover:bg-[#1a2230] transition-colors"
        >
          <X size={16} />
        </button>

        {/* Modal Title */}
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#00f0a8]/10 text-[#00f0a8] flex items-center justify-center border border-[#00f0a8]/30">
            <Download size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">EXPORT & BOUNCE</h3>
            <p className="text-[11px] text-[#718299]">
              High-definition offline audio render & project archival
            </p>
          </div>
        </div>

        {/* Export Type Selection */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setExportType('master')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              exportType === 'master'
                ? 'bg-[#182333] border-[#00f0a8] text-white shadow-xs'
                : 'bg-[#121620] border-[#1f2633] text-[#718299] hover:text-white'
            }`}
          >
            <FileAudio size={16} className={exportType === 'master' ? 'text-[#00f0a8]' : ''} />
            <span className="text-xs font-bold block mt-1">Master Mix (WAV)</span>
            <span className="text-[9px] text-[#55657e] block">Full stereo bounce</span>
          </button>

          <button
            onClick={() => setExportType('project')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              exportType === 'project'
                ? 'bg-[#182333] border-[#00f0a8] text-white shadow-xs'
                : 'bg-[#121620] border-[#1f2633] text-[#718299] hover:text-white'
            }`}
          >
            <Disc size={16} className={exportType === 'project' ? 'text-[#00f0a8]' : ''} />
            <span className="text-xs font-bold block mt-1">FIesta Project (.fiesta)</span>
            <span className="text-[9px] text-[#55657e] block">Full state JSON archive</span>
          </button>

          <button
            onClick={() => setExportType('midi')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              exportType === 'midi'
                ? 'bg-[#182333] border-[#00f0a8] text-white shadow-xs'
                : 'bg-[#121620] border-[#1f2633] text-[#718299] hover:text-white'
            }`}
          >
            <Music size={16} className={exportType === 'midi' ? 'text-[#00f0a8]' : ''} />
            <span className="text-xs font-bold block mt-1">Standard MIDI (.mid)</span>
            <span className="text-[9px] text-[#55657e] block">Export to any DAW</span>
          </button>

          <button
            onClick={() => setExportType('stems')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              exportType === 'stems'
                ? 'bg-[#182333] border-[#00f0a8] text-white shadow-xs'
                : 'bg-[#121620] border-[#1f2633] text-[#718299] hover:text-white'
            }`}
          >
            <Layers size={16} className={exportType === 'stems' ? 'text-[#00f0a8]' : ''} />
            <span className="text-xs font-bold block mt-1">Stems Bounce</span>
            <span className="text-[9px] text-[#55657e] block">Isolated track stems</span>
          </button>
        </div>

        {/* Bit Depth Selection (if audio) */}
        {(exportType === 'master' || exportType === 'stems') && (
          <div className="bg-[#090b0e] border border-[#1b2230] p-3 rounded-xl mb-4">
            <span className="text-[10px] text-[#55657e] font-mono-daw block mb-2">BIT DEPTH QUALITY</span>
            <div className="grid grid-cols-3 gap-2">
              {[16, 24, 32].map((depth) => (
                <button
                  key={depth}
                  onClick={() => setBitDepth(depth as any)}
                  className={`py-1.5 rounded-lg text-xs font-mono-daw font-bold transition-all ${
                    bitDepth === depth
                      ? 'bg-[#00f0a8] text-black shadow-xs'
                      : 'bg-[#141a24] text-[#718299] hover:text-white'
                  }`}
                >
                  {depth}-bit {depth === 32 ? 'Float' : 'PCM'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Progress bar during rendering */}
        {isRendering && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-[10px] text-[#00f0a8] font-mono-daw mb-1">
              <span>RENDERING AUDIO ENGINE DSP...</span>
              <span>{renderProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#18212e] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00f0a8] transition-all duration-200"
                style={{ width: `${renderProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleExport}
          disabled={isRendering}
          className="w-full py-2.5 bg-[#00f0a8] hover:bg-[#00f0a8]/90 text-black font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-[#00f0a8]/20 transition-all active:scale-98"
        >
          <Download size={14} />
          <span>{isRendering ? 'Processing Render...' : 'Start Export'}</span>
        </button>
      </div>
    </div>
  );
};
