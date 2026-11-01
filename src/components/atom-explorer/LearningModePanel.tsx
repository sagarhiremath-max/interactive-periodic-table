import React, { useState } from 'react';
import { BookOpen, Sparkles, AlertCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { type ElementData } from '../../data/elements';
import { type IsotopeData } from '../../data/isotopes';

interface LearningModePanelProps {
  element: ElementData;
  isotope: IsotopeData;
}

export const LearningModePanel: React.FC<LearningModePanelProps> = ({
  element,
  isotope,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Generate educational insights based on element properties
  const valenceCount = element.shells && element.shells.length > 0
    ? element.shells[element.shells.length - 1]
    : 0;

  let bondingBehavior = '';
  if (element.group === 18) {
    bondingBehavior = `${element.name} has a full outer valence shell (${valenceCount} electrons), making it an inert noble gas that rarely forms chemical bonds under standard conditions.`;
  } else if (element.group === 1) {
    bondingBehavior = `${element.name} possesses a single valence electron ($ns^1$), which it readily loses to form a +1 cation, rendering it exceptionally reactive.`;
  } else if (element.group === 17) {
    bondingBehavior = `${element.name} has 7 valence electrons ($ns^2 np^5$) and eagerly gains 1 electron to complete its stable octet, forming a -1 halide anion.`;
  } else if (element.block === 'd') {
    bondingBehavior = `As a transition metal in the d-block, ${element.name} can exhibit multiple oxidation states by utilizing electrons from both its outermost s-subshell and inner d-subshell.`;
  } else {
    bondingBehavior = `${element.name} has ${valenceCount} valence electron(s) in its outermost shell, which govern its covalent and ionic bonding characteristics.`;
  }

  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-slate-900/90 border border-cyan-500/20 shadow-xl overflow-hidden font-sans">
      {/* Header bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 sm:px-6 py-3 bg-slate-900/80 hover:bg-slate-900 border-b border-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Educational Atomic Lab & Quantum Insights</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-medium">
                Student Learning Mode
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Understanding {element.name} ({element.symbol}) at the subatomic level
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 hover:text-white text-xs">
          <span className="hidden sm:inline text-[11px]">{isExpanded ? 'Hide' : 'Show'} Guide</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Card 1: Subatomic Composition */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1. Nuclear Architecture</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11.5px]">
                The nucleus of <strong className="text-white">{element.name}-{isotope.massNumber}</strong> contains{' '}
                <strong className="text-cyan-300">{element.number} protons</strong> bound with{' '}
                <strong className="text-purple-300">{isotope.neutrons} neutrons</strong> by the strong nuclear force, counteracting electromagnetic proton repulsion.
              </p>
              <div className="text-[10.5px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                Isotope Stability: <span className={isotope.stability === 'Stable' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>{isotope.stability === 'Stable' ? 'Stable Ground State' : `Radioactive (${isotope.halfLife || 'Radioactive'})`}</span>
              </div>
            </div>

            {/* Card 2: Valence & Bonding */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-mono font-bold text-xs uppercase">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>2. Valence & Reactivity</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11.5px]">
                {bondingBehavior}
              </p>
              <div className="text-[10.5px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                Electronegativity: <span className="text-white font-bold">{element.electronegativity ?? 'N/A'}</span> (Pauling)
              </div>
            </div>

            {/* Card 3: Real-World Applications */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase">
                <BookOpen className="w-3.5 h-3.5" />
                <span>3. Discovery & Real World</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11.5px]">
                Discovered by <strong className="text-white">{element.discoveredBy || 'Ancient civilizations'}</strong>. Category:{' '}
                <span className="text-amber-300 font-semibold">{element.categoryName}</span>. Standard state at room temperature:{' '}
                <span className="text-white font-semibold capitalize">{element.standardState}</span>.
              </p>
              <div className="text-[10.5px] font-mono text-slate-400 pt-1 border-t border-slate-800/80 truncate">
                Common Uses: <span className="text-slate-300">{element.commonUses?.slice(0, 3).join(', ') || 'Scientific & industrial applications'}</span>
              </div>
            </div>
          </div>

          {/* Educational Bohr vs Quantum Disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white text-[11px] uppercase font-mono tracking-wider">
                Pedagogical Clarification: Bohr Model vs Quantum Mechanics
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                This interactive 3D explorer utilizes the <strong className="text-white">Bohr-Sommerfeld orbital model</strong> to clearly teach discrete principal energy levels ($n$), subshell capacities ($2n^2$), and valence configurations. In rigorous quantum mechanics, electrons do not revolve in static circular tracks; they exist as 3D spatial wavefunctions $\Psi(r, \theta, \phi)$ where the square magnitude $|\Psi|^2$ represents electron probability density clouds. Switch to <strong className="text-purple-300">"Quantum Shapes"</strong> mode above to examine the nodal lobes of $s, p, d, f$ atomic orbitals.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
