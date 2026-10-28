import React from 'react';
import { Heart, ArrowUpRight, Star } from 'lucide-react';
import { type ElementData, CATEGORIES } from '../data/elements';

interface FavoriteElementsCardProps {
  favorites: Set<number>;
  elements: ElementData[];
  onSelectElement: (el: ElementData) => void;
  onExploreTable?: () => void;
  darkMode?: boolean;
}

export const FavoriteElementsCard: React.FC<FavoriteElementsCardProps> = ({
  favorites,
  elements,
  onSelectElement,
  onExploreTable,
  darkMode: _darkMode = false,
}) => {
  const favoriteElements = elements.filter((el) => favorites.has(el.number)).slice(0, 8);

  return (
    <div className="p-5 border-2.5 border-black dark:border-white bg-white dark:bg-[#181818] text-black dark:text-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFF] flex flex-col justify-between font-mono">
      <div>
        <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 border-2 border-black bg-[#FF007A] text-white shadow-[2px_2px_0px_#000]">
              <Heart size={16} strokeWidth={2.5} className="fill-white" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">
                FAVORITE ELEMENTS
              </h3>
              <p className="text-[10px] text-neutral-600 dark:text-neutral-400 uppercase">
                BOOKMARKED CHEMICAL RECORDS
              </p>
            </div>
          </div>
          <span className="text-xs font-black px-2 py-0.5 border border-black bg-[#FF007A] text-white">
            {favorites.size} SAVED
          </span>
        </div>

        {favoriteElements.length === 0 ? (
          <div className="py-7 text-center">
            <Star size={28} strokeWidth={2.5} className="mx-auto mb-2 text-black dark:text-white" />
            <p className="text-xs font-bold uppercase text-neutral-700 dark:text-neutral-300">
              No favorites saved yet.
            </p>
            <p className="text-[10px] text-neutral-500 uppercase mt-0.5">Click star on any element to bookmark it here.</p>
            {onExploreTable && (
              <button
                type="button"
                onClick={onExploreTable}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase border-2 border-black bg-[#FFE600] text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                BROWSE PERIODIC TABLE
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
            {favoriteElements.map((el) => {
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
                      backgroundColor: '#FF007A',
                      color: '#FFFFFF',
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
