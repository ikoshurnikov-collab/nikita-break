import React, { useState, useEffect, useRef } from 'react';
import { BreakMove } from '../../types';
import { BboySvgSimulator } from './BboySvgSimulator';
import { FloorContactMap } from './FloorContactMap';
import { StepByStepViewer } from './StepByStepViewer';
import { NikitaAvatar } from '../common/NikitaAvatar';
import { soundEngine } from '../../services/soundEngine';
import { speechService } from '../../services/speechService';
import { Play, Pause, RotateCw, Video, UserCheck, Volume2, Sparkles } from 'lucide-react';

interface HybridPlayerProps {
  move: BreakMove;
}

type PlayerTab = 'simulator' | 'video' | 'steps';

export const HybridPlayer: React.FC<HybridPlayerProps> = ({ move }) => {
  const [activeTab, setActiveTab] = useState<PlayerTab>('video');
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<0.25 | 0.5 | 1.0>(0.5);
  const [isMirrored, setIsMirrored] = useState(false);
  const [isVoiceCountEnabled, setIsVoiceCountEnabled] = useState(false);
  const [showSilentModeHint, setShowSilentModeHint] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownNum, setCountdownNum] = useState<number | string>(3);
  const [hasStaticVideo, setHasStaticVideo] = useState(true);

  const activeVideoSrc = `./nikita/videos/${move.id}.mp4`;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const countdownTimersRef = useRef<number[]>([]);

  const baseBpm = move.rhythmConfig?.defaultBpm ?? move.bpmRange[0] ?? 98;
  const preferredGrooveId = move.rhythmConfig?.preferredGrooveId ?? 'school-funk';
  const beatsPerPhase = move.rhythmConfig?.beatsPerPhase ?? 1;
  const phaseVoiceCues = move.rhythmConfig?.phaseVoiceCues ?? ['Раз!', 'Два!', 'Три!', 'Четыре!'];

  const phaseDurationMs = ((60 / baseBpm) * 1000 * beatsPerPhase) / speed;
  const effectiveBpm = Math.max(
    55,
    Math.round(baseBpm * (speed === 0.25 ? 0.6 : speed === 0.5 ? 0.75 : 1))
  );
  const activePhaseIdx = ((currentPhaseIndex % 4) + 4) % 4;
  const activeVoiceCue = phaseVoiceCues[activePhaseIdx] || 'Раз!';

  const clearCountdownTimers = () => {
    countdownTimersRef.current.forEach((id) => window.clearTimeout(id));
    countdownTimersRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearCountdownTimers();
    };
  }, []);

  useEffect(() => {
    clearCountdownTimers();
    setIsCountingDown(false);
    setHasStaticVideo(true);
    setActiveTab('video');
    setCurrentPhaseIndex(0);
  }, [move.id]);

  useEffect(() => {
    soundEngine.configureMoveRhythm(preferredGrooveId, baseBpm, speed);
  }, [move.id, preferredGrooveId, baseBpm, speed]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || activeTab !== 'video' || !hasStaticVideo) return;

    vid.playbackRate = speed;

    if (isPlaying && !isCountingDown) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [isPlaying, speed, activeTab, hasStaticVideo, isCountingDown, move.id]);

  useEffect(() => {
    if (activeTab !== 'video' || !isPlaying || isCountingDown) {
      return;
    }

    let rafId: number | null = null;
    const startTime = performance.now();

    const syncVideoPhase = (now: number) => {
      const vid = videoRef.current;
      let nextPhase = 0;

      if (vid && hasStaticVideo && Number.isFinite(vid.duration) && vid.duration > 0.2) {
        const ratio = (vid.currentTime % vid.duration) / vid.duration;
        nextPhase = Math.floor(ratio * 4) % 4;
      } else {
        const elapsed = now - startTime;
        nextPhase = Math.floor(elapsed / phaseDurationMs) % 4;
      }

      setCurrentPhaseIndex((prev) => (prev !== nextPhase ? nextPhase : prev));
      rafId = requestAnimationFrame(syncVideoPhase);
    };

    rafId = requestAnimationFrame(syncVideoPhase);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [activeTab, isPlaying, isCountingDown, hasStaticVideo, phaseDurationMs, move.id]);

  useEffect(() => {
    if (!isPlaying || isCountingDown || activeTab === 'steps') {
      return;
    }

    const phaseIdx = ((currentPhaseIndex % 4) + 4) % 4;
    const phaseNumber = phaseIdx + 1;

    soundEngine.syncPhaseBeat(phaseIdx);

    if (!isVoiceCountEnabled) {
      return;
    }

    const cue = phaseVoiceCues[phaseIdx] || 'Раз!';
    soundEngine.playMetronomeTick(phaseNumber);
    speechService.speakPhaseCountInstant(phaseNumber, cue, speed);
  }, [currentPhaseIndex, isVoiceCountEnabled, isPlaying, isCountingDown, activeTab, move.id, speed, phaseVoiceCues]);

  const handleSelectVideoTab = () => {
    setActiveTab('video');
  };

  const handleCountdownAndStart = () => {
    if (isCountingDown) return;

    soundEngine.unlock();
    if (videoRef.current) {
      const vid = videoRef.current;
      vid.muted = false;
      vid
        .play()
        .then(() => {
          vid.pause();
          vid.currentTime = 0;
        })
        .catch(() => {});
    }

    clearCountdownTimers();
    setIsPlaying(false);
    setCurrentPhaseIndex(0);
    soundEngine.stop();
    soundEngine.configureMoveRhythm(preferredGrooveId, baseBpm, speed);
    setShowSilentModeHint(true);

    if (activeTab === 'steps' || (activeTab === 'video' && !hasStaticVideo)) {
      setActiveTab('simulator');
    }

    setIsCountingDown(true);
    setCountdownNum(3);
    speechService.playCountdownCue('count-3', false, (isFinal) =>
      soundEngine.playCountdownBeep(isFinal)
    );

    const t1 = window.setTimeout(() => {
      setCountdownNum(2);
      speechService.playCountdownCue('count-2', false, (isFinal) =>
        soundEngine.playCountdownBeep(isFinal)
      );
    }, 800);

    const t2 = window.setTimeout(() => {
      setCountdownNum(1);
      speechService.playCountdownCue('count-1', false, (isFinal) =>
        soundEngine.playCountdownBeep(isFinal)
      );
    }, 1600);

    const t3 = window.setTimeout(() => {
      setCountdownNum('БРЕЙК!');
      speechService.playCountdownCue('count-break', true, (isFinal) =>
        soundEngine.playCountdownBeep(isFinal)
      );
    }, 2400);

    const t4 = window.setTimeout(() => {
      setCurrentPhaseIndex(0);
      setIsCountingDown(false);
      setIsPlaying(true);
      soundEngine.configureMoveRhythm(preferredGrooveId, baseBpm, speed);
      soundEngine.start();
    }, 2900);

    countdownTimersRef.current = [t1, t2, t3, t4];
  };

  const handleTogglePlay = () => {
    soundEngine.unlock();
    clearCountdownTimers();
    setIsCountingDown(false);

    if (activeTab === 'steps' || (activeTab === 'video' && !hasStaticVideo)) {
      setActiveTab('simulator');
      setIsPlaying(true);
      return;
    }

    setIsPlaying((prev) => {
      const next = !prev;
      if (!next) {
        soundEngine.stop();
      }
      return next;
    });
  };

  const handleToggleMirror = () => {
    setIsMirrored((prev) => !prev);
  };

  const handleSpeedChange = (newSpeed: 0.25 | 0.5 | 1.0) => {
    setSpeed(newSpeed);
    soundEngine.configureMoveRhythm(preferredGrooveId, baseBpm, newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  const handleListenNikitaQuote = () => {
    soundEngine.unlock();
    setShowSilentModeHint(true);
    speechService.speakNikita(move.nikitaVoiceScript, move.id, move.audioPath);
  };

  const handleToggleVoiceCount = () => {
    soundEngine.unlock();
    setIsVoiceCountEnabled((prev) => {
      const next = !prev;
      if (next) {
        setShowSilentModeHint(true);
      }
      return next;
    });
  };

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const vid = e.currentTarget;
    if (Number.isFinite(vid.duration) && vid.duration > 0.2) {
      const ratio = (vid.currentTime % vid.duration) / vid.duration;
      const nextPhase = Math.floor(ratio * 4) % 4;
      setCurrentPhaseIndex((prev) => (prev !== nextPhase ? nextPhase : prev));
    }
  };

  const iosInlineVideoProps = {
    'webkit-playsinline': 'true'
  } as React.VideoHTMLAttributes<HTMLVideoElement>;

  const showFullPlaybackControls =
    activeTab === 'simulator' || (activeTab === 'video' && hasStaticVideo);

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="bg-[#FFE600] border-3 border-black p-2.5 sm:p-3 rounded-lg shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-start sm:items-center gap-2.5">
          <NikitaAvatar size="sm" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase text-black">Никита говорит:</div>
            <p className="text-xs sm:text-sm font-bold text-black italic leading-snug">
              «{move.nikitaQuote}»
            </p>
          </div>
        </div>

        <button
          onClick={handleListenNikitaQuote}
          className="w-full sm:w-auto px-3 py-2 bg-black hover:bg-zinc-800 text-[#FFE600] rounded-md border-2 border-black cursor-pointer shrink-0 shadow-[2px_2px_0px_0px_#000] active:scale-95 flex items-center justify-center gap-1.5 font-heading font-black text-xs"
          title="Послушать озвучку Никиты"
        >
          <Volume2 size={15} />
          <span>Голос Никиты</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1 sm:gap-1.5 bg-[#1a1a1a] p-1 sm:p-1.5 rounded-lg border-3 border-black shadow-[3px_3px_0px_0px_#000]">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`py-1.5 px-1 sm:px-2 rounded font-heading font-extrabold text-[10px] sm:text-xs transition-all cursor-pointer flex items-center justify-center gap-1 text-center leading-tight ${
            activeTab === 'simulator'
              ? 'bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles size={13} className="shrink-0 hidden xs:inline" />
          <span>🕺 2D-ТРЕНАЖЕР</span>
        </button>

        <button
          onClick={handleSelectVideoTab}
          className={`py-1.5 px-1 sm:px-2 rounded font-heading font-extrabold text-[10px] sm:text-xs transition-all cursor-pointer flex items-center justify-center gap-1 text-center leading-tight relative ${
            activeTab === 'video'
              ? 'bg-[#00E5FF] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Video size={13} className="shrink-0 hidden xs:inline" />
          <span>📹 ВИДЕО НИКИТЫ</span>
          {hasStaticVideo && (
            <span className="w-2 h-2 rounded-full bg-[#FF4D00] animate-ping shrink-0" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('steps')}
          className={`py-1.5 px-1 sm:px-2 rounded font-heading font-extrabold text-[10px] sm:text-xs transition-all cursor-pointer flex items-center justify-center gap-1 text-center leading-tight ${
            activeTab === 'steps'
              ? 'bg-[#00E676] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <UserCheck size={13} className="shrink-0 hidden xs:inline" />
          <span>👤 ПО ШАГАМ</span>
        </button>
      </div>

      <div className="relative">
        {isCountingDown && (
          <div className="absolute inset-0 bg-black/90 z-30 rounded-lg flex flex-col items-center justify-center p-4 border-4 border-[#FFE600]">
            <span className="text-zinc-300 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
              ПРИГОТОВИЛИСЬ...
            </span>
            <div className="my-4 font-display text-5xl sm:text-7xl text-[#FFE600] animate-pulse text-center px-3 leading-none">
              {countdownNum}
            </div>
            <span className="text-white text-xs sm:text-sm font-extrabold uppercase tracking-wide">
              Встань в стойку би-боя!
            </span>
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8">
              <BboySvgSimulator
                move={move}
                isPlaying={isPlaying}
                speed={speed}
                isMirrored={isMirrored}
                bpm={baseBpm}
                phaseDurationMs={phaseDurationMs}
                onPhaseChange={(phase) => setCurrentPhaseIndex(phase)}
              />
            </div>
            <div className="md:col-span-4">
              <FloorContactMap
                contacts={move.floorContacts}
                currentPhase={activePhaseIdx + 1}
                moveName={move.name}
              />
            </div>
          </div>
        )}

        {activeTab === 'video' && (
          <div className="w-full min-h-[280px] sm:min-h-[340px] bg-black rounded-lg border-3 border-black overflow-hidden flex flex-col items-center justify-center p-3 sm:p-4 relative shadow-[4px_4px_0px_0px_#000]">
            {hasStaticVideo ? (
              <div className="w-full h-full flex flex-col items-center relative">
                <div className="w-full flex flex-wrap items-center justify-between gap-1.5 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="bg-zinc-900 text-[#FFE600] font-bold text-[11px] px-2 py-0.5 rounded border border-zinc-700">
                      📹 Живое видео Никиты
                    </span>
                    <span className="bg-[#FFE600] text-black font-mono font-black text-[11px] px-2 py-0.5 rounded border border-black">
                      ШАГ {activePhaseIdx + 1} / 4 : {activeVoiceCue}
                    </span>
                    {isMirrored && (
                      <span className="bg-[#00E5FF] text-black font-extrabold text-[10px] px-1.5 py-0.5 rounded border border-black uppercase">
                        ЗЕРКАЛО
                      </span>
                    )}
                  </div>
                  <span className="bg-zinc-900 text-white font-mono text-[11px] px-2 py-0.5 rounded border border-zinc-700">
                    {speed}x • {effectiveBpm} BPM
                  </span>
                </div>

                <div className="relative w-full flex justify-center">
                  <video
                    ref={videoRef}
                    src={activeVideoSrc}
                    onClick={handleTogglePlay}
                    autoPlay
                    muted
                    loop
                    playsInline
                    {...iosInlineVideoProps}
                    onLoadedMetadata={(e) => {
                      e.currentTarget.playbackRate = speed;
                      if (isPlaying && !isCountingDown) {
                        e.currentTarget.play().catch(() => {});
                      }
                    }}
                    onError={() => {
                      setHasStaticVideo(false);
                      setActiveTab('simulator');
                    }}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => {
                      if (!isCountingDown) {
                        setIsPlaying(false);
                      }
                    }}
                    className={`w-full max-h-[380px] sm:max-h-[420px] rounded object-contain bg-black border-2 border-zinc-700 cursor-pointer transition-transform duration-200 ${
                      isMirrored ? 'scale-x-[-1]' : ''
                    }`}
                  />

                  <div className="absolute top-2.5 left-2.5 pointer-events-none flex items-center gap-1.5">
                    <span className="bg-black/85 text-[#FFE600] font-mono font-black text-xs sm:text-sm px-2.5 py-1 rounded border-2 border-[#FFE600] shadow-[2px_2px_0px_0px_#000]">
                      ШАГ {activePhaseIdx + 1} / 4 : {activeVoiceCue}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-2.5 pointer-events-none">
                    <span
                      className={`px-2.5 sm:px-3 py-1 rounded-md border-2 border-black font-display text-xs sm:text-sm uppercase shadow-[2px_2px_0px_0px_#000] inline-flex items-center gap-1 ${
                        isMirrored ? 'bg-[#FF4D00] text-white' : 'bg-[#00E5FF] text-black'
                      }`}
                    >
                      {isMirrored ? '⬅️ ПРАВО' : '⬅️ ЛЕВО'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-2.5 pointer-events-none">
                    <span
                      className={`px-2.5 sm:px-3 py-1 rounded-md border-2 border-black font-display text-xs sm:text-sm uppercase shadow-[2px_2px_0px_0px_#000] inline-flex items-center gap-1 ${
                        isMirrored ? 'bg-[#00E5FF] text-black' : 'bg-[#FF4D00] text-white'
                      }`}
                    >
                      {isMirrored ? 'ЛЕВО ➡️' : 'ПРАВО ➡️'}
                    </span>
                  </div>
                </div>

                <div className="w-full flex items-center justify-between text-xs text-zinc-400 font-bold mt-2">
                  <span>Используй кнопки внизу для замедления (0.5x, 0.25x), зеркала, счёта 1-2-3-4 и отсчета 3-2-1!</span>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-2xl bg-[#F4EFE6] text-black border-3 border-black rounded-xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_#FFE600] flex flex-col md:flex-row items-center gap-4">
                <div className="w-full md:w-56 h-44 rounded-lg border-3 border-black overflow-hidden bg-[#151515] shrink-0 relative">
                  <div className="w-full h-full pointer-events-none flex items-center justify-center [&>div]:min-h-0 [&>div]:border-0 [&>div]:rounded-none">
                    <BboySvgSimulator
                      move={move}
                      isPlaying={true}
                      speed={0.5}
                      isMirrored={isMirrored}
                      bpm={baseBpm}
                      phaseDurationMs={phaseDurationMs}
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="flex items-center gap-3 mb-2.5">
                    <NikitaAvatar size="md" showGradeBadge={true} />
                    <div>
                      <span className="inline-block bg-[#00E5FF] border-2 border-black px-2 py-0.5 rounded text-[10px] font-heading font-black uppercase shadow-[2px_2px_0px_0px_#000]">
                        📹 ЭФИР ШКОЛЫ БРЕЙКА
                      </span>
                      <h3 className="font-heading font-black text-base sm:text-lg text-black uppercase mt-1 leading-tight">
                        {move.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-zinc-800 mb-3.5 leading-snug bg-white border-2 border-black p-2.5 rounded-lg shadow-[2px_2px_0px_0px_#000]">
                    «Видеоурок от Никиты готовится к эфиру! А пока включай 2D-тренажер и оттачивай шаги под бит!»
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => setActiveTab('simulator')}
                      className="flex-1 px-3.5 py-2 bg-[#FFE600] hover:bg-yellow-300 text-black font-heading font-black text-xs rounded-lg border-2 border-black cursor-pointer neo-btn flex items-center justify-center gap-1.5"
                    >
                      <span>🕺 Включить 2D-тренажер</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCountdownAndStart}
                      disabled={isCountingDown}
                      className="flex-1 px-3.5 py-2 bg-[#00E676] hover:bg-emerald-400 disabled:opacity-50 text-black font-heading font-black text-xs rounded-lg border-2 border-black cursor-pointer neo-btn flex items-center justify-center gap-1.5"
                    >
                      <span>⏱️ 3-2-1 БРЕЙК!</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'steps' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6">
              <BboySvgSimulator
                move={move}
                currentPhaseIndex={currentPhaseIndex}
                isPlaying={false}
                speed={speed}
                isMirrored={isMirrored}
              />
            </div>
            <div className="md:col-span-6">
              <StepByStepViewer
                move={move}
                currentPhaseIndex={currentPhaseIndex}
                onSelectPhase={(idx) => setCurrentPhaseIndex(idx)}
              />
            </div>
          </div>
        )}
      </div>

      {showFullPlaybackControls && (
        <div className="bg-[#ffffff] border-3 border-black p-2.5 sm:p-3 rounded-lg shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-2">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            <button
              onClick={handleTogglePlay}
              className={`px-3 sm:px-4 py-2 rounded font-heading font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 neo-btn cursor-pointer ${
                isPlaying
                  ? 'bg-[#FF4D00] text-white hover:bg-red-600'
                  : 'bg-[#00E676] text-black hover:bg-emerald-400'
              }`}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
              <span>{isPlaying ? 'ПАУЗА' : 'СТАРТ'}</span>
            </button>

            <button
              onClick={handleCountdownAndStart}
              disabled={isCountingDown}
              className="px-3 py-2 bg-[#FFE600] hover:bg-yellow-300 disabled:opacity-50 text-black rounded font-heading font-extrabold text-xs flex items-center justify-center gap-1 neo-btn cursor-pointer"
              title="Отсчет 3, 2, 1 и старт танца под бит"
            >
              <span>{isCountingDown ? '⏱️ СЧИТАЕМ...' : '⏱️ 3-2-1 БРЕЙК!'}</span>
            </button>

            <button
              onClick={handleToggleVoiceCount}
              className={`col-span-2 sm:col-span-1 px-3 py-2 rounded font-heading font-extrabold text-xs flex items-center justify-center gap-1.5 border-2 border-black cursor-pointer transition-all ${
                isVoiceCountEnabled
                  ? 'bg-[#00E676] text-black shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-[#F4EFE6] text-zinc-800 hover:bg-yellow-100'
              }`}
              title="Голосовой счёт «Раз! Два! Три! Четыре!» и клик метронома на каждый шаг (чтобы танцевать на полу на слух)"
            >
              <span>{isVoiceCountEnabled ? '🔊 Счёт 1-2-3-4: ВКЛ' : '🔊 Счёт 1-2-3-4'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center gap-1 bg-[#F4EFE6] border-2 border-black p-1 rounded flex-1 sm:flex-initial justify-between">
              <span className="text-[10px] font-mono font-bold text-zinc-600 px-1">Темп:</span>
              <div className="flex items-center gap-0.5">
                {([0.25, 0.5, 1.0] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`px-2 py-0.5 rounded text-[11px] sm:text-xs font-bold font-mono transition-all cursor-pointer ${
                      speed === s
                        ? 'bg-black text-[#FFE600] font-black'
                        : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleToggleMirror}
              className={`px-2.5 sm:px-3 py-1.5 rounded font-heading font-extrabold text-xs flex items-center justify-center gap-1.5 border-2 border-black cursor-pointer transition-all shrink-0 ${
                isMirrored
                  ? 'bg-[#00E5FF] text-black shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
              }`}
              title="Отразить зеркально, как будто смотришь в зеркало в спортзале"
            >
              <RotateCw size={14} className={isMirrored ? 'rotate-180 transition-transform' : ''} />
              <span>{isMirrored ? 'ЗЕРКАЛО: ВКЛ' : 'Зеркало'}</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'steps' && (
        <div className="bg-[#ffffff] border-3 border-black p-2.5 sm:p-3 rounded-lg shadow-[4px_4px_0px_0px_#000] flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleCountdownAndStart}
            disabled={isCountingDown}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-[#FFE600] hover:bg-yellow-300 disabled:opacity-50 text-black rounded font-heading font-extrabold text-xs flex items-center justify-center gap-1.5 neo-btn cursor-pointer"
            title="Перейти к 2D-тренажеру и запустить отсчет 3, 2, 1 под бит"
          >
            <span>⏱️ 3-2-1 БРЕЙК! (Запустить в 2D-тренажере)</span>
          </button>

          <button
            onClick={handleToggleMirror}
            className={`px-3 py-2 rounded font-heading font-extrabold text-xs flex items-center justify-center gap-1.5 border-2 border-black cursor-pointer transition-all shrink-0 ${
              isMirrored
                ? 'bg-[#00E5FF] text-black shadow-[2px_2px_0px_0px_#000]'
                : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
            }`}
            title="Отразить зеркально позу текущего шага"
          >
            <RotateCw size={14} className={isMirrored ? 'rotate-180 transition-transform' : ''} />
            <span>{isMirrored ? 'ЗЕРКАЛО: ВКЛ' : 'Зеркало'}</span>
          </button>
        </div>
      )}

      {(isVoiceCountEnabled || showSilentModeHint) && (
        <div className="bg-[#1a1a1a] text-zinc-200 border-2 border-black px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-between gap-2">
          <span>🔇 Если звука не слышно — проверь рычажок беззвучного режима на телефоне</span>
          <button
            type="button"
            onClick={() => setShowSilentModeHint(false)}
            className="text-[#FFE600] hover:underline text-[10px] font-black shrink-0 cursor-pointer"
          >
            ОК
          </button>
        </div>
      )}
    </div>
  );
};
