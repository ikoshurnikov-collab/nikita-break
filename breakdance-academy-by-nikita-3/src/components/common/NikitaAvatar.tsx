import React, { useState, useEffect } from 'react';
import { getAvatarUrlCandidates, loadNikitaMediaManifest } from '../../data/nikitaMediaManifest';

export const NIKITA_PHOTO_PATH = './nikita/avatar.png';

interface NikitaAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header';
  showGradeBadge?: boolean;
  editable?: boolean;
  className?: string;
}

export const NikitaAvatar: React.FC<NikitaAvatarProps> = ({
  size = 'md',
  showGradeBadge = false,
  className = ''
}) => {
  const [avatarCandidates, setAvatarCandidates] = useState<string[]>(() =>
    getAvatarUrlCandidates()
  );
  const [staticCandidateIndex, setStaticCandidateIndex] = useState<number>(0);
  const [staticPhotoLoaded, setStaticPhotoLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadNikitaMediaManifest().then(() => {
      if (!mounted) return;
      const candidates = getAvatarUrlCandidates();
      setAvatarCandidates(candidates);
      setStaticCandidateIndex(0);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const sizeClasses = {
    sm: 'w-10 h-10 rounded-xl border-2 shadow-[2px_2px_0px_0px_#000]',
    md: 'w-12 h-12 rounded-xl border-3 shadow-[3px_3px_0px_0px_#000]',
    lg: 'w-16 h-16 rounded-2xl border-3 shadow-[4px_4px_0px_0px_#000]',
    xl: 'w-20 h-20 rounded-2xl border-3 shadow-[4px_4px_0px_0px_#000]',
    header: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-3 shadow-[4px_4px_0px_0px_#000]'
  };

  const currentStaticSrc =
    staticCandidateIndex < avatarCandidates.length
      ? avatarCandidates[staticCandidateIndex]
      : null;

  const hasValidPhoto = staticPhotoLoaded && currentStaticSrc !== null;

  return (
    <div
      title="Би-Бой Никита (2 класс)"
      className={`relative inline-block shrink-0 select-none ${className}`}
    >
      {/* Крупная рамка под реальную фотографию Никиты с белой внутренней обводкой ring-3 ring-white */}
      <div
        className={`${sizeClasses[size]} bg-[#00E5FF] border-black ring-3 ring-white ring-inset overflow-hidden flex items-center justify-center relative`}
      >
        {/* Статическое фото из репозитория, ТОЛЬКО если оно включено в media-manifest.json (0 ошибок 404!) */}
        {currentStaticSrc && (
          <img
            src={currentStaticSrc}
            alt="Би-Бой Никита"
            onLoad={() => setStaticPhotoLoaded(true)}
            onError={() => {
              setStaticPhotoLoaded(false);
              setStaticCandidateIndex((prev) => prev + 1);
            }}
            className={staticPhotoLoaded ? 'w-full h-full object-cover' : 'hidden'}
          />
        )}

        {/* Стильный векторный портрет би-боя Никиты, если статического файла еще нет в папке */}
        {!hasValidPhoto && (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background */}
            <rect width="100" height="100" fill="#00E5FF" />
            {/* Hoodie shoulders */}
            <path d="M 15 100 Q 50 72 85 100 Z" fill="#FFE600" stroke="#000" strokeWidth="4" />
            {/* Neck */}
            <rect x="41" y="65" width="18" height="16" rx="4" fill="#fbd38d" stroke="#000" strokeWidth="3.5" />
            {/* Ears */}
            <circle cx="24" cy="52" r="7" fill="#fbd38d" stroke="#000" strokeWidth="3.5" />
            <circle cx="76" cy="52" r="7" fill="#fbd38d" stroke="#000" strokeWidth="3.5" />
            {/* Face */}
            <circle cx="50" cy="50" r="25" fill="#fbd38d" stroke="#000" strokeWidth="4" />
            {/* Eyes */}
            <circle cx="41" cy="48" r="4" fill="#000" />
            <circle cx="59" cy="48" r="4" fill="#000" />
            <circle cx="42.5" cy="46.5" r="1.5" fill="#fff" />
            <circle cx="60.5" cy="46.5" r="1.5" fill="#fff" />
            {/* Cheerful B-Boy Smile */}
            <path
              d="M 39 58 Q 50 68 61 58"
              fill="#fff"
              stroke="#000"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Cheeks */}
            <circle cx="34" cy="55" r="3.5" fill="#ff7eb6" opacity="0.65" />
            <circle cx="66" cy="55" r="3.5" fill="#ff7eb6" opacity="0.65" />
            {/* B-Boy Snapback Cap Turned Sideways */}
            <g transform="rotate(-10 50 30)">
              {/* Cap visor sticking out to the left */}
              <path
                d="M 28 32 Q 6 28 4 38 Q 16 44 35 37 Z"
                fill="#121212"
                stroke="#000"
                strokeWidth="3.5"
              />
              {/* Cap dome */}
              <path
                d="M 24 34 C 24 14, 76 14, 76 34 Z"
                fill="#FF4D00"
                stroke="#000"
                strokeWidth="4"
              />
              {/* Front panel sticker / badge */}
              <rect x="42" y="21" width="16" height="9" rx="2" fill="#FFE600" stroke="#000" strokeWidth="2.5" />
              {/* Cap top button */}
              <circle cx="50" cy="15" r="3.5" fill="#FFE600" stroke="#000" strokeWidth="2.5" />
            </g>
          </svg>
        )}
      </div>

      {/* Бейдж 2 КЛ в правом нижнем углу, чтобы НЕ закрывал голову и лицо Никиты */}
      {showGradeBadge && (
        <div className="absolute -bottom-1.5 -right-1.5 bg-[#FF4D00] text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md border-2 border-black uppercase -rotate-3 shadow-[2px_2px_0px_0px_#000] z-10 pointer-events-none">
          2 КЛ
        </div>
      )}
    </div>
  );
};
