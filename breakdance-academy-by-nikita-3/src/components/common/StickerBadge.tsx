import React from 'react';

interface StickerBadgeProps {
  children: React.ReactNode;
  color?: 'yellow' | 'orange' | 'cyan' | 'green' | 'white' | 'cardboard';
  rotation?: number; // degrees, e.g. -3, 2
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StickerBadge: React.FC<StickerBadgeProps> = ({
  children,
  color = 'yellow',
  rotation = 0,
  className = '',
  size = 'md'
}) => {
  const colorMap = {
    yellow: 'bg-[#FFE600] text-black border-black',
    orange: 'bg-[#FF4D00] text-white border-black',
    cyan: 'bg-[#00E5FF] text-black border-black',
    green: 'bg-[#00E676] text-black border-black',
    white: 'bg-white text-black border-black',
    cardboard: 'bg-[#F4EFE6] text-black border-black'
  };

  const sizeMap = {
    sm: 'text-xs px-2 py-0.5 border-2 shadow-[2px_2px_0px_0px_#000]',
    md: 'text-sm px-3 py-1 border-2 shadow-[3px_3px_0px_0px_#000]',
    lg: 'text-base px-4 py-1.5 border-3 shadow-[4px_4px_0px_0px_#000]'
  };

  return (
    <span
      style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }}
      className={`inline-flex items-center gap-1.5 font-extrabold uppercase tracking-wider rounded-sm font-heading select-none ${colorMap[color]} ${sizeMap[size]} ${className}`}
    >
      {children}
    </span>
  );
};
