import React from 'react';
import { X, ArrowRightLeft, Scale, BarChart2 } from 'lucide-react';
import { type ElementData, ELEMENTS_DATA, CATEGORIES } from '../data/elements';
import { formatTemp } from '../utils/helpers';
import { ATOMIC_RADII_PM } from '../data/trends';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  element1: ElementData | null;
  element2: ElementData | null;
  darkMode: boolean;
  onSelectElement1: (element: ElementData) => void;
  onSelectElement2: (element: ElementData) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  element1,
  element2,
  darkMode,
  onSelectElement1,
  onSelectElement2,
}) => {
  if (!isOpen) return null;

  const e1 = element1 || ELEMENTS_DATA[0]; // Hydrogen default
  const e2 = element2 || ELEMENTS_DATA[5]; // Carbon default

  const cat1 = CATEGORIES[e1.category] || CATEGORIES['unknown'];
  const cat2 = CATEGORIES[e2.category] || CATEGORIES['unknown'];

  const r1 = ATOMIC_RADII_PM[e1.number];
  const r2 = ATOMIC_RADII_PM[e2.number];

  const handleSwap = () => {
    onSelectElement1(e2);
    onSelectElement2(e1);
  };

  const rows = [
    { label: 'Atomic Number', v1: e1.number, v2: e2.number, mono: true },
    { label: 'Standard Atomic Weight', v1: `${e1.atomicMass} u`, v2: `${e2.atomicMass} u`, mono: true },
    { label: 'Chemical Category', v1: e1.categoryName, v2: e2.categoryName, color1: cat1.color, color2: cat2.color },
    { label: 'Period / Group', v1: `P${e1.period} / G${e1.group}`, v2: `P${e2.period} / G${e2.group}` },
    { label: 'Block', v1: `${e1.block.toUpperCase()}-block`, v2: `${e2.block.toUpperCase()}-block` },
    { label: 'Standard State', v1: e1.standardState, v2: e2.standardState, capitalize: true },
    { label: 'Atomic Radius', v1: r1 ? `${r1} pm` : 'N/A', v2: r2 ? `${r2} pm` : 'N/A' },
    { label: 'Electronegativity (Pauling)', v1: e1.electronegativity ?? 'N/A', v2: e2.electronegativity ?? 'N/A', mono: true },
    { label: '1st Ionization Energy', v1: e1.ionizationEnergy ? `${e1.ionizationEnergy} kJ/mol` : 'N/A', v2: e2.ionizationEnergy ? `${e2.ionizationEnergy} kJ/mol` : 'N/A', mono: true },
    { label: 'Density (at STP)', v1: e1.density ? `${e1.density} g/cm³` : 'N/A', v2: e2.density ? `${e2.density} g/cm³` : 'N/A' },
    { label: 'Melting Point', v1: formatTemp(e1.meltingPointKelvin, 'C'), v2: formatTemp(e2.meltingPointKelvin, 'C') },
    { label: 'Boiling Point', v1: formatTemp(e1.boilingPointKelvin, 'C'), v2: formatTemp(e2.boilingPointKelvin, 'C') },
    { label: 'Electron Configuration', v1: e1.electronConfigurationSemantic || e1.electronConfiguration, v2: e2.electronConfigurationSemantic || e2.electronConfiguration, mono: true },
    { label: 'Shell Distribution (e⁻)', v1: e1.shells.join(', '), v2: e2.shells.join(', '), mono: true },
    { label: 'Discovered By', v1: e1.discoveredBy, v2: e2.discoveredBy },
  ];

  // Visual bar comparison items
  const visualMetrics = [
    {
      name: 'Atomic Weight (u)',
      val1: e1.atomicMassValue,
      val2: e2.atomicMassValue,
      fmt1: `${e1.atomicMass} u`,
      fmt2: `${e2.atomicMass} u`,
    },
    {
      name: 'Atomic Radius (pm)',
      val1: r1,
      val2: r2,
      fmt1: r1 ? `${r1} pm` : 'N/A',
      fmt2: r2 ? `${r2} pm` : 'N/A',
    },
    {
      name: 'Electronegativity (Pauling)',
      val1: e1.electronegativity,
      val2: e2.electronegativity,
      fmt1: e1.electronegativity ? `${e1.electronegativity}` : 'N/A',
      fmt2: e2.electronegativity ? `${e2.electronegativity}` : 'N/A',
    },
    {
      name: 'Ionization Energy (kJ/mol)',
      val1: e1.ionizationEnergy,
      val2: e2.ionizationEnergy,
      fmt1: e1.ionizationEnergy ? `${e1.ionizationEnergy} kJ/mol` : 'N/A',
      fmt2: e2.ionizationEnergy ? `${e2.ionizationEnergy} kJ/mol` : 'N/A',
    },
    {
      name: 'Density (g/cm³)',
      val1: e1.density,
      val2: e2.density,
      fmt1: e1.density ? `${e1.density} g/cm³` : 'N/A',
      fmt2: e2.density ? `${e2.density} g/cm³` : 'N/A',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-black/60 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className={`relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border ${
          darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Scale className="text-cyan-400" size={20} />
            <h2 className="text-lg font-bold">Side-by-Side Element Comparison</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison modal"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Element Selectors & Swap */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] p-4 sm:p-6 gap-4 border-b border-white/10 bg-slate-950/40 shrink-0 items-center">
          {/* Element 1 Selector */}
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-semibold uppercase">
              Element 1
            </label>
            <select
              value={e1.number}
              onChange={(e) => {
                const found = ELEMENTS_DATA.find((el) => el.number === Number(e.target.value));
                if (found) onSelectElement1(found);
              }}
              className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              {ELEMENTS_DATA.map((el) => (
                <option key={el.number} value={el.number}>
                  #{el.number} {el.name} ({el.symbol})
                </option>
              ))}
            </select>

            <div className="mt-3 flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl border shadow-sm"
                style={{ backgroundColor: `${cat1.color}25`, borderColor: cat1.color, color: cat1.color }}
              >
                {e1.symbol}
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">{e1.name}</h3>
                <span className="text-xs text-slate-400">
                  {e1.categoryName} • P{e1.period} G{e1.group}
                </span>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center my-1 md:my-0">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap elements"
              aria-label="Swap elements"
              className="p-2.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 transition-all hover:scale-110"
            >
              <ArrowRightLeft size={18} />
            </button>
          </div>

          {/* Element 2 Selector */}
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-semibold uppercase">
              Element 2
            </label>
            <select
              value={e2.number}
              onChange={(e) => {
                const found = ELEMENTS_DATA.find((el) => el.number === Number(e.target.value));
                if (found) onSelectElement2(found);
              }}
              className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              {ELEMENTS_DATA.map((el) => (
                <option key={el.number} value={el.number}>
                  #{el.number} {el.name} ({el.symbol})
                </option>
              ))}
            </select>

            <div className="mt-3 flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl border shadow-sm"
                style={{ backgroundColor: `${cat2.color}25`, borderColor: cat2.color, color: cat2.color }}
              >
                {e2.symbol}
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">{e2.name}</h3>
                <span className="text-xs text-slate-400">
                  {e2.categoryName} • P{e2.period} G{e2.group}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Visual Bar Comparison Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <BarChart2 size={15} className="text-cyan-400" />
              <span>Comparative Property Bars</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {visualMetrics.map((m, idx) => {
                const maxVal = Math.max(m.val1 || 0, m.val2 || 0) || 1;
                const p1 = m.val1 !== null ? Math.round(((m.val1 || 0) / maxVal) * 100) : 0;
                const p2 = m.val2 !== null ? Math.round(((m.val2 || 0) / maxVal) * 100) : 0;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border ${
                      darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-slate-300 mb-2">{m.name}</div>

                    {/* Element 1 Bar */}
                    <div className="space-y-1 mb-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold" style={{ color: cat1.color }}>{e1.symbol} ({e1.name}):</span>
                        <span className="font-mono text-slate-300">{m.fmt1}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/30 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${m.val1 !== null ? Math.max(4, p1) : 0}%`,
                            backgroundColor: cat1.color,
                          }}
                        />
                      </div>
                    </div>

                    {/* Element 2 Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold" style={{ color: cat2.color }}>{e2.symbol} ({e2.name}):</span>
                        <span className="font-mono text-slate-300">{m.fmt2}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/30 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${m.val2 !== null ? Math.max(4, p2) : 0}%`,
                            backgroundColor: cat2.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Property Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Detailed Chemical & Physical Data
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={darkMode ? 'bg-slate-800/80 text-slate-300' : 'bg-slate-100 text-slate-700'}>
                    <th className="p-3 font-semibold uppercase tracking-wider text-[10px] w-1/3">Property</th>
                    <th className="p-3 font-semibold uppercase tracking-wider text-[10px] w-1/3">
                      {e1.name} ({e1.symbol})
                    </th>
                    <th className="p-3 font-semibold uppercase tracking-wider text-[10px] w-1/3">
                      {e2.name} ({e2.symbol})
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`transition-colors ${
                        idx % 2 === 0
                          ? darkMode
                            ? 'bg-slate-900/40'
                            : 'bg-white'
                          : darkMode
                          ? 'bg-slate-800/20'
                          : 'bg-slate-50'
                      } hover:bg-cyan-500/10`}
                    >
                      <td className="p-3 text-slate-400 font-medium">{row.label}</td>
                      <td
                        className={`p-3 ${row.mono ? 'font-mono' : ''} ${row.capitalize ? 'capitalize' : ''}`}
                        style={{ color: row.color1 }}
                      >
                        {row.v1}
                      </td>
                      <td
                        className={`p-3 ${row.mono ? 'font-mono' : ''} ${row.capitalize ? 'capitalize' : ''}`}
                        style={{ color: row.color2 }}
                      >
                        {row.v2}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
