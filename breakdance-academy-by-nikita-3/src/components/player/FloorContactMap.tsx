import React from 'react';
import { FloorContact } from '../../types';

interface FloorContactMapProps {
  contacts: FloorContact[];
  currentPhase: number; // 1, 2, 3, 4
  moveName: string;
}

export const FloorContactMap: React.FC<FloorContactMapProps> = ({
  contacts,
  currentPhase,
  moveName
}) => {
  const typeColors = {
    'left-foot': { bg: '#00E5FF', text: '#000', label: 'Лев. Стопа' },
    'right-foot': { bg: '#FF4D00', text: '#fff', label: 'Прав. Стопа' },
    'left-hand': { bg: '#00E676', text: '#000', label: 'Лев. Ладонь' },
    'right-hand': { bg: '#FFE600', text: '#000', label: 'Прав. Ладонь' }
  };

  return (
    <div className="bg-[#181818] border-3 border-black p-3 rounded-lg shadow-[4px_4px_0px_0px_#000] text-white">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600]" />
          <h4 className="font-heading font-extrabold text-xs uppercase text-zinc-200">
            СХЕМА ОПОР И СТОП НА ПОЛУ (ФАЗА {currentPhase})
          </h4>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">Вид сверху</span>
      </div>

      {/* SVG Floor Visualizer */}
      <div className="relative w-full aspect-square max-w-[260px] mx-auto bg-black rounded-full border-2 border-dashed border-zinc-700 p-2 overflow-hidden my-2">
        {/* Crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[1px] bg-zinc-800" />
          <div className="h-full w-[1px] bg-zinc-800 absolute" />
        </div>

        {/* Center label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-mono text-zinc-600 pointer-events-none">
          ЦЕНТР ТЯЖЕСТИ
        </div>

        {/* Contacts */}
        {contacts.map((contact) => {
          const isActive = contact.activePhases.includes(currentPhase);
          const conf = typeColors[contact.type];

          return (
            <div
              key={contact.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'scale-125 z-20 shadow-[0_0_15px_rgba(255,230,0,0.8)]'
                  : 'scale-90 opacity-40 z-10'
              }`}
              style={{
                left: `${contact.x}%`,
                top: `${contact.y}%`
              }}
            >
              <div
                className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-display text-[10px] font-black"
                style={{
                  backgroundColor: conf.bg,
                  color: conf.text
                }}
              >
                {contact.type.includes('hand') ? '🖐️' : '👟'}
              </div>

              {isActive && (
                <span className="text-[9px] font-bold text-white bg-black/90 px-1 rounded border border-zinc-700 whitespace-nowrap mt-0.5">
                  {contact.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-zinc-800 text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#00E5FF] border border-black" />
          <span className="text-zinc-300">Левая нога</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FF4D00] border border-black" />
          <span className="text-zinc-300">Правая нога</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#00E676] border border-black" />
          <span className="text-zinc-300">Левая рука</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FFE600] border border-black" />
          <span className="text-zinc-300">Правая рука</span>
        </div>
      </div>
    </div>
  );
};
