import { Achievement } from '../types';

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first-step',
    title: 'Первый выход в круг!',
    description: 'Застолби первое любое движение из каталога Никиты.',
    icon: '👟',
    category: 'moves'
  },
  {
    id: 'master-square',
    title: 'Хозяин квадрата',
    description: 'Застолби «Шаги по квадрату» и поймай ритм бита.',
    icon: '📐',
    category: 'moves'
  },
  {
    id: 'safe-corkscrew',
    title: 'Мягкая кошка',
    description: 'Выучи «Переход вниз» без касания коленями пола.',
    icon: '🐱',
    category: 'moves'
  },
  {
    id: 'king-footwork',
    title: 'Мастер нижнего брейка',
    description: 'Застолби «Дорожку» и «3 степ» на руках.',
    icon: '🌀',
    category: 'moves'
  },
  {
    id: 'storm-chaser',
    title: 'Ураган Никиты',
    description: 'Застолби быстрые движения: «Шторм» или «Шадн степ».',
    icon: '⚡',
    category: 'moves'
  },
  {
    id: 'all-ten-mastered',
    title: 'Легенда Брейка 2 Класса',
    description: 'Застолби все 10 авторских движений Никиты!',
    icon: '👑',
    category: 'moves'
  },
  {
    id: 'custom-combo-builder',
    title: 'Школьный Хореограф',
    description: 'Собери свою собственную связку в конструкторе.',
    icon: '🧩',
    category: 'combos'
  },
  {
    id: 'rehearsal-hero',
    title: 'Баттл на перемене',
    description: 'Пройди живую репетицию связки с отсчетом Никиты.',
    icon: '⏱️',
    category: 'combos'
  },
  {
    id: 'calorie-burner',
    title: 'Батарейка Энерджайзер',
    description: 'Потренируйся несколько раз подряд без усталости!',
    icon: '🔥',
    category: 'energy'
  },
  {
    id: 'npk-scholar',
    title: 'Исследователь 2 Класса',
    description: 'Изучи разделы паспорта проекта Никиты.',
    icon: '🔬',
    category: 'npk'
  },
  {
    id: 'diploma-awarded',
    title: 'Дипломированный Би-Бой',
    description: 'Выпиши именной диплом с печатью Никиты.',
    icon: '📜',
    category: 'npk'
  },
  {
    id: 'studio-director',
    title: 'Режиссер Студии',
    description: 'Запиши свое видео, фото или голос в Студии Никиты.',
    icon: '🎙️',
    category: 'moves'
  }
];
