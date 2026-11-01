import React, { useRef } from 'react';
import type { ElementData } from '../data/elements';
import { ElementCell } from './ElementCell';
import type { TrendType } from '../data/trends';
import { ChevronsLeftRight, SearchX, RotateCcw, Maximize2 } from 'lucide-react';
import { getStateAtTemperature } from '../utils/helpers';

interface PeriodicTableProps {
  elements: ElementData[];
  selectedElement: ElementData | null;
  hoveredElement: ElementData | null;
  hoveredCategory: string | null;
  selectedCategory: string;
  activeClassification: 'all' | 'metals' | 'nonmetals' | 'metalloids';
  activeStateFilter: 'all' | 'solid' | 'liquid' | 'gas';
  atomicRange: [number, number];
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
  onResetAllFilters?: () => void;
  onOpenFitView?: () => void;
}

export const PeriodicTable: React.FC<PeriodicTableProps> = ({
  elements,
  selectedElement,
  hoveredElement: _hoveredElement,
  hoveredCategory,
  selectedCategory,
  activeClassification,
  activeStateFilter,
  atomicRange,
  searchQuery,
  layoutMode,
  temperatureKelvin,
  darkMode,
  trendMode = 'none',
  onlyFavorites = false,
  isFavorite,
  onSelectElement,
  onHoverElement,
  onSelectCategory: _onSelectCategory,
  onResetAllFilters,
  onOpenFitView,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanQuery = searchQuery.trim().toLowerCase();

  // Element matching predicate
  const isElementMatching = (el: ElementData): boolean => {
    // 1. Favorites
    if (onlyFavorites && !isFavorite(el.number)) {
      return false;
    }

    // 2. Search
    if (cleanQuery) {
      const matchName = el.name.toLowerCase().includes(cleanQuery);
      const matchSymbol =
        el.symbol.toLowerCase() === cleanQuery ||
        el.symbol.toLowerCase().startsWith(cleanQuery);
      const matchNum = `${el.number}` === cleanQuery;
      if (!matchName && !matchSymbol && !matchNum) return false;
    }

    // 3. Category Filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'halogen') {
        if (!el.isHalogen) return false;
      } else if (el.category !== selectedCategory) {
        return false;
      }
    }

    // 4. Classification Filter
    if (activeClassification !== 'all') {
      if (activeClassification === 'metals' && !el.isMetal) return false;
      if (activeClassification === 'nonmetals' && !el.isNonmetal) return false;
      if (activeClassification === 'metalloids' && !el.isMetalloid) return false;
    }

    // 5. State Filter
    if (activeStateFilter !== 'all') {
      const state = getStateAtTemperature(el, temperatureKelvin);
      if (state !== activeStateFilter) return false;
    }

    // 6. Atomic Range
    if (el.number < atomicRange[0] || el.number > atomicRange[1]) {
      return false;
    }

    // 7. Hovered Category temporarily dims others
    if (hoveredCategory) {
      if (hoveredCategory === 'halogen') {
        if (!el.isHalogen) return false;
      } else if (el.category !== hoveredCategory) {
        return false;
      }
    }

    return true;
  };

  const matchingCount = elements.filter(isElementMatching).length;

  const hasAnyFilter =
    Boolean(cleanQuery) ||
    selectedCategory !== 'all' ||
    activeClassification !== 'all' ||
    activeStateFilter !== 'all' ||
    atomicRange[1] < 118 ||
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
    <div className="relative w-full flex flex-col justify-between">
      {/* Table Subtitle Bar */}
      <div className="flex items-center justify-between pb-2 text-[11px] font-mono text-slate-400 gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Layout: <strong className="text-cyan-400 capitalize">{layoutMode}</strong>
          </span>
          <span>•</span>
          <span className="hidden sm:inline text-slate-300">
            Click any element to inspect Bohr model, orbitals & thermals
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onResetAllFilters && (
            <button
              type="button"
              onClick={onResetAllFilters}
              className="h-8 inline-flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-rose-300 bg-slate-800/80 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 shadow-sm transition-all cursor-pointer"
              title="Reset every selection, filter, search, and active element"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Reset All</span>
            </button>
          )}

          {onOpenFitView && (
            <button
              type="button"
              onClick={onOpenFitView}
              className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 border border-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-all cursor-pointer"
              title="Show the complete periodic table fitted to screen without any scrolling"
            >
              <Maximize2 className="w-3 h-3 text-slate-950" strokeWidth={2.5} />
              <span className="uppercase tracking-tight">Full Table</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 lg:hidden font-medium">
            <ChevronsLeftRight className="w-3.5 h-3.5 animate-pulse" />
            <span>Scroll horizontally</span>
          </div>
        </div>
      </div>

      {/* Empty Search / Filter Results State */}
      {hasAnyFilter && matchingCount === 0 && (
        <div className="my-6 p-8 rounded-2xl bg-slate-900/80 border border-cyan-500/30 text-center space-y-3 max-w-md mx-auto backdrop-blur-md shadow-2xl">
          <SearchX className="mx-auto text-cyan-400" size={40} />
          <h4 className="text-base font-bold text-white uppercase font-mono">
            No Elements Match Criteria
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            No element found matching {cleanQuery ? `"${searchQuery}"` : 'the active filters'}.
            Try relaxing category, atomic range, or thermodynamic constraints.
          </p>
          {onResetAllFilters && (
            <button
              type="button"
              onClick={onResetAllFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      )}

      {/* Main Grid Container with horizontal scrollbar styling */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40 p-2 sm:p-3 shadow-inner"
        style={{ scrollbarWidth: 'thin' }}
        tabIndex={0}
        aria-label="Interactive periodic table of elements grid"
      >
        <div
          style={{
            minWidth: layoutMode === 'extended' ? '1480px' : '960px',
          }}
          className="w-full flex flex-col"
        >
          {/* Group Column Headers (1 to 18) for Standard Layout */}
          {layoutMode === 'standard' && (
            <div
              className="grid gap-1 pb-1.5 text-[9px] font-mono text-center select-none"
              style={{
                gridTemplateColumns: 'repeat(18, minmax(48px, 1fr))',
                paddingLeft: '22px',
              }}
            >
              {groupLabelsStandard.map((grp) => (
                <div key={grp.num} className="flex flex-col items-center leading-tight">
                  <span className="font-bold text-slate-300">{grp.num}</span>
                  <span className="text-[7.5px] text-slate-400">{grp.iupac.split(' ')[1]}</span>
                </div>
              ))}
            </div>
          )}

          {/* Grid Layout: Periods on Left + Element Cells */}
          <div className="flex flex-row items-stretch w-full gap-1.5">
            {/* Period Numbers (1 to 7) */}
            {layoutMode === 'standard' && (
              <div
                className="grid text-[10px] font-mono font-bold text-slate-400 text-center select-none shrink-0"
                style={{
                  gridTemplateRows: 'repeat(7, minmax(64px, 1fr)) 12px repeat(2, minmax(64px, 1fr))',
                  width: '18px',
                }}
              >
                {periods.map((p) => (
                  <div key={`p-${p}`} style={{ gridRowStart: p }} className="flex items-center justify-center">
                    {p}
                  </div>
                ))}
              </div>
            )}

            {/* Elements Matrix Grid */}
            <div
              className={`grid gap-1 relative w-full ${
                layoutMode === 'extended' ? 'grid-cols-32' : 'grid-cols-18'
              }`}
              style={{
                gridTemplateColumns:
                  layoutMode === 'extended'
                    ? 'repeat(32, minmax(42px, 1fr))'
                    : 'repeat(18, minmax(48px, 1fr))',
                gridTemplateRows:
                  layoutMode === 'extended'
                    ? 'repeat(7, minmax(64px, 1fr))'
                    : 'repeat(7, minmax(64px, 1fr)) 12px repeat(2, minmax(64px, 1fr))',
              }}
            >
              {/* Lanthanide & Actinide Placeholders in Standard Grid (row 6 col 3 & row 7 col 3) */}
              {layoutMode === 'standard' && (
                <>
                  <div
                    style={{ gridColumnStart: 3, gridRowStart: 6 }}
                    className="flex flex-col items-center justify-center p-1 rounded-lg border border-dashed border-pink-500/40 bg-pink-950/20 text-pink-300 font-mono text-center select-none"
                  >
                    <span className="text-[9px] font-bold">57-71</span>
                    <span className="text-[8px] uppercase tracking-tighter">La-Lu</span>
                  </div>

                  <div
                    style={{ gridColumnStart: 3, gridRowStart: 7 }}
                    className="flex flex-col items-center justify-center p-1 rounded-lg border border-dashed border-rose-500/40 bg-rose-950/20 text-rose-300 font-mono text-center select-none"
                  >
                    <span className="text-[9px] font-bold">89-103</span>
                    <span className="text-[8px] uppercase tracking-tighter">Ac-Lr</span>
                  </div>

                  {/* Lanthanide and Actinide series Row Labels at rows 9 and 10 */}
                  <div
                    style={{ gridColumnStart: 1, gridColumnEnd: 3, gridRowStart: 9 }}
                    className="flex items-center justify-end pr-2 font-mono text-[9px] font-bold text-pink-400 select-none uppercase tracking-wider"
                  >
                    Lanthanides
                  </div>

                  <div
                    style={{ gridColumnStart: 1, gridColumnEnd: 3, gridRowStart: 10 }}
                    className="flex items-center justify-end pr-2 font-mono text-[9px] font-bold text-fuchsia-400 select-none uppercase tracking-wider"
                  >
                    Actinides
                  </div>
                </>
              )}

              {/* Render all 118 Elements */}
              {elements.map((el) => {
                const matches = isElementMatching(el);
                const isSearchMatch = Boolean(
                  cleanQuery &&
                    (el.name.toLowerCase().includes(cleanQuery) ||
                      el.symbol.toLowerCase() === cleanQuery ||
                      el.symbol.toLowerCase().startsWith(cleanQuery) ||
                      `${el.number}` === cleanQuery)
                );

                return (
                  <ElementCell
                    key={el.number}
                    element={el}
                    isSelected={selectedElement?.number === el.number}
                    isHovered={_hoveredElement?.number === el.number}
                    isDimmed={!matches}
                    isSearchMatch={isSearchMatch}
                    isFavorite={isFavorite(el.number)}
                    layoutMode={layoutMode}
                    temperatureKelvin={temperatureKelvin}
                    darkMode={darkMode}
                    trendMode={trendMode}
                    onClick={onSelectElement}
                    onMouseEnter={onHoverElement}
                    onMouseLeave={() => onHoverElement(null)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
