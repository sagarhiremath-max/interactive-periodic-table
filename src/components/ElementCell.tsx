import React from 'react';
import { type ElementData, CATEGORIES } from '../data/elements';
import { getStateAtTemperature, getStateColor } from '../utils/helpers';

interface ElementCellProps {
  element: ElementData;
  isSelected?: boolean;
  isHovered?: boolean;
  isDimmed?: boolean;
  isSearchMatch?: boolean;
  isComparing?: boolean;
  layoutMode?: 'standard' | 'extended';
  temperatureKelvin?: number;
  darkMode?: boolean;
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
  layoutMode = 'standard',
  temperatureKelvin = 293.15,
  darkMode = true,
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

  return (
    <div
      role="button"
      tabIndex={0}
      style={{
        gridColumnStart: colStart,
        gridRowStart: rowStart,
        borderColor: isSelected
          ? '#38bdf8'
          : isSearchMatch
          ? '#a855f7'
          : isHovered
          ? cat.color
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
        relative select-none cursor-pointer rounded-lg transition-all duration-200 ease-out
        flex flex-col justify-between p-1 sm:p-1.5 border
        w-full min-h-[46px] sm:min-h-[50px] md:min-h-[54px]
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
        ${!isSelected && !isSearchMatch ? (darkMode ? cat.borderColor : 'border-slate-200 shadow-sm') : ''}
      `}
    >
      {/* Category accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-lg transition-opacity"
        style={{ backgroundColor: cat.color }}
      />

      {/* Top row: atomic number & state indicator */}
      <div className="flex items-center justify-between w-full mt-0 leading-none">
        <span
          className={`font-mono text-[9px] sm:text-[10px] font-semibold ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {element.number}
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full transition-colors"
          style={{ backgroundColor: stateColor }}
          title={`Phase: ${currentState} at ${Math.round(temperatureKelvin)} K`}
        />
      </div>

      {/* Symbol */}
      <div className="text-center my-0">
        <span
          className="text-sm sm:text-base font-bold tracking-tight block leading-tight"
          style={{ color: darkMode ? '#ffffff' : '#0f172a' }}
        >
          {element.symbol}
        </span>
      </div>

      {/* Bottom info: name & atomic mass */}
      <div className="flex flex-col text-center w-full leading-tight">
        <span
          className={`text-[8px] sm:text-[9px] font-medium truncate ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}
          title={element.name}
        >
          {element.name}
        </span>
        <span
          className={`font-mono text-[7px] sm:text-[8px] ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          {element.atomicMass}
        </span>
      </div>
    </div>
  );
};
