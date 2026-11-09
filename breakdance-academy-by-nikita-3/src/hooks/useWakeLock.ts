import { useEffect, useRef } from 'react';

interface WakeLockSentinelLike {
  released?: boolean;
  release: () => Promise<void>;
}

interface NavigatorWithWakeLock {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinelLike>;
  };
}

/**
 * Keeps the smartphone screen awake during active dance training or combo rehearsal
 * using the Screen Wake Lock API, with automatic re-acquisition on visibilitychange.
 */
export function useWakeLock(enabled: boolean = true): void {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    let isCancelled = false;

    const requestWakeLock = async () => {
      try {
        const nav = navigator as unknown as NavigatorWithWakeLock;
        if (!nav.wakeLock || typeof nav.wakeLock.request !== 'function') {
          return;
        }
        if (sentinelRef.current && !sentinelRef.current.released) {
          return;
        }
        const sentinel = await nav.wakeLock.request('screen');
        if (isCancelled) {
          await sentinel.release().catch(() => {});
          return;
        }
        sentinelRef.current = sentinel;
      } catch {
        // Ignore errors when Wake Lock is unsupported or disallowed by battery saver
      }
    };

    const releaseWakeLock = async () => {
      try {
        if (sentinelRef.current) {
          const current = sentinelRef.current;
          sentinelRef.current = null;
          await current.release();
        }
      } catch {
        // Ignore release errors
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isCancelled) {
        void requestWakeLock();
      }
    };

    void requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isCancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      void releaseWakeLock();
    };
  }, [enabled]);
}
