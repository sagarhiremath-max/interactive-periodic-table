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
  onOpenAtomExplorer?: () => void;
  onPickRandomElement: () => void;
  totalElementsCount?: number;
  onOpenFitView?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  darkMode,
  onExploreTable,
  onOpenQuiz,
  onOpenCompare,
  onOpenAtomExplorer,
  onPickRandomElement,
  totalElementsCount = 118,
  onOpenFitView,
}) => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-[#0a0f26]/90 via-[#070b19]/90 to-[#050814]/90 p-5 sm:p-7 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      {/* Animated Scientific Particle Background */}
      <ParticleBackground darkMode={darkMode} />

      {/* Decorative Subtle Radial Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />

      {/* Structured 2-Column Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT COLUMN: Main Information, Banner, Stats & Actions */}
        <div className="lg:col-span-8 flex flex-col justify-center">
          {/* Scientific Exploration Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-medium mb-3 w-fit shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>SCIENTIFIC EXPLORATION ENGINE</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Explore the{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">
              Building Blocks
            </span>{' '}
            of the Universe
          </h1>

          {/* Description */}
          <p className="mt-2.5 text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-2xl">
            Discover every element, inspect orbital configurations, 3D Bohr models, thermodynamic phase transitions, and periodic trends across all 118 chemical elements.
          </p>

          {/* Full Table Promotional Banner */}
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
              className="mt-4 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-cyan-950/90 via-[#0a1b33]/90 to-slate-900/95 border border-cyan-400/60 shadow-[0_0_24px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/30 flex items-center justify-between gap-3 cursor-pointer group hover:border-cyan-300 hover:shadow-[0_0_32px_rgba(6,182,212,0.5)] transition-all transform hover:-translate-y-0.5 select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-300 text-slate-950 flex items-center justify-center font-black shadow-[0_0_16px_rgba(34,211,238,0.7)] group-hover:scale-105 transition-transform shrink-0">
                  <Maximize2 size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-white group-hover:text-cyan-300 transition-colors uppercase font-mono tracking-wide">
                      View Complete Table Without Scrolling
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400 text-slate-950 uppercase font-mono shadow-sm">
                      Full Fit
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans mt-0.5 hidden sm:block">
                    Instant 100% full-screen fit of all 18 groups & 7 periods — no horizontal or vertical scrolling needed!
                  </p>
                </div>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 group-hover:from-cyan-300 group-hover:to-teal-200 shrink-0 transition-all">
                <span>Open View</span>
                <ArrowRight size={13} />
              </div>
            </div>
          )}

          {/* Statistics Cards - 1 Uniform Row on Desktop */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black font-mono text-cyan-400">
                {totalElementsCount}
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5 font-mono">
                Elements
              </div>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black font-mono text-violet-400">
                7
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5 font-mono">
                Periods
              </div>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                18
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5 font-mono">
                Groups
              </div>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                94 / 24
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5 font-mono">
                Natural / Synth
              </div>
            </div>
          </div>

          {/* Primary Action Buttons - Standardized h-10 Heights */}
          <div className="mt-5 flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={onExploreTable}
              className="h-10 inline-flex items-center gap-2 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 hover:from-cyan-300 hover:to-teal-200 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_28px_rgba(6,182,212,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Explore Periodic Grid</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            {onOpenAtomExplorer && (
              <button
                type="button"
                onClick={onOpenAtomExplorer}
                className="h-10 inline-flex items-center gap-2 px-3.5 rounded-xl font-bold text-xs sm:text-sm text-cyan-200 bg-gradient-to-r from-cyan-950/90 to-purple-950/90 hover:from-cyan-900/90 hover:to-purple-900/90 border border-cyan-500/40 hover:border-cyan-300 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.45)] transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Atom className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                <span>3D Atom Explorer</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenCompare}
              className="h-10 inline-flex items-center gap-2 px-3.5 rounded-xl font-medium text-xs sm:text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-cyan-400/50 transition-all cursor-pointer"
            >
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Compare Elements</span>
            </button>

            <button
              type="button"
              onClick={onOpenQuiz}
              className="h-10 inline-flex items-center gap-2 px-3.5 rounded-xl font-medium text-xs sm:text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-violet-400/50 transition-all cursor-pointer"
            >
              <BrainCircuit className="w-4 h-4 text-violet-400" />
              <span>Science Quiz</span>
            </button>

            <button
              type="button"
              onClick={onPickRandomElement}
              className="h-10 inline-flex items-center gap-2 px-3.5 rounded-xl font-medium text-xs sm:text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-amber-400/50 transition-all cursor-pointer"
            >
              <Dice5 className="w-4 h-4 text-amber-400" />
              <span>Random Element</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Balanced Decorative Scientific Atom Illustration */}
        <div className="hidden lg:flex lg:col-span-4 items-center justify-center">
          <div
            role="button"
            tabIndex={0}
            onClick={onOpenAtomExplorer}
            className="relative w-56 h-56 xl:w-64 xl:h-64 rounded-full border border-cyan-500/20 hover:border-cyan-400/60 bg-gradient-to-b from-cyan-950/20 via-slate-900/40 to-transparent p-6 flex items-center justify-center shadow-[inset_0_0_30px_rgba(6,182,212,0.1)] hover:shadow-[0_0_35px_rgba(6,182,212,0.35)] transition-all cursor-pointer group"
            title="Launch 3D Atom Explorer"
          >
            {/* Outer Orbit */}
            <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/20 animate-[spin_30s_linear_infinite]" />
            {/* Middle Orbit */}
            <div className="absolute inset-7 rounded-full border border-dotted border-violet-400/25 animate-[spin_20s_linear_infinite_reverse]" />
            {/* Rotating Atom Graphic */}
            <Atom size={120} strokeWidth={1.3} className="text-cyan-400/70 animate-[spin_18s_linear_infinite]" />
            {/* Core Nucleus Glow */}
            <div className="absolute w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 blur-sm opacity-80" />
            <div className="absolute w-4 h-4 rounded-full bg-white shadow-[0_0_12px_#38bdf8]" />
            {/* Orbiting Electron 1 */}
            <div className="absolute top-4 left-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_6px_#67e8f9] animate-pulse" />
            {/* Orbiting Electron 2 */}
            <div className="absolute bottom-6 right-8 w-2 h-2 rounded-full bg-violet-300 shadow-[0_0_6px_#c084fc]" />
          </div>
        </div>
      </div>
    </section>
  );
};
