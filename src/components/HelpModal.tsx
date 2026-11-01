import React from 'react';
import {
  X,
  HelpCircle,
  Keyboard,
  MousePointer,
  Search,
  SlidersHorizontal,
  Scale,
  Award,
  Sparkles,
  Atom,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', desc: 'Focus instant search bar' },
    { key: 'A', desc: 'Open 3D Atom Explorer' },
    { key: 'Esc', desc: 'Close active modal or clear search' },
    { key: '← / →', desc: 'Navigate adjacent elements' },
    { key: 'Enter / Space', desc: 'Inspect focused element' },
  ];

  const features = [
    {
      icon: Atom,
      title: '3D Atom Explorer & Orbitals',
      desc: 'Explore 3D interactive atoms, nucleus protons/neutrons, animated Keplerian shells, and quantum orbital shapes (s, p, d, f).',
      color: 'from-purple-500/20 to-purple-500/5',
      border: 'border-purple-500/30 hover:border-purple-400',
      iconColor: 'text-purple-400',
      badgeBg: 'bg-purple-500/15',
    },
    {
      icon: MousePointer,
      title: 'Inspect & Bohr Simulation',
      desc: 'Click any element to inspect its 3D Bohr model, quantized shells, orbitals, and thermodynamic data.',
      color: 'from-cyan-500/20 to-cyan-500/5',
      border: 'border-cyan-500/30 hover:border-cyan-400',
      iconColor: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/15',
    },
    {
      icon: Search,
      title: 'Instant Search & Highlights',
      desc: 'Type any element name (e.g. "Iron"), symbol ("Fe"), or atomic number ("26") to instantly filter matches.',
      color: 'from-sky-500/20 to-sky-500/5',
      border: 'border-sky-500/30 hover:border-sky-400',
      iconColor: 'text-sky-400',
      badgeBg: 'bg-sky-500/15',
    },
    {
      icon: SlidersHorizontal,
      title: 'Multi-Criteria Filters & Heatmaps',
      desc: 'Filter by chemical category, state (Solid/Liquid/Gas), or switch Color Mode to visualize Periodic Trends heatmaps.',
      color: 'from-violet-500/20 to-violet-500/5',
      border: 'border-violet-500/30 hover:border-violet-400',
      iconColor: 'text-violet-400',
      badgeBg: 'bg-violet-500/15',
    },
    {
      icon: Scale,
      title: '2 or 3 Element Comparison',
      desc: 'Compare properties across 2 or 3 elements side-by-side with visual metric bars, spider charts, and difference tables.',
      color: 'from-teal-500/20 to-teal-500/5',
      border: 'border-teal-500/30 hover:border-teal-400',
      iconColor: 'text-teal-400',
      badgeBg: 'bg-teal-500/15',
    },
    {
      icon: Award,
      title: 'Chemistry Quiz Challenge',
      desc: 'Test your chemical knowledge across question categories with real-time scoring, streaks, and hint mechanics.',
      color: 'from-amber-500/20 to-amber-500/5',
      border: 'border-amber-500/30 hover:border-amber-400',
      iconColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/15',
      featured: true,
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
      <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-slate-950 border border-cyan-500/30 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Help &amp; Navigation Guide</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                  Quick Guide
                </span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Keyboard shortcuts, exploration features, and controls
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

        {/* Modal Body with smooth scrolling */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed font-sans scrollbar-thin">
          {/* Section 1: Keyboard Shortcuts Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Keyboard className="w-4 h-4 text-cyan-400" />
                <span>Keyboard Shortcuts</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Quick desktop navigation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {shortcuts.map((s, idx) => (
                <div
                  key={idx}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 flex items-center justify-between gap-3 transition-colors shadow-sm"
                >
                  <span className="text-slate-300 font-medium text-xs truncate">
                    {s.desc}
                  </span>
                  <kbd className="shrink-0 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700/80 text-cyan-300 font-mono font-bold text-[11px] shadow-inner tracking-tight">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Feature Overview Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>Feature Overview</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Interactive tools &amp; capabilities
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl bg-gradient-to-br ${f.color} to-slate-900/80 border ${f.border} transition-all hover:-translate-y-0.5 shadow-sm ${
                      f.featured ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg ${f.badgeBg} border border-white/10 flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${f.iconColor}`} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white tracking-tight">
                          {f.title}
                        </h4>
                        <p className="text-[11px] text-slate-300 leading-normal">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer with Pro-Tip */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>
              Pro Tip: Press <strong className="text-cyan-300 font-bold">/</strong> anywhere to jump straight into search.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
