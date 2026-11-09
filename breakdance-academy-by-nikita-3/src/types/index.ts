export type MoveCategory = 'toprock' | 'godown' | 'footwork' | 'power';

export type MoveDifficulty = 1 | 2 | 3 | 4 | 5;

export interface FloorContact {
  id: string;
  type: 'left-foot' | 'right-foot' | 'left-hand' | 'right-hand';
  x: number; // percentage 0-100 on the floor circle
  y: number; // percentage 0-100 on the floor circle
  activePhases: number[]; // which phases this point has weight on
  label: string;
}

export interface MovePhase {
  phaseNumber: number;
  title: string;
  subtitle: string;
  nikitaInstruction: string;
  feetPosition: string;
  handsPosition: string;
  keyPose: string;
  commonMistake: string;
  visualCue: string;
}

export interface PoseKeyframe {
  // Center of hip/body position (0-100)
  bodyX: number;
  bodyY: number;
  // Angles in degrees
  torsoAngle: number;
  headAngle: number;
  leftShoulderAngle: number;
  leftElbowAngle: number;
  rightShoulderAngle: number;
  rightElbowAngle: number;
  leftHipAngle: number;
  leftKneeAngle: number;
  rightHipAngle: number;
  rightKneeAngle: number;
  // Level: 'high' (standing), 'medium' (crouch), 'low' (ground/floor)
  floorLevel: 'high' | 'medium' | 'low';
}

export type GrooveId = 'boom-bap' | 'school-funk' | 'electro-808' | 'turbo-battle';

export interface MoveRhythmConfig {
  defaultBpm: number;
  preferredGrooveId: GrooveId;
  beatsPerPhase: 1 | 2;
  phaseVoiceCues: [string, string, string, string];
}

export interface BreakMove {
  id: string;
  name: string;
  englishName: string;
  category: MoveCategory;
  level: 1 | 2; // 1 = База, 2 = Прокачка
  difficulty: MoveDifficulty;
  bpmRange: [number, number];
  rhythmConfig: MoveRhythmConfig;
  caloriesPerMin: number;
  nikitaQuote: string; // Цитата второклассника Никиты
  nikitaVoiceScript: string; // Текст озвучки Никиты
  shortDescription: string;
  fullDescription: string;
  phases: MovePhase[];
  commonMistakes: string[];
  nikitaTips: string[];
  targetMuscles: {
    core: number; // 0-100
    arms: number; // 0-100
    legs: number; // 0-100
    balance: number; // 0-100
  };
  floorContacts: FloorContact[];
  keyframes: PoseKeyframe[]; // 4 keyframes for the 4 phases
  videoPath: string; // ./nikita/videos/${move.id}.mp4
  audioPath: string; // ./nikita/audio/${move.id}.mp3 (falls back to .m4a if missing)
  audioFallbackPath?: string; // ./nikita/audio/${move.id}.m4a (iPhone Voice Memos format)
  photoPath: string; // ./nikita/photos/${move.id}.jpg
}

export interface Combo {
  id: string;
  name: string;
  nickname: string;
  description: string;
  moveIds: string[];
  difficulty: number;
  totalBeats: number;
  energyRating: 'Легкая' | 'Бодрая' | 'Огонь!' | 'Ураган!';
  recommendedBpm: number;
  nikitaTip: string;
  isCustom?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'moves' | 'combos' | 'energy' | 'npk';
  unlockedAt?: string;
  isSecret?: boolean;
}

export interface UserProgress {
  masteredMoveIds: string[];
  rewardedMoveIds?: string[];
  favoritedMoveIds: string[];
  customCombos: Combo[];
  totalMinutesDanced: number;
  totalCaloriesBurned: number;
  rehearsalsCompleted: number;
  currentStreakDays: number;
  unlockedAchievementIds: string[];
  diplomaRecipientName: string;
  diplomaRole: 'Би-Бой' | 'Би-Гёрл' | 'Член Жюри НПК' | 'Главный Эксперт';
  diplomaDate: string;
  demoMode: boolean; // Демо-режим для комиссии НПК
}

export interface DancerProfile {
  id: string;
  name: string;
  progress: UserProgress;
}

export interface BeatGroove {
  id: string;
  title: string;
  bpm: number;
  description: string;
  tag: string;
  accentColor: string;
}

export interface StoredMedia {
  moveId: string;
  videoBlob?: Blob;
  audioBlob?: Blob;
  videoUrl?: string;
  audioUrl?: string;
  photoUrl?: string;
  hasCustomVideo: boolean;
  hasCustomAudio: boolean;
  hasCustomPhoto: boolean;
  updatedAt: number;
}

export type ViewTab = 'catalog' | 'combos' | 'achievements';
export type DeviceViewMode = 'fullscreen' | 'iphone16pro';
