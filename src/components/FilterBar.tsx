import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  activeClassification: 'all' | 'metals' | 'nonmetals' | 'metalloids' | 'halogens';
  onSelectClassification: (c: 'all' | 'metals' | 'nonmetals' | 'metalloids' | 'halogens') => void;
  activeBlock: 'all' | 's' | 'p' | 'd' | 'f';
  onSelectBlock: (b: 'all' | 's' | 'p' | 'd' | 'f') => void;
  activeStateFilter: 'all' | 'solid' | 'liquid' | 'gas';
  onSelectStateFilter: (s: 'all' | 'solid' | 'liquid' | 'gas') => void;
  hasActiveFilters: boolean;
  onResetAll: () => void;
  darkMode: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeClassification,
  onSelectClassification,
  activeBlock,
  onSelectBlock,
  activeStateFilter,
  onSelectStateFilter,
  hasActiveFilters,
  onResetAll,
  darkMode,
}) => {
  const classifications: { id: 'all' | 'metals' | 'nonmetals' | 'metalloids' | 'halogens'; label: string; count: number }[] = [
    { id: 'all', label: 'All Elements', count: 118 },
    { id: 'metals', label: 'Metals', count: 95 },
    { id: 'nonmetals', label: 'Nonmetals', count: 17 },
    { id: 'metalloids', label: 'Metalloids', count: 6 },
    { id: 'halogens', label: 'Halogens', count: 6 },
  ];

  const blocks: ('all' | 's' | 'p' | 'd' | 'f')[] = ['all', 's', 'p', 'd', 'f'];
  const states: ('all' | 'solid' | 'liquid' | 'gas')[] = ['all', 'solid', 'liquid', 'gas'];

  return (
    <div
      className={`rounded-2xl p-4 border transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* Classification Group */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mr-1 uppercase">
          <Filter size={14} />
          <span>Class:</span>
        </div>
        {classifications.map((item) => {
          const isActive = activeClassification === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectClassification(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 scale-[1.02]'
                  : darkMode
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-black/20 text-white' : 'bg-white/10 text-slate-400'
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Blocks & State Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Block Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase">Block:</span>
          <div className="flex items-center rounded-xl bg-slate-800/50 p-1 border border-slate-700/50">
            {blocks.map((b) => (
              <button
                key={b}
                onClick={() => onSelectBlock(b)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-colors ${
                  activeBlock === b
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {b === 'all' ? 'All' : `${b}-block`}
              </button>
            ))}
          </div>
        </div>

        {/* State Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase">State:</span>
          <div className="flex items-center rounded-xl bg-slate-800/50 p-1 border border-slate-700/50">
            {states.map((s) => (
              <button
                key={s}
                onClick={() => onSelectStateFilter(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                  activeStateFilter === s
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetAll}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
