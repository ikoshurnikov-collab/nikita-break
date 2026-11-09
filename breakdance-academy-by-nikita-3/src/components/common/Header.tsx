import React, { useState, useEffect, useRef } from 'react';
import { ViewTab, DancerProfile } from '../../types';
import { NikitaAvatar } from './NikitaAvatar';
import {
  Flame,
  BookOpen,
  Layers,
  Sparkles,
  Unlock,
  Lock,
  UserPlus,
  Trash2,
  Check,
  X,
  ChevronDown,
  Edit3,
  Zap,
  QrCode,
  Copy,
  Play,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { speechService } from '../../services/speechService';
import { soundEngine } from '../../services/soundEngine';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';

interface HeaderProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  demoMode: boolean;
  onToggleDemoMode: () => void;
  masteredCount: number;
  totalDancersCount: number;
  profiles: DancerProfile[];
  activeProfile: DancerProfile;
  onSwitchProfile: (id: string) => void;
  onCreateProfile: (name: string) => void;
  onRenameActiveProfile: (newName: string) => void;
  onDeleteProfile: (id: string) => void;
}

const WARMUP_ITEMS = [
  'Шнурки на кроссовках крепко завязаны',
  'Вокруг меня свободно 2 шага (не задену парты и друзей)',
  'Размял кисти рук в замочке (10 вращений — бережем запястья для упора на полу!)',
  'Размял колени и плечи (10 приседаний и вращений плечами)'
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  demoMode,
  onToggleDemoMode,
  masteredCount,
  totalDancersCount,
  profiles,
  activeProfile,
  onSwitchProfile,
  onCreateProfile,
  onRenameActiveProfile,
  onDeleteProfile
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWarmupModalOpen, setIsWarmupModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const [renameInput, setRenameInput] = useState(
    activeProfile.name === 'Гость (впиши имя)' ? '' : activeProfile.name
  );
  const [newDancerName, setNewDancerName] = useState('');

  // Warmup state (4 safety checkboxes + 30s countdown timer)
  const [warmupChecked, setWarmupChecked] = useState<boolean[]>([false, false, false, false]);
  const [warmupSecondsLeft, setWarmupSecondsLeft] = useState<number>(30);
  const [isWarmupTimerRunning, setIsWarmupTimerRunning] = useState<boolean>(false);
  const lastWarmupCelebrationRef = useRef<number>(0);

  // QR code state
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  useEffect(() => {
    setRenameInput(activeProfile.name === 'Гость (впиши имя)' ? '' : activeProfile.name);
  }, [activeProfile.id, activeProfile.name]);

  // 30-second warmup countdown timer
  useEffect(() => {
    if (!isWarmupTimerRunning || !isWarmupModalOpen) return;

    if (warmupSecondsLeft <= 0) {
      setIsWarmupTimerRunning(false);
      soundEngine.playSuccessFanfare();
      return;
    }

    const timerId = window.setTimeout(() => {
      setWarmupSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [isWarmupTimerRunning, warmupSecondsLeft, isWarmupModalOpen]);

  const OFFICIAL_SITE_URL = 'https://break-dance-nikita-linteh.ru';
  const OFFICIAL_DOMAIN_LABEL = 'break-dance-nikita-linteh.ru';

  // Generate QR code when QR modal opens
  useEffect(() => {
    if (!isQrModalOpen || typeof window === 'undefined') return;
    QRCode.toDataURL(OFFICIAL_SITE_URL, {
      width: 280,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(''));
  }, [isQrModalOpen]);

  const handleTabClick = (tab: ViewTab) => {
    onTabChange(tab);
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.unlock();
    speechService.speakNikita(
      'Привет! Я Никита из второго класса! Добро пожаловать в мой тренажер по брейк-дансу! Выбирай движение и включай бит!',
      'greeting'
    );
  };

  const handleOpenWarmupModal = () => {
    soundEngine.unlock();
    setIsWarmupModalOpen(true);
    speechService.speakNikita(
      'Перед выходом в круг обязательно разомни кисти рук, колени и плечи, проверь шнурки и свободное место вокруг!',
      'warmup'
    );
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = renameInput.replace(/\s+/g, ' ').trim().slice(0, 22);
    if (!trimmed) return;
    onRenameActiveProfile(trimmed);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDancerName.replace(/\s+/g, ' ').trim().slice(0, 22);
    if (!trimmed) return;
    onCreateProfile(trimmed);
    setNewDancerName('');
  };

  const handleToggleWarmupCheck = (index: number) => {
    setWarmupChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      const allDone = next.every(Boolean);
      const now = Date.now();
      if (allDone && !prev.every(Boolean) && now - lastWarmupCelebrationRef.current > 1200) {
        lastWarmupCelebrationRef.current = now;
        soundEngine.playSuccessFanfare();
        try {
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore canvas error
        }
        speechService.speakNikita(
          'Молодец! Суставы разогреты, шнурки завязаны, вокруг свободно! Теперь ты готов танцевать брейк безопасно!',
          'warmup'
        );
      }
      return next;
    });
  };

  const handleCopyShareUrl = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(OFFICIAL_SITE_URL);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  const allWarmupDone = warmupChecked.every(Boolean);

  return (
    <>
      <header className="w-full bg-[#FFE600] border-b-4 border-black select-none sticky top-0 z-40 shadow-[0_4px_0_0_#000]">
        {/* Main Brand & Controls Container */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          {/* Top Row: Large Prominent Photo Frame + Application Title */}
          <div
            onClick={() => handleTabClick('catalog')}
            className="flex items-center gap-3 sm:gap-4 cursor-pointer group"
          >
            <div
              onClick={handleAvatarClick}
              title="Нажми, чтобы послушать приветствие от Никиты!"
              className="transition-transform active:scale-95 hover:scale-105"
            >
              <NikitaAvatar size="header" showGradeBadge={true} />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="font-display text-lg sm:text-3xl tracking-tight text-black uppercase leading-tight break-words">
                БРЕЙК ОТ НИКИТЫ
              </h1>
              <p className="text-xs sm:text-sm font-bold text-black/85 leading-snug mt-0.5">
                Тренажер по брейк-дансу для школьной перемены
              </p>
            </div>
          </div>

          {/* Controls Row: Dancer Selector + Live Dancers Counter + Warmup + QR + Progress Counter + Open All */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-1.5 sm:gap-2 pt-1.5 lg:pt-0 border-t-2 border-black/15 lg:border-t-0 shrink-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
              {/* 👟 Кто тренируется: [Имя активного танцора] ▾ */}
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="bg-[#00E5FF] hover:bg-cyan-300 text-black border-2 sm:border-3 border-black px-2 sm:px-3 py-1 rounded-md shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] flex items-center gap-1.5 h-9 sm:h-10 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 min-w-0 max-w-full"
                title="Выбрать ученика или добавить друга"
              >
                <span className="text-sm shrink-0">👟</span>
                <span className="text-[11px] sm:text-xs font-heading font-extrabold truncate max-w-[125px] xs:max-w-[165px] sm:max-w-[200px]">
                  <span className="hidden xs:inline">Кто тренируется: </span>
                  <span className="underline">{activeProfile.name}</span>
                </span>
                <ChevronDown size={14} className="shrink-0" />
              </button>

              {/* 🟢 Живой счётчик участников в круге */}
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="bg-black text-white hover:bg-zinc-900 border-2 sm:border-3 border-black px-2 sm:px-2.5 py-1 rounded-md shadow-[2px_2px_0px_0px_#00E676] flex items-center gap-1.5 h-9 sm:h-10 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
                title="Общее количество ребят, занимающихся брейком в приложении Никиты"
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-80" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E676]" />
                </span>
                <span className="text-[10px] sm:text-xs font-heading font-extrabold whitespace-nowrap">
                  🟢 В круге уже: <span className="text-[#FFE600] font-black">{totalDancersCount}</span> ребят
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 ml-auto sm:ml-0">
              {/* ⚡ Разминка (Техника безопасности) */}
              <button
                onClick={handleOpenWarmupModal}
                className={`h-9 sm:h-10 px-2 sm:px-2.5 rounded-md border-2 sm:border-3 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] flex items-center justify-center gap-1 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 text-[11px] sm:text-xs font-heading font-extrabold ${
                  allWarmupDone
                    ? 'bg-[#00E676] text-black'
                    : 'bg-white hover:bg-[#00E676] text-black'
                }`}
                title="Разминка суставов и техника безопасности (30 сек)"
              >
                <Zap size={14} className="text-[#FF4D00] shrink-0" />
                <span>Разминка</span>
              </button>

              {/* 📱 QR-код */}
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="h-9 sm:h-10 px-2 sm:px-2.5 bg-white hover:bg-[#00E5FF] text-black rounded-md border-2 sm:border-3 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] flex items-center justify-center gap-1 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 text-[11px] sm:text-xs font-heading font-extrabold"
                title="Показать QR-код приложения для друзей"
              >
                <QrCode size={14} className="shrink-0" />
                <span className="hidden xs:inline">QR-код</span>
              </button>

              {/* Застолбил: X / 10 */}
              <div className="bg-white border-2 sm:border-3 border-black px-2 sm:px-2.5 py-1 rounded-md shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] flex items-center gap-1.5 h-9 sm:h-10">
                <Flame className="text-[#FF4D00] shrink-0" size={16} />
                <div className="flex items-center gap-1 sm:block text-left">
                  <div className="text-[10px] font-extrabold text-zinc-600 uppercase leading-none hidden xs:block">
                    Застолбил:
                  </div>
                  <div className="font-display text-xs sm:text-sm leading-tight text-black">
                    {demoMode ? '10 / 10' : `${masteredCount} / 10`}
                  </div>
                </div>
              </div>

              {/* Compact Button: Open All Moves */}
              <button
                onClick={onToggleDemoMode}
                title={
                  demoMode
                    ? 'Все уровни открыты (нажми, чтобы выключить)'
                    : 'Открыть все уровни и связки'
                }
                aria-label="Открыть все уровни"
                className={`h-9 sm:h-10 px-2 sm:px-0 sm:w-10 rounded-md border-2 sm:border-3 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] flex items-center justify-center gap-1 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 text-[11px] font-heading font-black ${
                  demoMode
                    ? 'bg-[#FF4D00] text-white'
                    : 'bg-white text-black hover:bg-[#00E676]'
                }`}
              >
                {demoMode ? <Unlock size={15} /> : <Lock size={15} />}
                <span className="sm:hidden">{demoMode ? 'Все' : 'Открыть'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop & Tablet Navigation Tabs Bar (Hidden on mobile where Bottom Tab Bar is used) */}
        <nav className="hidden sm:block bg-white border-t-3 border-black">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-2.5 py-1.5">
            <button
              onClick={() => handleTabClick('catalog')}
              className={`px-3.5 py-1.5 rounded font-heading font-extrabold text-sm border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 leading-tight ${
                activeTab === 'catalog'
                  ? 'bg-black text-[#FFE600] border-black shadow-[3px_3px_0px_0px_#FFE600]'
                  : 'bg-[#F4EFE6] text-black border-black/40 hover:border-black'
              }`}
            >
              <BookOpen size={15} className="shrink-0" />
              <span>10 ДВИЖЕНИЙ</span>
            </button>

            <button
              onClick={() => handleTabClick('combos')}
              className={`px-3.5 py-1.5 rounded font-heading font-extrabold text-sm border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 leading-tight ${
                activeTab === 'combos'
                  ? 'bg-black text-[#00E5FF] border-black shadow-[3px_3px_0px_0px_#00E5FF]'
                  : 'bg-[#F4EFE6] text-black border-black/40 hover:border-black'
              }`}
            >
              <Layers size={15} className="shrink-0" />
              <span>СВЯЗКИ И БАТТЛ</span>
            </button>

            <button
              onClick={() => handleTabClick('achievements')}
              className={`px-3.5 py-1.5 rounded font-heading font-extrabold text-sm border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 leading-tight ${
                activeTab === 'achievements'
                  ? 'bg-[#FF4D00] text-white border-black shadow-[3px_3px_0px_0px_#000]'
                  : 'bg-[#F4EFE6] text-black border-black/40 hover:border-black'
              }`}
            >
              <Sparkles size={15} className="shrink-0" />
              <span>ДИПЛОМ И НАГРАДЫ</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Fixed Bottom Tab Bar (Thumb-Reachable Navigation on Phones) */}
      <nav
        aria-label="Мобильная навигация"
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t-4 border-black px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] shadow-[0_-4px_0_0_#000] select-none"
      >
        <div className="grid grid-cols-3 gap-1.5 max-w-md mx-auto">
          <button
            onClick={() => handleTabClick('catalog')}
            className={`py-2 px-1 rounded-lg font-heading font-black text-[11px] border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 leading-tight ${
              activeTab === 'catalog'
                ? 'bg-black text-[#FFE600] border-black shadow-[2px_2px_0px_0px_#FFE600]'
                : 'bg-[#F4EFE6] text-black border-black/40'
            }`}
          >
            <BookOpen size={15} className="shrink-0" />
            <span>10 ДВИЖЕНИЙ</span>
          </button>

          <button
            onClick={() => handleTabClick('combos')}
            className={`py-2 px-1 rounded-lg font-heading font-black text-[11px] border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 leading-tight ${
              activeTab === 'combos'
                ? 'bg-black text-[#00E5FF] border-black shadow-[2px_2px_0px_0px_#00E5FF]'
                : 'bg-[#F4EFE6] text-black border-black/40'
            }`}
          >
            <Layers size={15} className="shrink-0" />
            <span>СВЯЗКИ</span>
          </button>

          <button
            onClick={() => handleTabClick('achievements')}
            className={`py-2 px-1 rounded-lg font-heading font-black text-[11px] border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 leading-tight ${
              activeTab === 'achievements'
                ? 'bg-[#FF4D00] text-white border-black shadow-[2px_2px_0px_0px_#000]'
                : 'bg-[#F4EFE6] text-black border-black/40'
            }`}
          >
            <Sparkles size={15} className="shrink-0" />
            <span>ДИПЛОМ</span>
          </button>
        </div>
      </nav>

      {/* Modal 1: КТО СЕЙЧАС ТРЕНИРУЕТСЯ? */}
      {isProfileModalOpen && (
        <div
          onClick={() => setIsProfileModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#F4EFE6] border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] p-4 sm:p-5 text-black max-h-[92dvh] overflow-y-auto overflow-x-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-2 border-b-3 border-black pb-3 mb-4">
              <div className="min-w-0 flex-1">
                <div className="inline-block bg-[#FFE600] border-2 border-black px-2 py-0.5 rounded text-[10px] font-black uppercase mb-1">
                  ЛИЧНЫЙ ПРОГРЕСС НА ПЕРЕМЕНЕ
                </div>
                <h2 className="font-display text-lg sm:text-2xl uppercase leading-tight break-words">
                  👟 КТО СЕЙЧАС ТРЕНИРУЕТСЯ?
                </h2>
              </div>

              <button
                onClick={() => setIsProfileModalOpen(false)}
                aria-label="Закрыть"
                className="p-1.5 bg-black text-white hover:bg-zinc-800 rounded-lg border-2 border-black cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Live Statistics Banner inside Modal */}
            <div className="bg-black text-white border-3 border-black p-3 sm:p-3.5 rounded-xl shadow-[4px_4px_0px_0px_#00E676] mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-lg flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-zinc-200 leading-tight">
                  🌍 Всего занимаются в приложении:
                </span>
                <span className="font-display text-sm sm:text-base text-[#FFE600] whitespace-nowrap">
                  {totalDancersCount} чел.
                </span>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-lg flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-zinc-200 leading-tight">
                  📱 Друзей на этом телефоне:
                </span>
                <span className="font-display text-sm sm:text-base text-[#00E5FF] whitespace-nowrap">
                  {profiles.length} чел.
                </span>
              </div>
            </div>

            {/* 1. Quick Rename Active Student */}
            <form
              onSubmit={handleRenameSubmit}
              className="bg-white border-3 border-black p-3 sm:p-3.5 rounded-xl shadow-[3px_3px_0px_0px_#000] mb-4"
            >
              <label className="text-[11px] font-extrabold uppercase text-zinc-700 flex items-center gap-1.5 mb-2">
                <Edit3 size={14} className="text-[#FF4D00] shrink-0" />
                <span>Имя текущего танцора (попадет в Диплом!):</span>
              </label>
              <div className="flex flex-col gap-2.5">
                <input
                  type="text"
                  maxLength={22}
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value.slice(0, 22))}
                  placeholder="Например: Артём, 2А"
                  className="w-full min-w-0 px-3 py-2.5 bg-[#F4EFE6] border-2 border-black rounded-lg font-heading font-extrabold text-sm focus:outline-none focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!renameInput.trim()}
                  className="w-full px-3.5 py-2.5 bg-[#FFE600] hover:bg-yellow-300 disabled:opacity-50 text-black font-heading font-black text-xs sm:text-sm rounded-lg border-2 border-black cursor-pointer neo-btn flex items-center justify-center gap-1.5"
                >
                  <Check size={15} className="shrink-0" />
                  <span>Сохранить имя</span>
                </button>
              </div>
            </form>

            {/* 2. List of All Dancers on This Phone */}
            <div className="mb-4">
              <div className="text-xs font-extrabold uppercase text-zinc-700 mb-2">
                Танцоры на этом телефоне (переключение в 1 клик):
              </div>

              <div className="flex flex-col gap-2">
                {profiles.map((prof) => {
                  const isActive = prof.id === activeProfile.id;
                  const profMastered = prof.progress.demoMode
                    ? 10
                    : prof.progress.masteredMoveIds.length;

                  return (
                    <div
                      key={prof.id}
                      onClick={() => {
                        if (!isActive) {
                          onSwitchProfile(prof.id);
                          setIsProfileModalOpen(false);
                        }
                      }}
                      className={`p-3 rounded-xl border-3 border-black flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#00E5FF] shadow-[4px_4px_0px_0px_#000]'
                          : 'bg-white hover:bg-[#FFE600]/40 shadow-[2px_2px_0px_0px_#000]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={`w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center font-display text-xs shrink-0 ${
                            isActive ? 'bg-black text-[#FFE600]' : 'bg-[#F4EFE6] text-black'
                          }`}
                        >
                          {isActive ? '✓' : '👟'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-heading font-black text-sm text-black truncate">
                            {prof.name}
                          </div>
                          <div className="text-xs font-bold text-black/75">
                            Застолбил: <span className="font-black">{profMastered} / 10</span> • Связок:{' '}
                            {prof.progress.rehearsalsCompleted}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isActive ? (
                          <span className="px-2 py-1 bg-black text-[#00E5FF] rounded font-heading font-black text-[10px] uppercase">
                            Активен
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-[#00E676] text-black border-2 border-black rounded font-heading font-black text-[11px]">
                            Выбрать
                          </span>
                        )}

                        {profiles.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteProfile(prof.id);
                            }}
                            title="Удалить профиль"
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md border border-red-300 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Add Friend (+ Добавить друга (Новый танцор)) */}
            <form
              onSubmit={handleCreateSubmit}
              className="bg-white border-3 border-black p-3 sm:p-3.5 rounded-xl shadow-[3px_3px_0px_0px_#000]"
            >
              <label className="text-[11px] font-extrabold uppercase text-zinc-700 flex items-center gap-1.5 mb-2">
                <UserPlus size={14} className="text-[#00E676] shrink-0" />
                <span>Тренируетесь вдвоем на перемене? Добавь друга:</span>
              </label>
              <div className="flex flex-col gap-2.5">
                <input
                  type="text"
                  maxLength={22}
                  value={newDancerName}
                  onChange={(e) => setNewDancerName(e.target.value.slice(0, 22))}
                  placeholder="Имя друга (например: Максим, 2А)"
                  className="w-full min-w-0 px-3 py-2.5 bg-[#F4EFE6] border-2 border-black rounded-lg font-heading font-extrabold text-sm focus:outline-none focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!newDancerName.trim()}
                  className="w-full px-3.5 py-2.5 bg-[#00E676] hover:bg-emerald-400 disabled:opacity-50 text-black font-heading font-black text-xs sm:text-sm rounded-lg border-2 border-black cursor-pointer neo-btn flex items-center justify-center gap-1.5"
                >
                  <span>+ Добавить друга (Новый танцор)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: РАЗМИНКА И БЕЗОПАСНОСТЬ БИ-БОЯ (30 СЕК) */}
      {isWarmupModalOpen && (
        <div
          onClick={() => {
            setIsWarmupTimerRunning(false);
            setIsWarmupModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#F4EFE6] border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] p-4 sm:p-5 text-black max-h-[92dvh] overflow-y-auto overflow-x-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 border-b-3 border-black pb-3 mb-4">
              <div className="min-w-0 flex-1">
                <div className="inline-block bg-[#FF4D00] text-white border-2 border-black px-2 py-0.5 rounded text-[10px] font-black uppercase mb-1">
                  ТЕХНИКА БЕЗОПАСНОСТИ ОТ НИКИТЫ
                </div>
                <h2 className="font-display text-base sm:text-xl uppercase leading-tight break-words">
                  ⚡ РАЗМИНКА И БЕЗОПАСНОСТЬ БИ-БОЯ (30 СЕК)
                </h2>
              </div>

              <button
                onClick={() => {
                  setIsWarmupTimerRunning(false);
                  setIsWarmupModalOpen(false);
                }}
                aria-label="Закрыть"
                className="p-1.5 bg-black text-white hover:bg-zinc-800 rounded-lg border-2 border-black cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* 30-Second Timer Box */}
            <div className="bg-white border-3 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_0px_#000] mb-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <div className="text-[10px] font-extrabold uppercase text-zinc-600">
                    ТАЙМЕР РАЗМИНКИ СУСТАВОВ:
                  </div>
                  <div className="font-display text-2xl sm:text-3xl text-black">
                    {warmupSecondsLeft} СЕК
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundEngine.unlock();
                      if (warmupSecondsLeft === 0) {
                        setWarmupSecondsLeft(30);
                      }
                      setIsWarmupTimerRunning((prev) => !prev);
                    }}
                    className={`px-3.5 py-2 rounded-lg border-2 border-black font-heading font-black text-xs flex items-center gap-1.5 cursor-pointer neo-btn ${
                      isWarmupTimerRunning
                        ? 'bg-[#FF4D00] text-white'
                        : 'bg-[#FFE600] text-black hover:bg-yellow-300'
                    }`}
                  >
                    <Play size={14} fill="currentColor" />
                    <span>{isWarmupTimerRunning ? 'Стоп' : 'Старт 30 сек'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsWarmupTimerRunning(false);
                      setWarmupSecondsLeft(30);
                    }}
                    className="p-2 bg-[#F4EFE6] hover:bg-zinc-200 text-black rounded-lg border-2 border-black cursor-pointer"
                    title="Сбросить таймер"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>
              </div>

              <div className="w-full h-3 bg-zinc-200 border-2 border-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00E676] transition-all duration-300"
                  style={{ width: `${((30 - warmupSecondsLeft) / 30) * 100}%` }}
                />
              </div>
            </div>

            {/* 4 Safety & Warmup Checkboxes */}
            <div className="mb-4">
              <div className="text-xs font-extrabold uppercase text-zinc-700 mb-2">
                Отметь все 4 пункта перед выходом в круг:
              </div>

              <div className="flex flex-col gap-2">
                {WARMUP_ITEMS.map((itemText, idx) => {
                  const checked = warmupChecked[idx];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleWarmupCheck(idx)}
                      className={`w-full text-left p-3 rounded-xl border-3 border-black flex items-center gap-3 transition-all cursor-pointer ${
                        checked
                          ? 'bg-[#00E676] shadow-[3px_3px_0px_0px_#000]'
                          : 'bg-white hover:bg-[#FFE600]/30 shadow-[2px_2px_0px_0px_#000]'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg border-2 border-black flex items-center justify-center font-display text-sm shrink-0 ${
                          checked ? 'bg-black text-[#FFE600]' : 'bg-[#F4EFE6] text-transparent'
                        }`}
                      >
                        ✓
                      </div>
                      <span className="font-heading font-extrabold text-xs sm:text-sm text-black leading-snug">
                        {idx + 1}. {itemText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Completion Banner */}
            {allWarmupDone ? (
              <div className="bg-[#FFE600] border-3 border-black p-3 rounded-xl shadow-[3px_3px_0px_0px_#000] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={22} className="text-black shrink-0" />
                  <span className="font-heading font-black text-xs sm:text-sm text-black">
                    Супер! Разминка пройдена — можно танцевать!
                  </span>
                </div>
                <button
                  onClick={() => setIsWarmupModalOpen(false)}
                  className="px-3 py-1.5 bg-black text-[#FFE600] rounded-lg font-heading font-black text-xs cursor-pointer shrink-0"
                >
                  В круг!
                </button>
              </div>
            ) : (
              <div className="text-center text-xs font-bold text-zinc-600">
                Никита напоминает: настоящие би-бои всегда разминают кисти рук и колени!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 3: ПОДЕЛИСЬ С ДРУЗЬЯМИ (QR-КОД) */}
      {isQrModalOpen && (
        <div
          onClick={() => setIsQrModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#F4EFE6] border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] p-4 sm:p-5 text-black text-center max-h-[92dvh] overflow-y-auto overflow-x-hidden"
          >
            <div className="flex items-center justify-between gap-2 border-b-3 border-black pb-3 mb-4 text-left">
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-base sm:text-xl uppercase leading-tight break-words">
                  📱 ПОДЕЛИСЬ С ДРУЗЬЯМИ
                </h2>
              </div>

              <button
                onClick={() => setIsQrModalOpen(false)}
                aria-label="Закрыть"
                className="p-1.5 bg-black text-white hover:bg-zinc-800 rounded-lg border-2 border-black cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs sm:text-sm font-bold text-zinc-700 mb-3 leading-snug">
              Наведи камеру телефона на этот QR-код на перемене, чтобы сразу открыть тренажер Никиты:
            </p>

            {/* Crisp QR Code Box */}
            <div className="bg-white border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_#000] inline-flex items-center justify-center mx-auto mb-4">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR-код приложения Брейк от Никиты"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center font-heading font-bold text-xs text-zinc-500">
                  Генерация QR-кода...
                </div>
              )}
            </div>

            {/* Official Domain URL + Copy Button */}
            <div className="bg-white border-3 border-black p-3 rounded-xl shadow-[3px_3px_0px_0px_#000] text-center">
              <div className="text-[10px] font-extrabold uppercase text-zinc-500 mb-1">
                Официальный адрес сайта:
              </div>
              <a
                href={OFFICIAL_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block font-heading text-sm sm:text-base font-black text-black bg-[#FFE600]/40 hover:bg-[#FFE600] border-2 border-black px-3 py-2 rounded-lg mb-2.5 break-all transition-colors"
              >
                {OFFICIAL_DOMAIN_LABEL}
              </a>

              <button
                type="button"
                onClick={handleCopyShareUrl}
                className="w-full py-2.5 px-4 bg-[#FFE600] hover:bg-yellow-300 text-black font-heading font-black text-xs sm:text-sm rounded-lg border-2 border-black cursor-pointer neo-btn flex items-center justify-center gap-1.5"
              >
                {copiedUrl ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedUrl ? 'Ссылка скопирована! ✓' : 'Скопировать ссылку'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
