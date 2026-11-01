import React from 'react';
import { Award, Sparkles, Lightbulb } from 'lucide-react';
import type { ElementData } from '../../data/elements';
import { ABUNDANCE } from '../../data/elementDetails';
import { generateComparisonInsights } from './compareUtils';

interface ComparisonInsightsProps {
  elements: ElementData[];
}

export const ComparisonInsights: React.FC<ComparisonInsightsProps> = ({ elements }) => {
  const insights = generateComparisonInsights(elements);

  // Generate interesting chemical facts from actual element data
  const dynamicFacts: string[] = [];

  // Abundance comparison
  elements.forEach((el) => {
    const ab = ABUNDANCE[el.number];
    if (ab?.universe && ab.universe !== 'Unknown') {
      dynamicFacts.push(
        `${el.name} represents approximately ${ab.universe} of all observable baryonic matter in the Universe.`
      );
    }
  });

  // Common uses
  elements.forEach((el) => {
    if (el.commonUses && el.commonUses.length > 0) {
      dynamicFacts.push(
        `Critical everyday & industrial applications for ${el.name} (${el.symbol}) include: ${el.commonUses.slice(0, 3).join(', ')}.`
      );
    }
  });

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Comparison Insights & Extremes</span>
          </h3>
          <p className="text-xs text-slate-400">
            Automatically identified chemical extremes and scientific facts across the selected elements
          </p>
        </div>
      </div>

      {/* Insight Extreme Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.map((ins, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-2.5"
            style={{
              borderLeftColor: ins.accentColor,
              borderLeftWidth: '3px',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-bold text-slate-400">{ins.title}</span>
              <Award className="w-4 h-4 text-cyan-400/80" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono tracking-tight" style={{ color: ins.accentColor }}>
                {ins.winner.symbol}
              </span>
              <span className="text-xs font-bold text-white truncate">{ins.winner.name}</span>
              <span className="text-xs font-mono font-bold text-slate-300 ml-auto">{ins.value}</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-snug">{ins.context}</p>
          </div>
        ))}
      </div>

      {/* Dynamic Scientific Facts Card */}
      {dynamicFacts.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/20 space-y-2.5">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" />
            <span>Verified Chemical Facts & Practical Context</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
            {dynamicFacts.slice(0, 4).map((fact, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-cyan-400 font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
