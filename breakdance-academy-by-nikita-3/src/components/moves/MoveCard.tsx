import React, { useState, useEffect } from 'react';
import { BreakMove } from '../../types';
import { StickerBadge } from '../common/StickerBadge';
import { BboySvgSimulator } from '../player/BboySvgSimulator';
import { Star, Play, Volume2, Lock } from 'lucide-react';
import { speechService } from '../../services/speechService';
import { soundEngine } from '../../services/soundEngine';
import { getPhotoUrlCandidates, loadNikitaMediaManifest } from '../../data/nikitaMediaManifest';

interface MoveCardProps {
  move: BreakMove;
  isMastered: boolean;
  isLocked?: boolean;
  onSelect: (move: BreakMove) => void;
  onToggleMaster: (moveId: string) => void;
}

export const MoveCard: React.FC<MoveCardProps> = ({
  move,
  isMastered,
  isLocked = false,
  onSelect,
  onToggleMaster
}) => {
  const [photoCandidates, setPhotoCandidates] = useState<string[]>(() =>
    getPhotoUrlCandidates(move.id, move.photoPath)
  );
  const [photoCandidateIdx, setPhotoCandidateIdx] = useState(0);
  const [photoLoaded, setPhotoLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadNikitaMediaManifest().then(() => {
      if (!mounted) return;
      const candidates = getPhotoUrlCandidates(move.id, move.photoPath);
      setPhotoCandidates(candidates);
      setPhotoCandidateIdx(0);
    });
    return () => {
      mounted = false;
    };
  }, [move.id, move.photoPath]);

  const categoryBadgeColors = {
    toprock: 'yellow',
    godown: 'orange',
    footwork: 'cyan',
    power: 'green'
  } as const;

  const categoryNames = {
    toprock: 'Верхний брейк',
    godown: 'Спуск на пол',
    footwork: 'Нижний брейк',
    power: 'Вращение'
  };

  const handleVoiceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playCassetteClick();
    speechService.speakNikita(move.nikitaVoiceScript, move.id, move.audioPath);
  };

  const handleCardClick = () => {
    if (isLocked) {
      soundEngine.playCassetteClick();
      speechService.speakNikita(
        'Сначала застолби хотя бы четыре базовых движения первого уровня, чтобы открыть Прокачку!',
        'greeting'
      );
      return;
    }
    onSelect(move);
  };

  const currentPhotoSrc =
    photoCandidateIdx < photoCandidates.length ? photoCandidates[photoCandidateIdx] : null;
  const showStaticPhoto = photoLoaded && currentPhotoSrc !== null;

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white border-3 border-black rounded-xl p-3.5 transition-all duration-150 flex flex-col justify-between shadow-[5px_5px_0px_0px_#000] ${
        isLocked
          ? 'opacity-90 bg-zinc-100 cursor-not-allowed'
          : 'cursor-pointer hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_#000]'
      } ${isMastered && !isLocked ? 'ring-3 ring-[#00E676] bg-emerald-50/40' : ''}`}
    >
      {/* Top badges bar */}
      <div className="flex items-center justify-between gap-1 mb-2.5">
        <StickerBadge
          color={categoryBadgeColors[move.category]}
          size="sm"
          rotation={move.id.length % 2 === 0 ? -1.5 : 1.5}
        >
          {categoryNames[move.category]}
        </StickerBadge>

        <div className="flex items-center gap-1.5">
          {/* Mastered toggle button: ⭐ Застолбить! / 🏆 Застолбил! */}
          {!isLocked ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMaster(move.id);
              }}
              className={`px-2.5 py-1 rounded-md border-2 border-black cursor-pointer transition-transform active:scale-95 flex items-center gap-1 text-[11px] font-heading font-black ${
                isMastered
                  ? 'bg-[#00E676] text-black shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-[#FFE600]/85 text-black hover:bg-[#FFE600] shadow-[2px_2px_0px_0px_#000]'
              }`}
              title={
                isMastered
                  ? 'Движение застолблено!'
                  : 'Нажми, когда научишься делать это движение'
              }
            >
              <span>{isMastered ? '🏆 Застолбил!' : '⭐ Застолбить!'}</span>
            </button>
          ) : (
            <span className="px-2 py-1 rounded-md border-2 border-black bg-zinc-800 text-[#FFE600] flex items-center gap-1 text-[11px] font-heading font-black">
              <Lock size={13} /> Закрыто
            </span>
          )}
        </div>
      </div>

      {/* Visual Preview Block: Static Photo (only if in media-manifest.json) OR BboySvgSimulator Pose Preview */}
      <div className="w-full h-44 rounded-lg border-3 border-black overflow-hidden bg-[#151515] mb-3 relative">
        {currentPhotoSrc && (
          <img
            src={currentPhotoSrc}
            alt={move.name}
            onLoad={() => setPhotoLoaded(true)}
            onError={() => {
              setPhotoLoaded(false);
              setPhotoCandidateIdx((prev) => prev + 1);
            }}
            className={showStaticPhoto ? 'w-full h-full object-cover' : 'hidden'}
          />
        )}

        {!showStaticPhoto && (
          <div className="w-full h-full pointer-events-none flex items-center justify-center [&>div]:min-h-0 [&>div]:border-0 [&>div]:rounded-none">
            <BboySvgSimulator
              move={move}
              currentPhaseIndex={1}
              isPlaying={false}
              speed={0.5}
              isMirrored={false}
            />
          </div>
        )}

        {/* Lock Overlay on top of preview if Level 2 is locked */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-[#FFE600] text-black border-2 border-black flex items-center justify-center mb-1.5 shadow-[2px_2px_0px_0px_#000]">
              <Lock size={20} />
            </div>
            <p className="font-heading font-black text-xs text-[#FFE600] uppercase leading-snug">
              🔒 Сначала застолби минимум 4 движения Базы!
            </p>
          </div>
        )}
      </div>

      {/* Title & short description */}
      <div className="my-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase mb-0.5">
          <span>{move.level === 1 ? 'Уровень 1: База' : 'Уровень 2: Прокачка'}</span>
          <span>Темп: {move.bpmRange[0]}–{move.bpmRange[1]}</span>
        </div>

        <h3 className="font-heading font-black text-xl text-black group-hover:text-[#FF4D00] transition-colors leading-tight">
          {move.name}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-700 font-medium mt-1 leading-snug">
          {move.shortDescription}
        </p>
      </div>

      {/* Voice Button + Card Footer */}
      <div className="pt-2.5 border-t-2 border-black/20 flex items-center justify-between gap-2 mt-2.5">
        {/* Direct Voice Button */}
        <button
          onClick={handleVoiceClick}
          className="px-2.5 py-1.5 bg-[#FFE600] hover:bg-yellow-300 text-black font-heading font-extrabold text-xs rounded-md border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
          title="Послушать озвучку Никиты для этого движения"
        >
          <Volume2 size={14} />
          <span>🔊 Голос</span>
        </button>

        {/* Difficulty stars (visible on all screen sizes!) + Action */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-0.5"
            title={`Сложность: ${move.difficulty} из 5`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < move.difficulty ? 'fill-[#FFE600] text-black' : 'text-zinc-300'}
              />
            ))}
          </div>

          {!isLocked && (
            <div className="px-2.5 py-1.5 bg-black text-[#FFE600] rounded-md border-2 border-black flex items-center gap-1 font-heading text-xs font-black group-hover:bg-[#FF4D00] group-hover:text-white transition-colors">
              <span>УЧИТЬ</span>
              <Play size={12} fill="currentColor" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
