/**
 * FIesta Studio - Sound Hub & African Music Pack
 * Browse authentic Rwandan, Amapiano, and Afrobeats instruments,
 * verify licenses, audition sounds, and import custom audio files.
 */

import React, { useState } from 'react';
import {
  Search,
  Play,
  Pause,
  Upload,
  ShieldCheck,
  Tag,
  Plus,
  Info,
  Sparkles,
  Music,
  ExternalLink,
} from 'lucide-react';
import { SampleMetadata } from '../types/daw';
import { BUILT_IN_SAMPLES, SAMPLE_CATEGORIES, playSamplePreview } from './sampleLibrary';
import { ProjectState } from '../engine/projectStore';
import { audioEngine } from '../audio/audioEngine';

interface SampleHubViewProps {
  project: ProjectState;
  onUpdateProject: (updater: (prev: ProjectState) => ProjectState) => void;
}

export const SampleHubView: React.FC<SampleHubViewProps> = ({ project, onUpdateProject }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [userSamples, setUserSamples] = useState<SampleMetadata[]>([]);

  // Filter samples
  const allSamples = [...BUILT_IN_SAMPLES, ...userSamples];
  const filteredSamples = allSamples.filter((sample) => {
    const matchesCat =
      selectedCategory === 'All' ||
      sample.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      searchQuery === '' ||
      sample.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sample.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sample.creator.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Audition sample
  const handlePreview = (sample: SampleMetadata) => {
    if (activePreviewId === sample.id) {
      setActivePreviewId(null);
    } else {
      setActivePreviewId(sample.id);
      playSamplePreview(sample);
      setTimeout(() => setActivePreviewId(null), Math.min(3000, sample.durationSec * 1000));
    }
  };

  // Insert into Drum Rack
  const handleInsertToDrums = (sample: SampleMetadata) => {
    const newChannel = {
      id: 'drum_custom_' + Date.now(),
      name: sample.name.slice(0, 16),
      type: sample.url,
      steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      velocities: [0.9, 0, 0, 0, 0.9, 0, 0, 0, 0.9, 0, 0, 0, 0.9, 0, 0, 0],
      volume: 1.0,
      pan: 0,
      pitch: 0,
      mute: false,
      solo: false,
    };

    onUpdateProject((p) => ({
      ...p,
      drumChannels: [...p.drumChannels, newChannel],
    }));
  };

  // Insert into Timeline as an Audio Track clip
  const handleInsertToTimeline = (sample: SampleMetadata) => {
    const newTrack = {
      id: 'track_' + Date.now(),
      name: sample.name.slice(0, 20),
      type: 'audio' as const,
      color: '#00f0a8',
      instrumentType: 'pad' as const,
      volume: 0.9,
      pan: 0,
      mute: false,
      solo: false,
      busId: 'bus_vocals',
      inserts: [],
      clips: [
        {
          id: 'clip_' + Date.now(),
          trackId: 'track_' + Date.now(),
          type: 'audio' as const,
          name: sample.name,
          startBar: project.playheadBar,
          lengthBars: Math.max(1, Math.ceil(sample.durationSec / 2)),
          color: '#00f0a8',
        },
      ],
    };

    onUpdateProject((p) => ({
      ...p,
      tracks: [...p.tracks, newTrack],
      viewMode: 'arrangement',
    }));
  };

  // Upload user sample
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioEngine.decodeAudioData(arrayBuffer);

      const uploadedSample: SampleMetadata = {
        id: 'user_sample_' + Date.now(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        category: 'Custom Uploads',
        subCategory: 'Audio',
        durationSec: audioBuffer.duration,
        source: 'User Device Upload',
        creator: 'User',
        license: 'Royalty-Free',
        attributionRequired: false,
        commercialUse: 'Allowed',
        url: 'blob_' + Date.now(),
        tags: ['custom', 'upload'],
      };

      setUserSamples((prev) => [uploadedSample, ...prev]);
    } catch (err) {
      console.error('Failed to decode user sample:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b0e14] overflow-hidden select-none p-4">
      {/* Sound Hub Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 shrink-0">
        <div>
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f0a8]" />
            FIesta Sound Hub & African Music Pack
          </h2>
          <p className="text-[11px] text-[#718299]">
            Royalty-free African percussion, Rwandan Inanga plucks, Amapiano log drums, and verified open-source libraries.
          </p>
        </div>

        {/* Search Input & Custom Upload Button */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-[#55657e]" />
            <input
              type="text"
              placeholder="Search sounds, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#121620] border border-[#1f2633] text-xs text-white pl-8 pr-3 py-1.5 rounded-lg outline-none focus:border-[#00f0a8] w-48 sm:w-64"
            />
          </div>

          {/* Upload sample */}
          <label className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#18212e] hover:bg-[#222f42] text-white border border-[#273549] rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs">
            <Upload size={13} className="text-[#00f0a8]" />
            <span>Upload</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 mb-3 shrink-0 scrollbar-none">
        {SAMPLE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-[#00f0a8] text-[#0b0e14] shadow-sm'
                : 'bg-[#121620] text-[#718299] hover:text-white border border-[#1f2633]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sample List Table */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredSamples.map((sample) => {
          const isPlaying = activePreviewId === sample.id;

          return (
            <div
              key={sample.id}
              className="bg-[#10141d] border border-[#1b2230] hover:border-[#28364c] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-sm"
            >
              {/* Play Audition Button & Details */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handlePreview(sample)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    isPlaying
                      ? 'bg-[#ff3b69] text-white shadow-lg shadow-[#ff3b69]/40'
                      : 'bg-[#18212e] text-[#00f0a8] hover:bg-[#222f42]'
                  }`}
                  title="Audition Sound"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} className="fill-current" />}
                </button>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{sample.name}</span>
                    <span className="text-[10px] bg-[#1a2230] text-[#00f0a8] px-1.5 py-0.2 rounded border border-[#27364b] font-mono-daw">
                      {sample.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[10px] text-[#55657e] mt-0.5 font-mono-daw">
                    <span>Creator: {sample.creator}</span>
                    <span>•</span>
                    <span>Duration: {sample.durationSec.toFixed(1)}s</span>
                    {sample.bpm && (
                      <>
                        <span>•</span>
                        <span>{sample.bpm} BPM</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* License Verification Layer & Action Buttons */}
              <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1a202c]">
                {/* Strict License Metadata Badge */}
                <div className="flex items-center space-x-1.5 text-[10px] bg-[#090b0e] border border-[#1f2633] px-2 py-1 rounded">
                  <ShieldCheck size={12} className="text-[#00f0a8]" />
                  <span className="text-white font-mono-daw font-bold">{sample.license}</span>
                  <span className="text-[#4b586e]">|</span>
                  <span className="text-[#00f0a8]">{sample.commercialUse}</span>
                </div>

                {/* Add to project buttons */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleInsertToDrums(sample)}
                    title="Insert into Step Sequencer Drum Rack"
                    className="px-2 py-1 bg-[#18212e] hover:bg-[#222f42] text-[#ff3b69] border border-[#2b3952] rounded text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <Plus size={11} />
                    <span>Drums</span>
                  </button>
                  <button
                    onClick={() => handleInsertToTimeline(sample)}
                    title="Insert onto Timeline track"
                    className="px-2 py-1 bg-[#18212e] hover:bg-[#222f42] text-[#00f0a8] border border-[#2b3952] rounded text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <Plus size={11} />
                    <span>Track</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
