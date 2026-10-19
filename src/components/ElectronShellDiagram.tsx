import React from 'react';
import { Layers, ShieldCheck, Sparkles } from 'lucide-react';

interface ElectronShellDiagramProps {
  shells: number[];
  electronConfiguration: string;
  symbol: string;
  atomicNumber: number;
  darkMode: boolean;
}

const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
// Max theoretical capacity: 2 * n^2
const MAX_SHELL_CAPACITY = [2, 8, 18, 32, 50, 72, 98];

export const ElectronShellDiagram: React.FC<ElectronShellDiagramProps> = ({
  shells,
  electronConfiguration,
  symbol,
  atomicNumber,
  darkMode,
}) => {
  const valenceShellIndex = shells.length - 1;
  const valenceElectrons = shells[valenceShellIndex] || 0;

  // Derive subshell breakdown by principal quantum number n from the configuration string
  // e.g. "1s2 2s2 2p6 3s2 3p6 3d6 4s2"
  const getSubshellsForShell = (shellIdx: number): string[] => {
    const n = shellIdx + 1;
    const regex = new RegExp(`\\b${n}[spdf]\\d+`, 'g');
    const matches = electronConfiguration.match(regex);
    return matches || [];
  };

  return (
    <div className="w-full space-y-3 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Layers size={13} className="text-cyan-400" />
          <span>Electron Shell Capacities (n=1 to 7)</span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
          Z={atomicNumber} ({symbol})
        </span>
      </div>

      <div className="space-y-2">
        {shells.map((count, idx) => {
          const shellName = SHELL_NAMES[idx] || `Shell ${idx + 1}`;
          const maxCap = MAX_SHELL_CAPACITY[idx] || 32;
          const pct = Math.min(100, Math.round((count / maxCap) * 100));
          const isValence = idx === valenceShellIndex;
          const isFull = count === maxCap;
          const subshells = getSubshellsForShell(idx);

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border transition-all ${
                isValence
                  ? darkMode
                    ? 'bg-cyan-950/20 border-cyan-500/40 shadow-sm'
                    : 'bg-cyan-50/70 border-cyan-300'
                  : darkMode
                  ? 'bg-slate-800/40 border-slate-700/50'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-md font-mono font-bold text-[10px] flex items-center justify-center border ${
                      isValence
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : isFull
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-white/5 text-slate-300 border-white/10'
                    }`}
                  >
                    {shellName}
                  </span>

                  <span className="font-semibold text-[11px] text-slate-200">
                    Principal Shell n={idx + 1}
                  </span>

                  {isValence && (
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                      <Sparkles size={9} /> Valence
                    </span>
                  )}

                  {isFull && !isValence && (
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck size={9} /> Filled Core
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-mono">
                  <strong className={isValence ? 'text-cyan-400' : 'text-slate-200'}>
                    {count}
                  </strong>
                  <span className="text-slate-500"> / {maxCap} e⁻</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-950/60 overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isValence
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                      : isFull
                      ? 'bg-emerald-400'
                      : 'bg-indigo-400'
                  }`}
                  style={{ width: `${Math.max(4, pct)}%` }}
                />
              </div>

              {/* Subshell list */}
              {subshells.length > 0 && (
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  <span className="text-[9px] text-slate-400 mr-0.5">Subshells:</span>
                  {subshells.map((sub, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-1.5 py-0.2 rounded bg-black/30 border border-white/5 font-mono text-[9px] text-purple-300"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 px-1">
        <span>Total Electrons: <strong className="text-white">{atomicNumber} e⁻</strong></span>
        <span>Valence Electrons: <strong className="text-cyan-400">{valenceElectrons} e⁻</strong></span>
      </div>
    </div>
  );
};
