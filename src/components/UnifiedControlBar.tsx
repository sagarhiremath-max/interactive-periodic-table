import React, { useState, useEffect } from 'react';
import {
  Filter,
  Star,
  Play,
  Pause,
  Thermometer,
  TrendingUp,
  CircleDot,
  Zap,
  Scale,
  Layers,
  HelpCircle,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import type { ElementData } from '../data/elements';
import { getStateAtTemperature } from '../utils/helpers';
import {
  TREND_CONFIGS,
  type TrendType,
  getTrendColor,
  ATOMIC_RADII_PM,
} from '../data/trends';

interface UnifiedControlBarProps {
  activeClassification: 'all' | 'metals' | 'nonmetals' | 'metalloids' | 'halogens';
  onSelectClassification: (c: 'all' | 'metals' | 'nonmetals' | 'metalloids' | 'halogens') => void;
  activeBlock: 'all' | 's' | 'p' | 'd' | 'f';
  onSelectBlock: (b: 'all' | 's' | 'p' | 'd' | 'f') => void;
  activeStateFilter: 'all' | 'solid' | 'liquid' | 'gas';
  onSelectStateFilter: (s: 'all' | 'solid' | 'liquid' | 'gas') => void;
  onlyFavorites: boolean;
  onToggleOnlyFavorites: () => void;
  favoritesCount: number;
  trendMode: TrendType;
  onSelectTrend: (trend: TrendType) => void;
  temperatureKelvin: number;
  onTemperatureChange: React.Dispatch<React.SetStateAction<number>>;
  elements: ElementData[];
  darkMode: boolean;
  onOpenTrendExplanation: () => void;
  onOpenGuide?: () => void;
  hasActiveFilters?: boolean;
  onResetAll?: () => void;
}

export const UnifiedControlBar: React.FC<UnifiedControlBarProps> = ({
  activeClassification,
  onSelectClassification,
  activeBlock,
  onSelectBlock,
  activeStateFilter,
  onSelectStateFilter,
  onlyFavorites,
  onToggleOnlyFavorites,
  favoritesCount,
  trendMode,
  onSelectTrend,
  temperatureKelvin,
  onTemperatureChange,
  elements,
  darkMode: _darkMode,
  onOpenTrendExplanation,
  onOpenGuide,
  hasActiveFilters = false,
  onResetAll,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto sweep temperature
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onTemperatureChange((prev) => (prev >= 5500 ? 0 : prev + 60));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, onTemperatureChange]);

  // Phase counts
  const phaseCounts = elements.reduce(
    (acc, elem) => {
      const state = getStateAtTemperature(elem, temperatureKelvin);
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    },
    { solid: 0, liquid: 0, gas: 0, unknown: 0 } as Record<string, number>
  );

  const classifications = [
    { id: 'all' as const, label: 'ALL', count: 118 },
    { id: 'metals' as const, label: 'METALS', count: 95 },
    { id: 'nonmetals' as const, label: 'NONMETALS', count: 17 },
    { id: 'metalloids' as const, label: 'METALLOIDS', count: 6 },
    { id: 'halogens' as const, label: 'HALOGENS', count: 6 },
  ];

  const blocks: ('all' | 's' | 'p' | 'd' | 'f')[] = ['all', 's', 'p', 'd', 'f'];
  const states: ('all' | 'solid' | 'liquid' | 'gas')[] = ['all', 'solid', 'liquid', 'gas'];

  const trendButtons: { id: TrendType; label: string; icon: React.FC<{ size: number }> }[] = [
    { id: 'none', label: 'CATEGORIES', icon: Layers },
    { id: 'atomicRadius', label: 'RADIUS', icon: CircleDot },
    { id: 'electronegativity', label: 'ELECTRONEG.', icon: TrendingUp },
    { id: 'ionizationEnergy', label: 'IONIZATION', icon: Zap },
    { id: 'density', label: 'DENSITY', icon: Scale },
    { id: 'meltingPoint', label: 'MELTING PT', icon: Thermometer },
  ];

  const presets = [
    { label: '0K', kelvin: 0 },
    { label: '273K (0°C)', kelvin: 273.15 },
    { label: '293K (20°C)', kelvin: 293.15 },
    { label: '373K (100°C)', kelvin: 373.15 },
    { label: '1000K', kelvin: 1000 },
  ];

  const activeTrendConfig = trendMode !== 'none' ? TREND_CONFIGS[trendMode] : null;

  // Count measured elements for active trend
  const getTrendMeasuredCount = () => {
    if (!activeTrendConfig) return 0;
    return elements.filter((el) => {
      if (trendMode === 'atomicRadius') return ATOMIC_RADII_PM[el.number] !== null;
      if (trendMode === 'electronegativity') return el.electronegativity !== null;
      if (trendMode === 'ionizationEnergy') return el.ionizationEnergy !== null;
      if (trendMode === 'density') return el.density !== null;
      if (trendMode === 'meltingPoint') return el.meltingPointKelvin !== null;
      return false;
    }).length;
  };

  const measuredCount = getTrendMeasuredCount();

  return (
    <div
      className="p-3 sm:p-4 border-2.5 border-black dark:border-white bg-white dark:bg-[#181818] text-black dark:text-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFF] shrink-0 flex flex-col gap-3 font-mono"
    >
      {/* ROW 1: Classification Pills, Blocks, States & Periodic Trends */}
      <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
        {/* Left: Chemical Classifications & Favorites */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-black dark:text-[#FFE600]">
            <Filter size={13} strokeWidth={3} />
            <span>CLASS:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {classifications.map((item) => {
              const isActive = activeClassification === item.id && !onlyFavorites;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectClassification(item.id)}
                  className={`px-2.5 py-1 text-[11px] font-mono font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border-2 border-black dark:border-white cursor-pointer ${
                    isActive
                      ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#FFF] translate-x-[-1px] translate-y-[-1px]'
                      : 'bg-white dark:bg-[#222] text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`text-[9px] px-1 font-bold ${
                      isActive ? 'bg-black text-[#FFE600]' : 'bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}

            {/* Favorites Filter */}
            <button
              type="button"
              onClick={onToggleOnlyFavorites}
              className={`px-2.5 py-1 text-[11px] font-mono font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border-2 border-black dark:border-white cursor-pointer ${
                onlyFavorites
                  ? 'bg-[#FF007A] text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#FFF] translate-x-[-1px] translate-y-[-1px]'
                  : 'bg-white dark:bg-[#222] text-black dark:text-white hover:bg-neutral-100'
              }`}
              title="Filter by favorited elements"
            >
              <Star size={12} strokeWidth={2.5} className={onlyFavorites ? 'fill-white text-white' : 'fill-[#FFE600] text-black'} />
              <span>FAVORITES</span>
              <span className="text-[9px] px-1 font-bold bg-black text-white">
                {favoritesCount}
              </span>
            </button>
          </div>

          {/* Block Selection */}
          <div className="flex items-center border-2 border-black dark:border-white bg-black/5 dark:bg-white/10 p-0.5">
            <span className="text-[10px] font-black uppercase px-1.5 text-neutral-600 dark:text-neutral-400">BLOCK:</span>
            {blocks.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => onSelectBlock(b)}
                className={`px-2 py-0.5 text-[10px] font-black uppercase transition-all border cursor-pointer ${
                  activeBlock === b
                    ? 'bg-black text-[#FFE600] dark:bg-white dark:text-black border-black font-black shadow-[1px_1px_0px_0px_#000]'
                    : 'border-transparent text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white'
                }`}
              >
                {b === 'all' ? 'ALL' : `${b}`}
              </button>
            ))}
          </div>

          {/* State Selection */}
          <div className="flex items-center border-2 border-black dark:border-white bg-black/5 dark:bg-white/10 p-0.5">
            <span className="text-[10px] font-black uppercase px-1.5 text-neutral-600 dark:text-neutral-400">PHASE:</span>
            {states.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSelectStateFilter(s)}
                className={`px-2 py-0.5 text-[10px] font-black uppercase transition-all border cursor-pointer ${
                  activeStateFilter === s
                    ? 'bg-[#00E5FF] text-black border-black font-black shadow-[1px_1px_0px_0px_#000]'
                    : 'border-transparent text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white'
                }`}
              >
                {s === 'all' ? 'ALL' : s.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Periodic Trends selector & Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-black dark:text-[#FFE600]">
            <TrendingUp size={13} strokeWidth={3} />
            <span>HEATMAP:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {trendButtons.map((btn) => {
              const isActive = trendMode === btn.id;
              const Icon = btn.icon;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => onSelectTrend(btn.id)}
                  className={`px-2 py-1 text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1 border-2 border-black dark:border-white cursor-pointer ${
                    isActive
                      ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#FFF] translate-x-[-1px] translate-y-[-1px]'
                      : 'bg-white dark:bg-[#222] text-black dark:text-white hover:bg-neutral-100'
                  }`}
                >
                  <Icon size={12} />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && onResetAll && (
            <button
              type="button"
              onClick={onResetAll}
              className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 border-2 border-black bg-[#FF007A] text-white shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
              title="Reset all active filters and trends"
            >
              <RotateCcw size={12} strokeWidth={2.5} />
              <span>RESET</span>
            </button>
          )}

          {onOpenGuide && (
            <button
              type="button"
              onClick={onOpenGuide}
              className="p-1.5 border-2 border-black dark:border-white bg-white dark:bg-[#222] text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#FFF] hover:bg-[#FFE600] hover:text-black cursor-pointer"
              title="Chemistry Guide & Periodic Trends"
            >
              <BookOpen size={15} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* ROW 2: Temperature Simulator & Active Trend Scale */}
      <div className="flex items-center justify-between gap-3 flex-wrap text-xs pt-3 border-t-2 border-black dark:border-white">
        {/* Left: Temperature Slider & Sweeper */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Thermometer size={16} strokeWidth={2.5} className="text-[#FF007A]" />
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border-2 border-black bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              {isPlaying ? <Pause size={10} strokeWidth={3} /> : <Play size={10} strokeWidth={3} />}
              <span>{isPlaying ? 'PAUSE' : 'SWEEP'}</span>
            </button>
            <span className="font-mono text-sm font-black text-black dark:text-white px-1.5 py-0.5 border border-black bg-[#FFE600] dark:text-black min-w-[65px] text-center">
              {Math.round(temperatureKelvin)} K
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
              ({Math.round(temperatureKelvin - 273.15)}°C)
            </span>
          </div>

          {/* Brutalist Slider */}
          <input
            type="range"
            min="0"
            max="6000"
            step="10"
            value={temperatureKelvin}
            onChange={(e) => onTemperatureChange(Number(e.target.value))}
            className="w-32 sm:w-44 md:w-56 h-3 bg-neutral-200 dark:bg-neutral-800 border-2 border-black dark:border-white appearance-none cursor-pointer accent-[#FFE600]"
            title="Slide to change temperature"
          />

          {/* Presets */}
          <div className="hidden xl:flex items-center gap-1">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onTemperatureChange(p.kelvin)}
                className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase border cursor-pointer ${
                  Math.round(temperatureKelvin) === Math.round(p.kelvin)
                    ? 'bg-black text-[#FFE600] border-black font-black shadow-[1px_1px_0px_0px_#000]'
                    : 'bg-white dark:bg-[#222] text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-black'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Phase counts */}
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase pl-2 border-l-2 border-black dark:border-white">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-neutral-400 border border-black" />
              S: {phaseCounts.solid}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#00E5FF] border border-black" />
              L: {phaseCounts.liquid}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#FF007A] border border-black" />
              G: {phaseCounts.gas}
            </span>
          </div>
        </div>

        {/* Right: Trend Scale when active */}
        {activeTrendConfig && (
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
            <span className="font-black uppercase truncate text-black dark:text-white">
              {activeTrendConfig.name}:
            </span>
            <span>{activeTrendConfig.min}</span>
            <div
              className="h-3 w-28 sm:w-36 border-2 border-black shadow-[2px_2px_0px_0px_#000]"
              style={{
                background: `linear-gradient(to right, ${getTrendColor(0)}, ${getTrendColor(0.33)}, ${getTrendColor(0.66)}, ${getTrendColor(1)})`,
              }}
              title={`Color scale for ${activeTrendConfig.name}`}
            />
            <span>
              {activeTrendConfig.max} {activeTrendConfig.unit}
            </span>
            <span className="text-neutral-600 dark:text-neutral-400">
              ({measuredCount}/118)
            </span>

            <button
              type="button"
              onClick={onOpenTrendExplanation}
              className="p-1 border border-black bg-white dark:bg-[#222] hover:bg-[#FFE600] text-black dark:text-white ml-0.5 cursor-pointer"
              title="Learn why this periodic trend occurs"
            >
              <HelpCircle size={12} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
