import React, { useEffect, useRef, useState } from 'react';
import { BreakMove } from '../../types';

interface BboySvgSimulatorProps {
  move: BreakMove;
  currentPhaseIndex?: number; // 0 to 3
  isPlaying: boolean;
  speed: number; // 0.25, 0.5, 1.0
  isMirrored: boolean;
  bpm?: number;
  phaseDurationMs?: number;
  onPhaseChange?: (phase: number) => void;
}

export interface ProjectedPhasePose {
  pelvis: [number, number];
  chest: [number, number];
  lHand: [number, number];
  rHand: [number, number];
  lFoot: [number, number];
  rFoot: [number, number];
  /** Optional explicit knee coordinates for moves with cross-over knee dips (e.g. kick-out) */
  lKnee?: [number, number];
  rKnee?: [number, number];
  /** Small anatomical knee offset in px (0 = straight leg, 3..6 = slight natural bend without crab splay) */
  kneeOffset?: [number, number];
  /** Small anatomical elbow offset in px (2..3 for floor support pillars, 4..7 for upper dance arms) */
  elbowOffset?: [number, number];
}

// Proportional 4-phase poses in 400x400 SVG space (Floor Y = 330, Center X = 200)
// Standing moves: tall full-height boy (chestY ≈ 146..156, pelvisY ≈ 216..226)
// Ground moves: 3/4 dynamic diagonal support (chest ≈ [204..210, 232..238], pelvis ≈ [178..186, 266..274])
// with vertical pillar arms (lHand=[175,330], rHand=[225,330]) and long expressive legs.
const MOVE_POSES: Record<string, [ProjectedPhasePose, ProjectedPhasePose, ProjectedPhasePose, ProjectedPhasePose]> = {
  // 1. square-steps (Шаги по квадрату — высокий стройный шаг по 4 углам квадрата)
  'square-steps': [
    // Фаза 1: Правая нога шагает вперед в угол №1 [248, 342]
    {
      pelvis: [206, 220],
      chest: [206, 150],
      lFoot: [164, 308],
      rFoot: [248, 342],
      lHand: [148, 192],
      rHand: [268, 184],
      kneeOffset: [-4, 4],
      elbowOffset: [-6, 6]
    },
    // Фаза 2: Левая нога шагает вперед в угол №2 [152, 342], обе ноги впереди, руки широко раскрыты
    {
      pelvis: [200, 224],
      chest: [200, 154],
      lFoot: [152, 342],
      rFoot: [248, 342],
      lHand: [118, 174],
      rHand: [282, 174],
      kneeOffset: [-4, 4],
      elbowOffset: [-5, 5]
    },
    // Фаза 3: Правая нога отшагивает назад в угол №3 [236, 308], руки скрещиваются у груди
    {
      pelvis: [194, 218],
      chest: [194, 148],
      lFoot: [152, 342],
      rFoot: [236, 308],
      lHand: [214, 188],
      rHand: [176, 188],
      kneeOffset: [-4, 4],
      elbowOffset: [-6, 6]
    },
    // Фаза 4: Левая нога отшагивает назад в угол №4 [164, 308], замыкая квадрат в полный рост
    {
      pelvis: [200, 214],
      chest: [200, 144],
      lFoot: [164, 308],
      rFoot: [236, 308],
      lHand: [168, 192],
      rHand: [232, 192],
      kneeOffset: [-3, 3],
      elbowOffset: [-5, 5]
    }
  ],

  // 2. lunges-toprock (Выпады — высокий подскок и широкие выпады без раскоряки)
  'lunges-toprock': [
    // Фаза 1: Высокий подскок-замах в центре
    {
      pelvis: [200, 214],
      chest: [200, 144],
      lFoot: [182, 322],
      rFoot: [218, 322],
      lHand: [216, 184],
      rHand: [184, 184],
      kneeOffset: [-3, 3],
      elbowOffset: [-6, 6]
    },
    // Фаза 2: Широкий атлетичный выпад вправо, руки широко раскрыты
    {
      pelvis: [226, 232],
      chest: [220, 162],
      lFoot: [152, 328],
      rFoot: [288, 334],
      lHand: [122, 174],
      rHand: [302, 166],
      kneeOffset: [0, 6],
      elbowOffset: [-5, 5]
    },
    // Фаза 3: Упругий возврат в полный рост в центре
    {
      pelvis: [200, 218],
      chest: [200, 148],
      lFoot: [176, 330],
      rFoot: [224, 330],
      lHand: [216, 186],
      rHand: [184, 186],
      kneeOffset: [-3, 3],
      elbowOffset: [-6, 6]
    },
    // Фаза 4: Широкий атлетичный выпад влево, руки широко раскрыты
    {
      pelvis: [174, 232],
      chest: [180, 162],
      lFoot: [112, 334],
      rFoot: [248, 328],
      lHand: [98, 166],
      rHand: [278, 174],
      kneeOffset: [-6, 0],
      elbowOffset: [-5, 5]
    }
  ],

  // 3. kick-step (КИК — высокий стройный выброс прямой ноги вперед + прыжковая смена)
  'kick-step': [
    // Фаза 1: Хлесткий прямой КИК правой ногой вперед-вверх
    {
      pelvis: [194, 218],
      chest: [188, 148],
      lFoot: [178, 330],
      rFoot: [294, 238],
      lHand: [174, 184],
      rHand: [216, 184],
      kneeOffset: [-3, 0],
      elbowOffset: [-6, 6]
    },
    // Фаза 2: Прыжковая смена ног, руки широко раскрываются
    {
      pelvis: [206, 222],
      chest: [208, 152],
      lFoot: [138, 322],
      rFoot: [216, 332],
      lHand: [118, 170],
      rHand: [288, 170],
      kneeOffset: [-4, 4],
      elbowOffset: [-5, 5]
    },
    // Фаза 3: Хлесткий прямой КИК левой ногой вперед-вверх
    {
      pelvis: [206, 218],
      chest: [212, 148],
      lFoot: [106, 238],
      rFoot: [222, 330],
      lHand: [184, 184],
      rHand: [226, 184],
      kneeOffset: [0, 3],
      elbowOffset: [-6, 6]
    },
    // Фаза 4: Прыжковый сбор в высокую стойку
    {
      pelvis: [200, 218],
      chest: [200, 148],
      lFoot: [172, 330],
      rFoot: [228, 330],
      lHand: [136, 178],
      rHand: [264, 178],
      kneeOffset: [-3, 3],
      elbowOffset: [-5, 5]
    }
  ],

  // 4. kick-out (Кик аут от Никиты: выстрел одной прямой ногой вперед + перекидывание согнутой ноги крест-накрест коленкой к земле)
  'kick-out': [
    // Фаза 1: Руки опираются на пол, левая нога вытянута прямой вперед по центру, правая согнута в колене сбоку
    {
      pelvis: [194, 268],
      chest: [200, 232],
      lHand: [162, 330],
      rHand: [238, 330],
      lFoot: [192, 350],
      rFoot: [248, 326],
      lKnee: [188, 310],
      rKnee: [244, 292],
      kneeOffset: [0, 5],
      elbowOffset: [-2.5, 2.5]
    },
    // Фаза 2: Левая нога остается прямой впереди, согнутая правая перекидывается крест-накрест поверх неё коленкой к земле!
    {
      pelvis: [188, 270],
      chest: [198, 234],
      lHand: [162, 330],
      rHand: [238, 330],
      lFoot: [196, 350],
      rFoot: [148, 324],
      lKnee: [190, 310],
      rKnee: [176, 332],
      kneeOffset: [0, -5],
      elbowOffset: [-2.5, 2.5]
    },
    // Фаза 3: Смена ног — правая нога выстреливает прямой вперед по центру, левая согнута в колене сбоку
    {
      pelvis: [206, 268],
      chest: [200, 232],
      lHand: [162, 330],
      rHand: [238, 330],
      lFoot: [152, 326],
      rFoot: [208, 350],
      lKnee: [156, 292],
      rKnee: [212, 310],
      kneeOffset: [-5, 0],
      elbowOffset: [-2.5, 2.5]
    },
    // Фаза 4: Правая нога остается прямой впереди, согнутая левая перекидывается крест-накрест поверх неё коленкой к земле!
    {
      pelvis: [212, 270],
      chest: [202, 234],
      lHand: [162, 330],
      rHand: [238, 330],
      lFoot: [252, 324],
      rFoot: [204, 350],
      lKnee: [224, 332],
      rKnee: [210, 310],
      kneeOffset: [5, 0],
      elbowOffset: [-2.5, 2.5]
    }
  ],

  // 5. go-down (Переход вниз — плавный спуск из высокой стойки в диагональный партер 3/4)
  'go-down': [
    // Фаза 1: Скрещивание ног штопором стоя
    {
      pelvis: [200, 228],
      chest: [204, 160],
      lFoot: [186, 330],
      rFoot: [214, 324],
      lHand: [154, 206],
      rHand: [244, 232],
      kneeOffset: [-4, 4],
      elbowOffset: [-5, 5]
    },
    // Фаза 2: Мягкий спуск и постановка правой руки вертикально в пол
    {
      pelvis: [186, 262],
      chest: [210, 228],
      lFoot: [154, 330],
      rFoot: [192, 328],
      lHand: [156, 268],
      rHand: [225, 330],
      kneeOffset: [-5, 4],
      elbowOffset: [-4, 2.5]
    },
    // Фаза 3: Обе руки стоят прямыми колоннами в пол, таз сбоку в ракурсе 3/4
    {
      pelvis: [180, 270],
      chest: [204, 235],
      lFoot: [134, 328],
      rFoot: [252, 328],
      lHand: [175, 330],
      rHand: [225, 330],
      kneeOffset: [-4, 4],
      elbowOffset: [-2.5, 2.5]
    },
    // Фаза 4: Чистый упор би-боя в партере 3/4
    {
      pelvis: [182, 268],
      chest: [204, 234],
      lFoot: [142, 330],
      rFoot: [254, 330],
      lHand: [175, 330],
      rHand: [225, 330],
      kneeOffset: [-4, 4],
      elbowOffset: [-2.5, 2.5]
    }
  ],

  // 6. dorozhka (Дорожка / 6-Step — круговые шаги вокруг прямых опорных рук в ракурсе 3/4)
  'dorozhka': [
    // Фаза 1: Крюк правой ногой вперед вокруг левой опорной руки
    {
      pelvis: [180, 268],
      chest: [202, 234],
      lHand: [175, 330],
      rHand: [238, 286],
      lFoot: [248, 318],
      rFoot: [138, 342],
      kneeOffset: [4, -4],
      elbowOffset: [-2.5, 5]
    },
    // Фаза 2: Передний скрестный шаг («крабик» спереди), обе руки за спиной в пол
    {
      pelvis: [186, 270],
      chest: [204, 236],
      lHand: [175, 330],
      rHand: [225, 330],
      lFoot: [182, 342],
      rFoot: [216, 344],
      kneeOffset: [-4, 4],
      elbowOffset: [-2.5, 2.5]
    },
    // Фаза 3: Выход правой ногой широкой дугой вправо-назад
    {
      pelvis: [184, 268],
      chest: [206, 234],
      lHand: [160, 286],
      rHand: [225, 330],
      lFoot: [152, 338],
      rFoot: [292, 318],
      kneeOffset: [-4, 3],
      elbowOffset: [-5, 2.5]
    },
    // Фаза 4: Широкий упор в ракурсе 3/4 на прямых руках
    {
      pelvis: [180, 268],
      chest: [204, 234],
      lHand: [175, 330],
      rHand: [225, 330],
      lFoot: [136, 326],
      rFoot: [262, 326],
      kneeOffset: [-4, 4],
      elbowOffset: [-2.5, 2.5]
    }
  ],

  // 7. three-step (3 степ — быстрая смена ног и рук в ракурсе 3/4)
  'three-step': [
    // Фаза 1: Шаг 1 — Зацеп правой ногой вперед-влево на левой опорной руке
    {
      pelvis: [180, 268],
      chest: [200, 234],
      lHand: [175, 330],
      rHand: [246, 280],
      lFoot: [238, 326],
      rFoot: [116, 338],
      kneeOffset: [4, -3],
      elbowOffset: [-2.5, 5]
    },
    // Фаза 2: Шаг 2 — Взрывной переброс левой ноги вперед-вправо на правой руке
    {
      pelvis: [188, 264],
      chest: [208, 232],
      lHand: [154, 280],
      rHand: [225, 330],
      lFoot: [286, 338],
      rFoot: [164, 324],
      kneeOffset: [3, -4],
      elbowOffset: [-5, 2.5]
    },
    // Фаза 3: Шаг 3 — Широкий треугольник опоры на обеих прямых руках
    {
      pelvis: [182, 266],
      chest: [204, 232],
      lHand: [175, 330],
      rHand: [225, 330],
      lFoot: [122, 328],
      rFoot: [278, 328],
      kneeOffset: [-3, 3],
      elbowOffset: [-2.5, 2.5]
    },
    // Фаза 4: Пружина в партере 3/4 под бит
    {
      pelvis: [182, 268],
      chest: [204, 234],
      lHand: [175, 330],
      rHand: [225, 330],
      lFoot: [146, 330],
      rFoot: [252, 330],
      kneeOffset: [-4, 4],
      elbowOffset: [-2.5, 2.5]
    }
  ],

  // 8. storm-sweep (Шторм — широкий круговой мах идеально прямой ногой + перепрыжка)
  'storm-sweep': [
    // Фаза 1: Замах длинной прямой правой ногой далеко влево
    {
      pelvis: [180, 268],
      chest: [202, 234],
      lHand: [175, 330],
      rHand: [225, 330],
      lFoot: [224, 330],
      rFoot: [82, 324],
      kneeOffset: [4, 0],
      elbowOffset: [-2.5, 2.5]
    },
    // Фаза 2: Пронос прямой правой ноги спереди под поднятой левой рукой
    {
      pelvis: [184, 268],
      chest: [206, 234],
      lHand: [154, 278],
      rHand: [225, 330],
      lFoot: [222, 326],
      rFoot: [202, 346],
      kneeOffset: [4, 0],
      elbowOffset: [-5, 2.5]
    },
    // Фаза 3: Перепрыжка! Вес на прямых руках в полу, правая нога летит вправо, левая высоко подпрыгнула
    {
      pelvis: [184, 252],
      chest: [204, 224],
      lHand: [175, 330],
      rHand: [225, 330],
      lFoot: [154, 268],
      rFoot: [316, 320],
      kneeOffset: [-5, 0],
      elbowOffset: [-2, 2]
    },
    // Фаза 4: Финиш круга в партере 3/4
    {
      pelvis: [182, 268],
      chest: [204, 234],
      lHand: [175, 330],
      rHand: [225, 330],
      lFoot: [144, 330],
      rFoot: [256, 330],
      kneeOffset: [-4, 4],
      elbowOffset: [-2.5, 2.5]
    }
  ],

  // 9. shadn-step (Шадн степ — боковая скрутка и высокий прыжок со сменой ног в ракурсе 3/4)
  'shadn-step': [
    // Фаза 1: Заряд ног слева с опорой на прямую правую руку
    {
      pelvis: [172, 268],
      chest: [198, 234],
      lHand: [150, 268],
      rHand: [225, 330],
      lFoot: [102, 330],
      rFoot: [134, 334],
      kneeOffset: [-4, -4],
      elbowOffset: [-5, 2.5]
    },
    // Фаза 2: Высокий прыжок на прямых руках, ноги меняются местами в воздухе!
    {
      pelvis: [192, 240],
      chest: [204, 216],
      lHand: [175, 330],
      rHand: [225, 330],
      lFoot: [242, 262],
      rFoot: [158, 262],
      kneeOffset: [4, -4],
      elbowOffset: [-2, 2]
    },
    // Фаза 3: Приземление ног справа с опорой на прямую левую руку
    {
      pelvis: [216, 268],
      chest: [196, 234],
      lHand: [175, 330],
      rHand: [250, 268],
      lFoot: [266, 334],
      rFoot: [298, 330],
      kneeOffset: [4, 4],
      elbowOffset: [-2.5, 5]
    },
    // Фаза 4: Возврат в диагональный партер 3/4
    {
      pelvis: [182, 268],
      chest: [204, 234],
      lHand: [175, 330],
      rHand: [225, 330],
      lFoot: [146, 330],
      rFoot: [254, 330],
      kneeOffset: [-4, 4],
      elbowOffset: [-2.5, 2.5]
    }
  ],

  // 10. arrows-footwork (Стрелки — идеально прямые прострелы ногами в упоре на руках 3/4)
  'arrows-footwork': [
    // Фаза 1: Острая прямая стрела правой ногой далеко вправо
    {
      pelvis: [182, 268],
      chest: [204, 234],
      lHand: [175, 330],
      rHand: [225, 330],
      lFoot: [164, 330],
      rFoot: [318, 324],
      kneeOffset: [-4, 0],
      elbowOffset: [-2.5, 2.5]
    },
    // Фаза 2: Компактная перезарядка под корпусом в ракурсе 3/4
    {
      pelvis: [182, 266],
      chest: [204, 232],
      lHand: [175, 330],
      rHand: [225, 330],
      lFoot: [168, 330],
      rFoot: [204, 330],
      kneeOffset: [-4, 4],
      elbowOffset: [-2.5, 2.5]
    },
    // Фаза 3: Острая прямая стрела левой ногой далеко влево
    {
      pelvis: [186, 268],
      chest: [204, 234],
      lHand: [175, 330],
      rHand: [225, 330],
      lFoot: [82, 324],
      rFoot: [220, 330],
      kneeOffset: [0, 4],
      elbowOffset: [-2.5, 2.5]
    },
    // Фаза 4: Двойная победная V-стрелка обеими прямыми ногами!
    {
      pelvis: [184, 266],
      chest: [204, 232],
      lHand: [175, 330],
      rHand: [225, 330],
      lFoot: [94, 324],
      rFoot: [308, 324],
      kneeOffset: [0, 0],
      elbowOffset: [-2.5, 2.5]
    }
  ]
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPoint(pA: [number, number], pB: [number, number], t: number): [number, number] {
  return [lerp(pA[0], pB[0], t), lerp(pA[1], pB[1], t)];
}

function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Projective mid-joint computation with 3D foreshortening (NO crab-leg lateral bulging!).
 * Keeps the knee/elbow right along the natural limb axis with a subtle anatomical offset (max 0..7px).
 */
function computeProjectedJoint(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  offsetPx: number
): { jointX: number; jointY: number } {
  const dx = endX - startX;
  const dy = endY - startY;
  const len = Math.max(1, Math.hypot(dx, dy));
  const midX = startX + dx * 0.5;
  const midY = startY + dy * 0.5;
  // Perpendicular normal
  const nx = -dy / len;
  const ny = dx / len;
  return {
    jointX: midX + nx * offsetPx,
    jointY: Math.min(Math.max(endY - 6, 318), midY + ny * offsetPx)
  };
}

/**
 * Builds a tapered limb polygon string between (x1, y1) and (x2, y2) with startWidth and endWidth.
 */
function buildTaperedSegmentPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  w1: number,
  w2: number
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;
  const p1x = x1 + nx * (w1 * 0.5);
  const p1y = y1 + ny * (w1 * 0.5);
  const p2x = x2 + nx * (w2 * 0.5);
  const p2y = y2 + ny * (w2 * 0.5);
  const p3x = x2 - nx * (w2 * 0.5);
  const p3y = y2 - ny * (w2 * 0.5);
  const p4x = x1 - nx * (w1 * 0.5);
  const p4y = y1 - ny * (w1 * 0.5);
  return `${p1x.toFixed(1)},${p1y.toFixed(1)} ${p2x.toFixed(1)},${p2y.toFixed(1)} ${p3x.toFixed(1)},${p3y.toFixed(1)} ${p4x.toFixed(1)},${p4y.toFixed(1)}`;
}

