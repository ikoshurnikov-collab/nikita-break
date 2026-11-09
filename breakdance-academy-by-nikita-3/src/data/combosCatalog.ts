import { Combo } from '../types';
import { MOVES_CATALOG } from './movesCatalog';

export const PRESET_COMBOS: Combo[] = [
  {
    id: 'combo-peremena',
    name: 'Перемена-Стайл',
    nickname: 'Фирменный школьный выход Никиты для перемены',
    description: 'Идеальная связка для класса или школьного коридора: веселые шаги по квадрату, резкий КИК, мягкий Переход вниз и круговая Дорожка на руках.',
    moveIds: ['square-steps', 'kick-step', 'go-down', 'dorozhka'],
    difficulty: 2,
    totalBeats: 32,
    energyRating: 'Бодрая',
    recommendedBpm: 98,
    nikitaTip: 'На перемене в школе делай эту связку в удобных кроссовках. Ребята и учителя будут в восторге!'
  },
  {
    id: 'combo-storm-base',
    name: 'Круговая Стрелка',
    nickname: 'Широкие шаги и круговой мах стрелкой над полом',
    description: 'Широкие Выпады привлекают внимание всех вокруг, четкий Кик аут готовит партер, а круговая Стрелка и Три-степ срывают аплодисменты.',
    moveIds: ['lunges-toprock', 'kick-out', 'go-down', 'storm-sweep', 'three-step'],
    difficulty: 3,
    totalBeats: 40,
    energyRating: 'Огонь!',
    recommendedBpm: 104,
    nikitaTip: 'Перед круговым махом «Стрелки» сделай короткую паузу на полсекунды — все подумают, что ты закончил, а ты раскрутишь круг!'
  },
  {
    id: 'combo-full-circle',
    name: 'Полный Выход в Круг',
    nickname: 'Настоящий баттл-выход для школьной конференции',
    description: 'Полноценный танцевальный выход: два движения стоя, плавный Переход вниз на руки, быстрый Три-степ и прыжковый Шадн степ.',
    moveIds: ['square-steps', 'lunges-toprock', 'go-down', 'three-step', 'shadn-step'],
    difficulty: 4,
    totalBeats: 40,
    energyRating: 'Ураган!',
    recommendedBpm: 112,
    nikitaTip: 'В самом конце после Шадн степа замри в красивой позе и улыбнись жюри!'
  },
  {
    id: 'combo-speed-footwork',
    name: 'Скоростной Круг',
    nickname: 'Быстрый танец внизу на руках со Штормом и Стрелкой',
    description: 'Резкий КИК стоя сразу переходит в быстрый танец на руках: Дорожка переходит в мощный Шторм и завершается круговой Стрелкой.',
    moveIds: ['kick-step', 'go-down', 'dorozhka', 'arrows-footwork', 'storm-sweep'],
    difficulty: 4,
    totalBeats: 40,
    energyRating: 'Ураган!',
    recommendedBpm: 110,
    nikitaTip: 'Дыши ровно и не задерживай дыхание! Крепко отталкивайся ладошками от пола.'
  }
];

export interface ComboValidationResult {
  isValid: boolean;
  warnings: string[];
  tips: string[];
  calculatedDifficulty: number;
  totalEights: number;
  totalBeats: number;
}

export function validateComboSequence(moveIds: string[]): ComboValidationResult {
  const warnings: string[] = [];
  const tips: string[] = [];

  if (moveIds.length === 0) {
    return {
      isValid: false,
      warnings: ['Связка пока пуста! Добавь от 2 до 6 движений.'],
      tips: ['Начни с «Шагов по квадрату» или «Выпадов» для красивого начала стоя.'],
      calculatedDifficulty: 1,
      totalEights: 0,
      totalBeats: 0
    };
  }

  const moves = moveIds.map((id) => MOVES_CATALOG.find((m) => m.id === id)).filter(Boolean);

  // Check top-to-bottom transition
  let hasToprock = false;
  let hasFootworkAfterToprock = false;
  let hasGoDownBetween = false;

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i]!;
    if (move.category === 'toprock') {
      hasToprock = true;
    }
    if (move.category === 'godown') {
      hasGoDownBetween = true;
    }
    if (move.category === 'footwork' && hasToprock && !hasGoDownBetween) {
      hasFootworkAfterToprock = true;
    }
  }

  if (hasToprock && hasFootworkAfterToprock) {
    warnings.push(
      'Внимание! Ты переходишь из верхнего брейка сразу вниз на руки без «Перехода вниз»! Добавь «Переход вниз», чтобы плавно спуститься на пол и не удариться коленями.'
    );
  }

  if (moves.length < 2) {
    warnings.push('Связка совсем короткая — добавь хотя бы 2–3 движения подряд!');
  }

  if (moves[0]?.category === 'footwork') {
    tips.push(
      'Совет от Никиты: Обычно мы начинаем связку стоя (с верхнего брейка), но начать сразу снизу с рук — тоже крутая идея!'
    );
  }

  if (moves.length >= 3 && !hasFootworkAfterToprock) {
    tips.push('Классная связка! Верхние и нижние движения отлично соединены между собой.');
  }

  const avgDiff = moves.reduce((acc, m) => acc + (m?.difficulty || 1), 0) / (moves.length || 1);

  return {
    isValid: warnings.length === 0,
    warnings,
    tips,
    calculatedDifficulty: Math.min(5, Math.max(1, Math.round(avgDiff))),
    totalEights: moves.length,
    totalBeats: moves.length * 8
  };
}
