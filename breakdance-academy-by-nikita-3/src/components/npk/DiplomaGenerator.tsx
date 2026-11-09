import React, { useState, useEffect } from 'react';
import { progressStorage } from '../../services/progressStorage';
import { soundEngine } from '../../services/soundEngine';
import confetti from 'canvas-confetti';
import { Award, Printer, Sparkles } from 'lucide-react';

interface DiplomaGeneratorProps {
  initialName?: string;
  initialRole?: 'Би-Бой' | 'Би-Гёрл' | 'Член Жюри НПК' | 'Главный Эксперт';
}

export const DiplomaGenerator: React.FC<DiplomaGeneratorProps> = ({
  initialName = 'Гость (впиши имя)',
  initialRole = 'Би-Бой'
}) => {
  const [recipientName, setRecipientName] = useState(initialName);
  const [role, setRole] = useState<'Би-Бой' | 'Би-Гёрл' | 'Член Жюри НПК' | 'Главный Эксперт'>(initialRole);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialName) {
      setRecipientName(initialName);
    }
  }, [initialName]);

  const handleIssueDiploma = () => {
    const cleaned = recipientName.replace(/\s+/g, ' ').trim().slice(0, 22);
    if (cleaned) {
      setRecipientName(cleaned);
    }
    progressStorage.setDiploma(cleaned, role);
    soundEngine.playSuccessFanfare();
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 }
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handlePrint = () => {
    handleIssueDiploma();
    window.print();
  };

  return (
    <div className="bg-white border-3 sm:border-4 border-black p-3.5 sm:p-6 rounded-xl shadow-[4px_4px_0px_0px_#000] sm:shadow-[6px_6px_0px_0px_#000] text-black">
      <div className="flex items-start justify-between border-b-3 border-black pb-3 mb-4">
        <div className="flex items-start sm:items-center gap-2">
          <Award className="text-[#FF4D00] shrink-0 mt-0.5 sm:mt-0" size={24} />
          <div>
            <h3 className="font-display text-base sm:text-xl uppercase leading-tight">
              Генератор Именного Диплома Би-Боя от Никиты
            </h3>
            <p className="text-xs text-zinc-600 font-bold mt-0.5">
              Выпиши почетную грамоту члену жюри или однокласснику прямо на защите проекта!
            </p>
          </div>
        </div>
      </div>

      {/* Editor Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 sm:mb-5 bg-[#F4EFE6] border-2 border-black p-3 sm:p-3.5 rounded-lg">
        <div>
          <label className="text-xs font-mono font-bold uppercase text-zinc-700 mb-1 block">
            Кому выписывается диплом (ФИО или Имя):
          </label>
          <input
            type="text"
            maxLength={22}
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value.slice(0, 22))}
            className="w-full px-3 py-1.5 bg-white border-2 border-black rounded font-heading font-extrabold text-sm focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-mono font-bold uppercase text-zinc-700 mb-1 block">
            Статус / Звание:
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            className="w-full px-3 py-1.5 bg-white border-2 border-black rounded font-mono font-bold text-sm focus:outline-none cursor-pointer"
          >
            <option value="Член Жюри НПК">Член Жюри НПК (Почетный Эксперт)</option>
            <option value="Главный Эксперт">Главный Эксперт по Брейк-Дансу</option>
            <option value="Би-Бой">Би-Бой (B-Boy Школы)</option>
            <option value="Би-Гёрл">Би-Гёрл (B-Girl Школы)</option>
          </select>
        </div>
      </div>

      {/* Printable Certificate Canvas */}
      <div
        id="nikita-diploma-certificate"
        className="relative bg-[#fffdfa] border-4 sm:border-8 border-black p-4 sm:p-10 rounded-2xl shadow-[5px_5px_0px_0px_#FFE600] sm:shadow-[8px_8px_0px_0px_#FFE600] my-4 overflow-hidden print:border-4 print:shadow-none"
      >
        {/* Certificate Decorative Border */}
        <div className="absolute inset-1.5 sm:inset-2 border-2 border-dashed border-[#FF4D00] pointer-events-none rounded-xl" />

        <div className="text-center relative z-10">
          <div className="inline-block bg-[#FFE600] border-2 sm:border-3 border-black text-black font-mono font-black text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 uppercase rounded tracking-wider sm:tracking-widest mb-2 shadow-[2px_2px_0px_0px_#000]">
            ШКОЛЬНЫЙ ПРОЕКТ ПО БРЕЙК-ДАНСУ 2026
          </div>

          <h1 className="font-display text-xl sm:text-4xl text-black uppercase tracking-tight mb-1">
            ПОЧЕТНЫЙ ДИПЛОМ
          </h1>
          <p className="font-heading font-black text-xs sm:text-sm text-[#FF4D00] uppercase tracking-wider mb-3 sm:mb-4">
            ШКОЛЫ БРЕЙК-ДАНСА ВТОРОКЛАССНИКА НИКИТЫ
          </p>

          <p className="text-xs sm:text-sm font-medium text-zinc-600 mb-1">
            Настоящий диплом удостоверяет, что
          </p>

          <div className="my-2.5 sm:my-3 py-2 border-b-3 border-black max-w-lg mx-auto px-2">
            <span className="font-display text-lg sm:text-3xl text-black underline decoration-[#FFE600] decoration-4 break-words">
              {recipientName || 'Участник'}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-800 font-bold max-w-xl mx-auto leading-relaxed mb-4 sm:mb-6">
            Успешно освоил(а) авторский курс из 10 базовых элементов брейк-данса, прошел(ла) проверку на ритм, координацию и подтвердил(а) высокое звание:
          </p>

          <div className="inline-block bg-[#00E5FF] border-3 border-black px-4 sm:px-6 py-2 rounded-xl text-black font-display text-sm sm:text-xl uppercase shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] mb-6 sm:mb-8 max-w-full break-words">
            ⭐ {role} ⭐
          </div>

          {/* Signatures & Seal Row: stacked centered on mobile, 3-col on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center sm:items-end pt-4 border-t-2 border-zinc-300 text-center sm:text-left">
            <div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Автор тренажера:</div>
              <div className="font-heading font-black text-sm text-black">Никита (2 класс)</div>
              <div className="text-xs font-mono text-zinc-500 italic font-bold">Личная подпись: <i>Nikita B-Boy ✍️</i></div>
            </div>

            <div className="text-center">
              {/* Official Seal Badge */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FFE600] border-3 sm:border-4 border-black mx-auto flex flex-col items-center justify-center rotate-6 shadow-[3px_3px_0px_0px_#000]">
                <span className="text-lg sm:text-xl">👑</span>
                <span className="text-[7px] sm:text-[8px] font-mono font-black uppercase text-black leading-none">
                  ПЕЧАТЬ БИ-БОЯ
                </span>
                <span className="text-[7px] font-mono font-bold text-black">ОТЛИЧНО</span>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Дата вручения:</div>
              <div className="font-mono font-black text-sm text-black">
                {new Date().toLocaleDateString('ru-RU')}
              </div>
              <div className="text-[10px] font-mono text-zinc-500">Школа // 2 класс</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <span className="text-xs font-mono font-bold text-zinc-500">
          Формат для печати на А4 или отправки родителям
        </span>

        <div className="grid grid-cols-1 sm:flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleIssueDiploma}
            className="w-full sm:w-auto px-4 py-2 bg-[#FFE600] hover:bg-yellow-300 text-black rounded font-heading text-xs font-black border-2 border-black neo-btn cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles size={15} /> {isSaved ? 'ВЫПИСАНО ✓' : 'УТВЕРДИТЬ ДИПЛОМ'}
          </button>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2 bg-[#00E676] hover:bg-emerald-400 text-black rounded font-heading text-xs font-black border-2 border-black neo-btn cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Printer size={15} /> ПЕЧАТЬ НА ПРИНТЕРЕ
          </button>
        </div>
      </div>
    </div>
  );
};
