/**
 * FIesta Studio - Fast Command Palette (Ctrl+K)
 * Universal search and keyboard shortcut launcher for DAW actions.
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Play,
  Square,
  Sparkles,
  Download,
  Save,
  Music,
  Sliders,
  Grid,
  Layers,
  Wand2,
  X,
  HelpCircle,
} from 'lucide-react';
import { ProjectState } from '../engine/projectStore';
import { ViewMode } from '../types/daw';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectState;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
  onTogglePlay: () => void;
  onStop: () => void;
  onSave: () => void;
  onOpenExport: () => void;
  onOpenChangelog?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
  onTogglePlay,
  onStop,
  onSave,
  onOpenExport,
  onOpenChangelog,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const setView = (mode: ViewMode) => {
    onUpdateProject((p) => ({ ...p, viewMode: mode }));
    onClose();
  };

  const commands = [
    {
      id: 'play_toggle',
      title: project.isPlaying ? 'Pause Playback' : 'Start Playback',
      category: 'Transport',
      shortcut: 'Space',
      icon: <Play size={14} className="text-[#00f0a8]" />,
      action: () => {
        onTogglePlay();
        onClose();
      },
    },
    {
      id: 'stop',
      title: 'Stop Playback & Rewind',
      category: 'Transport',
      shortcut: 'Enter',
      icon: <Square size={14} className="text-[#ff3b69]" />,
      action: () => {
        onStop();
        onClose();
      },
    },
    {
      id: 'view_timeline',
      title: 'Open Arrangement Timeline',
      category: 'Navigation',
      shortcut: '1',
      icon: <Layers size={14} className="text-[#38bdf8]" />,
      action: () => setView('arrangement'),
    },
    {
      id: 'view_channel_rack',
      title: 'Open Step Sequencer / Channel Rack',
      category: 'Navigation',
      shortcut: '2',
      icon: <Grid size={14} className="text-[#ff3b69]" />,
      action: () => setView('channelRack'),
    },
    {
      id: 'view_piano_roll',
      title: 'Open MIDI Piano Roll',
      category: 'Navigation',
      shortcut: '3',
      icon: <Music size={14} className="text-[#00f0a8]" />,
      action: () => setView('pianoRoll'),
    },
    {
      id: 'view_mixer',
      title: 'Open Mixer Console',
      category: 'Navigation',
      shortcut: '4',
      icon: <Sliders size={14} className="text-[#f59e0b]" />,
      action: () => setView('mixer'),
    },
    {
      id: 'view_instruments',
      title: 'Open Virtual Instruments Panel',
      category: 'Navigation',
      shortcut: '5',
      icon: <Music size={14} className="text-[#ec4899]" />,
      action: () => setView('instruments'),
    },
    {
      id: 'view_sounds',
      title: 'Open African Sound Hub & Samples',
      category: 'Navigation',
      shortcut: '6',
      icon: <Sparkles size={14} className="text-[#a855f7]" />,
      action: () => setView('sampleHub'),
    },
    {
      id: 'view_ai',
      title: 'Open FIesta AI Co-Producer',
      category: 'AI Assistant',
      shortcut: '7',
      icon: <Sparkles size={14} className="text-[#00f0a8]" />,
      action: () => setView('aiAssistant'),
    },
    {
      id: 'save',
      title: 'Save Project to Local Vault',
      category: 'File',
      shortcut: 'Ctrl+S',
      icon: <Save size={14} className="text-white" />,
      action: () => {
        onSave();
        onClose();
      },
    },
    {
      id: 'export',
      title: 'Export Master Mix / Stems (WAV, MIDI)',
      category: 'File',
      shortcut: 'Ctrl+E',
      icon: <Download size={14} className="text-[#00f0a8]" />,
      action: () => {
        onClose();
        onOpenExport();
      },
    },
    {
      id: 'changelog',
      title: 'View Changelog & Recent Contributions (v0.2.0)',
      category: 'Help',
      shortcut: '⌘L',
      icon: <Sparkles size={14} className="text-[#00f0a8]" />,
      action: () => {
        onClose();
        if (onOpenChangelog) onOpenChangelog();
      },
    },
    {
      id: 'keyboard_help',
      title: 'Keyboard Shortcuts & Quick Start Guide',
      category: 'Help',
      shortcut: '?',
      icon: <HelpCircle size={14} className="text-[#ff3b69]" />,
      action: () => {
        onClose();
        if (onOpenChangelog) onOpenChangelog();
      },
    },
  ];

  const filtered = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/75 backdrop-blur-xs p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#10141d] border border-[#232f42] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-[#1f2633] space-x-2">
          <Search size={16} className="text-[#00f0a8]" />
          <input
            type="text"
            placeholder="Type a command or search (e.g. Piano roll, Amapiano, Export)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-white text-xs outline-none placeholder-[#55657e]"
          />
          <kbd className="text-[10px] text-[#55657e] bg-[#090b0e] px-1.5 py-0.5 rounded border border-[#1f2633] font-mono-daw">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.map((cmd) => (
            <div
              key={cmd.id}
              onClick={cmd.action}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-[#182333] cursor-pointer transition-colors group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded-md bg-[#131720] flex items-center justify-center border border-[#1f2633]">
                  {cmd.icon}
                </div>
                <div>
                  <span className="text-xs font-semibold text-white group-hover:text-[#00f0a8] block transition-colors">
                    {cmd.title}
                  </span>
                  <span className="text-[9px] text-[#55657e] font-mono-daw uppercase">
                    {cmd.category}
                  </span>
                </div>
              </div>

              {cmd.shortcut && (
                <kbd className="text-[9px] bg-[#090b0e] text-[#718299] px-1.5 py-0.5 rounded border border-[#1f2633] font-mono-daw">
                  {cmd.shortcut}
                </kbd>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-4 text-center text-xs text-[#55657e]">
              No commands matching "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
