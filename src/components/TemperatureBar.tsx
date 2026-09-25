import React, { useState, useEffect } from 'react';
import { Thermometer, Play, Pause, RotateCcw } from 'lucide-react';
import type { ElementData } from '../data/elements';
import { getStateAtTemperature } from '../utils/helpers';

interface TemperatureBarProps {
  temperatureKelvin: number;
  onTemperatureChange: React.Dispatch<React.SetStateAction<number>>;
  elements: ElementData[];
  darkMode: boolean;
}

export const TemperatureBar: React.FC<TemperatureBarProps> = ({
  temperatureKelvin,
  onTemperatureChange,
  elements,
  darkMode,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Calculate live phase distribution across all 118 elements
  const counts = elements.reduce(
    (acc, elem) => {
      const state = getStateAtTemperature(elem, temperatureKelvin);
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    },
    { solid: 0, liquid: 0, gas: 0, unknown: 0 } as Record<string, number>
  );

  // Auto animation of temperature
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      onTemperatureChange((prev) => {
        if (prev >= 5500) {
          return 0;
        }
        return prev + 50;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, onTemperatureChange]);

  const presets = [
    { label: '0 K (Abs Zero)', kelvin: 0 },
    { label: '273 K (0°C Ice)', kelvin: 273.15 },
    { label: '293 K (20°C Room)', kelvin: 293.15 },
    { label: '373 K (100°C Boil)', kelvin: 373.15 },
    { label: '1000 K', kelvin: 1000 },
    { label: '5778 K (Sun)', kelvin: 5778 },
  ];

  return (
    <div
      className={`rounded-2xl p-4 border transition-colors ${
        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Title, Current Temp, Play/Pause */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Thermometer size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Temperature Simulator
              </span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-slate-200 flex items-center gap-1 transition-colors"
              >
                {isPlaying ? <Pause size={10} /> : <Play size={10} />}
                <span>{isPlaying ? 'Pause sweep' : 'Sweep temp'}</span>
              </button>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black font-mono tracking-tight text-cyan-400">
                {Math.round(temperatureKelvin)} K
              </span>
              <span className="text-sm font-mono text-slate-400">
                ({Math.round(temperatureKelvin - 273.15)} °C / {Math.round((temperatureKelvin - 273.15) * 9 / 5 + 32)} °F)
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Slider Control */}
        <div className="flex-1 max-w-xl flex flex-col gap-1.5">
          <input
            type="range"
            min="0"
            max="6000"
            step="10"
            value={temperatureKelvin}
            onChange={(e) => onTemperatureChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          {/* Quick presets */}
          <div className="flex items-center justify-between text-[11px] gap-1 overflow-x-auto pb-1">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => onTemperatureChange(preset.kelvin)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors whitespace-nowrap ${
                  Math.abs(temperatureKelvin - preset.kelvin) < 20
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={() => onTemperatureChange(293.15)}
              title="Reset to 20°C Room Temp"
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>

        {/* Right: State of matter stats pills */}
        <div className="flex items-center gap-2 justify-end text-xs">
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-slate-300">Solids:</span>
            <strong className="text-white font-mono">{counts.solid}</strong>
          </div>

          <div className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span className="text-slate-300">Liquids:</span>
            <strong className="text-sky-300 font-mono">{counts.liquid}</strong>
          </div>

          <div className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="text-slate-300">Gases:</span>
            <strong className="text-rose-300 font-mono">{counts.gas}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
