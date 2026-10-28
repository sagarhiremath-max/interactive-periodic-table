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
      <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-cyan-500/30 text-slate-100 shadow-[0_16px_48px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <Atom className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                About ELEMENTS Lab
              </h2>
              <span className="text-xs text-cyan-400 font-mono">v3.0.0 Production Release</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
          <p className="text-sm text-slate-100 font-medium">
            ELEMENTS is a futuristic science-lab interface and comprehensive periodic table explorer built for researchers, students, and chemistry enthusiasts.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <Database className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-mono text-[11px] uppercase mb-0.5">
                  IUPAC & CIAAW Scientific Dataset
                </strong>
                <span>
                  Complete reference data for all 118 verified elements, including empirical atomic radii, Pauling electronegativities, quantized electron configurations, and standard phase transition points.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <Cpu className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-mono text-[11px] uppercase mb-0.5">
                  Vector Physics & Bohr Simulation
                </strong>
                <span>
                  Interactive SVG Bohr atomic models with relativistic orbital shells, quantized energy levels, and subshell electron distribution calculations.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-mono text-[11px] uppercase mb-0.5">
                  100% Offline Architecture
                </strong>
                <span>
                  Zero external API dependencies for core exploration. Fully self-contained, lightning-fast rendering, and persistent session bookmarks in local storage.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center text-slate-400 font-mono text-[11px]">
            Created with precision for modern chemical visualization.
          </div>
        </div>
      </div>
    </div>
  );
};