const SQUARE_CORNERS: Array<{ num: number; x: number; y: number; label: string }> = [
  { num: 1, x: 248, y: 342, label: '1' },
  { num: 2, x: 152, y: 342, label: '2' },
  { num: 3, x: 236, y: 308, label: '3' },
  { num: 4, x: 164, y: 308, label: '4' }
];

const CIRCULAR_MOVES = new Set(['dorozhka', 'three-step', 'storm-sweep']);

export const BboySvgSimulator: React.FC<BboySvgSimulatorProps> = ({
  move,
  currentPhaseIndex,
  isPlaying,
  speed,
  isMirrored,
  bpm,
  phaseDurationMs,
  onPhaseChange
}) => {
  const [animProgress, setAnimProgress] = useState(0);
  const progressRef = useRef<number>(0);
  const reqIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const onPhaseChangeRef = useRef(onPhaseChange);

  useEffect(() => {
    onPhaseChangeRef.current = onPhaseChange;
  }, [onPhaseChange]);

  useEffect(() => {
    progressRef.current = 0;
    setAnimProgress(0);
  }, [move.id]);

  const baseBpm = bpm ?? move.rhythmConfig?.defaultBpm ?? move.bpmRange[0] ?? 98;
  const beatsPerPhase = move.rhythmConfig?.beatsPerPhase ?? 1;
  const singlePhaseMs =
    phaseDurationMs ?? ((60 / baseBpm) * 1000 * beatsPerPhase) / (speed || 1);
  const loopDurationMs = singlePhaseMs * 4;

  useEffect(() => {
    if (currentPhaseIndex !== undefined) {
      progressRef.current = currentPhaseIndex;
      setAnimProgress(currentPhaseIndex);
      return;
    }

    if (!isPlaying) {
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      const prev = progressRef.current;
      const next = (prev + (dt / loopDurationMs) * 4) % 4;
      progressRef.current = next;

      setAnimProgress(next);

      const prevPhaseInt = Math.floor(prev);
      const nextPhaseInt = Math.floor(next);
      if (onPhaseChangeRef.current && prevPhaseInt !== nextPhaseInt) {
        onPhaseChangeRef.current(nextPhaseInt);
      }

      reqIdRef.current = requestAnimationFrame(loop);
    };

    reqIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (reqIdRef.current !== null) {
        cancelAnimationFrame(reqIdRef.current);
      }
    };
  }, [isPlaying, loopDurationMs, currentPhaseIndex, speed, bpm]);

  const phases = MOVE_POSES[move.id] || MOVE_POSES['square-steps'];
  const phaseFloat = currentPhaseIndex !== undefined ? currentPhaseIndex : animProgress;
  const idxA = Math.floor(phaseFloat) % 4;
  const idxB = (idxA + 1) % 4;
  const rawT = currentPhaseIndex !== undefined ? 0 : phaseFloat - idxA;
  const t = smoothStep(rawT);

  const phaseA = phases[idxA] || phases[0];
  const phaseB = phases[idxB] || phases[0];

  const [pelvisX, pelvisY] = lerpPoint(phaseA.pelvis, phaseB.pelvis, t);
  const [chestX, chestY] = lerpPoint(phaseA.chest, phaseB.chest, t);
  const [lHandX, lHandY] = lerpPoint(phaseA.lHand, phaseB.lHand, t);
  const [rHandX, rHandY] = lerpPoint(phaseA.rHand, phaseB.rHand, t);
  const [lFootX, lFootY] = lerpPoint(phaseA.lFoot, phaseB.lFoot, t);
  const [rFootX, rFootY] = lerpPoint(phaseA.rFoot, phaseB.rFoot, t);

  const lKneeOffset = lerp(phaseA.kneeOffset?.[0] ?? -4, phaseB.kneeOffset?.[0] ?? -4, t);
  const rKneeOffset = lerp(phaseA.kneeOffset?.[1] ?? 4, phaseB.kneeOffset?.[1] ?? 4, t);
  const lElbowOffset = lerp(phaseA.elbowOffset?.[0] ?? -4, phaseB.elbowOffset?.[0] ?? -4, t);
  const rElbowOffset = lerp(phaseA.elbowOffset?.[1] ?? 4, phaseB.elbowOffset?.[1] ?? 4, t);

  const isParter = pelvisY >= 250;

  // Spine & shoulder orientation
  const spineDx = chestX - pelvisX;
  const spineDy = chestY - pelvisY;
  const torsoAngleDeg = (Math.atan2(spineDy, spineDx) * 180) / Math.PI + 90;
  // Clamp shoulder tilt so hoodie shoulders stay natural even in 3/4 diagonal parter
  const shoulderTiltDeg = Math.max(-18, Math.min(18, torsoAngleDeg * 0.35));
  const shoulderTiltRad = (shoulderTiltDeg * Math.PI) / 180;

  // 1. REAL PROPORTIONAL ANATOMY: Broad Hoodie Shoulders (46px total, ±23px) & Waist/Hips (28px total, ±14px)
  const lShoulderX = chestX - 23 * Math.cos(shoulderTiltRad);
  const lShoulderY = chestY + 2 - 23 * Math.sin(shoulderTiltRad);
  const rShoulderX = chestX + 23 * Math.cos(shoulderTiltRad);
  const rShoulderY = chestY + 2 + 23 * Math.sin(shoulderTiltRad);

  const lWaistX = pelvisX - 16;
  const lWaistY = pelvisY - 2;
  const rWaistX = pelvisX + 16;
  const rWaistY = pelvisY - 2;

  const lHipX = pelvisX - 13;
  const lHipY = pelvisY + 4;
  const rHipX = pelvisX + 13;
  const rHipY = pelvisY + 4;

  // Head & Neck position above chest
  const neckBaseX = chestX;
  const neckBaseY = chestY - 4;
  const headX = chestX + (isParter ? 4 : spineDx * 0.18);
  const headY = chestY - (isParter ? 27 : 30);

  // 2. PROJECTED JOINTS (3D foreshortened — NO crab-claw lateral splay, plus explicit knee targets for kick-out)
  const leftArmJoint = computeProjectedJoint(lShoulderX, lShoulderY, lHandX, lHandY, lElbowOffset);
  const rightArmJoint = computeProjectedJoint(rShoulderX, rShoulderY, rHandX, rHandY, rElbowOffset);

  const defaultLeftLegJoint = computeProjectedJoint(lHipX, lHipY, lFootX, lFootY, lKneeOffset);
  const defaultRightLegJoint = computeProjectedJoint(rHipX, rHipY, rFootX, rFootY, rKneeOffset);

  const lElbowX = leftArmJoint.jointX;
  const lElbowY = leftArmJoint.jointY;
  const rElbowX = rightArmJoint.jointX;
  const rElbowY = rightArmJoint.jointY;

  const [lKneeX, lKneeY] =
    phaseA.lKnee && phaseB.lKnee
      ? lerpPoint(phaseA.lKnee, phaseB.lKnee, t)
      : [defaultLeftLegJoint.jointX, defaultLeftLegJoint.jointY];

  const [rKneeX, rKneeY] =
    phaseA.rKnee && phaseB.rKnee
      ? lerpPoint(phaseA.rKnee, phaseB.rKnee, t)
      : [defaultRightLegJoint.jointX, defaultRightLegJoint.jointY];

  // Detect active palm support on the floor (handY >= 322)
  const isLeftHandOnFloor = lHandY >= 322;
  const isRightHandOnFloor = rHandY >= 322;

  // Dynamic sneaker rotation aligned with shin angle
  const lShinDeg = (Math.atan2(lFootY - lKneeY, lFootX - lKneeX) * 180) / Math.PI - 90;
  const rShinDeg = (Math.atan2(rFootY - rKneeY, rFootX - rKneeX) * 180) / Math.PI - 90;
  const lSneakerRot =
    lFootY >= 316
      ? Math.max(-14, Math.min(14, lShinDeg * 0.18))
      : Math.max(-42, Math.min(42, lShinDeg * 0.55));
  const rSneakerRot =
    rFootY >= 316
      ? Math.max(-14, Math.min(14, rShinDeg * 0.18))
      : Math.max(-42, Math.min(42, rShinDeg * 0.55));

  const isRightLegInFront =
    move.id === 'kick-out'
      ? phaseFloat < 2
      : rFootY > lFootY + 6 || rFootX < lFootX - 6 || rFootY < lFootY - 18;

  const activePhaseNum = idxA + 1;

  // Render a stylized cartoon jogger leg with white side stripe, ribbed ankle cuff, and detailed sneaker
  const renderLeg = (side: 'left' | 'right') => {
    const isLeft = side === 'left';
    const hipX = isLeft ? lHipX : rHipX;
    const hipY = isLeft ? lHipY : rHipY;
    const kneeX = isLeft ? lKneeX : rKneeX;
    const kneeY = isLeft ? lKneeY : rKneeY;
    const footX = isLeft ? lFootX : rFootX;
    const footY = isLeft ? lFootY : rFootY;
    const sneakerRot = isLeft ? lSneakerRot : rSneakerRot;

    const pantsFill = isLeft ? '#2563eb' : '#1d4ed8';
    const sneakerColor = isLeft ? '#00E5FF' : '#FF4D00';

    const thighPts = buildTaperedSegmentPoints(hipX, hipY, kneeX, kneeY, 22, 18);
    const shinPts = buildTaperedSegmentPoints(kneeX, kneeY, footX, footY - 4, 18, 13);

    return (
      <g key={`${side}-leg`}>
        {/* Thigh Jogger Segment */}
        <polygon
          points={thighPts}
          fill={pantsFill}
          stroke="#000000"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        {/* Shin Jogger Segment */}
        <polygon
          points={shinPts}
          fill={pantsFill}
          stroke="#000000"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        {/* Smooth Knee Joint Patch */}
        <circle cx={kneeX} cy={kneeY} r="8.5" fill={pantsFill} stroke="#000000" strokeWidth="2.8" />
        {/* Tracksuit White Side Stripe (Лампас) */}
        <line
          x1={hipX}
          y1={hipY + 3}
          x2={kneeX}
          y2={kneeY}
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        <line
          x1={kneeX}
          y1={kneeY}
          x2={footX}
          y2={footY - 6}
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* Ribbed Jogger Ankle Cuff */}
        <ellipse
          cx={footX}
          cy={footY - 5}
          rx="7.5"
          ry="4"
          fill="#111827"
          stroke="#000000"
          strokeWidth="2.2"
        />

        {/* Detailed Cartoon High-Top B-Boy Sneaker */}
        <g transform={`translate(${footX}, ${footY}) rotate(${sneakerRot})`}>
          {/* Sneaker upper body */}
          <path
            d="M -15 -8 L 6 -8 C 14 -8, 18 -2, 18 4 L -15 4 Z"
            fill={sneakerColor}
            stroke="#000000"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          {/* White toe cap */}
          <path
            d="M 8 -5 C 14 -5, 18 -1, 18 4 L 8 4 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="2"
          />
          {/* Sneaker laces */}
          <line x1="-3" y1="-6" x2="3" y2="-4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="-1" y1="-3" x2="5" y2="-1" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          {/* Thick white street rubber sole */}
          <rect
            x="-17"
            y="3"
            width="36"
            height="6"
            rx="3"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="2.5"
          />
        </g>
      </g>
    );
  };

  // Render a stylized hoodie sleeve + forearm + cartoon hand
  const renderArm = (side: 'left' | 'right') => {
    const isLeft = side === 'left';
    const shX = isLeft ? lShoulderX : rShoulderX;
    const shY = isLeft ? lShoulderY : rShoulderY;
    const elX = isLeft ? lElbowX : rElbowX;
    const elY = isLeft ? lElbowY : rElbowY;
    const hdX = isLeft ? lHandX : rHandX;
    const hdY = isLeft ? lHandY : rHandY;
    const onFloor = isLeft ? isLeftHandOnFloor : isRightHandOnFloor;

    const upperSleevePts = buildTaperedSegmentPoints(shX, shY, elX, elY, 15, 12.5);
    const forearmPts = buildTaperedSegmentPoints(elX, elY, hdX, hdY, 12, 9.5);
    const wristbandColor = isLeft ? '#00E676' : '#FF4D00';

    return (
      <g key={`${side}-arm`}>
        {/* Hoodie Upper Sleeve */}
        <polygon
          points={upperSleevePts}
          fill="#FFE600"
          stroke="#000000"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Hoodie Lower Sleeve / Forearm */}
        <polygon
          points={forearmPts}
          fill="#FFE600"
          stroke="#000000"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Elbow Joint */}
        <circle cx={elX} cy={elY} r="6" fill="#FFE600" stroke="#000000" strokeWidth="2.5" />
        {/* Street Sweatband at Wrist */}
        <circle
          cx={elX * 0.22 + hdX * 0.78}
          cy={elY * 0.22 + hdY * 0.78}
          r="5.5"
          fill={wristbandColor}
          stroke="#000000"
          strokeWidth="2"
        />
        {/* Cartoon Palm / Hand */}
        {onFloor ? (
          /* Flat Supporting Palm on the Floor */
          <ellipse
            cx={hdX}
            cy={hdY}
            rx="10"
            ry="5.5"
            fill="#fbd38d"
            stroke="#000000"
            strokeWidth="2.6"
          />
        ) : (
          /* Expressive B-Boy Hand / Fist with Thumb */
          <g transform={`translate(${hdX}, ${hdY})`}>
            <circle cx="0" cy="0" r="7.5" fill="#fbd38d" stroke="#000000" strokeWidth="2.6" />
            <circle cx={isLeft ? 4 : -4} cy="-2" r="3.2" fill="#fbd38d" stroke="#000000" strokeWidth="2" />
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="relative w-full h-full min-h-[340px] flex items-center justify-center bg-[#151515] rounded-lg overflow-hidden border-3 border-black select-none">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full max-h-[460px]"
        style={{
          transform: isMirrored ? 'scaleX(-1)' : 'none',
          transition: 'transform 0.2s ease'
        }}
      >
        <defs>
          <radialGradient id="floorGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#252525" />
            <stop offset="70%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#121212" />
          </radialGradient>
          <radialGradient id="palmGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE600" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#FFE600" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFE600" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Dance Ring / Cypher Circle */}
        <circle
          cx="200"
          cy="326"
          r="150"
          fill="url(#floorGrad)"
          stroke="#333"
          strokeWidth="3"
          strokeDasharray="6 4"
        />
        <ellipse cx="200" cy="330" rx="124" ry="24" fill="#000000" opacity="0.45" />

        {/* Standard floor crosslines */}
        <line
          x1="200"
          y1="215"
          x2="200"
          y2="385"
          stroke="#FFE600"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.35"
        />
        <line
          x1="65"
          y1="330"
          x2="335"
          y2="330"
          stroke="#FFE600"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.45"
        />

        {/* DYNAMIC FLOOR GUIDE FOR "square-steps": Perspective Yellow Square with 4 Numbered Corners */}
        {move.id === 'square-steps' && (
          <g>
            <polygon
              points="248,342 152,342 164,308 236,308"
              fill="#FFE600"
              fillOpacity="0.12"
              stroke="#FFE600"
              strokeWidth="2.5"
              strokeDasharray="5 3"
            />
            {SQUARE_CORNERS.map((corner) => {
              const isCurrentCorner = activePhaseNum === corner.num;
              return (
                <g key={corner.num} transform={`translate(${corner.x}, ${corner.y})`}>
                  <circle
                    cx="0"
                    cy="0"
                    r={isCurrentCorner ? 12 : 9}
                    fill={isCurrentCorner ? '#FF4D00' : '#FFE600'}
                    stroke="#000"
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={isCurrentCorner ? '#FFFFFF' : '#000000'}
                    fontSize="11"
                    fontFamily="Rubik Mono One, sans-serif"
                  >
                    {corner.label}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* DYNAMIC FLOOR GUIDE FOR CIRCULAR FOOTWORK ("dorozhka", "three-step", "storm-sweep") */}
        {CIRCULAR_MOVES.has(move.id) && (
          <g>
            <ellipse
              cx="200"
              cy="332"
              rx="105"
              ry="22"
              fill="none"
              stroke="#00E5FF"
              strokeWidth="2.5"
              strokeDasharray="7 5"
              opacity="0.8"
            />
            <polygon points="206,354 194,349 194,359" fill="#00E5FF" stroke="#000" strokeWidth="1" />
            <polygon points="194,310 206,305 206,315" fill="#00E5FF" stroke="#000" strokeWidth="1" />
          </g>
        )}

        {/* Dynamic Shadow underneath Nikita */}
        <ellipse
          cx={(pelvisX + chestX) * 0.5}
          cy={334}
          rx={isParter ? 76 : 56}
          ry={11}
          fill="#000000"
          opacity="0.6"
        />

        {/* Glowing Yellow Floor Support Rings under Palms when handY >= 322 */}
        {isLeftHandOnFloor && (
          <g>
            <ellipse cx={lHandX} cy={lHandY + 4} rx="25" ry="10" fill="url(#palmGlow)" />
            <ellipse
              cx={lHandX}
              cy={lHandY + 4}
              rx="17"
              ry="6.5"
              fill="#FFE600"
              stroke="#000"
              strokeWidth="2.5"
            />
          </g>
        )}
        {isRightHandOnFloor && (
          <g>
            <ellipse cx={rHandX} cy={rHandY + 4} rx="25" ry="10" fill="url(#palmGlow)" />
            <ellipse
              cx={rHandX}
              cy={rHandY + 4}
              rx="17"
              ry="6.5"
              fill="#FFE600"
              stroke="#000"
              strokeWidth="2.5"
            />
          </g>
        )}

        {/* Character Group: Stylized Cartoon B-Boy Boy */}
        <g id="nikita-bboy-rig">
          {/* In standing Toprock, draw back leg behind torso */}
          {!isParter && (isRightLegInFront ? renderLeg('left') : renderLeg('right'))}

          {/* Rounded Pelvis / Shorts Block uniting both hips */}
          <path
            d={`M ${lWaistX - 2} ${lWaistY}
                L ${rWaistX + 2} ${rWaistY}
                Q ${rHipX + 6} ${rHipY + 12}, ${pelvisX} ${pelvisY + 13}
                Q ${lHipX - 6} ${lHipY + 12}, ${lWaistX - 2} ${lWaistY} Z`}
            fill="#1e3a8a"
            stroke="#000000"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />

          {/* Right Arm (drawn behind or alongside hoodie) */}
          {renderArm('right')}

          {/* Stylized Street Hoodie Torso (<path> with 46px shoulders, 32px waist, collar/hood, kangaroo pocket & print) */}
          <g>
            {/* Hoodie Back Hood Cushion around neck */}
            <ellipse
              cx={chestX}
              cy={chestY - 3}
              rx="18"
              ry="8"
              fill="#FF4D00"
              stroke="#000000"
              strokeWidth="3"
            />

            {/* Main Hoodie Body */}
            <path
              d={`M ${lShoulderX} ${lShoulderY - 4}
                  Q ${chestX} ${chestY - 10}, ${rShoulderX} ${rShoulderY - 4}
                  L ${rWaistX + 2} ${rWaistY + 2}
                  Q ${pelvisX} ${pelvisY + 6}, ${lWaistX - 2} ${lWaistY + 2}
                  Z`}
              fill="#FFE600"
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Hoodie Ribbed Waist Hem Band */}
            <line
              x1={lWaistX}
              y1={lWaistY}
              x2={rWaistX}
              y2={rWaistY}
              stroke="#f59e0b"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Kangaroo Pocket at bottom of hoodie */}
            <path
              d={`M ${pelvisX - 11} ${pelvisY - 4}
                  L ${pelvisX - 8} ${pelvisY - 13}
                  L ${pelvisX + 8} ${pelvisY - 13}
                  L ${pelvisX + 11} ${pelvisY - 4} Z`}
              fill="#facc15"
              stroke="#000000"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Hoodie Drawstrings at chest */}
            <line x1={chestX - 5} y1={chestY + 2} x2={chestX - 6} y2={chestY + 13} stroke="#000" strokeWidth="2" strokeLinecap="round" />
            <line x1={chestX + 5} y1={chestY + 2} x2={chestX + 6} y2={chestY + 13} stroke="#000" strokeWidth="2" strokeLinecap="round" />

            {/* Street Print Badge "N" on Chest */}
            <circle
              cx={(pelvisX + chestX) * 0.5}
              cy={(pelvisY + chestY) * 0.5 - 2}
              r="10"
              fill="#111111"
              stroke="#FF4D00"
              strokeWidth="2"
            />
            <text
              x={(pelvisX + chestX) * 0.5}
              y={(pelvisY + chestY) * 0.5 + 3}
              fill="#FFE600"
              fontSize="12"
              fontFamily="Rubik Mono One, sans-serif"
              textAnchor="middle"
            >
              N
            </text>
          </g>

          {/* Left Arm */}
          {renderArm('left')}

          {/* In Parter (3/4 view), legs sweep clearly in front of the supporting arms/torso */}
          {isParter ? (
            <>
              {isRightLegInFront ? renderLeg('left') : renderLeg('right')}
              {isRightLegInFront ? renderLeg('right') : renderLeg('left')}
            </>
          ) : isRightLegInFront ? (
            renderLeg('right')
          ) : (
            renderLeg('left')
          )}

          {/* Neck connecting Chest Collar and Head */}
          <line
            x1={neckBaseX}
            y1={neckBaseY}
            x2={headX}
            y2={headY + 12}
            stroke="#000000"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <line
            x1={neckBaseX}
            y1={neckBaseY}
            x2={headX}
            y2={headY + 12}
            stroke="#f6ad55"
            strokeWidth="9"
            strokeLinecap="round"
          />

          {/* Head, Ears, Face & Snapback Cap */}
          <g transform={`translate(${headX}, ${headY}) rotate(${shoulderTiltDeg * 0.6})`}>
            {/* Ears on both sides of head */}
            <circle cx="-19" cy="2" r="5.5" fill="#fbd38d" stroke="#000000" strokeWidth="2.8" />
            <circle cx="19" cy="2" r="5.5" fill="#fbd38d" stroke="#000000" strokeWidth="2.8" />

            {/* Face Circle */}
            <circle cx="0" cy="0" r="19.5" fill="#fbd38d" stroke="#000000" strokeWidth="3.2" />

            {/* Expressive Eyebrows */}
            <path d="M -11 -7 Q -7 -10 -3 -7" stroke="#000000" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d="M 3 -7 Q 7 -10 11 -7" stroke="#000000" strokeWidth="2.4" fill="none" strokeLinecap="round" />

            {/* Lively Eyes with Catchlights */}
            <circle cx="-6.5" cy="-2" r="3.4" fill="#000000" />
            <circle cx="6.5" cy="-2" r="3.4" fill="#000000" />
            <circle cx="-5.3" cy="-3.2" r="1.3" fill="#FFFFFF" />
            <circle cx="7.7" cy="-3.2" r="1.3" fill="#FFFFFF" />

            {/* Cheerful B-Boy Smile */}
            <path
              d="M -7 6 Q 0 13 7 6 Z"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="2.3"
              strokeLinejoin="round"
            />

            {/* Cheeks */}
            <circle cx="-11.5" cy="4" r="2.8" fill="#fb7185" opacity="0.55" />
            <circle cx="11.5" cy="4" r="2.8" fill="#fb7185" opacity="0.55" />

            {/* Properly Fitted B-Boy Snapback Cap with Visor Angled Back-Sideways */}
            <g transform="translate(0, -8)">
              {/* Sideways/Back Visor sticking out to the left */}
              <path
                d="M -14 -1 Q -32 -4 -34 5 Q -22 9 -10 3 Z"
                fill="#111111"
                stroke="#000000"
                strokeWidth="2.6"
                strokeLinejoin="round"
              />
              {/* Cap Crown Dome sitting snugly on head */}
              <path
                d="M -19 2 C -19 -16, 19 -16, 19 2 Z"
                fill="#FF4D00"
                stroke="#000000"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Cap Front Patch */}
              <rect
                x="-7"
                y="-9"
                width="14"
                height="7"
                rx="2"
                fill="#FFE600"
                stroke="#000000"
                strokeWidth="2"
              />
              {/* Cap Top Button */}
              <circle cx="0" cy="-13.5" r="2.8" fill="#FFE600" stroke="#000000" strokeWidth="2" />
            </g>
          </g>
        </g>
      </svg>

      {/* Mirror Mode & Phase HUD Badge overlay */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
        <span className="bg-black/85 text-[#FFE600] font-mono font-bold text-[11px] px-2 py-0.5 rounded border border-zinc-700">
          ШАГ {activePhaseNum} / 4 :{' '}
          {move.rhythmConfig?.phaseVoiceCues?.[idxA] ||
            (['Раз!', 'Два!', 'Три!', 'Четыре!'] as const)[idxA]}
        </span>
        {isMirrored && (
          <span className="bg-[#00E5FF] text-black font-extrabold text-[10px] px-1.5 py-0.5 rounded border border-black uppercase">
            ЗЕРКАЛО
          </span>
        )}
      </div>

      {/* Speed & Rhythm Indicator */}
      <div className="absolute top-2 right-2 pointer-events-none">
        <span className="bg-black/85 text-white font-mono text-[11px] px-2 py-0.5 rounded border border-zinc-700">
          {speed}x • {beatsPerPhase === 2 ? '2 бита/шаг' : '1 бит/шаг'}
        </span>
      </div>

      {/* Large 2-Meter Readable Side Orientation Badges at Bottom Corners */}
      <div className="absolute bottom-2.5 left-2.5 pointer-events-none">
        <span
          className={`px-2.5 sm:px-3 py-1 rounded-md border-2 border-black font-display text-xs sm:text-sm uppercase shadow-[2px_2px_0px_0px_#000] inline-flex items-center gap-1 ${
            isMirrored ? 'bg-[#FF4D00] text-white' : 'bg-[#00E5FF] text-black'
          }`}
        >
          {isMirrored ? '⬅️ ПРАВО' : '⬅️ ЛЕВО'}
        </span>
      </div>

      <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
        <span
          className={`px-2.5 sm:px-3 py-1 rounded-md border-2 border-black font-display text-xs sm:text-sm uppercase shadow-[2px_2px_0px_0px_#000] inline-flex items-center gap-1 ${
            isMirrored ? 'bg-[#00E5FF] text-black' : 'bg-[#FF4D00] text-white'
          }`}
        >
          {isMirrored ? 'ЛЕВО ➡️' : 'ПРАВО ➡️'}
        </span>
      </div>
    </div>
  );
};

