import {
  RADIOISOTOPES,
  COMPOUNDS
} from './chemicalConstants.js';
import { ELEMENTS_DATA } from './elementsData.js';
import { getQuestionHash, shuffle } from './generatorEngine.js';

export function generatePart4(topicName, targetCount, rng, existingHashes, startId = 1) {
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

  // 22. Chemical calculations
  if (topicName === 'Chemical calculations') {
    let ccIter = 1;
    while (questions.length < targetCount) {
      const p = ((ccIter % 5) + 1) * 0.8;
      const v = ((ccIter % 6) + 1) * 4.0;
      const T = 298.15;
      const R = 0.08206;
      const moles = ((p * v) / (R * T)).toFixed(3);
      const diff = difficulties[ccIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Numerical Calculation',
        question: `Calculate the number of moles in an ideal gas sample occupying ${v.toFixed(1)} L at ${p.toFixed(2)} atm and 298.15 K (R = 0.08206 L·atm/(mol·K)). [Problem #${ccIter}]`,
        options: shuffle([
          `${moles} mol`,
          `${(parseFloat(moles) * 2).toFixed(3)} mol`,
          `${(parseFloat(moles) * 0.5).toFixed(3)} mol`,
          `${(parseFloat(moles) + 1.0).toFixed(3)} mol`
        ], rng),
        correctAnswer: `${moles} mol`,
        explanation: `n = (P * V) / (R * T) = (${p.toFixed(2)} * ${v.toFixed(1)}) / (0.08206 * 298.15) = ${moles} mol.`,
        formula: 'P * V = n * R * T'
      });
      ccIter++;
    }
  }

  // 23. Periodic trends
  else if (topicName === 'Periodic trends') {
    const trendRules = [
      { rule: 'Atomic radius decreases from left to right across a period', reason: 'Increasing effective nuclear charge (Z_eff) pulls valence electrons closer to the nucleus' },
      { rule: 'Atomic radius increases down any group in the periodic table', reason: 'Each successive period adds an entirely new principal quantum shell of core electrons' },
      { rule: 'First ionization energy generally increases across a period', reason: 'Smaller atomic radius and higher effective nuclear charge bind valence electrons more tightly' },
      { rule: 'Electronegativity generally decreases down a group', reason: 'Increased atomic radius and shielding reduce the attraction between the nucleus and bonding electrons' }
    ];

    let ptIter = 1;
    while (questions.length < targetCount) {
      const item = trendRules[ptIter % trendRules.length];
      const diff = difficulties[ptIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Multiple Choice',
        question: `In the study of periodic trends, what is the underlying physical reason for: "${item.rule}"? [Trend Review #${ptIter}]`,
        options: shuffle([
          item.reason,
          'Electrons lose negative charge at high temperatures',
          'Neutrons decay directly into photons in heavier elements',
          'Nuclear mass decreases across periods'
        ], rng),
        correctAnswer: item.reason,
        explanation: `${item.rule} because ${item.reason}.`,
        formula: 'Z_eff = Z - S'
      });
      ptIter++;
    }
  }

  // 24. Isotopes and radioactivity
  else if (topicName === 'Isotopes and radioactivity') {
    let irIter = 1;
    while (questions.length < targetCount) {
      const iso = RADIOISOTOPES[irIter % RADIOISOTOPES.length];
      const diff = difficulties[irIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Multiple Choice',
        question: `For the radioactive nuclide ${iso.isotope} (half-life: ${iso.halfLife}), what is its primary decay mode and scientific application? [Isotope Study #${irIter}]`,
        options: shuffle([
          `${iso.mode} decay (${iso.application})`,
          'Spontaneous cluster emission (inert rocket propellant)',
          'Stable non-radioactive isotope (no decay observed)',
          'Pure positron capture with infinite lifetime'
        ], rng),
        correctAnswer: `${iso.mode} decay (${iso.application})`,
        explanation: `${iso.isotope} decays via ${iso.mode} with a half-life of ${iso.halfLife}. Primary use: ${iso.application}.`,
        formula: 'N(t) = N0 * (1/2)^(t / t_1/2)'
      });
      irIter++;
    }
  }

  // 25. Environmental chemistry
  else if (topicName === 'Environmental chemistry') {
    const envTopics = [
      { name: 'Ozone Depletion', desc: 'Catalyzed in the stratosphere by chlorine free radicals (Cl•) released from chlorofluorocarbons (CFCs)' },
      { name: 'Photochemical Smog', desc: 'Formed from NOx and volatile organic compounds (VOCs) under solar UV irradiation producing ozone and PAN' },
      { name: 'Acid Rain', desc: 'Precipitation with pH < 5.6 caused by atmospheric sulfur dioxide (SO2) and nitrogen oxides (NOx)' },
      { name: 'Eutrophication', desc: 'Dense algal blooms and severe hypoxia triggered by agricultural runoff containing phosphates and nitrates' }
    ];

    let ecIter = 1;
    while (questions.length < targetCount) {
      const item = envTopics[ecIter % envTopics.length];
      const diff = difficulties[ecIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Multiple Choice',
        question: `In atmospheric and environmental chemistry, which chemical mechanism accounts for ${item.name}? [Environmental Case #${ecIter}]`,
        options: shuffle([
          item.desc,
          'Condensation of atmospheric helium at room temperature',
          'Rapid thermal fusion of nitrogen in clouds',
          'Dissolution of quartz crystal sand in fog'
        ], rng),
        correctAnswer: item.desc,
        explanation: `${item.name} is chemically described as: ${item.desc}.`,
        formula: null
      });
      ecIter++;
    }
  }

  // 26. Industrial chemistry
  else if (topicName === 'Industrial chemistry') {
    const industrialProcesses = [
      { name: 'Haber-Bosch Process', prod: 'Ammonia (NH3)', cond: '450°C, 200 atm, Iron (Fe) catalyst with K2O/Al2O3 promoters' },
      { name: 'Contact Process', prod: 'Sulfuric Acid (H2SO4)', cond: '450°C, 1-2 atm, Vanadium pentoxide (V2O5) catalyst' },
      { name: 'Ostwald Process', prod: 'Nitric Acid (HNO3)', cond: '850°C over Platinum-Rhodium (Pt-Rh) catalytic gauze' },
      { name: 'Chloralkali Process', prod: 'Chlorine (Cl2), H2, and NaOH', cond: 'Electrolysis of saturated aqueous brine (NaCl)' },
      { name: 'Hall-Héroult Process', prod: 'Aluminum metal (Al)', cond: 'Electrolytic reduction of Al2O3 in molten cryolite (Na3AlF6) at 950°C' }
    ];

    let indIter = 1;
    while (questions.length < targetCount) {
      const item = industrialProcesses[indIter % industrialProcesses.length];
      const diff = difficulties[indIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Multiple Choice',
        question: `What primary chemical commodity and operational conditions characterize the industrial ${item.name}? [Industrial Process #${indIter}]`,
        options: shuffle([
          `${item.prod} (${item.cond})`,
          'Pure titanium extracted via boiling water extraction',
          'Direct combustion of coal to produce diamond',
          'Nuclear transmutation of lead to gold'
        ], rng),
        correctAnswer: `${item.prod} (${item.cond})`,
        explanation: `The ${item.name} synthesizes ${item.prod} under conditions: ${item.cond}.`,
        formula: null
      });
      indIter++;
    }
  }

  // 27. Everyday chemistry
  else if (topicName === 'Everyday chemistry') {
    const everydayItems = [
      { common: 'Baking Soda', formula: 'Sodium Bicarbonate (NaHCO3)', role: 'Liberates CO2 gas upon reaction with acids' },
      { common: 'Household Bleach', formula: 'Sodium Hypochlorite (NaClO, ~5%)', role: 'Strong oxidizing disinfectant' },
      { common: 'Vinegar', formula: 'Acetic Acid (CH3COOH, ~5%)', role: 'Condiment and acidic preservative' },
      { common: 'Milk of Magnesia', formula: 'Magnesium Hydroxide (Mg(OH)2)', role: 'Antacid suspension neutralizing stomach acid' },
      { common: 'Washing Soda', formula: 'Sodium Carbonate (Na2CO3)', role: 'Water softening by precipitating Ca2+ ions' },
      { common: 'Plaster of Paris', formula: 'Calcium Sulfate Hemihydrate (CaSO4·0.5H2O)', role: 'Hydrates and sets into rigid gypsum' }
    ];

    let edIter = 1;
    while (questions.length < targetCount) {
      const item = everydayItems[edIter % everydayItems.length];
      const diff = difficulties[edIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Formula Identification',
        question: `What is the chemical identity and primary household role of "${item.common}"? [Daily Chemistry #${edIter}]`,
        options: shuffle([
          `${item.formula} (${item.role})`,
          'Potassium cyanide (flavor enhancer)',
          'Concentrated sulfuric acid (beverage sweetener)',
          'Anhydrous phosphorus pentoxide (mouthwash)'
        ], rng),
        correctAnswer: `${item.formula} (${item.role})`,
        explanation: `${item.common} is chemically ${item.formula}, acting as a ${item.role}.`,
        formula: null
      });
      edIter++;
    }
  }

  // 28. Advanced chemistry problem-solving
  else if (topicName === 'Advanced chemistry problem-solving') {
    const kineticsModels = [
      { order: 'Zero-order', rate: 'Rate = k', halfLife: 't_1/2 = [A]0 / (2k)', linearPlot: '[A] vs time is linear' },
      { order: 'First-order', rate: 'Rate = k[A]', halfLife: 't_1/2 = ln(2)/k ≈ 0.693/k', linearPlot: 'ln[A] vs time is linear' },
      { order: 'Second-order', rate: 'Rate = k[A]²', halfLife: 't_1/2 = 1 / (k[A]0)', linearPlot: '1/[A] vs time is linear' }
    ];

    let advIter = 1;
    while (questions.length < targetCount) {
      const item = kineticsModels[advIter % kineticsModels.length];
      const diff = difficulties[advIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Multiple Choice',
        question: `In chemical reaction kinetics, what is the rate law, half-life formula, and diagnostic linear plot for a ${item.order} reaction? [Advanced Problem #${advIter}]`,
        options: shuffle([
          `${item.rate}, ${item.halfLife}, ${item.linearPlot}`,
          'Rate = k / [A], t_1/2 = 0, ln[A] vs time is parabolic',
          'Rate = k * t, t_1/2 = infinite, [A]² vs time is linear',
          'Rate = 0, t_1/2 = k, no plot can be constructed'
        ], rng),
        correctAnswer: `${item.rate}, ${item.halfLife}, ${item.linearPlot}`,
        explanation: `For a ${item.order} reaction: ${item.rate}, half-life ${item.halfLife}, and ${item.linearPlot}.`,
        formula: item.rate
      });
      advIter++;
    }
  }

  return questions.slice(0, targetCount);
}
