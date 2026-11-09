import React, { useState, useEffect } from 'react';
import { ViewTab, BreakMove, UserProgress, Combo, DancerProfile } from './types';
import { MOVES_CATALOG } from './data/movesCatalog';
import { Header } from './components/common/Header';
import { Boombox } from './components/common/Boombox';
import { NikitaAvatar } from './components/common/NikitaAvatar';
import { MovesGrid } from './components/moves/MovesGrid';
import { MoveDetailModal } from './components/moves/MoveDetailModal';
import { ComboSequencer } from './components/combos/ComboSequencer';
import { AchievementsDrawer } from './components/gamification/AchievementsDrawer';
import { progressStorage } from './services/progressStorage';
import { speechService } from './services/speechService';
import { soundEngine } from './services/soundEngine';
import { Volume2, Sparkles } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('catalog');
  const [progress, setProgress] = useState<UserProgress>(progressStorage.getProgress());
  const [profiles, setProfiles] = useState<DancerProfile[]>(progressStorage.getProfiles());
  const [activeProfile, setActiveProfile] = useState<DancerProfile>(
    progressStorage.getActiveProfile()
  );
  const [totalDancersCount, setTotalDancersCount] = useState<number>(
    progressStorage.getTotalDancersCount()
  );
  const [selectedMove, setSelectedMove] = useState<BreakMove | null>(null);

  // Nikita Live Speech Bubble State
  const [speechStatus, setSpeechStatus] = useState<{ isSpeaking: boolean; text: string }>({
    isSpeaking: false,
    text: ''
  });

  useEffect(() => {
    const unsubProgress = progressStorage.subscribe((p) => {
      setProgress({ ...p });
      setProfiles(progressStorage.getProfiles());
      setActiveProfile(progressStorage.getActiveProfile());
    });
    const unsubCounter = progressStorage.subscribeTotalDancers((total) => {
      setTotalDancersCount(total);
    });
    const unsubSpeech = speechService.subscribe((isSpeaking, text) => {
      setSpeechStatus({ isSpeaking, text });
    });
    return () => {
      unsubProgress();
      unsubCounter();
      unsubSpeech();
    };
  }, []);

  const handleToggleMaster = (moveId: string) => {
    const isNowMastered = progressStorage.toggleMasterMove(moveId);
    if (isNowMastered) {
      soundEngine.playSuccessFanfare();
      speechService.speakNikita(
        'Круто! Ты застолбил это движение! Так держать, настоящий би-бой!',
        'mastered'
      );
    }
  };

  const handleToggleDemoMode = () => {
    soundEngine.playSuccessFanfare();
    progressStorage.setDemoMode(!progress.demoMode);
  };

  const handleNextMove = () => {
    if (!selectedMove) return;
    const currentIndex = MOVES_CATALOG.findIndex((m) => m.id === selectedMove.id);
    const nextIndex = (currentIndex + 1) % MOVES_CATALOG.length;
    setSelectedMove(MOVES_CATALOG[nextIndex]);
  };

  const handlePrevMove = () => {
    if (!selectedMove) return;
    const currentIndex = MOVES_CATALOG.findIndex((m) => m.id === selectedMove.id);
    const prevIndex = (currentIndex - 1 + MOVES_CATALOG.length) % MOVES_CATALOG.length;
    setSelectedMove(MOVES_CATALOG[prevIndex]);
  };

  const handleSaveCustomCombo = (combo: Combo) => {
    progressStorage.saveCustomCombo(combo);
  };

  const handleDeleteCustomCombo = (comboId: string) => {
    progressStorage.deleteCustomCombo(comboId);
  };

  const handleRestoreDefaultCombos = () => {
    progressStorage.restoreDefaultCombos();
  };

  const handleResetProgress = () => {
    progressStorage.resetProgress();
  };

  const handleSwitchProfile = (id: string) => {
    const switched = progressStorage.switchProfile(id);
    if (switched) {
      speechService.speakNikita(`Привет, ${switched.name}! Погнали тренироваться!`, 'greeting');
    }
  };

  const handleCreateProfile = (name: string) => {
    const created = progressStorage.createProfile(name);
    soundEngine.playSuccessFanfare();
    speechService.speakNikita(`Привет, ${created.name}! Погнали тренироваться!`, 'greeting');
  };

  const handleRenameActiveProfile = (newName: string) => {
    const updated = progressStorage.renameActiveProfile(newName);
    speechService.speakNikita(`Привет, ${updated.name}! Погнали тренироваться!`, 'greeting');
  };

  const handleDeleteProfile = (id: string) => {
    progressStorage.deleteProfile(id);
  };

  return (
    <div className="w-full min-h-screen bg-[#121212] flex flex-col pb-24 sm:pb-16">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedMove(null);
          setActiveTab(tab);
        }}
        demoMode={progress.demoMode}
        onToggleDemoMode={handleToggleDemoMode}
        masteredCount={progress.masteredMoveIds.length}
        totalDancersCount={totalDancersCount}
        profiles={profiles}
        activeProfile={activeProfile}
        onSwitchProfile={handleSwitchProfile}
        onCreateProfile={handleCreateProfile}
        onRenameActiveProfile={handleRenameActiveProfile}
        onDeleteProfile={handleDeleteProfile}
      />

      {/* Main Body Container */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 flex flex-col gap-4 flex-1">
        {/* Boombox player tray (Collapsed by default so moves are visible immediately) */}
        <Boombox />

        {/* Demo Mode Notice */}
        {progress.demoMode && (
          <div className="bg-[#00E5FF] border-3 border-black p-2.5 rounded-lg shadow-[3px_3px_0px_0px_#000] flex items-center justify-between text-xs font-bold text-black">
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <span>ОТКРЫТЫ ВСЕ УРОВНИ: Все 10 движений, связки и награды разблокированы!</span>
            </div>
            <button
              onClick={handleToggleDemoMode}
              className="underline cursor-pointer font-black"
            >
              Выключить
            </button>
          </div>
        )}

        {/* Active Tab View */}
        {activeTab === 'catalog' && (
          <MovesGrid
            moves={MOVES_CATALOG}
            masteredIds={progress.masteredMoveIds}
            onSelectMove={(move) => setSelectedMove(move)}
            onToggleMaster={handleToggleMaster}
            demoMode={progress.demoMode}
          />
        )}

        {activeTab === 'combos' && (
          <ComboSequencer
            customCombos={progress.customCombos}
            masteredIds={progress.masteredMoveIds}
            demoMode={progress.demoMode}
            onSaveCustomCombo={handleSaveCustomCombo}
            onDeleteCustomCombo={handleDeleteCustomCombo}
            onRestoreDefaultCombos={handleRestoreDefaultCombos}
          />
        )}

        {activeTab === 'achievements' && (
          <AchievementsDrawer
            masteredCount={progress.masteredMoveIds.length}
            unlockedAchievementIds={progress.unlockedAchievementIds}
            totalMinutes={progress.totalMinutesDanced}
            rehearsalsDone={progress.rehearsalsCompleted}
            streakDays={progress.currentStreakDays}
            diplomaName={activeProfile.name}
            diplomaRole={progress.diplomaRole}
            onResetProgress={handleResetProgress}
            demoMode={progress.demoMode}
          />
        )}

        {/* Detail Modal for Selected Move */}
        {selectedMove && (
          <MoveDetailModal
            move={selectedMove}
            isMastered={progress.demoMode || progress.masteredMoveIds.includes(selectedMove.id)}
            onClose={() => setSelectedMove(null)}
            onToggleMaster={handleToggleMaster}
            onNextMove={handleNextMove}
            onPrevMove={handlePrevMove}
          />
        )}
      </main>

      {/* Floating Nikita Speech Bubble (clears mobile Bottom Tab Bar) */}
      {speechStatus.isSpeaking && speechStatus.text && (
        <div className="fixed bottom-20 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-xl bg-[#FFE600] border-4 border-black p-3.5 rounded-2xl shadow-[6px_6px_0px_0px_#000] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <NikitaAvatar size="sm" />
            <div>
              <div className="text-[10px] font-black uppercase text-black flex items-center gap-1">
                <Volume2 size={13} className="text-[#FF4D00]" />
                <span>Никита говорит:</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-black leading-snug italic">
                «{speechStatus.text}»
              </p>
            </div>
          </div>

          <button
            onClick={() => speechService.stop()}
            className="px-3 py-1.5 bg-black text-white hover:bg-zinc-800 rounded-lg text-xs font-heading font-bold cursor-pointer shrink-0 border-2 border-black"
          >
            Тихо
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
