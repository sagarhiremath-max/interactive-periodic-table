import React, { useEffect, useRef, useState } from 'react';
import { type ElementData, CATEGORIES } from '../data/elements';
import { getStateAtTemperature, getStateColor } from '../utils/helpers';
import { Atom, Minimize2, X, Sparkles, ChevronRight } from 'lucide-react';

interface FitTableViewProps {
  isOpen: boolean;
  onClose: () => void;
  elements: ElementData[];
  selectedElement: ElementData | null;
  onSelectElement: (element: ElementData) => void;
  darkMode?: boolean;
  temperatureKelvin?: number;
}

const GROUP_LABELS = [
  { num: 1, iupac: 'IA' },
  { num: 2, iupac: 'IIA' },
  { num: 3, iupac: 'IIIB' },
  { num: 4, iupac: 'IVB' },
  { num: 5, iupac: 'VB' },
  { num: 6, iupac: 'VIB' },
  { num: 7, iupac: 'VIIB' },
  { num: 8, iupac: 'VIIIB' },
  { num: 9, iupac: 'VIIIB' },
  { num: 10, iupac: 'VIIIB' },
  { num: 11, iupac: 'IB' },
  { num: 12, iupac: 'IIB' },
  { num: 13, iupac: 'IIIA' },
  { num: 14, iupac: 'IVA' },
  { num: 15, iupac: 'VA' },
  { num: 16, iupac: 'VIA' },
  { num: 17, iupac: 'VIIA' },
  { num: 18, iupac: 'VIIIA' },
];

