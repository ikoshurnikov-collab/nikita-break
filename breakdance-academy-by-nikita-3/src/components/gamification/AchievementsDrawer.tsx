import React, { useState } from 'react';
import { ACHIEVEMENTS_LIST } from '../../data/achievementsData';
import { DiplomaGenerator } from '../npk/DiplomaGenerator';
import { StickerBadge } from '../common/StickerBadge';
import { Flame, Clock, Zap, Award, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface AchievementsDrawerProps {
  masteredCount: number;
  unlockedAchievementIds: string[];
  totalMinutes: number;
  rehearsalsDone: number;
  streakDays: number;
  diplomaName: string;
  diplomaRole: 'Би-Бой' | 'Би-Гёрл' | 'Член Жюри НПК' | 'Главный Эксперт';
  onResetProgress: () => void;
  demoMode: boolean;
}

export const AchievementsDrawer: React.FC<AchievementsDrawerProps> = ({
  masteredCount,
  unlockedAchievementIds,
  totalMinutes,
  rehearsalsDone,
  streakDays,
  diplomaName,
  diplomaRole,
  onResetProgress,
  demoMode
}) => {
  const [confirmingReset, setConfirmingReset] = useState(false);

  // Rank calculations strictly based on masteredCount
  const effectiveMastered = demoMode ? 10 : masteredCount;
  let rankTitle = 'Ученик Школы Брейка';
  let rankBadge = 'Новичок';
  if (effectiveMastered >= 3) {
    rankTitle = 'Би-Бой Перемены';
    rankBadge = 'Разгон';
  }
  if (effectiveMastered >= 7) {
    rankTitle = 'Повелитель Круга';
    rankBadge = 'Профи';
  }
  if (effectiveMastered >= 10) {
    rankTitle = 'Легенда Брейк-Данса 2 Класса';
    rankBadge = 'Мастер';
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Hero Banner */}
      <div className="bg-[#FFE600] border-4 border-black p-4 sm:p-5 rounded-xl shadow-[6px_6px_0px_0px_#000] text-black">
        <div className="inline-block bg-black text-[#FFE600] text-xs font-extrabold px-2.5 py-0.5 rounded uppercase mb-1">
          ТВОИ НАГРАДЫ И ДИПЛОМ БИ-БОЯ
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl sm:text-3xl uppercase leading-tight">
              ТВОИ ДОСТИЖЕНИЯ И ДИПЛОМ
            </h2>
            <p className="text-xs sm:text-sm font-bold text-black/85 mt-1">
              Твой уровень: <span className="font-black underline decoration-black">{rankTitle}</span> ({rankBadge})
            </p>
          </div>

          <StickerBadge color="orange" size="lg" rotation={-2}>
            {rankTitle}
          </StickerBadge>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border-3 border-black p-3.5 rounded-xl shadow-[4px_4px_0px_0px_#000] text-center">
          <Flame className="text-[#FF4D00] mx-auto mb-1" size={24} />
          <div className="text-[10px] font-bold uppercase text-zinc-500">
            Застолбил движений
          </div>
          <div className="font-display text-xl sm:text-2xl text-black">
            {effectiveMastered} / 10
          </div>
        </div>

        <div className="bg-white border-3 border-black p-3.5 rounded-xl shadow-[4px_4px_0px_0px_#000] text-center">
          <Clock className="text-[#00E5FF] mx-auto mb-1" size={24} />
          <div className="text-[10px] font-bold uppercase text-zinc-500">
            Время разминок
          </div>
          <div className="font-display text-xl sm:text-2xl text-black">
            {totalMinutes} <span className="text-xs font-bold">мин</span>
          </div>
        </div>

        <div className="bg-white border-3 border-black p-3.5 rounded-xl shadow-[4px_4px_0px_0px_#000] text-center">
          <Zap className="text-[#00E676] mx-auto mb-1" size={24} />
          <div className="text-[10px] font-bold uppercase text-zinc-500">
            Репетиций связок
          </div>
          <div className="font-display text-xl sm:text-2xl text-black">
            {rehearsalsDone}
          </div>
        </div>

        <div className="bg-white border-3 border-black p-3.5 rounded-xl shadow-[4px_4px_0px_0px_#000] text-center">
          <Award className="text-[#FFE600] mx-auto mb-1" size={24} />
          <div className="text-[10px] font-bold uppercase text-zinc-500">
            Дней с брейком
          </div>
          <div className="font-display text-xl sm:text-2xl text-black">
            {streakDays} <span className="text-xs font-bold">дня</span>
          </div>
        </div>
      </div>

      {/* Official Diploma Generator Section */}
      <DiplomaGenerator initialName={diplomaName} initialRole={diplomaRole} />

      {/* Grid of Badges and Achievements */}
      <div className="bg-white border-4 border-black p-4 sm:p-6 rounded-xl shadow-[6px_6px_0px_0px_#000]">
        <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#FF4D00]" size={22} />
            <h3 className="font-display text-lg sm:text-xl uppercase">
              Коллекция Наградных Стикеров ({demoMode ? ACHIEVEMENTS_LIST.length : unlockedAchievementIds.length} / {ACHIEVEMENTS_LIST.length})
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const isUnlocked = demoMode || unlockedAchievementIds.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-xl border-3 transition-all flex items-start gap-3 ${
                  isUnlocked
                    ? 'bg-[#F4EFE6] border-black shadow-[3px_3px_0px_0px_#000]'
                    : 'bg-zinc-100 border-dashed border-zinc-300 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center text-2xl shrink-0 ${
                    isUnlocked ? 'bg-[#FFE600] shadow-[2px_2px_0px_0px_#000]' : 'bg-zinc-200'
                  }`}
                >
                  {isUnlocked ? ach.icon : '🔒'}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-heading font-black text-sm text-black leading-tight">
                      {ach.title}
                    </h4>
                    {isUnlocked && (
                      <CheckCircle2 size={14} className="text-[#00E676] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 mt-0.5 leading-snug">
                    {ach.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inline 2-click Progress Reset without window.confirm() */}
      <div className="flex items-center justify-end gap-2">
        {!confirmingReset ? (
          <button
            onClick={() => {
              soundEngine.playCassetteClick();
              setConfirmingReset(true);
            }}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-2 border-black rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={13} /> Сбросить прогресс
          </button>
        ) : (
          <div className="bg-white border-3 border-black p-2.5 rounded-xl shadow-[3px_3px_0px_0px_#000] flex items-center gap-2 text-xs font-bold text-black">
            <span>Точно сбросить?</span>
            <button
              onClick={() => {
                soundEngine.playCassetteClick();
                onResetProgress();
                setConfirmingReset(false);
              }}
              className="px-2.5 py-1 bg-[#FF4D00] text-white border-2 border-black rounded font-heading font-black cursor-pointer"
            >
              Да
            </button>
            <button
              onClick={() => {
                soundEngine.playCassetteClick();
                setConfirmingReset(false);
              }}
              className="px-2.5 py-1 bg-[#F4EFE6] text-black border-2 border-black rounded font-heading font-black cursor-pointer"
            >
              Отмена
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
