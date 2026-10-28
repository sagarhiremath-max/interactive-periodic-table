import React from 'react';
import { type ElementData, CATEGORIES } from '../data/elements';
import { getStateAtTemperature, getStateColor } from '../utils/helpers';
import { ATOMIC_RADII_PM } from '../data/trends';

interface ElementTooltipProps {
  element: ElementData | null;
  position: { x: number; y: number } | null;
  temperatureKelvin: number;
  darkMode?: boolean;
}

export const ElementTooltip: React.FC<ElementTooltipProps> = ({
  element,
  position,
  temperatureKelvin,
  darkMode: _darkMode = true,
}) => {
  if (!element || !position) return null;

  const cat = CATEGORIES[element.category] || CATEGORIES['unknown'];
  const currentState = getStateAtTemperature(element, temperatureKelvin);
  const stateColor = getStateColor(currentState);
  const atomicRadius = ATOMIC_RADII_PM[element.number];

  // Tooltip dimensions & bounding box logic
  const tooltipWidth = 260;
  const tooltipHeight = 170;
  const padding = 16;

  let left = position.x + 18;
  let top = position.y - 30;

  if (typeof window !== 'undefined') {
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = position.x - tooltipWidth - 18;
    }
    if (top + tooltipHeight > window.innerHeight - padding) {
      top = window.innerHeight - tooltipHeight - padding;
    }
    if (top < padding) {
      top = padding;
    }
  }

  return (
    <div
      style={{
        left: `${left}px`,
        top: `${top}px`,
        position: 'fixed',
      }}
      className="pointer-events-none z-50 w-[260px] p-3 rounded-xl bg-slate-950/95 border border-cyan-500/40 text-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl select-none transition-opacity duration-150 animate-in fade-in zoom-in-95"
    >
      {/* Top Category Accent Line */}
      <div
        className="h-1 w-full rounded-full mb-2.5 opacity-90 shadow-sm"
        style={{ backgroundColor: cat.color }}
      />

      {/* Header: Number, Symbol, Name & Category */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
        <div
          className="w-10 h-10 rounded-lg flex flex-col items-center justify-center font-black shrink-0 border border-white/20 shadow-md"
          style={{ backgroundColor: `${cat.color}25` }}
        >
          <span className="text-[8px] leading-none font-mono text-slate-400">
            {element.number}
          </span>
          <span className="text-base font-black leading-none" style={{ color: cat.color }}>
            {element.symbol}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-xs font-bold text-white truncate">{element.name}</h4>
            <span
              className="text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0 truncate max-w-[100px] border border-white/10"
              style={{ backgroundColor: `${cat.color}30`, color: cat.color }}
            >
              {element.categoryName}
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            P{element.period} · G{element.group} · {element.block.toUpperCase()}-block
          </p>
        </div>
      </div>

      {/* Grid of Key Properties */}
      <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] font-sans">
        <div>
          <span className="text-slate-400 text-[9px] block">Atomic Mass</span>
          <span className="font-mono font-bold text-white text-xs">{element.atomicMass} u</span>
        </div>

        <div>
          <span className="text-slate-400 text-[9px] block">
            State ({Math.round(temperatureKelvin)} K)
          </span>
          <span className="font-medium capitalize flex items-center gap-1.5 text-white">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stateColor }} />
            {currentState}
          </span>
        </div>

        <div>
          <span className="text-slate-400 text-[9px] block">Electronegativity</span>
          <span className="font-mono text-cyan-300">
            {element.electronegativity ? element.electronegativity.toFixed(2) : '—'}
          </span>
        </div>

        <div>
          <span className="text-slate-400 text-[9px] block">Atomic Radius</span>
          <span className="font-mono text-violet-300">
            {atomicRadius ? `${atomicRadius} pm` : '—'}
          </span>
        </div>
      </div>

      <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400 font-mono">
        <span>Click for 3D Bohr & details</span>
        <span className="text-cyan-400">⏎</span>
      </div>
    </div>
  );
};
