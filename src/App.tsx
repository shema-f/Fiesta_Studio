/**
 * FIesta Studio - Main Application Container
 * Full-featured browser-based Digital Audio Workstation.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Layers,
  Grid,
  Music,
  Sliders,
  Sparkles,
  FolderOpen,
  Zap,
  Mic,
  Activity,
  Cpu,
  HelpCircle,
  X,
} from 'lucide-react';
import { ProjectState, getInitialProjectState } from './engine/projectStore';
import { audioEngine } from './audio/audioEngine';
import { micRecorder } from './audio/recorder';
import { ViewMode, Clip } from './types/daw';

// Components
import { TransportBar } from './components/TransportBar';
import { ArrangementView } from './components/ArrangementView';
import { ChannelRack } from './components/ChannelRack';
import { PianoRoll } from './components/PianoRoll';
import { MixerRack } from './components/MixerRack';
import { InstrumentPanel } from './components/InstrumentPanel';
import { EffectsRack } from './components/EffectsRack';
import { SampleHubView } from './samples/SampleHubView';
import { AIAssistant } from './components/AIAssistant';
import { ExportModal } from './components/ExportModal';
import { CommandPalette } from './components/CommandPalette';
import { AppleLogo } from './components/AppleLogo';
import { AppleLoadingSplash } from './components/AppleLoadingSplash';
import { DawTheme } from './types/daw';

export function App() {
  const [project, setProject] = useState<ProjectState>(getInitialProjectState);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSplashOpen, setIsSplashOpen] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<DawTheme>(() => {
    return (localStorage.getItem('fiesta_theme') as DawTheme) || 'fl-classic';
  });

  const handleSelectTheme = (thm: DawTheme) => {
    setCurrentTheme(thm);
    try {
      localStorage.setItem('fiesta_theme', thm);
    } catch {}
  };

  // Keep a ref of project state for audio scheduler callbacks
  const projectRef = useRef(project);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  // Show toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // State updater with automatic undo history snapshots
  const updateProjectWithHistory = useCallback((updater: (prev: ProjectState) => ProjectState) => {
    setProject((prev) => {
      // Save current state into past
      const snapshot = JSON.stringify({
        tracks: prev.tracks,
        drumChannels: prev.drumChannels,
        bpm: prev.bpm,
        name: prev.name,
      });

      const next = updater(prev);
      const newPast = [snapshot, ...prev.past].slice(0, 30); // Max 30 undo steps
      return {
        ...next,
        past: newPast,
        future: [],
      };
    });
  }, []);

  // Simple state updater without adding to history (for high frequency timeline ticks)
  const updateProjectQuiet = useCallback((updater: (prev: ProjectState) => ProjectState) => {
    setProject(updater);
  }, []);

  // Undo / Redo
  const handleUndo = () => {
    setProject((prev) => {
      if (prev.past.length === 0) return prev;
      const [previousStateStr, ...remainingPast] = prev.past;
      const currentSnapshot = JSON.stringify({
        tracks: prev.tracks,
        drumChannels: prev.drumChannels,
        bpm: prev.bpm,
        name: prev.name,
      });

      const parsed = JSON.parse(previousStateStr);
      return {
        ...prev,
        ...parsed,
        past: remainingPast,
        future: [currentSnapshot, ...prev.future],
      };
    });
    showToast('Undo performed');
  };

  const handleRedo = () => {
    setProject((prev) => {
      if (prev.future.length === 0) return prev;
      const [nextStateStr, ...remainingFuture] = prev.future;
      const currentSnapshot = JSON.stringify({
        tracks: prev.tracks,
        drumChannels: prev.drumChannels,
        bpm: prev.bpm,
        name: prev.name,
      });

      const parsed = JSON.parse(nextStateStr);
      return {
        ...prev,
        ...parsed,
        past: [currentSnapshot, ...prev.past],
        future: remainingFuture,
      };
    });
    showToast('Redo performed');
  };

  // Save Project locally
  const handleSave = () => {
    try {
      localStorage.setItem('fiesta_autosave_v1', JSON.stringify(project));
      updateProjectQuiet((p) => ({ ...p, lastSavedAt: Date.now() }));
      showToast('Project saved to local vault');
    } catch (e) {
      console.error('Save failed', e);
    }
  };

  // Autosave interval
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        localStorage.setItem('fiesta_autosave_v1', JSON.stringify(projectRef.current));
      } catch {}
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Hook up lookahead scheduler to Web Audio Engine
  useEffect(() => {
    const unbind = audioEngine.onStep((step, time) => {
      const p = projectRef.current;
      if (!p.isPlaying) return;

      const barNumber = Math.floor(step / 16) + 1;
      const beatInBar = Math.floor((step % 16) / 4) + 1;
      const stepInBeat = (step % 4) + 1;
      const continuousBar = 1 + step / 16;

      // Check loop wrap-around
      if (p.isLooping && continuousBar >= p.loopEndBar) {
        audioEngine.stopPlayback();
        const startStep = (p.loopStartBar - 1) * 16;
        audioEngine.startPlayback(startStep);
        return;
      }

      // Solo Check: if ANY track has solo enabled, automatically mute all other tracks
      const hasAnySolo = p.tracks.some((t) => t.solo);

      // 1. Play active drum channels for this 16th step
      const drumTrack = p.tracks.find((t) => t.id === 'track_drums' || t.type === 'drums');
      const drumsAudible = (!drumTrack || !drumTrack.mute) && (!hasAnySolo || (drumTrack && drumTrack.solo));

      if (drumsAudible) {
        const patternStep = step % p.activePatternStepCount;
        for (const channel of p.drumChannels) {
          if (!channel.mute && channel.steps[patternStep]) {
            const vel = (channel.velocities[patternStep] ?? 0.85) * (channel.volume ?? 1.0);
            audioEngine.triggerDrum(
              channel.type,
              vel,
              time,
              'bus_drums',
              channel.pitch,
              channel.audioBuffer,
              channel.pan ?? 0
            );
          }
        }
      }

      // 2. Play active MIDI tracks / clips for this step
      for (const track of p.tracks) {
        // If track is muted, or another track is soloed and this one is not soloed -> automatically muted
        if (track.mute) continue;
        if (hasAnySolo && !track.solo) continue;

        for (const clip of track.clips) {
          const clipStartStep = Math.round((clip.startBar - 1) * 16);
          const clipEndStep = clipStartStep + Math.round(clip.lengthBars * 16);

          // Audio clip buffer playback at start step
          if (clip.type === 'audio' && clip.audioBuffer && step === clipStartStep) {
            audioEngine.playAudioBuffer(
              clip.audioBuffer,
              time,
              track.busId || 'bus_vocals',
              (clip.volume ?? 1.0) * (track.volume ?? 1.0)
            );
          }

          // MIDI / Instrument note playback
          if (clip.notes && clip.notes.length > 0) {
            if (step >= clipStartStep && step < clipEndStep) {
              const relativeStep = step - clipStartStep;
              const activeNotes = clip.notes.filter((n) => n.startStep === relativeStep);
              for (const note of activeNotes) {
                const durationSec = (note.durationSteps * 60) / p.bpm / 4;
                audioEngine.playInstrumentNote(
                  track.instrumentType || 'piano',
                  note.midi,
                  (note.velocity || 0.85) * (track.volume ?? 1.0),
                  durationSec,
                  time,
                  track.busId || 'bus_instruments'
                );
              }
            }
          }
        }
      }

      // Update UI playhead
      updateProjectQuiet((prev) => ({
        ...prev,
        current16thStep: step,
        playheadBar: continuousBar,
      }));
    });

    return () => unbind();
  }, [updateProjectQuiet]);

  // Synchronize metronome and swing settings with audio engine
  useEffect(() => {
    audioEngine.setMetronome(project.metronome);
    if (typeof project.metronomeVolume === 'number') {
      audioEngine.setMetronomeVolume(project.metronomeVolume);
    }
  }, [project.metronome, project.metronomeVolume]);

  useEffect(() => {
    audioEngine.setSwing(project.swing || 0);
  }, [project.swing]);

  // Play / Pause toggle
  const handleTogglePlay = async () => {
    await audioEngine.init();
    if (project.isPlaying) {
      audioEngine.stopPlayback();
      updateProjectQuiet((p) => ({ ...p, isPlaying: false }));
    } else {
      const startStep = Math.max(0, Math.floor((project.playheadBar - 1) * 16));
      audioEngine.setBpm(project.bpm);
      audioEngine.setSwing(project.swing);
      audioEngine.setMetronome(project.metronome);
      if (typeof project.metronomeVolume === 'number') {
        audioEngine.setMetronomeVolume(project.metronomeVolume);
      }
      audioEngine.startPlayback(startStep);
      updateProjectQuiet((p) => ({ ...p, isPlaying: true }));
    }
  };

  // Stop playback and rewind to bar 1 or loop start
  const handleStop = () => {
    audioEngine.stopPlayback();
    const rewindBar = project.isLooping ? project.loopStartBar : 1;
    updateProjectQuiet((p) => ({
      ...p,
      isPlaying: false,
      isRecording: false,
      playheadBar: rewindBar,
      current16thStep: (rewindBar - 1) * 16,
    }));
  };

  // Record Microphone audio straight into timeline
  const handleToggleRecord = async () => {
    if (project.isRecording) {
      // Stop recording and process buffer
      try {
        const result = await micRecorder.stop();
        showToast('Recording processed! Adding vocal stem to timeline...');

        // Add as a new audio clip on the vocal audio track
        const newClip: Clip = {
          id: 'mic_clip_' + Date.now(),
          trackId: 'track_audio',
          type: 'audio',
          name: 'Vocal Recording ' + new Date().toLocaleTimeString(),
          startBar: project.playheadBar,
          lengthBars: Math.max(1, Math.ceil(result.buffer.duration / 2)),
          color: '#a855f7',
          waveformPoints: result.waveform,
          audioBuffer: result.buffer,
        };

        updateProjectWithHistory((p) => ({
          ...p,
          isRecording: false,
          tracks: p.tracks.map((t) => (t.id === 'track_audio' ? { ...t, clips: [...t.clips, newClip] } : t)),
          viewMode: 'arrangement',
        }));
      } catch (err) {
        console.error('Error stopping recording:', err);
        updateProjectQuiet((p) => ({ ...p, isRecording: false }));
      }
    } else {
      // Start recording
      try {
        await micRecorder.start();
        updateProjectQuiet((p) => ({ ...p, isRecording: true }));
        showToast('Microphone recording active. Speak or sing!');
      } catch (err) {
        console.error('Could not access microphone:', err);
        showToast('Microphone permission required for audio recording');
      }
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        if (!e.ctrlKey && !e.metaKey) {
          handleToggleRecord();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen(true);
      } else if (e.key === '1') {
        updateProjectQuiet((p) => ({ ...p, viewMode: 'arrangement' }));
      } else if (e.key === '2') {
        updateProjectQuiet((p) => ({ ...p, viewMode: 'channelRack' }));
      } else if (e.key === '3') {
        updateProjectQuiet((p) => ({ ...p, viewMode: 'pianoRoll' }));
      } else if (e.key === '4') {
        updateProjectQuiet((p) => ({ ...p, viewMode: 'mixer' }));
      } else if (e.key === '5') {
        updateProjectQuiet((p) => ({ ...p, viewMode: 'instruments' }));
      } else if (e.key === '6') {
        updateProjectQuiet((p) => ({ ...p, viewMode: 'sampleHub' }));
      } else if (e.key === '7') {
        updateProjectQuiet((p) => ({ ...p, viewMode: 'aiAssistant' }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleToggleRecord, handleUndo, handleRedo, handleSave]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090b0e] text-[#b0c0d6] font-sans select-none">
      {/* 1. TOP TRANSPORT HEADER */}
      <TransportBar
        project={project}
        onUpdateProject={updateProjectQuiet}
        onTogglePlay={handleTogglePlay}
        onStop={handleStop}
        onToggleRecord={handleToggleRecord}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenCommandPalette={() => setIsPaletteOpen(true)}
        onOpenSplash={() => setIsSplashOpen(true)}
      />

      {/* 2. MAIN WORKSPACE VIEW (Timeline, Sequencer, Piano Roll, Mixer, Instruments, Effects, Samples, AI) */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Fruity Loops Style Background Apple Silhouette Watermark */}
        <div className="absolute right-4 bottom-4 pointer-events-none opacity-[0.04] text-white select-none z-0">
          <AppleLogo size={420} variant="watermark" />
        </div>

        {project.viewMode === 'arrangement' && (
          <ArrangementView
            project={project}
            onUpdateProject={updateProjectWithHistory}
            onSelectTrack={(trackId) => updateProjectQuiet((p) => ({ ...p, activeTrackId: trackId }))}
            onSelectClip={(clip) => updateProjectQuiet((p) => ({ ...p, activeClipId: clip.id }))}
          />
        )}

        {project.viewMode === 'channelRack' && (
          <ChannelRack
            project={project}
            onUpdateProject={updateProjectWithHistory}
            currentTheme={currentTheme}
            onSelectTheme={handleSelectTheme}
            onOpenPianoRollForChannel={() => {
              updateProjectQuiet((p) => ({ ...p, viewMode: 'pianoRoll' }));
            }}
          />
        )}

        {project.viewMode === 'pianoRoll' && (
          <PianoRoll
            project={project}
            onUpdateProject={updateProjectWithHistory}
          />
        )}

        {project.viewMode === 'mixer' && (
          <MixerRack
            project={project}
            onUpdateProject={updateProjectWithHistory}
          />
        )}

        {project.viewMode === 'instruments' && (
          <InstrumentPanel
            currentInstrument={project.activeInstrumentType}
            onSelectInstrument={(inst) =>
              updateProjectQuiet((p) => ({ ...p, activeInstrumentType: inst }))
            }
          />
        )}

        {project.viewMode === 'effects' && (
          <EffectsRack
            project={project}
            onUpdateProject={updateProjectWithHistory}
          />
        )}

        {project.viewMode === 'sampleHub' && (
          <SampleHubView
            project={project}
            onUpdateProject={updateProjectWithHistory}
          />
        )}

        {project.viewMode === 'aiAssistant' && (
          <AIAssistant
            project={project}
            onUpdateProject={updateProjectWithHistory}
          />
        )}
      </main>

      {/* 3. BOTTOM DOCK NAVIGATION & SYSTEM STATUS BAR */}
      <footer className="h-10 bg-[#0d1016] border-t border-[#1a2230] px-3 flex items-center justify-between text-xs shrink-0 select-none z-30">
        {/* Workspace View Mode Dock */}
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-1">
          <button
            onClick={() => updateProjectQuiet((p) => ({ ...p, viewMode: 'arrangement' }))}
            className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center space-x-1.5 transition-colors ${
              project.viewMode === 'arrangement' ? 'bg-[#1e2736] text-[#00f0a8]' : 'text-[#6b7c93] hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>Timeline</span>
          </button>

          <button
            onClick={() => updateProjectQuiet((p) => ({ ...p, viewMode: 'channelRack' }))}
            className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center space-x-1.5 transition-colors ${
              project.viewMode === 'channelRack' ? 'bg-[#1e2736] text-[#ff3b69]' : 'text-[#6b7c93] hover:text-white'
            }`}
          >
            <Grid size={13} />
            <span>Beat Rack</span>
          </button>

          <button
            onClick={() => updateProjectQuiet((p) => ({ ...p, viewMode: 'pianoRoll' }))}
            className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center space-x-1.5 transition-colors ${
              project.viewMode === 'pianoRoll' ? 'bg-[#1e2736] text-[#00f0a8]' : 'text-[#6b7c93] hover:text-white'
            }`}
          >
            <Music size={13} />
            <span>Piano Roll</span>
          </button>

          <button
            onClick={() => updateProjectQuiet((p) => ({ ...p, viewMode: 'mixer' }))}
            className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center space-x-1.5 transition-colors ${
              project.viewMode === 'mixer' ? 'bg-[#1e2736] text-[#38bdf8]' : 'text-[#6b7c93] hover:text-white'
            }`}
          >
            <Sliders size={13} />
            <span>Mixer</span>
          </button>

          <button
            onClick={() => updateProjectQuiet((p) => ({ ...p, viewMode: 'instruments' }))}
            className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center space-x-1.5 transition-colors ${
              project.viewMode === 'instruments' ? 'bg-[#1e2736] text-[#ec4899]' : 'text-[#6b7c93] hover:text-white'
            }`}
          >
            <Zap size={13} />
            <span>Instruments</span>
          </button>

          <button
            onClick={() => updateProjectQuiet((p) => ({ ...p, viewMode: 'effects' }))}
            className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center space-x-1.5 transition-colors ${
              project.viewMode === 'effects' ? 'bg-[#1e2736] text-[#f59e0b]' : 'text-[#6b7c93] hover:text-white'
            }`}
          >
            <Activity size={13} />
            <span>FX Inserts</span>
          </button>

          <button
            onClick={() => updateProjectQuiet((p) => ({ ...p, viewMode: 'sampleHub' }))}
            className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center space-x-1.5 transition-colors ${
              project.viewMode === 'sampleHub' ? 'bg-[#1e2736] text-[#a855f7]' : 'text-[#6b7c93] hover:text-white'
            }`}
          >
            <FolderOpen size={13} />
            <span>Sound Hub</span>
          </button>

          <button
            onClick={() => updateProjectQuiet((p) => ({ ...p, viewMode: 'aiAssistant' }))}
            className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center space-x-1.5 transition-colors ${
              project.viewMode === 'aiAssistant' ? 'bg-[#00f0a8]/20 text-[#00f0a8] border border-[#00f0a8]/40' : 'text-[#00f0a8]/70 hover:text-[#00f0a8]'
            }`}
          >
            <Sparkles size={13} />
            <span>FIesta AI</span>
          </button>
        </div>

        {/* System & Audio Engine Status */}
        <div className="hidden md:flex items-center space-x-3 text-[10px] font-mono-daw text-[#4b586e]">
          <span className="flex items-center space-x-1">
            <Cpu size={11} className="text-[#00f0a8]" />
            <span>CPU 2%</span>
          </span>
          <span>•</span>
          <span>44.1 kHz</span>
          <span>•</span>
          <span>32-BIT DSP</span>
          <span>•</span>
          <span className="text-[#00f0a8]">LATENCY 4.8ms</span>
        </div>
      </footer>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-14 right-5 z-50 bg-[#16202e] border border-[#00f0a8]/40 text-white text-xs px-3.5 py-2 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#00f0a8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
      />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        project={project}
        onUpdateProject={updateProjectQuiet}
        onTogglePlay={handleTogglePlay}
        onStop={handleStop}
        onSave={handleSave}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Apple Loading & Startup Splash Screen */}
      <AppleLoadingSplash
        isOpen={isSplashOpen}
        onClose={() => setIsSplashOpen(false)}
        isInitialLoad={true}
      />
    </div>
  );
}

export default App;
