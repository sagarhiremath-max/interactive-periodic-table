import type { ElementData } from '../../data/elements';
import { ATOMIC_RADII_PM } from '../../data/trends';
import { THERMAL_CONDUCTIVITY } from '../../data/elementDetails';
import { formatTemp } from '../../utils/helpers';

export interface PropertyDefinition {
  id: string;
  name: string;
  category: 'General' | 'Atomic' | 'Physical' | 'Thermal' | 'Electronic';
  unit: string;
  description: string;
  isNumeric: boolean;
  getValue: (el: ElementData) => number | null;
  formatValue: (el: ElementData) => string;
}

export const ELEMENT_THEMES = [
  {
    slot: 1,
    name: 'Element 1',
    primary: '#06b6d4', // cyan-500
    border: 'border-cyan-500/40',
    borderActive: 'border-cyan-400',
    bgBadge: 'bg-cyan-500/15',
    textBadge: 'text-cyan-400',
    textGradient: 'from-cyan-400 to-teal-300',
    barGradient: 'from-cyan-500 to-teal-400',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.35)]',
    stroke: '#06b6d4',
    fill: 'rgba(6, 182, 212, 0.25)',
  },
  {
    slot: 2,
    name: 'Element 2',
    primary: '#8b5cf6', // violet-500
    border: 'border-violet-500/40',
    borderActive: 'border-violet-400',
    bgBadge: 'bg-violet-500/15',
    textBadge: 'text-violet-400',
    textGradient: 'from-violet-400 to-fuchsia-300',
    barGradient: 'from-violet-500 to-purple-400',
    glow: 'shadow-[0_0_15px_rgba(139,92,246,0.35)]',
    stroke: '#8b5cf6',
    fill: 'rgba(139, 92, 246, 0.25)',
  },
  {
    slot: 3,
    name: 'Element 3',
    primary: '#f59e0b', // amber-500
    border: 'border-amber-500/40',
    borderActive: 'border-amber-400',
    bgBadge: 'bg-amber-500/15',
    textBadge: 'text-amber-400',
    textGradient: 'from-amber-400 to-orange-300',
    barGradient: 'from-amber-500 to-orange-400',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.35)]',
    stroke: '#f59e0b',
    fill: 'rgba(245, 158, 11, 0.25)',
  },
];