export const FitTableView: React.FC<FitTableViewProps> = ({
  isOpen,
  onClose,
  elements,
  selectedElement,
  onSelectElement,
  darkMode = true,
  temperatureKelvin = 293.15,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [hoveredEl, setHoveredEl] = useState<ElementData | null>(null);

  // Reference base dimensions for a 18x10 periodic table matrix
  const BASE_WIDTH = 1260;
  const BASE_HEIGHT = 680;

  // Dynamically compute exact scale factor to fit 100% within viewport without any scrollbar
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (!containerRef.current) return;
      const paddingX = 24;
      const paddingY = 20;
      const availableWidth = containerRef.current.clientWidth - paddingX;
      const availableHeight = containerRef.current.clientHeight - paddingY;

      if (availableWidth > 0 && availableHeight > 0) {
        const scaleX = availableWidth / BASE_WIDTH;
        const scaleY = availableHeight / BASE_HEIGHT;
        const bestScale = Math.min(scaleX, scaleY);
        // Clamp scale within practical limits
        setScale(Math.max(0.28, Math.min(bestScale, 1.45)));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    // Extra timeout for layout reflow
    const t = setTimeout(handleResize, 60);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(t);
    };
  }, [isOpen]);

  // Keyboard shortcut: Esc to exit fit view
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const periods = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#050814] text-slate-100 overflow-hidden select-none animate-in fade-in duration-200"
      style={{ touchAction: 'none' }}
    >
      {/* 1. Header Toolbar */}
      <header className="h-12 px-4 sm:px-6 bg-[#090d22]/95 border-b border-cyan-500/20 flex items-center justify-between shrink-0 shadow-md">
        {/* Left: Title & No-Scroll Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Atom className="w-4 h-4 animate-spin-slow" />
          </div>

          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-black tracking-wide text-white uppercase font-mono">
              Complete Periodic Table
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              All 118 Elements
            </span>
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 border border-emerald-400/40 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Fitted (Zero Scrolling)
            </span>
          </div>
        </div>

        {/* Center: Live Hover Info Pill */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
          {hoveredEl ? (
            <div className="flex items-center gap-2 text-cyan-300">
              <span className="font-bold text-white">#{hoveredEl.number} {hoveredEl.name} ({hoveredEl.symbol})</span>
              <span>•</span>
              <span className="text-slate-400">{hoveredEl.atomicMass} u</span>
              <span>•</span>
              <span className="text-slate-300">{hoveredEl.categoryName}</span>
              <span>•</span>
              <span className="text-emerald-400 capitalize">{getStateAtTemperature(hoveredEl, temperatureKelvin)}</span>
            </div>
          ) : (
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Hover or click any element card to inspect details & Bohr model
            </span>
          )}
        </div>

        {/* Right: Exit / Return Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 hover:border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all cursor-pointer"
            title="Return to standard page view (Escape)"
          >
            <Minimize2 size={14} className="text-cyan-400" />
            <span>Exit Full Table</span>
            <kbd className="hidden sm:inline px-1 py-0.2 rounded bg-black/40 text-[9px] text-slate-400 font-mono ml-0.5">
              Esc
            </kbd>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close fit view"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* 2. Main Stage: 100% Fitted Grid with Zero Scrolling */}
      <main
        ref={containerRef}
        className="flex-1 w-full overflow-hidden flex items-center justify-center p-2 relative bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.06)_0%,_transparent_70%)]"
      >
        <div
          style={{
            width: `${BASE_WIDTH}px`,
            height: `${BASE_HEIGHT}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
          className="relative shrink-0 flex flex-col justify-between"
        >
          {/* Top Group Headers 1 to 18 */}
          <div
            className="grid gap-1 pb-1 text-[9px] font-mono text-center select-none"
            style={{
              gridTemplateColumns: 'repeat(18, minmax(0, 1fr))',
              paddingLeft: '24px',
            }}
          >
            {GROUP_LABELS.map((grp) => (
              <div key={grp.num} className="flex flex-col items-center leading-none">
                <span className="font-bold text-slate-300 text-[10px]">{grp.num}</span>
                <span className="text-[7.5px] text-slate-500">{grp.iupac}</span>
              </div>
            ))}
          </div>

          {/* Matrix Grid: Period numbers + All 118 elements */}
          <div className="flex flex-row items-stretch w-full gap-1.5 flex-1">
            {/* Period Numbers 1 to 7 */}
            <div
              className="grid text-[10px] font-mono font-bold text-slate-400 text-center select-none shrink-0"
              style={{
                gridTemplateRows: 'repeat(7, minmax(0, 1fr)) 12px repeat(2, minmax(0, 1fr))',
                width: '18px',
              }}
            >
              {periods.map((p) => (
                <div key={`p-${p}`} style={{ gridRowStart: p }} className="flex items-center justify-center text-slate-400 text-xs">
                  {p}
                </div>
              ))}
            </div>

            {/* Elements Grid (18 columns x 10 rows) */}
            <div
              className="grid gap-1 relative w-full flex-1"
              style={{
                gridTemplateColumns: 'repeat(18, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(7, minmax(0, 1fr)) 12px repeat(2, minmax(0, 1fr))',
              }}
            >
              {/* Lanthanide (57-71) placeholder at row 6, col 3 */}
              <div
                style={{ gridColumnStart: 3, gridRowStart: 6 }}
                className="flex flex-col items-center justify-center p-0.5 rounded-md border border-dashed border-pink-500/40 bg-pink-950/20 text-pink-300 font-mono text-center select-none"
              >
                <span className="text-[8px] font-bold">57-71</span>
                <span className="text-[7px] uppercase tracking-tighter">La-Lu</span>
              </div>

              {/* Actinide (89-103) placeholder at row 7, col 3 */}
              <div
                style={{ gridColumnStart: 3, gridRowStart: 7 }}
                className="flex flex-col items-center justify-center p-0.5 rounded-md border border-dashed border-rose-500/40 bg-rose-950/20 text-rose-300 font-mono text-center select-none"
              >
                <span className="text-[8px] font-bold">89-103</span>
                <span className="text-[7px] uppercase tracking-tighter">Ac-Lr</span>
              </div>

              {/* Lanthanides Label at row 9 */}
              <div
                style={{ gridColumnStart: 1, gridColumnEnd: 3, gridRowStart: 9 }}
                className="flex items-center justify-end pr-2 font-mono text-[9px] font-bold text-pink-400 select-none uppercase tracking-wider"
              >
                Lanthanides
              </div>

              {/* Actinides Label at row 10 */}
              <div
                style={{ gridColumnStart: 1, gridColumnEnd: 3, gridRowStart: 10 }}
                className="flex items-center justify-end pr-2 font-mono text-[9px] font-bold text-rose-400 select-none uppercase tracking-wider"
              >
                Actinides
              </div>

              {/* Render all 118 Elements */}
              {elements.map((el) => {
                const cat = CATEGORIES[el.category] || CATEGORIES['unknown'];
                const currentState = getStateAtTemperature(el, temperatureKelvin);
                const stateColor = getStateColor(currentState);
                const isSelected = selectedElement?.number === el.number;
                const isHovered = hoveredEl?.number === el.number;

                return (
                  <div
                    key={el.number}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      onSelectElement(el);
                    }}
                    onMouseEnter={() => setHoveredEl(el)}
                    onMouseLeave={() => setHoveredEl(null)}
                    style={{
                      gridColumnStart: el.gridCol,
                      gridRowStart: el.gridRow,
                      backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.95)',
                    }}
                    className={`
                      relative group flex flex-col justify-between p-1 rounded-lg select-none cursor-pointer
                      transition-all duration-150 border backdrop-blur-sm
                      ${
                        isSelected
                          ? 'ring-2 ring-cyan-400 border-cyan-400 z-30 scale-105 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                          : isHovered
                          ? 'border-cyan-400/90 z-20 scale-105 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                          : 'border-slate-800 hover:border-cyan-500/50'
                      }
                    `}
                  >
                    {/* Category Accent Indicator: Top Glowing Color Bar */}
                    <div
                      className="absolute top-0 left-1 right-1 h-[2px] rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: cat.color }}
                    />

                    {/* Top Row: Atomic Number & State Indicator */}
                    <div className="flex items-center justify-between w-full leading-none pt-0.5">
                      <span className="text-[9px] font-mono font-bold text-slate-400 group-hover:text-cyan-300">
                        {el.number}
                      </span>
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: stateColor }}
                        title={`State: ${currentState}`}
                      />
                    </div>

                    {/* Center: Large Chemical Symbol & Element Name */}
                    <div className="my-auto flex flex-col items-center justify-center py-0.5">
                      <span
                        className="text-base sm:text-lg font-black tracking-tight leading-none"
                        style={{ color: cat.color }}
                      >
                        {el.symbol}
                      </span>
                      <span className="text-[8px] truncate max-w-full font-medium text-slate-400 group-hover:text-slate-200 mt-0.5 leading-none text-center">
                        {el.name}
                      </span>
                    </div>

                    {/* Bottom: Atomic Mass */}
                    <div className="w-full text-center leading-none pb-0.5">
                      <span className="text-[8px] font-mono text-slate-400 truncate block">
                        {typeof el.atomicMassValue === 'number'
                          ? el.atomicMassValue.toFixed(el.atomicMassValue > 100 ? 1 : 2)
                          : el.atomicMass}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* 3. Bottom Information Bar */}
      <footer className="h-7 px-4 bg-[#070a1a] border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold">18 Groups • 7 Periods • Lanthanides & Actinides</span>
          <span>•</span>
          <span className="text-slate-400 hidden sm:inline">
            Fitted to screen dimensions with zero scrolling
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <span>Click any element to open its details page</span>
          <ChevronRight size={12} className="text-cyan-400" />
        </div>
      </footer>
    </div>
  );
};
