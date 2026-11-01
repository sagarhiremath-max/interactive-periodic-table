import React, { useState, useMemo } from 'react';
import { Radar, BarChart3, ArrowRightLeft, CheckSquare, Square, Info } from 'lucide-react';
import type { ElementData } from '../../data/elements';
import { ATOMIC_RADII_PM } from '../../data/trends';
import { ELEMENT_THEMES } from './compareUtils';

interface AdvancedVisualAnalyticsProps {
  elements: ElementData[];
}

type ChartViewType = 'radar' | 'grouped_bars' | 'difference';

interface RadarAxisConfig {
  id: string;
  label: string;
  unit: string;
  getValue: (el: ElementData) => number | null;
  format: (val: number | null) => string;
}

const RADAR_AXES: RadarAxisConfig[] = [
  {
    id: 'mass',
    label: 'Atomic Mass',
    unit: 'u',
    getValue: (el) => el.atomicMassValue || null,
    format: (v) => (v ? `${v.toFixed(2)} u` : 'N/A'),
  },
  {
    id: 'radius',
    label: 'Atomic Radius',
    unit: 'pm',
    getValue: (el) => ATOMIC_RADII_PM[el.number] ?? null,
    format: (v) => (v ? `${v} pm` : 'N/A'),
  },
  {
    id: 'en',
    label: 'Electronegativity',
    unit: '',
    getValue: (el) => el.electronegativity ?? null,
    format: (v) => (v !== null ? `${v}` : 'N/A'),
  },
  {
    id: 'ie',
    label: 'Ionization Energy',
    unit: 'kJ/mol',
    getValue: (el) => el.ionizationEnergy ?? null,
    format: (v) => (v ? `${v} kJ/mol` : 'N/A'),
  },
  {
    id: 'density',
    label: 'Density',
    unit: 'g/cm³',
    getValue: (el) => el.density ?? null,
    format: (v) => (v ? `${v.toFixed(3)} g/cm³` : 'N/A'),
  },
  {
    id: 'melt',
    label: 'Melting Point',
    unit: 'K',
    getValue: (el) => el.meltingPointKelvin ?? null,
    format: (v) => (v ? `${Math.round(v)} K` : 'N/A'),
  },
];

