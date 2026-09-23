/**
 * FIesta Studio - Fruity Loops Style Startup Splash & Loading Screen
 * Features the signature glowing Ferrivox Apple icon, sound engine initialization,
 * and audio driver status.
 */

import React, { useEffect, useState } from 'react';
import { AppleLogo } from './AppleLogo';
import { Sparkles, Volume2, Music, CheckCircle2 } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';

interface AppleLoadingSplashProps {
  isOpen: boolean;
  onClose: () => void;
  isInitialLoad?: boolean;
}

export const AppleLoadingSplash: React.FC<AppleLoadingSplashProps> = ({
  isOpen,
  onClose,
  isInitialLoad = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Web Audio DSP Engine...');

  useEffect(() => {
    if (!isOpen) return;

    setProgress(15);
    const t1 = setTimeout(() => {
      setProgress(45);
      setStatusText('Pre-caching African Percussion & Lizard Lounge DSP Models...');
    }, 300);

    const t2 = setTimeout(() => {
      setProgress(80);
      setStatusText('Configuring 32-Bit Floating Point Mixer & Lookahead Clock...');
    }, 650);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('FIesta Studio Engine Ready.');
    }, 950);

    let t4: any;
    if (isInitialLoad) {
      t4 = setTimeout(() => {
        onClose();
      }, 1400);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (t4) clearTimeout(t4);
    };
  }, [isOpen, isInitialLoad, onClose]);

  if (!isOpen) return null;

  const handleStartAudio = async () => {
    try {
      await audioEngine.init();
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn select-none p-4">
      <div className="w-full max-w-md bg-[#131722] border-2 border-[#2b3548] rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#ff3b69]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-[#00f0a8]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Apple Icon with pulsating audio rings */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-[#ff3b69]/30 via-[#ff6b4a]/20 to-[#00f0a8]/30 animate-ping opacity-40" />
          <div className="w-28 h-28 rounded-2xl bg-[#0c0f15] border border-[#252f40] p-4 flex items-center justify-center shadow-inner relative z-10">
            <AppleLogo size={80} variant="neon" animated={progress < 100} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-white tracking-wider flex items-center gap-2 mt-2">
          <span>FIesta Studio</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-[#ff3b69] text-white font-extrabold uppercase tracking-widest">
            PRO
          </span>
        </h1>
        <p className="text-xs text-[#7e8ea3] mt-0.5 font-medium">
          The Open-Source Browser DAW by <span className="text-[#00f0a8] font-bold">Ferrivox</span>
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-[#090b10] border border-[#1f2635] rounded-full h-2.5 my-5 p-0.5 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#ff3b69] via-[#ff6b4a] to-[#00f0a8] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status text */}
        <div className="flex items-center gap-2 text-xs font-mono-daw text-[#a0aec0] min-h-[20px]">
          {progress >= 100 ? (
            <CheckCircle2 size={14} className="text-[#00f0a8] shrink-0" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-[#ff6b4a] animate-ping shrink-0" />
          )}
          <span className="truncate">{statusText}</span>
        </div>

        {/* Button */}
        <button
          onClick={handleStartAudio}
          className="mt-6 w-full py-2.5 px-4 bg-gradient-to-r from-[#ff3b69] to-[#ff6b4a] hover:from-[#ff4d79] hover:to-[#ff7b5a] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#ff3b69]/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Volume2 size={16} />
          <span>START PRODUCING</span>
        </button>

        <span className="text-[10px] text-[#4f5d73] mt-3">
          Inspired by Fruity Loops workflow • Powered by Rwandan Innovation
        </span>
      </div>
    </div>
  );
};
