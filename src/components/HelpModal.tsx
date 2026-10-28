import React from 'react';
import { X, HelpCircle, Keyboard, MousePointer, Search, SlidersHorizontal, Scale, Award } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', desc: 'Focus instant search bar' },
    { key: 'Esc', desc: 'Close any active panel or clear search' },
    { key: '← / →', desc: 'Navigate previous / next element in detail panel' },
    { key: 'Enter / Space', desc: 'Select and inspect focused element' },
  ];

  const features = [
    {
      icon: MousePointer,
      title: 'Inspect & Bohr Simulation',
      desc: 'Click any element in the grid to reveal its detailed properties, quantized Bohr model, orbital subshells, and discovery history.',
    },
    {
      icon: Search,
      title: 'Instant Search & Highlights',
      desc: 'Type any element name (e.g. "Iron"), symbol ("Fe"), or atomic number ("26") to instantly filter and highlight matching atoms.',
    },
    {
      icon: SlidersHorizontal,
      title: 'Multi-Criteria Filters & Heatmaps',
      desc: 'Filter by chemical category, standard physical state (Solid/Liquid/Gas), metals/nonmetals, or switch Color Mode to visualize Periodic Trends heatmaps.',
    },
    {
      icon: Scale,
      title: '2 or 3 Element Comparison',
      desc: 'Compare properties across 2 or 3 elements side-by-side with visual metric bars and difference tables.',
    },
    {
      icon: Award,
      title: 'Chemistry Quiz Challenge',
      desc: 'Test your chemical knowledge across question types with real-time scoring, streaks, and hint mechanics.',
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
      <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-cyan-500/30 text-slate-100 shadow-[0_16px_48px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Help & Interaction Guide
              </h2>
              <span className="text-xs text-slate-400 font-mono">Periodic Table Navigation</span>
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
        <div className="p-5 sm:p-6 space-y-5 text-xs text-slate-300 leading-relaxed font-sans">
          {/* Keyboard Shortcuts Table */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-2.5 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4" />
              <span>Keyboard Shortcuts</span>
            </h3>
            <div className="rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800 font-mono text-[11px]">
              {shortcuts.map((s, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between bg-slate-900/40">
                  <span className="text-slate-300">{s.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Core Capabilities */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-violet-400 mb-2.5">
              Feature Overview
            </h3>
            <div className="space-y-2.5">
              {features.map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
                    <Icon className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-medium mb-0.5">{f.title}</strong>
                      <span className="text-slate-400">{f.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
