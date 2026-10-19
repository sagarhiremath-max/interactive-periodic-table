import React, { useState, useEffect } from 'react';
import { Play, Pause, EyeOff } from 'lucide-react';

interface BohrModelProps {
  shells: number[];
  symbol: string;
  atomicNumber: number;
  categoryColor?: string;
  size?: number;
}

export const BohrModel: React.FC<BohrModelProps> = ({
  shells,
  symbol,
  atomicNumber,
  categoryColor = '#06b6d4',
  size = 280,
}) => {
  // Check user system preference for reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(!prefersReducedMotion);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) setIsPlaying(false);
    };

    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  const center = size / 2;
  const maxRadius = size / 2 - 14;
  const shellCount = shells.length;
  const baseRadius = size < 220 ? 18 : 28;
  const radiusStep = shellCount > 0 ? (maxRadius - baseRadius) / Math.max(shellCount, 1) : 0;
  const nucleusRadius = size < 220 ? 14 : 18;
  const nucleusGlow = size < 220 ? 18 : 22;

  const shellLabels = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
  const totalElectrons = shells.reduce((sum, n) => sum + n, 0);
  const valenceElectrons = shells.length > 0 ? shells[shells.length - 1] : 0;

  return (
    <div className="flex flex-col items-center select-none">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`Bohr atomic model for ${symbol} with ${totalElectrons} electrons distributed in ${shells.length} shells: ${shells.map((count, i) => `${shellLabels[i] || i + 1}:${count}`).join(', ')}`}
      >
        <svg
          width={size}
          height={size}
          className="overflow-visible"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Subtle outer reference boundary */}
          <circle
            cx={center}
            cy={center}
            r={maxRadius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="4 4"
          />

          {/* Electron shells */}
          {shells.map((electronCount, shellIdx) => {
            const radius = baseRadius + (shellIdx + 1) * radiusStep;
            const animationDuration = 10 + shellIdx * 5;
            const isClockwise = shellIdx % 2 === 0;

            // Generate angles for evenly spaced electrons on this shell
            const electronAngles = Array.from(
              { length: electronCount },
              (_, i) => (i * 360) / Math.max(electronCount, 1)
            );

            return (
              <g key={shellIdx}>
                {/* Orbit ring */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.16)"
                  strokeWidth="1.2"
                />

                {/* Shell identifier label (K, L, M, N...) */}
                <text
                  x={center + radius - 4}
                  y={center - 3}
                  fill="rgba(255, 255, 255, 0.4)"
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {shellLabels[shellIdx] || shellIdx + 1}
                </text>

                {/* Rotating group for electrons */}
                <g
                  style={{
                    transformOrigin: `${center}px ${center}px`,
                    animation:
                      isPlaying && !prefersReducedMotion
                        ? `spin-${isClockwise ? 'slow' : 'reverse'} ${animationDuration}s linear infinite`
                        : 'none',
                  }}
                >
                  {electronAngles.map((angleDeg, elIdx) => {
                    const angleRad = (angleDeg * Math.PI) / 180;
                    const ex = center + radius * Math.cos(angleRad);
                    const ey = center + radius * Math.sin(angleRad);

                    return (
                      <g key={elIdx}>
                        {/* Electron glow */}
                        <circle
                          cx={ex}
                          cy={ey}
                          r="4"
                          fill={categoryColor}
                          opacity="0.35"
                        />
                        {/* Electron core */}
                        <circle
                          cx={ex}
                          cy={ey}
                          r="2.5"
                          fill="#ffffff"
                          stroke={categoryColor}
                          strokeWidth="1"
                        />
                      </g>
                    );
                  })}
                </g>
              </g>
            );
          })}

          {/* Central Nucleus */}
          <g>
            <circle
              cx={center}
              cy={center}
              r={nucleusGlow}
              fill={categoryColor}
              opacity="0.25"
            />
            <circle
              cx={center}
              cy={center}
              r={nucleusRadius}
              fill="rgba(15, 23, 42, 0.95)"
              stroke={categoryColor}
              strokeWidth="2"
            />
            <text
              x={center}
              y={center - 2}
              fill="#ffffff"
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {symbol}
            </text>
            <text
              x={center}
              y={center + 10}
              fill="rgba(255, 255, 255, 0.75)"
              fontSize="7.5"
              fontFamily="monospace"
              textAnchor="middle"
            >
              Z={atomicNumber}
            </text>
          </g>
        </svg>

        {/* Play / Pause toggle & Reduced Motion status */}
        <div className="absolute bottom-1 right-1 flex items-center gap-1.5">
          {prefersReducedMotion && (
            <span
              className="text-[10px] flex items-center gap-1 text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-white/10"
              title="System prefers reduced motion"
            >
              <EyeOff size={10} /> Reduced Motion
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause orbit animation' : 'Play orbit animation'}
            aria-label={isPlaying ? 'Pause orbit animation' : 'Play orbit animation'}
            className="p-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-white/10 shadow-sm"
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>
        </div>
      </div>

      {/* Shell electrons breakdown */}
      <div className="mt-3 w-full flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5 flex-wrap justify-center text-xs">
          <span className="text-slate-400 font-semibold text-[11px] mr-1">Shells (e⁻):</span>
          {shells.map((count, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px] flex items-center gap-1"
              title={`Shell ${shellLabels[idx] || idx + 1}: ${count} electrons`}
            >
              <span className="text-slate-400">{shellLabels[idx] || idx + 1}:</span>
              <strong className="text-cyan-300">{count}</strong>
            </span>
          ))}
        </div>

        {/* Summary stats: Total & Valence electrons */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
          <span>
            Total: <strong className="text-white">{totalElectrons} e⁻</strong>
          </span>
          <span>•</span>
          <span>
            Valence: <strong className="text-cyan-400">{valenceElectrons} e⁻</strong>
          </span>
          <span>•</span>
          <span>
            Shells: <strong className="text-white">{shellCount}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
