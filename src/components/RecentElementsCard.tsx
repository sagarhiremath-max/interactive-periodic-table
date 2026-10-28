import React from 'react';
import { History, ArrowUpRight, Clock } from 'lucide-react';
import { type ElementData, CATEGORIES } from '../data/elements';

interface RecentElementsCardProps {
  recentNumbers: number[];
  elements: ElementData[];
  onSelectElement: (el: ElementData) => void;
  darkMode?: boolean;
}

export const RecentElementsCard: React.FC<RecentElementsCardProps> = ({
  recentNumbers,
  elements,
  onSelectElement,
  darkMode: _darkMode = false,
}) => {
  const recentElements = recentNumbers
    .map((num) => elements.find((el) => el.number === num))
    .filter((el): el is ElementData => Boolean(el))
    .slice(0, 6);

  return (
    <div className="p-5 border-2.5 border-black dark:border-white bg-white dark:bg-[#181818] text-black dark:text-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFF] flex flex-col justify-between font-mono">
      <div>
        <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 border-2 border-black bg-[#FFE600] text-black shadow-[2px_2px_0px_#000]">
              <History size={16} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">
                RECENTLY VIEWED
              </h3>
              <p className="text-[10px] text-neutral-600 dark:text-neutral-400 uppercase">
                LAST EXPLORED CHEMICAL AGENTS
              </p>
            </div>
          </div>
          <span className="text-xs font-black px-2 py-0.5 border border-black bg-black text-[#FFE600]">
            {recentElements.length} / 6
          </span>
        </div>

        {recentElements.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500 font-bold uppercase">
            <Clock size={28} strokeWidth={2.5} className="mx-auto mb-2 text-black dark:text-white" />
            No elements explored yet. Click any periodic cell.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
            {recentElements.map((el) => {
              const cat = CATEGORIES[el.category] || CATEGORIES['unknown'];
              return (
                <button
                  key={el.number}
                  type="button"
                  onClick={() => onSelectElement(el)}
                  className="group relative flex items-center gap-2 p-2 border-2 border-black dark:border-white bg-white dark:bg-[#222] text-left shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#FFF] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                >
                  <div
                    className="w-10 h-10 border-2 border-black flex flex-col items-center justify-center font-black text-xs shrink-0 shadow-[1px_1px_0px_0px_#000] text-black"
                    style={{
                      backgroundColor: '#FFE600',
                    }}
                  >
                    <span className="text-[8px] leading-none opacity-80">{el.number}</span>
                    <span className="text-sm font-black leading-none">{el.symbol}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black truncate uppercase group-hover:text-[#FF007A] transition-colors">
                      {el.name}
                    </p>
                    <p className="text-[9px] font-bold truncate uppercase text-neutral-600 dark:text-neutral-400">
                      {cat.name}
                    </p>
                  </div>

                  <ArrowUpRight
                    size={14}
                    strokeWidth={2.5}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-black dark:text-[#FFE600]"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
