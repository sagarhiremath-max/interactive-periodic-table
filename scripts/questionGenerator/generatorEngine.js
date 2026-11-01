// Generator Engine for 100,000 Verified Chemistry Questions
import crypto from 'node:crypto';
import { ELEMENTS_DATA } from './elementsData.js';
import {
  POLYATOMIC_IONS,
  COMPOUNDS,
  STANDARD_POTENTIALS,
  ACIDS_DATA,
  RADIOISOTOPES,
  FUNCTIONAL_GROUPS,
  LAB_EQUIPMENT
} from './chemicalConstants.js';

export const TOPICS = [
  'Periodic Table and element properties',
  'Atomic structure',
  'Protons, neutrons and electrons',
  'Electron configuration',
  'Chemical bonding',
  'Ionic and covalent compounds',
  'Chemical formulas and nomenclature',
  'Chemical reactions',
  'Acids, bases and salts',
  'Mole concept and Avogadro\'s number',
  'Stoichiometry',
  'Solutions and concentration',
  'Chemical equilibrium',
  'Thermodynamics',
  'Electrochemistry',
  'Organic chemistry',
  'Hydrocarbons',
  'Functional groups',
  'Isomerism',
  'Reaction mechanisms',
  'Laboratory equipment and safety',
  'Chemical calculations',
  'Periodic trends',
  'Isotopes and radioactivity',
  'Environmental chemistry',
  'Industrial chemistry',
  'Everyday chemistry',
  'Advanced chemistry problem-solving',
];

export const DIFFICULTIES = ['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert'];

export const FORMATS = [
  'Multiple Choice',
  'Multiple Select',
  'True / False',
  'Numerical Calculation',
  'Formula Identification',
  'Electron Configuration',
  'Assertion and Reasoning',
];

// Helper to hash question text for duplicate detection
export function getQuestionHash(text) {
  return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
}

// PRNG for deterministic, reproducible generation
export function createPRNG(seed = 123456789) {
  let s = seed >>> 0;
  return function next() {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function shuffle(array, rng) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
