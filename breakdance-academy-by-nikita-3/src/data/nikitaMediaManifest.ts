export interface NikitaUploadedMediaManifest {
  hasUploadedMedia: boolean;
  avatar: boolean | string;
  videos: string[];
  photos: string[];
  audio: string[];
}

export const DEFAULT_UPLOADED_MEDIA_MANIFEST: NikitaUploadedMediaManifest = {
  hasUploadedMedia: true,
  avatar: 'avatar.jpg',
  videos: ['*'],
  photos: [],
  audio: ['*']
};

let runtimeManifest: NikitaUploadedMediaManifest = { ...DEFAULT_UPLOADED_MEDIA_MANIFEST };
let manifestLoadPromise: Promise<NikitaUploadedMediaManifest> | null = null;
let manifestLoaded = true;

export function loadNikitaMediaManifest(): Promise<NikitaUploadedMediaManifest> {
  return Promise.resolve(runtimeManifest);
}

export function getLoadedMediaManifest(): NikitaUploadedMediaManifest {
  return runtimeManifest;
}

export const MOVE_IDS = [
  'square-steps',
  'lunges-toprock',
  'kick-step',
  'kick-out',
  'go-down',
  'dorozhka',
  'three-step',
  'storm-sweep',
  'shadn-step',
  'arrows-footwork'
] as const;

export type NikitaMoveId = (typeof MOVE_IDS)[number];

export const SYSTEM_AUDIO_KEYS = [
  'greeting',
  'warmup',
  'mastered',
  'combo-finish',
  'count-3',
  'count-2',
  'count-1',
  'count-break',
  'beat-1',
  'beat-2',
  'beat-3',
  'beat-4'
] as const;

export const SHORT_COMBO_AUDIO_KEYS = [
  'short-square-steps',
  'short-lunges-toprock',
  'short-kick-step',
  'short-kick-out',
  'short-go-down',
  'short-dorozhka',
  'short-three-step',
  'short-storm-sweep',
  'short-shadn-step',
  'short-arrows-footwork'
] as const;

export const MOVE_DESCRIPTION_AUDIO_KEYS = [
  'square-steps',
  'lunges-toprock',
  'kick-step',
  'kick-out',
  'go-down',
  'dorozhka',
  'three-step',
  'storm-sweep',
  'shadn-step',
  'arrows-footwork'
] as const;

export const MOVE_PHASE_AUDIO_KEYS = [
  'square-steps-1',
  'square-steps-2',
  'square-steps-3',
  'square-steps-4',
  'lunges-toprock-1',
  'lunges-toprock-2',
  'lunges-toprock-3',
  'lunges-toprock-4',
  'kick-step-1',
  'kick-step-2',
  'kick-step-3',
  'kick-step-4',
  'kick-out-1',
  'kick-out-2',
  'kick-out-3',
  'kick-out-4',
  'go-down-1',
  'go-down-2',
  'go-down-3',
  'go-down-4',
  'dorozhka-1',
  'dorozhka-2',
  'dorozhka-3',
  'dorozhka-4',
  'three-step-1',
  'three-step-2',
  'three-step-3',
  'three-step-4',
  'storm-sweep-1',
  'storm-sweep-2',
  'storm-sweep-3',
  'storm-sweep-4',
  'shadn-step-1',
  'shadn-step-2',
  'shadn-step-3',
  'shadn-step-4',
  'arrows-footwork-1',
  'arrows-footwork-2',
  'arrows-footwork-3',
  'arrows-footwork-4'
] as const;

export const ALL_72_AUDIO_KEYS = [
  ...SYSTEM_AUDIO_KEYS,
  ...SHORT_COMBO_AUDIO_KEYS,
  ...MOVE_DESCRIPTION_AUDIO_KEYS,
  ...MOVE_PHASE_AUDIO_KEYS
] as const;

export type NikitaAudioKey = (typeof ALL_72_AUDIO_KEYS)[number];

export const PRELOAD_SHORT_AUDIO_KEYS: readonly string[] = [
  'beat-1',
  'beat-2',
  'beat-3',
  'beat-4',
  'count-3',
  'count-2',
  'count-1',
  'count-break',
  ...SHORT_COMBO_AUDIO_KEYS
];

const AUDIO_KEY_ALIASES: Record<string, string> = {
  welcome: 'greeting'
};

export function normalizeAudioKey(rawKey?: string): string | undefined {
  if (!rawKey) return undefined;
  const stripped = rawKey
    .replace(/^\.\/nikita\/audio\//i, '')
    .replace(/\.(m4a|mp3)$/i, '')
    .trim();
  if (!stripped) return undefined;
  return AUDIO_KEY_ALIASES[stripped] || stripped;
}

export function getAudioUrlCandidates(audioKey?: string, explicitAudioPath?: string): string[] {
  const normalizedKey = normalizeAudioKey(audioKey) || normalizeAudioKey(explicitAudioPath);
  if (!normalizedKey) return [];

  return [
    `./nikita/audio/${normalizedKey}.m4a`,
    `./nikita/audio/${normalizedKey}.mp3`,
    `./nikita/audio/${normalizedKey}.M4A`,
    `./nikita/audio/${normalizedKey}.MP3`
  ];
}

export function getVideoUrlCandidates(moveId: string, _explicitVideoPath?: string): string[] {
  const cleanId = moveId
    .replace(/^\.\/nikita\/videos\//i, '')
    .replace(/\.mp4$/i, '')
    .trim();

  return [`./nikita/videos/${cleanId}.mp4`, `./nikita/videos/${cleanId}.MP4`];
}

export function getPhotoUrlCandidates(moveId: string, _explicitPhotoPath?: string): string[] {
  if (!runtimeManifest.photos.length) return [];
  const cleanId = moveId
    .replace(/^\.\/nikita\/photos\//i, '')
    .replace(/\.(jpg|jpeg|png)$/i, '')
    .trim();

  return [`./nikita/photos/${cleanId}.jpg`, `./nikita/photos/${cleanId}.png`];
}

export function getAvatarUrlCandidates(): string[] {
  return [
    './nikita/avatar.jpg',
    './nikita/avatar.png',
    './nikita/avatar.JPG',
    './nikita/avatar.PNG'
  ];
}
