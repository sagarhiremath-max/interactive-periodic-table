import React, { useState } from 'react';
import { Info } from 'lucide-react';
import type { ElementData } from '../../data/elements';
import { COMPARISON_PROPERTIES, ELEMENT_THEMES, type PropertyDefinition } from './compareUtils';

interface VisualMetricBarsProps {
  elements: ElementData[];
}

export const VisualMetricBars: React.FC<VisualMetricBarsProps> = ({ elements }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Filter numeric properties for visual bar comparisons
  const visualProperties = COMPARISON_PROPERTIES.filter((p) => p.isNumeric);

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
            <span>Visual Metric Comparisons</span>
            <span className="text-xs font-mono font-normal text-cyan-400">({visualProperties.length} Properties)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Side-by-side scaled values with dynamic percentage differentials & leader indicators
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {visualProperties.map((prop) => (
          <MetricBarCard
            key={prop.id}
            prop={prop}
            elements={elements}
            isTooltipActive={activeTooltip === prop.id}
            onToggleTooltip={() => setActiveTooltip(activeTooltip === prop.id ? null : prop.id)}
          />
        ))}
      </div>
    </div>
  );
};

interface MetricBarCardProps {
  prop: PropertyDefinition;
  elements: ElementData[];
  isTooltipActive: boolean;
  onToggleTooltip: () => void;
}

const MetricBarCard: React.FC<MetricBarCardProps> = ({
  prop,
  elements,
  isTooltipActive,
  onToggleTooltip,
}) => {
  // Extract values and valid numbers
  const rawValues = elements.map((e) => prop.getValue(e));
  const validNumbers = rawValues.filter((v): v is number => typeof v === 'number' && !isNaN(v) && v > 0);
  const maxVal = validNumbers.length > 0 ? Math.max(...validNumbers) : 1;

  // Determine highest value leader if comparable
  let leaderText: string | null = null;
  let leaderColor: string = '#06b6d4';

  if (validNumbers.length >= 2) {
    const highestVal = Math.max(...validNumbers);
    const lowestVal = Math.min(...validNumbers);
    const leaderIndex = rawValues.findIndex((v) => v === highestVal);

    if (leaderIndex !== -1 && highestVal !== lowestVal) {
      const leader = elements[leaderIndex];
      const diffPct = Math.round(((highestVal - lowestVal) / lowestVal) * 100);
      leaderText = `▲ ${leader.symbol} highest (+${diffPct}%)`;
      leaderColor = ELEMENT_THEMES[leaderIndex]?.primary || '#06b6d4';
    } else if (highestVal === lowestVal) {
      leaderText = '= Equal values';
      leaderColor = '#94a3b8';
    }
  }

  return (
    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3">
      {/* Property Title Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-bold text-white tracking-tight truncate">{prop.name}</span>
          {prop.unit && <span className="text-[10px] font-mono text-slate-400">({prop.unit})</span>}
          <button
            type="button"
            onClick={onToggleTooltip}
            className="p-1 rounded-md text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            title="What does this mean?"
            aria-label={`Information about ${prop.name}`}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        {leaderText && (
          <span
            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0"
            style={{
              color: leaderColor,
              borderColor: `${leaderColor}40`,
              backgroundColor: `${leaderColor}15`,
            }}
          >
            {leaderText}
          </span>
        )}
      </div>

      {/* Tooltip Description Popover */}
      {isTooltipActive && (
        <div className="p-2.5 rounded-lg bg-slate-950 border border-cyan-500/30 text-xs text-slate-300 leading-relaxed animate-in fade-in zoom-in-95 duration-150">
          {prop.description}
        </div>
      )}

      {/* Comparison Bars */}
      <div className="space-y-2">
        {elements.map((el, idx) => {
          const theme = ELEMENT_THEMES[idx] || ELEMENT_THEMES[0];
          const val = rawValues[idx];
          const hasVal = typeof val === 'number' && !isNaN(v_number(val)) && val > 0;
          const pct = hasVal ? Math.max(3, Math.min(100, (val! / maxVal) * 100)) : 0;
          const formatted = prop.formatValue(el);

          return (
            <div key={el.number} className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold flex items-center gap-1.5" style={{ color: theme.primary }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }} />
                  {el.symbol} ({el.name})
                </span>
                <span className="text-slate-200 font-semibold">{formatted}</span>
              </div>

              {hasVal ? (
                <div className="h-2 rounded-full bg-slate-950/80 border border-slate-800 overflow-hidden flex">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${theme.barGradient} transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              ) : (
                <div className="h-2 rounded-full bg-slate-950/40 border border-dashed border-slate-700/60 flex items-center justify-center">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Unavailable</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

function v_number(v: any): number {
  return typeof v === 'number' ? v : 0;
}
