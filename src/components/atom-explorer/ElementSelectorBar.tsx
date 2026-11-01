import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Dice5, X, Check } from 'lucide-react';
import { type ElementData, ELEMENTS_DATA, CATEGORIES } from '../../data/elements';

interface ElementSelectorBarProps {
  currentElement: ElementData;
  onSelectElement: (element: ElementData) => void;
}

export const ElementSelectorBar: React.FC<ElementSelectorBarProps> = ({
  currentElement,
  onSelectElement,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter elements: if query is empty, return ALL 118 elements!
  const filtered = useMemo(() => {
    if (!query.trim()) {
      return ELEMENTS_DATA; // Shows all 118 elements
    }
    const q = query.toLowerCase().trim();
    return ELEMENTS_DATA.filter((el) => {
      return (
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase() === q ||
        el.symbol.toLowerCase().startsWith(q) ||
        String(el.number) === q ||
        el.categoryName.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const handlePrev = () => {
    const prevNum = currentElement.number > 1 ? currentElement.number - 1 : 118;
    const prevEl = ELEMENTS_DATA.find((e) => e.number === prevNum);
    if (prevEl) onSelectElement(prevEl);
  };

  const handleNext = () => {
    const nextNum = currentElement.number < 118 ? currentElement.number + 1 : 1;
    const nextEl = ELEMENTS_DATA.find((e) => e.number === nextNum);
    if (nextEl) onSelectElement(nextEl);
  };

  const handleRandom = () => {
    const rndIdx = Math.floor(Math.random() * ELEMENTS_DATA.length);
    onSelectElement(ELEMENTS_DATA[rndIdx]);
  };

  // Quick jump presets
  const quickElements = [1, 2, 6, 7, 8, 11, 26, 79, 92]; // H, He, C, N, O, Na, Fe, Au, U

  return (
    <div className="w-full space-y-2.5 font-sans">
      {/* Main Bar: Prev Arrow, Search Box with Dropdown, Dropdown Selector, Next Arrow, Random Dice */}
      <div className="flex items-center gap-2">
        {/* Navigation Arrow Left */}
        <button
          type="button"
          onClick={handlePrev}
          className="h-9 w-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
          title={`Previous: #${currentElement.number > 1 ? currentElement.number - 1 : 118}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Search & All Elements Autocomplete Box */}
        <div ref={dropdownRef} className="relative flex-1">
          <div className="relative flex items-center">
            {/* Clickable Search Icon Button - opens/shows all elements */}
            <button
              type="button"
              onClick={() => {
                setIsOpen((prev) => !prev);
                inputRef.current?.focus();
              }}
              className="absolute left-2.5 p-1 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Click to show all 118 elements"
              aria-label="Show all elements"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onClick={() => setIsOpen(true)}
              onFocus={() => setIsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false);
                }
              }}
              placeholder="Search or click to view all 118 elements..."
              className="w-full h-9 pl-9 pr-8 text-xs font-mono rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all cursor-text"
            />

            {/* Clear or Dropdown Toggle indicator */}
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setIsOpen(true);
                  inputRef.current?.focus();
                }}
                className="absolute right-2.5 p-0.5 rounded text-slate-400 hover:text-white cursor-pointer"
                title="Clear search filter"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen((prev) => !prev);
                  inputRef.current?.focus();
                }}
                className="absolute right-2.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-cyan-400/80 hover:text-cyan-300 bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition-colors cursor-pointer"
                title="View all 118 elements"
              >
                All 118
              </button>
            )}
          </div>

          {/* All 118 Elements Autocomplete Dropdown */}
          {isOpen && (
            <div
              ref={listRef}
              className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl bg-slate-950/95 border border-cyan-500/40 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-xl overflow-hidden font-mono text-xs max-h-72 sm:max-h-80 overflow-y-auto flex flex-col"
              style={{ scrollbarWidth: 'thin' }}
            >
              {/* Sticky Header with Element Count */}
              <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md shrink-0">
                <span className="text-cyan-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  {query.trim()
                    ? `${filtered.length} Matching Elements for "${query}"`
                    : `All 118 Chemical Elements`}
                </span>
                <span className="text-slate-500 text-[10px]">Click any to explore • Esc to close</span>
              </div>

              {/* Elements List */}
              <div className="divide-y divide-slate-800/60">
                {filtered.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs font-mono">
                    No elements found matching "{query}".
                  </div>
                ) : (
                  filtered.map((el) => {
                    const isSelected = el.number === currentElement.number;
                    const cat = CATEGORIES[el.category] || CATEGORIES['unknown'];

                    return (
                      <button
                        key={el.number}
                        type="button"
                        onClick={() => {
                          onSelectElement(el);
                          setQuery('');
                          setIsOpen(false);
                        }}
                        className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors cursor-pointer group ${
                          isSelected
                            ? 'bg-cyan-950/80 text-cyan-200 border-l-4 border-cyan-400'
                            : 'hover:bg-slate-900/90 text-slate-200 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Atomic number badge */}
                          <span
                            className={`w-8 text-right font-bold text-[11px] ${
                              isSelected ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400'
                            }`}
                          >
                            #{el.number}
                          </span>

                          {/* Category Dot */}
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                            title={el.categoryName}
                          />

                          {/* Symbol */}
                          <span
                            className="font-bold text-sm w-7 shrink-0"
                            style={{ color: isSelected ? '#22d3ee' : cat.color }}
                          >
                            {el.symbol}
                          </span>

                          {/* Name */}
                          <span className="text-white font-medium truncate text-xs">
                            {el.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 text-right">
                          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                            {el.atomicMass} u
                          </span>
                          <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                            {el.categoryName}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-cyan-400 ml-1 shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dropdown Selector for All 118 Elements */}
        <select
          value={currentElement.number}
          onChange={(e) => {
            const el = ELEMENTS_DATA.find((x) => x.number === Number(e.target.value));
            if (el) onSelectElement(el);
          }}
          className="h-9 px-2.5 text-xs font-mono font-bold bg-slate-900/90 border border-slate-700/80 text-cyan-300 rounded-xl focus:outline-none focus:border-cyan-400 cursor-pointer max-w-[130px] sm:max-w-[150px] truncate shadow-xs"
          title="Jump to element"
        >
          {ELEMENTS_DATA.map((elem) => (
            <option key={elem.number} value={elem.number}>
              #{elem.number} {elem.symbol} — {elem.name}
            </option>
          ))}
        </select>

        {/* Navigation Arrow Right */}
        <button
          type="button"
          onClick={handleNext}
          className="h-9 w-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
          title={`Next: #${currentElement.number < 118 ? currentElement.number + 1 : 1}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Random Dice Button */}
        <button
          type="button"
          onClick={handleRandom}
          className="h-9 w-9 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 hover:border-amber-400 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
          title="Pick random element"
        >
          <Dice5 className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Jump Element Badges (H, He, C, N, O, Na, Fe, Au, U) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-mono">
        <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 mr-1">
          Quick Jump:
        </span>
        {quickElements.map((z) => {
          const el = ELEMENTS_DATA.find((x) => x.number === z);
          if (!el) return null;
          const isSelected = el.number === currentElement.number;
          return (
            <button
              key={z}
              type="button"
              onClick={() => onSelectElement(el)}
              className={`px-2 py-0.5 rounded-lg font-bold shrink-0 transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-800 hover:text-white'
              }`}
            >
              {el.symbol} <span className="text-[9px] font-normal opacity-75">{el.number}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
