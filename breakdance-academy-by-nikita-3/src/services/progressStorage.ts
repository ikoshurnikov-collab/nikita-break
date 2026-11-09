import { UserProgress, Combo, DancerProfile } from '../types';
import { PRESET_COMBOS } from '../data/combosCatalog';
import { statsCounter } from './statsCounter';
import confetti from 'canvas-confetti';

const LEGACY_STORAGE_KEY = 'nikita_breakdance_user_progress_v1';
const PROFILES_STORAGE_KEY = 'nikita_breakdance_dancer_profiles_v1';
const COMBOS_SEEDED_KEY = 'nikita_breakdance_combos_seeded_v2';

const DEFAULT_GUEST_NAME = 'Гость (впиши имя)';

function createCleanProgress(dancerName: string): UserProgress {
  return {
    masteredMoveIds: [],
    rewardedMoveIds: [],
    favoritedMoveIds: [],
    customCombos: [...PRESET_COMBOS],
    totalMinutesDanced: 0,
    totalCaloriesBurned: 0,
    rehearsalsCompleted: 0,
    currentStreakDays: 1,
    unlockedAchievementIds: [],
    diplomaRecipientName: dancerName,
    diplomaRole: 'Би-Бой',
    diplomaDate: new Date().toLocaleDateString('ru-RU'),
    demoMode: false
  };
}

const DEFAULT_INITIAL_PROGRESS: UserProgress = {
  masteredMoveIds: ['square-steps'], // First move unlocked by default for initial guest
  rewardedMoveIds: ['square-steps'],
  favoritedMoveIds: [],
  customCombos: [...PRESET_COMBOS],
  totalMinutesDanced: 12,
  totalCaloriesBurned: 85,
  rehearsalsCompleted: 3,
  currentStreakDays: 2,
  unlockedAchievementIds: ['first-step'],
  diplomaRecipientName: DEFAULT_GUEST_NAME,
  diplomaRole: 'Би-Бой',
  diplomaDate: new Date().toLocaleDateString('ru-RU'),
  demoMode: false
};

interface StoredProfilesState {
  activeProfileId: string;
  profiles: DancerProfile[];
}

const inMemoryStorage = new Map<string, string>();

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) {
        inMemoryStorage.set(key, val);
        return val;
      }
    }
  } catch {
    // Fallback to in-memory store (e.g. strict iOS Private Browsing)
  }
  return inMemoryStorage.get(key) ?? null;
}

function safeSetItem(key: string, value: string): void {
  inMemoryStorage.set(key, value);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Kept safely in inMemoryStorage
  }
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function sanitizeDancerName(name: string, fallback: string): string {
  const cleaned = name.replace(/\s+/g, ' ').trim().slice(0, 22);
  return cleaned || fallback;
}

let lastConfettiAt = 0;
function triggerSafeConfetti(options: confetti.Options) {
  const now = Date.now();
  if (now - lastConfettiAt < 700) return;
  lastConfettiAt = now;
  try {
    confetti(options);
  } catch {
    // Ignore canvas errors on low-end devices
  }
}

class ProgressStorageService {
  private profiles: DancerProfile[] = [];
  private activeProfileId: string = 'dancer-default';
  private progress: UserProgress = { ...DEFAULT_INITIAL_PROGRESS };
  private listeners: Set<(progress: UserProgress) => void> = new Set();

  constructor() {
    this.loadAll();
    statsCounter.initCounter(this.profiles.length);
  }

  public getTotalDancersCount(): number {
    return statsCounter.getTotalDancersCount();
  }

  public subscribeTotalDancers(cb: (total: number) => void) {
    return statsCounter.subscribe(cb);
  }

  private normalizeProgress(raw: Partial<UserProgress> | undefined, validName: string): UserProgress {
    const base = createCleanProgress(validName);
    const mastered = Array.isArray(raw?.masteredMoveIds) ? raw.masteredMoveIds : base.masteredMoveIds;
    const rewarded = Array.isArray(raw?.rewardedMoveIds)
      ? Array.from(new Set([...raw.rewardedMoveIds, ...mastered]))
      : [...mastered];

    return {
      ...base,
      ...raw,
      masteredMoveIds: mastered,
      rewardedMoveIds: rewarded,
      customCombos: Array.isArray(raw?.customCombos) ? raw.customCombos : [...PRESET_COMBOS]
    };
  }

