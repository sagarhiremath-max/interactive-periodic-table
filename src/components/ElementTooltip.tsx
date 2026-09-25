import React from 'react';
import { type ElementData, CATEGORIES } from '../data/elements';
import { getStateAtTemperature, getStateColor, formatTemp } from '../utils/helpers';

interface ElementTooltipProps {
  element: ElementData | null;
  position: { x: number; y: number } | null;
  temperatureKelvin: number;
  darkMode: boolean;
}

export const ElementTooltip: React.FC<ElementTooltipProps> = ({
  element,
  position,
  temperatureKelvin,
  darkMode,
}) => {
  if (!element || !position) return null;

  const cat = CATEGORIES[element.category] || CATEGORIES['unknown'];
  const currentState = getStateAtTemperature(element, temperatureKelvin);
  const stateColor = getStateColor(currentState);

  // Position tooltip safely within viewport
  const tooltipWidth = 260;
  const tooltipHeight = 180;
  const padding = 16;

  let left = position.x + 16;
  let top = position.y - 40;

  if (typeof window !== 'undefined') {
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = position.x - tooltipWidth - 16;
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
      className={`
        pointer-events-none z-50 w-64 rounded-xl p-3 shadow-2xl backdrop-blur-md border transition-opacity duration-150 animate-in fade-in zoom-in-95
        ${
          darkMode
            ? 'bg-slate-900/95 border-slate-700/80 text-white shadow-black/60'
            : 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-400/40'
        }
      `}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between border-b pb-2 mb-2 border-white/10">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm border"
            style={{
              backgroundColor: `${cat.color}20`,
              borderColor: cat.color,
              color: cat.color,
            }}
          >
            {element.symbol}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm leading-tight">{element.name}</span>
              <span className="text-[10px] font-mono px-1 rounded bg-white/10 text-slate-300">
                #{element.number}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <span>{element.atomicMass} u</span>
            </div>
          </div>
        </div>

        {/* State dot */}
        <div className="flex flex-col items-end">
          <span
            className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full flex items-center gap-1"
            style={{
              backgroundColor: `${stateColor}25`,
              color: stateColor,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: stateColor }}
            />
            {currentState}
          </span>
        </div>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs">
        <div>
          <span className="text-slate-400 block text-[10px]">Category</span>
          <span
            className="font-medium truncate block text-[11px]"
            style={{ color: cat.color }}
          >
            {element.categoryName}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[10px]">Configuration</span>
          <span className="font-mono text-[10px] truncate block text-slate-300">
            {element.electronConfigurationSemantic || element.electronConfiguration}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[10px]">Period / Group / Block</span>
          <span className="font-medium text-[11px]">
            P{element.period} · G{element.group} · {element.block.toUpperCase()}-block
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[10px]">Melting / Boiling</span>
          <span className="font-mono text-[10px] text-slate-300">
            {formatTemp(element.meltingPointKelvin, 'C')} / {formatTemp(element.boilingPointKelvin, 'C')}
          </span>
        </div>
      </div>

      {/* Click prompt */}
      <div className="mt-2.5 pt-1.5 border-t border-white/5 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
        <span>Click for full Bohr model & chemistry details</span>
      </div>
    </div>
  );
};