export const COMPARISON_PROPERTIES: PropertyDefinition[] = [
  {
    id: 'atomic_weight',
    name: 'Atomic Weight',
    category: 'General',
    unit: 'u',
    description: 'The standard atomic weight, representing the weighted average mass of an element’s naturally occurring isotopes relative to Carbon-12.',
    isNumeric: true,
    getValue: (el) => el.atomicMassValue || null,
    formatValue: (el) => `${el.atomicMass} u`,
  },
  {
    id: 'atomic_radius',
    name: 'Atomic Radius',
    category: 'Atomic',
    unit: 'pm',
    description: 'The characteristic distance from the nucleus to the boundary of the surrounding electron cloud in picometers (empirical data).',
    isNumeric: true,
    getValue: (el) => ATOMIC_RADII_PM[el.number] ?? null,
    formatValue: (el) => {
      const r = ATOMIC_RADII_PM[el.number];
      return r ? `${r} pm` : 'N/A';
    },
  },
  {
    id: 'electronegativity',
    name: 'Electronegativity (Pauling)',
    category: 'Electronic',
    unit: 'Pauling',
    description: 'A dimensionless chemical measure of an atom’s intrinsic ability to attract bonding pairs of electrons towards itself.',
    isNumeric: true,
    getValue: (el) => el.electronegativity ?? null,
    formatValue: (el) => (el.electronegativity !== null && el.electronegativity !== undefined ? `${el.electronegativity}` : 'N/A'),
  },
  {
    id: 'ionization_energy',
    name: '1st Ionization Energy',
    category: 'Electronic',
    unit: 'kJ/mol',
    description: 'The minimal quantity of energy demanded to extract the most loosely bound valence electron from an isolated gaseous atom.',
    isNumeric: true,
    getValue: (el) => el.ionizationEnergy ?? null,
    formatValue: (el) => (el.ionizationEnergy ? `${el.ionizationEnergy} kJ/mol` : 'N/A'),
  },
  {
    id: 'density',
    name: 'Density (at STP)',
    category: 'Physical',
    unit: 'g/cm³',
    description: 'The spatial mass concentration per unit volume of the substance measured under standard laboratory temperature and pressure.',
    isNumeric: true,
    getValue: (el) => el.density ?? null,
    formatValue: (el) => (el.density ? `${el.density} g/cm³` : 'N/A'),
  },
  {
    id: 'melting_point',
    name: 'Melting Point',
    category: 'Thermal',
    unit: '°C',
    description: 'The precise temperature equilibrium point where an element transitions from solid to liquid phase under 1 atmosphere.',
    isNumeric: true,
    getValue: (el) => el.meltingPointKelvin ?? null,
    formatValue: (el) => formatTemp(el.meltingPointKelvin, 'C'),
  },
  {
    id: 'boiling_point',
    name: 'Boiling Point',
    category: 'Thermal',
    unit: '°C',
    description: 'The temperature at which an element’s vapor pressure equals surrounding atmospheric pressure, causing liquid vaporization.',
    isNumeric: true,
    getValue: (el) => el.boilingPointKelvin ?? null,
    formatValue: (el) => formatTemp(el.boilingPointKelvin, 'C'),
  },
  {
    id: 'thermal_conductivity',
    name: 'Thermal Conductivity',
    category: 'Thermal',
    unit: 'W/(m·K)',
    description: 'The rate of heat transfer through a unit thickness of material per unit temperature gradient.',
    isNumeric: true,
    getValue: (el) => THERMAL_CONDUCTIVITY[el.number] ?? null,
    formatValue: (el) => {
      const tc = THERMAL_CONDUCTIVITY[el.number];
      return tc !== undefined && tc !== null ? `${tc} W/(m·K)` : 'N/A';
    },
  },
  {
    id: 'valence_electrons',
    name: 'Valence Shell Electrons',
    category: 'Electronic',
    unit: 'electrons',
    description: 'Electrons inhabiting the outermost electronic shell that actively dictate valence bonding behaviors and chemical oxidation.',
    isNumeric: true,
    getValue: (el) => (el.shells && el.shells.length > 0 ? el.shells[el.shells.length - 1] : null),
    formatValue: (el) => (el.shells && el.shells.length > 0 ? `${el.shells[el.shells.length - 1]} valence e⁻` : 'N/A'),
  },
  {
    id: 'nuclear_subatomic',
    name: 'Subatomic Count (p⁺ / n⁰ / e⁻)',
    category: 'Atomic',
    unit: 'particles',
    description: 'The complete internal constituent composition: atomic protons (Z), estimated neutrons (A - Z), and neutral orbital electrons.',
    isNumeric: false,
    getValue: () => null,
    formatValue: (el) => `${el.number}p / ${Math.round(el.atomicMassValue) - el.number}n / ${el.number}e`,
  },
  {
    id: 'electron_config',
    name: 'Electron Configuration',
    category: 'Electronic',
    unit: '',
    description: 'The quantum arrangement of electrons occupying designated atomic orbitals governed by the Aufbau principle and Hund’s rules.',
    isNumeric: false,
    getValue: () => null,
    formatValue: (el) => el.electronConfigurationSemantic || el.electronConfiguration,
  },
  {
    id: 'shell_population',
    name: 'Quantum Shells (K · L · M...)',
    category: 'Electronic',
    unit: '',
    description: 'Discrete electron distribution grouped by principal quantum levels (n = 1, 2, 3...) radiating outward from the nucleus.',
    isNumeric: false,
    getValue: () => null,
    formatValue: (el) => (el.shells ? el.shells.join(' · ') : 'N/A'),
  },
  {
    id: 'standard_state',
    name: 'Standard Physical State',
    category: 'Physical',
    unit: '',
    description: 'The thermodynamic phase exhibited at STP (293.15 K, 101.325 kPa): solid, liquid, or gas.',
    isNumeric: false,
    getValue: () => null,
    formatValue: (el) => el.standardState.charAt(0).toUpperCase() + el.standardState.slice(1),
  },
  {
    id: 'orbital_block',
    name: 'Periodic Block',
    category: 'Atomic',
    unit: '',
    description: 'The specific subshell orbital (s, p, d, or f) where the last differentiating electron is accommodated.',
    isNumeric: false,
    getValue: () => null,
    formatValue: (el) => `${el.block.toUpperCase()}-block`,
  },
  {
    id: 'discoverer',
    name: 'Historical Discovery',
    category: 'General',
    unit: '',
    description: 'The historical attribution, pioneer scientist, or ancient recognition of the element’s isolated presence.',
    isNumeric: false,
    getValue: () => null,
    formatValue: (el) => el.discoveredBy || 'Prehistoric / Ancient',
  },
];

/**
 * Generates dynamic scientific comparison summary derived strictly from real data
 */
