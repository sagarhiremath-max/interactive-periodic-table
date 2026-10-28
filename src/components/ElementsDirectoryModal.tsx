import React, { useState, useMemo } from 'react';
import { X, Search, Layers, ArrowUpDown, Star } from 'lucide-react';
import { type ElementData, CATEGORIES } from '../data/elements';

interface ElementsDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: ElementData[];
  onSelectElement: (el: ElementData) => void;
  isFavorite: (num: number) => boolean;
  onToggleFavorite: (num: number) => void;
  darkMode?: boolean;
}

export const ElementsDirectoryModal: React.FC<ElementsDirectoryModalProps> = ({
  isOpen,
  onClose,
  elements,
  onSelectElement,
  isFavorite,
  onToggleFavorite,
  darkMode: _darkMode = false,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [sortBy, setSortBy] = useState<'number' | 'name' | 'mass'>('number');
  const [sortAsc, setSortAsc] = useState(true);

  const filteredElements = useMemo(() => {
    let list = [...elements];
    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (el) =>
          el.name.toLowerCase().includes(q) ||
          el.symbol.toLowerCase() === q ||
          el.symbol.toLowerCase().startsWith(q) ||
          `${el.number}` === q
      );
    }

    if (selectedCat !== 'all') {
      list = list.filter((el) => el.category === selectedCat);
    }

    list.sort((a, b) => {
      let diff = 0;
      if (sortBy === 'number') diff = a.number - b.number;
      else if (sortBy === 'name') diff = a.name.localeCompare(b.name);
      else if (sortBy === 'mass') diff = a.atomicMassValue - b.atomicMassValue;
      return sortAsc ? diff : -diff;
    });

    return list;
  }, [elements, search, selectedCat, sortBy, sortAsc]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 font-mono select-none overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl max-h-[85vh] border-3 border-black dark:border-white bg-white dark:bg-[#181818] text-black dark:text-white shadow-[8px_8px_0px_0px_#000000] dark:shadow-[8px_8px_0px_0px_#FFFFFF] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b-2 border-black dark:border-white flex items-center justify-between bg-[#FFE600] text-black">
          <div className="flex items-center gap-2.5">
            <Layers size={20} strokeWidth={2.5} />
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider">
                ELEMENTS DIRECTORY // FULL DOSSIER
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 border-2 border-black bg-white hover:bg-[#FF007A] hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-5 py-3 border-b-2 border-black dark:border-white flex items-center gap-3 flex-wrap justify-between bg-neutral-100 dark:bg-[#141414]">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={15} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-white" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH NAME, SYMBOL, ATOMIC Z..."
              className="w-full pl-9 pr-3 py-1.5 border-2 border-black dark:border-white bg-white dark:bg-[#222] text-black dark:text-white text-xs font-black uppercase shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#FFF] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="text-xs border-2 border-black dark:border-white bg-white dark:bg-[#222] text-black dark:text-white font-black uppercase px-3 py-1.5 shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#FFF] focus:outline-none"
            >
              <option value="all">ALL CATEGORIES ({elements.length})</option>
              {Object.values(CATEGORIES).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.toUpperCase()}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                if (sortBy === 'number') setSortAsc(!sortAsc);
                else {
                  setSortBy('number');
                  setSortAsc(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-white dark:bg-[#222] text-black dark:text-white text-xs font-black uppercase shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#FFF] cursor-pointer hover:bg-[#FFE600] hover:text-black"
            >
              <ArrowUpDown size={12} strokeWidth={3} />
              <span>SORT Z {sortBy === 'number' ? (sortAsc ? '▲' : '▼') : ''}</span>
            </button>
          </div>
        </div>

        {/* Elements Grid List */}
        <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredElements.map((el) => {
              const cat = CATEGORIES[el.category] || CATEGORIES['unknown'];
              const fav = isFavorite(el.number);

              return (
                <div
                  key={el.number}
                  className="p-3 border-2 border-black dark:border-white bg-white dark:bg-[#222] text-black dark:text-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#FFF] flex items-center justify-between group hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectElement(el);
                      onClose();
                    }}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <div
                      className="w-10 h-10 border-2 border-black flex flex-col items-center justify-center font-black text-xs shrink-0 shadow-[1px_1px_0px_#000] text-black"
                      style={{
                        backgroundColor: '#FFE600',
                      }}
                    >
                      <span className="text-[8px] leading-none font-bold">
                        {el.number}
                      </span>
                      <span className="text-sm font-black leading-none">{el.symbol}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black uppercase transition-colors truncate group-hover:text-[#FF007A]">
                        {el.name}
                      </p>
                      <p className="text-[10px] truncate uppercase font-bold text-neutral-600 dark:text-neutral-400">
                        {el.atomicMass} u · {cat.name}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(el.number);
                    }}
                    className="p-1.5 border border-black bg-white dark:bg-black text-black dark:text-white hover:bg-[#FF007A] hover:text-white transition-colors ml-1 cursor-pointer"
                    title={fav ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star
                      size={14}
                      strokeWidth={2.5}
                      className={fav ? 'fill-[#FF007A] text-[#FF007A]' : ''}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
