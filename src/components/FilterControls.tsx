import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Columns,
  SlidersHorizontal,
  Maximize2,
} from 'lucide-react';
import type { TrendType } from '../data/trends';
import { TREND_CONFIGS } from '../data/trends';
import { kelvinToCelsius } from '../utils/helpers';

interface FilterControlsProps {
  activeClassification: 'all' | 'metals' | 'nonmetals' | 'metalloids';
  onSelectClassification: (c: 'all' | 'metals' | 'nonmetals' | 'metalloids') => void;
  activeStateFilter: 'all' | 'solid' | 'liquid' | 'gas';
  onSelectStateFilter: (s: 'all' | 'solid' | 'liquid' | 'gas') => void;
  atomicRange: [number, number];
  onAtomicRangeChange: (range: [number, number]) => void;
  trendMode: TrendType;
  onSelectTrend: (trend: TrendType) => void;
  layoutMode: 'standard' | 'extended';
  onToggleLayout: () => void;
  temperatureKelvin: number;
  onTemperatureChange: (temp: number) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  onOpenFitView?: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  activeClassification,
  onSelectClassification,
  activeStateFilter,
  onSelectStateFilter,
  atomicRange,
  onAtomicRangeChange,
  trendMode,
  onSelectTrend,
  layoutMode,
  onToggleLayout,
  temperatureKelvin,
  onTemperatureChange,
  onResetFilters,
  hasActiveFilters,
  onOpenFitView,
}) => {
  const [isPlayingTemp, setIsPlayingTemp] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Temperature auto-sweep
  useEffect(() => {
    if (!isPlayingTemp) return;
    const interval = setInterval(() => {
      onTemperatureChange(temperatureKelvin >= 5500 ? 0 : temperatureKelvin + 50);
    }, 100);
    return () => clearInterval(interval);
  }, [isPlayingTemp, temperatureKelvin, onTemperatureChange]);

  const trends: { id: TrendType; label: string }[] = [
    { id: 'none', label: 'Categories' },
    { id: 'atomicRadius', label: 'Atomic Radius' },
    { id: 'electronegativity', label: 'Electronegativity' },
    { id: 'ionizationEnergy', label: 'Ionization Energy' },
    { id: 'density', label: 'Density' },
    { id: 'meltingPoint', label: 'Melting Point' },
  ];

  return (
    <div className="w-full rounded-2xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-md p-3 sm:p-4 text-xs font-sans text-slate-200 shadow-md space-y-3">
      {/* Top Filter Bar: Core Filters with Consistent Heights & Gap */}
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        {/* Classification Tabs: All / Metals / Nonmetals / Metalloids */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 px-2 hidden sm:inline">
            Class:
          </span>
          {(['all', 'metals', 'nonmetals', 'metalloids'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onSelectClassification(c)}
              className={`h-7 px-2.5 rounded-lg text-xs capitalize transition-all cursor-pointer font-medium ${
                activeClassification === c
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* State Filter Tabs: All / Solid / Liquid / Gas */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 px-2 hidden sm:inline">
            State:
          </span>
          {(['all', 'solid', 'liquid', 'gas'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSelectStateFilter(s)}
              className={`h-7 px-2.5 rounded-lg text-xs capitalize transition-all cursor-pointer font-medium ${
                activeStateFilter === s
                  ? 'bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Color Mode / Heatmap Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-cyan-400 px-1.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span className="hidden sm:inline">Color Mode:</span>
          </span>
          <select
            value={trendMode}
            onChange={(e) => onSelectTrend(e.target.value as TrendType)}
            className="h-7 bg-slate-900 border border-slate-700 rounded-lg px-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-medium cursor-pointer"
          >
            {trends.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} {t.id !== 'none' ? '(Heatmap)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls: Standardized h-9 (36px) Heights */}
        <div className="flex items-center gap-2">
          {/* Layout Mode Toggle */}
          <button
            type="button"
            onClick={onToggleLayout}
            className="h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-all cursor-pointer"
            title="Toggle between 18-column Standard and 32-column Extended layout"
          >
            <Columns className="w-3.5 h-3.5 text-cyan-400" />
            <span className="capitalize">{layoutMode}</span>
          </button>

          {/* Fit Table (No Scroll) Button */}
          {onOpenFitView && (
            <button
              type="button"
              onClick={onOpenFitView}
              className="h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 border border-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-all cursor-pointer"
              title="Show complete periodic table fitted to screen without any scrolling"
            >
              <Maximize2 className="w-3.5 h-3.5 text-slate-950" strokeWidth={2.5} />
              <span className="hidden sm:inline uppercase tracking-tight">Full Table</span>
              <span className="sm:hidden">Fit</span>
            </button>
          )}

          {/* Advanced toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              showAdvanced
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Advanced Filters</span>
            <span className="sm:hidden">Filters</span>
          </button>

          {/* Reset Every Selection Button */}
          <button
            type="button"
            onClick={onResetFilters}
            className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              hasActiveFilters
                ? 'text-rose-300 bg-rose-950/70 border-rose-500/50 hover:bg-rose-900/70 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                : 'text-slate-400 bg-slate-800/80 border-slate-700 hover:text-white hover:border-slate-600'
            }`}
            title="Reset every selection, filter, search, and active element"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${hasActiveFilters ? 'text-rose-400' : 'text-slate-400'}`} />
            <span>Reset</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            )}
          </button>
        </div>
      </div>

      {/* Advanced Drawer: Atomic Number Range & Thermodynamic Simulator */}
      {showAdvanced && (
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Atomic Number Range Filter (1 to 118) */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono uppercase text-slate-300 font-medium">
                Atomic Number Range
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                Z = {atomicRange[0]} to {atomicRange[1]}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-400">1</span>
              <input
                type="range"
                min="1"
                max="118"
                value={atomicRange[1]}
                onChange={(e) => onAtomicRangeChange([atomicRange[0], Number(e.target.value)])}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-400">118</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Showing elements 1 through {atomicRange[1]}</span>
              {atomicRange[1] < 118 && (
                <button
                  type="button"
                  onClick={() => onAtomicRangeChange([1, 118])}
                  className="text-cyan-400 hover:underline cursor-pointer"
                >
                  Reset range
                </button>
              )}
            </div>
          </div>

          {/* Temperature Phase Simulator */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-mono uppercase text-slate-300 font-medium">
                <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                <span>Thermodynamic State</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-rose-400 font-bold text-xs">
                  {Math.round(temperatureKelvin)} K ({Math.round(kelvinToCelsius(temperatureKelvin) ?? 0)}°C)
                </span>
                <button
                  type="button"
                  onClick={() => setIsPlayingTemp(!isPlayingTemp)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  title={isPlayingTemp ? 'Pause temperature simulation' : 'Auto-sweep temperature'}
                >
                  {isPlayingTemp ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-cyan-400">0 K</span>
              <input
                type="range"
                min="0"
                max="6000"
                step="25"
                value={temperatureKelvin}
                onChange={(e) => {
                  setIsPlayingTemp(false);
                  onTemperatureChange(Number(e.target.value));
                }}
                className="w-full accent-rose-400 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-rose-400">6000 K</span>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <button
                type="button"
                onClick={() => onTemperatureChange(293.15)}
                className="hover:text-cyan-300 cursor-pointer"
              >
                Room Temp (20°C / 293 K)
              </button>
              <button
                type="button"
                onClick={() => onTemperatureChange(0)}
                className="hover:text-cyan-300 cursor-pointer"
              >
                Absolute Zero (0 K)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Heatmap Legend Bar when Trend is Active */}
      {trendMode !== 'none' && (
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold uppercase">{TREND_CONFIGS[trendMode].name}:</span>
            <span className="text-slate-400 hidden sm:inline">{TREND_CONFIGS[trendMode].description}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-cyan-400">Low ({TREND_CONFIGS[trendMode].min} {TREND_CONFIGS[trendMode].unit})</span>
            <div className="w-32 h-2.5 rounded-full bg-gradient-to-r from-[#0284c7] via-[#0d9488] via-[#d97706] to-[#e11d48] shadow-inner" />
            <span className="text-[10px] text-rose-400">High ({TREND_CONFIGS[trendMode].max} {TREND_CONFIGS[trendMode].unit})</span>
          </div>
        </div>
      )}
    </div>
  );
};
