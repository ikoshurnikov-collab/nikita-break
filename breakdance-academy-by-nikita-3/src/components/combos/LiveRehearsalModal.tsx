import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Combo, BreakMove } from '../../types';
import { MOVES_CATALOG } from '../../data/movesCatalog';
import { soundEngine } from '../../services/soundEngine';
import { speechService } from '../../services/speechService';
import { progressStorage } from '../../services/progressStorage';
import { BboySvgSimulator } from '../player/BboySvgSimulator';
import { getVideoUrlCandidates } from '../../data/nikitaMediaManifest';
import { X, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWakeLock } from '../../hooks/useWakeLock';

interface LiveRehearsalModalProps {
  combo: Combo;
  onClose: () => void;
}

export const LiveRehearsalModal: React.FC<LiveRehearsalModalProps> = ({
  combo,
  onClose
}) => {
  useWakeLock(true);

  // Memoize moves so array reference stays stable across beat renders
  const moves: BreakMove[] = useMemo(
    () =>
      combo.moveIds
        .map((id) => MOVES_CATALOG.find((m) => m.id === id))
        .filter(Boolean) as BreakMove[],
    [combo.moveIds]
  );

  const [totalBeatsElapsed, setTotalBeatsElapsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isRehearsing, setIsRehearsing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState<number | string | null>(3);
  const [videoCandidateIdx, setVideoCandidateIdx] = useState(0);
  const [staticVideoAvailable, setStaticVideoAvailable] = useState(false);

  const totalComboBeats = Math.max(8, moves.length * 8);
  const currentMoveIdx = Math.min(
    Math.max(0, moves.length - 1),
    Math.floor(totalBeatsElapsed / 8)
  );
  const currentBeatIn8 = (totalBeatsElapsed % 8) + 1;
  const beatsLeftInMove = 8 - (totalBeatsElapsed % 8);

  const currentMove = moves[currentMoveIdx] || moves[0];
  const nextMove = moves[currentMoveIdx + 1];

  const currentVideoCandidates = useMemo(
    () =>
      currentMove ? getVideoUrlCandidates(currentMove.id, currentMove.videoPath) : [],
    [currentMove]
  );
  const activeRehearsalVideoSrc =
    currentVideoCandidates.length > 0
      ? currentVideoCandidates[Math.min(videoCandidateIdx, currentVideoCandidates.length - 1)]
      : null;

  useEffect(() => {
    setVideoCandidateIdx(0);
    setStaticVideoAvailable(false);
  }, [currentMove?.id]);

  const handleFinish = useCallback(() => {
    setIsFinished(true);
    setIsRehearsing(false);
    setIsPaused(false);
    soundEngine.stop();
    speechService.stop();
    soundEngine.playSuccessFanfare();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 }
    });
    progressStorage.recordRehearsal();
    speechService.speakNikita(
      'Отличный выход! Ты станцевал всю связку без запинки! Жюри ставит высший балл!',
      'combo-finish'
    );
  }, []);

  // Start with 3-2-1 countdown on mount and ensure cleanup stops audio & speech
  useEffect(() => {
    soundEngine.stop();
    speechService.stop();
    speechService.playCountdownCue('count-3', false, (isFinal) =>
      soundEngine.playCountdownBeep(isFinal)
    );

    const timer1 = window.setTimeout(() => {
      setCountdown(2);
      speechService.playCountdownCue('count-2', false, (isFinal) =>
        soundEngine.playCountdownBeep(isFinal)
      );
    }, 900);

    const timer2 = window.setTimeout(() => {
      setCountdown(1);
      speechService.playCountdownCue('count-1', false, (isFinal) =>
        soundEngine.playCountdownBeep(isFinal)
      );
    }, 1800);

    const timer3 = window.setTimeout(() => {
      setCountdown('БРЕЙК!');
      speechService.playCountdownCue('count-break', true, (isFinal) =>
        soundEngine.playCountdownBeep(isFinal)
      );
    }, 2700);

    const timer4 = window.setTimeout(() => {
      setCountdown(null);
      setTotalBeatsElapsed(0);
      setIsRehearsing(true);
      setIsPaused(false);
      soundEngine.setBpm(combo.recommendedBpm || 98);
      soundEngine.start();
    }, 3300);

    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
      window.clearTimeout(timer3);
      window.clearTimeout(timer4);
      soundEngine.stop();
      speechService.stop();
    };
  }, [combo.recommendedBpm]);

  // Reliable quarter-note beat timer that advances moves every 8 beats
  useEffect(() => {
    if (!isRehearsing || isFinished || isPaused) return;

    const bpm = combo.recommendedBpm || 98;
    const beatIntervalMs = Math.round((60 / bpm) * 1000);

    const intervalId = window.setInterval(() => {
      setTotalBeatsElapsed((prev) => prev + 1);
    }, beatIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRehearsing, isFinished, isPaused, combo.recommendedBpm]);

  // Check if all moves (eights) have completed
  useEffect(() => {
    if (isRehearsing && !isFinished && totalBeatsElapsed >= totalComboBeats) {
      handleFinish();
    }
  }, [totalBeatsElapsed, totalComboBeats, isRehearsing, isFinished, handleFinish]);

  // Speak ONLY the short move name instantaneously at the start of EACH move in the combo
  useEffect(() => {
    if (!isRehearsing || isFinished || isPaused) return;
    const activeMove = moves[currentMoveIdx];
    if (!activeMove) return;

    speechService.speakMoveNameInstant(activeMove.name, activeMove.id);
  }, [currentMoveIdx, isRehearsing, isFinished, isPaused, moves]);

  const handlePrevStep = () => {
    const prevIdx = Math.max(0, currentMoveIdx - 1);
    setTotalBeatsElapsed(prevIdx * 8);
  };

  const handleNextStep = () => {
    if (currentMoveIdx + 1 < moves.length) {
      setTotalBeatsElapsed((currentMoveIdx + 1) * 8);
    } else {
      handleFinish();
    }
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => {
      const next = !prev;
      if (next) {
        soundEngine.stop();
        speechService.stop();
      } else {
        soundEngine.start();
      }
      return next;
    });
  };

  const handleStop = () => {
    soundEngine.stop();
    speechService.stop();
    onClose();
  };

  const iosInlineVideoProps = {
    'webkit-playsinline': 'true'
  } as React.VideoHTMLAttributes<HTMLVideoElement>;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-2.5 sm:p-5 text-white select-none overflow-y-auto">
      {/* Top Header */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-2 border-b-2 border-zinc-800 pb-2.5 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D00] animate-ping shrink-0" />
            <span className="font-display text-[10px] sm:text-xs text-[#FFE600] uppercase tracking-wider truncate">
              ЖИВАЯ РЕПЕТИЦИЯ // БАТТЛ НА ПЕРЕМЕНЕ
            </span>
          </div>
          <h2 className="font-display text-base sm:text-2xl text-white uppercase mt-0.5 truncate">
            {combo.name}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {countdown === null && !isFinished && (
            <button
              onClick={handleTogglePause}
              className={`px-3 py-1.5 rounded-lg border-2 border-black font-heading font-black text-xs flex items-center gap-1 cursor-pointer ${
                isPaused ? 'bg-[#00E676] text-black' : 'bg-[#FF4D00] text-white'
              }`}
            >
              {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} />}
              <span>{isPaused ? 'ПРОДОЛЖИТЬ' : 'ПАУЗА'}</span>
            </button>
          )}

          <button
            onClick={handleStop}
            aria-label="Закрыть"
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border-2 border-zinc-600 cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="flex flex-col items-center justify-center my-auto text-center px-4 py-6 bg-zinc-900/90 border-4 border-[#FFE600] rounded-2xl max-w-md w-full">
          <span className="text-zinc-300 font-mono font-bold text-xs sm:text-sm uppercase tracking-wider">
            ПРИГОТОВИЛИСЬ...
          </span>
          <div className="my-5 font-display text-6xl sm:text-8xl text-[#FFE600] animate-pulse leading-none">
            {countdown}
          </div>
          <span className="font-heading font-black text-white text-xs sm:text-base">
            Первое движение: <span className="text-[#00E5FF]">{moves[0]?.name}</span>!
          </span>
        </div>
      )}

      {/* Rehearsal Active Stage */}
      {countdown === null && !isFinished && (
        <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center gap-2.5 sm:gap-3.5 my-2">
          {/* Visual Chain of All Steps in Combo */}
          <div className="w-full bg-[#161616] border-2 border-zinc-700 p-2 sm:p-2.5 rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-zinc-400 uppercase">
              <span>ЦЕПОЧКА СВЯЗКИ ({currentMoveIdx + 1} ИЗ {moves.length}):</span>
              <span className="text-[#00E5FF]">
                До смены движения: {beatsLeftInMove}{' '}
                {beatsLeftInMove === 1 ? 'счет' : beatsLeftInMove <= 4 ? 'счета' : 'счетов'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {moves.map((m, idx) => {
                const isActive = idx === currentMoveIdx;
                const isDone = idx < currentMoveIdx;
                return (
                  <button
                    key={`${m.id}-${idx}`}
                    onClick={() => setTotalBeatsElapsed(idx * 8)}
                    className={`px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-heading font-extrabold border-2 transition-all cursor-pointer flex items-center gap-1 ${
                      isActive
                        ? 'bg-[#FFE600] text-black border-black scale-105 shadow-[2px_2px_0px_0px_#000]'
                        : isDone
                        ? 'bg-[#00E676]/25 text-[#00E676] border-[#00E676]/50'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
                    }`}
                  >
                    <span>{idx + 1}.</span>
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Big 8-Beat Counter Gauge */}
          <div className="w-full bg-[#1a1a1a] border-3 border-black p-2.5 sm:p-3 rounded-xl shadow-[4px_4px_0px_0px_#FFE600] flex flex-col items-center">
            <div className="text-[10px] sm:text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1.5 text-center">
              СЧИТАЕМ ВОСЬМЕРКУ ДЛЯ «{currentMove?.name}» (СЧЕТ {currentBeatIn8} ИЗ 8)
            </div>

            <div className="grid grid-cols-8 gap-1 sm:gap-1.5 w-full max-w-md">
              {Array.from({ length: 8 }).map((_, i) => {
                const b = i + 1;
                const isCurrent = b === currentBeatIn8;
                return (
                  <div
                    key={b}
                    className={`h-8 sm:h-11 rounded flex items-center justify-center font-display text-sm sm:text-lg border-2 transition-all ${
                      isCurrent
                        ? 'bg-[#FFE600] text-black border-black scale-105 shadow-[0_0_12px_#FFE600]'
                        : b < currentBeatIn8
                        ? 'bg-[#00E676]/30 text-[#00E676] border-zinc-700'
                        : 'bg-zinc-900 text-zinc-600 border-zinc-800'
                    }`}
                  >
                    {b}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Move Card with Static Video of Nikita (if available) OR Animated Simulator */}
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-7">
              {currentMove && (
                <>
                  {activeRehearsalVideoSrc && (
                    <video
                      key={`rehearsal-vid-${currentMove.id}-${currentMoveIdx}-${videoCandidateIdx}`}
                      src={activeRehearsalVideoSrc}
                      autoPlay
                      loop
                      muted
                      playsInline
                      {...iosInlineVideoProps}
                      onLoadedData={() => setStaticVideoAvailable(true)}
                      onError={() => {
                        if (videoCandidateIdx + 1 < currentVideoCandidates.length) {
                          setVideoCandidateIdx((prev) => prev + 1);
                        } else {
                          setStaticVideoAvailable(false);
                        }
                      }}
                      className={
                        staticVideoAvailable
                          ? 'w-full h-[220px] sm:h-[300px] object-contain bg-black rounded-lg border-3 border-black'
                          : 'hidden'
                      }
                    />
                  )}
                  {!staticVideoAvailable && (
                    <BboySvgSimulator
                      key={`sim-${currentMove.id}-${currentMoveIdx}`}
                      move={currentMove}
                      isPlaying={!isPaused}
                      speed={1.0}
                      isMirrored={false}
                      bpm={combo.recommendedBpm}
                    />
                  )}
                </>
              )}
            </div>

            {/* Current Move Info, Next Move Teaser, and Step Controls */}
            <div className="md:col-span-5 flex flex-col gap-2.5">
              {/* Current */}
              <div className="bg-[#FFE600] border-3 border-black p-3 sm:p-4 rounded-xl text-black shadow-[4px_4px_0px_0px_#000]">
                <div className="text-[10px] font-black uppercase text-black/75">
                  ШАГ {currentMoveIdx + 1} ИЗ {moves.length} • СЕЙЧАС ТАНЦУЕМ:
                </div>
                <h3 className="font-display text-lg sm:text-2xl uppercase mt-0.5 leading-tight">
                  {currentMove?.name}
                </h3>
                <p className="text-xs font-bold text-black/90 mt-1 italic leading-snug">
                  «{currentMove?.nikitaQuote}»
                </p>
              </div>

              {/* Next Upcoming Move */}
              <div className="bg-[#1e1e1e] border-2 border-zinc-700 p-2.5 sm:p-3 rounded-lg text-zinc-300">
                <div className="text-[10px] font-bold text-zinc-400 uppercase">
                  ДАЛЬШЕ ПО СВЯЗКЕ (ЧЕРЕЗ {beatsLeftInMove} СЧ.):
                </div>
                <div className="font-heading font-black text-sm sm:text-base text-[#00E5FF] uppercase mt-0.5">
                  {nextMove ? `${currentMoveIdx + 2}. ${nextMove.name}` : '🏁 ФИНАЛЬНЫЙ ФРИЗ И ПОБЕДА!'}
                </div>
              </div>

              {/* Manual Step Navigation Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePrevStep}
                  disabled={currentMoveIdx === 0}
                  className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white rounded-lg border-2 border-zinc-600 font-heading font-extrabold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={15} />
                  <span>Пред. шаг</span>
                </button>
                <button
                  onClick={handleNextStep}
                  className="py-2 px-3 bg-[#00E5FF] hover:bg-cyan-300 text-black rounded-lg border-2 border-black font-heading font-black text-xs flex items-center justify-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                >
                  <span>{currentMoveIdx + 1 < moves.length ? 'След. шаг' : 'Финиш!'}</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rehearsal Finished Celebration */}
      {isFinished && (
        <div className="w-full max-w-lg bg-white border-4 border-black p-4 sm:p-6 rounded-2xl text-black shadow-[6px_6px_0px_0px_#FFE600] text-center my-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FFE600] rounded-full border-3 border-black flex items-center justify-center mx-auto text-3xl mb-3 shadow-[3px_3px_0px_0px_#000]">
            🏆
          </div>

          <h3 className="font-display text-lg sm:text-2xl uppercase text-black">
            СВЯЗКА ВЫПОЛНЕНА НА ОТЛИЧНО!
          </h3>
          <p className="text-xs sm:text-sm font-bold text-zinc-700 mt-1">
            Ты круто станцевал связку «{combo.name}»!
          </p>

          <div className="grid grid-cols-2 gap-2 my-4 text-left">
            <div className="bg-[#F4EFE6] border-2 border-black p-2.5 rounded">
              <div className="text-[10px] font-bold text-zinc-600 uppercase">Движений подряд:</div>
              <div className="font-display text-base sm:text-lg text-[#FF4D00]">{moves.length}</div>
            </div>
            <div className="bg-[#F4EFE6] border-2 border-black p-2.5 rounded">
              <div className="text-[10px] font-bold text-zinc-600 uppercase">Длительность:</div>
              <div className="font-display text-sm sm:text-lg text-black">
                {moves.length} восьмерок ({moves.length * 8} счетов)
              </div>
            </div>
          </div>

          <button
            onClick={handleStop}
            className="w-full py-3 bg-[#00E676] hover:bg-emerald-400 text-black font-display text-xs sm:text-sm rounded-lg border-3 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer neo-btn"
          >
            ВЕРНУТЬСЯ К СВЯЗКАМ
          </button>
        </div>
      )}

      {/* Bottom Bar info */}
      <div className="w-full max-w-4xl flex items-center justify-between text-xs font-bold text-zinc-400 border-t border-zinc-800 pt-2 shrink-0">
        <span>Темп бита: {combo.recommendedBpm} уд/мин</span>
        <span>
          Шаг связки: {currentMoveIdx + 1} из {moves.length}
        </span>
      </div>
    </div>
  );
};
