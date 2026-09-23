/**
 * FIesta Studio - Fruity Sample & Plugin Hub
 * Splice-style free online sample library, African plugins & drums,
 * Lizard Lounge electric piano, and URL/File sample importer.
 */

import React, { useState } from 'react';
import {
  Search,
  Play,
  Plus,
  Sparkles,
  Download,
  Music,
  Zap,
  Globe,
  Upload,
  Check,
  Volume2,
  X,
  Layers,
} from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';
import { DrumChannel, ProjectState } from '../engine/projectStore';
import { InstrumentType } from '../types/daw';

interface FruitySamplePluginHubProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChannel: (channel: DrumChannel) => void;
  onReplaceChannelSample?: (channelId: string, name: string, type: string, buffer?: AudioBuffer) => void;
  targetChannelId?: string | null;
}

interface HubItem {
  id: string;
  name: string;
  category: 'splice_drums' | 'african' | 'plugins' | 'fx_vocals';
  subCategory: string;
  type: string;
  isPlugin?: boolean;
  instrumentType?: InstrumentType;
  description: string;
  bpm?: number;
  key?: string;
  license: string;
  tags: string[];
}

const HUB_ITEMS: HubItem[] = [
  // --- AFRICAN PLUGINS & DRUMS ---
  {
    id: 'af_logdrum_1',
    name: 'Amapiano Tuned Log Drum',
    category: 'african',
    subCategory: 'Amapiano Bass',
    type: 'amapiano_logdrum',
    description: 'FM square-sub transient with pitch envelope and woody mid knock',
    bpm: 113,
    key: 'F#',
    license: 'Royalty-Free Open DSP',
    tags: ['amapiano', 'logdrum', 'sub', 'south africa', 'bass'],
  },
  {
    id: 'af_inanga_harp',
    name: 'Rwandan Inanga Zither Harp',
    category: 'african',
    subCategory: 'East African Traditional',
    type: 'african_inanga',
    isPlugin: true,
    instrumentType: 'inanga',
    description: 'Authentic boat-shaped trough zither acoustic plucked strings',
    bpm: 108,
    key: 'A Pentatonic',
    license: 'CC0 Cultural Heritage',
    tags: ['rwanda', 'inanga', 'zither', 'harp', 'acoustic', 'pluck'],
  },
  {
    id: 'af_amayugi_bells',
    name: 'Amayugi Ceremonial Ankle Bells',
    category: 'african',
    subCategory: 'Rwandan Percussion',
    type: 'perc_shaker',
    description: 'Metallic seed shaker shimmers worn by traditional Intore dancers',
    bpm: 112,
    license: 'Royalty-Free Open DSP',
    tags: ['rwanda', 'intore', 'amayugi', 'shaker', 'bells'],
  },
  {
    id: 'af_intore_drum',
    name: 'Intore Royal Ceremonial Drum',
    category: 'african',
    subCategory: 'Rwandan Drums',
    type: 'kick',
    description: 'Deep acoustic wooden barrel drum with animal hide thump',
    key: 'D',
    license: 'CC0 Cultural Heritage',
    tags: ['rwanda', 'intore', 'drum', 'royal', 'thump'],
  },
  {
    id: 'af_talking_drum',
    name: 'West African Talking Drum',
    category: 'african',
    subCategory: 'West African Percussion',
    type: 'african_talkingdrum',
    description: 'Hourglass squeeze drum with dynamic pitch inflection',
    license: 'Royalty-Free Open DSP',
    tags: ['talking drum', 'nigeria', 'yoruba', 'percussion', 'pitch bend'],
  },
  {
    id: 'af_djembe_kit',
    name: 'African Djembe Master Slap',
    category: 'african',
    subCategory: 'Hand Percussion',
    type: 'african_djembe',
    description: 'Resonant goat skin bass tone combined with sharp edge slap',
    license: 'Royalty-Free Open DSP',
    tags: ['djembe', 'mali', 'hand drum', 'slap', 'acoustic'],
  },
  {
    id: 'af_kalimba_thumb',
    name: 'Kalimba / Mbira Thumb Piano',
    category: 'african',
    subCategory: 'African Chimes',
    type: 'african_kalimba',
    isPlugin: true,
    instrumentType: 'kalimba',
    description: 'Steel tines mounted on hollow wooden gourd with bell overtones',
    key: 'C Major',
    license: 'Royalty-Free Open DSP',
    tags: ['kalimba', 'mbira', 'thumb piano', 'zimbabwe', 'bell'],
  },
  {
    id: 'af_balafon_marimba',
    name: 'Balafon Wooden Marimba',
    category: 'african',
    subCategory: 'African Mallets',
    type: 'african_balafon',
    isPlugin: true,
    instrumentType: 'balafon',
    description: 'Wooden tuned slats with buzzing spider-egg gourd resonators',
    key: 'G',
    license: 'Royalty-Free Open DSP',
    tags: ['balafon', 'marimba', 'mallet', 'wooden', 'buzz'],
  },

  // --- FREE SPLICE PLUGINS & VIRTUAL KEYS ---
  {
    id: 'plugin_lizard_lounge',
    name: 'Lizard Lounge E-Piano',
    category: 'plugins',
    subCategory: 'Electric Piano / Rhodes',
    type: 'lounge_lizard',
    isPlugin: true,
    instrumentType: 'lounge_lizard',
    description: 'Physical modeling Rhodes with tine chime, tube bark, and stereo tremolo',
    license: 'Royalty-Free Open DSP',
    tags: ['rhodes', 'lounge lizard', 'electric piano', 'neo-soul', 'tremolo', 'keys'],
  },
  {
    id: 'plugin_grand_piano',
    name: 'Grand Concert Piano',
    category: 'plugins',
    subCategory: 'Acoustic Piano',
    type: 'piano',
    isPlugin: true,
    instrumentType: 'piano',
    description: 'Rich 3-harmonic acoustic piano with hammer transients and damper release',
    license: 'Royalty-Free Open DSP',
    tags: ['piano', 'acoustic', 'grand', 'keys'],
  },
  {
    id: 'plugin_808_sub_synth',
    name: 'Sub 808 Analog Bass',
    category: 'plugins',
    subCategory: 'Synth Bass',
    type: '808',
    isPlugin: true,
    instrumentType: '808',
    description: 'Heavy saturated sub bass with variable pitch decay and wave shaping',
    license: 'Royalty-Free Open DSP',
    tags: ['808', 'sub', 'trap', 'bass', 'synth'],
  },

  // --- FREE SPLICE DRUM SAMPLES & ONE-SHOTS ---
  {
    id: 'sp_kick_trap',
    name: 'Splice Punchy Club Kick',
    category: 'splice_drums',
    subCategory: 'Kicks',
    type: 'kick',
    description: 'Tight 50Hz punch designed to cut through dense modern mixes',
    license: 'CC0 Royalty-Free',
    tags: ['kick', 'punchy', 'club', 'trap', 'splice'],
  },
  {
    id: 'sp_snare_tight',
    name: 'Splice Studio Crisp Snare',
    category: 'splice_drums',
    subCategory: 'Snares',
    type: 'snare',
    description: 'Dual layer snare with 180Hz acoustic body and highpass noise sizzle',
    license: 'CC0 Royalty-Free',
    tags: ['snare', 'tight', 'crisp', 'splice'],
  },
  {
    id: 'sp_clap_stack',
    name: 'Splice Triple Stack Clap',
    category: 'splice_drums',
    subCategory: 'Claps',
    type: 'clap',
    description: 'Multi-burst hand clap stack with stereo spread and room reverb tail',
    license: 'CC0 Royalty-Free',
    tags: ['clap', 'stack', 'afrobeats', 'trap', 'splice'],
  },
  {
    id: 'sp_hat_closed',
    name: 'Splice Sizzle Hi-Hat',
    category: 'splice_drums',
    subCategory: 'Hi-Hats',
    type: 'hihat_closed',
    description: 'Ultra-crisp 9kHz metallic hi-hat transient with tight release',
    license: 'CC0 Royalty-Free',
    tags: ['hihat', 'closed', 'sizzle', 'splice'],
  },
  {
    id: 'sp_hat_open',
    name: 'Splice Air Open Hat',
    category: 'splice_drums',
    subCategory: 'Hi-Hats',
    type: 'hihat_open',
    description: 'Airy 350ms open cymbal decay for offbeat groove momentum',
    license: 'CC0 Royalty-Free',
    tags: ['open hat', 'cymbal', 'splice'],
  },
  {
    id: 'sp_rim_click',
    name: 'Splice Wooden Rimshot',
    category: 'splice_drums',
    subCategory: 'Rimshots',
    type: 'rim',
    description: 'Organic acoustic cross-stick rimshot click with sharp transient',
    license: 'CC0 Royalty-Free',
    tags: ['rimshot', 'rim', 'acoustic', 'afrobeats', 'splice'],
  },

  // --- VOCALS & FX ---
  {
    id: 'fx_shaker_groove',
    name: 'Afrobeat Shaker Roll',
    category: 'fx_vocals',
    subCategory: 'Percussion FX',
    type: 'perc_shaker',
    description: 'Natural organic seed shaker stroke with micro-timing swing',
    license: 'CC0 Royalty-Free',
    tags: ['shaker', 'afrobeats', 'groove', 'percussion'],
  },
  {
    id: 'fx_808_boom',
    name: 'Long Distorted 808 Glide',
    category: 'fx_vocals',
    subCategory: 'Bass FX',
    type: '808_sub',
    description: 'Warm tape-saturated sub boom tuned to low C1',
    license: 'CC0 Royalty-Free',
    tags: ['808', 'boom', 'sub', 'glide'],
  },
];

