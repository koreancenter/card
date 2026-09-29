import React from 'react';
import { CardTheme } from '../types/card';

interface EmblemProps {
  className?: string;
  size?: number;
  theme?: CardTheme;
}

export const Emblem: React.FC<EmblemProps> = ({ 
  className = '', 
  size = 40,
  theme = 'obsidian' 
}) => {
  const isLight = theme === 'cotton' || theme === 'sand';
  
  // Refined palette mapping per theme
  let strokeColor = '#f5f5f5';
  let accentColor = '#a3a3a3';

  if (theme === 'cotton') {
    strokeColor = '#171717';
    accentColor = '#737373';
  } else if (theme === 'sand') {
    strokeColor = '#27231f';
    accentColor = '#85796e';
  } else if (theme === 'navy') {
    strokeColor = '#f8fafc';
    accentColor = '#94a3b8';
  } else if (theme === 'emerald') {
    strokeColor = '#f0fdf4';
    accentColor = '#d4af37'; // Champagne gold
  } else if (theme === 'burgundy') {
    strokeColor = '#fff1f2';
    accentColor = '#e2b1b8';
  } else if (theme === 'slate') {
    strokeColor = '#f1f5f9';
    accentColor = '#94a3b8';
  } else if (theme === 'titanium') {
    strokeColor = '#e4e4e7';
    accentColor = '#a1a1aa';
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Korean Center Global Network Emblem"
    >
      {/* Outer refined architectural boundary ring */}
      <circle 
        cx="50" 
        cy="50" 
        r="46" 
        stroke={strokeColor} 
        strokeWidth="1.2" 
        strokeOpacity="0.85" 
      />
      
      {/* Inner latitude & meridian lines representing global network */}
      <ellipse 
        cx="50" 
        cy="50" 
        rx="26" 
        ry="46" 
        stroke={strokeColor} 
        strokeWidth="0.9" 
        strokeOpacity="0.6" 
      />
      <line 
        x1="4" 
        y1="50" 
        x2="96" 
        y2="50" 
        stroke={strokeColor} 
        strokeWidth="0.9" 
        strokeOpacity="0.6" 
      />
      <line 
        x1="50" 
        y1="4" 
        x2="50" 
        y2="96" 
        stroke={strokeColor} 
        strokeWidth="0.9" 
        strokeOpacity="0.6" 
      />

      {/* Modernist Korean Center stylized "K" & Global focal point */}
      <path 
        d="M38 30 V70 M38 50 L62 30 M46 43 L62 70" 
        stroke={strokeColor} 
        strokeWidth="2.2" 
        strokeLinecap="square"
        strokeLinejoin="miter"
      />

      {/* Cardinal accent tick marks */}
      <circle cx="50" cy="8" r="1.5" fill={accentColor} />
      <circle cx="92" cy="50" r="1.5" fill={accentColor} />
      <circle cx="50" cy="92" r="1.5" fill={accentColor} />
      <circle cx="8" cy="50" r="1.5" fill={accentColor} />
    </svg>
  );
};
