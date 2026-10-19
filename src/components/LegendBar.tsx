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
  darkMode,
}) => {
  // Count elements per category
  const categoryCounts = elements.reduce((acc, el) => {
    acc[el.category] = (acc[el.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div
      className={`rounded-xl px-2.5 py-1.5 border transition-colors shrink-0 flex items-center justify-between gap-2 overflow-x-auto ${
        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}
    >
      <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 shrink-0 hidden sm:inline">
          Legend:
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
                borderColor: isSelected || isHovered ? cat.color : undefined,
                backgroundColor: isSelected ? `${cat.color}25` : undefined,
              }}
              className={`
                px-2 py-0.5 rounded-lg text-left border transition-all duration-150 flex items-center gap-1 shrink-0
                ${
                  isSelected
                    ? 'ring-1 ring-cyan-400 font-bold'
                    : isHovered
                    ? 'scale-[1.03] shadow-xs'
                    : 'hover:scale-[1.01]'
                }
                ${
                  darkMode
                    ? 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }
              `}
              title={`${cat.name} (${count} elements). Click to filter.`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-[10px] font-semibold truncate leading-none">
                {cat.name}
              </span>
              <span className="text-[8.5px] opacity-60 font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {selectedCategory !== 'all' && (
        <button
          onClick={() => onSelectCategory('all')}
          className="text-[10px] text-cyan-400 hover:underline font-semibold shrink-0 pl-1 whitespace-nowrap"
        >
          Reset Filter
        </button>
      )}
    </div>
  );
};
