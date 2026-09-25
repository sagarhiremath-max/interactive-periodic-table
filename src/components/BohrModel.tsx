import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';

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
  categoryColor = '#6366f1',
  size = 280,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);

  const center = size / 2;
  const maxRadius = size / 2 - 12;
  const shellCount = shells.length;
  const baseRadius = size < 220 ? 20 : 32;
  const radiusStep = shellCount > 0 ? (maxRadius - baseRadius) / Math.max(shellCount, 1) : 0;
  const nucleusRadius = size < 220 ? 15 : 20;
  const nucleusGlow = size < 220 ? 18 : 24;

  const shellLabels = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="overflow-visible"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Subtle background glow */}
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
            const radius = 34 + (shellIdx + 1) * radiusStep;
            const animationDuration = 8 + shellIdx * 4;
            const isClockwise = shellIdx % 2 === 0;

            // Generate angles for evenly spaced electrons
            const electronAngles = Array.from(
              { length: electronCount },
              (_, i) => (i * 360) / electronCount
            );

            return (
              <g key={shellIdx}>
                {/* Orbit ring */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="1.2"
                  className="transition-colors duration-300"
                />

                {/* Shell identifier label */}
                <text
                  x={center + radius - 4}
                  y={center - 3}
                  fill="rgba(255, 255, 255, 0.35)"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {shellLabels[shellIdx] || shellIdx + 1}
                </text>

                {/* Rotating group for electrons */}
                <g
                  style={{
                    transformOrigin: `${center}px ${center}px`,
                    animation: isPlaying
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
                          opacity="0.4"
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
              fill="rgba(24, 24, 27, 0.95)"
              stroke={categoryColor}
              strokeWidth="2"
            />
            <text
              x={center}
              y={center - 1}
              fill="#ffffff"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              className="select-none"
            >
              {symbol}
            </text>
            <text
              x={center}
              y={center + 12}
              fill="rgba(255, 255, 255, 0.7)"
              fontSize="8"
              fontFamily="monospace"
              textAnchor="middle"
              className="select-none"
            >
              Z={atomicNumber}
            </text>
          </g>
        </svg>

        {/* Play / Pause toggle */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Pause orbit animation' : 'Play orbit animation'}
          className="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-white/10"
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
        </button>
      </div>

      {/* Shell electrons breakdown */}
      <div className="mt-3 flex items-center gap-1.5 flex-wrap justify-center text-xs">
        <span className="text-slate-400 font-medium text-[11px] mr-1">Shells (e⁻):</span>
        {shells.map((count, idx) => (
          <span
            key={idx}
            className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px]"
            title={`Shell ${shellLabels[idx] || idx + 1}: ${count} electrons`}
          >
            <span className="text-slate-400 mr-0.5">{shellLabels[idx] || idx + 1}:</span>
            <strong className="text-white">{count}</strong>
          </span>
        ))}
      </div>
    </div>
  );
};
