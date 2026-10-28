import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Scale,
  BrainCircuit,
  Dice5,
  Atom,
  Maximize2,
} from 'lucide-react';
import { ParticleBackground } from './ParticleBackground';

interface HeroSectionProps {
  darkMode: boolean;
  onExploreTable: () => void;
  onOpenQuiz: () => void;
  onOpenCompare: () => void;
  onPickRandomElement: () => void;
  totalElementsCount?: number;
  onOpenFitView?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  darkMode,
  onExploreTable,
  onOpenQuiz,
  onOpenCompare,
  onPickRandomElement,
  totalElementsCount = 118,
  onOpenFitView,
}) => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-[#0a0f26]/90 via-[#070b19]/90 to-[#050814]/90 p-6 sm:p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      {/* Animated Scientific Particle Background */}
      <ParticleBackground darkMode={darkMode} />

      {/* Decorative Radial Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />

      {/* Ambient Atom Graphic on right for large screens */}
      <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 hidden xl:block opacity-20 text-cyan-400">
        <Atom size={260} strokeWidth={1.2} className="animate-[spin_40s_linear_infinite]" />
      </div>

      <div className="relative z-10 max-w-3xl">
        {/* Lab Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-medium mb-4 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>SCIENTIFIC EXPLORATION ENGINE</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Explore the{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">
            Building Blocks
          </span>{' '}
          of the Universe
        </h1>

        {/* Subtitle */}
        <p className="mt-3.5 text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
          Discover every element, its properties, and its place in the universe. Inspect orbital configurations, 3D Bohr models, thermodynamic phase transitions, and periodic trends.
        </p>

        {/* Highlighted Banner: Direct One-Click Access to Complete Table (No Scroll) */}
        {onOpenFitView && (
          <div
            role="button"
            tabIndex={0}
            onClick={onOpenFitView}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenFitView();
              }
            }}
            className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-[#0a1b33]/90 to-slate-900/95 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400/30 flex items-center justify-between gap-3 cursor-pointer group hover:border-cyan-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-300 text-slate-950 flex items-center justify-center font-black shadow-[0_0_20px_rgba(34,211,238,0.8)] group-hover:scale-110 transition-transform shrink-0">
                <Maximize2 size={22} strokeWidth={2.8} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-black text-white group-hover:text-cyan-300 transition-colors uppercase font-mono tracking-wide">
                    View Complete 118-Element Table Without Scrolling
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-400 text-slate-950 uppercase font-mono shadow-sm animate-pulse">
                    ★ Click Here
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                  Instant 100% full-screen fit of all 18 groups & 7 periods — no horizontal or vertical scrolling needed!
                </p>
              </div>
            </div>

            <button
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-[0_0_20px_rgba(34,211,238,0.6)] shrink-0 transition-all cursor-pointer"
            >
              <span>Open Table</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Live Statistics Banner */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="px-4 py-3 rounded-xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
              {totalElementsCount}
            </div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
              Elements
            </div>
          </div>

          <div className="px-4 py-3 rounded-xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-black font-mono text-violet-400">
              7
            </div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
              Periods
            </div>
          </div>

          <div className="px-4 py-3 rounded-xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              18
            </div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
              Groups
            </div>
          </div>

          <div className="px-4 py-3 rounded-xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
              94 / 24
            </div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
              Natural / Synthetic
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3 flex-wrap">
          {onOpenFitView && (
            <button
              type="button"
              onClick={onOpenFitView}
              className="relative inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 hover:from-cyan-300 hover:to-teal-200 border-2 border-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.7)] hover:shadow-[0_0_45px_rgba(34,211,238,0.9)] ring-4 ring-cyan-400/40 transition-all transform hover:-translate-y-1 active:translate-y-0 cursor-pointer font-sans"
              title="Show the complete periodic table fitted to screen without any scrolling"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-950"></span>
              </span>
              <Maximize2 className="w-4 h-4 text-slate-950" strokeWidth={2.8} />
              <span className="uppercase tracking-tight">Complete Table (No Scroll)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExploreTable}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700 hover:border-cyan-400/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer font-sans"
          >
            <span>Explore Periodic Grid</span>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
          </button>

          <button
            type="button"
            onClick={onOpenCompare}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 hover:border-cyan-400/50 transition-all cursor-pointer"
          >
            <Scale className="w-4 h-4 text-cyan-400" />
            <span>Compare (2-3)</span>
          </button>

          <button
            type="button"
            onClick={onOpenQuiz}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 hover:border-violet-400/50 transition-all cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4 text-violet-400" />
            <span>Science Quiz</span>
          </button>

          <button
            type="button"
            onClick={onPickRandomElement}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 hover:border-amber-400/50 transition-all cursor-pointer"
          >
            <Dice5 className="w-4 h-4 text-amber-400" />
            <span>Random Element</span>
          </button>
        </div>
      </div>
    </section>
  );
};
