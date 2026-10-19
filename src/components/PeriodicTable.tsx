import React, { useRef } from 'react';
import type { ElementData } from '../data/elements';
import { ElementCell } from './ElementCell';
import type { TrendType } from '../data/trends';
import { ChevronsLeftRight, SearchX, RotateCcw } from 'lucide-react';

interface PeriodicTableProps {
  elements: ElementData[];
  selectedElement: ElementData | null;
  hoveredElement: ElementData | null;
  hoveredCategory: string | null;
  selectedCategory: string;
  selectedBlock: string;
  selectedStateFilter: string;
  searchQuery: string;
  layoutMode: 'standard' | 'extended';
  temperatureKelvin: number;
  darkMode: boolean;
  trendMode?: TrendType;
  onlyFavorites?: boolean;
  isFavorite: (num: number) => boolean;
  onSelectElement: (element: ElementData) => void;
  onHoverElement: (element: ElementData | null, e?: React.MouseEvent<HTMLDivElement>) => void;
  onSelectCategory: (catId: string) => void;
  onClearSearch?: () => void;
}

export const PeriodicTable: React.FC<PeriodicTableProps> = ({
  elements,
  selectedElement,
  hoveredElement,
  hoveredCategory,
  selectedCategory,
  selectedBlock,
  selectedStateFilter,
  searchQuery,
  layoutMode,
  temperatureKelvin,
  darkMode,
  trendMode = 'none',
  onlyFavorites = false,
  isFavorite,
  onSelectElement,
  onHoverElement,
  onSelectCategory,
  onClearSearch,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const cleanQuery = searchQuery.trim().toLowerCase();

  // Helper to determine whether an element matches current active filters
  const isElementMatching = (el: ElementData): boolean => {
    // 1. Only Favorites filter
    if (onlyFavorites && !isFavorite(el.number)) {
      return false;
    }

    // 2. Search Query (name, symbol, or atomic number)
    if (cleanQuery) {
      const matchName = el.name.toLowerCase().includes(cleanQuery);
      const matchSymbol = el.symbol.toLowerCase() === cleanQuery || el.symbol.toLowerCase().startsWith(cleanQuery);
      const matchNum = `${el.number}` === cleanQuery;
      if (!matchName && !matchSymbol && !matchNum) return false;
    }

    // 3. Category selection
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'metals' && !el.isMetal) return false;
      if (selectedCategory === 'nonmetals' && !el.isNonmetal) return false;
      if (selectedCategory === 'metalloids' && !el.isMetalloid) return false;
      if (selectedCategory === 'halogens' && !el.isHalogen) return false;
      if (
        !['metals', 'nonmetals', 'metalloids', 'halogens'].includes(selectedCategory) &&
        el.category !== selectedCategory
      ) {
        return false;
      }
    }

    // 4. Block selection
    if (selectedBlock !== 'all' && el.block !== selectedBlock) {
      return false;
    }

    // 5. State filter
    if (selectedStateFilter !== 'all' && el.standardState !== selectedStateFilter) {
      return false;
    }

    // 6. Legend hover
    if (hoveredCategory && el.category !== hoveredCategory) {
      return false;
    }

    return true;
  };

  const matchingCount = elements.filter(isElementMatching).length;

  const hasAnyFilter =
    Boolean(cleanQuery) ||
    selectedCategory !== 'all' ||
    selectedBlock !== 'all' ||
    selectedStateFilter !== 'all' ||
    onlyFavorites ||
    Boolean(hoveredCategory);

  const groupLabelsStandard = [
    { num: 1, iupac: '1 (IA)' },
    { num: 2, iupac: '2 (IIA)' },
    { num: 3, iupac: '3 (IIIB)' },
    { num: 4, iupac: '4 (IVB)' },
    { num: 5, iupac: '5 (VB)' },
    { num: 6, iupac: '6 (VIB)' },
    { num: 7, iupac: '7 (VIIB)' },
    { num: 8, iupac: '8 (VIII)' },
    { num: 9, iupac: '9 (VIII)' },
    { num: 10, iupac: '10 (VIII)' },
    { num: 11, iupac: '11 (IB)' },
    { num: 12, iupac: '12 (IIB)' },
    { num: 13, iupac: '13 (IIIA)' },
    { num: 14, iupac: '14 (IVA)' },
    { num: 15, iupac: '15 (VA)' },
    { num: 16, iupac: '16 (VIA)' },
    { num: 17, iupac: '17 (VIIA)' },
    { num: 18, iupac: '18 (VIIIA)' },
  ];

  const periods = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="relative w-full h-full flex-1 min-h-0 flex flex-col justify-between">
      {/* Top info bar */}
      <div className="flex items-center justify-between pb-1 px-1 text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span>
            Layout: <strong className="text-white capitalize">{layoutMode}</strong>
          </span>
          <span>•</span>
          <span className="hidden sm:inline">
            Click any element for Bohr model, properties & applications
          </span>
        </div>

        {/* Mobile scroll hint */}
        <div className="flex items-center gap-1 text-[10px] text-cyan-400 lg:hidden animate-pulse">
          <ChevronsLeftRight size={12} />
          <span>Scroll horizontally</span>
        </div>
      </div>

      {/* Empty Search Results Message */}
      {cleanQuery && matchingCount === 0 && (
        <div
          className={`my-3 p-5 rounded-2xl border text-center space-y-2.5 max-w-lg mx-auto ${
            darkMode
              ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
              : 'bg-rose-50 border-rose-200 text-rose-900 shadow-sm'
          }`}
        >
          <SearchX className="mx-auto text-rose-400" size={32} />
          <h4 className="text-sm font-bold">
            No chemical elements found matching &ldquo;{searchQuery}&rdquo;
          </h4>
          <p className="text-xs text-slate-300">
            Suggestions: search by symbol (e.g. <strong>Fe</strong>, <strong>Au</strong>, <strong>U</strong>), atomic number (<strong>1–118</strong>), or element name.
          </p>
          {onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-colors"
            >
              <RotateCcw size={13} />
              <span>Clear Search Query</span>
            </button>
          )}
        </div>
      )}

      {/* Overflow scroll container on mobile, full-fit on desktop */}
      <div
        ref={containerRef}
        className="w-full flex-1 min-h-0 flex flex-col overflow-x-auto overflow-y-hidden rounded-xl transition-all border border-transparent focus-within:border-cyan-500/30"
        style={{ scrollbarWidth: 'thin' }}
        tabIndex={0}
        aria-label="Interactive periodic table of elements grid"
      >
        <div
          style={{
            minWidth: layoutMode === 'extended' ? '1420px' : '720px',
            transition: 'transform 0.15s ease-out',
          }}
          className="h-full flex-1 min-h-0 flex flex-col justify-center"
        >
          {/* Main Grid: 18 columns standard or 32 columns extended */}
          <div
            className={`grid gap-0.5 sm:gap-1 relative h-full flex-1 min-h-0 ${
              layoutMode === 'extended' ? 'grid-cols-32' : 'grid-cols-18'
            }`}
            style={{
              gridTemplateColumns:
                layoutMode === 'extended'
                  ? 'repeat(32, minmax(36px, 1fr))'
                  : 'repeat(18, minmax(36px, 1fr))',
              gridTemplateRows:
                layoutMode === 'extended'
                  ? 'repeat(7, minmax(0, 1fr))'
                  : 'repeat(7, minmax(0, 1fr)) clamp(2px, 0.4vh, 6px) repeat(2, minmax(0, 1fr))',
            }}
          >
            {/* Standard layout Group Headers (1 to 18) */}
            {layoutMode === 'standard' &&
              groupLabelsStandard.map((grp) => (
                <div
                  key={grp.num}
                  style={{ gridColumnStart: grp.num, gridRowStart: 1 }}
                  className="flex flex-col items-center justify-end pb-0.5 text-[9px] text-slate-400 font-mono text-center pointer-events-none -mt-3.5"
                >
                  <span className="font-bold text-slate-300">{grp.num}</span>
                  <span className="text-[7.5px] opacity-70 leading-none">{grp.iupac.split(' ')[1]}</span>
                </div>
              ))}

            {/* Standard layout Period Headers (1 to 7) */}
            {layoutMode === 'standard' &&
              periods.map((p) => (
                <div
                  key={`p-${p}`}
                  style={{ gridColumnStart: 1, gridRowStart: p }}
                  className="absolute -left-4 top-0 bottom-0 flex items-center justify-center text-[10px] font-mono font-bold text-slate-500 pointer-events-none"
                  aria-hidden="true"
                >
                  {p}
                </div>
              ))}

            {/* Render all 118 Elements */}
            {elements.map((el) => {
              const matches = isElementMatching(el);
              const isDimmed = hasAnyFilter && !matches;
              const isSearchMatch = Boolean(cleanQuery && matches);
              const isSelected = selectedElement?.number === el.number;
              const isHovered = hoveredElement?.number === el.number;

              return (
                <ElementCell
                  key={el.number}
                  element={el}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  isDimmed={isDimmed}
                  isSearchMatch={isSearchMatch}
                  isFavorite={isFavorite(el.number)}
                  layoutMode={layoutMode}
                  temperatureKelvin={temperatureKelvin}
                  darkMode={darkMode}
                  trendMode={trendMode}
                  onClick={onSelectElement}
                  onMouseEnter={(element, e) => onHoverElement(element, e)}
                  onMouseLeave={() => onHoverElement(null)}
                />
              );
            })}

            {/* Lanthanide & Actinide Placeholders in Standard Layout */}
            {layoutMode === 'standard' && (
              <>
                {/* Lanthanides placeholder: Row 6, Col 3 */}
                <button
                  type="button"
                  onClick={() => onSelectCategory('lanthanide')}
                  style={{ gridColumnStart: 3, gridRowStart: 6 }}
                  className="rounded-lg p-0.5 sm:p-1 border border-pink-500/40 bg-pink-950/20 hover:bg-pink-900/40 text-pink-300 flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:scale-105 h-full min-h-0"
                  title="Click to highlight Lanthanide series (57-71)"
                >
                  <span className="font-mono text-[8px] opacity-80 leading-none">57-71</span>
                  <span className="font-bold text-[10px] sm:text-xs leading-tight">La-Lu</span>
                  <span className="text-[7px] uppercase tracking-wider text-pink-400 font-semibold hidden sm:inline">
                    Lanthanides
                  </span>
                </button>

                {/* Actinides placeholder: Row 7, Col 3 */}
                <button
                  type="button"
                  onClick={() => onSelectCategory('actinide')}
                  style={{ gridColumnStart: 3, gridRowStart: 7 }}
                  className="rounded-lg p-0.5 sm:p-1 border border-rose-500/40 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:scale-105 h-full min-h-0"
                  title="Click to highlight Actinide series (89-103)"
                >
                  <span className="font-mono text-[8px] opacity-80 leading-none">89-103</span>
                  <span className="font-bold text-[10px] sm:text-xs leading-tight">Ac-Lr</span>
                  <span className="text-[7px] uppercase tracking-wider text-rose-400 font-semibold hidden sm:inline">
                    Actinides
                  </span>
                </button>

                {/* Gap Row 8 Indicator / Spacer label */}
                <div
                  style={{ gridColumnStart: 1, gridRowStart: 8, gridColumnEnd: 19 }}
                  className="flex items-center justify-center h-full min-h-0"
                >
                  <div className="w-full border-t border-dashed border-white/10" />
                </div>

                {/* Lanthanide series title tag */}
                <div
                  style={{ gridColumnStart: 1, gridRowStart: 9, gridColumnEnd: 3 }}
                  className="flex items-center justify-end pr-1 sm:pr-2 text-right pointer-events-none"
                >
                  <span className="text-[9px] sm:text-[10px] font-bold text-pink-400 uppercase tracking-wider truncate">
                    Lanthanides ➔
                  </span>
                </div>

                {/* Actinide series title tag */}
                <div
                  style={{ gridColumnStart: 1, gridRowStart: 10, gridColumnEnd: 3 }}
                  className="flex items-center justify-end pr-1 sm:pr-2 text-right pointer-events-none"
                >
                  <span className="text-[9px] sm:text-[10px] font-bold text-rose-400 uppercase tracking-wider truncate">
                    Actinides ➔
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
