import { BeatGroove } from '../types';

export const BEAT_GROOVES: BeatGroove[] = [
  {
    id: 'boom-bap',
    title: '1. Олдскул Бум-Бэп',
    bpm: 85,
    description: 'Классический мягкий хип-хоп ритм с глубокой бочкой и теплым фанковым басом.',
    tag: '85 BPM • Бум-Бэп',
    accentColor: '#00E5FF'
  },
  {
    id: 'school-funk',
    title: '2. Школьный Фанк',
    bpm: 98,
    description: 'Ломаный синкопированный брейк-бит с двойной бочкой, ковбеллом и прыгучим риффом.',
    tag: '98 BPM • Фанк',
    accentColor: '#FFE600'
  },
  {
    id: 'electro-808',
    title: '3. Электро-Брейк 808',
    bpm: 110,
    description: 'Мощный электронный бит с длинным 808 басом, быстрыми хай-хэтами и синт-аккордами.',
    tag: '110 BPM • Электро 808',
    accentColor: '#00E676'
  },
  {
    id: 'turbo-battle',
    title: '4. Турбо-Баттл',
    bpm: 122,
    description: 'Динамичный скоростной ритм для финала с частыми снейрами, клэпами и энергичной мелодией!',
    tag: '122 BPM • Турбо',
    accentColor: '#FF4D00'
  }
];

