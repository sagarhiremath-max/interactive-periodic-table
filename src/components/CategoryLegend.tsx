import React from 'react';
import { type ElementData } from '../data/elements';

interface CategoryLegendProps {
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  hoveredCategory: string | null;
  onHoverCategory: (catId: string | null) => void;
  elements: ElementData[];
  darkMode?: boolean;
}

export interface LegendItem {
  id: string;
  name: string;
  color: string;
  count: number;
}

export const CategoryLegend: React.FC<CategoryLegendProps> = ({
  selectedCategory,
  onSelectCategory,
  hoveredCategory,
  onHoverCategory,
  elements,
}) => {
  // Compute counts for all standard categories + halogens
  const counts = React.useMemo(() => {
    const acc: Record<string, number> = {};
    elements.forEach((el) => {
      acc[el.category] = (acc[el.category] || 0) + 1;
      if (el.isHalogen) {
        acc['halogen'] = (acc['halogen'] || 0) + 1;
      }
    });
    return acc;
  }, [elements]);

  const items: LegendItem[] = [
    { id: 'alkali-metal', name: 'Alkali Metals', color: '#f43f5e', count: counts['alkali-metal'] || 0 },
    { id: 'alkaline-earth', name: 'Alkaline Earth', color: '#fb923c', count: counts['alkaline-earth'] || 0 },
    { id: 'transition-metal', name: 'Transition Metals', color: '#818cf8', count: counts['transition-metal'] || 0 },
    { id: 'post-transition-metal', name: 'Post-Transition', color: '#38bdf8', count: counts['post-transition-metal'] || 0 },
    { id: 'metalloid', name: 'Metalloids', color: '#2dd4bf', count: counts['metalloid'] || 0 },
    { id: 'reactive-nonmetal', name: 'Reactive Nonmetals', color: '#34d399', count: counts['reactive-nonmetal'] || 0 },
    { id: 'halogen', name: 'Halogens', color: '#facc15', count: counts['halogen'] || 0 },
    { id: 'noble-gas', name: 'Noble Gases', color: '#c084fc', count: counts['noble-gas'] || 0 },
    { id: 'lanthanide', name: 'Lanthanides', color: '#f472b6', count: counts['lanthanide'] || 0 },
    { id: 'actinide', name: 'Actinides', color: '#e879f9', count: counts['actinide'] || 0 },
    { id: 'unknown', name: 'Unknown', color: '#94a3b8', count: counts['unknown'] || 0 },
  ];

  return (
    <div className="w-full flex items-center justify-between gap-2 overflow-x-auto py-2.5 px-3 rounded-xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-md shadow-sm select-none">
      <div className="flex items-center gap-1.5 flex-nowrap">
        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-cyan-400 mr-1 shrink-0">
          CATEGORIES:
        </span>

        {items.map((item) => {
          const isSelected = selectedCategory === item.id;
          const isHovered = hoveredCategory === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectCategory(isSelected ? 'all' : item.id)}
              onMouseEnter={() => onHoverCategory(item.id)}
              onMouseLeave={() => onHoverCategory(null)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 shrink-0 cursor-pointer border ${
                isSelected
                  ? 'bg-slate-800 text-white border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/50'
                  : isHovered
                  ? 'bg-slate-800/80 text-white border-slate-600'
                  : 'bg-slate-900/40 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{
                  backgroundColor: item.color,
                  boxShadow: isSelected ? `0 0 8px ${item.color}` : undefined,
                }}
              />
              <span className="truncate max-w-[120px]">{item.name}</span>
              <span className="text-[9px] font-mono text-slate-400">
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {selectedCategory !== 'all' && (
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 hover:text-white transition-colors shrink-0 cursor-pointer"
        >
          Reset Filter
        </button>
      )}
    </div>
  );
};
