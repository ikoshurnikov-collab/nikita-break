/**
 * Полный поименный реестр всех 72 аудиофайлов, 10 видео, 10 фото карточек и аватарки Никиты
 * с защитой от регистра расширений (.m4a/.M4A/.mp3/.MP3, .mp4/.MP4, .jpg/.JPG/.png/.PNG) на GitHub Pages (Linux).
 *
 * BUG-01 FIX: При старте приложения загружается ОДИН раз `./nikita/media-manifest.json`
 * (или используется флаг `hasUploadedMedia`). Если `hasUploadedMedia === false` или конкретного ключа нет
 * в манифесте — система НЕ делает ни одного сетевого запроса (0 ошибок 404 Not Found в консоли)
 * и мгновенно показывает 2D-симулятор, векторную аватарку и встроенный звук.
 */

export interface NikitaUploadedMediaManifest {
  hasUploadedMedia: boolean;
  avatar: boolean | string;
  videos: string[];
  photos: string[];
  audio: string[];
}

export const DEFAULT_UPLOADED_MEDIA_MANIFEST: NikitaUploadedMediaManifest = {
  hasUploadedMedia: false,
  avatar: false,
  videos: [],
  photos: [],
  audio: []
};

let runtimeManifest: NikitaUploadedMediaManifest = { ...DEFAULT_UPLOADED_MEDIA_MANIFEST };
let manifestLoadPromise: Promise<NikitaUploadedMediaManifest> | null = null;
let manifestLoaded = false;

/**
 * Загружает `./nikita/media-manifest.json` ровно 1 раз за сессию.
 * Никаких 404 при пустой папке `public/nikita/`.
 */
export function loadNikitaMediaManifest(): Promise<NikitaUploadedMediaManifest> {
  if (manifestLoaded) {
    return Promise.resolve(runtimeManifest);
  }
  if (manifestLoadPromise) {
    return manifestLoadPromise;
  }
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    manifestLoaded = true;
    return Promise.resolve(runtimeManifest);
  }

  manifestLoadPromise = fetch('./nikita/media-manifest.json', { cache: 'no-cache' })
    .then(async (res) => {
      if (!res.ok) {
        return DEFAULT_UPLOADED_MEDIA_MANIFEST;
      }
      const data = (await res.json()) as Partial<NikitaUploadedMediaManifest>;
      runtimeManifest = {
        hasUploadedMedia: Boolean(data.hasUploadedMedia),
        avatar: data.avatar ?? false,
        videos: Array.isArray(data.videos) ? data.videos : [],
        photos: Array.isArray(data.photos) ? data.photos : [],
        audio: Array.isArray(data.audio) ? data.audio : []
      };
      manifestLoaded = true;
      return runtimeManifest;
    })
    .catch(() => {
      manifestLoaded = true;
      return runtimeManifest;
    });

  return manifestLoadPromise;
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

// 1. Системные ключи озвучки (12 шт)
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

// 2. Короткие названия движений для связок (10 шт)
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

// 3. Общие описания 10 движений (10 шт)
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

// 4. Пошаговые фазы 1..4 для всех 10 движений во вкладке "Пошаговый разбор" (40 шт)
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

// Полный список всех 72 ключей озвучки (12 + 10 + 10 + 40 = 72)
export const ALL_72_AUDIO_KEYS = [
  ...SYSTEM_AUDIO_KEYS,
  ...SHORT_COMBO_AUDIO_KEYS,
  ...MOVE_DESCRIPTION_AUDIO_KEYS,
  ...MOVE_PHASE_AUDIO_KEYS
] as const;

export type NikitaAudioKey = (typeof ALL_72_AUDIO_KEYS)[number];

// Короткие ритмичные файлы счёта, отсчёта и связок для предзагрузки в память (18 шт)
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

