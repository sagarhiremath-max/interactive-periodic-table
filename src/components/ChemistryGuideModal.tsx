import React, { useState } from 'react';
import { X, TrendingUp, BookOpen, Atom, Layers, Sparkles, Zap, CircleDot, Scale, Thermometer, ArrowRight, ArrowDown } from 'lucide-react';
import { TREND_CONFIGS, type TrendType, getTrendColor } from '../data/trends';

interface ChemistryGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'trends' | 'about';
  selectedTrend?: TrendType;
  darkMode: boolean;
  onApplyTrend?: (trend: TrendType) => void;
}

type MeasuredTrend = 'atomicRadius' | 'electronegativity' | 'ionizationEnergy' | 'density' | 'meltingPoint';

export const ChemistryGuideModal: React.FC<ChemistryGuideModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'trends',
  selectedTrend = 'atomicRadius',
  onApplyTrend,
}) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'about'>(initialTab);
  const [activeTrend, setActiveTrend] = useState<MeasuredTrend>(
    selectedTrend !== 'none' ? selectedTrend : 'atomicRadius'
  );

  if (!isOpen) return null;

  const currentTrendConfig = TREND_CONFIGS[activeTrend];

  const trendTabs: { id: MeasuredTrend; label: string; icon: React.FC<{ size: number; className?: string }> }[] = [
    { id: 'atomicRadius', label: 'Atomic Radius', icon: CircleDot },
    { id: 'electronegativity', label: 'Electronegativity', icon: TrendingUp },
    { id: 'ionizationEnergy', label: 'Ionization Energy', icon: Zap },
    { id: 'density', label: 'Density', icon: Scale },
    { id: 'meltingPoint', label: 'Melting Point', icon: Thermometer },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto font-sans select-none animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-[#090d20] border border-cyan-500/40 text-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden">
        {/* Top glowing accent gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-500 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <BookOpen className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide font-mono uppercase">
                Chemistry & Periodic Trends Guide
              </h2>
              <span className="text-xs text-cyan-400 font-mono">
                Physical Laws, Orbital Blocks & Trend Mechanics
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700/80 hover:border-rose-500/40 transition-colors cursor-pointer"
            title="Close Guide (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Top Navigation Tabs */}
        <div className="px-6 py-2.5 border-b border-slate-800/80 bg-slate-950/60 flex items-center gap-2.5 shrink-0 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('trends')}
            className={`px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'trends'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
            }`}
          >
            <TrendingUp size={14} className="text-cyan-400" />
            <span>Periodic Laws & Trends</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
            }`}
          >
            <Atom size={14} className="text-cyan-400" />
            <span>About Periodic Table</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5" style={{ scrollbarWidth: 'thin' }}>
          {activeTab === 'trends' ? (
            <div className="space-y-4">
              {/* Trend Selector Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {trendTabs.map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTrend === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTrend(t.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer border font-mono ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/25 to-teal-500/25 text-cyan-200 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                          : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <Icon size={13} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Trend Detailed Card */}
              {currentTrendConfig && (
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-4 shadow-inner">
                  {/* Title & Gradient Bar */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white font-mono uppercase tracking-wide flex items-center gap-2">
                        <span className="text-cyan-400">{currentTrendConfig.name}</span>
                        <span className="text-xs text-slate-400 font-normal">({currentTrendConfig.unit})</span>
                      </h3>
                      <p className="text-xs text-slate-300 font-sans mt-0.5 leading-relaxed">
                        {currentTrendConfig.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs font-mono">
                      <span className="text-slate-400 font-bold">
                        {currentTrendConfig.min} → {currentTrendConfig.max} {currentTrendConfig.unit}
                      </span>
                      <div
                        className="h-3.5 w-32 rounded-full border border-slate-700 overflow-hidden shadow-sm"
                        style={{
                          background: `linear-gradient(to right, ${getTrendColor(0)}, ${getTrendColor(0.5)}, ${getTrendColor(1)})`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Period & Group Trends */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/70 space-y-1.5">
                      <span className="font-mono font-bold uppercase text-[10px] tracking-wider text-rose-400 flex items-center gap-1.5">
                        <ArrowRight size={13} />
                        <span>Across Period (Left ➔ Right):</span>
                      </span>
                      <p className="leading-relaxed font-sans text-slate-200 text-xs">
                        {currentTrendConfig.periodTrend}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/70 space-y-1.5">
                      <span className="font-mono font-bold uppercase text-[10px] tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <ArrowDown size={13} />
                        <span>Down Group (Top ➔ Bottom):</span>
                      </span>
                      <p className="leading-relaxed font-sans text-slate-200 text-xs">
                        {currentTrendConfig.groupTrend}
                      </p>
                    </div>
                  </div>

                  {/* Underlying Chemical Mechanism */}
                  <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-xs space-y-1.5">
                    <span className="font-mono font-bold uppercase tracking-wider text-[10px] text-cyan-300 block">
                      Underlying Chemical Mechanism:
                    </span>
                    <p className="leading-relaxed font-sans text-slate-200 text-xs">
                      {currentTrendConfig.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-2">
                <div className="flex items-center gap-2 font-mono font-bold uppercase text-sm text-rose-400">
                  <Atom size={18} />
                  <h4>Modern Periodic Law</h4>
                </div>
                <p className="leading-relaxed font-sans text-slate-300 text-xs">
                  First formulated systematically by Dmitri Mendeleev and refined by Henry Moseley, the periodic law states that physical and chemical properties of the elements are periodic functions of their atomic numbers (Z). Elements with matching valence configurations belong to the same group.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-2">
                <div className="flex items-center gap-2 font-mono font-bold uppercase text-sm text-cyan-400">
                  <Layers size={18} />
                  <h4>Orbital Blocks (s, p, d, f)</h4>
                </div>
                <p className="leading-relaxed font-sans text-slate-300 text-xs">
                  The table is divided into four electronic subshell blocks: <strong>s-block</strong> (Groups 1–2 & He), <strong>p-block</strong> (Groups 13–18), <strong>d-block</strong> (Transition metals, Groups 3–12), and <strong>f-block</strong> (Lanthanides 4f and Actinides 5f).
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-2">
                <div className="flex items-center gap-2 font-mono font-bold uppercase text-sm text-emerald-400">
                  <Sparkles size={18} />
                  <h4>Bohr Electron Shells</h4>
                </div>
                <p className="leading-relaxed font-sans text-slate-300 text-xs">
                  Electrons populate concentric principal shells (n = 1 to 7, labeled K through Q) with a theoretical capacity of 2n² electrons per shell: 2, 8, 18, 32, 50, 72, and 98 according to the Aufbau principle, Hund's rule, and the Pauli exclusion principle.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-2">
                <div className="flex items-center gap-2 font-mono font-bold uppercase text-sm text-amber-400">
                  <Thermometer size={18} />
                  <h4>Thermal Phase Simulation</h4>
                </div>
                <p className="leading-relaxed font-sans text-slate-300 text-xs">
                  Elements transition between solid, liquid, and gas phases depending on experimentally determined melting and boiling points. At standard temperature (293.15 K / 20 °C), only two elements are liquids: Mercury (Hg) and Bromine (Br).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono shrink-0 flex-wrap gap-3">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            NIST / IUPAC Verified Chemical Constants
          </span>
          <div className="flex items-center gap-2.5">
            {onApplyTrend && activeTab === 'trends' && (
              <button
                type="button"
                onClick={() => {
                  onApplyTrend(activeTrend);
                  onClose();
                  const el = document.getElementById('periodic-table-matrix');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 font-black uppercase text-xs shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <TrendingUp size={14} strokeWidth={2.8} />
                <span>Apply Heatmap to Table</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
