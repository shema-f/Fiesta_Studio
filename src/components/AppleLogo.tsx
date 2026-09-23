/**
 * FIesta Studio - Ferrivox Stylized Fruit / Apple Logo
 * Signature fruit motif with glowing stem leaf and soundwave equalizer cutouts.
 */

import React from 'react';

interface AppleLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'full' | 'silhouette' | 'neon' | 'watermark';
  animated?: boolean;
}

export const AppleLogo: React.FC<AppleLogoProps> = ({
  className = '',
  size = 32,
  variant = 'full',
  animated = false,
}) => {
  const isSilhouette = variant === 'silhouette';
  const isWatermark = variant === 'watermark';
  const isNeon = variant === 'neon';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? 'animate-pulse' : ''}`}
    >
      <defs>
        <linearGradient id="appleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isSilhouette || isWatermark ? '#222834' : '#ff3b69'} />
          <stop offset="50%" stopColor={isSilhouette || isWatermark ? '#1a202c' : '#ff6b4a'} />
          <stop offset="100%" stopColor={isSilhouette || isWatermark ? '#121620' : '#00f0a8'} />
        </linearGradient>

        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isSilhouette || isWatermark ? '#2a3342' : '#00f0a8'} />
          <stop offset="100%" stopColor={isSilhouette || isWatermark ? '#1e2634' : '#10b981'} />
        </linearGradient>

        {isNeon && (
          <filter id="neonFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>

      {/* Stem / Wave Leaf */}
      <path
        d="M50 18 C52 11, 60 7, 72 9 C67 17, 59 20, 50 18 Z"
        fill={isSilhouette ? '#222938' : isWatermark ? 'currentColor' : 'url(#leafGrad)'}
        filter={isNeon ? 'url(#neonFilter)' : undefined}
      />
      <path
        d="M48 20 C48 13, 43 11, 36 12 C39 19, 45 20, 48 20 Z"
        fill={isSilhouette ? '#1b212d' : isWatermark ? 'currentColor' : '#10b981'}
        opacity={isWatermark ? 0.8 : 1}
      />

      {/* Main Fruit Body with Apple indentation */}
      <path
        d="M50 22 C32 22, 18 35, 18 55 C18 75, 33 91, 50 91 C67 91, 82 75, 82 55 C82 35, 68 22, 50 22 Z"
        fill={isWatermark ? 'currentColor' : 'url(#appleGrad)'}
        opacity={isWatermark ? 0.85 : 0.95}
      />

      {/* Internal Equalizer Soundwave Cutouts */}
      {!isSilhouette && !isWatermark && (
        <>
          <rect x="33" y="46" width="4.5" height="18" rx="2" fill="#0d1015" />
          <rect x="41.5" y="37" width="4.5" height="36" rx="2" fill="#0d1015" />
          <rect x="50" y="30" width="4.5" height="50" rx="2" fill="#0d1015" />
          <rect x="58.5" y="39" width="4.5" height="32" rx="2" fill="#0d1015" />
          <rect x="67" y="49" width="4.5" height="12" rx="2" fill="#0d1015" />
        </>
      )}
    </svg>
  );
};