export function generateComparisonSummary(elements: ElementData[]): string[] {
  if (elements.length < 2) return [];

  const [e1, e2] = elements;
  const e3 = elements[2];
  const summaries: string[] = [];

  // 1. Mass comparison
  if (e1.atomicMassValue && e2.atomicMassValue) {
    const ratio = Math.max(e1.atomicMassValue, e2.atomicMassValue) / Math.min(e1.atomicMassValue, e2.atomicMassValue);
    const heavier = e1.atomicMassValue > e2.atomicMassValue ? e1 : e2;
    const lighter = e1.atomicMassValue > e2.atomicMassValue ? e2 : e1;
    const ratioFmt = ratio.toFixed(1);

    if (e3 && e3.atomicMassValue) {
      const allSorted = [...elements].sort((a, b) => b.atomicMassValue - a.atomicMassValue);
      summaries.push(
        `${allSorted[0].name} (${allSorted[0].symbol}) has the highest atomic mass at ${allSorted[0].atomicMass} u, followed by ${allSorted[1].name} (${allSorted[1].atomicMass} u) and ${allSorted[2].name} (${allSorted[2].atomicMass} u).`
      );
    } else {
      summaries.push(
        `${heavier.name} (${heavier.symbol}, ${heavier.atomicMass} u) is ${ratioFmt}× heavier than ${lighter.name} (${lighter.symbol}, ${lighter.atomicMass} u).`
      );
    }
  }

  // 2. Atomic Radius & Spatial Size
  const r1 = ATOMIC_RADII_PM[e1.number];
  const r2 = ATOMIC_RADII_PM[e2.number];
  if (r1 && r2) {
    if (r1 !== r2) {
      const larger = r1 > r2 ? e1 : e2;
      const smaller = r1 > r2 ? e2 : e1;
      const largerR = Math.max(r1, r2);
      const smallerR = Math.min(r1, r2);
      summaries.push(
        `${larger.name} exhibits a larger empirical atomic radius (${largerR} pm) than ${smaller.name} (${smallerR} pm), reflecting ${
          larger.period > smaller.period ? 'an added principal electron shell' : 'a reduced effective nuclear charge'
        }.`
      );
    } else {
      summaries.push(`${e1.name} and ${e2.name} share identical empirical atomic radii (${r1} pm).`);
    }
  }

  // 3. Electronegativity & Chemical Affinity
  if (e1.electronegativity !== null && e2.electronegativity !== null) {
    const diff = Math.abs(e1.electronegativity - e2.electronegativity).toFixed(2);
    const higherEN = e1.electronegativity > e2.electronegativity ? e1 : e2;
    const lowerEN = e1.electronegativity > e2.electronegativity ? e2 : e1;

    let bondNature = 'pure covalent bonding';
    if (Number(diff) >= 1.7) {
      bondNature = 'predominantly ionic character with significant polarization';
    } else if (Number(diff) > 0.4) {
      bondNature = 'polar covalent character with unequal electron sharing';
    }

    summaries.push(
      `${higherEN.name} has higher electronegativity (χ = ${higherEN.electronegativity}) than ${lowerEN.name} (χ = ${lowerEN.electronegativity}), yielding a Δχ of ${diff} which favors ${bondNature}.`
    );
  }

  // 4. State of Matter / Physical Phase
  const states = elements.map((e) => e.standardState);
  const uniqueStates = Array.from(new Set(states));
  if (uniqueStates.length === 1) {
    summaries.push(`All compared elements exist naturally as ${uniqueStates[0]}s at standard ambient temperature and pressure.`);
  } else {
    const stateDescriptions = elements.map((e) => `${e.name} is a ${e.standardState}`).join(', while ');
    summaries.push(`At standard room conditions, ${stateDescriptions}.`);
  }

  return summaries;
}

/**
 * Calculates high/low comparison insights across selected elements
 */
