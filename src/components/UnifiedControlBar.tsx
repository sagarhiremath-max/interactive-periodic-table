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
  darkMode,
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
    { id: 'all' as const, label: 'All', count: 118 },
    { id: 'metals' as const, label: 'Metals', count: 95 },
    { id: 'nonmetals' as const, label: 'Nonmetals', count: 17 },
    { id: 'metalloids' as const, label: 'Metalloids', count: 6 },
    { id: 'halogens' as const, label: 'Halogens', count: 6 },
  ];

  const blocks: ('all' | 's' | 'p' | 'd' | 'f')[] = ['all', 's', 'p', 'd', 'f'];
  const states: ('all' | 'solid' | 'liquid' | 'gas')[] = ['all', 'solid', 'liquid', 'gas'];

  const trendButtons: { id: TrendType; label: string; icon: React.FC<{ size: number }> }[] = [
    { id: 'none', label: 'Categories', icon: Layers },
    { id: 'atomicRadius', label: 'Radius', icon: CircleDot },
    { id: 'electronegativity', label: 'Electroneg.', icon: TrendingUp },
    { id: 'ionizationEnergy', label: 'Ionization', icon: Zap },
    { id: 'density', label: 'Density', icon: Scale },
    { id: 'meltingPoint', label: 'Melting Pt', icon: Thermometer },
  ];

  const presets = [
    { label: '0K', kelvin: 0 },
    { label: '273K (0°C)', kelvin: 273.15 },
    { label: '293K (20°C)', kelvin: 293.15 },
    { label: '373K (100°C)', kelvin: 373.15 },
    { label: '1000K', kelvin: 1000 },
    { label: '5778K', kelvin: 5778 },
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
      className={`rounded-xl px-3 py-2 border transition-colors shrink-0 flex flex-col gap-2 ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* ROW 1: Compact Filter Pills & Periodic Trends Pills */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        {/* Left: Chemical Classifications & Favorites */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mr-0.5 uppercase">
            <Filter size={12} />
            <span>Class:</span>
          </div>
          {classifications.map((item) => {
            const isActive = activeClassification === item.id && !onlyFavorites;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectClassification(item.id)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 border ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-xs'
                    : darkMode
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-black/20 text-slate-950 font-bold' : 'bg-white/10 text-slate-400'
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
            className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 border ${
              onlyFavorites
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-xs'
                : darkMode
                ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700/60 text-slate-300 hover:text-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-amber-800'
            }`}
            title="Filter by favorited elements"
          >
            <Star size={11} className={onlyFavorites ? 'fill-slate-950 text-slate-950' : 'fill-amber-400 text-amber-400'} />
            <span>Favs</span>
            <span
              className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
                onlyFavorites ? 'bg-black/20 text-slate-950 font-bold' : 'bg-amber-400/20 text-amber-300'
              }`}
            >
              {favoritesCount}
            </span>
          </button>

          {/* Block Selection */}
          <div className="flex items-center rounded-lg bg-slate-950/60 p-0.5 border border-slate-700/70 ml-0.5">
            {blocks.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => onSelectBlock(b)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                  activeBlock === b ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {b === 'all' ? 'All' : `${b}`}
              </button>
            ))}
          </div>

          {/* State Selection */}
          <div className="flex items-center rounded-lg bg-slate-950/60 p-0.5 border border-slate-700/70">
            {states.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSelectStateFilter(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize transition-colors ${
                  activeStateFilter === s ? 'bg-cyan-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s === 'all' ? 'All' : s.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Periodic Trends selector & Reset */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase">
            <TrendingUp size={12} className="text-cyan-400" />
            <span>Trend:</span>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            {trendButtons.map((btn) => {
              const isActive = trendMode === btn.id;
              const Icon = btn.icon;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => onSelectTrend(btn.id)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 border ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-xs'
                      : darkMode
                      ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  <Icon size={11} />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>

          {/* Reset Filters button directly in toolbar */}
          {hasActiveFilters && onResetAll && (
            <button
              type="button"
              onClick={onResetAll}
              className="px-2 py-0.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
              title="Reset all active filters and trends"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          )}

          {onOpenGuide && (
            <button
              type="button"
              onClick={onOpenGuide}
              className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-colors border border-white/5 ml-0.5"
              title="Chemistry Guide & Overview"
            >
              <BookOpen size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ROW 2: Compact Temperature Simulator & Active Trend Scale */}
      <div className="flex items-center justify-between gap-3 flex-wrap text-xs pt-1 border-t border-white/5">
        {/* Left: Temperature Slider & Sweeper */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Thermometer size={14} className="text-cyan-400" />
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/10 hover:bg-white/20 text-slate-200 flex items-center gap-1 transition-colors"
            >
              {isPlaying ? <Pause size={9} /> : <Play size={9} />}
              <span>{isPlaying ? 'Pause' : 'Sweep'}</span>
            </button>
            <span className="font-mono text-xs font-bold text-cyan-400 min-w-[50px]">
              {Math.round(temperatureKelvin)} K
            </span>
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              ({Math.round(temperatureKelvin - 273.15)}°C)
            </span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min="0"
            max="6000"
            step="10"
            value={temperatureKelvin}
            onChange={(e) => onTemperatureChange(Number(e.target.value))}
            className="w-28 sm:w-40 md:w-48 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            title="Slide to change temperature"
          />

          {/* Presets */}
          <div className="hidden xl:flex items-center gap-1">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onTemperatureChange(p.kelvin)}
                className={`px-1.5 py-0.2 rounded text-[9px] font-mono transition-colors ${
                  Math.round(temperatureKelvin) === Math.round(p.kelvin)
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-white/5'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Phase counts */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 pl-1 border-l border-white/10">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              S:{phaseCounts.solid}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              L:{phaseCounts.liquid}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              G:{phaseCounts.gas}
            </span>
          </div>
        </div>

        {/* Right: Trend Scale when active */}
        {activeTrendConfig && (
          <div className="flex items-center gap-2 text-[10px]">
            <span className="font-semibold text-slate-300 truncate">{activeTrendConfig.name}:</span>
            <span className="font-mono text-slate-400">{activeTrendConfig.min}</span>
            <div
              className="h-2 w-24 sm:w-32 rounded-full border border-white/10 shadow-inner"
              style={{
                background: `linear-gradient(to right, ${getTrendColor(0)}, ${getTrendColor(0.33)}, ${getTrendColor(0.66)}, ${getTrendColor(1)})`,
              }}
              title={`Color scale for ${activeTrendConfig.name}`}
            />
            <span className="font-mono text-slate-400">{activeTrendConfig.max} {activeTrendConfig.unit}</span>
            <span className="text-slate-500">({measuredCount}/118)</span>

            <button
              type="button"
              onClick={onOpenTrendExplanation}
              className="text-cyan-400 hover:text-cyan-300 p-0.5 rounded hover:bg-white/5 ml-0.5"
              title="Learn why this periodic trend occurs"
            >
              <HelpCircle size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
