import React, { useState, useEffect } from 'react';
import { soundEngine, BEAT_GROOVES } from '../../services/soundEngine';
import { Play, Square, Volume2, ChevronDown, ChevronUp } from 'lucide-react';

export const Boombox: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(soundEngine.getIsPlaying());
  const [currentGroove, setCurrentGroove] = useState(soundEngine.getCurrentGroove());
  const [bpm, setBpm] = useState(soundEngine.getBpm());
  const [step, setStep] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  // По умолчанию свернут, чтобы на первом экране сразу были видны движения!
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const unsubscribe = soundEngine.subscribe((newStep, currentBpm, playing) => {
      setStep(newStep);
      setBpm(currentBpm);
      setIsPlaying(playing);
      setCurrentGroove(soundEngine.getCurrentGroove());
    });
    return unsubscribe;
  }, []);

  const handleTogglePlay = () => {
    const newState = soundEngine.togglePlay();
    setIsPlaying(newState);
  };

  const handleSelectGroove = (grooveId: string) => {
    soundEngine.selectGroove(grooveId);
    setCurrentGroove(soundEngine.getCurrentGroove());
    setBpm(soundEngine.getBpm());
  };

  const changeBpm = (delta: number) => {
    const nextBpm = Math.max(60, Math.min(140, bpm + delta));
    setBpm(nextBpm);
    soundEngine.setBpm(nextBpm);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolumeState(val);
    soundEngine.setVolume(val);
  };

  const vuHeights = [
    step % 4 === 0 ? 90 : step % 2 === 0 ? 55 : 30,
    step % 4 === 1 ? 80 : 35,
    step % 4 === 2 ? 100 : 45,
    step % 4 === 3 ? 70 : 25,
    step === 0 || step === 8 ? 95 : 40,
    step % 2 === 0 ? 85 : 30,
    step % 4 === 0 ? 75 : 20,
    step === 12 ? 90 : 35
  ];

  return (
    <div className="w-full bg-[#1e1e1e] border-3 border-black shadow-[4px_4px_0px_0px_#000] text-white p-2.5 sm:p-3.5 rounded-lg select-none relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Header bar of Boombox (mobile-responsive wrap) */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
          !isCollapsed ? 'border-b-2 border-black/40 pb-2.5 mb-3' : ''
        }`}
      >
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full border border-black shrink-0 ${
                isPlaying ? 'bg-[#00E676] animate-ping' : 'bg-[#FF4D00]'
              }`}
            />
            <span className="font-display text-xs sm:text-sm tracking-wider text-[#FFE600]">
              БИТ-СТАНЦИЯ НИКИТЫ
            </span>
          </div>

          {isCollapsed && (
            <span className="text-[11px] sm:text-xs font-bold text-zinc-300 bg-black/50 px-2 py-0.5 rounded border border-zinc-700 truncate">
              {currentGroove.title} ({bpm} уд/мин)
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {isCollapsed && (
            <button
              onClick={handleTogglePlay}
              className={`px-3 py-1.5 sm:py-1 font-heading text-xs font-black rounded border-2 border-black flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-0.5 ${
                isPlaying ? 'bg-[#FF4D00] text-white' : 'bg-[#00E676] text-black'
              }`}
            >
              {isPlaying ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
              <span>{isPlaying ? 'Стоп бит' : 'Включить бит'}</span>
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`text-xs bg-black/70 hover:bg-black text-[#FFE600] px-3 py-1.5 sm:py-1 rounded border border-zinc-700 flex items-center justify-center gap-1 cursor-pointer font-bold ${
              !isCollapsed ? 'col-span-2 sm:col-span-1 ml-auto' : ''
            }`}
          >
            {isCollapsed ? (
              <>
                <ChevronDown size={14} /> <span>Выбрать бит (4)</span>
              </>
            ) : (
              <>
                <ChevronUp size={14} /> <span>Свернуть пульт</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Boombox Body */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Cassette Deck with spinning wheels */}
          <div className="lg:col-span-5 bg-[#111] border-2 border-black p-2.5 sm:p-3 rounded flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300 mb-1 border-b border-zinc-800 pb-1">
              <span>КАССЕТА С БИТАМИ</span>
              <span
                className={`font-extrabold px-2 py-0.5 rounded ${
                  isPlaying ? 'bg-[#00E676] text-black animate-pulse' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {isPlaying ? 'КАЧАЕТ БИТ ●' : 'НА ПАУЗЕ'}
              </span>
            </div>

            {/* Cassette window */}
            <div className="relative bg-[#222] border-2 border-zinc-700 h-20 rounded-md flex items-center justify-around px-2.5 sm:px-4 my-1 overflow-hidden">
              <div className="flex items-center justify-between w-full relative z-10 gap-2">
                {/* Left Spool */}
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full border-4 border-dashed border-[#FFE600] bg-black flex items-center justify-center transition-transform"
                  style={{
                    transform: isPlaying ? `rotate(${step * 45}deg)` : 'rotate(0deg)',
                    transition: 'transform 0.12s linear'
                  }}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-[#FFE600] border-2 border-black" />
                </div>

                {/* Cassette Center Label */}
                <div className="text-center min-w-0 flex-1">
                  <div className="text-[11px] uppercase font-extrabold text-[#FFE600] bg-black/70 px-2 py-0.5 rounded border border-zinc-700 truncate">
                    {currentGroove.title}
                  </div>
                  <div className="text-[11px] font-bold text-zinc-300 mt-1">
                    Темп: {bpm} уд/мин
                  </div>
                </div>

                {/* Right Spool */}
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full border-4 border-dashed border-[#FF4D00] bg-black flex items-center justify-center transition-transform"
                  style={{
                    transform: isPlaying ? `rotate(${step * 45}deg)` : 'rotate(0deg)',
                    transition: 'transform 0.12s linear'
                  }}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-[#FF4D00] border-2 border-black" />
                </div>
              </div>
            </div>

            {/* LED Peak VU-Meter */}
            <div className="flex items-end justify-between h-7 bg-black p-1 rounded border border-zinc-800 gap-1 mt-1">
              {vuHeights.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-xs transition-all duration-75"
                  style={{
                    height: isPlaying ? `${h}%` : '15%',
                    backgroundColor: h > 85 ? '#FF4D00' : h > 60 ? '#FFE600' : '#00E676'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Center: Transport Controls & Groove Selection */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between gap-2">
              <span>Выбери один из 4 битов:</span>
              <span className="text-[#00E5FF] font-bold">{currentGroove.tag}</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {BEAT_GROOVES.map((g) => {
                const isActive = g.id === currentGroove.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => handleSelectGroove(g.id)}
                    className={`text-left p-2 rounded border-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#FFE600] text-black border-black font-extrabold shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-[#2a2a2a] text-zinc-300 border-zinc-700 hover:border-zinc-400 text-xs'
                    }`}
                  >
                    <div className="text-[11px] font-bold leading-tight">{g.title}</div>
                    <div className="text-[10px] opacity-85 font-bold mt-0.5">{g.bpm} BPM</div>
                  </button>
                );
              })}
            </div>

            {/* Speed / BPM Adjust */}
            <div className="flex items-center justify-between bg-black/50 p-1.5 rounded border border-zinc-800 text-xs">
              <span className="font-bold text-zinc-300">Быстрее / Медленнее:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => changeBpm(-4)}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 rounded font-bold text-white cursor-pointer active:scale-95"
                >
                  -4
                </button>
                <span className="font-display text-[#FFE600] px-1.5">{bpm}</span>
                <button
                  onClick={() => changeBpm(4)}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 rounded font-bold text-white cursor-pointer active:scale-95"
                >
                  +4
                </button>
              </div>
            </div>
          </div>

          {/* Right: Master Play/Stop & Volume */}
          <div className="lg:col-span-3 flex flex-col gap-2.5">
            {/* Big Play/Stop Button */}
            <button
              onClick={handleTogglePlay}
              className={`w-full py-3 px-4 rounded font-display text-sm md:text-base flex items-center justify-center gap-2 neo-btn cursor-pointer ${
                isPlaying
                  ? 'bg-[#FF4D00] text-white hover:bg-red-600'
                  : 'bg-[#00E676] text-black hover:bg-emerald-400'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square fill="currentColor" size={18} /> ОСТАНОВИТЬ БИТ
                </>
              ) : (
                <>
                  <Play fill="currentColor" size={18} /> ВКЛЮЧИТЬ БИТ
                </>
              )}
            </button>

            {/* Volume slider */}
            <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded border border-zinc-800">
              <Volume2 size={16} className="text-[#FFE600] shrink-0" />
              <span className="text-[11px] font-bold text-zinc-300 shrink-0">Громкость:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-[#FFE600] cursor-pointer h-1.5 bg-zinc-700 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
