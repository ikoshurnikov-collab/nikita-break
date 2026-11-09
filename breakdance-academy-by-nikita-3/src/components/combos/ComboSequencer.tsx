import React, { useState } from 'react';
import { Combo } from '../../types';
import { validateComboSequence } from '../../data/combosCatalog';
import { MOVES_CATALOG } from '../../data/movesCatalog';
import { StickerBadge } from '../common/StickerBadge';
import { LiveRehearsalModal } from './LiveRehearsalModal';
import { soundEngine } from '../../services/soundEngine';
import { speechService } from '../../services/speechService';
import {
  Layers,
  Trash2,
  Play,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Lock,
  RotateCcw
} from 'lucide-react';

interface ComboSequencerProps {
  customCombos: Combo[];
  masteredIds: string[];
  demoMode: boolean;
  onSaveCustomCombo: (combo: Combo) => void;
  onDeleteCustomCombo: (comboId: string) => void;
  onRestoreDefaultCombos?: () => void;
}

const CATEGORY_RU_LABELS: Record<string, string> = {
  toprock: 'Верхний брейк',
  godown: 'Переход вниз',
  footwork: 'Нижний брейк',
  power: 'Вращение'
};

export const ComboSequencer: React.FC<ComboSequencerProps> = ({
  customCombos,
  masteredIds,
  demoMode,
  onSaveCustomCombo,
  onDeleteCustomCombo,
  onRestoreDefaultCombos
}) => {
  const [selectedComboForRehearsal, setSelectedComboForRehearsal] = useState<Combo | null>(null);
  const [builderMoveIds, setBuilderMoveIds] = useState<string[]>([
    'square-steps',
    'go-down',
    'dorozhka'
  ]);
  const [customComboName, setCustomComboName] = useState('Мой Школьный Выход');
  const [customComboBpm, setCustomComboBpm] = useState(98);

  const validation = validateComboSequence(builderMoveIds);

  // Check if Level 2 moves are unlocked (at least 4 base moves mastered or demoMode)
  const level1Moves = MOVES_CATALOG.filter((m) => m.level === 1);
  const baseMasteredCount = demoMode
    ? level1Moves.length
    : level1Moves.filter((m) => masteredIds.includes(m.id)).length;
  const isLevel2Unlocked = demoMode || baseMasteredCount >= 4;

  const handleAddMoveToBuilder = (moveId: string, isLocked: boolean) => {
    if (isLocked) {
      speechService.speakNikita(
        'Сначала застолби четыре движения Базы, чтобы добавлять движения Прокачки в свою связку!',
        'locked'
      );
      return;
    }
    if (builderMoveIds.length >= 6) return;
    setBuilderMoveIds([...builderMoveIds, moveId]);
  };

  const handleRemoveMoveFromBuilder = (index: number) => {
    setBuilderMoveIds(builderMoveIds.filter((_, i) => i !== index));
  };

  const handleSaveCombo = () => {
    if (builderMoveIds.length < 2) return;
    soundEngine.playSuccessFanfare();
    const cleanedComboName = customComboName.replace(/\s+/g, ' ').trim().slice(0, 22) || 'Авторская Связка';
    const newCombo: Combo = {
      id: `custom-${Date.now()}`,
      name: cleanedComboName,
      nickname: 'Моя связка для школьной перемены',
      description: 'Индивидуальный танцевальный выход, собранный в конструкторе связок Никиты.',
      moveIds: builderMoveIds,
      difficulty: validation.calculatedDifficulty,
      totalBeats: builderMoveIds.length * 8,
      energyRating: validation.calculatedDifficulty >= 4 ? 'Ураган!' : 'Бодрая',
      recommendedBpm: customComboBpm,
      nikitaTip: 'Отличная связка! Следи за темпом и не забывай дышать между восьмерками!',
      isCustom: true
    };
    onSaveCustomCombo(newCombo);
  };

  return (
    <div className="w-full flex flex-col gap-5 sm:gap-6">
      {/* Hero Banner */}
      <div className="bg-[#00E5FF] border-3 sm:border-4 border-black p-3.5 sm:p-5 rounded-xl shadow-[4px_4px_0px_0px_#000] sm:shadow-[6px_6px_0px_0px_#000] text-black">
        <div className="inline-block bg-black text-[#00E5FF] text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded uppercase mb-1">
          КОНСТРУКТОР СВЯЗОК И ВЫХОД В КРУГ
        </div>
        <h2 className="font-display text-lg sm:text-3xl uppercase leading-tight">
          СОБЕРИ СВОЙ ВЫХОД В КРУГ!
        </h2>
        <p className="text-xs sm:text-sm font-bold text-black/85 mt-1 max-w-2xl leading-snug">
          Связка — это цепочка из 2–6 движений подряд. Конструктор сам проверит переходы и подскажет, если ты забыл «Переход вниз» между шагами стоя и танцем на руках!
        </p>
      </div>

      {/* Interactive Combo Builder Box */}
      <div className="bg-white border-3 sm:border-4 border-black p-3.5 sm:p-6 rounded-xl shadow-[4px_4px_0px_0px_#000] sm:shadow-[6px_6px_0px_0px_#000]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-3 border-black pb-2.5 sm:pb-3 mb-3.5 sm:mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#FF4D00] shrink-0" size={20} />
            <h3 className="font-display text-base sm:text-xl uppercase">
              Конструктор твоей связки
            </h3>
          </div>

          <span className="text-xs font-bold text-zinc-600 bg-[#F4EFE6] px-2 py-0.5 rounded border border-black/30">
            Движений: {builderMoveIds.length} из 6
          </span>
        </div>

        {/* Builder Name and BPM Input */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold uppercase text-zinc-600 mb-1 block">
              Придумай название связки:
            </label>
            <input
              type="text"
              maxLength={22}
              value={customComboName}
              onChange={(e) => setCustomComboName(e.target.value.slice(0, 22))}
              placeholder="Например: Перемена 2 класса..."
              className="w-full px-3 py-1.5 bg-[#F4EFE6] border-2 border-black rounded font-heading font-extrabold text-sm focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-zinc-600 mb-1 block">
              Выбери темп бита:
            </label>
            <select
              value={customComboBpm}
              onChange={(e) => setCustomComboBpm(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#F4EFE6] border-2 border-black rounded font-bold text-sm focus:outline-none cursor-pointer"
            >
              <option value={85}>85 ударов/мин (Олдскул Бум-Бэп)</option>
              <option value={98}>98 ударов/мин (Школьный Фанк)</option>
              <option value={110}>110 ударов/мин (Электро-Брейк 808)</option>
              <option value={122}>122 ударов/мин (Турбо-Баттл)</option>
            </select>
          </div>
        </div>

        {/* Current Sequencer Chain Slots */}
        <div className="bg-[#F4EFE6] border-3 border-black p-3 rounded-lg mb-4">
          <div className="text-xs font-bold text-zinc-700 uppercase mb-2">
            Цепочка движений по порядку (нажми ✕ чтобы убрать):
          </div>

          {builderMoveIds.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-zinc-400 rounded bg-white/60 px-2">
              <p className="font-heading font-bold text-xs sm:text-sm text-zinc-500">
                Связка пока пуста! Нажимай на карточки движений ниже, чтобы добавить их.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {builderMoveIds.map((mId, index) => {
                const move = MOVES_CATALOG.find((m) => m.id === mId);
                if (!move) return null;

                const categoryColors: Record<string, string> = {
                  toprock: 'bg-[#FFE600] text-black',
                  godown: 'bg-[#FF4D00] text-white',
                  footwork: 'bg-[#00E5FF] text-black',
                  power: 'bg-[#00E676] text-black'
                };

                return (
                  <React.Fragment key={`${mId}-${index}`}>
                    <div className="flex flex-wrap items-center gap-1.5 bg-white border-2 border-black px-2 sm:px-2.5 py-1.5 rounded-md shadow-[2px_2px_0px_0px_#000] max-w-full">
                      <span className="w-5 h-5 rounded-full bg-black text-[#FFE600] flex items-center justify-center font-display text-[10px] shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-heading font-extrabold text-xs">
                        {move.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border border-black ${categoryColors[move.category]}`}
                      >
                        {CATEGORY_RU_LABELS[move.category]}
                      </span>
                      <button
                        onClick={() => handleRemoveMoveFromBuilder(index)}
                        className="text-zinc-400 hover:text-red-600 font-black ml-0.5 px-1 cursor-pointer"
                        title="Удалить из связки"
                      >
                        ✕
                      </button>
                    </div>

                    {index < builderMoveIds.length - 1 && (
                      <ChevronRight size={15} className="text-zinc-500 shrink-0 hidden sm:inline" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* Validation Feedback & Nikita's Warnings */}
        {validation.warnings.length > 0 && (
          <div className="mb-4 bg-amber-50 border-2 border-amber-600 p-3 rounded-lg text-amber-900 text-xs flex items-start gap-2">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Подсказка Никиты: </span>
              {validation.warnings.map((w, i) => (
                <div key={i}>{w}</div>
              ))}
            </div>
          </div>
        )}

        {validation.tips.length > 0 && validation.warnings.length === 0 && (
          <div className="mb-4 bg-emerald-50 border-2 border-emerald-600 p-3 rounded-lg text-emerald-900 text-xs flex items-start gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Отлично! </span>
              {validation.tips.map((t, i) => (
                <div key={i}>{t}</div>
              ))}
            </div>
          </div>
        )}

        {/* Move Palette: Click to add */}
        <div className="mb-4">
          <div className="text-xs font-bold text-zinc-700 uppercase mb-2">
            Добавить движение в связку (нажми на карточку):
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {MOVES_CATALOG.map((m) => {
              const isLocked = m.level === 2 && !isLevel2Unlocked;
              return (
                <button
                  key={m.id}
                  onClick={() => handleAddMoveToBuilder(m.id, isLocked)}
                  disabled={builderMoveIds.length >= 6 && !isLocked}
                  title={
                    isLocked
                      ? 'Сначала застолби минимум 4 движения Базы!'
                      : `Добавить «${m.name}» в связку`
                  }
                  className={`p-2 sm:p-2.5 border-2 border-black rounded-lg text-left transition-all text-xs font-heading font-black shadow-[2px_2px_0px_0px_#000] ${
                    isLocked
                      ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed opacity-75'
                      : 'bg-[#F4EFE6] hover:bg-[#FFE600] text-black cursor-pointer active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-600 mb-0.5">
                    <span className="truncate">{CATEGORY_RU_LABELS[m.category]}</span>
                    {isLocked && <Lock size={11} className="text-black shrink-0" />}
                  </div>
                  <div className="leading-tight flex items-center gap-1">
                    {isLocked && <span>🔒</span>}
                    <span>{m.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: Save Custom Combo & Test Rehearsal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t-2 border-black">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-700">
            <span>Сложность: {validation.calculatedDifficulty} / 5</span>
            <span>•</span>
            <span>
              Длительность: {validation.totalEights}{' '}
              {validation.totalEights === 1
                ? 'восьмерка'
                : validation.totalEights >= 2 && validation.totalEights <= 4
                ? 'восьмерки'
                : 'восьмерок'}{' '}
              ({validation.totalBeats} счетов)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSaveCombo}
              disabled={builderMoveIds.length < 2}
              className="w-full sm:w-auto px-4 py-2 bg-black text-[#FFE600] rounded font-heading text-xs font-black border-2 border-black neo-btn cursor-pointer text-center"
            >
              СОХРАНИТЬ СВЯЗКУ
            </button>

            <button
              onClick={() => {
                const comboToTest: Combo = {
                  id: 'preview-rehearsal',
                  name: customComboName,
                  nickname: 'Репетиция моей связки',
                  description: 'Репетиция авторской связки',
                  moveIds: builderMoveIds,
                  difficulty: validation.calculatedDifficulty,
                  totalBeats: builderMoveIds.length * 8,
                  energyRating: 'Огонь!',
                  recommendedBpm: customComboBpm,
                  nikitaTip: 'Танцуй в ритм!'
                };
                setSelectedComboForRehearsal(comboToTest);
              }}
              disabled={builderMoveIds.length === 0}
              className="w-full sm:w-auto px-4 py-2 bg-[#00E676] hover:bg-emerald-400 text-black rounded font-heading text-xs font-black border-2 border-black neo-btn cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Play size={15} fill="currentColor" /> ЖИВАЯ РЕПЕТИЦИЯ
            </button>
          </div>
        </div>
      </div>

      {/* Catalog of Ready-to-Dance Combos (All combos are deletable + Restore button) */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="text-[#FF4D00] shrink-0" size={20} />
            <h3 className="font-display text-lg sm:text-xl uppercase text-white">
              Связки для баттла ({customCombos.length})
            </h3>
          </div>

          {onRestoreDefaultCombos && (
            <button
              onClick={onRestoreDefaultCombos}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[#FFE600] rounded-lg border-2 border-black font-heading font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
              title="Вернуть 4 стандартные связки от Никиты"
            >
              <RotateCcw size={13} />
              <span>Восстановить стандартные связки</span>
            </button>
          )}
        </div>

        {customCombos.length === 0 ? (
          <div className="bg-[#1e1e1e] border-3 border-black p-6 rounded-xl text-center text-zinc-300 shadow-[4px_4px_0px_0px_#000]">
            <p className="font-heading font-bold text-sm sm:text-base mb-3">
              Все связки удалены. Собери свою связку выше или верни стандартные связки Никиты!
            </p>
            {onRestoreDefaultCombos && (
              <button
                onClick={onRestoreDefaultCombos}
                className="px-4 py-2 bg-[#FFE600] hover:bg-yellow-300 text-black rounded-lg border-2 border-black font-heading font-black text-xs inline-flex items-center gap-1.5 cursor-pointer neo-btn"
              >
                <RotateCcw size={14} />
                <span>Вернуть 4 связки Никиты</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customCombos.map((combo) => (
              <div
                key={combo.id}
                className="bg-white border-3 border-black p-3.5 sm:p-4 rounded-xl shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <StickerBadge color={combo.isCustom ? 'cyan' : 'yellow'} size="sm">
                      {combo.isCustom ? 'Твоя связка' : 'Связка от Никиты'}
                    </StickerBadge>
                    <span className="text-[11px] sm:text-xs font-bold text-zinc-600">
                      Темп: {combo.recommendedBpm} • {combo.moveIds.length} восьмерок (
                      {combo.moveIds.length * 8} счетов)
                    </span>
                  </div>

                  <h4 className="font-display text-base sm:text-lg uppercase text-black leading-tight">
                    {combo.name}
                  </h4>
                  <p className="text-xs font-bold text-zinc-600 italic mb-2">
                    «{combo.nickname}»
                  </p>
                  <p className="text-xs text-zinc-700 leading-snug mb-3">
                    {combo.description}
                  </p>

                  {/* Move sequence preview badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {combo.moveIds.map((mId, idx) => {
                      const m = MOVES_CATALOG.find((item) => item.id === mId);
                      return (
                        <span
                          key={idx}
                          className="bg-[#F4EFE6] text-black border border-black px-2 py-0.5 rounded text-[11px] font-heading font-extrabold"
                        >
                          {idx + 1}. {m?.name || mId}
                        </span>
                      );
                    })}
                  </div>

                  {/* Nikita's tip */}
                  <div className="bg-[#FFE600]/25 border border-black/30 p-2 rounded text-[11px] text-zinc-800 italic font-medium">
                    💡 {combo.nikitaTip}
                  </div>
                </div>

                {/* Card Footer: Delete ANY combo & Start Rehearsal */}
                <div className="pt-3 border-t-2 border-black/20 flex items-center justify-between gap-2 mt-3">
                  <button
                    onClick={() => onDeleteCustomCombo(combo.id)}
                    className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Удалить эту связку"
                  >
                    <Trash2 size={14} />
                    <span>Удалить</span>
                  </button>

                  <button
                    onClick={() => setSelectedComboForRehearsal(combo)}
                    className="ml-auto px-4 py-2 bg-[#00E676] hover:bg-emerald-400 text-black rounded font-heading text-xs font-black border-2 border-black neo-btn cursor-pointer flex items-center gap-1.5"
                  >
                    <Play size={14} fill="currentColor" /> ЗАПУСТИТЬ РЕПЕТИЦИЮ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Rehearsal Modal popup if active */}
      {selectedComboForRehearsal && (
        <LiveRehearsalModal
          combo={selectedComboForRehearsal}
          onClose={() => setSelectedComboForRehearsal(null)}
        />
      )}
    </div>
  );
};
