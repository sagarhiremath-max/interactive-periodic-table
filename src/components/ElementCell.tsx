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
          ? '#38bdf8'
          : isSearchMatch
          ? '#a855f7'
          : isHovered
          ? cat.color
          : activeTrendColor
          ? `${activeTrendColor}80`
          : undefined,
        backgroundColor:
          activeTrendColor
            ? darkMode
              ? `${activeTrendColor}25`
              : `${activeTrendColor}18`
            : undefined,
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
        relative select-none cursor-pointer rounded-lg transition-all duration-150 ease-out
        flex flex-col justify-between p-0.5 sm:p-1 lg:p-0.5 xl:p-1 border
        w-full h-full min-h-0
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:z-30
        ${
          darkMode
            ? 'bg-slate-900/90 text-slate-100 hover:bg-slate-800'
            : 'bg-white/95 text-slate-800 hover:bg-slate-50'
        }
        ${
          isDimmed
            ? 'opacity-20 grayscale pointer-events-none scale-95'
            : 'opacity-100 hover:scale-[1.08] hover:z-30 hover:shadow-xl'
        }
        ${
          isSelected
            ? 'ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.5)] z-20 scale-[1.03]'
            : ''
        }
        ${
          isSearchMatch
            ? 'ring-2 ring-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)] z-20 font-bold'
            : ''
        }
        ${
          isComparing
            ? 'ring-2 ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
            : ''
        }
        ${
          !isSelected && !isSearchMatch && !activeTrendColor
            ? darkMode
              ? cat.borderColor
              : 'border-slate-200 shadow-sm'
            : ''
        }
        ${isMissingTrendData && trendMode !== 'none' ? 'border-dashed opacity-60' : ''}
      `}
    >
      {/* Category or Trend accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-lg transition-opacity"
        style={{ backgroundColor: activeTrendColor || cat.color }}
      />

      {/* Top row: atomic number & state / favorite indicator */}
      <div className="flex items-center justify-between w-full mt-0 leading-none">
        <span
          className={`font-mono text-[8px] sm:text-[9px] xl:text-[10px] font-semibold ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {element.number}
        </span>

        <div className="flex items-center gap-0.5">
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

      {/* Symbol */}
      <div className="text-center my-0">
        <span
          className="text-xs sm:text-sm lg:text-base font-bold tracking-tight block leading-tight"
          style={{ color: darkMode ? '#ffffff' : '#0f172a' }}
        >
          {element.symbol}
        </span>
      </div>

      {/* Bottom info: name & atomic mass or trend value */}
      <div className="flex flex-col text-center w-full leading-tight">
        {trendMode === 'none' ? (
          <>
            <span
              className={`text-[7.5px] sm:text-[8.5px] xl:text-[9px] font-medium truncate hidden sm:block ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}
              title={element.name}
            >
              {element.name}
            </span>
            <span
              className={`font-mono text-[7px] sm:text-[7.5px] xl:text-[8px] ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {element.atomicMass}
            </span>
          </>
        ) : (
          <span
            className={`font-mono text-[7.5px] sm:text-[8.5px] xl:text-[9px] font-bold truncate ${
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
    </div>
  );
};
