/**
 * FIesta Studio - Theme Configuration
 * Multiple Fruity Loops inspired themes with authentic step button color schemes.
 */

import { DawTheme } from '../types/daw';

export interface ThemeColors {
  id: DawTheme;
  name: string;
  description: string;
  windowBg: string;
  headerBg: string;
  borderColor: string;
  beat1Button: {
    bg: string;
    topHighlight: string;
    bottomShadow: string;
    text: string;
  };
  beat2Button: {
    bg: string;
    topHighlight: string;
    bottomShadow: string;
    text: string;
  };
  activeStep: {
    gradient: string;
    glow: string;
    border: string;
  };
  channelButtonBg: string;
  channelButtonBorder: string;
  accentColor: string;
  ledColor: string;
}

export const THEMES: Record<DawTheme, ThemeColors> = {
  'fl-classic': {
    id: 'fl-classic',
    name: 'FL Classic (11/12 Retro)',
    description: 'Iconic silver-gray & burgundy-red step buttons with 3D bevels',
    windowBg: 'bg-[#21242b]',
    headerBg: 'bg-[#2d323b]',
    borderColor: 'border-[#3d4452]',
    beat1Button: {
      bg: 'bg-[#6c7482]',
      topHighlight: 'border-t-[#8b94a3] border-l-[#8b94a3]',
      bottomShadow: 'border-b-[#474d57] border-r-[#474d57]',
      text: 'text-[#d6dbe4]',
    },
    beat2Button: {
      bg: 'bg-[#523d42]',
      topHighlight: 'border-t-[#6b5157] border-l-[#6b5157]',
      bottomShadow: 'border-b-[#332427] border-r-[#332427]',
      text: 'text-[#d9bfc4]',
    },
    activeStep: {
      gradient: 'bg-gradient-to-b from-[#ff8c3a] via-[#ff5b22] to-[#d63a0b]',
      glow: 'shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_0_8px_rgba(255,91,34,0.7)]',
      border: 'border-t-[#ffb076] border-b-[#8c2300] border-x-[#d63a0b]',
    },
    channelButtonBg: 'bg-gradient-to-b from-[#3c424e] to-[#2c313a]',
    channelButtonBorder: 'border-t-[#525a6a] border-b-[#1c2026] border-x-[#2f3540]',
    accentColor: '#ff6200',
    ledColor: '#00ff88',
  },

  'fl-dark': {
    id: 'fl-dark',
    name: 'FL Modern Dark (21/24)',
    description: 'Sleek dark charcoal studio aesthetic with vibrant LED indicators',
    windowBg: 'bg-[#12151c]',
    headerBg: 'bg-[#181c26]',
    borderColor: 'border-[#222836]',
    beat1Button: {
      bg: 'bg-[#404b5c]',
      topHighlight: 'border-t-[#536177] border-l-[#536177]',
      bottomShadow: 'border-b-[#2a323e] border-r-[#2a323e]',
      text: 'text-[#b4c3d8]',
    },
    beat2Button: {
      bg: 'bg-[#2c3340]',
      topHighlight: 'border-t-[#3b4556] border-l-[#3b4556]',
      bottomShadow: 'border-b-[#1b2029] border-r-[#1b2029]',
      text: 'text-[#8fa0b8]',
    },
    activeStep: {
      gradient: 'bg-gradient-to-b from-[#ff5a79] via-[#ff3b69] to-[#d41c4a]',
      glow: 'shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_0_8px_rgba(255,59,105,0.7)]',
      border: 'border-t-[#ff8ea3] border-b-[#8c0a2a] border-x-[#d41c4a]',
    },
    channelButtonBg: 'bg-gradient-to-b from-[#262c39] to-[#1a1f29]',
    channelButtonBorder: 'border-t-[#363f52] border-b-[#10141b] border-x-[#1e2430]',
    accentColor: '#00f0a8',
    ledColor: '#00f0a8',
  },

  'fruit-punch': {
    id: 'fruit-punch',
    name: 'Fruit Punch (Citrus)',
    description: 'Warm citrus orange & mango punch colors inspired by fruity creation',
    windowBg: 'bg-[#191316]',
    headerBg: 'bg-[#241a20]',
    borderColor: 'border-[#382631]',
    beat1Button: {
      bg: 'bg-[#5c434f]',
      topHighlight: 'border-t-[#785767] border-l-[#785767]',
      bottomShadow: 'border-b-[#3d2b34] border-r-[#3d2b34]',
      text: 'text-[#e5bfd0]',
    },
    beat2Button: {
      bg: 'bg-[#3b2b33]',
      topHighlight: 'border-t-[#4f3944] border-l-[#4f3944]',
      bottomShadow: 'border-b-[#241920] border-r-[#241920]',
      text: 'text-[#ad8f9e]',
    },
    activeStep: {
      gradient: 'bg-gradient-to-b from-[#ffaa33] via-[#ff7711] to-[#dd4400]',
      glow: 'shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_0_9px_rgba(255,119,17,0.75)]',
      border: 'border-t-[#ffc570] border-b-[#992200] border-x-[#dd4400]',
    },
    channelButtonBg: 'bg-gradient-to-b from-[#33242c] to-[#21171d]',
    channelButtonBorder: 'border-t-[#4a3440] border-b-[#140e12] border-x-[#281c23]',
    accentColor: '#ff7711',
    ledColor: '#ffaa00',
  },

  'kigali-gold': {
    id: 'kigali-gold',
    name: 'Kigali Gold & Emerald',
    description: 'Rich East African royal obsidian with warm gold & Intore emerald',
    windowBg: 'bg-[#121415]',
    headerBg: 'bg-[#1a1e20]',
    borderColor: 'border-[#2c332e]',
    beat1Button: {
      bg: 'bg-[#404c44]',
      topHighlight: 'border-t-[#56655c] border-l-[#56655c]',
      bottomShadow: 'border-b-[#2a332d] border-r-[#2a332d]',
      text: 'text-[#c6dec9]',
    },
    beat2Button: {
      bg: 'bg-[#38332b]',
      topHighlight: 'border-t-[#4d463b] border-l-[#4d463b]',
      bottomShadow: 'border-b-[#24201a] border-r-[#24201a]',
      text: 'text-[#ded3b6]',
    },
    activeStep: {
      gradient: 'bg-gradient-to-b from-[#ffd152] via-[#e5a914] to-[#ab7800]',
      glow: 'shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_0_8px_rgba(229,169,20,0.7)]',
      border: 'border-t-[#ffdf8a] border-b-[#734f00] border-x-[#ab7800]',
    },
    channelButtonBg: 'bg-gradient-to-b from-[#242b27] to-[#181d1a]',
    channelButtonBorder: 'border-t-[#354039] border-b-[#0e1210] border-x-[#1c221e]',
    accentColor: '#e5a914',
    ledColor: '#00f0a8',
  },

  'cyber-neon': {
    id: 'cyber-neon',
    name: 'Cyber Midnight',
    description: 'High-energy cyberpunk neon violet, electric cyan, and deep obsidian',
    windowBg: 'bg-[#0f0e1a]',
    headerBg: 'bg-[#161426]',
    borderColor: 'border-[#2d284f]',
    beat1Button: {
      bg: 'bg-[#37335e]',
      topHighlight: 'border-t-[#4c4782] border-l-[#4c4782]',
      bottomShadow: 'border-b-[#24213f] border-r-[#24213f]',
      text: 'text-[#d4cffc]',
    },
    beat2Button: {
      bg: 'bg-[#252140]',
      topHighlight: 'border-t-[#352f5c] border-l-[#352f5c]',
      bottomShadow: 'border-b-[#171429] border-r-[#171429]',
      text: 'text-[#9c95d9]',
    },
    activeStep: {
      gradient: 'bg-gradient-to-b from-[#2ef2ff] via-[#00c8e0] to-[#008ba3]',
      glow: 'shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),0_0_10px_rgba(0,200,224,0.8)]',
      border: 'border-t-[#87f7ff] border-b-[#005a6a] border-x-[#008ba3]',
    },
    channelButtonBg: 'bg-gradient-to-b from-[#201d38] to-[#141224]',
    channelButtonBorder: 'border-t-[#302c54] border-b-[#0b0a14] border-x-[#19172c]',
    accentColor: '#2ef2ff',
    ledColor: '#2ef2ff',
  },

  'high-contrast': {
    id: 'high-contrast',
    name: 'Clean Studio Pro',
    description: 'High-contrast studio mastering layout for crisp visibility',
    windowBg: 'bg-[#181a1f]',
    headerBg: 'bg-[#22252c]',
    borderColor: 'border-[#3a3f4b]',
    beat1Button: {
      bg: 'bg-[#555d6d]',
      topHighlight: 'border-t-[#6f798e] border-l-[#6f798e]',
      bottomShadow: 'border-b-[#3b414d] border-r-[#3b414d]',
      text: 'text-[#ffffff]',
    },
    beat2Button: {
      bg: 'bg-[#3d434f]',
      topHighlight: 'border-t-[#505766] border-l-[#505766]',
      bottomShadow: 'border-b-[#282c35] border-r-[#282c35]',
      text: 'text-[#c2c8d4]',
    },
    activeStep: {
      gradient: 'bg-gradient-to-b from-[#ffffff] via-[#dce0e6] to-[#a8b1bf]',
      glow: 'shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_0_8px_rgba(255,255,255,0.6)]',
      border: 'border-t-[#ffffff] border-b-[#636c7a] border-x-[#a8b1bf]',
    },
    channelButtonBg: 'bg-gradient-to-b from-[#2e333d] to-[#1f232b]',
    channelButtonBorder: 'border-t-[#414856] border-b-[#14171d] border-x-[#252a33]',
    accentColor: '#ffffff',
    ledColor: '#00ff88',
  },
};
