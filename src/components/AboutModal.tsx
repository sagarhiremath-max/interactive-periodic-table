import React from 'react';
import { X, Atom, ShieldCheck, Cpu, Database } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto font-sans select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl max-h-[90vh] rounded-2xl bg-slate-950 border border-cyan-500/30 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <Atom className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>About ELEMENTS Lab</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                  v3.0.0
                </span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Interactive Scientific Periodic Explorer
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 transition-all cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed font-sans scrollbar-thin">
          <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed">
            ELEMENTS is a modern scientific research and educational platform built for exploring all 118 chemical elements with real-time atomic simulations, thermodynamic states, and periodic trends.
          </p>

          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-500/10 to-slate-900/60 border border-cyan-500/25 flex items-start gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Database className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  IUPAC &amp; CIAAW Scientific Dataset
                </h4>
                <p className="text-[11px] text-slate-300">
                  Complete reference data for all 118 verified elements, including empirical atomic radii, Pauling electronegativities, quantized electron configurations, and standard phase transition points.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gradient-to-br from-violet-500/10 to-slate-900/60 border border-violet-500/25 flex items-start gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Cpu className="w-4 h-4 text-violet-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Vector Physics &amp; Bohr Simulation
                </h4>
                <p className="text-[11px] text-slate-300">
                  Interactive SVG Bohr atomic models with relativistic orbital shells, quantized energy levels, and subshell electron distribution calculations.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-slate-900/60 border border-emerald-500/25 flex items-start gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  High-Performance Client Architecture
                </h4>
                <p className="text-[11px] text-slate-300">
                  Zero external runtime dependencies for core periodic table exploration. Lightning-fast rendering, responsive across mobile and 4K displays, and persistent bookmarks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
          <span>Elements Lab • Precision Chemical Visualization</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
