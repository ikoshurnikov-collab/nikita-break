import React, { useState } from 'react';
import { BreakMove } from '../../types';
import { MoveCard } from './MoveCard';
import { soundEngine } from '../../services/soundEngine';
import { Lock, Unlock, Play, RefreshCw } from 'lucide-react';

interface MovesGridProps {
  moves: BreakMove[];
  masteredIds: string[];
  onSelectMove: (move: BreakMove) => void;
  onToggleMaster: (moveId: string) => void;
  demoMode: boolean;
}

type CategoryFilter = 'all' | 'toprock' | 'godown' | 'footwork';

export const MovesGrid: React.FC<MovesGridProps> = ({
  moves,
  masteredIds,
  onSelectMove,
  onToggleMaster,
  demoMode
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  // Count how many Level 1 (Base) moves are mastered
  const level1Moves = moves.filter((m) => m.level === 1);
  const baseMasteredCount = demoMode
    ? level1Moves.length
    : level1Moves.filter((m) => masteredIds.includes(m.id)).length;

  const isLevel2Unlocked = demoMode || baseMasteredCount >= 4;

  // Deterministic Move of the Day from unlocked moves (plus manual cycle button)
  const unlockedPool = isLevel2Unlocked ? moves : level1Moves;
  const [moveOfDayOffset, setMoveOfDayOffset] = useState<number>(() => {
    const today = new Date();
    return (today.getDate() + today.getMonth() * 31) % Math.max(1, level1Moves.length);
  });

  const moveOfTheDay =
    unlockedPool[moveOfDayOffset % Math.max(1, unlockedPool.length)] || moves[0];

  const filteredMoves = moves.filter((m) => {
    if (selectedLevel !== 'all' && m.level !== selectedLevel) return false;
    if (selectedCategory === 'toprock' && m.category !== 'toprock') return false;
    if (selectedCategory === 'godown' && m.category !== 'godown') return false;
    if (selectedCategory === 'footwork' && m.category !== 'footwork' && m.category !== 'power') {
      return false;
    }
    return true;
  });

  const handleSelectLevel = (lvl: number | 'all') => {
    soundEngine.playCassetteClick();
    setSelectedLevel(lvl);
  };

  const handleSelectCategory = (cat: CategoryFilter) => {
    soundEngine.playCassetteClick();
    setSelectedCategory(cat);
  };

  return (
    <div className="w-full flex flex-col gap-3.5">
      {/* 🔥 ДВИЖЕНИЕ ДНЯ ОТ НИКИТЫ — быстрый старт тренировки в 1 клик без паралича выбора */}
      {moveOfTheDay && (
        <div className="bg-gradient-to-r from-[#FFE600] via-[#FFE600] to-[#00E5FF] border-3 border-black rounded-xl p-3 sm:p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="bg-[#FF4D00] text-white border-2 border-black px-2 py-0.5 rounded text-[10px] font-heading font-black uppercase shadow-[2px_2px_0px_0px_#000]">
                🔥 ДВИЖЕНИЕ ДНЯ ОТ НИКИТЫ
              </span>
              <span className="bg-white/90 text-black border border-black px-2 py-0.5 rounded text-[10px] font-bold">
                {moveOfTheDay.rhythmConfig.defaultBpm} BPM • {moveOfTheDay.level === 1 ? 'База' : 'Прокачка'}
              </span>
            </div>
            <h2 className="font-display text-base sm:text-xl text-black uppercase leading-tight">
              {moveOfTheDay.name}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-black/85 mt-0.5 leading-snug">
              {moveOfTheDay.shortDescription}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                setMoveOfDayOffset((prev) => (prev + 1) % Math.max(1, unlockedPool.length))
              }
              title="Выбрать другое движение для разминки"
              className="p-2.5 bg-white hover:bg-zinc-100 text-black rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <RefreshCw size={16} />
            </button>

            <button
              type="button"
              onClick={() => onSelectMove(moveOfTheDay)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-black hover:bg-zinc-800 text-[#FFE600] font-heading font-black text-xs sm:text-sm rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_#FF4D00] cursor-pointer flex items-center justify-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
            >
              <Play size={15} fill="currentColor" />
              <span>▶️ ТРЕНИРОВАТЬ В 1 КЛИК</span>
            </button>
          </div>
        </div>
      )}

      {/* 3 Level Filter Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => handleSelectLevel('all')}
          className={`py-2.5 px-3.5 rounded-xl font-heading text-xs sm:text-sm font-black border-3 border-black cursor-pointer transition-all flex items-center justify-center gap-2 ${
            selectedLevel === 'all'
              ? 'bg-[#FFE600] text-black shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#F4EFE6] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <span>Все движения (10)</span>
        </button>

        <button
          onClick={() => handleSelectLevel(1)}
          className={`py-2.5 px-3.5 rounded-xl font-heading text-xs sm:text-sm font-black border-3 border-black cursor-pointer transition-all flex items-center justify-center gap-2 ${
            selectedLevel === 1
              ? 'bg-[#00E5FF] text-black shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#F4EFE6] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <span>Уровень 1: База (8)</span>
        </button>

        <button
          onClick={() => handleSelectLevel(2)}
          className={`py-2.5 px-3.5 rounded-xl font-heading text-xs sm:text-sm font-black border-3 border-black cursor-pointer transition-all flex items-center justify-center gap-2 ${
            selectedLevel === 2
              ? 'bg-[#FF4D00] text-white shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#F4EFE6] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          {isLevel2Unlocked ? <Unlock size={15} /> : <Lock size={15} />}
          <span>Уровень 2: Прокачка (2)</span>
        </button>
      </div>

      {/* Floor Category Quick Filters: Верх (Toprock) / Спуск (Go Down) / Низ (Footwork) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
        {[
          { id: 'all' as const, label: '🕺 Все этажи (10)' },
          { id: 'toprock' as const, label: '👟 Верх (Toprock)' },
          { id: 'godown' as const, label: '⬇️ Спуск (Go Down)' },
          { id: 'footwork' as const, label: '🌀 Низ (Footwork)' }
        ].map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.id)}
              className={`py-2 px-2.5 rounded-lg font-heading text-[11px] sm:text-xs font-extrabold border-2 border-black cursor-pointer transition-all text-center ${
                active
                  ? 'bg-[#00E676] text-black shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-[#1e1e1e] text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Progression hint bar if Level 2 is still locked */}
      {!isLevel2Unlocked && (
        <div className="bg-[#FFE600] border-3 border-black px-3.5 py-2 rounded-lg shadow-[3px_3px_0px_0px_#000] flex items-center justify-between gap-2 text-xs font-bold text-black">
          <div className="flex items-center gap-2">
            <Lock size={16} className="shrink-0" />
            <span>
              Чтобы открыть <b>Уровень 2 (Прокачка)</b>, застолби минимум 4 движения из Базы! Сейчас застолблено:{' '}
              <b>{baseMasteredCount} из 4</b>.
            </span>
          </div>
        </div>
      )}

      {/* Grid of Move Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMoves.map((m) => {
          const isLocked = m.level === 2 && !isLevel2Unlocked;
          return (
            <MoveCard
              key={m.id}
              move={m}
              isMastered={demoMode || masteredIds.includes(m.id)}
              isLocked={isLocked}
              onSelect={onSelectMove}
              onToggleMaster={onToggleMaster}
            />
          );
        })}
      </div>
    </div>
  );
};
