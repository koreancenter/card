import React from 'react';
import logoImg from '../assets/images/korean_center_logo_1790638132809.jpg';

interface KoreanCenterLogoProps {
  size?: number | string;
  className?: string;
  showOriginalColor?: boolean;
}

export const KoreanCenterLogo: React.FC<KoreanCenterLogoProps> = ({
  size = 48,
  className = '',
  showOriginalColor = true
}) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden select-none ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }}
    >
      <img
        src={logoImg}
        alt="Korean Center Official Logo"
        className="w-full h-full object-contain filter drop-shadow-sm"
        loading="eager"
        decoding="sync"
      />
    </div>
  );
};
