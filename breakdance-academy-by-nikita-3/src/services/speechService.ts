import {
  getAudioUrlCandidates,
  loadNikitaMediaManifest,
  normalizeAudioKey,
  PRELOAD_SHORT_AUDIO_KEYS
} from '../data/nikitaMediaManifest';

export type CountdownCueKey = 'count-3' | 'count-2' | 'count-1' | 'count-break';

class SpeechService {
  private currentAudioElement: HTMLAudioElement | null = null;
  private isSpeaking = false;
  private onStatusChangeListeners: Set<(isSpeaking: boolean, text: string) => void> = new Set();
  private currentText = '';
  private fallbackHideTimer: ReturnType<typeof setTimeout> | null = null;

  /** In-memory cache of resolved HTMLAudioElement instances (preload="auto") for 0ms playback */
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  /** Session set of audio keys confirmed missing for 0ms fallback */
  private missingKeys: Set<string> = new Set();
  /** Pending probe promises so concurrent requests for the same key don't duplicate network checks */
  private pendingProbes: Map<string, Promise<HTMLAudioElement | null>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      // Load `./nikita/media-manifest.json` ONCE on startup before attempting any preload.
      // If `hasUploadedMedia === false`, 0 network requests will be made (0 404s in console).
      loadNikitaMediaManifest().then((manifest) => {
        if (manifest.hasUploadedMedia && manifest.audio.length > 0) {
          this.preloadShortAudioCues();
        }
      });
    }
  }

  public subscribe(cb: (isSpeaking: boolean, text: string) => void) {
    this.onStatusChangeListeners.add(cb);
    return () => this.onStatusChangeListeners.delete(cb);
  }

  private notify(isSpeaking: boolean, text: string) {
    this.isSpeaking = isSpeaking;
    this.currentText = text;
    this.onStatusChangeListeners.forEach((cb) => cb(isSpeaking, text));
  }

  /**
   * Background preloader for the 18 short cues (beat-1..4, count-3..break, short-${moveId}).
   * Only probes files explicitly declared in `media-manifest.json`.
   */
  public preloadShortAudioCues(): void {
    for (const key of PRELOAD_SHORT_AUDIO_KEYS) {
      const candidates = getAudioUrlCandidates(key);
      if (candidates.length > 0) {
        this.probeKeyToCache(key);
      } else {
        this.missingKeys.add(key);
      }
    }
  }

  private async probeKeyToCache(rawKey: string, explicitPath?: string): Promise<HTMLAudioElement | null> {
    const key = normalizeAudioKey(rawKey) || rawKey;

    if (this.audioCache.has(key)) {
      return this.audioCache.get(key)!;
    }
    if (this.missingKeys.has(key)) {
      return null;
    }
    if (this.pendingProbes.has(key)) {
      return this.pendingProbes.get(key)!;
    }

    await loadNikitaMediaManifest();
    const candidates = getAudioUrlCandidates(key, explicitPath);
    if (candidates.length === 0) {
      this.missingKeys.add(key);
      return null;
    }

    const probePromise = new Promise<HTMLAudioElement | null>((resolve) => {
      let idx = 0;

      const tryNextUrl = () => {
        if (idx >= candidates.length) {
          this.missingKeys.add(key);
          this.pendingProbes.delete(key);
          resolve(null);
          return;
        }

        const url = candidates[idx++];
        const audio = new Audio();
        audio.preload = 'auto';
        let settled = false;

        const handleSuccess = () => {
          if (settled) return;
          settled = true;
          audio.onloadedmetadata = null;
          audio.oncanplaythrough = null;
          audio.onerror = null;
          this.audioCache.set(key, audio);
          this.pendingProbes.delete(key);
          resolve(audio);
        };

        const handleFailure = () => {
          if (settled) return;
          settled = true;
          audio.onloadedmetadata = null;
          audio.oncanplaythrough = null;
          audio.onerror = null;
          tryNextUrl();
        };

        audio.onloadedmetadata = handleSuccess;
        audio.oncanplaythrough = handleSuccess;
        audio.onerror = handleFailure;
        audio.src = url;
        audio.load();
      };

      tryNextUrl();
    });

    this.pendingProbes.set(key, probePromise);
    return probePromise;
  }

  private playCachedElement(
    audio: HTMLAudioElement,
    bubbleText?: string,
    onFallback?: () => void
  ): void {
    if (this.currentAudioElement && this.currentAudioElement !== audio) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    audio.currentTime = 0;
    this.currentAudioElement = audio;

    audio.onended = () => {
      if (bubbleText) {
        this.notify(false, '');
      }
      if (this.currentAudioElement === audio) {
        this.currentAudioElement = null;
      }
    };

    if (bubbleText) {
      this.notify(true, bubbleText);
    }

    audio.play().catch(() => {
      if (this.currentAudioElement === audio) {
        this.currentAudioElement = null;
      }
      if (onFallback) {
        onFallback();
      }
    });
  }

  /**
   * Instant move-name announcement for Combo Rehearsal (keys: short-square-steps, etc.):
   */
  public speakMoveNameInstant(moveName: string, moveId?: string): void {
    this.stop();

    const cleanName = moveName.replace(/\s*\(.*?\)\s*/g, '').trim() || moveName;
    const spokenText = `${cleanName}!`;
    const bubbleText = `Движение: ${moveName}!`;

    this.notify(true, bubbleText);

    if (moveId) {
      const shortKey = normalizeAudioKey(`short-${moveId}`) || `short-${moveId}`;

      if (this.audioCache.has(shortKey)) {
        const cachedAudio = this.audioCache.get(shortKey)!;
        this.playCachedElement(cachedAudio, bubbleText, () => {
          this.speakShortSynthesisInstant(spokenText, bubbleText);
        });
        return;
      }

      if (this.missingKeys.has(shortKey) || getAudioUrlCandidates(shortKey).length === 0) {
        this.missingKeys.add(shortKey);
        this.speakShortSynthesisInstant(spokenText, bubbleText);
        return;
      }

      this.probeKeyToCache(shortKey).then((resolvedAudio) => {
        if (resolvedAudio) {
          this.playCachedElement(resolvedAudio, bubbleText, () => {
            this.speakShortSynthesisInstant(spokenText, bubbleText);
          });
        } else {
          this.speakShortSynthesisInstant(spokenText, bubbleText);
        }
      });
      return;
    }

    this.speakShortSynthesisInstant(spokenText, bubbleText);
  }

  private speakShortSynthesisInstant(spokenText: string, bubbleText: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = 'ru-RU';
      utterance.rate = 1.15;
      utterance.pitch = 1.22;

      const voices = window.speechSynthesis.getVoices();
      const ruVoice = voices.find((v) => v.lang.startsWith('ru') || v.lang.includes('RU'));
      if (ruVoice) {
        utterance.voice = ruVoice;
      }

      utterance.onstart = () => {
        this.notify(true, bubbleText);
      };

      utterance.onend = () => {
        this.notify(false, '');
      };

      utterance.onerror = () => {
        this.notify(false, '');
      };

      window.speechSynthesis.speak(utterance);

      this.fallbackHideTimer = setTimeout(() => {
        if (this.currentText === bubbleText) {
          this.notify(false, '');
        }
      }, 2200);
    } else {
      this.fallbackHideTimer = setTimeout(() => {
        this.notify(false, '');
      }, 2000);
    }
  }

  /**
   * Plays Nikita's live countdown audio (keys: count-3, count-2, count-1, count-break),
   * falling back to soundEngine beep if not in manifest.
   */
  public playCountdownCue(
    cueKey: CountdownCueKey,
    isFinalBeep: boolean,
    onFallbackBeep: (isFinal: boolean) => void
  ): void {
    const key = normalizeAudioKey(cueKey) || cueKey;

    if (this.audioCache.has(key)) {
      const cachedAudio = this.audioCache.get(key)!;
      this.playCachedElement(cachedAudio, undefined, () => {
        onFallbackBeep(isFinalBeep);
      });
      return;
    }

    if (this.missingKeys.has(key) || getAudioUrlCandidates(key).length === 0) {
      this.missingKeys.add(key);
      onFallbackBeep(isFinalBeep);
      return;
    }

    this.probeKeyToCache(key).then((resolvedAudio) => {
      if (resolvedAudio) {
        this.playCachedElement(resolvedAudio, undefined, () => {
          onFallbackBeep(isFinalBeep);
        });
      } else {
        onFallbackBeep(isFinalBeep);
      }
    });
  }

  /**
   * Instant rhythmic count for "🔊 Счёт 1-2-3-4" (keys: beat-1, beat-2, beat-3, beat-4):
   * - If in audioCache -> plays recorded .m4a/.mp3 at 0ms.
   * - BUG-05 FIX: When beat-1..4 files are not uploaded, at fast 1.0x speed (~490ms per step),
   *   calling speechSynthesis.cancel() + speak() on every beat hangs mobile TTS queues and cuts off words.
   *   At speed >= 1.0 we speak via TTS only on Phase 1 ("Раз!") without canceling on phases 2-3-4,
   *   while Web Audio API tonal metronome accents mark all 4 beats cleanly.
   */
  public speakPhaseCountInstant(
    phaseNumber: number,
    customCue?: string,
    speed: number = 0.5
  ): void {
    const normalizedPhase = ((phaseNumber - 1) % 4) + 1;
    const beatKey = `beat-${normalizedPhase}`;
    const counts: Record<number, string> = {
      1: 'Раз!',
      2: 'Два!',
      3: 'Три!',
      4: 'Четыре!'
    };
    const word = customCue || counts[normalizedPhase] || 'Раз!';

    if (this.fallbackHideTimer !== null) {
      clearTimeout(this.fallbackHideTimer);
      this.fallbackHideTimer = null;
    }

    if (this.audioCache.has(beatKey)) {
      const cachedBeat = this.audioCache.get(beatKey)!;
      this.playCachedElement(cachedBeat, undefined, () => {
        if (speed < 1.0 || normalizedPhase === 1) {
          this.speakPhaseWordSynthesis(word, speed);
        }
      });
      return;
    }

    if (this.missingKeys.has(beatKey) || getAudioUrlCandidates(beatKey).length === 0) {
      this.missingKeys.add(beatKey);
      if (speed < 1.0 || normalizedPhase === 1) {
        this.speakPhaseWordSynthesis(word, speed);
      }
      return;
    }

    this.probeKeyToCache(beatKey).then((resolvedAudio) => {
      if (resolvedAudio) {
        this.playCachedElement(resolvedAudio, undefined, () => {
          if (speed < 1.0 || normalizedPhase === 1) {
            this.speakPhaseWordSynthesis(word, speed);
          }
        });
      } else if (speed < 1.0 || normalizedPhase === 1) {
        this.speakPhaseWordSynthesis(word, speed);
      }
    });
  }

  private speakPhaseWordSynthesis(word: string, speed: number = 0.5): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'ru-RU';
      utterance.rate = speed >= 1.0 ? 1.45 : 1.25;
      utterance.pitch = 1.22;

      const voices = window.speechSynthesis.getVoices();
      const ruVoice = voices.find((v) => v.lang.startsWith('ru') || v.lang.includes('RU'));
      if (ruVoice) {
        utterance.voice = ruVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  }

  /**
   * Plays Nikita's live voice recording from ./nikita/audio/ if present in media-manifest.json,
   * otherwise falls back immediately to Web Speech Synthesis with zero 404 requests.
   */
  public async speakNikita(text: string, audioKey?: string, audioPath?: string): Promise<void> {
    this.stop();

    const normalizedKey = normalizeAudioKey(audioKey) || normalizeAudioKey(audioPath);

    if (normalizedKey) {
      if (this.audioCache.has(normalizedKey)) {
        const cached = this.audioCache.get(normalizedKey)!;
        this.playCachedElement(cached, text, () => {
          this.speakWithSpeechSynthesis(text);
        });
        return;
      }

      if (this.missingKeys.has(normalizedKey)) {
        this.speakWithSpeechSynthesis(text);
        return;
      }

      const resolvedAudio = await this.probeKeyToCache(normalizedKey, audioPath);
      if (resolvedAudio) {
        this.playCachedElement(resolvedAudio, text, () => {
          this.speakWithSpeechSynthesis(text);
        });
        return;
      }
    }

    this.speakWithSpeechSynthesis(text);
  }

  private speakWithSpeechSynthesis(text: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = 1.05;
      utterance.pitch = 1.25;

      const voices = window.speechSynthesis.getVoices();
      const ruVoice = voices.find((v) => v.lang.startsWith('ru') || v.lang.includes('RU'));
      if (ruVoice) {
        utterance.voice = ruVoice;
      }

      utterance.onstart = () => {
        this.notify(true, text);
      };

      utterance.onend = () => {
        this.notify(false, '');
      };

      utterance.onerror = () => {
        this.notify(false, '');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      this.notify(true, text);
      this.fallbackHideTimer = setTimeout(() => {
        this.notify(false, '');
      }, 4000);
    }
  }

  public stop() {
    if (this.fallbackHideTimer !== null) {
      clearTimeout(this.fallbackHideTimer);
      this.fallbackHideTimer = null;
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.notify(false, '');
  }

  public getStatus() {
    return {
      isSpeaking: this.isSpeaking,
      currentText: this.currentText
    };
  }
}

export const speechService = new SpeechService();