function matchesManifestEntry(entries: string[], baseKey: string): string | null {
  const lowerKey = baseKey.toLowerCase();
  for (const item of entries) {
    const clean = item.trim();
    const withoutDir = clean
      .replace(/^\.\/nikita\/(audio|videos|photos)\//i, '')
      .replace(/\.(m4a|mp3|mp4|jpg|jpeg|png)$/i, '')
      .toLowerCase();
    if (withoutDir === lowerKey || clean.toLowerCase() === lowerKey) {
      return clean;
    }
  }
  return null;
}

/**
 * Возвращает список URL-кандидатов для аудиофайла ТОЛЬКО если файл разрешен в `media-manifest.json`.
 * Если `hasUploadedMedia === false` или файла нет в списке — возвращает `[]`, исключая 404 ошибки.
 */
export function getAudioUrlCandidates(audioKey?: string, explicitAudioPath?: string): string[] {
  if (!runtimeManifest.hasUploadedMedia) {
    return [];
  }

  const normalizedKey = normalizeAudioKey(audioKey) || normalizeAudioKey(explicitAudioPath);
  if (!normalizedKey) return [];

  const matched =
    runtimeManifest.audio.includes('*')
      ? normalizedKey
      : matchesManifestEntry(runtimeManifest.audio, normalizedKey);

  if (!matched) {
    return [];
  }

  // Если в манифесте указано точное имя файла с расширением (например, "greeting.m4a"), берем только его:
  if (/\.(m4a|mp3)$/i.test(matched)) {
    return [
      matched.startsWith('./nikita/audio/') ? matched : `./nikita/audio/${matched}`
    ];
  }

  const candidates: string[] = [];
  const exts = ['m4a', 'M4A', 'mp3', 'MP3'];
  for (const ext of exts) {
    candidates.push(`./nikita/audio/${normalizedKey}.${ext}`);
  }
  return candidates;
}

/**
 * Возвращает список URL-кандидатов для видео движения ТОЛЬКО если оно есть в `media-manifest.json`.
 */
export function getVideoUrlCandidates(moveId: string, _explicitVideoPath?: string): string[] {
  if (!runtimeManifest.hasUploadedMedia) {
    return [];
  }

  const cleanId = moveId
    .replace(/^\.\/nikita\/videos\//i, '')
    .replace(/\.mp4$/i, '')
    .trim();

  const matched =
    runtimeManifest.videos.includes('*')
      ? cleanId
      : matchesManifestEntry(runtimeManifest.videos, cleanId);

  if (!matched) {
    return [];
  }

  if (/\.mp4$/i.test(matched)) {
    return [
      matched.startsWith('./nikita/videos/') ? matched : `./nikita/videos/${matched}`
    ];
  }

  return [`./nikita/videos/${cleanId}.mp4`, `./nikita/videos/${cleanId}.MP4`];
}

/**
 * Возвращает список URL-кандидатов для фото карточки движения ТОЛЬКО если оно есть в `media-manifest.json`.
 */
export function getPhotoUrlCandidates(moveId: string, _explicitPhotoPath?: string): string[] {
  if (!runtimeManifest.hasUploadedMedia) {
    return [];
  }

  const cleanId = moveId
    .replace(/^\.\/nikita\/photos\//i, '')
    .replace(/\.(jpg|jpeg|png)$/i, '')
    .trim();

  const matched =
    runtimeManifest.photos.includes('*')
      ? cleanId
      : matchesManifestEntry(runtimeManifest.photos, cleanId);

  if (!matched) {
    return [];
  }

  if (/\.(jpg|jpeg|png)$/i.test(matched)) {
    return [
      matched.startsWith('./nikita/photos/') ? matched : `./nikita/photos/${matched}`
    ];
  }

  return [
    `./nikita/photos/${cleanId}.jpg`,
    `./nikita/photos/${cleanId}.JPG`,
    `./nikita/photos/${cleanId}.png`,
    `./nikita/photos/${cleanId}.PNG`
  ];
}

/**
 * Возвращает список URL-кандидатов для аватарки Никиты ТОЛЬКО если `avatar` включен в `media-manifest.json`.
 */
export function getAvatarUrlCandidates(): string[] {
  if (!runtimeManifest.hasUploadedMedia || !runtimeManifest.avatar) {
    return [];
  }

  if (typeof runtimeManifest.avatar === 'string' && /\.(png|jpg|jpeg)$/i.test(runtimeManifest.avatar)) {
    const file = runtimeManifest.avatar;
    return [file.startsWith('./nikita/') ? file : `./nikita/${file}`];
  }

  return [
    './nikita/avatar.png',
    './nikita/avatar.PNG',
    './nikita/avatar.jpg',
    './nikita/avatar.JPG'
  ];
}