  private loadAll(): void {
    if (typeof window === 'undefined') {
      this.profiles = [
        {
          id: 'dancer-default',
          name: DEFAULT_GUEST_NAME,
          progress: { ...DEFAULT_INITIAL_PROGRESS }
        }
      ];
      this.activeProfileId = 'dancer-default';
      this.progress = this.profiles[0].progress;
      return;
    }

    try {
      const storedProfilesRaw = safeGetItem(PROFILES_STORAGE_KEY);
      const parsed = safeJsonParse<Partial<StoredProfilesState>>(storedProfilesRaw);
      if (parsed && Array.isArray(parsed.profiles) && parsed.profiles.length > 0) {
        this.profiles = parsed.profiles.map((p) => {
          const validName = sanitizeDancerName(p.name || '', DEFAULT_GUEST_NAME);
          return {
            id: p.id || `dancer-${Date.now()}`,
            name: validName,
            progress: this.normalizeProgress(p.progress, validName)
          };
        });
        const foundActive =
          this.profiles.find((p) => p.id === parsed.activeProfileId) || this.profiles[0];
        this.activeProfileId = foundActive.id;
        this.progress = foundActive.progress;
        return;
      }

      // Migrate from single-user storage if present
      const legacyRaw = safeGetItem(LEGACY_STORAGE_KEY);
      const isSeeded = safeGetItem(COMBOS_SEEDED_KEY);
      let initialProgress: UserProgress = {
        ...DEFAULT_INITIAL_PROGRESS,
        customCombos: [...PRESET_COMBOS]
      };

      const parsedLegacy = safeJsonParse<Partial<UserProgress>>(legacyRaw);
      if (parsedLegacy) {
        let loadedCombos = Array.isArray(parsedLegacy.customCombos)
          ? parsedLegacy.customCombos
          : [...PRESET_COMBOS];

        if (!isSeeded) {
          const existingIds = new Set(loadedCombos.map((c) => c.id));
          loadedCombos = [
            ...PRESET_COMBOS.filter((p) => !existingIds.has(p.id)),
            ...loadedCombos
          ];
          safeSetItem(COMBOS_SEEDED_KEY, 'true');
        }

        const mastered = Array.isArray(parsedLegacy.masteredMoveIds)
          ? parsedLegacy.masteredMoveIds
          : DEFAULT_INITIAL_PROGRESS.masteredMoveIds;
        const rewarded = Array.isArray(parsedLegacy.rewardedMoveIds)
          ? Array.from(new Set([...parsedLegacy.rewardedMoveIds, ...mastered]))
          : [...mastered];

        initialProgress = {
          ...DEFAULT_INITIAL_PROGRESS,
          ...parsedLegacy,
          masteredMoveIds: mastered,
          rewardedMoveIds: rewarded,
          customCombos: loadedCombos
        };
      } else {
        safeSetItem(COMBOS_SEEDED_KEY, 'true');
      }

      const initialName =
        initialProgress.diplomaRecipientName &&
        initialProgress.diplomaRecipientName !== 'Ученик 2 класса'
          ? sanitizeDancerName(initialProgress.diplomaRecipientName, DEFAULT_GUEST_NAME)
          : DEFAULT_GUEST_NAME;

      initialProgress.diplomaRecipientName = initialName;

      const defaultProfile: DancerProfile = {
        id: 'dancer-default',
        name: initialName,
        progress: initialProgress
      };

      this.profiles = [defaultProfile];
      this.activeProfileId = defaultProfile.id;
      this.progress = defaultProfile.progress;
      this.save();
    } catch {
      const fallbackProfile: DancerProfile = {
        id: 'dancer-default',
        name: DEFAULT_GUEST_NAME,
        progress: { ...DEFAULT_INITIAL_PROGRESS, customCombos: [...PRESET_COMBOS] }
      };
      this.profiles = [fallbackProfile];
      this.activeProfileId = fallbackProfile.id;
      this.progress = fallbackProfile.progress;
    }
  }

