import React, { useState, useEffect } from 'react';
import { BreakMove } from '../../types';
import { HybridPlayer } from '../player/HybridPlayer';
import { StickerBadge } from '../common/StickerBadge';
import {
  X,
  AlertTriangle,
  Lightbulb,
  Zap,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';
import { speechService } from '../../services/speechService';
import { useWakeLock } from '../../hooks/useWakeLock';

interface MoveDetailModalProps {
  move: BreakMove;
  isMastered: boolean;
  onClose: () => void;
  onToggleMaster: (moveId: string) => void;
  onNextMove?: () => void;
  onPrevMove?: () => void;
}

export const MoveDetailModal: React.FC<MoveDetailModalProps> = ({
  move,
  isMastered,
  onClose,
  onToggleMaster,
  onNextMove,
  onPrevMove
}) => {
  useWakeLock(true);
  const [showDetailsAccordion, setShowDetailsAccordion] = useState(false);

  useEffect(() => {
    setShowDetailsAccordion(false);
  }, [move.id]);

  useEffect(() => {
    return () => {
      soundEngine.stop();
      speechService.stop();
    };
  }, []);

  const handleCloseModal = () => {
    soundEngine.stop();
    speechService.stop();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 overflow-y-auto backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-[#F4EFE6] border-3 sm:border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_#000] sm:shadow-[8px_8px_0px_0px_#000] p-3 sm:p-6 text-black my-auto max-h-[94dvh] overflow-y-auto no-scrollbar">
        {/* Header Bar: Mobile-friendly 2-row layout so Title & Description get 100% width */}
        <div className="border-b-3 border-black pb-3 mb-4">
          {/* Top action row: Level Badge + Master & Close Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <StickerBadge color="yellow" size="sm">
                {move.level === 1 ? 'Уровень 1: База' : 'Уровень 2: Прокачка'}
              </StickerBadge>
              <span className="text-[11px] sm:text-xs font-bold text-zinc-600">
                Темп: {move.bpmRange[0]}–{move.bpmRange[1]} уд/мин
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
              {/* Master toggle */}
              <button
                onClick={() => onToggleMaster(move.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded font-heading font-black text-[11px] sm:text-xs border-2 border-black flex items-center gap-1 cursor-pointer neo-btn ${
                  isMastered ? 'bg-[#00E676] text-black' : 'bg-[#FFE600] text-black hover:bg-yellow-300'
                }`}
              >
                <span>{isMastered ? '🏆 ЗАСТОЛБИЛ!' : '⭐ ЗАСТОЛБИТЬ!'}</span>
              </button>

              {/* Close button */}
              <button
                onClick={handleCloseModal}
                aria-label="Закрыть"
                className="p-1.5 bg-black text-white hover:bg-zinc-800 rounded-md border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_#000]"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Full-width Move Title & Description */}
          <h2 className="font-display text-lg sm:text-3xl text-black uppercase leading-tight break-words">
            {move.name}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-zinc-700 mt-1 leading-relaxed">
            {move.fullDescription}
          </p>
        </div>

        {/* Hybrid Player (2D Rig / Nikita Video / 4-Step Scrubber) */}
        <div className="mb-4">
          <HybridPlayer move={move} />
        </div>

        {/* Expandable Accordion for Details, Tips, and Common Mistakes so Mobile Viewport stays compact */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowDetailsAccordion((prev) => !prev)}
            className="w-full py-2.5 px-3.5 bg-white hover:bg-[#FFE600]/40 border-3 border-black rounded-lg shadow-[3px_3px_0px_0px_#000] flex items-center justify-between gap-2 font-heading font-black text-xs sm:text-sm text-black cursor-pointer transition-colors"
          >
            <span>📖 Показать подробности и частые ошибки</span>
            {showDetailsAccordion ? (
              <ChevronUp size={18} className="shrink-0" />
            ) : (
              <ChevronDown size={18} className="shrink-0" />
            )}
          </button>

          {showDetailsAccordion && (
            <div className="mt-3 flex flex-col gap-3.5">
              {/* Что качает это движение & Секреты Никиты */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                {/* Muscle Bars in 2nd-grade language */}
                <div className="bg-white border-3 border-black p-3.5 sm:p-4 rounded-lg shadow-[4px_4px_0px_0px_#000]">
                  <div className="flex items-center gap-2 mb-3 border-b-2 border-zinc-200 pb-2">
                    <Zap className="text-[#FF4D00] shrink-0" size={18} />
                    <h4 className="font-heading font-black text-xs sm:text-sm uppercase">
                      Что качает это движение:
                    </h4>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {[
                      { label: 'Живот и спина', val: move.targetMuscles.core, color: '#FF4D00' },
                      { label: 'Сила рук', val: move.targetMuscles.arms, color: '#FFE600' },
                      { label: 'Пружина в ногах', val: move.targetMuscles.legs, color: '#00E5FF' },
                      { label: 'Равновесие', val: move.targetMuscles.balance, color: '#00E676' }
                    ].map((m) => (
                      <div key={m.label}>
                        <div className="flex justify-between text-xs font-bold mb-0.5">
                          <span className="text-zinc-800">{m.label}</span>
                          <span className="text-black font-black">{m.val}%</span>
                        </div>
                        <div className="w-full h-3 bg-zinc-200 border border-black rounded-full overflow-hidden">
                          <div
                            className="h-full border-r border-black"
                            style={{ width: `${m.val}%`, backgroundColor: m.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nikita's Pro Tips */}
                <div className="bg-white border-3 border-black p-3.5 sm:p-4 rounded-lg shadow-[4px_4px_0px_0px_#000]">
                  <div className="flex items-center gap-2 mb-3 border-b-2 border-zinc-200 pb-2">
                    <Lightbulb className="text-[#FFE600] shrink-0" size={18} />
                    <h4 className="font-heading font-black text-xs sm:text-sm uppercase">
                      Советы от второклассника Никиты:
                    </h4>
                  </div>

                  <ul className="flex flex-col gap-2 text-xs font-medium text-zinc-800">
                    {move.nikitaTips.map((tip, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 bg-[#F4EFE6] p-2 rounded border border-zinc-300"
                      >
                        <span className="font-display text-xs text-[#FF4D00] shrink-0">
                          #{i + 1}
                        </span>
                        <span className="leading-snug">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Common Beginner Mistakes Alert Box */}
              <div className="bg-red-50 border-3 border-red-600 p-3.5 sm:p-4 rounded-lg shadow-[4px_4px_0px_0px_#000]">
                <div className="flex items-center gap-2 mb-2 text-red-900">
                  <AlertTriangle className="text-red-600 shrink-0" size={18} />
                  <h4 className="font-heading font-black text-xs sm:text-sm uppercase">
                    Частые ошибки ребят (не делай так!):
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-red-800">
                  {move.commonMistakes.map((err, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-1.5 bg-white/80 p-2 rounded border border-red-300"
                    >
                      <span className="font-bold text-red-600">✕</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Previous / Next Move */}
        <div className="flex items-center justify-between gap-2 border-t-3 border-black pt-3">
          {onPrevMove && (
            <button
              onClick={() => {
                speechService.stop();
                onPrevMove();
              }}
              className="px-2.5 sm:px-3 py-1.5 bg-black text-white hover:bg-zinc-800 rounded font-heading text-xs font-bold flex items-center gap-1 neo-btn cursor-pointer"
            >
              <ArrowLeft size={15} /> <span>Предыдущее</span>
            </button>
          )}

          <span className="hidden sm:inline text-xs font-bold text-zinc-600">
            Школа брейка Никиты
          </span>

          {onNextMove && (
            <button
              onClick={() => {
                speechService.stop();
                onNextMove();
              }}
              className="px-2.5 sm:px-3 py-1.5 bg-[#FFE600] text-black hover:bg-yellow-300 rounded font-heading text-xs font-bold flex items-center gap-1 neo-btn cursor-pointer ml-auto sm:ml-0"
            >
              <span>Следующее</span> <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
