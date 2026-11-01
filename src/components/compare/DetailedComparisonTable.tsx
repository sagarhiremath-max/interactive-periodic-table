import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Info } from 'lucide-react';
import type { ElementData } from '../../data/elements';
import { COMPARISON_PROPERTIES, ELEMENT_THEMES } from './compareUtils';

interface DetailedComparisonTableProps {
  elements: ElementData[];
}

export const DetailedComparisonTable: React.FC<DetailedComparisonTableProps> = ({ elements }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'slot1' | 'slot2' | 'slot3' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const categories = ['all', 'General', 'Atomic', 'Electronic', 'Physical', 'Thermal'];

  // Filter properties by category and search
  const filteredProperties = useMemo(() => {
    return COMPARISON_PROPERTIES.filter((prop) => {
      const matchCat = selectedCategory === 'all' || prop.category === selectedCategory;
      const matchSearch =
        !searchTerm.trim() ||
        prop.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
        prop.description.toLowerCase().includes(searchTerm.trim().toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  // Sort properties if requested
  const sortedProperties = useMemo(() => {
    if (!sortField) return filteredProperties;

    return [...filteredProperties].sort((a, b) => {
      if (sortField === 'name') {
        const cmp = a.name.localeCompare(b.name);
        return sortDirection === 'asc' ? cmp : -cmp;
      }

      const slotIdx = sortField === 'slot1' ? 0 : sortField === 'slot2' ? 1 : 2;
      const el = elements[slotIdx];
      if (!el) return 0;

      const valA = a.getValue(el);
      const valB = b.getValue(el);

      if (valA === null && valB === null) return 0;
      if (valA === null) return 1;
      if (valB === null) return -1;

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [filteredProperties, sortField, sortDirection, elements]);

  const handleSort = (field: 'name' | 'slot1' | 'slot2' | 'slot3') => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Search and Category Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_2px_8px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search properties..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-h-[500px]" style={{ scrollbarWidth: 'thin' }}>
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 font-mono text-[11px] text-slate-400 uppercase tracking-wider select-none">
              <tr>
                <th className="py-3 px-4 min-w-[180px]">
                  <button
                    type="button"
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1.5 hover:text-white cursor-pointer"
                  >
                    <span>Property Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>

                {elements.map((el, idx) => {
                  const theme = ELEMENT_THEMES[idx] || ELEMENT_THEMES[0];
                  const field = idx === 0 ? 'slot1' : idx === 1 ? 'slot2' : 'slot3';
                  return (
                    <th key={el.number} className="py-3 px-4 min-w-[150px]">
                      <button
                        type="button"
                        onClick={() => handleSort(field as any)}
                        className="flex items-center gap-1.5 cursor-pointer font-bold"
                        style={{ color: theme.primary }}
                      >
                        <span>
                          {el.symbol} ({el.name})
                        </span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                  );
                })}

                <th className="py-3 px-4 min-w-[160px]">Differential / Comparison</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-sans">
              {sortedProperties.map((prop) => {
                const rawValues = elements.map((e) => prop.getValue(e));
                const validNumbers = rawValues.filter(
                  (v): v is number => typeof v === 'number' && !isNaN(v) && v > 0
                );
                const hasHighLow = validNumbers.length >= 2;
                const maxVal = hasHighLow ? Math.max(...validNumbers) : null;
                const minVal = hasHighLow ? Math.min(...validNumbers) : null;

                // Difference calculation between element 1 and 2
                let diffDisplay: React.ReactNode = <span className="text-slate-500 font-mono">—</span>;

                if (prop.isNumeric && validNumbers.length >= 2 && rawValues[0] && rawValues[1]) {
                  const v1 = rawValues[0];
                  const v2 = rawValues[1];
                  const diff = v2 - v1;
                  const pct = Math.round((Math.abs(diff) / Math.min(v1, v2)) * 100);

                  if (diff === 0) {
                    diffDisplay = <span className="text-slate-400 font-mono text-[11px]">= Identical</span>;
                  } else {
                    const higherElem = diff > 0 ? elements[1] : elements[0];
                    const theme = diff > 0 ? ELEMENT_THEMES[1] : ELEMENT_THEMES[0];
                    diffDisplay = (
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="font-bold" style={{ color: theme.primary }}>
                          ▲ {higherElem.symbol}
                        </span>
                        <span className="text-slate-300">
                          +{Math.abs(diff) < 0.01 ? Math.abs(diff).toExponential(2) : Math.abs(diff).toFixed(2)}{' '}
                          {prop.unit}
                        </span>
                        <span className="text-slate-500 font-semibold">(+{pct}%)</span>
                      </div>
                    );
                  }
                }

                return (
                  <tr key={prop.id} className="hover:bg-slate-900/40 transition-colors group">
                    {/* Property Label with Info popover */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white tracking-tight">{prop.name}</span>
                        <button
                          type="button"
                          onClick={() => setActiveTooltip(activeTooltip === prop.id ? null : prop.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-500 hover:text-cyan-400 transition-opacity cursor-pointer"
                          title={prop.description}
                        >
                          <Info className="w-3 h-3" />
                        </button>
                      </div>
                      {activeTooltip === prop.id && (
                        <p className="mt-1 text-[11px] text-cyan-200/90 bg-cyan-950/40 p-1.5 rounded border border-cyan-500/20">
                          {prop.description}
                        </p>
                      )}
                    </td>

                    {/* Element Values */}
                    {elements.map((el, idx) => {
                      const theme = ELEMENT_THEMES[idx] || ELEMENT_THEMES[0];
                      const val = rawValues[idx];
                      const formatted = prop.formatValue(el);
                      const isHighest = hasHighLow && val === maxVal && maxVal !== minVal;
                      const isLowest = hasHighLow && val === minVal && maxVal !== minVal;

                      return (
                        <td key={el.number} className="py-2.5 px-4 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs font-semibold ${
                                isHighest
                                  ? 'text-white font-bold'
                                  : isLowest
                                  ? 'text-slate-400'
                                  : 'text-slate-200'
                              }`}
                            >
                              {formatted}
                            </span>
                            {isHighest && (
                              <span
                                className="px-1.5 py-0.2 rounded text-[9px] font-bold tracking-tight uppercase"
                                style={{
                                  backgroundColor: `${theme.primary}20`,
                                  color: theme.primary,
                                  border: `1px solid ${theme.primary}50`,
                                }}
                              >
                                Max
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Differential */}
                    <td className="py-2.5 px-4">{diffDisplay}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
