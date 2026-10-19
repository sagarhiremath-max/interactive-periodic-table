import React from 'react';
import { type ElementData, CATEGORIES } from '../data/elements';
import { getStateAtTemperature, getStateColor } from '../utils/helpers';
import { ATOMIC_RADII_PM, TREND_CONFIGS, getTrendColor, type TrendType } from '../data/trends';
import { Star } from 'lucide-react';

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
  isComparing = false,
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

  // Position depending on layoutMode
  const colStart = layoutMode === 'extended' ? element.extendedCol : element.gridCol;
  const rowStart = layoutMode === 'extended' ? element.extendedRow : element.gridRow;

  // Trend value computation
  let trendValue: number | null = null;
  let trendFormatted = '';
  let trendRatio = 0;
  let isMissingTrendData = false;

  if (trendMode !== 'none') {
    const config = TREND_CONFIGS[trendMode];
    if (trendMode === 'atomicRadius') {
      trendValue = ATOMIC_RADII_PM[element.number] ?? null;
      if (trendValue !== null) {
        trendFormatted = `${trendValue} pm`;
      }
    } else if (trendMode === 'electronegativity') {
      trendValue = element.electronegativity;
      if (trendValue !== null) {
        trendFormatted = trendValue.toFixed(2);
      }
    } else if (trendMode === 'ionizationEnergy') {
      trendValue = element.ionizationEnergy;
      if (trendValue !== null) {
        trendFormatted = `${trendValue} kJ`;
      }
    } else if (trendMode === 'density') {
      trendValue = element.density;
      if (trendValue !== null) {
        trendFormatted = `${trendValue.toFixed(2)} g/cm³`;
      }
    } else if (trendMode === 'meltingPoint') {
      trendValue = element.meltingPointKelvin;
      if (trendValue !== null) {
        trendFormatted = `${Math.round(trendValue)} K`;
      }
    }

    if (trendValue === null) {
      isMissingTrendData = true;
      trendFormatted = 'N/A';
    } else {
      trendRatio = (trendValue - config.min) / (config.max - config.min);
    }
  }

  const activeTrendColor = trendMode !== 'none' && !isMissingTrendData ? getTrendColor(trendRatio) : null;

  // Build cell accessibility label
  const ariaLabel = `${element.name}, symbol ${element.symbol}, atomic number ${element.number}, relative mass ${element.atomicMass}, ${element.categoryName}${
    trendMode !== 'none' ? `, ${trendMode}: ${trendFormatted}` : ''
  }`;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      style={{
        gridColumnStart: colStart,
        gridRowStart: rowStart,
        borderColor: isSelected
          ? '#22d3ee'
          : isSearchMatch
          ? '#c084fc'
          : isHovered
          ? cat.color
          : activeTrendColor
          ? `${activeTrendColor}90`
          : undefined,
        backgroundColor: isSelected
          ? darkMode
            ? '#082f49'
            : '#e0f2fe'
          : activeTrendColor
          ? darkMode
            ? `${activeTrendColor}25`
            : `${activeTrendColor}18`
          : darkMode
          ? `${cat.color}14`
          : `${cat.color}0a`,
      }}
      onClick={() => onClick(element)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(element);
        }
      }}
      onMouseEnter={(e) => onMouseEnter(element, e)}
      onMouseLeave={onMouseLeave}
      className={`
        relative select-none cursor-pointer rounded-lg transition-transform duration-100 ease-out
        grid grid-rows-[13px_1fr_auto_13px] items-center justify-items-center
        p-1 sm:p-1.5 border
        w-full h-full min-h-0 box-border gap-0.5
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950 focus-visible:z-20
        ${
          darkMode
            ? 'text-slate-100 hover:bg-slate-800/80'
            : 'text-slate-800 hover:bg-slate-100'
        }
        ${
          isDimmed
            ? 'opacity-20 grayscale pointer-events-none scale-95'
            : 'opacity-100 hover:scale-[1.03] hover:z-10'
        }
        ${
          isSelected
            ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-950 z-20 font-bold'
            : ''
        }
        ${
          isSearchMatch
            ? 'ring-2 ring-purple-400 ring-offset-1 ring-offset-slate-950 z-20 font-bold'
            : ''
        }
        ${
          isComparing
            ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-950 z-20'
            : ''
        }
        ${
          !isSelected && !isSearchMatch && !activeTrendColor
            ? darkMode
              ? 'border-slate-800/80'
              : 'border-slate-200'
            : ''
        }
        ${isMissingTrendData && trendMode !== 'none' ? 'border-dashed opacity-60' : ''}
      `}
    >
      {/* Category or Trend accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2.5px] rounded-t-lg transition-opacity"
        style={{ backgroundColor: activeTrendColor || cat.color }}
      />

      {/* Row 1: atomic number (left) & state / favorite indicator (right) */}
      <div className="flex items-center justify-between w-full h-[13px] leading-none shrink-0 px-0.5">
        <span
          className={`font-mono text-[clamp(8px,0.85vw,10.5px)] font-bold tracking-tight select-none ${
            darkMode ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          {element.number}
        </span>

        <div className="flex items-center gap-0.5 shrink-0">
          {isFavorite && (
            <Star
              size={8}
              className="fill-amber-400 text-amber-400 shrink-0"
              aria-label="Favorited"
            />
          )}
          <span
            className="w-1.5 h-1.5 rounded-full transition-colors shrink-0"
            style={{ backgroundColor: stateColor }}
            title={`Phase: ${currentState} at ${Math.round(temperatureKelvin)} K`}
          />
        </div>
      </div>

      {/* Row 2: Element Symbol (center) */}
      <div className="flex items-center justify-center w-full h-full min-h-0 select-none">
        <span
          className="text-[clamp(13px,1.35vw,17px)] font-extrabold tracking-tight leading-none"
          style={{ color: darkMode ? '#ffffff' : '#0f172a' }}
        >
          {element.symbol}
        </span>
      </div>

      {/* Row 3: Element Name (readable, centered, wrapping up to 2 lines) */}
      <div className="flex items-center justify-center w-full min-h-[11px] leading-[1.1] px-0.5">
        {trendMode === 'none' ? (
          <span
            className={`text-[clamp(7.5px,0.8vw,9.5px)] font-medium text-center w-full line-clamp-2 break-words ${
              darkMode ? 'text-slate-200' : 'text-slate-700'
            }`}
            title={element.name}
          >
            {element.name}
          </span>
        ) : (
          <span
            className={`font-mono text-[clamp(7.5px,0.8vw,9.5px)] font-bold text-center w-full truncate ${
              isMissingTrendData
                ? 'text-slate-500 italic'
                : darkMode
                ? 'text-cyan-300'
                : 'text-cyan-800'
            }`}
            title={`${element.name}: ${trendFormatted}`}
          >
            {trendFormatted}
          </span>
        )}
      </div>

      {/* Row 4: Dedicated Atomic Weight Row */}
      <div className="flex items-center justify-center w-full h-[13px] leading-none px-0.5">
        {trendMode === 'none' ? (
          <span
            className={`font-mono text-[clamp(6.5px,0.72vw,8.5px)] text-center tracking-tight truncate w-full ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}
            title={`Atomic weight: ${element.atomicMass}`}
          >
            {element.atomicMass}
          </span>
        ) : (
          <span
            className={`text-[7px] font-medium text-center truncate w-full ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}
            title={element.name}
          >
            {element.name}
          </span>
        )}
      </div>
    </div>
  );
};
