import React from 'react';
import { MovePhase, BreakMove } from '../../types';
import { Volume2, AlertTriangle, Footprints, Hand, ChevronLeft, ChevronRight } from 'lucide-react';
import { speechService } from '../../services/speechService';
import { soundEngine } from '../../services/soundEngine';

interface StepByStepViewerProps {
  move: BreakMove;
  currentPhaseIndex: number; // 0 to 3
  onSelectPhase: (phaseIndex: number) => void;
}

export const StepByStepViewer: React.FC<StepByStepViewerProps> = ({
  move,
  currentPhaseIndex,
  onSelectPhase
}) => {
  const currentPhase: MovePhase = move.phases[currentPhaseIndex] || move.phases[0];

  const handleSpeak = () => {
    soundEngine.playCassetteClick();
    speechService.speakNikita(
      currentPhase.nikitaInstruction,
      `${move.id}-${currentPhase.phaseNumber}`
    );
  };

  const handlePrev = () => {
    soundEngine.playCassetteClick();
    onSelectPhase((currentPhaseIndex + 3) % 4);
  };

  const handleNext = () => {
    soundEngine.playCassetteClick();
    onSelectPhase((currentPhaseIndex + 1) % 4);
  };

  return (
    <div className="bg-[#ffffff] border-3 border-black p-3 sm:p-4 rounded-lg shadow-[4px_4px_0px_0px_#000] sm:shadow-[5px_5px_0px_0px_#000] text-black">
      {/* 4 Phase Progress Pills */}
      <div className="grid grid-cols-4 gap-1 sm:gap-1.5 mb-3">
        {move.phases.map((p, idx) => {
          const isActive = idx === currentPhaseIndex;
          return (
            <button
              key={p.phaseNumber}
              onClick={() => {
                soundEngine.playCassetteClick();
                onSelectPhase(idx);
              }}
              className={`py-1.5 sm:py-2 px-1 rounded font-heading font-extrabold text-[11px] sm:text-xs border-2 transition-all cursor-pointer text-center ${
                isActive
                  ? 'bg-[#FFE600] border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-[#F4EFE6] border-zinc-400 text-zinc-600 hover:border-black'
              }`}
            >
              <div className="text-[9px] sm:text-[10px] uppercase font-mono opacity-80 leading-none">
                Шаг {idx + 1}
              </div>
              <div className="truncate mt-0.5 text-[10px] sm:text-xs">
                {p.subtitle.split('—')[0].trim()}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Active Phase Card */}
      <div className="bg-[#F4EFE6] border-2 border-black p-3 sm:p-3.5 rounded-md relative overflow-hidden">
        {/* Visual cue tape */}
        <div className="inline-block bg-[#00E5FF] text-black text-[10px] font-extrabold px-2 py-0.5 rounded border border-black uppercase mb-1">
          {currentPhase.visualCue}
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-heading font-black text-base sm:text-lg text-black leading-tight">
              {currentPhase.title}
            </h3>
            <span className="text-xs font-mono font-bold text-zinc-600">
              {currentPhase.subtitle}
            </span>
          </div>

          {/* Voice button */}
          <button
            onClick={handleSpeak}
            className="px-2.5 py-1.5 bg-[#FFE600] hover:bg-yellow-300 text-black rounded-md border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center gap-1 text-xs font-bold shrink-0"
            title="Озвучить совет Никиты"
          >
            <Volume2 size={15} />
            <span>Голос</span>
          </button>
        </div>

        {/* Nikita instruction comic bubble */}
        <div className="bg-white border-2 border-black p-2.5 rounded mt-2.5 text-xs sm:text-sm font-medium text-zinc-800 relative">
          <div className="flex items-center gap-1.5 font-bold text-[#FF4D00] text-[11px] uppercase mb-0.5">
            <span>💬 Подсказка от Никиты:</span>
          </div>
          «{currentPhase.nikitaInstruction}»
        </div>

        {/* Anatomical positioning guides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
          {/* Feet */}
          <div className="bg-white border-2 border-zinc-800 p-2 rounded text-xs">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 mb-1">
              <Footprints size={14} className="text-[#00E5FF] shrink-0" />
              <span>Положение стоп и ног:</span>
            </div>
            <p className="text-zinc-700 leading-snug">{currentPhase.feetPosition}</p>
          </div>

          {/* Hands */}
          <div className="bg-white border-2 border-zinc-800 p-2 rounded text-xs">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 mb-1">
              <Hand size={14} className="text-[#00E676] shrink-0" />
              <span>Положение рук и корпуса:</span>
            </div>
            <p className="text-zinc-700 leading-snug">{currentPhase.handsPosition}</p>
          </div>
        </div>

        {/* Common mistake alert */}
        <div className="mt-2.5 bg-red-100 border-2 border-red-600 p-2 rounded text-xs flex items-start gap-2 text-red-900">
          <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Осторожно, частая ошибка: </span>
            <span>{currentPhase.commonMistake}</span>
          </div>
        </div>
      </div>

      {/* Scrubber Navigation Buttons */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-300">
        <button
          onClick={handlePrev}
          className="px-3 py-1.5 bg-[#121212] text-white hover:bg-zinc-800 rounded font-heading text-xs font-bold flex items-center gap-1 neo-btn cursor-pointer"
        >
          <ChevronLeft size={16} /> Назад
        </button>

        <span className="text-xs font-mono font-bold text-zinc-500">
          Шаг {currentPhaseIndex + 1} из 4
        </span>

        <button
          onClick={handleNext}
          className="px-3 py-1.5 bg-[#FFE600] text-black hover:bg-yellow-300 rounded font-heading text-xs font-bold flex items-center gap-1 neo-btn cursor-pointer"
        >
          Вперед <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
