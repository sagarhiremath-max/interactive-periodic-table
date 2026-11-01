import React from 'react';
import { Layers, Disc } from 'lucide-react';
import { type ElementData } from '../../data/elements';

const SHELL_LABELS = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
// Theoretical 2n^2 maximum capacities
const THEORETICAL_MAX = [2, 8, 18, 32, 50, 72, 98];

interface ShellExplorerPanelProps {
  element: ElementData;
  activeShellIndex: number | null;
  onSelectShell: (idx: number | null) => void;
}

export const ShellExplorerPanel: React.FC<ShellExplorerPanelProps> = ({
  element,
  activeShellIndex,
  onSelectShell,
}) => {
  const shells = element.shells || [];
  const totalElectrons = shells.reduce((acc, count) => acc + count, 0);
  const valenceElectrons = shells.length > 0 ? shells[shells.length - 1] : 0;

  return (
    <div className="w-full space-y-3.5 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Electron Shells (Bohr Model)
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          {shells.length} {shells.length === 1 ? 'Shell' : 'Shells'} Active
        </span>
      </div>

      {/* Electron Configuration Box */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 font-mono">
            Ground-State Configuration
          </span>
          <span className="text-cyan-400 font-mono font-medium">
            Valence: {valenceElectrons} e⁻
          </span>
        </div>
        <div className="font-mono text-xs sm:text-sm font-bold text-cyan-300 bg-slate-950/80 p-2 rounded-lg border border-cyan-500/20 break-all select-all shadow-inner">
          {element.electronConfiguration}
        </div>
      </div>

      {/* Interactive Shell List */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
          <span>SHELL / PRINCIPAL (n)</span>
          <span>ELECTRONS / CAPACITY (2n²)</span>
        </div>

        {shells.map((count, idx) => {
          const letter = SHELL_LABELS[idx] || `S${idx + 1}`;
          const n = idx + 1;
          const maxCapacity = THEORETICAL_MAX[idx] || 2 * n * n;
          const percentage = Math.min(100, Math.round((count / maxCapacity) * 100));
          const isSelected = activeShellIndex === idx;
          const isValence = idx === shells.length - 1;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectShell(isSelected ? null : idx)}
              className={`w-full p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer group ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/50'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {/* Shell Letter Avatar */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs transition-colors ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                        : isValence
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {letter}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                        Shell {letter}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        (n = {n})
                      </span>
                      {isValence && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          Valence
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className={`font-bold ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                    {count}
                  </span>
                  <span className="text-slate-500 text-[10px]"> / {maxCapacity} e⁻</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800/80">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-400 to-teal-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                      : isValence
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-400'
                      : 'bg-gradient-to-r from-slate-600 to-cyan-600'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-slate-500">
                <span>{percentage}% full</span>
                <span className="group-hover:text-cyan-400 transition-colors">
                  {isSelected ? '● Highlighted in 3D' : 'Click to highlight in 3D'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Disc className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px]">Total Bound Electrons:</span>
        </div>
        <span className="font-mono font-bold text-cyan-300">{totalElectrons} e⁻</span>
      </div>
    </div>
  );
};