export const AdvancedVisualAnalytics: React.FC<AdvancedVisualAnalyticsProps> = ({ elements }) => {
  const [activeView, setActiveView] = useState<ChartViewType>('radar');
  const [enabledAxes, setEnabledAxes] = useState<Record<string, boolean>>({
    mass: true,
    radius: true,
    en: true,
    ie: true,
    density: true,
    melt: true,
  });

  const [selectedBarProperty, setSelectedBarProperty] = useState<string>('mass');
  const [hoveredPoint, setHoveredPoint] = useState<{
    elementSymbol: string;
    label: string;
    formatted: string;
    x: number;
    y: number;
  } | null>(null);

  // Toggle axis on/off in radar chart
  const toggleAxis = (id: string) => {
    const currentCount = Object.values(enabledAxes).filter(Boolean).length;
    if (enabledAxes[id] && currentCount <= 3) {
      // Keep at least 3 axes for a valid radar polygon
      return;
    }
    setEnabledAxes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter active radar axes
  const activeAxes = useMemo(() => {
    return RADAR_AXES.filter((a) => enabledAxes[a.id]);
  }, [enabledAxes]);

  // Compute normalized radar points
  const radarData = useMemo(() => {
    const numAxes = activeAxes.length;
    const center = 150;
    const radius = 105;

    // Calculate maximum value per axis among selected elements
    const axisMaxMap: Record<string, number> = {};
    activeAxes.forEach((axis) => {
      const vals = elements
        .map((el) => axis.getValue(el))
        .filter((v): v is number => typeof v === 'number' && !isNaN(v) && v > 0);
      axisMaxMap[axis.id] = vals.length > 0 ? Math.max(...vals) : 1;
    });

    // Compute polygon coordinates for each element
    return elements.map((el, elIdx) => {
      const theme = ELEMENT_THEMES[elIdx] || ELEMENT_THEMES[0];
      const points = activeAxes.map((axis, aIdx) => {
        const angle = (Math.PI * 2 * aIdx) / numAxes - Math.PI / 2;
        const rawVal = axis.getValue(el);
        const max = axisMaxMap[axis.id] || 1;
        // Normalize between 0.08 and 1.0
        const norm = typeof rawVal === 'number' && rawVal > 0 ? Math.max(0.08, rawVal / max) : 0.05;
        const x = center + radius * norm * Math.cos(angle);
        const y = center + radius * norm * Math.sin(angle);
        return {
          x,
          y,
          rawVal,
          formatted: axis.format(rawVal),
          label: axis.label,
          axisId: axis.id,
        };
      });

      const polygonStr = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
      return { element: el, theme, points, polygonStr };
    });
  }, [elements, activeAxes]);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5 font-sans">
      {/* Header and Chart Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
            <span>Advanced Visual Analytics</span>
            <span className="text-xs font-mono font-normal text-violet-400">Multi-Dimensional Comparison</span>
          </h3>
          <p className="text-xs text-slate-400">
            Interactive charts normalizing key atomic and thermodynamic properties
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveView('radar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'radar'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_2px_8px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>Radar Spider</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('grouped_bars')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'grouped_bars'
                ? 'bg-violet-500 text-white font-bold shadow-[0_2px_8px_rgba(139,92,246,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Grouped Bars</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('difference')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'difference'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_2px_8px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Difference Delta</span>
          </button>
        </div>
      </div>

      {/* Chart View A: Multi-Axis Radar Chart */}
      {activeView === 'radar' && (
        <div className="space-y-4">
          {/* Axis Toggles */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1">Active Axes:</span>
            {RADAR_AXES.map((axis) => {
              const isEnabled = enabledAxes[axis.id];
              return (
                <button
                  key={axis.id}
                  type="button"
                  onClick={() => toggleAxis(axis.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    isEnabled
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  {isEnabled ? <CheckSquare className="w-3 h-3 text-cyan-400" /> : <Square className="w-3 h-3 text-slate-600" />}
                  <span>{axis.label}</span>
                </button>
              );
            })}
          </div>

          {/* SVG Radar Chart Display */}
          <div className="relative flex flex-col md:flex-row items-center justify-around gap-6 py-2">
            <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
              <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible select-none">
                {/* Concentric Grid Rings */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((level) => {
                  const r = 105 * level;
                  const pts = activeAxes
                    .map((_, aIdx) => {
                      const angle = (Math.PI * 2 * aIdx) / activeAxes.length - Math.PI / 2;
                      const x = 150 + r * Math.cos(angle);
                      const y = 150 + r * Math.sin(angle);
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(' ');
                  return (
                    <polygon
                      key={level}
                      points={pts}
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.15)"
                      strokeWidth="1"
                      strokeDasharray={level < 1 ? '3 3' : 'none'}
                    />
                  );
                })}

                {/* Radial Axis Spokes & Labels */}
                {activeAxes.map((axis, aIdx) => {
                  const angle = (Math.PI * 2 * aIdx) / activeAxes.length - Math.PI / 2;
                  const x = 150 + 105 * Math.cos(angle);
                  const y = 150 + 105 * Math.sin(angle);
                  const labelX = 150 + 124 * Math.cos(angle);
                  const labelY = 150 + 124 * Math.sin(angle);

                  return (
                    <g key={axis.id}>
                      <line x1="150" y1="150" x2={x} y2={y} stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" />
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-slate-400 font-mono text-[9px] font-semibold"
                      >
                        {axis.label}
                      </text>
                    </g>
                  );
                })}

                {/* Element Polygons */}
                {radarData.map(({ element, theme, polygonStr, points }) => (
                  <g key={element.number}>
                    <polygon
                      points={polygonStr}
                      fill={theme.fill}
                      stroke={theme.stroke}
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      className="transition-all duration-300"
                    />
                    {/* Vertices */}
                    {points.map((p, pIdx) => (
                      <circle
                        key={pIdx}
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill={theme.primary}
                        stroke="#050814"
                        strokeWidth="1.5"
                        className="cursor-pointer hover:scale-150 transition-transform"
                        onMouseEnter={() =>
                          setHoveredPoint({
                            elementSymbol: element.symbol,
                            label: p.label,
                            formatted: p.formatted,
                            x: p.x,
                            y: p.y,
                          })
                        }
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    ))}
                  </g>
                ))}
              </svg>

              {/* Hover Tooltip in Radar */}
              {hoveredPoint && (
                <div
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-full mb-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-cyan-400 text-xs shadow-2xl z-20 font-mono"
                  style={{
                    left: `${(hoveredPoint.x / 300) * 100}%`,
                    top: `${(hoveredPoint.y / 300) * 100}%`,
                  }}
                >
                  <span className="font-bold text-cyan-300">{hoveredPoint.elementSymbol}</span> · {hoveredPoint.label}:{' '}
                  <span className="text-white font-bold">{hoveredPoint.formatted}</span>
                </div>
              )}
            </div>

            {/* Radar Legend and Quick Notes */}
            <div className="w-full md:w-64 space-y-3">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Element Polygons</span>
                <div className="space-y-1.5">
                  {elements.map((el, idx) => {
                    const theme = ELEMENT_THEMES[idx] || ELEMENT_THEMES[0];
                    return (
                      <div key={el.number} className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-sm border" style={{ backgroundColor: theme.fill, borderColor: theme.stroke }} />
                          <span className="font-bold text-white">
                            {el.symbol} — {el.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">#{el.number}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
                  <Info className="w-3.5 h-3.5" />
                  <span>How to Read:</span>
                </div>
                <p>
                  Each vertex represents the relative magnitude of that property among the selected elements (outer ring = 100% max).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart View B: Grouped Bar Chart */}
      {activeView === 'grouped_bars' && (
        <div className="space-y-4">
          {/* Property Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Select Property:</span>
            {RADAR_AXES.map((axis) => (
              <button
                key={axis.id}
                type="button"
                onClick={() => setSelectedBarProperty(axis.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedBarProperty === axis.id
                    ? 'bg-violet-500 text-white shadow-[0_2px_8px_rgba(139,92,246,0.4)]'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {axis.label}
              </button>
            ))}
          </div>

          {/* Grouped Vertical Bar Visualization */}
          {(() => {
            const axis = RADAR_AXES.find((a) => a.id === selectedBarProperty) || RADAR_AXES[0];
            const vals = elements.map((e) => axis.getValue(e));
            const valid = vals.filter((v): v is number => typeof v === 'number' && !isNaN(v) && v > 0);
            const maxVal = valid.length > 0 ? Math.max(...valid) : 1;

            return (
              <div className="p-4 sm:p-6 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white text-sm">
                    {axis.label} {axis.unit ? `(${axis.unit})` : ''}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Peak scale: {maxVal}</span>
                </div>

                {/* Bars column flex */}
                <div className="flex items-end justify-around gap-4 h-48 pt-6 pb-2 border-b border-slate-800">
                  {elements.map((el, idx) => {
                    const theme = ELEMENT_THEMES[idx] || ELEMENT_THEMES[0];
                    const val = vals[idx];
                    const hasVal = typeof val === 'number' && !isNaN(val) && val > 0;
                    const heightPct = hasVal ? Math.max(8, (val! / maxVal) * 100) : 4;

                    return (
                      <div key={el.number} className="flex-1 max-w-[120px] flex flex-col items-center gap-2 h-full justify-end group">
                        {/* Numerical value on top */}
                        <span className="text-xs font-mono font-bold text-white text-center">
                          {hasVal ? axis.format(val) : 'N/A'}
                        </span>

                        {/* Bar */}
                        <div className="w-full rounded-t-xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-end p-0.5">
                          {hasVal ? (
                            <div
                              className={`w-full rounded-t-lg bg-gradient-to-t ${theme.barGradient} transition-all duration-300 group-hover:brightness-125 shadow-lg`}
                              style={{ height: `${heightPct}%` }}
                            />
                          ) : (
                            <div className="w-full h-3 border border-dashed border-slate-700 rounded-t" />
                          )}
                        </div>

                        {/* Element tag */}
                        <div className="flex items-center gap-1.5 pt-1 text-center font-mono">
                          <span className="font-bold text-sm" style={{ color: theme.primary }}>
                            {el.symbol}
                          </span>
                          <span className="text-[10px] text-slate-400 hidden sm:inline">#{el.number}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Chart View C: Difference Delta Chart */}
      {activeView === 'difference' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Numerical difference compared directly against <span className="text-cyan-400 font-bold">{elements[0].name} ({elements[0].symbol})</span> as baseline reference:
          </div>

          <div className="space-y-3">
            {RADAR_AXES.map((axis) => {
              const baseVal = axis.getValue(elements[0]);
              const compVal = axis.getValue(elements[1]);

              if (
                typeof baseVal !== 'number' ||
                typeof compVal !== 'number' ||
                isNaN(baseVal) ||
                isNaN(compVal) ||
                baseVal === 0
              ) {
                return null;
              }

              const diff = compVal - baseVal;
              const diffPct = Math.round((diff / baseVal) * 100);
              const isPositive = diff > 0;
              const isZero = diff === 0;

              return (
                <div key={axis.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white tracking-tight">{axis.label}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {elements[0].symbol}: {axis.format(baseVal)} vs {elements[1].symbol}: {axis.format(compVal)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                        isZero
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : isPositive
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {isZero ? '=' : isPositive ? '▲ +' : '▼ '}
                      {Math.abs(diff) < 0.01 ? diff.toExponential(2) : Math.abs(diff).toFixed(2)} {axis.unit} ({isPositive ? '+' : ''}
                      {diffPct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
