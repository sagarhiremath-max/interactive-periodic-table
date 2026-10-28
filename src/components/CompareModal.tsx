import React, { useState } from 'react';
import { X, Scale, ArrowRightLeft, Plus, Trash2 } from 'lucide-react';
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
  onSelectElement1,
  onSelectElement2,
}) => {
  const [element3, setElement3] = useState<ElementData | null>(ELEMENTS_DATA[7]); // Oxygen default for 3rd
  const [showThird, setShowThird] = useState<boolean>(false);

  if (!isOpen) return null;

  const e1 = element1 || ELEMENTS_DATA[0]; // Hydrogen
  const e2 = element2 || ELEMENTS_DATA[5]; // Carbon
  const e3 = element3 || ELEMENTS_DATA[7]; // Oxygen

  const cat1 = CATEGORIES[e1.category] || CATEGORIES['unknown'];
  const cat2 = CATEGORIES[e2.category] || CATEGORIES['unknown'];
  const cat3 = CATEGORIES[e3.category] || CATEGORIES['unknown'];

  const r1 = ATOMIC_RADII_PM[e1.number];
  const r2 = ATOMIC_RADII_PM[e2.number];
  const r3 = ATOMIC_RADII_PM[e3.number];

  const handleSwap12 = () => {
    onSelectElement1(e2);
    onSelectElement2(e1);
  };

  const rows = [
    { label: 'Atomic Number (Z)', v1: e1.number, v2: e2.number, v3: e3.number },
    { label: 'Standard Atomic Weight', v1: `${e1.atomicMass} u`, v2: `${e2.atomicMass} u`, v3: `${e3.atomicMass} u` },
    { label: 'Chemical Category', v1: e1.categoryName, v2: e2.categoryName, v3: e3.categoryName, color1: cat1.color, color2: cat2.color, color3: cat3.color },
    { label: 'Period / Group', v1: `P${e1.period} · G${e1.group}`, v2: `P${e2.period} · G${e2.group}`, v3: `P${e3.period} · G${e3.group}` },
    { label: 'Orbital Block', v1: `${e1.block.toUpperCase()}-block`, v2: `${e2.block.toUpperCase()}-block`, v3: `${e3.block.toUpperCase()}-block` },
    { label: 'Standard State', v1: e1.standardState, v2: e2.standardState, v3: e3.standardState, capitalize: true },
    { label: 'Protons / Neutrons / Electrons', v1: `${e1.number}p / ${Math.round(e1.atomicMassValue) - e1.number}n / ${e1.number}e`, v2: `${e2.number}p / ${Math.round(e2.atomicMassValue) - e2.number}n / ${e2.number}e`, v3: `${e3.number}p / ${Math.round(e3.atomicMassValue) - e3.number}n / ${e3.number}e` },
    { label: 'Atomic Radius', v1: r1 ? `${r1} pm` : 'N/A', v2: r2 ? `${r2} pm` : 'N/A', v3: r3 ? `${r3} pm` : 'N/A' },
    { label: 'Electronegativity (Pauling)', v1: e1.electronegativity ?? 'N/A', v2: e2.electronegativity ?? 'N/A', v3: e3.electronegativity ?? 'N/A' },
    { label: '1st Ionization Energy', v1: e1.ionizationEnergy ? `${e1.ionizationEnergy} kJ/mol` : 'N/A', v2: e2.ionizationEnergy ? `${e2.ionizationEnergy} kJ/mol` : 'N/A', v3: e3.ionizationEnergy ? `${e3.ionizationEnergy} kJ/mol` : 'N/A' },
    { label: 'Density (at STP)', v1: e1.density ? `${e1.density} g/cm³` : 'N/A', v2: e2.density ? `${e2.density} g/cm³` : 'N/A', v3: e3.density ? `${e3.density} g/cm³` : 'N/A' },
    { label: 'Melting Point', v1: formatTemp(e1.meltingPointKelvin, 'C'), v2: formatTemp(e2.meltingPointKelvin, 'C'), v3: formatTemp(e3.meltingPointKelvin, 'C') },
    { label: 'Boiling Point', v1: formatTemp(e1.boilingPointKelvin, 'C'), v2: formatTemp(e2.boilingPointKelvin, 'C'), v3: formatTemp(e3.boilingPointKelvin, 'C') },
    { label: 'Electron Configuration', v1: e1.electronConfigurationSemantic || e1.electronConfiguration, v2: e2.electronConfigurationSemantic || e2.electronConfiguration, v3: e3.electronConfigurationSemantic || e3.electronConfiguration },
    { label: 'Shell Population (K-Q)', v1: e1.shells.join(' · '), v2: e2.shells.join(' · '), v3: e3.shells.join(' · ') },
    { label: 'Discoverer', v1: e1.discoveredBy, v2: e2.discoveredBy, v3: e3.discoveredBy },
  ];

  // Visual comparison metric bars
  const visualMetrics = [
    {
      name: 'Atomic Weight (u)',
      val1: e1.atomicMassValue,
      val2: e2.atomicMassValue,
      val3: e3.atomicMassValue,
      fmt1: `${e1.atomicMass} u`,
      fmt2: `${e2.atomicMass} u`,
      fmt3: `${e3.atomicMass} u`,
    },
    {
      name: 'Atomic Radius (pm)',
      val1: r1,
      val2: r2,
      val3: r3,
      fmt1: r1 ? `${r1} pm` : 'N/A',
      fmt2: r2 ? `${r2} pm` : 'N/A',
      fmt3: r3 ? `${r3} pm` : 'N/A',
    },
    {
      name: 'Electronegativity (Pauling)',
      val1: e1.electronegativity,
      val2: e2.electronegativity,
      val3: e3.electronegativity,
      fmt1: e1.electronegativity ? `${e1.electronegativity}` : 'N/A',
      fmt2: e2.electronegativity ? `${e2.electronegativity}` : 'N/A',
      fmt3: e3.electronegativity ? `${e3.electronegativity}` : 'N/A',
    },
    {
      name: 'Ionization Energy (kJ/mol)',
      val1: e1.ionizationEnergy,
      val2: e2.ionizationEnergy,
      val3: e3.ionizationEnergy,
      fmt1: e1.ionizationEnergy ? `${e1.ionizationEnergy} kJ/mol` : 'N/A',
      fmt2: e2.ionizationEnergy ? `${e2.ionizationEnergy} kJ/mol` : 'N/A',
      fmt3: e3.ionizationEnergy ? `${e3.ionizationEnergy} kJ/mol` : 'N/A',
    },
    {
      name: 'Density (g/cm³)',
      val1: e1.density,
      val2: e2.density,
      val3: e3.density,
      fmt1: e1.density ? `${e1.density} g/cm³` : 'N/A',
      fmt2: e2.density ? `${e2.density} g/cm³` : 'N/A',
      fmt3: e3.density ? `${e3.density} g/cm³` : 'N/A',
    },
    {
      name: 'Melting Point (K)',
      val1: e1.meltingPointKelvin,
      val2: e2.meltingPointKelvin,
      val3: e3.meltingPointKelvin,
      fmt1: e1.meltingPointKelvin ? `${Math.round(e1.meltingPointKelvin)} K` : 'N/A',
      fmt2: e2.meltingPointKelvin ? `${Math.round(e2.meltingPointKelvin)} K` : 'N/A',
      fmt3: e3.meltingPointKelvin ? `${Math.round(e3.meltingPointKelvin)} K` : 'N/A',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto font-sans select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-950 border border-cyan-500/30 text-slate-100 shadow-[0_16px_48px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Element Property Comparison Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Compare {showThird ? '3 elements' : '2 elements'} side-by-side with metric difference charts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!showThird ? (
              <button
                type="button"
                onClick={() => setShowThird(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add 3rd Element</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowThird(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/60 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove 3rd</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSwap12}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
              title="Swap element 1 and 2"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Element Selection Headers */}
        <div className={`p-4 border-b border-slate-800/80 bg-slate-900/40 grid ${showThird ? 'grid-cols-3' : 'grid-cols-2'} gap-3 shrink-0`}>
          {/* Element 1 Selector */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Slot 1</span>
              <span className="text-[10px] font-mono text-slate-400">Z = {e1.number}</span>
            </div>
            <select
              value={e1.number}
              onChange={(e) => {
                const found = ELEMENTS_DATA.find((item) => item.number === Number(e.target.value));
                if (found) onSelectElement1(found);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {ELEMENTS_DATA.map((elem) => (
                <option key={elem.number} value={elem.number}>
                  #{elem.number} {elem.symbol} — {elem.name}
                </option>
              ))}
            </select>
          </div>

          {/* Element 2 Selector */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-violet-400 font-bold">Slot 2</span>
              <span className="text-[10px] font-mono text-slate-400">Z = {e2.number}</span>
            </div>
            <select
              value={e2.number}
              onChange={(e) => {
                const found = ELEMENTS_DATA.find((item) => item.number === Number(e.target.value));
                if (found) onSelectElement2(found);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white focus:outline-none focus:border-violet-400 cursor-pointer"
            >
              {ELEMENTS_DATA.map((elem) => (
                <option key={elem.number} value={elem.number}>
                  #{elem.number} {elem.symbol} — {elem.name}
                </option>
              ))}
            </select>
          </div>

          {/* Element 3 Selector (Optional) */}
          {showThird && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">Slot 3</span>
                <span className="text-[10px] font-mono text-slate-400">Z = {e3.number}</span>
              </div>
              <select
                value={e3.number}
                onChange={(e) => {
                  const found = ELEMENTS_DATA.find((item) => item.number === Number(e.target.value));
                  if (found) setElement3(found);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {ELEMENTS_DATA.map((elem) => (
                  <option key={elem.number} value={elem.number}>
                    #{elem.number} {elem.symbol} — {elem.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Comparison Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6" style={{ scrollbarWidth: 'thin' }}>
          {/* Visual Property Comparison Bars */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Visual Metric Comparison
            </h3>

            <div className="space-y-4">
              {visualMetrics.map((metric, idx) => {
                const vals = [metric.val1, metric.val2, showThird ? metric.val3 : null].filter(
                  (v): v is number => typeof v === 'number' && !isNaN(v) && v > 0
                );
                const maxVal = vals.length > 0 ? Math.max(...vals) : 1;

                const pct1 = typeof metric.val1 === 'number' && metric.val1 > 0 ? (metric.val1 / maxVal) * 100 : 0;
                const pct2 = typeof metric.val2 === 'number' && metric.val2 > 0 ? (metric.val2 / maxVal) * 100 : 0;
                const pct3 = typeof metric.val3 === 'number' && metric.val3 > 0 ? (metric.val3 / maxVal) * 100 : 0;

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="font-semibold text-white">{metric.name}</span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-cyan-400 font-bold">{e1.symbol}: {metric.fmt1}</span>
                        <span className="text-violet-400 font-bold">{e2.symbol}: {metric.fmt2}</span>
                        {showThird && <span className="text-amber-400 font-bold">{e3.symbol}: {metric.fmt3}</span>}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {/* Bar 1 */}
                      <div className="h-2 rounded-full bg-slate-950 overflow-hidden flex">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                          style={{ width: `${Math.max(3, pct1)}%` }}
                        />
                      </div>
                      {/* Bar 2 */}
                      <div className="h-2 rounded-full bg-slate-950 overflow-hidden flex">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-300 shadow-[0_0_8px_rgba(139,92,246,0.4)]"
                          style={{ width: `${Math.max(3, pct2)}%` }}
                        />
                      </div>
                      {/* Bar 3 */}
                      {showThird && (
                        <div className="h-2 rounded-full bg-slate-950 overflow-hidden flex">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                            style={{ width: `${Math.max(3, pct3)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Properties Table */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-xs font-sans text-left">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 font-mono text-[11px] text-slate-400 uppercase">
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4 text-cyan-400 font-bold">
                    {e1.symbol} ({e1.name})
                  </th>
                  <th className="py-3 px-4 text-violet-400 font-bold">
                    {e2.symbol} ({e2.name})
                  </th>
                  {showThird && (
                    <th className="py-3 px-4 text-amber-400 font-bold">
                      {e3.symbol} ({e3.name})
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/60 font-mono">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-400">
                      {r.label}
                    </td>
                    <td className="py-2.5 px-4 text-white font-semibold">
                      <span style={{ color: r.color1 }}>{r.v1}</span>
                    </td>
                    <td className="py-2.5 px-4 text-white font-semibold">
                      <span style={{ color: r.color2 }}>{r.v2}</span>
                    </td>
                    {showThird && (
                      <td className="py-2.5 px-4 text-white font-semibold">
                        <span style={{ color: r.color3 }}>{r.v3}</span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