export function generateComparisonInsights(elements: ElementData[]) {
  if (elements.length < 2) return [];

  const insights: Array<{
    title: string;
    winner: ElementData;
    winnerSlot: number;
    value: string;
    context: string;
    accentColor: string;
  }> = [];

  // 1. Highest Atomic Mass
  const withMass = elements.filter((e) => e.atomicMassValue > 0);
  if (withMass.length >= 2) {
    const highest = withMass.reduce((prev, curr) => (curr.atomicMassValue > prev.atomicMassValue ? curr : prev));
    const idx = elements.findIndex((e) => e.number === highest.number);
    insights.push({
      title: 'Heaviest Nucleus',
      winner: highest,
      winnerSlot: idx + 1,
      value: `${highest.atomicMass} u`,
      context: `Possesses ${highest.number} protons and ~${Math.round(highest.atomicMassValue - highest.number)} neutrons.`,
      accentColor: ELEMENT_THEMES[idx]?.primary || '#06b6d4',
    });
  }

  // 2. Highest Electronegativity
  const withEN = elements.filter((e) => e.electronegativity !== null && e.electronegativity !== undefined);
  if (withEN.length >= 2) {
    const highestEN = withEN.reduce((prev, curr) => (curr.electronegativity! > prev.electronegativity! ? curr : prev));
    const idx = elements.findIndex((e) => e.number === highestEN.number);
    insights.push({
      title: 'Strongest Electron Pull',
      winner: highestEN,
      winnerSlot: idx + 1,
      value: `χ = ${highestEN.electronegativity}`,
      context: 'Demonstrates the highest tendency to attract bonding electron density.',
      accentColor: ELEMENT_THEMES[idx]?.primary || '#8b5cf6',
    });
  }

  // 3. Largest Atomic Radius
  const withRadius = elements
    .map((e) => ({ element: e, radius: ATOMIC_RADII_PM[e.number] }))
    .filter((x): x is { element: ElementData; radius: number } => typeof x.radius === 'number' && x.radius > 0);
  if (withRadius.length >= 2) {
    const largest = withRadius.reduce((prev, curr) => (curr.radius > prev.radius ? curr : prev));
    const idx = elements.findIndex((e) => e.number === largest.element.number);
    insights.push({
      title: 'Largest Atomic Radius',
      winner: largest.element,
      winnerSlot: idx + 1,
      value: `${largest.radius} pm`,
      context: `Encompasses a larger diffuse orbital cloud across period ${largest.element.period}.`,
      accentColor: ELEMENT_THEMES[idx]?.primary || '#f59e0b',
    });
  }

  // 4. Highest Density
  const withDensity = elements.filter((e) => typeof e.density === 'number' && e.density > 0);
  if (withDensity.length >= 2) {
    const densest = withDensity.reduce((prev, curr) => (curr.density! > prev.density! ? curr : prev));
    const idx = elements.findIndex((e) => e.number === densest.number);
    insights.push({
      title: 'Highest Density',
      winner: densest,
      winnerSlot: idx + 1,
      value: `${densest.density} g/cm³`,
      context: 'Has the greatest particle mass compactness per unit spatial volume at STP.',
      accentColor: ELEMENT_THEMES[idx]?.primary || '#10b981',
    });
  }

  // 5. Highest Melting Point
  const withMelting = elements.filter((e) => typeof e.meltingPointKelvin === 'number' && e.meltingPointKelvin > 0);
  if (withMelting.length >= 2) {
    const highestMelt = withMelting.reduce((prev, curr) => (curr.meltingPointKelvin! > prev.meltingPointKelvin! ? curr : prev));
    const idx = elements.findIndex((e) => e.number === highestMelt.number);
    insights.push({
      title: 'Highest Melting Point',
      winner: highestMelt,
      winnerSlot: idx + 1,
      value: formatTemp(highestMelt.meltingPointKelvin, 'C'),
      context: 'Withstands the highest thermal energy before crystalline lattice disruption.',
      accentColor: ELEMENT_THEMES[idx]?.primary || '#f43f5e',
    });
  }

  return insights;
}

/**
 * Export comparison dataset to CSV format
 */
export function exportComparisonToCSV(elements: ElementData[]): void {
  const headers = ['Property', ...elements.map((e) => `"${e.name} (${e.symbol})"`)];
  const rows = COMPARISON_PROPERTIES.map((prop) => {
    const values = elements.map((e) => `"${prop.formatValue(e).replace(/"/g, '""')}"`);
    return [`"${prop.name}"`, ...values].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const elementNames = elements.map((e) => e.symbol).join('_vs_');
  link.setAttribute('download', `element_comparison_${elementNames}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy formatted comparison summary to clipboard
 */
export async function copyComparisonToClipboard(elements: ElementData[]): Promise<boolean> {
  try {
    let text = `# Chemical Element Property Comparison Matrix\n`;
    text += `Comparison: ${elements.map((e) => `${e.name} (${e.symbol})`).join(' vs ')}\n\n`;
    text += `| Property | ${elements.map((e) => `${e.symbol} (#${e.number})`).join(' | ')} |\n`;
    text += `| :--- | ${elements.map(() => ':---').join(' | ')} |\n`;

    COMPARISON_PROPERTIES.forEach((prop) => {
      text += `| ${prop.name} | ${elements.map((e) => prop.formatValue(e)).join(' | ')} |\n`;
    });

    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
