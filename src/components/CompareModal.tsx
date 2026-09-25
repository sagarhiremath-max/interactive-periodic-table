import React from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { type ElementData, ELEMENTS_DATA, CATEGORIES } from '../data/elements';
import { formatTemp } from '../utils/helpers';

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

  const rows = [
    { label: 'Atomic Number', v1: e1.number, v2: e2.number },
    { label: 'Relative Atomic Mass', v1: `${e1.atomicMass} u`, v2: `${e2.atomicMass} u` },
    { label: 'Category', v1: e1.categoryName, v2: e2.categoryName, color1: cat1.color, color2: cat2.color },
    { label: 'Period / Group', v1: `P${e1.period} / G${e1.group}`, v2: `P${e2.period} / G${e2.group}` },
    { label: 'Block', v1: `${e1.block.toUpperCase()}-block`, v2: `${e2.block.toUpperCase()}-block` },
    { label: 'Standard State', v1: e1.standardState, v2: e2.standardState, capitalize: true },
    { label: 'Electron Config', v1: e1.electronConfigurationSemantic || e1.electronConfiguration, v2: e2.electronConfigurationSemantic || e2.electronConfiguration, mono: true },
    { label: 'Shells (e⁻)', v1: e1.shells.join(', '), v2: e2.shells.join(', ') },
    { label: 'Melting Point', v1: formatTemp(e1.meltingPointKelvin, 'C'), v2: formatTemp(e2.meltingPointKelvin, 'C') },
    { label: 'Boiling Point', v1: formatTemp(e1.boilingPointKelvin, 'C'), v2: formatTemp(e2.boilingPointKelvin, 'C') },
    { label: 'Density', v1: e1.density ? `${e1.density} g/cm³` : 'N/A', v2: e2.density ? `${e2.density} g/cm³` : 'N/A' },
    { label: 'Electronegativity', v1: e1.electronegativity ?? 'N/A', v2: e2.electronegativity ?? 'N/A' },
    { label: '1st Ionization Energy', v1: e1.ionizationEnergy ? `${e1.ionizationEnergy} kJ/mol` : 'N/A', v2: e2.ionizationEnergy ? `${e2.ionizationEnergy} kJ/mol` : 'N/A' },
    { label: 'Discovered By', v1: e1.discoveredBy, v2: e2.discoveredBy },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-black/60 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className={`relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border ${
          darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between border-white/10">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="text-cyan-400" size={20} />
            <h2 className="text-lg font-bold">Side-by-Side Element Comparison</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Element Selectors */}
        <div className="grid grid-cols-2 p-4 sm:p-6 gap-4 border-b border-white/10 bg-slate-950/40">
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-semibold uppercase">Element 1</label>
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
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl border"
                style={{ backgroundColor: `${cat1.color}25`, borderColor: cat1.color, color: cat1.color }}
              >
                {e1.symbol}
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">{e1.name}</h3>
                <span className="text-xs text-slate-400">{e1.categoryName}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-semibold uppercase">Element 2</label>
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
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl border"
                style={{ backgroundColor: `${cat2.color}25`, borderColor: cat2.color, color: cat2.color }}
              >
                {e2.symbol}
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">{e2.name}</h3>
                <span className="text-xs text-slate-400">{e2.categoryName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase text-[11px]">
                <th className="py-2.5 px-3">Property</th>
                <th className="py-2.5 px-3 w-5/12 font-semibold text-white">{e1.name}</th>
                <th className="py-2.5 px-3 w-5/12 font-semibold text-white">{e2.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 font-medium whitespace-nowrap">{row.label}</td>
                  <td
                    className={`py-2.5 px-3 ${row.mono ? 'font-mono text-xs' : ''} ${row.capitalize ? 'capitalize' : ''}`}
                    style={row.color1 ? { color: row.color1, fontWeight: 'bold' } : undefined}
                  >
                    {row.v1}
                  </td>
                  <td
                    className={`py-2.5 px-3 ${row.mono ? 'font-mono text-xs' : ''} ${row.capitalize ? 'capitalize' : ''}`}
                    style={row.color2 ? { color: row.color2, fontWeight: 'bold' } : undefined}
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
  );
};