  private save() {
    // Sync active profile object with current progress reference
    const idx = this.profiles.findIndex((p) => p.id === this.activeProfileId);
    if (idx >= 0) {
      this.profiles[idx] = {
        ...this.profiles[idx],
        progress: { ...this.progress }
      };
    }

    try {
      const payload: StoredProfilesState = {
        activeProfileId: this.activeProfileId,
        profiles: this.profiles
      };
      safeSetItem(PROFILES_STORAGE_KEY, JSON.stringify(payload));
      safeSetItem(LEGACY_STORAGE_KEY, JSON.stringify(this.progress));
    } catch {
      // ignore serialization errors
    }

    this.listeners.forEach((cb) => cb(this.progress));
  }

  public subscribe(cb: (progress: UserProgress) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public getProgress(): UserProgress {
    return { ...this.progress };
  }

  // ===================== DANCER PROFILES API =====================

  public getProfiles(): DancerProfile[] {
    return this.profiles.map((p) => ({
      ...p,
      progress: p.id === this.activeProfileId ? { ...this.progress } : { ...p.progress }
    }));
  }

  public getActiveProfile(): DancerProfile {
    const active = this.profiles.find((p) => p.id === this.activeProfileId) || this.profiles[0];
    return {
      ...active,
      progress: { ...this.progress }
    };
  }

  public switchProfile(id: string): DancerProfile | undefined {
    const target = this.profiles.find((p) => p.id === id);
    if (!target) return undefined;

    this.activeProfileId = target.id;
    this.progress = {
      ...target.progress,
      diplomaRecipientName: target.name
    };
    this.save();
    return this.getActiveProfile();
  }

  public createProfile(name: string): DancerProfile {
    const cleanName = sanitizeDancerName(name, `Танцор ${this.profiles.length + 1}`);
    const newProfile: DancerProfile = {
      id: `dancer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: cleanName,
      progress: createCleanProgress(cleanName)
    };

    this.profiles.push(newProfile);
    this.activeProfileId = newProfile.id;
    this.progress = { ...newProfile.progress };
    this.save();
    statsCounter.registerNewFriendProfile(this.profiles.length);
    return this.getActiveProfile();
  }

  public renameActiveProfile(newName: string): DancerProfile {
    const cleanName = sanitizeDancerName(newName, DEFAULT_GUEST_NAME);
    const idx = this.profiles.findIndex((p) => p.id === this.activeProfileId);
    if (idx >= 0) {
      this.profiles[idx].name = cleanName;
    }
    this.progress.diplomaRecipientName = cleanName;
    this.save();
    return this.getActiveProfile();
  }

  public deleteProfile(id: string): void {
    if (this.profiles.length <= 1) return;
    this.profiles = this.profiles.filter((p) => p.id !== id);
    if (this.activeProfileId === id) {
      const nextActive = this.profiles[0];
      this.activeProfileId = nextActive.id;
      this.progress = {
        ...nextActive.progress,
        diplomaRecipientName: nextActive.name
      };
    }
    this.save();
    statsCounter.syncLocalProfilesCount(this.profiles.length);
  }

  // ===================== TRAINING PROGRESS API =====================

  public toggleMasterMove(moveId: string): boolean {
    const isMastered = this.progress.masteredMoveIds.includes(moveId);
    if (isMastered) {
      this.progress.masteredMoveIds = this.progress.masteredMoveIds.filter((id) => id !== moveId);
    } else {
      this.progress.masteredMoveIds.push(moveId);

      // BUG-03 FIX: Award calories & minutes ONLY ONCE when mastering a move for the first time
      const rewarded = this.progress.rewardedMoveIds || [];
      if (!rewarded.includes(moveId)) {
        this.progress.rewardedMoveIds = [...rewarded, moveId];
        this.progress.totalCaloriesBurned += 15;
        this.progress.totalMinutesDanced += 3;
      }

      triggerSafeConfetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      this.checkAchievements();
    }
    this.save();
    return !isMastered;
  }

  public toggleFavoriteMove(moveId: string) {
    this.favoredMoveIds_cleanup();
    if (this.progress.favoritedMoveIds.includes(moveId)) {
      this.progress.favoritedMoveIds = this.progress.favoritedMoveIds.filter((id) => id !== moveId);
    } else {
      this.progress.favoritedMoveIds.push(moveId);
    }
    this.save();
  }

  private favoredMoveIds_cleanup() {
    if (!Array.isArray(this.progress.favoritedMoveIds)) {
      this.progress.favoritedMoveIds = [];
    }
  }

  public addMinutes(minutes: number) {
    this.progress.totalMinutesDanced += minutes;
    this.checkAchievements();
    this.save();
  }

  public addCalories(calories: number) {
    this.progress.totalCaloriesBurned += calories;
    this.checkAchievements();
    this.save();
  }

  public recordRehearsal() {
    this.progress.rehearsalsCompleted += 1;
    this.progress.totalMinutesDanced += 3;
    this.progress.totalCaloriesBurned += 25;
    this.checkAchievements();
    this.save();
  }

  public saveCustomCombo(combo: Combo) {
    const existingIndex = this.progress.customCombos.findIndex((c) => c.id === combo.id);
    if (existingIndex >= 0) {
      this.progress.customCombos[existingIndex] = combo;
    } else {
      this.progress.customCombos = [combo, ...this.progress.customCombos];
    }
    this.checkAchievements();
    this.save();
  }

  public deleteCustomCombo(comboId: string) {
    this.progress.customCombos = this.progress.customCombos.filter((c) => c.id !== comboId);
    this.save();
  }

  public restoreDefaultCombos() {
    const userOnlyCombos = this.progress.customCombos.filter(
      (c) => !PRESET_COMBOS.some((p) => p.id === c.id)
    );
    this.progress.customCombos = [...PRESET_COMBOS, ...userOnlyCombos];
    this.save();
  }

  public setDiploma(name: string, role: UserProgress['diplomaRole']) {
    const cleanName = sanitizeDancerName(name, this.getActiveProfile().name);
    this.progress.diplomaRecipientName = cleanName;
    this.progress.diplomaRole = role;
    this.progress.diplomaDate = new Date().toLocaleDateString('ru-RU');
    const idx = this.profiles.findIndex((p) => p.id === this.activeProfileId);
    if (idx >= 0 && cleanName) {
      this.profiles[idx].name = cleanName;
    }
    this.unlockAchievement('diploma-awarded');
    this.save();
  }

  public setDemoMode(active: boolean) {
    this.progress.demoMode = active;
    this.save();
  }

  public unlockAchievement(achievementId: string) {
    if (!this.progress.unlockedAchievementIds.includes(achievementId)) {
      this.progress.unlockedAchievementIds.push(achievementId);
      triggerSafeConfetti({
        particleCount: 70,
        spread: 75,
        origin: { y: 0.6 }
      });
      this.save();
    }
  }

  public checkAchievements() {
    const mastered = this.progress.masteredMoveIds;

    if (mastered.length >= 1) {
      this.unlockAchievement('first-step');
    }
    if (mastered.includes('square-steps')) {
      this.unlockAchievement('master-square');
    }
    if (mastered.includes('go-down')) {
      this.unlockAchievement('safe-corkscrew');
    }
    if (mastered.includes('dorozhka') && mastered.includes('three-step')) {
      this.unlockAchievement('king-footwork');
    }
    if (mastered.includes('storm-sweep') || mastered.includes('shadn-step')) {
      this.unlockAchievement('storm-chaser');
    }
    if (mastered.length >= 10 || this.progress.demoMode) {
      this.unlockAchievement('all-ten-mastered');
    }
    if (this.progress.customCombos.some((c) => c.isCustom)) {
      this.unlockAchievement('custom-combo-builder');
    }
    if (this.progress.rehearsalsCompleted > 0) {
      this.unlockAchievement('rehearsal-hero');
    }
    if (this.progress.totalCaloriesBurned >= 30) {
      this.unlockAchievement('calorie-burner');
    }
  }

  public resetProgress() {
    const currentName = this.getActiveProfile().name;
    this.progress = createCleanProgress(currentName);
    this.save();
  }
}

export const progressStorage = new ProgressStorageService();
