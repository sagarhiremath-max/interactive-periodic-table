import React from 'react';
import { CATEGORIES, type ElementData } from '../data/elements';

interface LegendBarProps {
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  hoveredCategory: string | null;
  onHoverCategory: (catId: string | null) => void;
  elements: ElementData[];
  darkMode: boolean;
}

export const LegendBar: React.FC<LegendBarProps> = ({
  selectedCategory,
  onSelectCategory,
  hoveredCategory,
  onHoverCategory,
  elements,
  darkMode: _darkMode,
}) => {
  // Count elements per category
  const categoryCounts = elements.reduce((acc, el) => {
    acc[el.category] = (acc[el.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div
      className="p-2.5 border-2 border-black dark:border-white bg-white dark:bg-[#181818] shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#FFF] shrink-0 flex items-center justify-between gap-3 overflow-x-auto font-mono"
    >
      <div className="flex items-center gap-2 flex-nowrap shrink-0">
        <span className="text-[10px] uppercase font-black tracking-wider shrink-0 text-black dark:text-[#FFE600] hidden sm:inline">
          LEGEND:
        </span>

        {Object.values(CATEGORIES).map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const isHovered = hoveredCategory === cat.id;
          const count = categoryCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
              onMouseEnter={() => onHoverCategory(cat.id)}
              onMouseLeave={() => onHoverCategory(null)}
              style={{
                backgroundColor: isSelected ? cat.color : undefined,
                color: isSelected ? '#000000' : undefined,
              }}
              className={`
                px-2.5 py-1 text-left border-2 border-black dark:border-white transition-all flex items-center gap-1.5 shrink-0 cursor-pointer
                ${
                  isSelected
                    ? 'font-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#FFF] translate-x-[-1px] translate-y-[-1px]'
                    : isHovered
                    ? 'shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#FFF] translate-x-[-1px] translate-y-[-1px] bg-neutral-100 dark:bg-neutral-800'
                    : 'bg-white dark:bg-[#222] text-black dark:text-white'
                }
              `}
              title={`${cat.name} (${count} elements). Click to filter.`}
            >
              <span
                className="w-2.5 h-2.5 shrink-0 border border-black shadow-[1px_1px_0px_0px_#000]"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-[10px] font-black uppercase truncate leading-none">
                {cat.name}
              </span>
              <span className="text-[9px] font-mono font-bold opacity-80">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {selectedCategory !== 'all' && (
        <button
          onClick={() => onSelectCategory('all')}
          className="text-[10px] font-black uppercase text-black dark:text-[#FFE600] bg-[#FFE600] dark:bg-black px-2 py-0.5 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] shrink-0 pl-1 whitespace-nowrap cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
        >
          [ SHOW ALL ]
        </button>
      )}
    </div>
  );
};
