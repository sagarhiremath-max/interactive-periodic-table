import type { ElementData } from '../data/elements';

export function kelvinToCelsius(k: number | null): number | null {
  if (k === null || k === undefined) return null;
  return Math.round((k - 273.15) * 10) / 10;
}

export function kelvinToFahrenheit(k: number | null): number | null {
  if (k === null || k === undefined) return null;
  return Math.round(((k - 273.15) * 9 / 5 + 32) * 10) / 10;
}

export function formatTemp(k: number | null, unit: 'C' | 'K' | 'F' = 'C'): string {
  if (k === null || k === undefined) return 'Unknown';
  if (unit === 'K') return `${k} K`;
  if (unit === 'F') return `${kelvinToFahrenheit(k)} °F`;
  return `${kelvinToCelsius(k)} °C`;
}

export function getStateAtTemperature(element: ElementData, tempK: number): 'solid' | 'liquid' | 'gas' | 'unknown' {
  if (element.number >= 104 && !element.meltingPointKelvin && !element.boilingPointKelvin) {
    return 'unknown';
  }

  const melt = element.meltingPointKelvin;
  const boil = element.boilingPointKelvin;

  if (melt !== null && boil !== null) {
    if (tempK < melt) return 'solid';
    if (tempK >= melt && tempK < boil) return 'liquid';
    return 'gas';
  } else if (melt !== null) {
    return tempK < melt ? 'solid' : 'liquid';
  } else if (boil !== null) {
    return tempK >= boil ? 'gas' : 'liquid';
  }

  // Fallback to standardState
  if (element.standardState === 'synthetic') return 'unknown';
  return element.standardState;
}

export function getStateColor(state: 'solid' | 'liquid' | 'gas' | 'unknown'): string {
  switch (state) {
    case 'solid':
      return '#94a3b8'; // slate
    case 'liquid':
      return '#38bdf8'; // sky blue
    case 'gas':
      return '#f43f5e'; // rose/crimson
    case 'unknown':
    default:
      return '#a855f7'; // purple
  }
}
