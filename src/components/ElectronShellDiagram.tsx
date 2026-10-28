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
  darkMode: _darkMode,
}) => {
  const valenceShellIndex = shells.length - 1;
  const valenceElectrons = shells[valenceShellIndex] || 0;

  // Derive subshell breakdown by principal quantum number n
  const getSubshellsForShell = (shellIdx: number): string[] => {
    const n = shellIdx + 1;
    const regex = new RegExp(`\\b${n}[spdf]\\d+`, 'g');
    const matches = electronConfiguration.match(regex);
    return matches || [];
  };

  return (
    <div className="w-full space-y-3 select-none font-mono">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-black dark:text-white">
          <Layers size={14} strokeWidth={2.5} />
          <span>SHELL CAPACITIES (n=1 to 7)</span>
        </div>
        <span className="text-[10px] font-black uppercase bg-black text-[#FFE600] px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
          Z={atomicNumber} ({symbol})
        </span>
      </div>

      <div className="space-y-2">
        {shells.map((count, idx) => {
          const shellName = SHELL_NAMES[idx] || `S${idx + 1}`;
          const maxCap = MAX_SHELL_CAPACITY[idx] || 32;
          const pct = Math.min(100, Math.round((count / maxCap) * 100));
          const isValence = idx === valenceShellIndex;
          const isFull = count === maxCap;
          const subshells = getSubshellsForShell(idx);

          return (
            <div
              key={idx}
              className={`p-2.5 border-2 border-black dark:border-white transition-all shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#FFF] ${
                isValence
                  ? 'bg-[#FFE600]/30 dark:bg-[#FFE600]/20'
                  : 'bg-white dark:bg-[#222]'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 border-2 border-black font-black text-xs flex items-center justify-center shadow-[1px_1px_0px_#000] ${
                      isValence
                        ? 'bg-[#FFE600] text-black'
                        : isFull
                        ? 'bg-[#00E599] text-black'
                        : 'bg-white dark:bg-black text-black dark:text-white'
                    }`}
                  >
                    {shellName}
                  </span>

                  <span className="font-black text-xs uppercase text-black dark:text-white">
                    SHELL n={idx + 1}
                  </span>

                  {isValence && (
                    <span className="text-[9px] uppercase font-black px-1.5 py-0.2 border border-black bg-[#FF007A] text-white flex items-center gap-1 shadow-[1px_1px_0px_#000]">
                      <Sparkles size={9} strokeWidth={2.5} /> VALENCE
                    </span>
                  )}

                  {isFull && !isValence && (
                    <span className="text-[9px] uppercase font-black px-1.5 py-0.2 border border-black bg-[#00E599] text-black flex items-center gap-1 shadow-[1px_1px_0px_#000]">
                      <ShieldCheck size={9} strokeWidth={2.5} /> FULL
                    </span>
                  )}
                </div>

                <div className="text-xs font-black">
                  <span>{count}</span>
                  <span className="text-neutral-500"> / {maxCap} e⁻</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 border-2 border-black bg-neutral-200 dark:bg-black p-0.5">
                <div
                  className="h-full bg-[#FFE600] border-r border-black transition-all duration-300"
                  style={{ width: `${Math.max(2, pct)}%` }}
                />
              </div>

              {/* Subshell list */}
              {subshells.length > 0 && (
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  <span className="text-[9px] uppercase font-black text-neutral-600 dark:text-neutral-400">SUBSHELLS:</span>
                  {subshells.map((sub, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-1.5 py-0.2 border border-black bg-neutral-100 dark:bg-black text-black dark:text-white font-bold text-[9px]"
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

      <div className="flex items-center justify-between text-xs pt-1 px-1 font-black uppercase">
        <span>TOTAL ELECTRONS: {atomicNumber} e⁻</span>
        <span>VALENCE ELECTRONS: <strong className="text-[#FF007A]">{valenceElectrons} e⁻</strong></span>
      </div>
    </div>
  );
};
