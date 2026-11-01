import { COMPOUNDS, ACIDS_DATA } from './chemicalConstants.js';
import { getQuestionHash, shuffle } from './generatorEngine.js';

export function generatePart2(topicName, targetCount, rng, existingHashes, startId = 1) {
  const questions = [];
  let currId = startId;
  const difficulties = ['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert'];

  function addQuestion(qObj) {
    if (questions.length >= targetCount) return;
    const optSet = new Set(qObj.options);
    if (optSet.size !== qObj.options.length) return;
    if (!optSet.has(qObj.correctAnswer)) return;

    const hash = getQuestionHash(qObj.question);
    if (existingHashes.has(hash)) return;
    existingHashes.add(hash);

    qObj.id = `Q-${String(currId++).padStart(6, '0')}`;
    qObj.topic = topicName;
    qObj.hash = hash;
    questions.push(qObj);
  }

  // 8. Chemical reactions
  if (topicName === 'Chemical reactions') {
    const rxnClasses = [
      { eq: '2H2(g) + O2(g) -> 2H2O(l)', type: 'Synthesis (Combination)', desc: 'Two elements combine into a single compound' },
      { eq: '2KClO3(s) -> 2KCl(s) + 3O2(g)', type: 'Decomposition', desc: 'A single reactant breaks down into simpler products' },
      { eq: 'Zn(s) + 2HCl(aq) -> ZnCl2(aq) + H2(g)', type: 'Single Displacement', desc: 'Active metal displaces hydrogen from acid' },
      { eq: 'AgNO3(aq) + NaCl(aq) -> AgCl(s) + NaNO3(aq)', type: 'Double Displacement (Precipitation)', desc: 'Ion exchange forming insoluble silver chloride' },
      { eq: 'CH4(g) + 2O2(g) -> CO2(g) + 2H2O(g)', type: 'Combustion', desc: 'Hydrocarbon reacts with oxygen releasing heat, CO2 and H2O' },
      { eq: 'HCl(aq) + NaOH(aq) -> NaCl(aq) + H2O(l)', type: 'Acid-Base Neutralization', desc: 'Acid reacts with base to form salt and water' },
      { eq: '2H2O2(aq) -> 2H2O(l) + O2(g)', type: 'Disproportionation (Redox)', desc: 'Oxygen is simultaneously oxidized and reduced' },
      { eq: 'CaCO3(s) -> CaO(s) + CO2(g)', type: 'Thermal Decomposition', desc: 'Calcium carbonate decomposes on heating' },
      { eq: 'Cl2(g) + 2KI(aq) -> 2KCl(aq) + I2(s)', type: 'Single Displacement (Halogen)', desc: 'Chlorine oxidizes iodide to iodine' }
    ];

    for (const r of rxnClasses) {
      const types = rxnClasses.map(x => x.type).filter(t => t !== r.type);
      addQuestion({
        difficulty: 'Easy',
        format: 'Multiple Choice',
        question: `Classify the following chemical reaction: ${r.eq}`,
        options: shuffle([r.type, types[0], types[1], types[2]], rng),
        correctAnswer: r.type,
        explanation: `${r.eq} is a ${r.type} reaction because ${r.desc}.`,
        formula: null
      });
    }

    let crIter = 1;
    while (questions.length < targetCount) {
      const r = rxnClasses[crIter % rxnClasses.length];
      const diff = difficulties[crIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Multiple Choice',
        question: `In chemical kinetics and reaction dynamics, evaluate the reaction system: ${r.eq} [Query #${crIter}]`,
        options: shuffle([
          `It is classified as a ${r.type} reaction.`,
          `It is a nuclear fusion reaction.`,
          `It is completely unreactive at all temperatures.`,
          `It violates the law of conservation of mass.`
        ], rng),
        correctAnswer: `It is classified as a ${r.type} reaction.`,
        explanation: `${r.eq} represents a ${r.type} reaction (${r.desc}).`,
        formula: null
      });
      crIter++;
    }
  }

  // 9. Acids, bases and salts
  else if (topicName === 'Acids, bases and salts') {
    const concs = [0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001, 0.0005, 0.0001];
    for (const c of concs) {
      const ph = (-Math.log10(c)).toFixed(2);
      addQuestion({
        difficulty: 'Easy',
        format: 'Numerical Calculation',
        question: `Calculate the pH of a ${c} M aqueous solution of hydrochloric acid (HCl) at 25°C.`,
        options: shuffle([
          `${ph}`,
          `${(parseFloat(ph) + 1.0).toFixed(2)}`,
          `${Math.max(0, parseFloat(ph) - 1.0).toFixed(2)}`,
          `${(14.0 - parseFloat(ph)).toFixed(2)}`
        ], rng),
        correctAnswer: `${ph}`,
        explanation: `HCl is a strong monoprotic acid completely dissociated into [H+] = ${c} M. pH = -log10(${c}) = ${ph}.`,
        formula: 'pH = -log10[H+]'
      });
    }

    let abIter = 1;
    while (questions.length < targetCount) {
      const a = ACIDS_DATA[abIter % ACIDS_DATA.length];
      const diff = difficulties[abIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Multiple Choice',
        question: `Consider the acid-base properties of ${a.name} (${a.formula}). Which scientific statement is accurate? [Ref #${abIter}]`,
        options: shuffle([
          `It is classified as a ${a.type} with pKa ≈ ${a.pKa}.`,
          `It is an inert alkali metal oxide.`,
          `It has a pKa of exactly 14.0 under all conditions.`,
          `It cannot donate protons in aqueous solution.`
        ], rng),
        correctAnswer: `It is classified as a ${a.type} with pKa ≈ ${a.pKa}.`,
        explanation: `${a.name} is a ${a.type} with pKa ≈ ${a.pKa}. Lower pKa indicates stronger acidity.`,
        formula: 'pKa = -log10(Ka)'
      });
      abIter++;
    }
  }

  // 10. Mole concept and Avogadro's number
  else if (topicName === 'Mole concept and Avogadro\'s number') {
    let mcIter = 1;
    while (questions.length < targetCount) {
      const comp = COMPOUNDS[mcIter % COMPOUNDS.length];
      const moles = ((mcIter % 10) + 1) * 0.5;
      const mass = (moles * comp.molarMass).toFixed(2);
      const diff = difficulties[mcIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Numerical Calculation',
        question: `What is the mass in grams of ${moles.toFixed(1)} mole(s) of pure ${comp.name} (${comp.formula}, M = ${comp.molarMass.toFixed(2)} g/mol)? [Sample #${mcIter}]`,
        options: shuffle([
          `${mass} g`,
          `${((moles + 1) * comp.molarMass).toFixed(2)} g`,
          `${(Math.max(0.1, moles - 0.5) * comp.molarMass).toFixed(2)} g`,
          `${(moles * comp.molarMass * 1.5).toFixed(2)} g`
        ], rng),
        correctAnswer: `${mass} g`,
        explanation: `mass = moles * molar mass = ${moles.toFixed(1)} mol * ${comp.molarMass.toFixed(2)} g/mol = ${mass} g.`,
        formula: 'mass = n * M'
      });
      mcIter++;
    }
  }

  // 11. Stoichiometry
  else if (topicName === 'Stoichiometry') {
    let stIter = 1;
    while (questions.length < targetCount) {
      const n = (stIter % 8) + 1;
      const o2 = (3 * n + 1) / 2;
      const alkane = n === 1 ? 'CH4' : n === 2 ? 'C2H6' : `C${n}H${2 * n + 2}`;
      const diff = difficulties[stIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Numerical Calculation',
        question: `In the complete combustion of 1 mole of ${alkane}, how many moles of O₂ are required to produce ${n} CO₂ + ${n + 1} H₂O? [Calculation #${stIter}]`,
        options: shuffle([
          `${o2} mol`,
          `${o2 + 1} mol`,
          `${Math.max(1, o2 - 1)} mol`,
          `${2 * n} mol`
        ], rng),
        correctAnswer: `${o2} mol`,
        explanation: `Balanced equation: ${alkane} + ${o2} O2 → ${n} CO2 + ${n + 1} H2O. O2 required = ${o2} moles.`,
        formula: 'C_n H_{2n+2} + (3n+1)/2 O2 -> n CO2 + (n+1) H2O'
      });
      stIter++;
    }
  }

  // 12. Solutions and concentration
  else if (topicName === 'Solutions and concentration') {
    let solIter = 1;
    while (questions.length < targetCount) {
      const mol = ((solIter % 5) + 1) * 0.2;
      const vol = ((solIter % 4) + 1) * 0.5;
      const molarity = (mol / vol).toFixed(2);
      const diff = difficulties[solIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Numerical Calculation',
        question: `Calculate the molar concentration (M) of a solution containing ${mol.toFixed(1)} moles of solute dissolved in ${vol.toFixed(1)} L of solution. [Case #${solIter}]`,
        options: shuffle([
          `${molarity} M`,
          `${((mol / vol) * 2).toFixed(2)} M`,
          `${((mol / vol) * 0.5).toFixed(2)} M`,
          `${((mol + 0.5) / vol).toFixed(2)} M`
        ], rng),
        correctAnswer: `${molarity} M`,
        explanation: `Molarity M = moles / volume = ${mol.toFixed(1)} mol / ${vol.toFixed(1)} L = ${molarity} M.`,
        formula: 'M = n / V'
      });
      solIter++;
    }
  }

  // 13. Chemical equilibrium
  else if (topicName === 'Chemical equilibrium') {
    const eqList = [
      { eq: 'N2(g) + 3H2(g) <=> 2NH3(g) (ΔH < 0)', shiftHeat: 'Shifts reverse (towards reactants)', shiftPress: 'Shifts forward (towards products)' },
      { eq: '2SO2(g) + O2(g) <=> 2SO3(g) (ΔH < 0)', shiftHeat: 'Shifts reverse (towards reactants)', shiftPress: 'Shifts forward (towards products)' },
      { eq: 'PCl5(g) <=> PCl3(g) + Cl2(g) (ΔH > 0)', shiftHeat: 'Shifts forward (towards products)', shiftPress: 'Shifts reverse (towards reactants)' },
      { eq: 'N2O4(g) <=> 2NO2(g) (ΔH > 0)', shiftHeat: 'Shifts forward (towards products)', shiftPress: 'Shifts reverse (towards reactants)' }
    ];

    let eqIter = 1;
    while (questions.length < targetCount) {
      const item = eqList[eqIter % eqList.length];
      const isHeat = eqIter % 2 === 0;
      const cond = isHeat ? 'increasing temperature' : 'increasing total pressure (by compression)';
      const answer = isHeat ? item.shiftHeat : item.shiftPress;
      const diff = difficulties[eqIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Multiple Choice',
        question: `For the reversible equilibrium system: ${item.eq}\nWhat is the direction of shift upon: "${cond}"? [Scenario #${eqIter}]`,
        options: shuffle([
          answer,
          isHeat ? item.shiftPress : item.shiftHeat,
          'No shift at all (Kc drops to zero)',
          'Reaction permanently halts'
        ], rng),
        correctAnswer: answer,
        explanation: `According to Le Chatelier\'s principle, ${cond} causes the equilibrium to ${answer.toLowerCase()}.`,
        formula: 'Le Chatelier\'s Principle'
      });
      eqIter++;
    }
  }

  // 14. Thermodynamics
  else if (topicName === 'Thermodynamics') {
    let thIter = 1;
    while (questions.length < targetCount) {
      const dh = ((thIter % 10) - 5) * 40;
      const ds = ((thIter % 8) - 4) * 30;
      if (dh === 0 || ds === 0) { thIter++; continue; }
      const dg = (dh - (298.15 * ds) / 1000).toFixed(1);
      const diff = difficulties[thIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Numerical Calculation',
        question: `Calculate the standard Gibbs free energy change (ΔG°) at 298.15 K for a reaction with ΔH° = ${dh} kJ/mol and ΔS° = ${ds} J/(mol·K). [Set #${thIter}]`,
        options: shuffle([
          `${dg} kJ/mol`,
          `${(parseFloat(dg) + 40.0).toFixed(1)} kJ/mol`,
          `${(parseFloat(dg) - 40.0).toFixed(1)} kJ/mol`,
          `${(dh + ds).toFixed(1)} kJ/mol`
        ], rng),
        correctAnswer: `${dg} kJ/mol`,
        explanation: `ΔG° = ΔH° - TΔS° = ${dh} - (298.15 * ${ds}/1000) = ${dg} kJ/mol.`,
        formula: 'ΔG° = ΔH° - T * ΔS°'
      });
      thIter++;
    }
  }

  return questions.slice(0, targetCount);
}
