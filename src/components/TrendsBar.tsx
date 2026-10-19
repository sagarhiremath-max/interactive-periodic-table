import React, { useState } from 'react';
import {
  TREND_CONFIGS,
  type TrendType,
  getTrendColor,
  ATOMIC_RADII_PM,
} from '../data/trends';
import { TrendingUp, HelpCircle, ChevronDown, ChevronUp, Layers, Zap, CircleDot, Scale, Thermometer } from 'lucide-react';
import type { ElementData } from '../data/elements';

interface TrendsBarProps {
  trendMode: TrendType;
  onSelectTrend: (trend: TrendType) => void;
  elements: ElementData[];
  darkMode: boolean;
}

export const TrendsBar: React.FC<TrendsBarProps> = ({
  trendMode,
  onSelectTrend,
  elements,
  darkMode,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const trendButtons: { id: TrendType; label: string; icon: React.FC<{ size: number }> }[] = [
    { id: 'none', label: 'Categories', icon: Layers },
    { id: 'atomicRadius', label: 'Atomic Radius', icon: CircleDot },
    { id: 'electronegativity', label: 'Electronegativity', icon: TrendingUp },
    { id: 'ionizationEnergy', label: 'Ionization Energy', icon: Zap },
    { id: 'density', label: 'Density', icon: Scale },
    { id: 'meltingPoint', label: 'Melting Point', icon: Thermometer },
  ];

  // Calculate statistics for active trend
  const getTrendStats = () => {
    if (trendMode === 'none') return null;
    let measured = 0;
    let unmeasured = 0;

    elements.forEach((el) => {
      let val: number | null = null;
      if (trendMode === 'atomicRadius') val = ATOMIC_RADII_PM[el.number] ?? null;
      else if (trendMode === 'electronegativity') val = el.electronegativity;
      else if (trendMode === 'ionizationEnergy') val = el.ionizationEnergy;
      else if (trendMode === 'density') val = el.density;
      else if (trendMode === 'meltingPoint') val = el.meltingPointKelvin;

      if (val !== null) measured++;
      else unmeasured++;
    });

    return { measured, unmeasured };
  };

  const stats = getTrendStats();
  const activeConfig = trendMode !== 'none' ? TREND_CONFIGS[trendMode] : null;

  return (
    <div
      className={`rounded-2xl p-4 border transition-colors flex flex-col gap-3.5 ${
        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Trend Mode Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mr-1 uppercase">
            <TrendingUp size={15} />
            <span>Periodic Trends:</span>
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25 scale-[1.02]'
                      : darkMode
                      ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Icon size={13} />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Trend Legend & Info toggle if active */}
        {activeConfig && stats && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <HelpCircle size={14} />
              <span>{showExplanation ? 'Hide Explanation' : 'Why Does This Occur?'}</span>
              {showExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        )}
      </div>

      {/* Active Trend Gradient Legend Bar */}
      {activeConfig && stats && (
        <div
          className={`p-3 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
            darkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}
        >
          {/* Label and Measured count */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-200">{activeConfig.name}</span>
            <span className="text-slate-400">({activeConfig.unit})</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              {stats.measured} measured • {stats.unmeasured} N/A
            </span>
          </div>

          {/* Color Gradient Scale */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-[11px] font-mono text-slate-400">
              Min: {activeConfig.min}
            </span>
            <div
              className="h-3 w-40 sm:w-56 rounded-full shadow-inner border border-white/10"
              style={{
                background: `linear-gradient(to right, ${getTrendColor(0)}, ${getTrendColor(0.33)}, ${getTrendColor(0.66)}, ${getTrendColor(1)})`,
              }}
              title={`Gradient from ${activeConfig.min} to ${activeConfig.max} ${activeConfig.unit}`}
            />
            <span className="text-[11px] font-mono text-slate-400">
              Max: {activeConfig.max}
            </span>

            {/* Missing indicator */}
            <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-white/10 text-[11px] text-slate-400">
              <span className="w-3.5 h-3.5 rounded border border-dashed border-slate-500 bg-slate-800/60 text-[8px] flex items-center justify-center font-mono">
                /
              </span>
              <span>N/A</span>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Scientific Explanation Card */}
      {activeConfig && showExplanation && (
        <div
          className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2.5 transition-all ${
            darkMode ? 'bg-slate-950/80 border-cyan-500/20 text-slate-300' : 'bg-cyan-50/60 border-cyan-200 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <TrendingUp size={16} />
            <h4>Scientific Basis: {activeConfig.name}</h4>
          </div>

          <p className="text-slate-300 font-medium">{activeConfig.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded-lg bg-black/20 border border-white/5 space-y-1">
              <span className="font-bold text-cyan-400">→ Across Periods (Left to Right):</span>
              <p className="text-slate-300">{activeConfig.periodTrend}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-black/20 border border-white/5 space-y-1">
              <span className="font-bold text-indigo-400">↓ Down Groups (Top to Bottom):</span>
              <p className="text-slate-300">{activeConfig.groupTrend}</p>
            </div>
          </div>

          <p className="text-slate-400 pt-1 text-[11px] border-t border-white/5">
            <strong>Underlying Mechanism:</strong> {activeConfig.explanation}
          </p>
        </div>
      )}
    </div>
  );
};
