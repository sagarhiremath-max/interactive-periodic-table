// Periodic Trends Data and Scientific Color Utilities
// Reliable IUPAC / Clementi / Slater empirical & covalent atomic radii (in picometers, pm)
// Missing or synthetic elements where radius has not been measured are strictly null.

export type TrendType = 'none' | 'atomicRadius' | 'electronegativity' | 'ionizationEnergy';

export interface TrendConfig {
  id: TrendType;
  name: string;
  shortName: string;
  unit: string;
  description: string;
  periodTrend: string;
  groupTrend: string;
  explanation: string;
  min: number;
  max: number;
}

// Empirical and covalent atomic radii in picometers (pm)
// Elements 104+ (rutherfordium and beyond) and certain unstable actinides have no experimental radius values; they are marked null.
export const ATOMIC_RADII_PM: Record<number, number | null> = {
  1: 53,   // H
  2: 31,   // He
  3: 167,  // Li
  4: 112,  // Be
  5: 87,   // B
  6: 67,   // C
  7: 56,   // N
  8: 48,   // O
  9: 42,   // F
  10: 38,  // Ne
  11: 190, // Na
  12: 145, // Mg
  13: 118, // Al
  14: 111, // Si
  15: 98,  // P
  16: 88,  // S
  17: 79,  // Cl
  18: 71,  // Ar
  19: 243, // K
  20: 194, // Ca
  21: 184, // Sc
  22: 176, // Ti
  23: 171, // V
  24: 166, // Cr
  25: 161, // Mn
  26: 156, // Fe
  27: 152, // Co
  28: 149, // Ni
  29: 145, // Cu
  30: 142, // Zn
  31: 136, // Ga
  32: 125, // Ge
  33: 114, // As
  34: 103, // Se
  35: 94,  // Br
  36: 88,  // Kr
  37: 265, // Rb
  38: 219, // Sr
  39: 212, // Y
  40: 206, // Zr
  41: 198, // Nb
  42: 190, // Mo
  43: 183, // Tc
  44: 178, // Ru
  45: 173, // Rh
  46: 169, // Pd
  47: 165, // Ag
  48: 161, // Cd
  49: 156, // In
  50: 145, // Sn
  51: 133, // Sb
  52: 123, // Te
  53: 115, // I
  54: 108, // Xe
  55: 298, // Cs
  56: 253, // Ba
  57: 226, // La
  58: 210, // Ce
  59: 247, // Pr
  60: 206, // Nd
  61: 205, // Pm
  62: 238, // Sm
  63: 231, // Eu
  64: 233, // Gd
  65: 225, // Tb
  66: 228, // Dy
  67: 226, // Ho
  68: 226, // Er
  69: 222, // Tm
  70: 222, // Yb
  71: 217, // Lu
  72: 208, // Hf
  73: 200, // Ta
  74: 193, // W
  75: 188, // Re
  76: 185, // Os
  77: 180, // Ir
  78: 177, // Pt
  79: 174, // Au
  80: 171, // Hg
  81: 156, // Tl
  82: 154, // Pb
  83: 143, // Bi
  84: 135, // Po
  85: 127, // At
  86: 120, // Rn
  87: null, // Fr (highly radioactive / unmeasured experimentally)
  88: 215, // Ra
  89: 195, // Ac
  90: 180, // Th
  91: 180, // Pa
  92: 175, // U
  93: 175, // Np
  94: 175, // Pu
  95: 175, // Am
  96: null, // Cm
  97: null, // Bk
  98: null, // Cf
  99: null, // Es
  100: null, // Fm
  101: null, // Md
  102: null, // No
  103: null, // Lr
  104: null, // Rf
  105: null, // Db
  106: null, // Sg
  107: null, // Bh
  108: null, // Hs
  109: null, // Mt
  110: null, // Ds
  111: null, // Rg
  112: null, // Cn
  113: null, // Nh
  114: null, // Fl
  115: null, // Mc
  116: null, // Lv
  117: null, // Ts
  118: null, // Og
};

export const TREND_CONFIGS: Record<Exclude<TrendType, 'none'>, TrendConfig> = {
  atomicRadius: {
    id: 'atomicRadius',
    name: 'Atomic Radius',
    shortName: 'Radius',
    unit: 'pm',
    description: 'Distance from the atomic nucleus to the outermost boundary of the electron cloud.',
    periodTrend: 'Decreases across a period (left to right)',
    groupTrend: 'Increases down a group (top to bottom)',
    explanation: 'Across a period, nuclear charge (Z) increases while electrons enter the same shell, pulling the cloud tighter (higher Z_eff). Down a group, each new period adds a principal electron shell (higher n) and inner-shell shielding, expanding the atomic size.',
    min: 31,
    max: 298,
  },
  electronegativity: {
    id: 'electronegativity',
    name: 'Electronegativity',
    shortName: 'Electronegativity',
    unit: 'Pauling scale',
    description: 'A chemical property describing the tendency of an atom to attract shared electron pairs in chemical bonds.',
    periodTrend: 'Increases across a period (left to right)',
    groupTrend: 'Decreases down a group (top to bottom)',
    explanation: 'Increases across periods as atoms become smaller and pull valence electrons more strongly. Decreases down groups due to increased atomic radius and shielding. Noble gases (He, Ne, Ar, etc.) generally lack Pauling electronegativities because they rarely form chemical bonds.',
    min: 0.79,
    max: 3.98,
  },
  ionizationEnergy: {
    id: 'ionizationEnergy',
    name: 'First Ionization Energy',
    shortName: 'Ionization Energy',
    unit: 'kJ/mol',
    description: 'The minimum energy required to remove the most loosely bound valence electron from an isolated gaseous atom.',
    periodTrend: 'Generally increases across a period (left to right)',
    groupTrend: 'Decreases down a group (top to bottom)',
    explanation: 'Valence electrons in smaller atoms experience stronger effective nuclear charge and are harder to remove. Down groups, valence electrons are further from the nucleus and shielded by core shells, lowering the energy required for ionization.',
    min: 375,
    max: 2372,
  },
};

/**
 * Maps a normalized ratio (0.0 to 1.0) to a scientific gradient color.
 * Uses a perceptually uniform cool-to-warm color spectrum:
 * Low: Deep Cyan / Blue (#0284c7)
 * Mid: Emerald / Teal (#0d9488)
 * Mid-High: Amber / Gold (#d97706)
 * High: Coral / Crimson (#e11d48)
 */
export function getTrendColor(ratio: number): string {
  const clamped = Math.max(0, Math.min(1, ratio));

  // Color stops
  // 0.0 -> [2, 132, 199] (Sky-600)
  // 0.33 -> [13, 148, 136] (Teal-600)
  // 0.66 -> [217, 119, 6] (Amber-600)
  // 1.0 -> [225, 29, 72] (Rose-600)

  let r: number, g: number, b: number;
  if (clamped < 0.33) {
    const t = clamped / 0.33;
    r = Math.round(2 + t * (13 - 2));
    g = Math.round(132 + t * (148 - 132));
    b = Math.round(199 + t * (136 - 199));
  } else if (clamped < 0.66) {
    const t = (clamped - 0.33) / 0.33;
    r = Math.round(13 + t * (217 - 13));
    g = Math.round(148 + t * (119 - 148));
    b = Math.round(136 + t * (6 - 136));
  } else {
    const t = (clamped - 0.66) / 0.34;
    r = Math.round(217 + t * (225 - 217));
    g = Math.round(119 + t * (29 - 119));
    b = Math.round(6 + t * (72 - 6));
  }

  return `rgb(${r}, ${g}, ${b})`;
}
