import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Check, Trash2, Plus } from 'lucide-react';
import { type ElementData, ELEMENTS_DATA, CATEGORIES } from '../../data/elements';
import { ELEMENT_THEMES } from './compareUtils';

interface ElementSelectorCardProps {
  slotIndex: number; // 0, 1, or 2
  element: ElementData | null;
  onSelectElement: (el: ElementData | null) => void;
  canRemove?: boolean;
  onRemoveSlot?: () => void;
}

export const ElementSelectorCard: React.FC<ElementSelectorCardProps> = ({
  slotIndex,
  element,
  onSelectElement,
  canRemove = false,
  onRemoveSlot,
}) => {
  const theme = ELEMENT_THEMES[slotIndex] || ELEMENT_THEMES[0];
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categoryInfo = element ? CATEGORIES[element.category] || CATEGORIES['unknown'] : null;

  // Filter elements based on search term
  const filteredElements = useMemo(() => {
    if (!searchTerm.trim()) return ELEMENTS_DATA;
    const term = searchTerm.trim().toLowerCase();
    return ELEMENTS_DATA.filter(
      (el) =>
        el.symbol.toLowerCase() === term ||
        el.symbol.toLowerCase().startsWith(term) ||
        el.name.toLowerCase().includes(term) ||
        String(el.number) === term
    ).slice(0, 18);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (el: ElementData) => {
    onSelectElement(el);
    setIsSearching(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onSelectElement(null);
    setSearchTerm('');
    setIsSearching(false);
  };

  return (
    <div
      className={`relative rounded-xl bg-slate-900/80 border ${theme.border} p-2.5 sm:p-3 flex flex-col justify-between shadow-md transition-all duration-200 hover:${theme.borderActive}`}
      style={{
        borderLeftColor: theme.primary,
        borderLeftWidth: '3.5px',
      }}
    >
      {/* Top row: Slot badge and search/autocomplete input */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase ${theme.bgBadge} ${theme.textBadge} border ${theme.border}`}
          >
            {theme.name}
          </span>
          {element && (
            <span className="text-[11px] font-mono text-slate-400 font-semibold">#{element.number}</span>
          )}
        </div>

        {/* Search & Selector Input */}
        <div className="relative flex-1 max-w-[210px]">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onFocus={() => setIsSearching(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsSearching(true);
              }}
              placeholder={element ? `Change (${element.symbol})...` : 'Search & select element...'}
              className="w-full pl-6 pr-6 py-1 rounded-lg bg-slate-950/90 border border-slate-700/80 text-[11px] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors h-7"
            />
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  searchInputRef.current?.focus();
                }}
                className="p-0.5 text-slate-400 hover:text-white absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown Popover */}
          {isSearching && (
            <div
              ref={dropdownRef}
              className="absolute z-50 left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto rounded-xl bg-slate-950 border border-cyan-500/40 shadow-2xl p-1 space-y-0.5 text-xs"
              style={{ scrollbarWidth: 'thin' }}
            >
              {filteredElements.length === 0 ? (
                <div className="py-2.5 text-center text-slate-500 text-[11px] font-mono">No elements found</div>
              ) : (
                filteredElements.map((el) => {
                  const isCurrent = element && el.number === element.number;
                  return (
                    <button
                      key={el.number}
                      type="button"
                      onClick={() => handleSelect(el)}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded-md transition-colors cursor-pointer text-left ${
                        isCurrent
                          ? `${theme.bgBadge} ${theme.textBadge} font-bold`
                          : 'text-slate-200 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 text-right font-mono text-slate-500 text-[10px]">#{el.number}</span>
                        <span className="font-bold text-white w-5">{el.symbol}</span>
                        <span className="text-slate-300 truncate max-w-[90px] text-[11px]">{el.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 font-mono">{el.atomicMass}</span>
                        {isCurrent && <Check className="w-3 h-3 text-cyan-400" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Clear element button or remove slot button */}
        <div className="flex items-center gap-1 shrink-0">
          {element && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Clear selected element"
              aria-label="Clear element"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {canRemove && onRemoveSlot && (
            <button
              type="button"
              onClick={onRemoveSlot}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Remove this 3rd slot"
              aria-label="Remove slot"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main body: Render selected element details OR empty selection placeholder */}
      {element ? (
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
          {/* Symbol & Name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight bg-gradient-to-br ${theme.textGradient} bg-clip-text text-transparent shrink-0`}
            >
              {element.symbol}
            </span>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate leading-tight">
                {element.name}
              </h4>
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-400">{element.atomicMass} u</span>
            </div>
          </div>

          {/* Category & Structure */}
          <div className="text-right shrink-0 space-y-0.5">
            {categoryInfo && (
              <span
                className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold tracking-wide inline-block truncate max-w-[120px]"
                style={{
                  backgroundColor: `${categoryInfo.color}18`,
                  color: categoryInfo.color,
                  border: `1px solid ${categoryInfo.color}35`,
                }}
              >
                {element.categoryName}
              </span>
            )}
            <p className="text-[10px] font-mono text-slate-400">
              P{element.period} · G{element.group} · <span className="uppercase text-slate-300 font-semibold">{element.block}</span>
            </p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setIsSearching(true);
            searchInputRef.current?.focus();
          }}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-dashed border-slate-700/80 bg-slate-950/40 hover:bg-slate-950 hover:border-cyan-500/50 transition-all cursor-pointer text-slate-400 hover:text-white group"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold">Select an Element...</span>
        </button>
      )}
    </div>
  );
};
