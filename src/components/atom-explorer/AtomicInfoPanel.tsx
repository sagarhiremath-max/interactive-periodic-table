import React from 'react';
import { ShieldCheck, AlertTriangle, Radio } from 'lucide-react';
import { type ElementData, CATEGORIES } from '../../data/elements';
import { type IsotopeData } from '../../data/isotopes';

interface AtomicInfoPanelProps {
  element: ElementData;
  isotopes: IsotopeData[];
  selectedIsotope: IsotopeData;
  onSelectIsotope: (iso: IsotopeData) => void;
}

export const AtomicInfoPanel: React.FC<AtomicInfoPanelProps> = ({
  element,
  isotopes,
  selectedIsotope,
  onSelectIsotope,
}) => {
  const cat = CATEGORIES[element.category] || CATEGORIES['unknown'];

  return (
    <div className="w-full space-y-3.5 font-sans">
      {/* 1. Element Card Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Symbol Box */}
          <div
            className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono border shadow-lg shrink-0"
            style={{
              backgroundColor: `${cat.color}15`,
              borderColor: `${cat.color}60`,
              boxShadow: `0 0 16px ${cat.color}25`,
            }}
          >
            <span className="text-[10px] text-slate-400 font-bold leading-none mb-0.5">
              {element.number}
            </span>
            <span
              className="text-2xl font-black leading-none"
              style={{ color: cat.color }}
            >
              {element.symbol}
            </span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>{element.name}</span>
            </h3>
            <span
              className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase mt-1 border"
              style={{
                backgroundColor: `${cat.color}15`,
                borderColor: `${cat.color}40`,
                color: cat.color,
              }}
            >
              {element.categoryName}
            </span>
          </div>
        </div>

        {/* Mass & Block */}
        <div className="text-right font-mono shrink-0">
          <div className="text-xs font-bold text-slate-200">
            {element.atomicMass} <span className="text-[10px] text-slate-400">u</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 uppercase">
            Block: <strong className="text-cyan-400">{element.block}</strong>
          </div>
        </div>
      </div>

      {/* 2. Subatomic Particle Counts (Protons, Neutrons, Electrons) */}
      <div className="grid grid-cols-3 gap-2 text-center font-mono">
        {/* Protons */}
        <div className="p-2.5 rounded-xl bg-slate-900/70 border border-rose-500/30">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Protons (Z)
          </div>
          <div className="text-lg font-black text-rose-400 mt-0.5">
            {element.number}
          </div>
          <div className="text-[9px] text-rose-300/80">Positive (+)</div>
        </div>

        {/* Neutrons */}
        <div className="p-2.5 rounded-xl bg-slate-900/70 border border-sky-500/30">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Neutrons (N)
          </div>
          <div className="text-lg font-black text-sky-400 mt-0.5">
            {selectedIsotope.neutrons}
          </div>
          <div className="text-[9px] text-sky-300/80">Neutral (0)</div>
        </div>

        {/* Electrons */}
        <div className="p-2.5 rounded-xl bg-slate-900/70 border border-cyan-500/30">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Electrons (e⁻)
          </div>
          <div className="text-lg font-black text-cyan-400 mt-0.5">
            {element.number}
          </div>
          <div className="text-[9px] text-cyan-300/80">Negative (-)</div>
        </div>
      </div>

      {/* 3. Isotope Selection & Nuclear Stability Section */}
      <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Isotope Selection</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Mass Number A = {selectedIsotope.massNumber}
          </span>
        </div>

        {/* Isotope Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {isotopes.map((iso) => {
            const isSelected = iso.massNumber === selectedIsotope.massNumber;
            return (
              <button
                key={iso.massNumber}
                type="button"
                onClick={() => onSelectIsotope(iso)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                {iso.symbol}
              </button>
            );
          })}
        </div>

        {/* Isotope Nuclear Diagnostics */}
        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs space-y-1.5 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Nuclear Stability:</span>
            {selectedIsotope.stability === 'Stable' ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Stable
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-400 font-bold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                Radioactive ({selectedIsotope.halfLife || 'Short'})
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Natural Abundance:</span>
            <span className="text-slate-200 font-semibold">{selectedIsotope.abundance}</span>
          </div>

          {selectedIsotope.decayMode && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Primary Decay Mode:</span>
              <span className="text-violet-300 font-semibold">{selectedIsotope.decayMode}</span>
            </div>
          )}

          {selectedIsotope.description && (
            <p className="text-[10px] text-slate-400 font-sans pt-1 border-t border-slate-800/80 leading-normal">
              {selectedIsotope.description}
            </p>
          )}
        </div>
      </div>

      {/* 4. Periodic Grid Location */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Period:</span>
          <span className="font-bold text-violet-400">{element.period}</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Group:</span>
          <span className="font-bold text-emerald-400">{element.group}</span>
        </div>
      </div>
    </div>
  );
};
