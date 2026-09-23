/**
 * FIesta Studio - Fruity Loops Style Rotary Mini-Knob
 * Authentic look: dark radial dial, circular indicator line, detent behavior,
 * drag-to-change, double-click reset, and precise value tooltips.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface FruityKnobProps {
  label: string;
  value: number; // e.g. -1.0 to 1.0 for pan, or 0.0 to 1.25 for volume
  min: number;
  max: number;
  defaultValue: number;
  step?: number;
  size?: number;
  unit?: string;
  isBipolar?: boolean; // Pan is bipolar (centered at 0), Volume is unipolar
  accentColor?: string;
  onChange: (val: number) => void;
}

export const FruityKnob: React.FC<FruityKnobProps> = ({
  label,
  value,
  min,
  max,
  defaultValue,
  step = 0.01,
  size = 20,
  unit = '',
  isBipolar = false,
  accentColor = '#00f0a8',
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const startYRef = useRef<number>(0);
  const startValRef = useRef<number>(value);

  // Angle range: -135 deg to +135 deg (270 degree total sweep)
  const normalized = (value - min) / (max - min);
  const angle = -135 + normalized * 270;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setShowTooltip(true);
    startYRef.current = e.clientY;
    startValRef.current = value;
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(defaultValue);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = startYRef.current - e.clientY;
      const sensitivity = 0.005 * (max - min);
      let newVal = startValRef.current + deltaY * sensitivity;
      newVal = Math.max(min, Math.min(max, newVal));
      if (step) {
        newVal = Math.round(newVal / step) * step;
      }
      onChange(Number(newVal.toFixed(3)));
    },
    [isDragging, max, min, onChange, step]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setShowTooltip(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Display value formatting
  let displayStr = '';
  if (isBipolar) {
    const percent = Math.round(value * 100);
    if (percent === 0) displayStr = 'Center';
    else if (percent < 0) displayStr = `${Math.abs(percent)}% Left`;
    else displayStr = `${percent}% Right`;
  } else {
    displayStr = `${Math.round(value * 100)}%`;
  }

  return (
    <div
      className="relative flex flex-col items-center select-none group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => !isDragging && setShowTooltip(false)}
    >
      {/* Mini Rotary Dial */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        style={{ width: size, height: size }}
        className="relative rounded-full cursor-ns-resize shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.1)] bg-gradient-to-b from-[#3a4353] via-[#242b36] to-[#161a22] border border-[#485366] flex items-center justify-center active:brightness-125"
      >
        {/* Subtle center cap */}
        <div className="w-2.5 h-2.5 rounded-full bg-[#1b2029] border border-[#2b3341] pointer-events-none" />

        {/* Notch needle indicating rotation */}
        <div
          className="absolute w-full h-full pointer-events-none flex items-start justify-center"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div
            className="w-0.5 h-2 rounded-full mt-0.5 shadow-xs"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      </div>

      {/* Value Tooltip */}
      {showTooltip && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-40 bg-[#090c12] border border-[#3b4559] text-white text-[10px] font-mono-daw px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none">
          {label}: {displayStr}
        </div>
      )}
    </div>
  );
};
