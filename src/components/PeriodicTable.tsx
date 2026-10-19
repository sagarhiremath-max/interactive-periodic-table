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

      {/* Empty Search / Filter Results Message */}
      {hasAnyFilter && matchingCount === 0 && (
        <div
          className={`my-2 p-4 rounded-xl border text-center space-y-2 max-w-md mx-auto shrink-0 ${
            darkMode
              ? 'bg-slate-900/90 border-slate-700 text-slate-200'
              : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}
        >
          <SearchX className="mx-auto text-cyan-400" size={28} />
          <h4 className="text-xs sm:text-sm font-bold">
            No elements match your active filters {cleanQuery ? `(“${searchQuery}”)` : ''}
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Try adjusting your search query, block, category, or phase filters to view elements.
          </p>
          {onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
            >
              <RotateCcw size={12} />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      )}

      {/* Overflow scroll container on mobile and compact displays, full-fit on large screens */}
      <div
        ref={containerRef}
        className="w-full flex-1 min-h-0 flex flex-col overflow-x-auto overflow-y-auto rounded-xl transition-all border border-transparent focus-within:border-cyan-500/30"
        style={{ scrollbarWidth: 'thin' }}
        tabIndex={0}
        aria-label="Interactive periodic table of elements grid"
      >
        <div
          style={{
            minWidth: layoutMode === 'extended' ? '1420px' : '720px',
            transition: 'transform 0.15s ease-out',
          }}
          className="h-full flex-1 min-h-0 flex flex-col justify-between"
        >
          {/* Standard layout Group Headers (1 to 18) above the grid */}
          {layoutMode === 'standard' && (
            <div
              className="grid gap-0.5 sm:gap-1 pb-1 text-[9px] font-mono text-slate-400 text-center select-none shrink-0 pl-[18px]"
              style={{
                gridTemplateColumns: 'repeat(18, minmax(36px, 1fr))',
              }}
            >
              {groupLabelsStandard.map((grp) => (
                <div key={grp.num} className="flex flex-col items-center leading-none">
                  <span className="font-bold text-slate-400 text-[9px]">{grp.num}</span>
                  <span className="text-[7.5px] text-slate-500 leading-none">{grp.iupac.split(' ')[1]}</span>
                </div>
              ))}
            </div>
          )}

          {/* Main Grid: 18 columns standard or 32 columns extended with period labels */}
          <div className="flex flex-row items-stretch h-full flex-1 min-h-0 w-full gap-1">
            {/* Standard layout Period Headers (1 to 7) on the left */}
            {layoutMode === 'standard' && (
              <div
                className="grid text-[10px] font-mono font-bold text-slate-500 text-center select-none shrink-0"
                style={{
                  gridTemplateRows: 'repeat(7, minmax(clamp(50px, 6.2vh, 72px), 1fr)) clamp(6px, 0.8vh, 12px) repeat(2, minmax(clamp(50px, 6.2vh, 72px), 1fr))',
                  width: '14px',
                }}
              >
                {periods.map((p) => (
                  <div key={`p-${p}`} style={{ gridRowStart: p }} className="flex items-center justify-center leading-none">
                    {p}
                  </div>
                ))}
              </div>
            )}

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
                    ? 'repeat(7, minmax(clamp(50px, 6.2vh, 72px), 1fr))'
                    : 'repeat(7, minmax(clamp(50px, 6.2vh, 72px), 1fr)) clamp(6px, 0.8vh, 12px) repeat(2, minmax(clamp(50px, 6.2vh, 72px), 1fr))',
              }}
            >

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
                  className="rounded-lg p-1 border border-pink-500/40 bg-pink-950/20 hover:bg-pink-900/40 text-pink-300 flex flex-col items-center justify-between text-center transition-all cursor-pointer hover:scale-105 h-full min-h-0 select-none box-border"
                  title="Click to highlight Lanthanide series (57-71)"
                >
                  <span className="font-mono text-[clamp(7.5px,0.8vw,9.5px)] font-bold opacity-80 leading-none">57–71</span>
                  <span className="font-extrabold text-[clamp(11px,1.2vw,14px)] leading-none my-auto">La–Lu</span>
                  <span className="text-[clamp(6.5px,0.7vw,8px)] uppercase tracking-wider text-pink-400 font-bold leading-none truncate w-full px-0.5">
                    Lanthanides
                  </span>
                </button>

                {/* Actinides placeholder: Row 7, Col 3 */}
                <button
                  type="button"
                  onClick={() => onSelectCategory('actinide')}
                  style={{ gridColumnStart: 3, gridRowStart: 7 }}
                  className="rounded-lg p-1 border border-rose-500/40 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 flex flex-col items-center justify-between text-center transition-all cursor-pointer hover:scale-105 h-full min-h-0 select-none box-border"
                  title="Click to highlight Actinide series (89-103)"
                >
                  <span className="font-mono text-[clamp(7.5px,0.8vw,9.5px)] font-bold opacity-80 leading-none">89–103</span>
                  <span className="font-extrabold text-[clamp(11px,1.2vw,14px)] leading-none my-auto">Ac–Lr</span>
                  <span className="text-[clamp(6.5px,0.7vw,8px)] uppercase tracking-wider text-rose-400 font-bold leading-none truncate w-full px-0.5">
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
    </div>
  );
};