export const FruitySamplePluginHub: React.FC<FruitySamplePluginHubProps> = ({
  isOpen,
  onClose,
  onAddChannel,
  onReplaceChannelSample,
  targetChannelId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlStatus, setUrlStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter items
  const filteredItems = HUB_ITEMS.filter((item) => {
    const matchesCat =
      selectedCategory === 'all' ||
      item.category === selectedCategory ||
      (selectedCategory === 'african' && item.category === 'african') ||
      (selectedCategory === 'plugins' && item.isPlugin) ||
      (selectedCategory === 'splice_drums' && item.category === 'splice_drums');

    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  // Audition item
  const handleAudition = (item: HubItem) => {
    if (item.isPlugin && item.instrumentType) {
      audioEngine.playInstrumentNote(item.instrumentType, 60, 0.9, 0.6); // Middle C
    } else {
      audioEngine.triggerDrum(item.type, 0.95);
    }
  };

  // Add as new channel
  const handleAddItem = (item: HubItem) => {
    if (targetChannelId && onReplaceChannelSample) {
      onReplaceChannelSample(targetChannelId, item.name, item.type);
      onClose();
      return;
    }

    const newChannel: DrumChannel = {
      id: `chan_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: item.name,
      type: item.type,
      steps: Array(16).fill(false),
      velocities: Array(16).fill(0.9),
      volume: 1.0,
      pan: 0,
      pitch: 0,
      mute: false,
      solo: false,
    };
    onAddChannel(newChannel);
    onClose();
  };

  // Download & load online sample URL
  const handleLoadUrl = async () => {
    if (!urlInput.trim()) return;
    setIsLoadingUrl(true);
    setUrlStatus('Fetching audio from URL...');
    try {
      const buffer = await audioEngine.loadSampleFromUrl(urlInput.trim());
      const sampleName = urlInput.split('/').pop()?.split('?')[0] || 'Online Sample';

      if (targetChannelId && onReplaceChannelSample) {
        onReplaceChannelSample(targetChannelId, sampleName, 'custom', buffer);
      } else {
        const newChannel: DrumChannel = {
          id: `chan_${Date.now()}`,
          name: sampleName.replace(/\.[^/.]+$/, ''),
          type: 'custom',
          steps: Array(16).fill(false),
          velocities: Array(16).fill(0.9),
          volume: 1.0,
          pan: 0,
          pitch: 0,
          mute: false,
          solo: false,
          audioBuffer: buffer,
          customSampleUrl: urlInput.trim(),
        };
        onAddChannel(newChannel);
      }
      setUrlStatus('Loaded successfully!');
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setUrlStatus(`Error: ${err.message || 'Failed to decode audio file'}`);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  // Handle local file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioEngine.decodeAudioData(arrayBuffer);
      const name = file.name.replace(/\.[^/.]+$/, '');

      if (targetChannelId && onReplaceChannelSample) {
        onReplaceChannelSample(targetChannelId, name, 'custom', buffer);
      } else {
        const newChannel: DrumChannel = {
          id: `chan_${Date.now()}`,
          name: name,
          type: 'custom',
          steps: Array(16).fill(false),
          velocities: Array(16).fill(0.9),
          volume: 1.0,
          pan: 0,
          pitch: 0,
          mute: false,
          solo: false,
          audioBuffer: buffer,
        };
        onAddChannel(newChannel);
      }
      onClose();
    } catch (err: any) {
      alert(`Could not load audio file: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[85vh] bg-[#141824] border border-[#2b3548] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 bg-[#1b2232] border-b border-[#293448] px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#ff3b69] to-[#ff6b4a] flex items-center justify-center text-white shadow-md">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <span>Free Splice Sound Hub & African Plugins</span>
                <span className="text-[10px] bg-[#00f0a8]/20 text-[#00f0a8] px-2 py-0.5 rounded font-mono-daw border border-[#00f0a8]/30">
                  Royalty-Free
                </span>
              </h2>
              <p className="text-[11px] text-[#71829e]">
                {targetChannelId ? 'Select sound to replace channel' : 'Add authentic drums, instruments & free online samples'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#242e42] hover:bg-[#32405c] text-[#8e9eb5] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="p-4 bg-[#161c2b] border-b border-[#242e42] flex flex-wrap gap-3 items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a6c88]" />
            <input
              type="text"
              placeholder="Search African drums, Lizard Lounge, kicks, snares, 808s..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-[#0e121c] border border-[#263347] rounded-lg text-xs text-white placeholder-[#5a6c88] focus:outline-none focus:border-[#00f0a8]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'All Sounds' },
              { id: 'african', label: '🍎 African & Rwandan' },
              { id: 'plugins', label: '🎹 Lizard Lounge & Keys' },
              { id: 'splice_drums', label: '🥁 Free Splice Drums' },
              { id: 'fx_vocals', label: '✨ FX & Vocals' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#ff3b69] text-white shadow-md shadow-[#ff3b69]/30'
                    : 'bg-[#1c2436] hover:bg-[#253046] text-[#8fa0b8]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Online URL & Local File Upload Banner */}
        <div className="bg-[#10141f] border-b border-[#20293a] px-4 py-2.5 flex flex-wrap gap-3 items-center justify-between text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <Globe size={14} className="text-[#00f0a8]" />
            <input
              type="url"
              placeholder="Paste free sample URL (e.g. from Freesound or web .wav/.mp3)..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-[#161c2b] border border-[#2b374d] rounded px-2.5 py-1 text-xs text-white placeholder-[#4b5a73] focus:outline-none focus:border-[#00f0a8]"
            />
            <button
              onClick={handleLoadUrl}
              disabled={isLoadingUrl || !urlInput.trim()}
              className="px-3 py-1 bg-[#00f0a8] hover:bg-[#00d696] disabled:opacity-40 text-black font-bold text-xs rounded transition-all flex items-center gap-1 cursor-pointer"
            >
              <Download size={12} />
              <span>{isLoadingUrl ? 'Loading...' : 'Load URL'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#5b6e8a]">or</span>
            <label className="px-3 py-1 bg-[#232c3f] hover:bg-[#2e3a52] text-white font-semibold text-xs rounded border border-[#35435e] flex items-center gap-1.5 cursor-pointer transition-colors">
              <Upload size={13} className="text-[#ff6b4a]" />
              <span>Import Audio File</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          {urlStatus && <span className="w-full text-[10px] text-[#00f0a8]">{urlStatus}</span>}
        </div>

        {/* Sound Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#161b28] hover:bg-[#1d2436] border border-[#232d40] hover:border-[#3b4b6b] rounded-xl p-3 flex items-center justify-between transition-all group shadow-sm"
            >
              <div className="flex items-start space-x-3 pr-2 min-w-0">
                {/* Play / Audition Button */}
                <button
                  onClick={() => handleAudition(item)}
                  title="Audition sound"
                  className="w-10 h-10 rounded-xl bg-[#222b3d] hover:bg-[#ff3b69] text-[#00f0a8] hover:text-white flex items-center justify-center shrink-0 transition-all shadow-inner active:scale-95 cursor-pointer"
                >
                  <Play size={16} className="fill-current ml-0.5" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-white truncate group-hover:text-[#00f0a8] transition-colors">
                      {item.name}
                    </span>
                    {item.isPlugin && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#ff3b69]/20 text-[#ff3b69] border border-[#ff3b69]/30 font-bold">
                        PLUGIN
                      </span>
                    )}
                    {item.key && (
                      <span className="text-[9px] text-[#f59e0b] font-mono-daw">
                        {item.key}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#71829e] line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-[#4b5a73] font-mono-daw">
                      {item.subCategory}
                    </span>
                    <span className="text-[9px] text-[#00f0a8]/80 font-mono-daw">
                      {item.license}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add Button */}
              <button
                onClick={() => handleAddItem(item)}
                className="px-3 py-1.5 bg-[#253046] hover:bg-[#00f0a8] text-[#8fa1b8] hover:text-black font-bold text-xs rounded-lg transition-all flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer"
              >
                <Plus size={14} />
                <span>{targetChannelId ? 'Select' : 'Add'}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="h-10 bg-[#10141f] border-t border-[#1d2433] px-5 flex items-center justify-between text-[11px] text-[#5d6f8a] shrink-0">
          <span>{filteredItems.length} sounds & plugins available</span>
          <span>100% Free & Open-Source • No license fees</span>
        </div>
      </div>
    </div>
  );
};