const GROOVE_ALIASES: Record<string, string> = {
  'groove-learn': 'boom-bap',
  'groove-school': 'school-funk',
  'groove-street': 'electro-808',
  'groove-battle': 'turbo-battle'
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentGrooveIndex = 1; // Default to '2. Школьный Фанк' (98 BPM)
  private currentBpm = 98;
  private volume = 0.8;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private lastFanfareAt = 0;
  private timerId: number | null = null;
  private currentStep = 0; // 0 to 15 (16th notes)
  private listeners: Set<(step: number, bpm: number, isPlaying: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const resumeIfNeeded = () => {
        if (!this.ctx) return;
        const state = this.ctx.state as string;
        if (state === 'suspended' || state === 'interrupted') {
          this.ctx.resume().catch(() => {});
        }
      };

      window.addEventListener('touchstart', resumeIfNeeded, { passive: true });
      window.addEventListener('pointerdown', resumeIfNeeded, { passive: true });
      window.addEventListener('click', resumeIfNeeded, { passive: true });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          resumeIfNeeded();
        }
      });
    }
  }

  /**
   * Synchronously unlocks Web Audio API inside a direct user click/tap gesture on iOS Safari.
   */
  public unlock(): AudioContext {
    return this.getAudioContext();
  }

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      // Master limiter / compressor to prevent speaker clipping on mobile
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-10, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(16, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.18, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);
    }
    const state = this.ctx.state as string;
    if (state === 'suspended' || state === 'interrupted') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public subscribe(callback: (step: number, bpm: number, isPlaying: boolean) => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(step: number) {
    this.listeners.forEach((cb) => cb(step, this.currentBpm, this.isPlaying));
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public setBpm(newBpm: number) {
    this.currentBpm = Math.max(55, Math.min(145, Math.round(newBpm)));
    if (this.isPlaying) {
      this.restartLoop();
    } else {
      this.notify(this.currentStep);
    }
  }

  public selectGroove(grooveId: string) {
    const resolvedId = GROOVE_ALIASES[grooveId] || grooveId;
    const idx = BEAT_GROOVES.findIndex((g) => g.id === resolvedId);
    if (idx !== -1) {
      this.currentGrooveIndex = idx;
      this.currentBpm = BEAT_GROOVES[idx].bpm;
      if (this.isPlaying) {
        this.currentStep = 0;
        this.restartLoop();
      } else {
        this.notify(this.currentStep);
      }
    }
  }

  /**
   * Master Clock helper: sets the move's preferred groove and calculates effective BPM
   * scaled to training speed (0.25x -> 0.6, 0.5x -> 0.75, 1.0x -> 1.0, min 55 BPM).
   */
  public configureMoveRhythm(grooveId: string, baseBpm: number, speed: number = 1.0): number {
    const resolvedId = GROOVE_ALIASES[grooveId] || grooveId;
    const idx = BEAT_GROOVES.findIndex((g) => g.id === resolvedId);
    if (idx !== -1) {
      this.currentGrooveIndex = idx;
    }

    const speedMultiplier = speed === 0.25 ? 0.6 : speed === 0.5 ? 0.75 : 1;
    const effectiveBpm = Math.max(55, Math.round(baseBpm * speedMultiplier));
    this.currentBpm = Math.min(145, effectiveBpm);

    if (this.isPlaying) {
      this.restartLoop();
    } else {
      this.notify(this.currentStep);
    }

    return this.currentBpm;
  }

  /**
   * Synchronizes the drum machine's Kick (phases 0 & 2 -> steps 0 & 8)
   * and Snare (phases 1 & 3 -> steps 4 & 12) to the exact 0ms start of a move phase.
   */
  public syncPhaseBeat(phaseIndex: number) {
    const normalizedPhase = ((phaseIndex % 4) + 4) % 4;
    const targetStep = normalizedPhase * 4; // 0 (Kick), 4 (Snare), 8 (Kick), 12 (Snare)
    this.currentStep = targetStep;
    if (this.isPlaying) {
      this.restartLoop();
    } else {
      this.notify(this.currentStep);
    }
  }

  public getCurrentGroove(): BeatGroove {
    return BEAT_GROOVES[this.currentGrooveIndex];
  }

  public getBpm(): number {
    return this.currentBpm;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public togglePlay(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public start() {
    if (!this.isPlaying) {
      this.play();
    }
  }

  public play() {
    this.getAudioContext();
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.isPlaying = true;
    this.currentStep = 0;
    this.scheduleNextTick();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.notify(this.currentStep);
  }

  private restartLoop() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.scheduleNextTick();
  }

  private scheduleNextTick() {
    if (!this.isPlaying) return;

    // 16th note duration = (60 / bpm) / 4 seconds
    const stepDurationMs = (60 / this.currentBpm / 4) * 1000;

    this.playStep(this.currentStep);
    this.notify(this.currentStep);

    this.currentStep = (this.currentStep + 1) % 16;
    this.timerId = window.setTimeout(() => {
      this.scheduleNextTick();
    }, stepDurationMs);
  }

  private playStep(step: number) {
    const ctx = this.getAudioContext();
    const time = ctx.currentTime;

    switch (this.currentGrooveIndex) {
      case 0:
        this.playOldschoolBoomBap(step, time);
        break;
      case 1:
        this.playSchoolFunk(step, time);
        break;
      case 2:
        this.playElectroBreak808(step, time);
        break;
      case 3:
      default:
        this.playTurboBattle(step, time);
        break;
    }
  }

  // 1) Олдскул Бум-Бэп (85 BPM): мягкий хип-хоп с глубокой бочкой, винтажным снейром и теплым басом
  private playOldschoolBoomBap(step: number, time: number) {
    // Deep boom-bap kick: beats 1 (step 0), 2-and-a, 3 (step 8)
    const kick = [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0];
    if (kick[step]) {
      this.triggerWarmKick(time, step === 0 ? 1.0 : 0.85);
    }

    // Crisp boom-bap snare on 4 and 12
    if (step === 4 || step === 12) {
      this.triggerSnare(time, 0.9, 170);
    }

    // Laid-back 8th-note hi-hats with open hat on step 14
    if (step % 2 === 0) {
      this.triggerHat(time, step === 14, 0.22);
    }

    // Warm deep sub-triangle bass groove (C minor pentatonic: C2=65.4, Eb2=77.8, F2=87.3, G2=98)
    const bass = [65.4, 0, 0, 65.4, 0, 0, 77.8, 0, 87.3, 0, 65.4, 0, 0, 98.0, 87.3, 0];
    if (bass[step] > 0) {
      this.triggerWarmBass(time, bass[step], 0.24);
    }

    // Warm electric piano chord on step 0 and step 8
    if (step === 0) {
      this.triggerRhodesChord(time, [261.63, 311.13, 392.0, 466.16]); // Cm7
    } else if (step === 8) {
      this.triggerRhodesChord(time, [233.08, 293.66, 349.23, 440.0]); // Bbmaj7
    }
  }

  // 2) Школьный Фанк (98 BPM): синкопированный брейк-бит с двойной бочкой, ковбеллом и фанк-басом
  private playSchoolFunk(step: number, time: number) {
    // Syncopated double-kick breakbeat with strong kicks on step 0 and step 8
    const kick = [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0];
    if (kick[step]) {
      this.triggerKick(time, step === 0 || step === 8 ? 1.0 : 0.82);
    }

    // Funky snare with main hits on 4 and 12
    const snare = [0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1];
    if (snare[step]) {
      const isMain = step === 4 || step === 12;
      this.triggerSnare(time, isMain ? 0.92 : 0.38, 225);
    }

    // Funky cowbell pattern (classic 80s/90s b-boy jam!)
    const cowbell = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0];
    if (cowbell[step]) {
      this.triggerCowbell(time, step % 4 === 0 ? 0.35 : 0.22);
    }

    // Tight 16th hats
    this.triggerHat(time, step === 2 || step === 10, 0.16);

    // Bouncy slap-funk bass riff (A minor funk: A1=55, C2=65.4, D2=73.4, E2=82.4, G2=98)
    const funkBass = [55, 0, 110, 0, 65.4, 0, 73.4, 82.4, 55, 0, 98, 0, 82.4, 73.4, 65.4, 55];
    if (funkBass[step] > 0) {
      this.triggerFunkBass(time, funkBass[step], 0.14);
    }

    // Funky brass hit on beat 1
    if (step === 0) {
      this.triggerBrassStab(time);
    }
  }

  // 3) Электро-Брейк 808 (110 BPM): длинный 808 суб-бас, быстрыми хай-хэты и синт-аккорды
  private playElectroBreak808(step: number, time: number) {
    // Booming 808 kick + pitched 808 sub-bass (with strong hit on steps 0 and 8)
    const sub808Notes = [51.9, 0, 0, 51.9, 0, 0, 61.7, 0, 51.9, 0, 58.3, 0, 0, 69.3, 0, 0]; // Ab1, B1, Bb1, C#2
    if (sub808Notes[step] > 0) {
      this.triggerSub808(time, sub808Notes[step], 0.38);
    }

    // Crispy electro clap + snare on 4 and 12, plus syncopated clap on 11
    if (step === 4 || step === 12) {
      this.triggerClap(time, 0.9);
      this.triggerSnare(time, 0.65, 250);
    } else if (step === 11) {
      this.triggerClap(time, 0.55);
    }

    // Fast electro hi-hat pattern with double-roll on step 7 and 15
    this.triggerHat(time, step === 6 || step === 14, 0.24);
    if (step === 7 || step === 15) {
      this.triggerHat(time + 0.06, false, 0.18);
    }

    // Planet Rock style electro synth chords
    if (step === 0 || step === 3 || step === 6 || step === 12) {
      const chordMap: Record<number, number[]> = {
        0: [311.13, 392.0, 466.16], // Eb major
        3: [311.13, 392.0, 466.16],
        6: [349.23, 440.0, 523.25], // F major
        12: [293.66, 369.99, 440.0] // D major
      };
      this.triggerElectroChord(time, chordMap[step]);
    }
  }

  // 4) Турбо-Баттл (122 BPM): скоростной боевой ритм с частыми снейрами, клэпами и энергичным лидом
  private playTurboBattle(step: number, time: number) {
    // Driving high-energy kick pattern
    const kick = [1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0];
    if (kick[step]) {
      this.triggerKick(time, 0.95);
    }

    // Frequent aggressive battle snares & claps (steps 4, 7, 9, 12, 14, 15)
    const snare = [0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1];
    if (snare[step]) {
      const isAccent = step === 4 || step === 12 || step === 14;
      this.triggerSnare(time, isAccent ? 0.95 : 0.65, 240);
      if (isAccent) {
        this.triggerClap(time, 0.8);
      }
    }

    // Driving open/closed hi-hats
    this.triggerHat(time, step % 4 === 2, 0.25);

    // Fast octave-jumping bassline (E minor battle: E2=82.4, G2=98, A2=110, B2=123.5)
    const battleBass = [82.4, 82.4, 164.8, 82.4, 98.0, 98.0, 110.0, 123.5, 82.4, 82.4, 164.8, 82.4, 123.5, 110.0, 98.0, 82.4];
    this.triggerFunkBass(time, battleBass[step], 0.11);

    // Energetic synth lead melody for the final battle!
    const leadMelody = [329.63, 0, 392.0, 440.0, 493.88, 0, 440.0, 392.0, 329.63, 0, 493.88, 587.33, 659.25, 0, 587.33, 493.88];
    if (leadMelody[step] > 0) {
      this.triggerBattleLead(time, leadMelody[step], 0.12);
    }
  }

  // --- Sound Synthesis Units ---

  private triggerWarmKick(time: number, velocity: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(125, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.16);

    gain.gain.setValueAtTime(velocity * 0.95, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.26);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.28);
  }

  private triggerKick(time: number, velocity: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);

    gain.gain.setValueAtTime(velocity * 0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.24);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.26);
  }

  private triggerSub808(time: number, subFreq: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(175, time);
    osc.frequency.exponentialRampToValueAtTime(subFreq, time + 0.06);

    gain.gain.setValueAtTime(0.95, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private triggerSnare(time: number, velocity: number = 0.9, bodyFreq: number = 210) {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.045));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(850, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(velocity * 0.7, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.16);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(bodyFreq, time);
    osc.frequency.exponentialRampToValueAtTime(110, time + 0.07);

    oscGain.gain.setValueAtTime(velocity * 0.45, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    noise.start(time);
    osc.start(time);
    noise.stop(time + 0.18);
    osc.stop(time + 0.1);
  }

  private triggerClap(time: number, velocity: number = 0.85) {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env =
        i < 400
          ? 1
          : i > 500 && i < 900
          ? 0.9
          : Math.exp(-(i - 900) / (this.ctx.sampleRate * 0.04));
      data[i] = (Math.random() * 2 - 1) * Math.max(0, env);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1400, time);
    bandpass.Q.setValueAtTime(1.8, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity * 0.65, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.2);
  }

  private triggerCowbell(time: number, velocity: number = 0.3) {
    if (!this.ctx || !this.masterGain) return;
    // Classic 808 Cowbell: two square oscillators at 540Hz and 800Hz through a bandpass filter
    const freqs = [540, 800];
    freqs.forEach((f) => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const gain = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(f, time);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(700, time);
      filter.Q.setValueAtTime(2.5, time);

      gain.gain.setValueAtTime(velocity * 0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(time);
      osc.stop(time + 0.12);
    });
  }

  private triggerHat(time: number, isOpen: boolean, level: number = 0.2) {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * (isOpen ? 0.22 : 0.05);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(9800, time);
    bandpass.Q.setValueAtTime(4, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isOpen ? level * 1.4 : level, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (isOpen ? 0.2 : 0.045));

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + (isOpen ? 0.22 : 0.05));
  }

  private triggerWarmBass(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, time);

    gain.gain.setValueAtTime(0.55, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private triggerFunkBass(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, time);
    filter.frequency.exponentialRampToValueAtTime(200, time + duration);
    filter.Q.setValueAtTime(4, time);

    gain.gain.setValueAtTime(0.32, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private triggerRhodesChord(time: number, freqs: number[]) {
    if (!this.ctx || !this.masterGain) return;

    freqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.07, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(time);
      osc.stop(time + 0.48);
    });
  }

  private triggerElectroChord(time: number, freqs: number[]) {
    if (!this.ctx || !this.masterGain) return;

    freqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, time);
      filter.frequency.exponentialRampToValueAtTime(400, time + 0.16);

      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(time);
      osc.stop(time + 0.2);
    });
  }

  private triggerBattleLead(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, time);

    gain.gain.setValueAtTime(0.11, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private triggerBrassStab(time: number) {
    if (!this.ctx || !this.masterGain) return;

    const freqs = [220, 261.63, 329.63, 392.0]; // Am7 stab chord
    freqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.075, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(time);
      osc.stop(time + 0.18);
    });
  }

  // --- UI Sound Effects ---

  // Отключен звук клика кнопок по требованию, чтобы не было раздражающих щелчков
  public playCassetteClick() {
    // no-op
  }

  public playSuccessFanfare() {
    const nowMs = Date.now();
    if (nowMs - this.lastFanfareAt < 800) {
      return;
    }
    this.lastFanfareAt = nowMs;

    const ctx = this.getAudioContext();
    const targetNode = this.masterGain || ctx.destination;
    const time = ctx.currentTime;
    const notes = [
      { f: 392.0, t: 0.0 }, // G4
      { f: 523.25, t: 0.12 }, // C5
      { f: 659.25, t: 0.24 }, // E5
      { f: 783.99, t: 0.38 } // G5
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, time + n.t);

      gain.gain.setValueAtTime(0, time + n.t);
      gain.gain.linearRampToValueAtTime(0.28, time + n.t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + n.t + 0.35);

      osc.connect(gain);
      gain.connect(targetNode);

      osc.start(time + n.t);
      osc.stop(time + n.t + 0.4);
    });
  }

  public playCountdownBeep(isFinal: boolean = false) {
    const ctx = this.getAudioContext();
    const targetNode = this.masterGain || ctx.destination;
    const time = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isFinal ? 880 : 440, time);

    gain.gain.setValueAtTime(0.32, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (isFinal ? 0.35 : 0.15));

    osc.connect(gain);
    gain.connect(targetNode);

    osc.start(time);
    osc.stop(time + (isFinal ? 0.35 : 0.15));
  }

  /**
   * Tonal rhythmic metronome woodblock click for 1-2-3-4 counting on the floor.
   * Accepts either a phase number (1, 2, 3, 4) or boolean isAccent.
   */
  public playMetronomeTick(phaseOrAccent: number | boolean = false) {
    const ctx = this.getAudioContext();
    const targetNode = this.masterGain || ctx.destination;
    const time = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    let startFreq = 860;
    let endFreq = 420;
    let level = 0.2;

    if (typeof phaseOrAccent === 'number') {
      const p = ((phaseOrAccent - 1) % 4) + 1;
      if (p === 1) {
        startFreq = 1220;
        endFreq = 610;
        level = 0.3;
      } else if (p === 2) {
        startFreq = 840;
        endFreq = 420;
        level = 0.2;
      } else if (p === 3) {
        startFreq = 980;
        endFreq = 490;
        level = 0.24;
      } else {
        startFreq = 760;
        endFreq = 380;
        level = 0.2;
      }
    } else if (phaseOrAccent) {
      startFreq = 1180;
      endFreq = 580;
      level = 0.28;
    }

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.05);

    gain.gain.setValueAtTime(level, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

    osc.connect(gain);
    gain.connect(targetNode);

    osc.start(time);
    osc.stop(time + 0.065);
  }
}

export const soundEngine = new SoundEngine();

