import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { CATEGORIES, type ElementData } from '../data/elements';

interface CategoryExplorerCardProps {
  elements: ElementData[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  darkMode?: boolean;
}

export const CategoryExplorerCard: React.FC<CategoryExplorerCardProps> = ({
  elements,
  selectedCategory,
  onSelectCategory,
  darkMode: _darkMode = false,
}) => {
  // Count elements per category
  const counts = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const el of elements) {
      map[el.category] = (map[el.category] || 0) + 1;
    }
    return map;
  }, [elements]);

  const categoryList = Object.values(CATEGORIES);

  return (
    <div className="p-5 border-2.5 border-black dark:border-white bg-white dark:bg-[#181818] text-black dark:text-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFF] font-mono">
      <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
        <div className="flex items-center gap-2.5">
          <div className="p-2 border-2 border-black bg-[#00E5FF] text-black shadow-[2px_2px_0px_#000]">
            <Layers size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider">
              EXPLORE CATEGORIES
            </h3>
            <p className="text-[10px] text-neutral-600 dark:text-neutral-400 uppercase">
              FILTER PERIODIC TABLE BY CHEMICAL FAMILY
            </p>
          </div>
        </div>

        {selectedCategory !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className="text-xs font-black uppercase bg-[#FFE600] text-black border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
          >
            [ SHOW ALL ]
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-4">
        {categoryList.map((cat) => {
          const count = counts[cat.id] || 0;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
              className={`flex items-center gap-2 p-2 border-2 border-black dark:border-white text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#FFE600] text-black font-black shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#FFF] translate-x-[-1px] translate-y-[-1px]'
                  : 'bg-white dark:bg-[#222] text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#FFF] hover:translate-x-[-1px] hover:translate-y-[-1px]'
              }`}
            >
              <div
                className="w-3.5 h-3.5 shrink-0 border border-black shadow-[1px_1px_0px_#000]"
                style={{ backgroundColor: cat.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase truncate">
                  {cat.name}
                </p>
                <p className="text-[9px] font-bold uppercase text-neutral-600 dark:text-neutral-400">
                  {count} ELEMENTS
                </p>
              </div>
              <ArrowRight
                size={12}
                strokeWidth={3}
                className={`shrink-0 transition-transform ${
                  isSelected ? 'rotate-90 text-black' : ''
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
