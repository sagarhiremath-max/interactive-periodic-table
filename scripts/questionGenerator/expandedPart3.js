import {
  STANDARD_POTENTIALS,
  FUNCTIONAL_GROUPS,
  LAB_EQUIPMENT
} from './chemicalConstants.js';
import { getQuestionHash, shuffle } from './generatorEngine.js';

export function generatePart3(topicName, targetCount, rng, existingHashes, startId = 1) {
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

  // 15. Electrochemistry
  if (topicName === 'Electrochemistry') {
    let elIter = 1;
    while (questions.length < targetCount) {
      const idx1 = elIter % STANDARD_POTENTIALS.length;
      const idx2 = (elIter + 3) % STANDARD_POTENTIALS.length;
      const p1 = STANDARD_POTENTIALS[idx1];
      const p2 = STANDARD_POTENTIALS[idx2];
      const cat = p1.E0 > p2.E0 ? p1 : p2;
      const ano = p1.E0 > p2.E0 ? p2 : p1;
      const eCell = (cat.E0 - ano.E0).toFixed(2);
      const diff = difficulties[elIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Numerical Calculation',
        question: `Calculate standard cell potential (E°cell) where reduction occurs at ${cat.reduced}/${cat.oxidized} (E° = ${cat.E0.toFixed(2)} V) and oxidation at ${ano.reduced}/${ano.oxidized} (E° = ${ano.E0.toFixed(2)} V). [Cell #${elIter}]`,
        options: shuffle([
          `+${eCell} V`,
          `-${eCell} V`,
          `+${(cat.E0 + ano.E0).toFixed(2)} V`,
          `+${((cat.E0 - ano.E0) * 0.5).toFixed(2)} V`
        ], rng),
        correctAnswer: `+${eCell} V`,
        explanation: `E°cell = E°cathode - E°anode = ${cat.E0.toFixed(2)} - (${ano.E0.toFixed(2)}) = +${eCell} V.`,
        formula: 'E°cell = E°cathode - E°anode'
      });
      elIter++;
    }
  }

  // 16. Organic chemistry
  else if (topicName === 'Organic chemistry') {
    const orgHybs = [
      { name: 'Methane (CH4)', hyb: 'sp3', geom: 'Tetrahedral', angle: '109.5°' },
      { name: 'Ethene (C2H4)', hyb: 'sp2', geom: 'Trigonal planar', angle: '120°' },
      { name: 'Ethyne (C2H2)', hyb: 'sp', geom: 'Linear', angle: '180°' },
      { name: 'Benzene (C6H6)', hyb: 'sp2', geom: 'Planar hexagonal', angle: '120°' }
    ];

    let ocIter = 1;
    while (questions.length < targetCount) {
      const item = orgHybs[ocIter % orgHybs.length];
      const diff = difficulties[ocIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Multiple Choice',
        question: `In organic chemistry, what is the hybridization state and molecular geometry of carbon in ${item.name}? [Query #${ocIter}]`,
        options: shuffle([
          `${item.hyb} (${item.geom})`,
          'sp3d (Trigonal Bipyramidal)',
          'sp2 (Linear)',
          'sp3 (Square Planar)'
        ], rng),
        correctAnswer: `${item.hyb} (${item.geom})`,
        explanation: `Carbon in ${item.name} is ${item.hyb} hybridized with ${item.geom} geometry and ${item.angle} bond angles.`,
        formula: null
      });
      ocIter++;
    }
  }

  // 17. Hydrocarbons
  else if (topicName === 'Hydrocarbons') {
    let hcIter = 1;
    while (questions.length < targetCount) {
      const n = (hcIter % 10) + 1;
      const alkane = `C${n}H${2 * n + 2}`;
      const alkene = `C${n}H${2 * n}`;
      const alkyne = `C${n}H${2 * n - 2}`;
      const names = ['Methane', 'Ethane', 'Propane', 'Butane', 'Pentane', 'Hexane', 'Heptane', 'Octane', 'Nonane', 'Decane'];
      const name = names[n - 1];
      const diff = difficulties[hcIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Formula Identification',
        question: `What is the molecular formula of the saturated alkane ${name} containing ${n} carbon atom(s)? [Ref #${hcIter}]`,
        options: shuffle([
          alkane,
          alkene,
          alkyne,
          `C${n}H${2 * n + 4}`
        ], rng),
        correctAnswer: alkane,
        explanation: `Alkanes follow CnH2n+2. For n = ${n}, the formula is ${alkane}.`,
        formula: 'C_n H_{2n+2}'
      });
      hcIter++;
    }
  }

  // 18. Functional groups
  else if (topicName === 'Functional groups') {
    let fgIter = 1;
    while (questions.length < targetCount) {
      const fg = FUNCTIONAL_GROUPS[fgIter % FUNCTIONAL_GROUPS.length];
      const diff = difficulties[fgIter % difficulties.length];
      const otherNames = FUNCTIONAL_GROUPS.filter(f => f.name !== fg.name).map(f => f.name);
      addQuestion({
        difficulty: diff,
        format: 'Formula Identification',
        question: `Which organic functional group is defined by the structural formula ${fg.formula} (suffix: '${fg.suffix}')? [Sample #${fgIter}]`,
        options: shuffle([
          fg.name,
          otherNames[0],
          otherNames[1],
          otherNames[2]
        ], rng),
        correctAnswer: fg.name,
        explanation: `The structural formula ${fg.formula} represents the ${fg.name} functional group.`,
        formula: fg.formula
      });
      fgIter++;
    }
  }

  // 19. Isomerism
  else if (topicName === 'Isomerism') {
    const isomerList = [
      { c1: 'Ethanol', c2: 'Dimethyl ether', formula: 'C2H6O', type: 'Functional Group Isomers' },
      { c1: 'Propanal', c2: 'Acetone', formula: 'C3H6O', type: 'Functional Group Isomers' },
      { c1: '1-Propanol', c2: '2-Propanol', formula: 'C3H8O', type: 'Position Isomers' },
      { c1: 'n-Pentane', c2: 'Isopentane', formula: 'C5H12', type: 'Chain Isomers' },
      { c1: 'cis-2-Butene', c2: 'trans-2-Butene', formula: 'C4H8', type: 'Geometrical Isomers' }
    ];

    let isIter = 1;
    while (questions.length < targetCount) {
      const item = isomerList[isIter % isomerList.length];
      const diff = difficulties[isIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Multiple Choice',
        question: `What type of isomerism is demonstrated by the pair ${item.c1} and ${item.c2} (formula: ${item.formula})? [Query #${isIter}]`,
        options: shuffle([
          item.type,
          'Metameric conformers',
          'Tautomeric coordination isomers',
          'Enantiomeric ionization isomers'
        ], rng),
        correctAnswer: item.type,
        explanation: `${item.c1} and ${item.c2} are ${item.type}.`,
        formula: null
      });
      isIter++;
    }
  }

  // 20. Reaction mechanisms
  else if (topicName === 'Reaction mechanisms') {
    let rmIter = 1;
    while (questions.length < targetCount) {
      const isSN2 = rmIter % 2 === 0;
      const type = isSN2 ? 'SN2 (Substitution Nucleophilic Bimolecular)' : 'SN1 (Substitution Nucleophilic Unimolecular)';
      const answer = isSN2 ? 'Complete Walden inversion of configuration' : 'Racemization with slight excess of inversion';
      const diff = difficulties[rmIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Multiple Choice',
        question: `What is the characteristic stereochemical outcome of a pure ${type} reaction at an asymmetric carbon? [Mechanism #${rmIter}]`,
        options: shuffle([
          answer,
          '100% complete retention of original configuration',
          'Formation of an achiral meso compound only',
          'Complete isomerization to an alkene'
        ], rng),
        correctAnswer: answer,
        explanation: `In ${type}, the mechanism results in: ${answer}.`,
        formula: null
      });
      rmIter++;
    }
  }

  // 21. Laboratory equipment and safety
  else if (topicName === 'Laboratory equipment and safety') {
    let labIter = 1;
    while (questions.length < targetCount) {
      const eq = LAB_EQUIPMENT[labIter % LAB_EQUIPMENT.length];
      const diff = difficulties[labIter % difficulties.length];
      addQuestion({
        difficulty: diff,
        format: 'Multiple Choice',
        question: `In chemical laboratory operations, what is the primary calibrated function of a ${eq.item}? [Equipment #${labIter}]`,
        options: shuffle([
          eq.primaryUse,
          'Crushing solid rocks with magnetic field',
          'Rough approximate visual volume estimation (±25%)',
          'Long-term storage of molten alkali metals'
        ], rng),
        correctAnswer: eq.primaryUse,
        explanation: `A ${eq.item} is specifically utilized for: ${eq.primaryUse}.`,
        formula: null
      });
      labIter++;
    }
  }

  return questions.slice(0, targetCount);
}
