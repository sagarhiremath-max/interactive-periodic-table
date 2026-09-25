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
      className={`rounded-2xl p-4 border transition-colors ${
        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Element Categories & Color Legend
          </span>
          <span className="text-[11px] text-slate-400">
            (Click any category to filter, or hover to highlight)
          </span>
        </div>

        {selectedCategory !== 'all' && (
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs text-cyan-400 hover:underline font-semibold"
          >
            Show All Elements
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
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
              }}
              className={`
                p-2 rounded-xl text-left border transition-all duration-150 flex flex-col justify-between
                ${
                  isSelected
                    ? 'ring-2 shadow-md scale-[1.03]'
                    : isHovered
                    ? 'scale-[1.02] shadow-sm'
                    : 'hover:scale-[1.01]'
                }
                ${
                  darkMode
                    ? 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }
              `}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-[11px] font-semibold truncate leading-tight">
                  {cat.name}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {count} {count === 1 ? 'element' : 'elements'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
