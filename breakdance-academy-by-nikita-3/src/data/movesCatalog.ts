import { BreakMove } from '../types';
import { getAudioUrlCandidates } from './nikitaMediaManifest';

export const NIKITA_AVATAR_PATH = './nikita/avatar.png';

/**
 * Returns candidate static audio paths in ./nikita/audio/ supporting .m4a, .M4A, .mp3, and .MP3.
 */
export function getMoveAudioCandidates(moveId?: string, audioPath?: string): string[] {
  return getAudioUrlCandidates(moveId, audioPath);
}

export const MOVES_CATALOG: BreakMove[] = [
  // ===================== УРОВЕНЬ 1: НАЧАЛЬНЫЙ — БАЗА =====================
  {
    id: 'square-steps',
    name: 'Шаги по квадрату',
    englishName: 'Шаги по квадрату',
    category: 'toprock',
    level: 1,
    difficulty: 1,
    bpmRange: [80, 110],
    rhythmConfig: {
      defaultBpm: 92,
      preferredGrooveId: 'boom-bap',
      beatsPerPhase: 1,
      phaseVoiceCues: ['Раз!', 'Два!', 'Три!', 'Четыре!']
    },
    caloriesPerMin: 6.5,
    nikitaQuote:
      'Представь, что на полу нарисован квадрат с углами 1, 2, 3, 4! Мы по очереди шагаем в каждый угол: вперед-вправо, вперед-влево, назад-вправо, назад-влево!',
    nikitaVoiceScript:
      'Привет! Это Никита! Учим Шаги по квадрату. На полу четыре угла: сначала правая нога шагает вперед в угол один, потом левая вперед в угол два, затем правая назад в угол три и левая назад в угол четыре!',
    shortDescription:
      'Поочередные шаги правой и левой ногой строго по 4 углам квадрата на полу с раскрытием рук.',
    fullDescription:
      'Базовое движение верхнего брейка по методике танцевальных школ! Мы мысленно рисуем на полу квадрат и шагаем строго по 4 углам: 1) правая нога вперед в правый верхний угол; 2) левая нога вперед в левый верхний угол (обе ноги спереди); 3) правая нога назад в правый нижний угол; 4) левая нога назад в левый нижний угол на базу.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Угол №1: Правая вперед',
        subtitle: 'Шаг 1 — Правый передний угол',
        nikitaInstruction:
          'Правая нога шагает вперед по диагонали в правый передний угол квадрата (№1). Руки начинают раскрываться в стороны!',
        feetPosition: 'Правая стопа впереди в углу №1, левая стопа сзади в углу №4.',
        handsPosition: 'Руки свободно расходятся в стороны, ловя баланс и кач.',
        keyPose: 'Уверенный шаг правой ногой вперед-вправо.',
        commonMistake: 'Шагать на прямых ногах без мягкой пружинки в коленях.',
        visualCue: 'Угол 1: Правая вперед!'
      },
      {
        phaseNumber: 2,
        title: 'Угол №2: Левая вперед',
        subtitle: 'Шаг 2 — Обе ноги впереди',
        nikitaInstruction:
          'Левая нога шагает вперед в левый передний угол квадрата (№2)! Теперь обе ноги стоят широко на передней линии, а руки широко раскрыты!',
        feetPosition: 'Левая стопа в углу №2, правая в углу №1 — широкая стойка впереди.',
        handsPosition: 'Руки широко раскрыты в стороны на уровне груди.',
        keyPose: 'Широкая открытая стойка на передней линии квадрата.',
        commonMistake: 'Ставить ноги в одну точку — держи ширину плеч между углами 1 и 2!',
        visualCue: 'Угол 2: Левая вперед!'
      },
      {
        phaseNumber: 3,
        title: 'Угол №3: Правая назад',
        subtitle: 'Шаг 3 — Правый задний угол',
        nikitaInstruction:
          'Правая нога отшагивает назад в правый нижний угол квадрата (№3). Руки скрещиваются перед грудью!',
        feetPosition: 'Правая нога сзади в углу №3, левая пока остается впереди в углу №2.',
        handsPosition: 'Руки собираются и скрещиваются перед грудью.',
        keyPose: 'Пружинистый отшаг правой ногой назад.',
        commonMistake: 'Опускать голову вниз и смотреть на пол.',
        visualCue: 'Угол 3: Правая назад!'
      },
      {
        phaseNumber: 4,
        title: 'Угол №4: Левая назад на базу',
        subtitle: 'Шаг 4 — Замыкаем квадрат',
        nikitaInstruction:
          'Левая нога отшагивает назад в левый нижний угол (№4). Квадрат замкнулся — мы снова на стартовой базе!',
        feetPosition: 'Обе стопы на задней линии квадрата (углы №3 и №4) на ширине плеч.',
        handsPosition: 'Кулаки перед грудью, готовы начать новый квадрат.',
        keyPose: 'Чистый возврат на базу с мягким качем.',
        commonMistake: 'Прилипать пятками к полу и останавливать кач корпуса.',
        visualCue: 'Угол 4: Квадрат готов!'
      }
    ],
    commonMistakes: [
      'Слипание кроссовок в одной точке вместо шагов по 4 углам квадрата',
      'Прямые негнущиеся колени без пружинки',
      'Взгляд в пол под ноги вместо зрителей',
      'Опущенные вниз руки вдоль тела'
    ],
    nikitaTips: [
      'Следи за желтыми цифрами 1–2–3–4 прямо на полу в 2D-схеме: вперед-вправо, вперед-влево, назад-вправо, назад-влево!',
      'Когда обе ноги выходят вперед на углы 1 и 2 — широко раскрывай руки!',
      'Когда шагаешь назад на углы 3 и 4 — собирай руки перед грудью.'
    ],
    targetMuscles: {
      core: 60,
      arms: 50,
      legs: 85,
      balance: 75
    },
    floorContacts: [
      { id: 'sq-1', type: 'right-foot', x: 70, y: 34, activePhases: [1, 2], label: '1. Прав. передний угол' },
      { id: 'sq-2', type: 'left-foot', x: 30, y: 34, activePhases: [2, 3], label: '2. Лев. передний угол' },
      { id: 'sq-3', type: 'right-foot', x: 66, y: 68, activePhases: [3, 4], label: '3. Прав. задний угол' },
      { id: 'sq-4', type: 'left-foot', x: 34, y: 68, activePhases: [1, 4], label: '4. Лев. задний угол' }
    ],
    keyframes: [
      { bodyX: 52, bodyY: 52, torsoAngle: 2, headAngle: 0, leftShoulderAngle: 45, leftElbowAngle: 40, rightShoulderAngle: 65, rightElbowAngle: 30, leftHipAngle: 16, leftKneeAngle: 22, rightHipAngle: 28, rightKneeAngle: 24, floorLevel: 'high' },
      { bodyX: 50, bodyY: 54, torsoAngle: 0, headAngle: 0, leftShoulderAngle: 78, leftElbowAngle: 18, rightShoulderAngle: 78, rightElbowAngle: 18, leftHipAngle: 28, leftKneeAngle: 26, rightHipAngle: 28, rightKneeAngle: 26, floorLevel: 'high' },
      { bodyX: 48, bodyY: 51, torsoAngle: -2, headAngle: 0, leftShoulderAngle: -22, leftElbowAngle: 55, rightShoulderAngle: -22, rightElbowAngle: 55, leftHipAngle: 24, leftKneeAngle: 22, rightHipAngle: 16, rightKneeAngle: 20, floorLevel: 'high' },
      { bodyX: 50, bodyY: 50, torsoAngle: 0, headAngle: 0, leftShoulderAngle: 28, leftElbowAngle: 75, rightShoulderAngle: 28, rightElbowAngle: 75, leftHipAngle: 18, leftKneeAngle: 20, rightHipAngle: 18, rightKneeAngle: 20, floorLevel: 'high' }
    ],
    videoPath: './nikita/videos/square-steps.mp4',
    audioPath: './nikita/audio/square-steps.mp3',
    audioFallbackPath: './nikita/audio/square-steps.m4a',
    photoPath: './nikita/photos/square-steps.jpg'
  },

  {
    id: 'lunges-toprock',
    name: 'Выпады',
    englishName: 'Выпады',
    category: 'toprock',
    level: 1,
    difficulty: 2,
    bpmRange: [85, 115],
    rhythmConfig: {
      defaultBpm: 96,
      preferredGrooveId: 'school-funk',
      beatsPerPhase: 2,
      phaseVoiceCues: ['Раз!', 'Два!', 'Три!', 'Четыре!']
    },
    caloriesPerMin: 7.0,
    nikitaQuote:
      'Выпады — это широкие мощные шаги в стороны с глубоким приседом на опорную ногу и размахом рук!',
    nikitaVoiceScript:
      'Внимание, делаем Выпады! Из пружинки в центре делаем глубокий широкий выпад вправо и распахиваем руки, затем возвращаемся в центр и делаем мощный выпад влево!',
    shortDescription:
      'Широкие глубокие выпады вправо и влево с пружинистым возвратом в центр и размахом рук.',
    fullDescription:
      'Амплитудное движение верхнего брейка! Мы делаем легкий подскок-замах в центре, затем уходим в глубокий широкий выпад вправо (правая нога согнута далеко справа, левая прямая на носке, руки широко распахиваются), пружиним обратно в центр и повторяем глубокий выпад влево.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Замах и подскок в центре',
        subtitle: 'Шаг 1 — Сжатая пружина',
        nikitaInstruction:
          'Делаем легкий подскок на двух ногах в центре танцпола, руки скрещены перед грудью для мощного замаха.',
        feetPosition: 'Ноги стоят рядом на ширине таза, пятки слегка оторваны от пола.',
        handsPosition: 'Руки скрещены перед грудью.',
        keyPose: 'Заряженная пружина перед широким выпадом.',
        commonMistake: 'Подпрыгивать слишком высоко и терять ритм бита.',
        visualCue: 'Замах в центре!'
      },
      {
        phaseNumber: 2,
        title: 'Глубокий выпад вправо',
        subtitle: 'Шаг 2 — Выстрел вправо',
        nikitaInstruction:
          'Правая нога шагает далеко вправо и сгибается в колене, левая нога остается прямой на носочке! Руки широко распахиваются в стороны!',
        feetPosition: 'Правая стопа далеко справа в глубоком выпаде, левая прямая слева.',
        handsPosition: 'Руки широко раскрыты в стороны.',
        keyPose: 'Низкий широкий выпад вправо с открытой грудью.',
        commonMistake: 'Сутулить спину — держи грудь и голову высоко!',
        visualCue: 'Глубокий выпад вправо!'
      },
      {
        phaseNumber: 3,
        title: 'Пружинящий возврат в центр',
        subtitle: 'Шаг 3 — Смена в центре',
        nikitaInstruction:
          'Отталкиваемся правой ногой и упруго собираемся обратно в центр, скрещивая руки у груди.',
        feetPosition: 'Стопы на ширине плеч в центре, колени мягкие.',
        handsPosition: 'Руки снова скрещены перед грудью.',
        keyPose: 'Компактная пружина между выпадами.',
        commonMistake: 'Приземляться на прямые жесткие ноги.',
        visualCue: 'Пружина в центре!'
      },
      {
        phaseNumber: 4,
        title: 'Глубокий выпад влево',
        subtitle: 'Шаг 4 — Выстрел влево',
        nikitaInstruction:
          'Левая нога шагает далеко влево и сгибается в колене, правая вытягивается на носке, а руки снова мощно раскрываются!',
        feetPosition: 'Левая стопа далеко слева в глубоком выпаде, правая прямая справа.',
        handsPosition: 'Широкий размах обеими руками.',
        keyPose: 'Симметричный глубокий выпад влево точно в бит.',
        commonMistake: 'Делать узкий шаг вместо настоящего широкого выпада.',
        visualCue: 'Глубокий выпад влево!'
      }
    ],
    commonMistakes: [
      'Слишком узкие шажки на одном месте без переноса веса',
      'Прямое колено передней опорной ноги во время выпада',
      'Сутулая спина и опущенный взгляд'
    ],
    nikitaTips: [
      'Чем ниже ты приседаешь на боковую ногу в фазах 2 и 4, тем круче и мощнее выглядит твой выпад!',
      'Руки работают как крылья: в центре скрещены, на выпаде — широко раскрыты!',
      'Держи пресс напряженным, чтобы легко возвращаться обратно в центр.'
    ],
    targetMuscles: {
      core: 75,
      arms: 55,
      legs: 90,
      balance: 85
    },
    floorContacts: [
      { id: 'lu-1', type: 'left-foot', x: 42, y: 55, activePhases: [1, 2, 3], label: 'Левая стопа (Центр/Опора)' },
      { id: 'lu-2', type: 'right-foot', x: 58, y: 55, activePhases: [1, 3, 4], label: 'Правая стопа (Центр/Опора)' },
      { id: 'lu-3', type: 'right-foot', x: 82, y: 48, activePhases: [2], label: 'Дальний выпад вправо' },
      { id: 'lu-4', type: 'left-foot', x: 18, y: 48, activePhases: [4], label: 'Дальний выпад влево' }
    ],
    keyframes: [
      { bodyX: 50, bodyY: 48, torsoAngle: 0, headAngle: 0, leftShoulderAngle: -22, leftElbowAngle: 55, rightShoulderAngle: -22, rightElbowAngle: 55, leftHipAngle: 12, leftKneeAngle: 22, rightHipAngle: 12, rightKneeAngle: 22, floorLevel: 'high' },
      { bodyX: 58, bodyY: 56, torsoAngle: 6, headAngle: 4, leftShoulderAngle: 75, leftElbowAngle: 20, rightShoulderAngle: 82, rightElbowAngle: 20, leftHipAngle: 32, leftKneeAngle: 10, rightHipAngle: 46, rightKneeAngle: 45, floorLevel: 'high' },
      { bodyX: 50, bodyY: 50, torsoAngle: 0, headAngle: 0, leftShoulderAngle: -22, leftElbowAngle: 55, rightShoulderAngle: -22, rightElbowAngle: 55, leftHipAngle: 15, leftKneeAngle: 22, rightHipAngle: 15, rightKneeAngle: 22, floorLevel: 'high' },
      { bodyX: 42, bodyY: 56, torsoAngle: -6, headAngle: -4, leftShoulderAngle: 82, leftElbowAngle: 20, rightShoulderAngle: 75, rightElbowAngle: 20, leftHipAngle: 46, leftKneeAngle: 45, rightHipAngle: 32, rightKneeAngle: 10, floorLevel: 'high' }
    ],
    videoPath: './nikita/videos/lunges-toprock.mp4',
    audioPath: './nikita/audio/lunges-toprock.mp3',
    audioFallbackPath: './nikita/audio/lunges-toprock.m4a',
    photoPath: './nikita/photos/lunges-toprock.jpg'
  },

  {
    id: 'kick-step',
    name: 'КИК',
    englishName: 'КИК',
    category: 'toprock',
    level: 1,
    difficulty: 1,
    bpmRange: [85, 120],
    rhythmConfig: {
      defaultBpm: 98,
      preferredGrooveId: 'school-funk',
      beatsPerPhase: 1,
      phaseVoiceCues: ['Раз!', 'Два!', 'Три!', 'Четыре!']
    },
    caloriesPerMin: 6.8,
    nikitaQuote:
      'КИК по методике брейк-школ: хлесткий выброс ноги вперед от колена, а затем быстрая прыжковая смена ног с раскрытием рук!',
    nikitaVoiceScript:
      'Учим настоящий КИК! Сначала хлестко выбрасываем правую ногу вперед от колена, потом прыжком меняем ноги и раскрываем руки, и сразу делаем КИК левой ногой!',
    shortDescription:
      'Хлесткий выброс ноги вперед от колена с прыжковой сменой опорной ноги и широким раскрытием рук.',
    fullDescription:
      'Классический элемент верхнего брейка (методика школы «Свои Люди»)! На счет «раз» мы делаем хлесткий выброс правой ноги вперед-вверх от колена, держа руки у груди; на счет «два» прыжком меняем ноги (правая встает в опору, левая отпрыгивает назад-вбок, руки раскрываются); на счет «три» бьем КИК левой ногой; на счет «четыре» прыжком возвращаемся в стойку.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Хлесткий КИК правой ногой',
        subtitle: 'Шаг 1 — Удар правой',
        nikitaInstruction:
          'Стоим на левой ноге и резко от колена выбрасываем правую ногу вперед-вправо в воздух! Руки собраны перед грудью.',
        feetPosition: 'Левая стопа крепко на полу, правая нога выпрямлена в воздухе на уровне пояса.',
        handsPosition: 'Руки компактно у груди для баланса.',
        keyPose: 'Хлесткий удар правой ногой вперед-вверх.',
        commonMistake: 'Махать прямой тяжелой ногой без хлесткого разгибания колена.',
        visualCue: 'КИК правой!'
      },
      {
        phaseNumber: 2,
        title: 'Прыжковая смена ног',
        subtitle: 'Шаг 2 — Перепрыжка и раскрытие',
        nikitaInstruction:
          'Прыжком меняем ноги: правая встает в центр в опору, а левая отпрыгивает назад-влево на носочек! Руки широко раскрываются!',
        feetPosition: 'Правая стопа в центре, левая позади-слева на носочке.',
        handsPosition: 'Руки широко разлетаются в стороны.',
        keyPose: 'Прыжковая разножка с широкими руками.',
        commonMistake: 'Просто опускать ногу без упругой перепрыжки.',
        visualCue: 'Прыжок-смена!'
      },
      {
        phaseNumber: 3,
        title: 'Хлесткий КИК левой ногой',
        subtitle: 'Шаг 3 — Удар левой',
        nikitaInstruction:
          'Теперь опираемся на правую ногу и хлестко выбрасываем левую ногу вперед-влево в воздух! Руки снова у груди.',
        feetPosition: 'Правая стопа на полу, левая нога в воздухе показывает подошву кроссовка.',
        handsPosition: 'Кулаки собраны у груди.',
        keyPose: 'Симметричный хлесткий КИК левой ногой.',
        commonMistake: 'Заваливать корпус сильно назад.',
        visualCue: 'КИК левой!'
      },
      {
        phaseNumber: 4,
        title: 'Прыжковый сбор в стойку',
        subtitle: 'Шаг 4 — Возврат на базу',
        nikitaInstruction:
          'Мягким подскоком возвращаем обе ноги в уверенную боевую стойку на ширине плеч и раскрываем руки!',
        feetPosition: 'Обе стопы на полу на ширине плеч, колени пружинят.',
        handsPosition: 'Руки свободно раскрыты в стороны.',
        keyPose: 'Устойчивая стойка би-боя в финале счета.',
        commonMistake: 'Замирать без кача после завершения удара.',
        visualCue: 'Сбор в стойку!'
      }
    ],
    commonMistakes: [
      'Махать ногой слишком высоко к голове и падать назад',
      'Пропускать прыжковую смену ног между правым и левым КИКом',
      'Стоять на прямой каменной ноге без пружинки'
    ],
    nikitaTips: [
      'Секрет настоящего КИКа — это связка «Выброс ноги -> Прыжковая смена -> Выброс другой ноги»!',
      'Во время удара руки держи у груди, а во время прыжковой смены — широко раскрывай!',
      'Сразу после КИКа очень удобно делать Переход вниз в партер.'
    ],
    targetMuscles: {
      core: 70,
      arms: 45,
      legs: 85,
      balance: 90
    },
    floorContacts: [
      { id: 'ki-1', type: 'left-foot', x: 42, y: 55, activePhases: [1, 4], label: 'Левая опорная стопа' },
      { id: 'ki-2', type: 'right-foot', x: 58, y: 55, activePhases: [2, 3, 4], label: 'Правая опорная стопа' },
      { id: 'ki-3', type: 'left-foot', x: 28, y: 68, activePhases: [2], label: 'Отскок левой назад' }
    ],
    keyframes: [
      { bodyX: 48, bodyY: 51, torsoAngle: -4, headAngle: 0, leftShoulderAngle: 22, leftElbowAngle: 85, rightShoulderAngle: 22, rightElbowAngle: 85, leftHipAngle: 10, leftKneeAngle: 18, rightHipAngle: 72, rightKneeAngle: 0, floorLevel: 'high' },
      { bodyX: 52, bodyY: 53, torsoAngle: 4, headAngle: 4, leftShoulderAngle: 78, leftElbowAngle: 20, rightShoulderAngle: 78, rightElbowAngle: 20, leftHipAngle: 34, leftKneeAngle: 28, rightHipAngle: 12, rightKneeAngle: 22, floorLevel: 'high' },
      { bodyX: 52, bodyY: 51, torsoAngle: 4, headAngle: 0, leftShoulderAngle: 22, leftElbowAngle: 85, rightShoulderAngle: 22, rightElbowAngle: 85, leftHipAngle: 72, leftKneeAngle: 0, rightHipAngle: 10, rightKneeAngle: 18, floorLevel: 'high' },
      { bodyX: 50, bodyY: 51, torsoAngle: 0, headAngle: 0, leftShoulderAngle: 62, leftElbowAngle: 25, rightShoulderAngle: 62, rightElbowAngle: 25, leftHipAngle: 16, leftKneeAngle: 20, rightHipAngle: 16, rightKneeAngle: 20, floorLevel: 'high' }
    ],
    videoPath: './nikita/videos/kick-step.mp4',
    audioPath: './nikita/audio/kick-step.mp3',
    audioFallbackPath: './nikita/audio/kick-step.m4a',
    photoPath: './nikita/photos/kick-step.jpg'
  },

  {
    id: 'kick-out',
    name: 'Кик аут',
    englishName: 'Кик аут',
    category: 'footwork',
    level: 1,
    difficulty: 2,
    bpmRange: [90, 115],
    rhythmConfig: {
      defaultBpm: 100,
      preferredGrooveId: 'school-funk',
      beatsPerPhase: 2,
      phaseVoiceCues: ['Раз!', 'Два!', 'Три!', 'Четыре!']
    },
    caloriesPerMin: 7.8,
    nikitaQuote:
      'В настоящем Кик ауте мы не выбрасываем обе ноги сразу! Сначала одна нога выстреливает прямой вперед, а вторая согнутая перекидывается через неё коленкой к земле — и потом меняем ноги!',
    nikitaVoiceScript:
      'Учим Кик аут как танцую его я! Из упора на руках левая нога выстреливает прямой вперед, а правая остается согнутой. Потом согнутая правая нога перекидывается крест-накрест поверх левой и тянется коленкой к земле! Затем быстро меняем ноги: правая выстреливает прямой вперед, а левая перекидывается поверх неё коленкой к земле!',
    shortDescription:
      'Поочередный выстрел одной прямой ногой вперед с перекидыванием другой согнутой ноги крест-накрест коленкой к земле.',
    fullDescription:
      'Фирменная техника Кик аута от Никиты! В этом движении ноги работают по очереди: 1) Из упора в приседе на руках левая нога резко выстреливает прямой вперед, а правая остается согнутой в колене сбоку; 2) Согнутая правая нога перекидывается крест-накрест поверх прямой левой ноги и наклоняется коленкой к земле со скруткой; 3) Быстрая смена ног — теперь правая нога выстреливает прямой вперед, а левая сгибается; 4) Левая согнутая нога перекидывается крест-накрест поверх прямой правой ноги коленкой к земле.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Выстрел одной ногой вперед',
        subtitle: 'Шаг 1 — Прямая левая нога вперед',
        nikitaInstruction:
          'Из упора в приседе на руках левая нога резко выстреливает прямой вперед по центру, а правая нога остается согнутой в колене сбоку!',
        feetPosition: 'Левая нога полностью прямая впереди, правая согнута в колене на носочке сбоку.',
        handsPosition: 'Обе ладони плотно опираются в пол, поддерживая корпус.',
        keyPose: 'Четкий выстрел одной прямой ногой вперед.',
        commonMistake: 'Выбрасывать обе ноги одновременно вместо одной прямой ноги.',
        visualCue: '1: Выстрел левой!'
      },
      {
        phaseNumber: 2,
        title: 'Перекидывание коленкой к земле',
        subtitle: 'Шаг 2 — Правое колено крест-накрест вниз',
        nikitaInstruction:
          'Левая нога остается прямой впереди, а согнутая правая нога перекидывается крест-накрест поверх неё и наклоняется коленкой к земле!',
        feetPosition: 'Левая нога прямая внизу, правая перекинута крест-накрест сверху коленкой к полу.',
        handsPosition: 'Ладони крепко держат пол, бедра делают красивую скрутку.',
        keyPose: 'Скрутка с наклоном правого колена к земле поверх прямой левой ноги.',
        commonMistake: 'Сгибать переднюю опорную ногу во время перекидывания.',
        visualCue: '2: Коленкой к земле!'
      },
      {
        phaseNumber: 3,
        title: 'Смена ног — выстрел правой',
        subtitle: 'Шаг 3 — Прямая правая нога вперед',
        nikitaInstruction:
          'Возвращаем ногу и быстро меняем ноги местами: теперь правая нога резко выстреливает прямой вперед, а левая сгибается в колене сбоку!',
        feetPosition: 'Правая нога полностью прямая впереди, левая согнута в колене сбоку.',
        handsPosition: 'Крепкий упор обеими ладонями в пол.',
        keyPose: 'Быстрая смена ног с выстрелом прямой правой вперед.',
        commonMistake: 'Терять темп при смене прямой и согнутой ноги.',
        visualCue: '3: Выстрел правой!'
      },
      {
        phaseNumber: 4,
        title: 'Перекидывание другой коленкой к земле',
        subtitle: 'Шаг 4 — Левое колено крест-накрест вниз',
        nikitaInstruction:
          'Правая нога остается прямой впереди, а согнутая левая нога перекидывается крест-накрест поверх правой ноги и тянется коленкой к земле!',
        feetPosition: 'Правая нога прямая внизу, левая перекинута сверху коленкой к полу.',
        handsPosition: 'Обе руки уверенно держат опору на полу.',
        keyPose: 'Симметричная скрутка левым коленом к земле поверх прямой правой ноги.',
        commonMistake: 'Заваливаться на бок и отрывать ладони от пола.',
        visualCue: '4: Левым коленом к земле!'
      }
    ],
    commonMistakes: [
      'Выбрасывать обе ноги одновременно (в Кик ауте вперед выстреливает только одна нога!)',
      'Забывать перекидывать вторую согнутую ногу крест-накрест коленкой к земле',
      'Сгибать вытянутую переднюю ногу во время скрутки'
    ],
    nikitaTips: [
      'Запомни формулу: «Прямая левая вперед -> правое колено через неё к земле -> смена -> прямая правая вперед -> левое колено к земле»!',
      'Когда перекидываешь согнутую ногу поверх прямой, слегка поворачивай бедра — получится настоящий брейкерский стиль!',
      'Руки всё время крепко опираются в пол за спиной и по бокам.'
    ],
    targetMuscles: {
      core: 90,
      arms: 85,
      legs: 85,
      balance: 90
    },
    floorContacts: [
      { id: 'ko-1', type: 'left-hand', x: 36, y: 44, activePhases: [1, 2, 3, 4], label: 'Левая ладонь (Опора)' },
      { id: 'ko-2', type: 'right-hand', x: 64, y: 44, activePhases: [1, 2, 3, 4], label: 'Правая ладонь (Опора)' },
      { id: 'ko-3', type: 'left-foot', x: 48, y: 74, activePhases: [1, 2], label: 'Прямая левая нога впереди' },
      { id: 'ko-4', type: 'right-foot', x: 36, y: 66, activePhases: [2], label: 'Правое колено крест-накрест к земле' },
      { id: 'ko-5', type: 'right-foot', x: 52, y: 74, activePhases: [3, 4], label: 'Прямая правая нога впереди' },
      { id: 'ko-6', type: 'left-foot', x: 64, y: 66, activePhases: [4], label: 'Левое колено крест-накрест к земле' }
    ],
    keyframes: [
      { bodyX: 50, bodyY: 74, torsoAngle: 0, headAngle: 0, leftShoulderAngle: 20, leftElbowAngle: 12, rightShoulderAngle: 20, rightElbowAngle: 12, leftHipAngle: 0, leftKneeAngle: 0, rightHipAngle: 45, rightKneeAngle: 68, floorLevel: 'low' },
      { bodyX: 48, bodyY: 72, torsoAngle: -8, headAngle: 6, leftShoulderAngle: 18, leftElbowAngle: 8, rightShoulderAngle: 22, rightElbowAngle: 8, leftHipAngle: 0, leftKneeAngle: 0, rightHipAngle: -45, rightKneeAngle: 65, floorLevel: 'low' },
      { bodyX: 50, bodyY: 74, torsoAngle: 0, headAngle: 0, leftShoulderAngle: 20, leftElbowAngle: 12, rightShoulderAngle: 20, rightElbowAngle: 12, leftHipAngle: 45, leftKneeAngle: 68, rightHipAngle: 0, rightKneeAngle: 0, floorLevel: 'low' },
      { bodyX: 52, bodyY: 72, torsoAngle: 8, headAngle: -6, leftShoulderAngle: 22, leftElbowAngle: 8, rightShoulderAngle: 18, rightElbowAngle: 8, leftHipAngle: -45, leftKneeAngle: 65, rightHipAngle: 0, rightKneeAngle: 0, floorLevel: 'low' }
    ],
    videoPath: './nikita/videos/kick-out.mp4',
    audioPath: './nikita/audio/kick-out.mp3',
    audioFallbackPath: './nikita/audio/kick-out.m4a',
    photoPath: './nikita/photos/kick-out.jpg'
  },

  {
    id: 'go-down',
    name: 'Переход вниз',
    englishName: 'Переход вниз',
    category: 'godown',
    level: 1,
    difficulty: 2,
    bpmRange: [80, 115],
    rhythmConfig: {
      defaultBpm: 90,
      preferredGrooveId: 'boom-bap',
      beatsPerPhase: 2,
      phaseVoiceCues: ['Раз!', 'Два!', 'Три!', 'Четыре!']
    },
    caloriesPerMin: 8.0,
    nikitaQuote:
      'Переход вниз — это волшебный лифт с верхнего этажа на нижний! Главное — никогда не падать на колени, а плавно спускаться на ладошки!',
    nikitaVoiceScript:
      'Самый важный секрет брейка — Переход вниз! Никогда не бухайся на колени! Скрести ноги штопором, мягко присядь на носочки и по очереди поставь ладошки на пол!',
    shortDescription:
      'Плавный и безопасный спуск со стойки на ладони и носочки без касания пола коленями.',
    fullDescription:
      'В брейк-дансе нельзя просто сесть на пол! Переход вниз соединяет верхние шаги с движениями в партере. Мы заводим правую ногу сзади крест-накрест штопором, плавно садимся на носках, ставим сначала правую ладонь на пол, затем левую ладонь и выходим в чистую стойку партера.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Закрутка ног штопором',
        subtitle: 'Шаг 1 — Скрещивание сзади',
        nikitaInstruction:
          'Заводим правую ногу сзади за левую крест-накрест и начинаем плавно приседать вниз, готовя руки к опоре.',
        feetPosition: 'Левая стопа впереди, правая сзади на носочке.',
        handsPosition: 'Правая рука тянется вниз к полу, левая балансирует.',
        keyPose: 'Плавный спуск со скрещенными ногами.',
        commonMistake: 'Падать вперед прямо на коленки — колени никогда не должны биться об пол!',
        visualCue: 'Закрутка штопором!'
      },
      {
        phaseNumber: 2,
        title: 'Правая ладонь на пол',
        subtitle: 'Шаг 2 — Первая рука в опоре',
        nikitaInstruction:
          'Садимся низко на носочках и плотно ставим правую ладонь на пол! На полу загорается желтое кольцо опоры.',
        feetPosition: 'Сидим на носочках, пятки и колени на весу.',
        handsPosition: 'Правая ладонь крепко стоит на полу, левая еще в воздухе.',
        keyPose: 'Мягкий прием веса тела на правую руку.',
        commonMistake: 'Ставить руку слишком далеко от себя.',
        visualCue: 'Правая ладонь в пол!'
      },
      {
        phaseNumber: 3,
        title: 'Обе ладони на полу',
        subtitle: 'Шаг 3 — Раскрытие ног',
        nikitaInstruction:
          'Ставим левую ладонь на пол и раскручиваем ноги шире в удобный упор на носочках.',
        feetPosition: 'Обе ноги широко стоят на носочках.',
        handsPosition: 'Обе ладони плотно стоят на полу под плечами.',
        keyPose: 'Переход на четыре точки опоры (две ладони и два носка).',
        commonMistake: 'Садиться попой на пол — держи таз на весу!',
        visualCue: 'Обе руки в пол!'
      },
      {
        phaseNumber: 4,
        title: 'Чистая стойка партера',
        subtitle: 'Шаг 4 — Готовность к Дорожке',
        nikitaInstruction:
          'Голова поднята, смотрим на зрителей, руки крепко держат пол. Мы готовы начинать Дорожку, Три-степ или Шторм!',
        feetPosition: 'Упругий упор на носочках кроссовок.',
        handsPosition: 'Обе ладони уверенно отталкивают пол.',
        keyPose: 'Боевая стойка би-боя в партере.',
        commonMistake: 'Опускать голову вниз и проваливаться в плечах.',
        visualCue: 'Партер готов!'
      }
    ],
    commonMistakes: [
      'Падение коленями на твердый пол (колени всегда должны быть на весу!)',
      'Садиться попой на пол вместо упора на носочки и ладони',
      'Слишком резкое падение без мягкой амортизации руками'
    ],
    nikitaTips: [
      'Спускайся на пол тихо и мягко, как кошка — сначала правая ладонь, потом левая!',
      'Колени и попа не касаются пола — работают только подошвы кроссовок и ладошки.',
      'Обязательно вставляй «Переход вниз» в свои связки после Шагов по квадрату, Выпадов или КИКа!'
    ],
    targetMuscles: {
      core: 85,
      arms: 80,
      legs: 80,
      balance: 85
    },
    floorContacts: [
      { id: 'gd-1', type: 'left-foot', x: 36, y: 65, activePhases: [1, 2, 3, 4], label: 'Левая стопа (Носок)' },
      { id: 'gd-2', type: 'right-foot', x: 64, y: 65, activePhases: [1, 2, 3, 4], label: 'Правая стопа (Носок)' },
      { id: 'gd-3', type: 'right-hand', x: 60, y: 40, activePhases: [2, 3, 4], label: 'Правая ладонь (Шаг 2–4)' },
      { id: 'gd-4', type: 'left-hand', x: 40, y: 40, activePhases: [3, 4], label: 'Левая ладонь (Шаг 3–4)' }
    ],
    keyframes: [
      { bodyX: 50, bodyY: 60, torsoAngle: 14, headAngle: -5, leftShoulderAngle: 55, leftElbowAngle: 35, rightShoulderAngle: 18, rightElbowAngle: 15, leftHipAngle: 22, leftKneeAngle: 42, rightHipAngle: -32, rightKneeAngle: -28, floorLevel: 'medium' },
      { bodyX: 52, bodyY: 74, torsoAngle: 18, headAngle: -6, leftShoulderAngle: 85, leftElbowAngle: 45, rightShoulderAngle: 20, rightElbowAngle: 12, leftHipAngle: 48, leftKneeAngle: 65, rightHipAngle: 38, rightKneeAngle: 58, floorLevel: 'low' },
      { bodyX: 50, bodyY: 75, torsoAngle: 8, headAngle: 0, leftShoulderAngle: 22, leftElbowAngle: 14, rightShoulderAngle: 22, rightElbowAngle: 14, leftHipAngle: 52, leftKneeAngle: 68, rightHipAngle: 52, rightKneeAngle: 68, floorLevel: 'low' },
      { bodyX: 50, bodyY: 74, torsoAngle: 0, headAngle: 5, leftShoulderAngle: 26, leftElbowAngle: 15, rightShoulderAngle: 26, rightElbowAngle: 15, leftHipAngle: 58, leftKneeAngle: 72, rightHipAngle: 58, rightKneeAngle: 72, floorLevel: 'low' }
    ],
    videoPath: './nikita/videos/go-down.mp4',
    audioPath: './nikita/audio/go-down.mp3',
    audioFallbackPath: './nikita/audio/go-down.m4a',
    photoPath: './nikita/photos/go-down.jpg'
  },

  {
    id: 'dorozhka',
    name: 'Дорожка',
    englishName: 'Дорожка',
    category: 'footwork',
    level: 1,
    difficulty: 3,
    bpmRange: [90, 115],
    rhythmConfig: {
      defaultBpm: 102,
      preferredGrooveId: 'electro-808',
      beatsPerPhase: 2,
      phaseVoiceCues: ['Раз!', 'Два!', 'Три!', 'Четыре!']
    },
    caloriesPerMin: 9.0,
    nikitaQuote:
      'Дорожка — это главный элемент нижнего брейка! Ноги шагают по кругу вокруг рук: крюк вперед, крабик спереди, дуга назад и широкий упор!',
    nikitaVoiceScript:
      'Учим настоящую Дорожку! Раз — правая нога делает крюк вперед вокруг левой руки! Два — левая подшагивает под колено в крабика спереди! Три — правая уходит по кругу вправо-назад! Четыре — широкий упор на ладонях и носках!',
    shortDescription:
      'Круговое движение ногами вокруг опорных рук в партере через зацеп, «крабик» спереди и выход по дуге.',
    fullDescription:
      'Классическая Дорожка (основа Six-Step) по методике школ брейкинга! 1) Из упора сзади правая нога шагает вперед крюком вокруг левой руки; 2) Левая нога подшагивает под колено правой в положение «крабика» спереди, а руки переставляются за спину; 3) Правая нога выходит из-под себя и шагает дугой вправо-назад; 4) Возврат обеих ног назад в широкий упор на ладонях и носках.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Шаг 1: Крюк правой ногой вперед',
        subtitle: 'Счет «Раз» — Зацеп вокруг левой руки',
        nikitaInstruction:
          'Опираемся на левую ладонь в полу, а правая нога делает широкий шаг-крюк вперед вокруг опорной руки!',
        feetPosition: 'Правая стопа вышла вперед на круг, левая сзади на носочке.',
        handsPosition: 'Левая рука держит вес на полу, правая приподнимается для смены.',
        keyPose: 'Зацеп правой ногой спереди.',
        commonMistake: 'Опускать таз на пол — держи бедра на весу!',
        visualCue: '1: Крюк вперед!'
      },
      {
        phaseNumber: 2,
        title: 'Шаг 2: Крабик спереди',
        subtitle: 'Счет «Два» — Скрестные ноги впереди',
        nikitaInstruction:
          'Левая нога подшагивает под правое колено вперед! Обе ладони стоят на полу за спиной в положении «крабика».',
        feetPosition: 'Ноги скрещены впереди на носочках.',
        handsPosition: 'Обе ладони опираются в пол позади корпуса.',
        keyPose: 'Компактный «крабик» спереди на руках и носочках.',
        commonMistake: 'Садиться на попу во время перехода в крабика.',
        visualCue: '2: Крабик спереди!'
      },
      {
        phaseNumber: 3,
        title: 'Шаг 3: Выход по кругу вправо-назад',
        subtitle: 'Счет «Три» — Дуга правой ногой',
        nikitaInstruction:
          'Переносим вес на правую ладонь, отрываем левую руку и проводим правую ногу широкой дугой вправо-назад!',
        feetPosition: 'Правая нога уходит по кругу вправо-назад, левая впереди.',
        handsPosition: 'Правая ладонь плотно в полу, левая в воздухе.',
        keyPose: 'Широкий полукруг правой ногой вокруг правой руки.',
        commonMistake: 'Забывать приподнять левую руку, чтобы выпустить ноги.',
        visualCue: '3: Дуга назад!'
      },
      {
        phaseNumber: 4,
        title: 'Шаг 4: Широкий упор сзади',
        subtitle: 'Счет «Четыре» — Замыкаем круг',
        nikitaInstruction:
          'Обе ладони стоят на полу спереди, а обе ноги возвращаются назад на носочки в широкий устойчивый упор!',
        feetPosition: 'Обе стопы широко позади рук на носочках.',
        handsPosition: 'Обе ладони крепко упираются в пол под плечами.',
        keyPose: 'Чистый финиш круга Дорожки в партере.',
        commonMistake: 'Ставить колени на пол.',
        visualCue: '4: Круг замкнулся!'
      }
    ],
    commonMistakes: [
      'Попа лежит на полу вместо того, чтобы держаться на весу',
      'Пятки прилипают к полу (все шаги Дорожки делаются на упругих носочках!)',
      'Руки стоят слишком широко, мешая ногам бежать по кругу'
    ],
    nikitaTips: [
      'Смотри на голубую пунктирную дорожку на полу: твои кроссовки рисуют ровный круг вокруг ладоней!',
      'Запомни 4 точки: Крюк вперед -> Крабик спереди -> Дуга вправо-назад -> Широкий упор!',
      'Сначала пройди все 4 фазы в режиме «ПО ШАГАМ», а затем включай скорость 0.5x и 1.0x.'
    ],
    targetMuscles: {
      core: 90,
      arms: 95,
      legs: 85,
      balance: 90
    },
    floorContacts: [
      { id: 'dr-1', type: 'left-hand', x: 40, y: 44, activePhases: [1, 2, 4], label: 'Левая ладонь' },
      { id: 'dr-2', type: 'right-hand', x: 60, y: 44, activePhases: [2, 3, 4], label: 'Правая ладонь' },
      { id: 'dr-3', type: 'right-foot', x: 35, y: 74, activePhases: [1, 2], label: 'Крюк и Крабик спереди' },
      { id: 'dr-4', type: 'right-foot', x: 74, y: 62, activePhases: [3, 4], label: 'Выход по кругу назад' }
    ],
    keyframes: [
      { bodyX: 48, bodyY: 74, torsoAngle: -10, headAngle: -5, leftShoulderAngle: 22, leftElbowAngle: 14, rightShoulderAngle: 26, rightElbowAngle: 14, leftHipAngle: 52, leftKneeAngle: 68, rightHipAngle: -45, rightKneeAngle: -25, floorLevel: 'low' },
      { bodyX: 50, bodyY: 75, torsoAngle: 0, headAngle: 0, leftShoulderAngle: 20, leftElbowAngle: 12, rightShoulderAngle: 20, rightElbowAngle: 12, leftHipAngle: 25, leftKneeAngle: 65, rightHipAngle: 25, rightKneeAngle: 65, floorLevel: 'low' },
      { bodyX: 52, bodyY: 74, torsoAngle: 8, headAngle: 8, leftShoulderAngle: 80, leftElbowAngle: 35, rightShoulderAngle: 22, rightElbowAngle: 12, leftHipAngle: 42, leftKneeAngle: 62, rightHipAngle: 76, rightKneeAngle: 8, floorLevel: 'low' },
      { bodyX: 50, bodyY: 74, torsoAngle: 0, headAngle: 0, leftShoulderAngle: 24, leftElbowAngle: 14, rightShoulderAngle: 24, rightElbowAngle: 14, leftHipAngle: 55, leftKneeAngle: 70, rightHipAngle: 55, rightKneeAngle: 70, floorLevel: 'low' }
    ],
    videoPath: './nikita/videos/dorozhka.mp4',
    audioPath: './nikita/audio/dorozhka.mp3',
    audioFallbackPath: './nikita/audio/dorozhka.m4a',
    photoPath: './nikita/photos/dorozhka.jpg'
  },

  {
    id: 'three-step',
    name: '3 степ (Три-степ)',
    englishName: '3 степ (Три-степ)',
    category: 'footwork',
    level: 1,
    difficulty: 2,
    bpmRange: [85, 115],
    rhythmConfig: {
      defaultBpm: 100,
      preferredGrooveId: 'electro-808',
      beatsPerPhase: 1,
      phaseVoiceCues: ['Раз!', 'Два!', 'Три!', 'Четыре!']
    },
    caloriesPerMin: 8.5,
    nikitaQuote:
      'Три-степ — это скоростная вертушка в три шага: зацеп правой ногой, взрывной переброс со сменой рук и широкий треугольник опоры!',
    nikitaVoiceScript:
      'Разбираем Три-степ! Считай со мной: Раз — широкий зацеп правой ногой! Два — смена рук и взрывной переброс левой ноги! Три — широкий треугольник на ладонях и носках!',
    shortDescription:
      'Быстрая дорожка в три шага со взрывным перебросом ног и сменой опорных рук.',
    fullDescription:
      'Динамичное движение нижнего брейка! В отличие от длинной Дорожки, здесь круг проходится всего за три мощных акцента: 1) Зацеп правой ногой вперед-влево на левой руке; 2) Смена опорной руки на правую с перебросом левой ноги вперед-вправо; 3) Раскрытие в широкий треугольник опоры на обеих ладонях; 4) Компактная пружина под бит.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Шаг 1: Зацеп правой ногой',
        subtitle: 'Счет «Раз» — Крюк вперед-влево',
        nikitaInstruction:
          'Опираемся на левую ладонь в пол, правая рука в воздухе, а правая нога делает широкий крюк вперед-влево!',
        feetPosition: 'Правая нога далеко спереди-слева, левая сзади на носочке.',
        handsPosition: 'Левая рука держит пол, правая поднята.',
        keyPose: 'Широкий замах-зацеп на одной руке.',
        commonMistake: 'Делать короткий шажок вместо амплитудного крюка.',
        visualCue: 'Раз — Зацеп!'
      },
      {
        phaseNumber: 2,
        title: 'Шаг 2: Взрывной переброс',
        subtitle: 'Счет «Два» — Смена рук и ног',
        nikitaInstruction:
          'Ставим правую ладонь в пол, поднимаем левую руку и взрывным движением перебрасываем левую ногу вперед-вправо!',
        feetPosition: 'Левая нога вылетает вперед-вправо, правая уходит под корпус.',
        handsPosition: 'Правая ладонь плотно на полу, левая рука в воздухе.',
        keyPose: 'Быстрая перепрыжка со сменой рук.',
        commonMistake: 'Держать обе руки приклеенными к полу и застревать ногами.',
        visualCue: 'Два — Переброс!'
      },
      {
        phaseNumber: 3,
        title: 'Шаг 3: Широкий треугольник',
        subtitle: 'Счет «Три» — Опора на обе руки',
        nikitaInstruction:
          'Возвращаем обе ладони на пол, а ноги широко расставляем на носочки в устойчивый треугольник!',
        feetPosition: 'Обе стопы широко по сторонам на носочках.',
        handsPosition: 'Обе ладони крепко упираются в пол в центре.',
        keyPose: 'Широкая мощная база в партере.',
        commonMistake: 'Терять равновесие после переброса.',
        visualCue: 'Три — Треугольник!'
      },
      {
        phaseNumber: 4,
        title: 'Пружина в бит',
        subtitle: 'Счет «Четыре» — Готовность к новому кругу',
        nikitaInstruction:
          'Чуть собираем носочки ближе и пружиним руками и ногами точно в удар барабана перед следующим кругом!',
        feetPosition: 'Носочки упруго пружинят.',
        handsPosition: 'Обе ладони под плечами.',
        keyPose: 'Заряженная стойка партера.',
        commonMistake: 'Сбиваться с ритма восьмерки.',
        visualCue: 'Четыре — В бит!'
      }
    ],
    commonMistakes: [
      'Забывать вовремя менять опорную руку при перебросе ног',
      'Опускать таз слишком низко к полу',
      'Сбиваться со счета «Раз-Два-Три»'
    ],
    nikitaTips: [
      'Считай вслух во время танца: «РАЗ! ДВА! ТРИ!» — тогда руки и ноги сами поймают синхронность!',
      'Держи бедра повыше от пола, тогда переброс ног в фазе 2 получится легким и быстрым.',
      'Три-степ отлично разгоняет тебя перед Штормом!'
    ],
    targetMuscles: {
      core: 85,
      arms: 90,
      legs: 85,
      balance: 90
    },
    floorContacts: [
      { id: 'ts-1', type: 'left-hand', x: 40, y: 45, activePhases: [1, 3, 4], label: 'Левая рука (Опора)' },
      { id: 'ts-2', type: 'right-hand', x: 60, y: 45, activePhases: [2, 3, 4], label: 'Правая рука (Опора)' },
      { id: 'ts-3', type: 'right-foot', x: 26, y: 66, activePhases: [1], label: 'Шаг 1: Зацеп правой' },
      { id: 'ts-4', type: 'left-foot', x: 74, y: 66, activePhases: [2, 3], label: 'Шаг 2: Переброс левой' }
    ],
    keyframes: [
      { bodyX: 48, bodyY: 74, torsoAngle: -12, headAngle: 8, leftShoulderAngle: 20, leftElbowAngle: 12, rightShoulderAngle: 92, rightElbowAngle: 40, leftHipAngle: 45, leftKneeAngle: 65, rightHipAngle: 72, rightKneeAngle: 12, floorLevel: 'low' },
      { bodyX: 52, bodyY: 74, torsoAngle: 12, headAngle: -8, leftShoulderAngle: 92, leftElbowAngle: 40, rightShoulderAngle: 20, rightElbowAngle: 12, leftHipAngle: 72, leftKneeAngle: 12, rightHipAngle: 45, rightKneeAngle: 65, floorLevel: 'low' },
      { bodyX: 50, bodyY: 75, torsoAngle: 0, headAngle: 0, leftShoulderAngle: 24, leftElbowAngle: 14, rightShoulderAngle: 24, rightElbowAngle: 14, leftHipAngle: 56, leftKneeAngle: 70, rightHipAngle: 56, rightKneeAngle: 70, floorLevel: 'low' },
      { bodyX: 50, bodyY: 73, torsoAngle: 4, headAngle: 6, leftShoulderAngle: 26, leftElbowAngle: 12, rightShoulderAngle: 26, rightElbowAngle: 12, leftHipAngle: 62, leftKneeAngle: 74, rightHipAngle: 62, rightKneeAngle: 74, floorLevel: 'low' }
    ],
    videoPath: './nikita/videos/three-step.mp4',
    audioPath: './nikita/audio/three-step.mp3',
    audioFallbackPath: './nikita/audio/three-step.m4a',
    photoPath: './nikita/photos/three-step.jpg'
  },

  {
    id: 'storm-sweep',
    name: 'Стрелка',
    englishName: 'Стрелка',
    category: 'footwork',
    level: 1,
    difficulty: 3,
    bpmRange: [95, 125],
    rhythmConfig: {
      defaultBpm: 106,
      preferredGrooveId: 'electro-808',
      beatsPerPhase: 2,
      phaseVoiceCues: ['Раз!', 'Два!', 'Три!', 'Четыре!']
    },
    caloriesPerMin: 9.5,
    nikitaQuote:
      'Стрелка — это круговой мах прямой ногой как стрелкой часов: руки по очереди пропускают ногу спереди, а левая нога перепрыгивает через неё!',
    nikitaVoiceScript:
      'Внимание, крутим Стрелку! Прямая правая нога летит по кругу как стрелка часов: сначала отводим её влево, потом проносим спереди под приподнятой рукой, а затем левая нога высоко перепрыгивает через неё как через скакалку!',
    shortDescription:
      'Круговой мах прямой ногой как стрелкой часов с поочередным пропуском руками и перепрыжкой.',
    fullDescription:
      'Зрелищный круговой мах в партере (Стрелка)! 1) Сидя в упоре на руках, прямая правая нога отведена далеко влево; 2) Прямая правая нога летит по кругу вперед как стрелка часов, а левая рука приподнимается и пропускает её под собой; 3) Правая нога уходит вправо под левую ногу, а левая нога подпрыгивает в воздухе, перепрыгивая через неё; 4) Завершение круга в упоре на руках.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Замах прямой ногой слева',
        subtitle: 'Шаг 1 — Разгон стрелки',
        nikitaInstruction:
          'Обе ладони плотно на полу, левая нога согнута на носочке, а полностью прямая правая нога отведена далеко влево!',
        feetPosition: 'Правая нога прямая как стрела слева, левая в опоре на носке.',
        handsPosition: 'Обе ладони крепко упираются в пол.',
        keyPose: 'Широкий замах прямой маховой ногой.',
        commonMistake: 'Сгибать правую ногу в колене — нога-стрелка должна быть прямой!',
        visualCue: '1: Замах слева!'
      },
      {
        phaseNumber: 2,
        title: 'Пронос ноги спереди под рукой',
        subtitle: 'Шаг 2 — Пропуск рукой',
        nikitaInstruction:
          'Прямая правая нога летит по кругу спереди как стрелка часов! Левая рука быстро приподнимается над полом, пропуская ногу под собой!',
        feetPosition: 'Прямая правая нога проходит переднюю дугу круга.',
        handsPosition: 'Правая ладонь держит вес в полу, левая рука поднята.',
        keyPose: 'Пронос прямой ноги спереди на одной опорной руке.',
        commonMistake: 'Забыть поднять руку и зацепиться ногой за собственную ладонь.',
        visualCue: '2: Пронос под рукой!'
      },
      {
        phaseNumber: 3,
        title: 'Перепрыжка левой ногой в воздухе',
        subtitle: 'Шаг 3 — Прыжок как через скакалку!',
        nikitaInstruction:
          'Обе ладони жестко упираются в пол! Маховая правая нога летит вправо, а левая нога высоко подпрыгивает в воздух, перепрыгивая через неё!',
        feetPosition: 'Правая нога справа внизу, левая нога взлетела в воздухе над ней!',
        handsPosition: 'Обе ладони держат весь вес тела на полу.',
        keyPose: 'Взрывная перепрыжка в воздухе с опорой на руки.',
        commonMistake: 'Бояться оторвать левую ногу от пола.',
        visualCue: '3: Перепрыжка!'
      },
      {
        phaseNumber: 4,
        title: 'Финиш круга в партере',
        subtitle: 'Шаг 4 — Мягкий прием',
        nikitaInstruction:
          'Завершаем полный круг на 360 градусов и мягко ставим обе ноги на носочки в упор на руках!',
        feetPosition: 'Обе стопы на носочках, готовы к новому витку Стрелки.',
        handsPosition: 'Обе ладони ровно под плечами на полу.',
        keyPose: 'Чистая фиксация после полного оборота ноги.',
        commonMistake: 'Терять равновесие после приземления.',
        visualCue: '4: Финиш круга!'
      }
    ],
    commonMistakes: [
      'Сгибание маховой правой ноги во время круга',
      'Забывать по очереди приподнимать руки, когда нога пролетает спереди',
      'Слишком низкий прыжок левой ногой в фазе перепрыжки'
    ],
    nikitaTips: [
      'Представь, что твоя правая нога — это большая стрелка часов, которая крутится по полу на 360 градусов: сначала пропускаешь её под рукой, а потом перепрыгиваешь левой ногой!',
      'В фазе 3 крепко оттолкнись обеими руками от пола, чтобы таз и левая нога легко взлетели вверх.',
      'Стрелка всегда вызывает восторг у зрителей и жюри!'
    ],
    targetMuscles: {
      core: 95,
      arms: 95,
      legs: 85,
      balance: 95
    },
    floorContacts: [
      { id: 'st-1', type: 'left-hand', x: 40, y: 44, activePhases: [1, 3, 4], label: 'Левая ладонь (Пропуск в шаге 2)' },
      { id: 'st-2', type: 'right-hand', x: 60, y: 44, activePhases: [1, 2, 3, 4], label: 'Правая ладонь (Опора)' },
      { id: 'st-3', type: 'right-foot', x: 18, y: 62, activePhases: [1], label: '1. Замах прямой ногой слева' },
      { id: 'st-4', type: 'right-foot', x: 50, y: 80, activePhases: [2], label: '2. Пронос спереди' },
      { id: 'st-5', type: 'right-foot', x: 82, y: 62, activePhases: [3], label: '3. Выход ноги вправо' }
    ],
    keyframes: [
      { bodyX: 48, bodyY: 74, torsoAngle: -8, headAngle: 6, leftShoulderAngle: 22, leftElbowAngle: 14, rightShoulderAngle: 25, rightElbowAngle: 14, leftHipAngle: 42, leftKneeAngle: 62, rightHipAngle: 84, rightKneeAngle: 0, floorLevel: 'low' },
      { bodyX: 50, bodyY: 74, torsoAngle: 6, headAngle: 0, leftShoulderAngle: 80, leftElbowAngle: 35, rightShoulderAngle: 20, rightElbowAngle: 12, leftHipAngle: 45, leftKneeAngle: 60, rightHipAngle: 0, rightKneeAngle: 0, floorLevel: 'low' },
      { bodyX: 50, bodyY: 66, torsoAngle: 0, headAngle: -6, leftShoulderAngle: 18, leftElbowAngle: 8, rightShoulderAngle: 18, rightElbowAngle: 8, leftHipAngle: 75, leftKneeAngle: 85, rightHipAngle: -78, rightKneeAngle: 0, floorLevel: 'low' },
      { bodyX: 50, bodyY: 74, torsoAngle: 0, headAngle: 0, leftShoulderAngle: 24, leftElbowAngle: 14, rightShoulderAngle: 24, rightElbowAngle: 14, leftHipAngle: 55, leftKneeAngle: 70, rightHipAngle: 55, rightKneeAngle: 70, floorLevel: 'low' }
    ],
    videoPath: './nikita/videos/storm-sweep.mp4',
    audioPath: './nikita/audio/storm-sweep.mp3',
    audioFallbackPath: './nikita/audio/storm-sweep.m4a',
    photoPath: './nikita/photos/storm-sweep.jpg'
  },

  // ===================== УРОВЕНЬ 2: СРЕДНИЙ — ПРОКАЧКА =====================
  {
    id: 'shadn-step',
    name: 'Шадн степ',
    englishName: 'Шадн степ',
    category: 'footwork',
    level: 2,
    difficulty: 4,
    bpmRange: [95, 125],
    rhythmConfig: {
      defaultBpm: 112,
      preferredGrooveId: 'turbo-battle',
      beatsPerPhase: 2,
      phaseVoiceCues: ['Раз!', 'Два!', 'Три!', 'Четыре!']
    },
    caloriesPerMin: 10.0,
    nikitaQuote:
      'Шадн степ — взрывная боковая смена ног прыжком со скруткой в партере: заряд слева, высокий прыжок на руках со скрещиванием ног в воздухе и приземление справа!',
    nikitaVoiceScript:
      'Уровень Прокачка: Шадн степ! Сначала обе ноги заряжены слева на правой руке, потом взрывной прыжок на обеих руках — ноги скрещиваются высоко в воздухе — и мягкое приземление вправо на левую руку!',
    shortDescription:
      'Взрывная прыжковая смена ног из стороны в сторону со скруткой корпуса и опорой на руки.',
    fullDescription:
      'Мощный динамичный элемент второго уровня! 1) Боковой упор на правую ладонь в пол, обе ноги выброшены влево со скруткой; 2) Взрывной прыжок на обеих руках — таз взлетает вверх, а ноги скрещиваются прямо в воздухе; 3) Мягкое кошачье приземление на левую ладонь, обе ноги выброшены вправо со скруткой; 4) Пружинящий сбор в центральный упор.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Боковой заряд слева',
        subtitle: 'Шаг 1 — Скрутка на правой руке',
        nikitaInstruction:
          'Опираемся правой ладонью в пол, левая рука в воздухе, а обе ноги со скруткой бедер отведены влево на носочки!',
        feetPosition: 'Обе стопы вместе слева на носочках.',
        handsPosition: 'Правая ладонь крепко держит пол, левая поднята.',
        keyPose: 'Заряженная боковая пружина слева.',
        commonMistake: 'Ронять бедра на пол — держи таз на весу!',
        visualCue: '1: Заряд слева!'
      },
      {
        phaseNumber: 2,
        title: 'Взрывной прыжок на обеих руках',
        subtitle: 'Шаг 2 — Скрещивание ног в воздухе!',
        nikitaInstruction:
          'Ставим обе ладони в пол и мощно выталкиваем таз вверх! Ноги отрываются от пола и меняются местами в воздухе!',
        feetPosition: 'Обе ноги высоко в воздухе в перекрестном прыжке.',
        handsPosition: 'Обе ладони жестко упираются в пол под плечами.',
        keyPose: 'Высокий прыжок на руках с перебросом ног.',
        commonMistake: 'Бояться поднять таз вверх при опоре на руки.',
        visualCue: '2: Прыжок в воздухе!'
      },
      {
        phaseNumber: 3,
        title: 'Приземление справа со скруткой',
        subtitle: 'Шаг 3 — Упор на левую руку',
        nikitaInstruction:
          'Обе ноги мягко приземляются на носочки справа со скруткой корпуса, а вес держит левая ладонь в полу!',
        feetPosition: 'Обе стопы справа на упругих носочках.',
        handsPosition: 'Левая ладонь на полу, правая рука свободна в воздухе.',
        keyPose: 'Симметричная боковая фиксация справа.',
        commonMistake: 'Приземляться на жесткие прямые ноги.',
        visualCue: '3: Приземление справа!'
      },
      {
        phaseNumber: 4,
        title: 'Пружинящий сбор в центр',
        subtitle: 'Шаг 4 — Центральный упор би-боя',
        nikitaInstruction:
          'Мягким подскоком возвращаем ноги и обе ладони в центральную стойку партера точно в удар барабана!',
        feetPosition: 'Стопы на носочках по сторонам.',
        handsPosition: 'Обе ладони плотно на полу.',
        keyPose: 'Устойчивый центральный партер.',
        commonMistake: 'Терять темп музыки в конце элемента.',
        visualCue: '4: Сбор в центр!'
      }
    ],
    commonMistakes: [
      'Пытаться перешагнуть по полу вместо настоящего прыжка на руках',
      'Слабые согнутые локти во время фазы полета',
      'Забывать скручивать бедра влево и вправо'
    ],
    nikitaTips: [
      'В фазе 2 твои руки работают как батут: толкни пол обеими ладонями, чтобы ноги легко перелетели слева направо!',
      'Приземляйся только на переднюю часть кроссовок (на носочки), чтобы прыжок был бесшумным.',
      'Шадн степ круто смотрится в связке сразу после Дорожки!'
    ],
    targetMuscles: {
      core: 100,
      arms: 100,
      legs: 80,
      balance: 95
    },
    floorContacts: [
      { id: 'ss-1', type: 'right-hand', x: 58, y: 42, activePhases: [1, 2, 4], label: 'Правая ладонь (Опора)' },
      { id: 'ss-2', type: 'left-hand', x: 42, y: 42, activePhases: [2, 3, 4], label: 'Левая ладонь (Опора)' },
      { id: 'ss-3', type: 'left-foot', x: 24, y: 66, activePhases: [1], label: '1. Ноги слева со скруткой' },
      { id: 'ss-4', type: 'right-foot', x: 76, y: 66, activePhases: [3], label: '3. Ноги справа со скруткой' }
    ],
    keyframes: [
      { bodyX: 44, bodyY: 74, torsoAngle: 16, headAngle: -10, leftShoulderAngle: 90, leftElbowAngle: 45, rightShoulderAngle: 18, rightElbowAngle: 12, leftHipAngle: 65, leftKneeAngle: 68, rightHipAngle: -35, rightKneeAngle: -32, floorLevel: 'low' },
      { bodyX: 50, bodyY: 62, torsoAngle: 0, headAngle: 0, leftShoulderAngle: 20, leftElbowAngle: 10, rightShoulderAngle: 20, rightElbowAngle: 10, leftHipAngle: 45, leftKneeAngle: 75, rightHipAngle: 45, rightKneeAngle: 75, floorLevel: 'medium' },
      { bodyX: 56, bodyY: 74, torsoAngle: -16, headAngle: 10, leftShoulderAngle: 18, leftElbowAngle: 12, rightShoulderAngle: 90, rightElbowAngle: 45, leftHipAngle: -35, leftKneeAngle: -32, rightHipAngle: 65, rightKneeAngle: 68, floorLevel: 'low' },
      { bodyX: 50, bodyY: 74, torsoAngle: 0, headAngle: 0, leftShoulderAngle: 24, leftElbowAngle: 14, rightShoulderAngle: 24, rightElbowAngle: 14, leftHipAngle: 55, leftKneeAngle: 70, rightHipAngle: 55, rightKneeAngle: 70, floorLevel: 'low' }
    ],
    videoPath: './nikita/videos/shadn-step.mp4',
    audioPath: './nikita/audio/shadn-step.mp3',
    audioFallbackPath: './nikita/audio/shadn-step.m4a',
    photoPath: './nikita/photos/shadn-step.jpg'
  },

  {
    id: 'arrows-footwork',
    name: 'Шторм',
    englishName: 'Шторм',
    category: 'footwork',
    level: 2,
    difficulty: 3,
    bpmRange: [90, 120],
    rhythmConfig: {
      defaultBpm: 108,
      preferredGrooveId: 'turbo-battle',
      beatsPerPhase: 1,
      phaseVoiceCues: ['Раз!', 'Два!', 'Три!', 'Четыре!']
    },
    caloriesPerMin: 8.8,
    nikitaQuote:
      'Шторм — это мощные прострелы прямыми ногами в упоре на руках: выброс вправо, сбор под тазом, выброс влево и финальный двойной разлет!',
    nikitaVoiceScript:
      'Финальное движение Прокачки — Шторм! Ладони крепко на полу: выстреливаем прямой правой ногой далеко вправо, собираем ноги под себя, выстреливаем прямой левой ногой влево и в финале делаем мощный двойной разлет обеими ногами!',
    shortDescription:
      'Мощные прострелы прямыми ногами вправо, влево и двойной разлет в упоре на руках.',
    fullDescription:
      'Динамичный элемент второго уровня! Держа вес на обеих ладонях в полу, мы по очереди выстреливаем идеально прямыми ногами по сторонам: 1) Выброс правой ногой далеко вправо; 2) Перезарядка — сбор обеих ног под тазом на носках; 3) Выброс левой ногой далеко влево; 4) Победный двойной разлет обеими прямыми ногами в стороны!',
    phases: [
      {
        phaseNumber: 1,
        title: 'Выброс вправо',
        subtitle: 'Шаг 1 — Прострел правой ногой',
        nikitaInstruction:
          'Обе ладони плотно на полу. Правая нога мощно выстреливает прямой далеко вправо, а левая компактно поджата на носочке!',
        feetPosition: 'Правая нога полностью прямая справа, левая под тазом.',
        handsPosition: 'Обе ладони крепко держат пол под плечами.',
        keyPose: 'Резкий боковой выброс правой ноги вправо.',
        commonMistake: 'Оставлять колено правой ноги полусогнутым.',
        visualCue: '1: Выброс вправо!'
      },
      {
        phaseNumber: 2,
        title: 'Перезарядка в центре',
        subtitle: 'Шаг 2 — Сбор под тазом',
        nikitaInstruction:
          'Резко забираем правую ногу обратно: обе ноги компактно собраны на носочках прямо под тазом!',
        feetPosition: 'Обе стопы рядом на носочках в центре.',
        handsPosition: 'Обе ладони продолжают держать упор в полу.',
        keyPose: 'Собранная пружина перед выстрелом влево.',
        commonMistake: 'Опускать колени на пол при сборе ног.',
        visualCue: '2: Перезарядка!'
      },
      {
        phaseNumber: 3,
        title: 'Выброс влево',
        subtitle: 'Шаг 3 — Прострел левой ногой',
        nikitaInstruction:
          'Теперь левая нога мощно выстреливает прямой далеко влево, а правая остается поджатой на носке!',
        feetPosition: 'Левая нога полностью прямая слева, правая под тазом.',
        handsPosition: 'Обе ладони неподвижно держат центр на полу.',
        keyPose: 'Симметричный выброс левой ноги влево.',
        commonMistake: 'Терять упор в руках и заваливаться на бок.',
        visualCue: '3: Выброс влево!'
      },
      {
        phaseNumber: 4,
        title: 'Двойной разлет Шторма!',
        subtitle: 'Шаг 4 — Победный выброс обеих ног',
        nikitaInstruction:
          'Финальный акцент: опираясь на обе руки, одновременно выстреливаем обеими прямыми ногами широко в стороны!',
        feetPosition: 'Обе ноги идеально прямые и широко разведены по углам.',
        handsPosition: 'Крепкий упор обеими ладонями в центр пола.',
        keyPose: 'Чемпионский двойной разлет ног в партере!',
        commonMistake: 'Сгибать ноги в финальной точке.',
        visualCue: '4: Двойной Шторм!'
      }
    ],
    commonMistakes: [
      'Вялые полусогнутые колени во время бокового выброса',
      'Слабые руки и проваливание плеч',
      'Касание пола коленями во время перезарядки'
    ],
    nikitaTips: [
      'Представь, что твои кроссовки разлетаются как молнии в шторм: вправо, в центр, влево и сразу в обе стороны!',
      'Ладони в Шторме стоят в центре как вкопанные — двигаются только быстрые ноги!',
      'Двойной разлет в 4-й фазе — отличная финальная точка для любого баттла!'
    ],
    targetMuscles: {
      core: 85,
      arms: 90,
      legs: 85,
      balance: 90
    },
    floorContacts: [
      { id: 'ar-1', type: 'left-hand', x: 42, y: 42, activePhases: [1, 2, 3, 4], label: 'Левая ладонь (Центр)' },
      { id: 'ar-2', type: 'right-hand', x: 58, y: 42, activePhases: [1, 2, 3, 4], label: 'Правая ладонь (Центр)' },
      { id: 'ar-3', type: 'right-foot', x: 84, y: 64, activePhases: [1, 4], label: 'Правая стрела (Шаг 1 и 4)' },
      { id: 'ar-4', type: 'left-foot', x: 16, y: 64, activePhases: [3, 4], label: 'Левая стрела (Шаг 3 и 4)' }
    ],
    keyframes: [
      { bodyX: 48, bodyY: 74, torsoAngle: -8, headAngle: 10, leftShoulderAngle: 22, leftElbowAngle: 14, rightShoulderAngle: 24, rightElbowAngle: 14, leftHipAngle: 42, leftKneeAngle: 68, rightHipAngle: 85, rightKneeAngle: 0, floorLevel: 'low' },
      { bodyX: 50, bodyY: 75, torsoAngle: 0, headAngle: 0, leftShoulderAngle: 20, leftElbowAngle: 14, rightShoulderAngle: 20, rightElbowAngle: 14, leftHipAngle: 32, leftKneeAngle: 58, rightHipAngle: 32, rightKneeAngle: 58, floorLevel: 'low' },
      { bodyX: 52, bodyY: 74, torsoAngle: 8, headAngle: -10, leftShoulderAngle: 24, leftElbowAngle: 14, rightShoulderAngle: 22, rightElbowAngle: 14, leftHipAngle: 85, leftKneeAngle: 0, rightHipAngle: 42, rightKneeAngle: 68, floorLevel: 'low' },
      { bodyX: 50, bodyY: 74, torsoAngle: 0, headAngle: 5, leftShoulderAngle: 25, leftElbowAngle: 14, rightShoulderAngle: 25, rightElbowAngle: 14, leftHipAngle: 78, leftKneeAngle: 0, rightHipAngle: 78, rightKneeAngle: 0, floorLevel: 'low' }
    ],
    videoPath: './nikita/videos/arrows-footwork.mp4',
    audioPath: './nikita/audio/arrows-footwork.mp3',
    audioFallbackPath: './nikita/audio/arrows-footwork.m4a',
    photoPath: './nikita/photos/arrows-footwork.jpg'
  }
];

export const CATEGORY_NAMES: Record<string, string> = {
  toprock: 'Верхний уровень',
  godown: 'Переход вниз',
  footwork: 'Нижний уровень',
  power: 'Силовой элемент'
};

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Уровень 1: Начальный — База',
  2: 'Уровень 2: Средний — Прокачка'
};
