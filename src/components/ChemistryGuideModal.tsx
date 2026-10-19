import React, { useState } from 'react';
import { X, TrendingUp, BookOpen, Atom, Layers, Sparkles, Zap, CircleDot, Scale, Thermometer } from 'lucide-react';
import { TREND_CONFIGS, type TrendType, getTrendColor } from '../data/trends';

interface ChemistryGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'trends' | 'about';
  selectedTrend?: TrendType;
  darkMode: boolean;
}

type MeasuredTrend = 'atomicRadius' | 'electronegativity' | 'ionizationEnergy' | 'density' | 'meltingPoint';

export const ChemistryGuideModal: React.FC<ChemistryGuideModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'trends',
  selectedTrend = 'atomicRadius',
  darkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'about'>(initialTab);
  const [activeTrend, setActiveTrend] = useState<MeasuredTrend>(
    selectedTrend !== 'none' ? selectedTrend : 'atomicRadius'
  );

  if (!isOpen) return null;

  const currentTrendConfig = TREND_CONFIGS[activeTrend];

  const trendTabs: { id: MeasuredTrend; label: string; icon: React.FC<{ size: number }> }[] = [
    { id: 'atomicRadius', label: 'Atomic Radius', icon: CircleDot },
    { id: 'electronegativity', label: 'Electronegativity', icon: TrendingUp },
    { id: 'ionizationEnergy', label: 'Ionization Energy', icon: Zap },
    { id: 'density', label: 'Density', icon: Scale },
    { id: 'meltingPoint', label: 'Melting Point', icon: Thermometer },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${
          darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b flex items-center justify-between shrink-0 bg-gradient-to-r from-cyan-900/30 via-indigo-900/20 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold">Chemistry & Periodic Trends Guide</h2>
              <p className="text-[11px] text-slate-400">
                IUPAC Theoretical Explanations, Periodic Laws, and Fundamentals
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Top Mode Tabs */}
        <div className="px-5 py-2 border-b flex items-center gap-2 shrink-0 bg-black/20 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'trends'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp size={14} />
            <span>Periodic Trends & Scientific Laws</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'about'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Atom size={14} />
            <span>About The Periodic Table</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: 'thin' }}>
          {activeTab === 'trends' ? (
            <div className="space-y-4">
              {/* Trend Selector Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {trendTabs.map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTrend === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTrend(t.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-xs font-bold'
                          : darkMode
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Icon size={13} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Trend Detailed Card */}
              {currentTrendConfig && (
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    darkMode ? 'bg-slate-800/40 border-slate-700/70' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-base font-bold text-cyan-400">
                        {currentTrendConfig.name} ({currentTrendConfig.unit})
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">{currentTrendConfig.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">
                        Scale: {currentTrendConfig.min} → {currentTrendConfig.max} {currentTrendConfig.unit}
                      </span>
                      <div
                        className="h-2.5 w-24 rounded-full border border-white/20"
                        style={{
                          background: `linear-gradient(to right, ${getTrendColor(0)}, ${getTrendColor(0.5)}, ${getTrendColor(1)})`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Period & Group Trends */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30">
                      <span className="font-bold text-cyan-300 uppercase tracking-wider text-[10px] block mb-1">
                        Across a Period (Left ➔ Right):
                      </span>
                      <p className="text-slate-200 leading-relaxed">{currentTrendConfig.periodTrend}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30">
                      <span className="font-bold text-indigo-300 uppercase tracking-wider text-[10px] block mb-1">
                        Down a Group (Top ➔ Bottom):
                      </span>
                      <p className="text-slate-200 leading-relaxed">{currentTrendConfig.groupTrend}</p>
                    </div>
                  </div>

                  {/* Why it occurs */}
                  <div className="p-3 rounded-lg bg-black/20 border border-white/5 text-xs">
                    <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-1">
                      Underlying Physical Chemistry Principle:
                    </span>
                    <p className="text-slate-300 leading-relaxed">{currentTrendConfig.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Atom size={18} />
                  <h4>Modern Periodic Law</h4>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  First formulated systematically by Dmitri Mendeleev and refined by Henry Moseley, the periodic law states that physical and chemical properties of the elements are periodic functions of their atomic numbers ($Z$). Elements with matching valence configurations belong to the same group.
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Layers size={18} />
                  <h4>Orbital Blocks (s, p, d, f)</h4>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  The table is divided into four electronic subshell blocks: <strong>s-block</strong> (Groups 1–2 & He), <strong>p-block</strong> (Groups 13–18), <strong>d-block</strong> (Transition metals, Groups 3–12), and <strong>f-block</strong> (Lanthanides 4f and Actinides 5f).
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Sparkles size={18} />
                  <h4>Atomic Structure & Bohr Orbitals</h4>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Electrons populate concentric principal shells ($n = 1$ to $7$, labeled K through Q) with a theoretical capacity of $2n^2$ electrons per shell: 2, 8, 18, 32, 50, 72, and 98 according to the Aufbau principle, Hund&apos;s rule, and the Pauli exclusion principle.
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Thermometer size={18} />
                  <h4>Thermal States & Simulation</h4>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Elements transition between solid, liquid, and gas phases depending on their experimentally determined melting and boiling points. At standard temperature (293.15 K / 20 °C), only two elements are liquids: Mercury (Hg) and Bromine (Br).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 border-t flex items-center justify-between bg-black/20 text-xs shrink-0">
          <span className="text-[11px] text-slate-400">
            Based on IUPAC standard definitions and experimental NIST values.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
