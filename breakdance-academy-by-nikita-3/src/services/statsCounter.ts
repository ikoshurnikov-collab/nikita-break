/**
 * Гибридный глобальный + офлайн-устойчивый счётчик ребят в приложении «Брейк от Никиты».
 * - База исследования Никиты (школьный опрос 2 класса): 30 ребят.
 * - При первом входе нового устройства (флаг `nikita_device_counted_v1`) и при добавлении нового друга
 *   отправляет запрос `https://api.counterapi.dev/v1/nikita_break_linteh28/dancers/up`.
 * - При повторных входах читает `https://api.counterapi.dev/v1/nikita_break_linteh28/dancers/`.
 * - Таймаут 2 секунды через AbortController + тихий фоллбэк на localStorage без единой ошибки в консоли.
 */

const DEVICE_COUNTED_KEY = 'nikita_device_counted_v1';
const CACHED_REMOTE_COUNT_KEY = 'nikita_remote_dancers_count_v1';
const CACHED_TOTAL_COUNT_KEY = 'nikita_total_dancers_cached_v1';

const BASE_SURVEY_PARTICIPANTS = 30;
const COUNTER_API_BASE = 'https://api.counterapi.dev/v1/nikita_break_linteh28/dancers';

const memoryStore = new Map<string, string>();

function safeGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) {
        memoryStore.set(key, val);
        return val;
      }
    }
  } catch {
    // ignore storage errors in private mode
  }
  return memoryStore.get(key) ?? null;
}

function safeSet(key: string, value: string): void {
  memoryStore.set(key, value);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // ignore storage errors in private mode
  }
}

async function fetchWithTimeout(url: string, timeoutMs = 2000): Promise<number | null> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return null;
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      }
    });
    window.clearTimeout(timer);

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as { count?: number; value?: number };
    const countVal =
      typeof data.count === 'number'
        ? data.count
        : typeof data.value === 'number'
        ? data.value
        : null;

    return countVal !== null && Number.isFinite(countVal) && countVal >= 0 ? countVal : null;
  } catch {
    window.clearTimeout(timer);
    return null;
  }
}

class StatsCounterService {
  private localProfilesCount = 1;
  private remoteCount = 0;
  private totalDancersCount = BASE_SURVEY_PARTICIPANTS + 1;
  private listeners: Set<(total: number) => void> = new Set();
  private initialized = false;

  constructor() {
    const cachedRemote = parseInt(safeGet(CACHED_REMOTE_COUNT_KEY) || '0', 10);
    if (Number.isFinite(cachedRemote) && cachedRemote > 0) {
      this.remoteCount = cachedRemote;
    }

    const cachedTotal = parseInt(safeGet(CACHED_TOTAL_COUNT_KEY) || '0', 10);
    const computed = BASE_SURVEY_PARTICIPANTS + this.remoteCount + this.localProfilesCount;
    this.totalDancersCount =
      Number.isFinite(cachedTotal) && cachedTotal > computed ? cachedTotal : computed;
  }

  private recalculateAndSave(allowDecrease = false): number {
    const formulaTotal = BASE_SURVEY_PARTICIPANTS + this.remoteCount + this.localProfilesCount;
    const cachedTotal = parseInt(safeGet(CACHED_TOTAL_COUNT_KEY) || '0', 10);

    if (allowDecrease) {
      this.totalDancersCount = Math.max(
        BASE_SURVEY_PARTICIPANTS + this.localProfilesCount,
        formulaTotal
      );
    } else {
      this.totalDancersCount = Math.max(
        BASE_SURVEY_PARTICIPANTS + this.localProfilesCount,
        Number.isFinite(cachedTotal) ? cachedTotal : 0,
        formulaTotal
      );
    }

    safeSet(CACHED_REMOTE_COUNT_KEY, String(this.remoteCount));
    safeSet(CACHED_TOTAL_COUNT_KEY, String(this.totalDancersCount));
    this.notify();
    return this.totalDancersCount;
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.totalDancersCount));
  }

  public subscribe(cb: (total: number) => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  public getTotalDancersCount(): number {
    return this.totalDancersCount;
  }

  /**
   * Инициализация счётчика при старте приложения:
   * - Если устройство заходит впервые (`nikita_device_counted_v1` нет) -> `/up`
   * - Иначе -> читает текущее значение `/`
   */
  public async initCounter(currentLocalProfilesCount: number): Promise<number> {
    this.localProfilesCount = Math.max(1, currentLocalProfilesCount);
    this.recalculateAndSave();

    if (this.initialized || typeof window === 'undefined') {
      return this.totalDancersCount;
    }
    this.initialized = true;

    const alreadyCounted = safeGet(DEVICE_COUNTED_KEY) === 'true';
    const endpoint = alreadyCounted ? `${COUNTER_API_BASE}/` : `${COUNTER_API_BASE}/up`;

    const fetchedCount = await fetchWithTimeout(endpoint, 2000);
    if (fetchedCount !== null) {
      if (!alreadyCounted) {
        safeSet(DEVICE_COUNTED_KEY, 'true');
      }
      this.remoteCount = Math.max(this.remoteCount, fetchedCount);
      this.recalculateAndSave();
    } else if (!alreadyCounted) {
      // Офлайн-фоллбэк при первом входе: фиксируем устройство локально
      safeSet(DEVICE_COUNTED_KEY, 'true');
      this.recalculateAndSave();
    }

    return this.totalDancersCount;
  }

  /**
   * Вызывается при создании нового профиля друга (`createProfile`):
   * Мгновенно увеличивает счётчик на глазах на +1 и отправляет `/up` в фоне.
   */
  public async registerNewFriendProfile(newLocalProfilesCount: number): Promise<number> {
    this.localProfilesCount = Math.max(1, newLocalProfilesCount);
    // Мгновенный оптимистичный +1 на экране
    this.totalDancersCount += 1;
    safeSet(CACHED_TOTAL_COUNT_KEY, String(this.totalDancersCount));
    this.notify();

    const fetchedCount = await fetchWithTimeout(`${COUNTER_API_BASE}/up`, 2000);
    if (fetchedCount !== null) {
      this.remoteCount = Math.max(this.remoteCount, fetchedCount);
      this.recalculateAndSave();
    }

    return this.totalDancersCount;
  }

  /**
   * Синхронизирует количество локальных профилей при удалении профиля.
   */
  public syncLocalProfilesCount(newLocalProfilesCount: number): number {
    this.localProfilesCount = Math.max(1, newLocalProfilesCount);
    return this.recalculateAndSave(true);
  }
}

export const statsCounter = new StatsCounterService();
