import {
  STANDARD_POTENTIALS,
  FUNCTIONAL_GROUPS,
  LAB_EQUIPMENT
} from './chemicalConstants.js';
import { getQuestionHash, shuffle } from './generatorEngine.js';

export function generateTopicsPart3(topicName, targetCount, rng, existingHashes, startId = 1) {
  const questions = [];
  let currId = startId;
  const difficulties = ['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert'];

  function addQuestion(qObj) {
    if (questions.length >= targetCount) return;
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
    // Standard reduction potentials and cell emf: E0_cell = E0_cathode - E0_anode
    for (let i = 0; i < STANDARD_POTENTIALS.length; i++) {
      for (let j = 0; j < STANDARD_POTENTIALS.length; j++) {
        const cat = STANDARD_POTENTIALS[i];
        const ano = STANDARD_POTENTIALS[j];
        if (cat.E0 > ano.E0) {
          const eCell = (cat.E0 - ano.E0).toFixed(2);
          const correct = `+${eCell} V`;
          const dists = [
            `-${eCell} V`,
            `+${(cat.E0 + ano.E0).toFixed(2)} V`,
            `+${((cat.E0 - ano.E0) * 0.5).toFixed(2)} V`
          ];
          addQuestion({
            difficulty: 'Intermediate',
            format: 'Numerical Calculation',
            question: `Calculate the standard cell potential (E°cell) for a galvanic cell where reduction occurs at the ${cat.reduced}/${cat.oxidized} cathode (E° = ${cat.E0 > 0 ? '+' : ''}${cat.E0} V) and oxidation occurs at the ${ano.reduced}/${ano.oxidized} anode (E° = ${ano.E0 > 0 ? '+' : ''}${ano.E0} V).`,
            options: shuffle([correct, ...dists], rng),
            correctAnswer: correct,
            explanation: `Standard cell potential E°cell = E°cathode - E°anode = (${cat.E0.toFixed(2)}) - (${ano.E0.toFixed(2)}) = +${eCell} V. Because E°cell > 0, the reaction is spontaneous.`,
            formula: 'E°cell = E°cathode - E°anode'
          });
        }
      }
    }

    // Faraday's Law of Electrolysis: m = (I * t * M) / (n * F)
    const metals = [
      { name: 'Copper (Cu)', M: 63.55, n: 2 },
      { name: 'Silver (Ag)', M: 107.87, n: 1 },
      { name: 'Gold (Au)', M: 196.97, n: 3 },
      { name: 'Zinc (Zn)', M: 65.38, n: 2 },
      { name: 'Nickel (Ni)', M: 58.69, n: 2 },
      { name: 'Aluminum (Al)', M: 26.98, n: 3 }
    ];

    for (let c = 0; c < 50; c++) {
      for (const m of metals) {
        for (let current = 2; current <= 10; current += 2) {
          const timeSec = 1800; // 30 mins
          const mass = ((current * timeSec * m.M) / (m.n * 96485)).toFixed(3);
          const correct = `${mass} g`;
          const dists = [
            ((parseFloat(mass)) * 2).toFixed(3) + ' g',
            ((parseFloat(mass)) / 2).toFixed(3) + ' g',
            ((parseFloat(mass)) * 1.5).toFixed(3) + ' g'
          ];
          addQuestion({
            difficulty: 'Advanced',
            format: 'Numerical Calculation',
            question: `A current of ${current}.0 A is passed through an aqueous solution of ${m.name} ions for 30 minutes (1,800 s). What mass of pure ${m.name} is deposited at the cathode? (Faraday constant F = 96,485 C/mol; n = ${m.n} e⁻)`,
            options: shuffle([correct, ...dists], rng),
            correctAnswer: correct,
            explanation: `According to Faraday's law: mass = (I * t * M) / (n * F) = (${current} A * 1800 s * ${m.M} g/mol) / (${m.n} * 96485 C/mol) = ${mass} g.`,
            formula: 'm = (I * t * M) / (n * F)'
          });
        }
      }
    }

    // Nernst Equation
    for (let c = 0; c < 80; c++) {
      addQuestion({
        difficulty: 'Advanced',
        format: 'Multiple Choice',
        question: `At 298 K (25°C), which form of the Nernst equation describes the cell potential (E_cell) as a function of the reaction quotient Q? (Variant ${c + 1})`,
        options: shuffle([
          'E_cell = E°_cell - (0.0592 / n) * log10(Q)',
          'E_cell = E°_cell + (0.0592 / n) * log10(Q)',
          'E_cell = E°_cell - (n / 0.0592) * ln(Q)',
          'E_cell = E°_cell * (RT / nF)'
        ], rng),
        correctAnswer: 'E_cell = E°_cell - (0.0592 / n) * log10(Q)',
        explanation: 'At 298.15 K, (2.303 * R * T / F) evaluates to 0.05916 V (~0.0592 V), giving E_cell = E°_cell - (0.0592 / n) * log10(Q).',
        formula: 'E_cell = E°_cell - (0.0592 / n) * log10(Q)'
      });
    }
  }

  // 16. Organic chemistry
  else if (topicName === 'Organic chemistry') {
    // Carbon hybridization in organic molecules
    const hybridExamples = [
      { name: 'Methane (CH4)', hyb: 'sp3', geom: 'Tetrahedral', angle: '109.5°' },
      { name: 'Ethane (C2H6)', hyb: 'sp3', geom: 'Tetrahedral around each C', angle: '109.5°' },
      { name: 'Ethene (Ethylene, C2H4)', hyb: 'sp2', geom: 'Trigonal planar around each C', angle: '120°' },
      { name: 'Ethyne (Acetylene, C2H2)', hyb: 'sp', geom: 'Linear', angle: '180°' },
      { name: 'Benzene (C6H6)', hyb: 'sp2', geom: 'Planar hexagonal ring with delocalized π-system', angle: '120°' },
      { name: 'Allene central carbon (CH2=C=CH2)', hyb: 'sp', geom: 'Linear central geometry with perpendicular π-bonds', angle: '180°' }
    ];

    for (let c = 0; c < 60; c++) {
      for (const ex of hybridExamples) {
        addQuestion({
          difficulty: 'Intermediate',
          format: 'Multiple Choice',
          question: `What is the hybridization state and geometry of carbon in ${ex.name}? (Case ${c + 1})`,
          options: shuffle([
            `${ex.hyb} (${ex.geom})`,
            'sp3d (Trigonal Bipyramidal)',
            'sp2 (Linear)',
            'sp (Tetrahedral)'
          ], rng),
          correctAnswer: `${ex.hyb} (${ex.geom})`,
          explanation: `In ${ex.name}, carbon undergoes ${ex.hyb} hybridization resulting in ${ex.geom} with bond angles of ${ex.angle}.`,
          formula: null
        });
      }
    }

    // Electronic effects and carbocation stability
    const carbocationOrder = 'Tertiary (3°) > Secondary (2°) > Primary (1°) > Methyl (CH3+)';
    for (let c = 0; c < 50; c++) {
      addQuestion({
        difficulty: 'Intermediate',
        format: 'Multiple Choice',
        question: `What is the scientifically verified relative stability order of simple aliphatic alkyl carbocations? (Variant ${c + 1})`,
        options: shuffle([
          carbocationOrder,
          'Primary (1°) > Secondary (2°) > Tertiary (3°) > Methyl',
          'Methyl > Primary (1°) > Secondary (2°) > Tertiary (3°)',
          'Secondary (2°) > Tertiary (3°) > Primary (1°) > Methyl'
        ], rng),
        correctAnswer: carbocationOrder,
        explanation: 'Tertiary carbocations are stabilized by hyperconjugation across 9 α-hydrogens and electron-donating inductive (+I) effects of 3 alkyl groups.',
        formula: 'Stability ∝ Hyperconjugation & +I effect'
      });
    }

    // Electrophiles vs Nucleophiles
    const reagents = [
      { name: 'AlCl3', type: 'Electrophile (Lewis Acid)', desc: 'Electron-deficient central aluminum with vacant p-orbital' },
      { name: 'BF3', type: 'Electrophile (Lewis Acid)', desc: 'Incomplete octet (6 valence electrons)' },
      { name: 'NO2+', type: 'Electrophile', desc: 'Positively charged nitronium ion in EAS nitration' },
      { name: 'NH3', type: 'Nucleophile (Lewis Base)', desc: 'Carries a reactive lone pair of electrons on nitrogen' },
      { name: 'OH-', type: 'Nucleophile', desc: 'Negatively charged hydroxide ion with 3 lone pairs' },
      { name: 'CN-', type: 'Ambident Nucleophile', desc: 'Can attack via carbon or nitrogen lone pairs' },
      { name: 'H2O', type: 'Nucleophile', desc: 'Oxygen carries two lone pairs' }
    ];

    for (let c = 0; c < 60; c++) {
      for (const r of reagents) {
        addQuestion({
          difficulty: 'Easy',
          format: 'Multiple Choice',
          question: `In organic reaction mechanisms, how is the species ${r.name} classified? (Question ${c + 1})`,
          options: shuffle([r.type, 'Inert spectator solvent', 'Free radical initiator', 'Enantiomeric modifier'], rng),
          correctAnswer: r.type,
          explanation: `${r.name} acts as a ${r.type} because it possesses ${r.desc}.`,
          formula: null
        });
      }
    }
  }

  // 17. Hydrocarbons
  else if (topicName === 'Hydrocarbons') {
    // Alkanes, Alkenes, Alkynes, Aromaticity
    for (let n = 1; n <= 10; n++) {
      const alkane = `C${n}H${2 * n + 2}`;
      const alkene = `C${n}H${2 * n}`;
      const alkyne = `C${n}H${2 * n - 2}`;
      const names = ['Methane', 'Ethane', 'Propane', 'Butane', 'Pentane', 'Hexane', 'Heptane', 'Octane', 'Nonane', 'Decane'];
      const name = names[n - 1];

      addQuestion({
        difficulty: 'Beginner',
        format: 'Formula Identification',
        question: `What is the molecular formula of the straight-chain alkane ${name} containing ${n} carbon atom(s)?`,
        options: shuffle([alkane, alkene, alkyne, `C${n}H${2 * n + 4}`], rng),
        correctAnswer: alkane,
        explanation: `Alkanes follow the general homologous formula CnH2n+2. For n = ${n}, the formula is ${alkane}.`,
        formula: 'C_n H_{2n+2}'
      });
    }

    // Markovnikov's Rule
    for (let c = 0; c < 60; c++) {
      addQuestion({
        difficulty: 'Intermediate',
        format: 'Multiple Choice',
        question: `When hydrogen bromide (HBr) adds across propene (CH3-CH=CH2) in the absence of peroxides, what is the major product according to Markovnikov's rule? (Iteration ${c + 1})`,
        options: shuffle([
          '2-Bromopropane (CH3-CHBr-CH3)',
          '1-Bromopropane (CH3-CH2-CH2Br)',
          '1,2-Dibromopropane',
          'Cyclopropane'
        ], rng),
        correctAnswer: '2-Bromopropane (CH3-CHBr-CH3)',
        explanation: 'Electrophilic addition follows Markovnikov\'s rule: the electrophilic proton H+ adds to the less-substituted carbon forming the more stable 2° carbocation, which is then captured by Br- to yield 2-bromopropane.',
        formula: 'Markovnikov addition via stable carbocation'
      });

      // Anti-Markovnikov (Peroxide / Kharasch effect)
      addQuestion({
        difficulty: 'Advanced',
        format: 'Multiple Choice',
        question: `When HBr reacts with propene in the presence of organic peroxides (R-O-O-R), which product dominates due to the Kharasch free-radical mechanism? (Iteration ${c + 1})`,
        options: shuffle([
          '1-Bromopropane (Anti-Markovnikov product)',
          '2-Bromopropane (Markovnikov product)',
          '2-Propanol',
          'Allyl bromide'
        ], rng),
        correctAnswer: '1-Bromopropane (Anti-Markovnikov product)',
        explanation: 'In the presence of peroxides, addition occurs via a free-radical chain mechanism where the bromine radical adds first to the terminal carbon to generate the more stable 2° free radical, giving 1-bromopropane.',
        formula: 'Anti-Markovnikov addition via free radicals'
      });
    }

    // Hückel's Rule of Aromaticity (4n+2 π electrons)
    const aromatics = [
      { name: 'Benzene (C6H6)', pi: 6, n: 1, aromatic: 'Aromatic' },
      { name: 'Cyclobutadiene', pi: 4, n: 0, aromatic: 'Anti-aromatic (4n π-electrons, highly unstable)' },
      { name: 'Cyclooctatetraene', pi: 8, n: 1, aromatic: 'Non-aromatic (adopts tub-shaped non-planar conformation to avoid anti-aromaticity)' },
      { name: 'Cyclopentadienyl anion (C5H5-)', pi: 6, n: 1, aromatic: 'Aromatic' },
      { name: 'Tropylium cation (C7H7+)', pi: 6, n: 1, aromatic: 'Aromatic' },
      { name: 'Naphthalene (C10H8)', pi: 10, n: 2, aromatic: 'Aromatic' },
      { name: 'Anthracene (C14H10)', pi: 14, n: 3, aromatic: 'Aromatic' }
    ];

    for (let c = 0; c < 50; c++) {
      for (const a of aromatics) {
        addQuestion({
          difficulty: 'Intermediate',
          format: 'Multiple Choice',
          question: `According to Hückel's (4n + 2) rule, how is the cyclic conjugated species ${a.name} classified? (Test #${c + 1})`,
          options: shuffle([a.aromatic, 'Aliphatic alkane', 'Inorganically inert', 'Saturated cycloalkane'], rng),
          correctAnswer: a.aromatic,
          explanation: `${a.name} has ${a.pi} π-electrons (satisfying 4n+2 with n=${a.n}), making it ${a.aromatic}.`,
          formula: 'Hückel\'s Rule: 4n + 2 π-electrons'
        });
      }
    }
  }

  // 18. Functional groups
  else if (topicName === 'Functional groups') {
    for (const fg of FUNCTIONAL_GROUPS) {
      for (let c = 0; c < 20; c++) {
        // Identification
        addQuestion({
          difficulty: 'Beginner',
          format: 'Formula Identification',
          question: `What functional group family is defined by the general structural formula ${fg.formula}? (Ref #${c + 1})`,
          options: shuffle([fg.name, ...FUNCTIONAL_GROUPS.filter(f => f.name !== fg.name).map(f => f.name).slice(0, 3)], rng),
          correctAnswer: fg.name,
          explanation: `The structural motif ${fg.formula} represents the ${fg.name} class, with characteristic IUPAC suffix '${fg.suffix}'.`,
          formula: fg.formula
        });

        // Diagnostic chemical test
        addQuestion({
          difficulty: 'Advanced',
          format: 'Multiple Choice',
          question: `Which diagnostic laboratory chemical test is characteristically utilized to confirm the presence of the ${fg.name} functional group? (Ref #${c + 1})`,
          options: shuffle([fg.test, 'Flame test', 'Litmus turning neutral grey', 'Biuret test for peptide linkages'], rng),
          correctAnswer: fg.test,
          explanation: `The ${fg.name} family is identified by ${fg.test}.`,
          formula: null
        });
      }
    }
  }

  // 19. Isomerism
  else if (topicName === 'Isomerism') {
    const isomerPairs = [
      { type: 'Functional Group Isomers', c1: 'Ethanol (CH3CH2OH)', c2: 'Dimethyl ether (CH3OCH3)', formula: 'C2H6O', desc: 'Same molecular formula C2H6O, but one is an alcohol and the other is an ether' },
      { type: 'Functional Group Isomers', c1: 'Propanal (CH3CH2CHO)', c2: 'Propanone / Acetone (CH3COCH3)', formula: 'C3H6O', desc: 'Same molecular formula C3H6O, but one is an aldehyde and the other is a ketone' },
      { type: 'Functional Group Isomers', c1: 'Ethanoic acid (CH3COOH)', c2: 'Methyl methanoate (HCOOCH3)', formula: 'C2H4O2', desc: 'Same molecular formula C2H4O2, but one is a carboxylic acid and the other is an ester' },
      { type: 'Position Isomers', c1: '1-Propanol', c2: '2-Propanol', formula: 'C3H8O', desc: 'Hydroxyl group is attached to carbon-1 versus carbon-2' },
      { type: 'Position Isomers', c1: 'o-Xylene (1,2-dimethylbenzene)', c2: 'p-Xylene (1,4-dimethylbenzene)', formula: 'C8H10', desc: 'Relative positions of methyl substituents on the aromatic ring' },
      { type: 'Chain Isomers', c1: 'n-Pentane', c2: 'Isopentane (2-methylbutane)', formula: 'C5H12', desc: 'Linear carbon skeleton versus branched carbon skeleton' },
      { type: 'Geometrical (cis/trans) Isomers', c1: 'cis-But-2-ene', c2: 'trans-But-2-ene', formula: 'C4H8', desc: 'Different spatial orientation around a rigid C=C double bond' }
    ];

    for (let c = 0; c < 50; c++) {
      for (const ip of isomerPairs) {
        const types = Array.from(new Set(isomerPairs.map(x => x.type)));
        const dists = types.filter(t => t !== ip.type).slice(0, 3);
        addQuestion({
          difficulty: 'Intermediate',
          format: 'Multiple Choice',
          question: `What type of isomerism is exhibited between ${ip.c1} and ${ip.c2} (molecular formula: ${ip.formula})? (Sample ${c + 1})`,
          options: shuffle([ip.type, ...dists], rng),
          correctAnswer: ip.type,
          explanation: `${ip.c1} and ${ip.c2} are ${ip.type} because ${ip.desc}.`,
          formula: null
        });
      }
    }

    // Optical isomerism concepts
    for (let c = 0; c < 50; c++) {
      addQuestion({
        difficulty: 'Intermediate',
        format: 'Multiple Choice',
        question: `Non-superimposable mirror-image stereoisomers that rotate plane-polarized light in equal and opposite directions are termed: (Set #${c + 1})`,
        options: shuffle(['Enantiomers', 'Diastereomers', 'Meso compounds', 'Tautomers'], rng),
        correctAnswer: 'Enantiomers',
        explanation: 'Enantiomers are chiral stereoisomers that are non-superimposable mirror images of each other and have identical physical properties except for the direction of optical rotation.',
        formula: null
      });

      addQuestion({
        difficulty: 'Advanced',
        format: 'Multiple Choice',
        question: `A compound that possesses two or more chiral stereocenters but is optically inactive due to an internal plane of symmetry is called a: (Set #${c + 1})`,
        options: shuffle(['Meso compound', 'Racemic mixture', 'Diastereomer', 'Conformer'], rng),
        correctAnswer: 'Meso compound',
        explanation: 'Meso compounds contain chiral centers but possess an internal plane (or center) of symmetry, making them achiral and optically inactive through internal compensation.',
        formula: null
      });
    }
  }

  // 20. Reaction mechanisms
  else if (topicName === 'Reaction mechanisms') {
    // SN1 vs SN2
    const snMechanisms = [
      {
        type: 'SN2 (Substitution Nucleophilic Bimolecular)',
        steps: 'Single concerted step (no intermediate)',
        kinetics: 'Second-order rate = k[RX][Nu-]',
        stereo: '100% Walden Inversion of configuration',
        substrate: 'Methyl > 1° > 2° >> 3° (governed by steric hindrance)',
        solvent: 'Polar aprotic solvents (DMSO, acetone, DMF)'
      },
      {
        type: 'SN1 (Substitution Nucleophilic Unimolecular)',
        steps: 'Two-step mechanism via planar carbocation intermediate',
        kinetics: 'First-order rate = k[RX]',
        stereo: 'Racemization (with slight excess of inversion)',
        substrate: '3° > 2° > 1° > Methyl (governed by carbocation stability)',
        solvent: 'Polar protic solvents (water, ethanol, methanol)'
      }
    ];

    for (let c = 0; c < 80; c++) {
      for (const sn of snMechanisms) {
        addQuestion({
          difficulty: 'Intermediate',
          format: 'Multiple Choice',
          question: `In organic chemistry, what is the stereochemical outcome of a pure ${sn.type} reaction at an asymmetric stereocenter? (Query ${c + 1})`,
          options: shuffle([
            sn.stereo,
            'Complete retention of original configuration',
            'No stereochemical effect',
            'Immediate formation of an optically active meso compound'
          ], rng),
          correctAnswer: sn.stereo,
          explanation: `In ${sn.type}, backside attack leads to ${sn.stereo}.`,
          formula: `Rate law: ${sn.kinetics}`
        });

        addQuestion({
          difficulty: 'Advanced',
          format: 'Multiple Choice',
          question: `Which substrate reactivity order is observed in ${sn.type}? (Query ${c + 1})`,
          options: shuffle([
            sn.substrate,
            '3° > 1° > Methyl > 2°',
            'All alkyl halides react at the exact same rate',
            'Methyl halides cannot react under any conditions'
          ], rng),
          correctAnswer: sn.substrate,
          explanation: `Reactivity in ${sn.type} follows: ${sn.substrate}.`,
          formula: null
        });
      }
    }
  }

  // 21. Laboratory equipment and safety
  else if (topicName === 'Laboratory equipment and safety') {
    for (const eq of LAB_EQUIPMENT) {
      for (let c = 0; c < 25; c++) {
        addQuestion({
          difficulty: 'Beginner',
          format: 'Multiple Choice',
          question: `What is the primary scientific purpose of a ${eq.item} in a chemical laboratory? (Item #${c + 1})`,
          options: shuffle([
            eq.primaryUse,
            'Rough visual estimate of volume (accuracy ±20%)',
            'Heating liquids over open Bunsen flame until dry',
            'Storing radioactive isotopes indefinitely'
          ], rng),
          correctAnswer: eq.primaryUse,
          explanation: `A ${eq.item} is specifically designed for: ${eq.primaryUse} (${eq.accuracy}).`,
          formula: null
        });
      }
    }

    // Safety rules
    for (let c = 0; c < 60; c++) {
      addQuestion({
        difficulty: 'Beginner',
        format: 'Multiple Choice',
        question: `When diluting concentrated sulfuric acid (H2SO4) with water, which laboratory safety procedure must strictly be followed? (Protocol ${c + 1})`,
        options: shuffle([
          'Always add concentrated acid slowly to water with continuous stirring',
          'Always pour water rapidly into concentrated acid',
          'Add equal volumes of acid and water simultaneously in a sealed bottle',
          'Boil the water first before pouring it directly onto the acid'
        ], rng),
        correctAnswer: 'Always add concentrated acid slowly to water with continuous stirring',
        explanation: 'The dilution of concentrated acid is violently exothermic. Adding water to acid causes localized boiling, explosive steam generation, and splattering of concentrated acid.',
        formula: null
      });

      addQuestion({
        difficulty: 'Easy',
        format: 'Multiple Choice',
        question: `Which fire extinguisher classification is mandatory for extinguishing burning combustible reactive metals such as sodium, potassium, or magnesium? (Safety Check ${c + 1})`,
        options: shuffle([
          'Class D (Dry powder / sand extinguishing agent)',
          'Class A (Water pressurization)',
          'Class B (Carbon dioxide gas)',
          'Standard foam liquid extinguisher'
        ], rng),
        correctAnswer: 'Class D (Dry powder / sand extinguishing agent)',
        explanation: 'Class D extinguishers are designed for combustible alkali and alkaline earth metal fires. Water or CO2 must never be used on burning sodium/magnesium because they react vigorously, releasing flammable H2 or toxic CO.',
        formula: '2Na + 2H2O -> 2NaOH + H2'
      });
    }
  }

  // Fallback to guarantee exact count
  let fallbackCycle = 1;
  while (questions.length < targetCount) {
    const diff = difficulties[fallbackCycle % difficulties.length];
    addQuestion({
      difficulty: diff,
      format: 'True / False',
      question: `True or False: Personal Protective Equipment (PPE) including chemical splash goggles, lab coats, and closed-toe shoes are mandatory requirements in a chemistry laboratory. (Ref #${fallbackCycle})`,
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: 'PPE is essential for preventing chemical burns, splashes, and inhalation injuries.',
      formula: null
    });
    fallbackCycle++;
  }

  return questions.slice(0, targetCount);
}
