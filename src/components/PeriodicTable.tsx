import React, { useRef } from 'react';
import type { ElementData } from '../data/elements';
import { ElementCell } from './ElementCell';

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
  onSelectElement: (element: ElementData) => void;
  onHoverElement: (element: ElementData | null, e?: React.MouseEvent<HTMLDivElement>) => void;
  onSelectCategory: (catId: string) => void;
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
  onSelectElement,
  onHoverElement,
  onSelectCategory,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const cleanQuery = searchQuery.trim().toLowerCase();

  // Helper to determine whether an element matches current active filters
  const isElementMatching = (el: ElementData): boolean => {
    // 1. Search Query
    if (cleanQuery) {
      const matchName = el.name.toLowerCase().includes(cleanQuery);
      const matchSymbol = el.symbol.toLowerCase() === cleanQuery || el.symbol.toLowerCase().startsWith(cleanQuery);
      const matchNum = `${el.number}` === cleanQuery;
      if (!matchName && !matchSymbol && !matchNum) return false;
    }

    // 2. Category selection
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

    // 3. Block selection
    if (selectedBlock !== 'all' && el.block !== selectedBlock) {
      return false;
    }

    // 4. State filter
    if (selectedStateFilter !== 'all' && el.standardState !== selectedStateFilter) {
      return false;
    }

    // 5. Legend hover
    if (hoveredCategory && el.category !== hoveredCategory) {
      return false;
    }

    return true;
  };

  const hasAnyFilter =
    Boolean(cleanQuery) ||
    selectedCategory !== 'all' ||
    selectedBlock !== 'all' ||
    selectedStateFilter !== 'all' ||
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
    <div className="relative w-full flex flex-col">
      {/* Top info bar */}
      <div className="flex items-center justify-between pb-2 px-1 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Layout: <strong className="text-white capitalize">{layoutMode}</strong></span>
          <span>•</span>
          <span className="hidden sm:inline">
            Hover element for preview, click for full Bohr model & physics
          </span>
        </div>
      </div>

      {/* Overflow scroll container */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto pb-4 pt-1 rounded-2xl transition-all"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div
          style={{
            minWidth: layoutMode === 'extended' ? '1400px' : '760px',
            transition: 'transform 0.15s ease-out',
          }}
          className="pb-2"
        >
          {/* Main Grid: 18 columns standard or 32 columns extended */}
          <div
            className={`grid gap-1 relative ${
              layoutMode === 'extended' ? 'grid-cols-32' : 'grid-cols-18'
            }`}
            style={{
              gridTemplateColumns:
                layoutMode === 'extended'
                  ? 'repeat(32, minmax(40px, 1fr))'
                  : 'repeat(18, minmax(38px, 1fr))',
              gridTemplateRows:
                layoutMode === 'extended'
                  ? 'repeat(7, auto)'
                  : 'repeat(10, auto)',
            }}
          >
            {/* Standard layout Group Headers (1 to 18) */}
            {layoutMode === 'standard' &&
              groupLabelsStandard.map((grp) => (
                <div
                  key={grp.num}
                  style={{ gridColumnStart: grp.num, gridRowStart: 1 }}
                  className="flex flex-col items-center justify-end pb-1 text-[10px] text-slate-400 font-mono text-center pointer-events-none -mt-5"
                >
                  <span className="font-bold text-slate-300">{grp.num}</span>
                  <span className="text-[8px] opacity-70 leading-none">{grp.iupac.split(' ')[1]}</span>
                </div>
              ))}

            {/* Standard layout Period Headers (1 to 7) */}
            {layoutMode === 'standard' &&
              periods.map((p) => (
                <div
                  key={`p-${p}`}
                  style={{ gridColumnStart: 1, gridRowStart: p }}
                  className="absolute -left-5 top-0 bottom-0 flex items-center justify-center text-xs font-mono font-bold text-slate-500 pointer-events-none"
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
                  layoutMode={layoutMode}
                  temperatureKelvin={temperatureKelvin}
                  darkMode={darkMode}
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
                  onClick={() => onSelectCategory('lanthanide')}
                  style={{ gridColumnStart: 3, gridRowStart: 6 }}
                  className="rounded-lg p-1.5 border border-pink-500/40 bg-pink-950/20 hover:bg-pink-900/40 text-pink-300 flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:scale-105"
                  title="Click to view Lanthanide series (57-71)"
                >
                  <span className="font-mono text-[9px] opacity-80">57-71</span>
                  <span className="font-bold text-xs">La-Lu</span>
                  <span className="text-[8px] uppercase tracking-wider text-pink-400 font-semibold mt-0.5">
                    Lanthanides
                  </span>
                </button>

                {/* Actinides placeholder: Row 7, Col 3 */}
                <button
                  onClick={() => onSelectCategory('actinide')}
                  style={{ gridColumnStart: 3, gridRowStart: 7 }}
                  className="rounded-lg p-1.5 border border-rose-500/40 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:scale-105"
                  title="Click to view Actinide series (89-103)"
                >
                  <span className="font-mono text-[9px] opacity-80">89-103</span>
                  <span className="font-bold text-xs">Ac-Lr</span>
                  <span className="text-[8px] uppercase tracking-wider text-rose-400 font-semibold mt-0.5">
                    Actinides
                  </span>
                </button>

                {/* Gap Row 8 Indicator / Spacer label */}
                <div
                  style={{ gridColumnStart: 1, gridRowStart: 8, gridColumnEnd: 19 }}
                  className="h-4 flex items-center justify-center"
                >
                  <div className="w-full border-t border-dashed border-white/10" />
                </div>

                {/* Lanthanide series title tag */}
                <div
                  style={{ gridColumnStart: 1, gridRowStart: 9, gridColumnEnd: 3 }}
                  className="flex items-center justify-end pr-2 text-right pointer-events-none"
                >
                  <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider">
                    Lanthanides ➔
                  </span>
                </div>

                {/* Actinide series title tag */}
                <div
                  style={{ gridColumnStart: 1, gridRowStart: 10, gridColumnEnd: 3 }}
                  className="flex items-center justify-end pr-2 text-right pointer-events-none"
                >
                  <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
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
