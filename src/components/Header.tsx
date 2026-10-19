import React, { useRef, useEffect, useState } from 'react';
import {
  Search,
  X,
  Sun,
  Moon,
  Columns,
  Grid,
  Award,
  ArrowRightLeft,
  RotateCcw,
  Atom,
} from 'lucide-react';
import { type ElementData, ELEMENTS_DATA, CATEGORIES } from '../data/elements';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchMatchCount: number;
  layoutMode: 'standard' | 'extended';
  onToggleLayout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenQuiz: () => void;
  onOpenCompare: () => void;
  onResetAll: () => void;
  hasActiveFiltersOrSearch: boolean;
  onSelectElement?: (el: ElementData) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  searchMatchCount,
  layoutMode,
  onToggleLayout,
  darkMode,
  onToggleDarkMode,
  onOpenQuiz,
  onOpenCompare,
  onResetAll,
  hasActiveFiltersOrSearch,
  onSelectElement,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Compute top 5 matching elements for instant autocomplete preview
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return ELEMENTS_DATA.filter(
      (el) =>
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase() === q ||
        el.symbol.toLowerCase().startsWith(q) ||
        `${el.number}` === q
    ).slice(0, 6);
  }, [searchQuery]);

  // Keyboard shortcut: Press '/' to quickly focus the search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle keyboard navigation inside search input
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchResults.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsDropdownOpen(true);
      setHighlightedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsDropdownOpen(true);
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetElement = highlightedIndex >= 0 ? searchResults[highlightedIndex] : searchResults[0];
      if (targetElement && onSelectElement) {
        onSelectElement(targetElement);
        setIsDropdownOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleClear = () => {
    onSearchChange('');
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    searchInputRef.current?.focus();
  };

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors px-3 sm:px-5 py-1.5 shrink-0 ${
        darkMode
          ? 'bg-slate-950/90 border-slate-800 text-white'
          : 'bg-white/90 border-slate-200 text-slate-900 shadow-xs'
      }`}
    >
      <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
        {/* Branding & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0">
            <Atom size={18} className="animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight leading-none bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Periodic Table
              </h1>
              <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                118 Elements
              </span>
            </div>
            <p className="hidden xl:block text-[10px] text-slate-400 leading-tight">
              Interactive Chemical Explorer & Atomic Reference
            </p>
          </div>
        </div>

        {/* Center: Search input with Keyboard Navigation Dropdown */}
        <div className="flex-1 max-w-md relative">
          <div className="relative flex items-center">
            <Search
              size={18}
              className="absolute left-3.5 text-slate-400 pointer-events-none"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsDropdownOpen(true);
                setHighlightedIndex(0);
              }}
              onFocus={() => {
                if (searchQuery.trim()) setIsDropdownOpen(true);
              }}
              onBlur={() => {
                // Short timeout to allow click to fire
                setTimeout(() => setIsDropdownOpen(false), 200);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Search name, symbol, number... (Press '/')"
              className={`w-full pl-9 pr-20 py-1.5 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 border ${
                darkMode
                  ? 'bg-slate-900/90 border-slate-700/80 text-white placeholder-slate-400'
                  : 'bg-slate-100/90 border-slate-300 text-slate-900 placeholder-slate-500'
              }`}
            />
            {searchQuery ? (
              <div className="absolute right-2 flex items-center gap-1">
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-400">
                  {searchMatchCount} found
                </span>
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear search query"
                  className="p-0.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <kbd className="absolute right-2.5 hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded">
                /
              </kbd>
            )}
          </div>

          {/* Autocomplete Quick Preview Dropdown */}
          {isDropdownOpen && searchResults.length > 0 && (
            <div
              className={`absolute left-0 right-0 top-full mt-1.5 rounded-2xl shadow-2xl border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 ${
                darkMode
                  ? 'bg-slate-900/95 border-slate-700/90 text-white backdrop-blur-xl'
                  : 'bg-white/95 border-slate-300 text-slate-900 backdrop-blur-xl shadow-slate-300/50'
              }`}
            >
              <div className="p-1.5 space-y-1">
                {searchResults.map((el, idx) => {
                  const cat = CATEGORIES[el.category] || CATEGORIES['unknown'];
                  const isHighlighted = idx === highlightedIndex;

                  return (
                    <button
                      key={el.number}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (onSelectElement) onSelectElement(el);
                        setIsDropdownOpen(false);
                      }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-colors ${
                        isHighlighted
                          ? darkMode
                            ? 'bg-cyan-500/20 text-white'
                            : 'bg-cyan-50 text-cyan-950 font-semibold'
                          : darkMode
                          ? 'hover:bg-white/5 text-slate-300'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border shrink-0"
                          style={{
                            backgroundColor: `${cat.color}20`,
                            borderColor: cat.color,
                            color: cat.color,
                          }}
                        >
                          {el.symbol}
                        </div>
                        <div>
                          <span className="text-xs font-bold block leading-tight">{el.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {el.categoryName} • P{el.period} G{el.group}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-cyan-400 block font-bold">
                          #{el.number}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {el.atomicMass} u
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="px-3 py-1.5 border-t border-white/5 text-[10px] text-slate-400 flex items-center justify-between bg-black/20">
                <span>↑↓ navigate • Enter to select • Esc to close</span>
                <span className="font-mono">{searchResults.length} of {searchMatchCount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Layout switch: Standard vs Extended */}
          <button
            type="button"
            onClick={onToggleLayout}
            title={
              layoutMode === 'standard'
                ? 'Switch to Extended 32-Column Layout'
                : 'Switch to Standard 18-Column Layout'
            }
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              layoutMode === 'extended'
                ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-xs'
                : darkMode
                ? 'bg-slate-900 border-slate-750 text-slate-300 hover:bg-slate-800'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {layoutMode === 'standard' ? <Grid size={13} /> : <Columns size={13} />}
            <span className="hidden sm:inline text-[11px]">
              {layoutMode === 'standard' ? 'Extended' : 'Standard'}
            </span>
          </button>

          {/* Side-by-side compare button */}
          <button
            type="button"
            onClick={onOpenCompare}
            title="Compare two elements side-by-side"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              darkMode
                ? 'bg-slate-900 border-slate-750 text-slate-300 hover:bg-slate-800 hover:text-cyan-400'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ArrowRightLeft size={13} />
            <span className="hidden lg:inline text-[11px]">Compare</span>
          </button>

          {/* Chemistry Quiz */}
          <button
            type="button"
            onClick={onOpenQuiz}
            title="Test your periodic table knowledge"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-sm shadow-orange-500/20 transition-all font-bold text-[11px]"
          >
            <Award size={13} />
            <span>Quiz</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`p-1.5 rounded-lg border transition-colors ${
              darkMode
                ? 'bg-slate-900 border-slate-750 text-amber-400 hover:bg-slate-800'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Reset Filters */}
          {hasActiveFiltersOrSearch && (
            <button
              type="button"
              onClick={onResetAll}
              title="Reset all filters and search"
              className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 transition-colors"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
