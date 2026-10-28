import React from 'react';
import { type ElementData, CATEGORIES } from '../data/elements';
import { getStateAtTemperature, getStateColor } from '../utils/helpers';
import { ATOMIC_RADII_PM, TREND_CONFIGS, getTrendColor, type TrendType } from '../data/trends';
import { Bookmark } from 'lucide-react';

interface ElementCellProps {
  element: ElementData;
  isSelected?: boolean;
  isHovered?: boolean;
  isDimmed?: boolean;
  isSearchMatch?: boolean;
  isComparing?: boolean;
  isFavorite?: boolean;
  layoutMode?: 'standard' | 'extended';
  temperatureKelvin?: number;
  darkMode?: boolean;
  trendMode?: TrendType;
  onClick: (element: ElementData) => void;
  onMouseEnter: (element: ElementData, e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
}

export const ElementCell: React.FC<ElementCellProps> = ({
  element,
  isSelected = false,
  isHovered = false,
  isDimmed = false,
  isSearchMatch = false,
  isFavorite = false,
  layoutMode = 'standard',
  temperatureKelvin = 293.15,
  darkMode = true,
  trendMode = 'none',
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const cat = CATEGORIES[element.category] || CATEGORIES['unknown'];
  const currentState = getStateAtTemperature(element, temperatureKelvin);
  const stateColor = getStateColor(currentState);

  // Position based on layout mode
  const colStart = layoutMode === 'extended' ? element.extendedCol : element.gridCol;
  const rowStart = layoutMode === 'extended' ? element.extendedRow : element.gridRow;

  // Trend computation
  let trendValue: number | null = null;
  let trendFormatted = '';
  let trendRatio = 0;
  let isMissingTrendData = false;

  if (trendMode !== 'none') {
    const config = TREND_CONFIGS[trendMode];
    if (trendMode === 'atomicRadius') {
      trendValue = ATOMIC_RADII_PM[element.number] ?? null;
      if (trendValue !== null) trendFormatted = `${trendValue} pm`;
    } else if (trendMode === 'electronegativity') {
      trendValue = element.electronegativity;
      if (trendValue !== null) trendFormatted = trendValue.toFixed(2);
    } else if (trendMode === 'ionizationEnergy') {
      trendValue = element.ionizationEnergy;
      if (trendValue !== null) trendFormatted = `${trendValue} kJ`;
    } else if (trendMode === 'density') {
      trendValue = element.density;
      if (trendValue !== null) trendFormatted = `${trendValue.toFixed(2)} g`;
    } else if (trendMode === 'meltingPoint') {
      trendValue = element.meltingPointKelvin;
      if (trendValue !== null) trendFormatted = `${Math.round(trendValue)} K`;
    }

    if (trendValue === null) {
      isMissingTrendData = true;
      trendFormatted = '—';
    } else {
      trendRatio = (trendValue - config.min) / (config.max - config.min);
    }
  }

  const activeTrendColor =
    trendMode !== 'none' && !isMissingTrendData ? getTrendColor(trendRatio) : null;

  // Accessibility label
  const ariaLabel = `${element.name}, symbol ${element.symbol}, atomic number ${element.number}, relative mass ${element.atomicMass}, ${element.categoryName}${
    trendMode !== 'none' ? `, ${trendMode}: ${trendFormatted}` : ''
  }`;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-selected={isSelected}
      onClick={() => onClick(element)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(element);
        }
      }}
      onMouseEnter={(e) => onMouseEnter(element, e)}
      onMouseLeave={onMouseLeave}
      style={{
        gridColumnStart: colStart,
        gridRowStart: rowStart,
        backgroundColor: activeTrendColor
          ? activeTrendColor
          : darkMode
          ? 'rgba(15, 23, 42, 0.75)'
          : 'rgba(255, 255, 255, 0.9)',
      }}
      className={`
        relative group flex flex-col justify-between p-1 sm:p-1.5 rounded-lg select-none cursor-pointer
        transition-all duration-200 transform
        border backdrop-blur-sm
        ${
          activeTrendColor
            ? 'text-white border-white/20'
            : darkMode
            ? 'text-slate-100 border-slate-700/60'
            : 'text-slate-900 border-slate-200'
        }
        ${
          isSelected
            ? 'ring-2 ring-cyan-400 border-cyan-400 z-30 scale-105 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
            : isHovered
            ? 'border-cyan-400/80 z-20 scale-105 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            : 'hover:border-cyan-500/50 hover:shadow-md'
        }
        ${isSearchMatch ? 'ring-2 ring-amber-400 border-amber-400 animate-pulse z-20' : ''}
        ${isDimmed ? 'opacity-20 grayscale pointer-events-auto' : 'opacity-100'}
        focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:scale-105 focus:z-20
      `}
    >
      {/* Category Accent Indicator: Top Glowing Color Bar */}
      {!activeTrendColor && (
        <div
          className="absolute top-0 left-1 right-1 h-[2px] rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: cat.color }}
        />
      )}

      {/* Top Header: Atomic Number & Phase Dot / Bookmark */}
      <div className="flex items-center justify-between w-full leading-none pt-0.5">
        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-400 group-hover:text-cyan-300">
          {element.number}
        </span>

        <div className="flex items-center gap-1">
          {isFavorite && (
            <Bookmark className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
          )}
          {!activeTrendColor && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: stateColor }}
              title={`State: ${currentState} at ${Math.round(temperatureKelvin)} K`}
            />
          )}
        </div>
      </div>

      {/* Center: Large Chemical Symbol */}
      <div className="my-auto flex flex-col items-center justify-center py-0.5">
        <span
          className="text-base sm:text-lg lg:text-xl font-black tracking-tight leading-none"
          style={{ color: activeTrendColor ? '#FFFFFF' : cat.color }}
        >
          {element.symbol}
        </span>
        <span className="text-[8px] sm:text-[9px] truncate max-w-full font-medium text-slate-400 group-hover:text-slate-200 mt-0.5 leading-none text-center">
          {element.name}
        </span>
      </div>

      {/* Bottom: Atomic Weight or Trend Value */}
      <div className="w-full text-center leading-none pb-0.5">
        {trendMode !== 'none' ? (
          <span className="text-[8px] sm:text-[9px] font-mono font-bold text-white bg-black/40 px-1 py-0.5 rounded">
            {trendFormatted}
          </span>
        ) : (
          <span className="text-[8px] sm:text-[8.5px] font-mono text-slate-400 truncate block">
            {typeof element.atomicMassValue === 'number'
              ? element.atomicMassValue.toFixed(element.atomicMassValue > 100 ? 1 : 2)
              : element.atomicMass}
          </span>
        )}
      </div>
    </div>
  );
};
