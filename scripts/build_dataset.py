import urllib.request
import json
import os

url = 'https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    raw_data = json.loads(resp.read().decode('utf-8'))

raw_elements = [e for e in raw_data['elements'] if e['number'] <= 118]

# Common uses enrichment dictionary for elements
COMMON_USES = {
    1: ["Rocket propellant", "Ammonia synthesis (Haber process)", "Fuel cells", "Petroleum refining"],
    2: ["Cooling superconducting MRI magnets", "Deep-sea diving breathing gas", "Party & weather balloons", "Leak detection"],
    3: ["Rechargeable lithium-ion batteries", "Mood-stabilizing pharmaceuticals", "Heat-resistant glass and ceramics", "Aerospace alloys"],
    4: ["Aerospace structural materials", "X-ray tube windows", "Beryllium copper non-sparking tools", "Satellite mirrors"],
    5: ["Borosilicate glassware (Pyrex)", "Fiberglass insulation", "Semiconductor dopant", "Laundry detergents (borax)"],
    6: ["Organic chemistry backbone", "Steel manufacturing (coke)", "Graphite lubricants & electrodes", "Carbon-fiber composites"],
    7: ["Fertilizers (ammonia, nitrates)", "Cryogenic liquid nitrogen", "Food packaging inert gas", "Explosives manufacturing"],
    8: ["Medical oxygen therapy", "Steel manufacturing combustion", "Rocket oxidizer (liquid O2)", "Water purification (ozone)"],
    9: ["Toothpaste & municipal water fluoridation", "Teflon non-stick coatings (PTFE)", "Refrigerants", "Uranium hexafluoride enrichment"],
    10: ["Neon illuminated advertising signs", "High-voltage indicators", "Cryogenic refrigerant", "Helium-neon gas lasers"],
    11: ["Table salt (NaCl)", "Baking soda (NaHCO3)", "Sodium-vapor street lamps", "Chemical manufacturing & soaps"],
    12: ["Lightweight automotive & aerospace alloys", "Fireworks and flares (white light)", "Antacids (Milk of Magnesia)", "Chlorophyll core atom"],
    13: ["Beverage cans & food foil", "Aircraft & automotive fuselages", "Window frames & construction", "High-voltage transmission cables"],
    14: ["Semiconductors & microchips", "Solar photovoltaic cells", "Silicone sealants and lubricants", "Glass, brick, and cement"],
    15: ["Agricultural fertilizers", "Safety matches", "Detergents and water softeners", "LEDs and semiconductor lasers"],
    16: ["Sulfuric acid industrial production", "Rubber vulcanization", "Gunpowder", "Fungicides and skin treatments"],
    17: ["Water disinfection & pool sanitation", "PVC plastic production", "Bleaching agents", "Household disinfectant cleaners"],
    18: ["Inert shielding gas for TIG welding", "Double-pane insulated window fill", "Incandescent & fluorescent bulb fill", "Titanium production"],
    19: ["Potash agricultural fertilizers", "Soap manufacturing", "Potassium hydroxide batteries", "Gunpowder (saltpeter)"],
    20: ["Cement, plaster, and mortar", "Steel refining deoxidizer", "Dietary calcium supplements", "Cheese making & food additive"],
    21: ["High-intensity stadium lighting", "Aerospace aluminum-scandium alloys", "Baseball bats and bicycle frames", "Solid oxide fuel cells"],
    22: ["Aircraft and spacecraft hulls", "Medical and dental implants", "Titanium dioxide white pigment", "Corrosion-resistant marine parts"],
    23: ["High-strength vanadium steel alloys", "Jet engines and aerospace parts", "Vanadium redox flow batteries", "Chemical catalysts"],
    24: ["Stainless steel production", "Electroplating for shine & rust resistance", "Pigments (chrome yellow & green)", "Leather tanning"],
    25: ["Steel alloying (increases strength)", "Alkaline and dry cell batteries", "Aluminum can alloys", "Essential plant micronutrient"],
    26: ["Construction steel and rebar", "Cast iron machinery and cookware", "Automotive engine blocks", "Hemoglobin in human blood"],
    27: ["Lithium-ion battery cathodes (NMC/LCO)", "Jet engine superalloys", "Cobalt blue glass and pigments", "Cancer radiotherapy (Co-60)"],
    28: ["Stainless steel manufacturing", "Rechargeable NiMH & Li-ion batteries", "Electroplating corrosion barriers", "Coins and armor plating"],
    29: ["Electrical wiring and circuitry", "Plumbing pipes and brass fixtures", "Printed circuit boards (PCBs)", "Architectural roofing"],
    30: ["Galvanizing steel against corrosion", "Die-cast automobile components", "Brass and bronze alloys", "Sunscreen (zinc oxide)"],
    31: ["Gallium arsenide (GaAs) for LEDs & smartphones", "Blu-ray laser diodes", "High-temperature thermometers", "Flexible solar cells"],
    32: ["Fiber-optic telecommunications", "Infrared night-vision optics", "Polymerization catalysts (PET plastic)", "Wide-angle camera lenses"],
    33: ["Semiconductor doping (gallium arsenide)", "Lead-acid battery grid strengthening", "Historical wood preservatives", "Promising leukemia drug"],
    34: ["Solar cells and photocells", "Glass decolorizing and red coloring", "Photocopier photoreceptor drums", "Anti-dandruff shampoos"],
    35: ["Flame retardants for plastics & electronics", "Water treatment biocide", "Sedative pharmaceutical synthesis", "Photography silver bromide"],
    36: ["High-speed photography strobe flash", "Laser eye surgery (excimer laser)", "Fluorescent light bulb filling", "Airport runway lights"],
    37: ["Atomic clocks (rubidium frequency standard)", "Specialized GPS satellite clocks", "Vacuum tube getters", "Photocell vapor sensors"],
    38: ["Red fireworks and emergency flares", "Phosphorescent glow-in-the-dark paint", "Strontium-90 radioisotope batteries", "Toothpaste for sensitive teeth"],
    39: ["Yttrium-iron garnet (YIG) microwave filters", "White LED phosphor coating", "Superconductors (YBCO)", "Spark plug electrodes"],
    40: ["Nuclear reactor fuel cladding (Zircaloy)", "Synthetic diamond cubic zirconia", "Corrosion-proof chemical pumps", "Ceramic knives"],
    41: ["Superconducting MRI magnet wire (Nb-Ti)", "High-strength low-alloy structural steel", "Particle accelerator cavities", "Rocket engine nozzles"],
    42: ["High-temperature alloy steels", "Industrial lubricants (MoS2)", "Petroleum hydrotreating catalysts", "Filament supports"],
    43: ["Diagnostic nuclear medicine (Tc-99m scans)", "Radiotracer for heart, bone & brain imaging", "Corrosion inhibition research", "Beta calibration standards"],
    44: ["Hard disk drive read heads", "Wear-resistant electrical contacts", "Solar cell organometallic dyes", "Chlorine generation anodes"],
    45: ["Automotive catalytic converters", "High-end jewelry plating", "Electrical contact alloys", "Nitric acid manufacturing catalysts"],
    46: ["Automotive emission catalytic converters", "Multilayer ceramic capacitors (MLCC)", "Hydrogen purification filters", "White gold jewelry"],
    47: ["High-conductivity electrical contacts", "Solar panel photovoltaic paste", "Jewelry, silverware, and bullion", "Antimicrobial wound dressings"],
    48: ["Nickel-cadmium (NiCd) rechargeable batteries", "Corrosion-resistant steel plating", "Nuclear control rod neutron absorbers", "Cadmium telluride thin-film solar"],
    49: ["Indium tin oxide (ITO) touchscreens & LCDs", "Low-melting point fusible alloys", "Thermal interface paste", "Cryogenic seals"],
    50: ["Soldering electronics components", "Tin plating for food cans (tinplate)", "Bronze and pewter casting", "Float glass production bath"],
    51: ["Flame retardant synergist (Sb2O3)", "Lead-acid battery grid hardener", "Infrared optical detectors", "Type metal alloy printing"],
    52: ["Cadmium telluride (CdTe) solar panels", "Thermoelectric cooling modules (Bi2Te3)", "Rewritable optical discs (DVD/Blu-ray)", "Machinable steel additive"],
    53: ["Antiseptic disinfectant (Betadine)", "Dietary thyroid health (iodized salt)", "X-ray medical contrast agents", "Polarizing film for LCD screens"],
    54: ["Automotive xenon HID headlamps", "Ion propulsion thrusters for spacecraft", "Medical general anesthesia", "IMAX and cinema projector lamps"],
    55: ["Atomic frequency clocks (definitive SI second)", "Oil well drilling completion fluids", "Vacuum tube oxygen getters", "Magnetometers"],
    56: ["Barium sulfate medical gastrointestinal imaging", "Drilling mud for oil and gas wells", "Green fireworks & emergency flares", "Spark plug electrodes"],
    57: ["Hybrid & EV battery electrodes (NiMH)", "Camera and telescope optical lenses", "Petroleum fluid catalytic cracking", "Carbon arc studio lighting"],
    58: ["Automotive catalytic converters", "Glass polishing powders (cerium oxide)", "Self-cleaning oven catalysts", "Ferrocerium lighter flints"],
    59: ["Ultra-strong neodymium permanent magnets", "Didymium glass for welder goggles", "Yellow-green ceramics coloring", "Carbon arc searchlights"],
    60: ["Permanent neodymium magnets (Nd2Fe14B)", "Computer hard drives & EV traction motors", "Headphones and loudspeaker drivers", "High-power industrial lasers"],
    61: ["Luminous paint for watch dials", "Atomic miniature beta batteries", "Thickness measurement gauges", "Spacecraft radioisotope heaters"],
    62: ["Samarium-cobalt (SmCo) high-temp magnets", "Cancer pain palliative medicine (Sm-153)", "Optical laser dopant", "Nuclear control rods"],
    63: ["Red and blue phosphors in TV screens", "Anti-counterfeiting ink in Euro banknotes", "Compact fluorescent light bulbs", "Control rods"],
    64: ["MRI contrast agents (gadolinium chelates)", "Data storage magneto-optical recording", "High-strength neutron radiography", "Shielding"],
    65: ["Green phosphors in displays and lamps", "Magnetostrictive alloys (Terfenol-D)", "Sonar acoustic transducers", "Fluorescent lighting"],
    66: ["Permanent magnet thermal stabilization", "Terfenol-D smart sonar materials", "Nuclear reactor control rods", "Laser crystal doping"],
    67: ["High-power medical laser surgery (Ho:YAG)", "High magnetic field flux concentrators", "Yellow/red glass coloring", "Nuclear control rods"],
    68: ["Erbium-doped fiber amplifiers (EDFA) for internet", "Cosmetic and dental laser surgery", "Pink glass and porcelain glaze", "Nuclear control rods"],
    69: ["Portable medical X-ray machines", "Solid-state laser materials", "Euro banknote security phosphors", "High-efficiency arc lighting"],
    70: ["Fiber-laser amplifiers for machining", "Atomic clocks (optical lattice standard)", "Stainless steel grain refiner", "Stress-gauging alloy"],
    71: ["PET medical scan positron detectors (LSO crystals)", "High-refractive index optical lenses", "Petroleum refining catalyst", "Radiotherapy"],
    72: ["Nuclear submarine control rods", "Microprocessor high-k gate dielectrics", "Plasma cutting torch electrodes", "Superalloy turbine blades"],
    73: ["Miniaturized electronic capacitors (smartphones)", "Surgical bone screws and implants", "Chemical processing vessel lining", "High-index optical glass"],
    74: ["Incandescent light bulb filaments", "Tungsten carbide cutting tools", "Aerospace rocket engine nozzles", "Kinetic energy penetrators"],
    75: ["Jet engine single-crystal superalloys", "Lead-free high-octane gasoline catalyst", "Mass spectrometer electrical filaments", "Thermocouples"],
    76: ["Fountain pen nib tipping alloys", "Fingerprint detection staining (OsO4)", "Hard wear-resistant instrument pivots", "Electrical contacts"],
    77: ["Corrosion-resistant spark plug tips", "Crucibles for laser crystal growth", "Cancer brachytherapy sources", "Standard international kilogram prototype"],
    78: ["Automotive catalytic converters", "High-end luxury jewelry & wedding bands", "Cisplatin anti-cancer chemotherapy", "Laboratory crucibles & thermocouples"],
    79: ["Investment bullion and monetary reserve", "Fine jewelry and luxury adornment", "Corrosion-free microchip wire bonding", "Spacecraft infrared radiation shield"],
    80: ["Fluorescent and UV vapor lighting", "Dental amalgam restorations", "Historical liquid thermometers & manometers", "Industrial chlorine cells"],
    81: ["Cardiovascular diagnostic perfusion imaging", "Low-melting point specialty glass", "High-temperature superconductor research", "Infrared optical lenses"],
    82: ["Automotive lead-acid starter batteries", "Medical X-ray radiation shielding", "Stained glass construction", "Soundproofing & ballast weights"],
    83: ["Stomach upset pharmaceuticals (Pepto-Bismol)", "Fire sprinkler fusible safety plugs", "Cosmetic pearlescent pigments", "Non-toxic lead substitute shot"],
    84: ["Static eliminator brushes for photo film", "Spacecraft thermoelectric generators", "Neutron trigger source in physics", "Industrial anti-static equipment"],
    85: ["Targeted alpha-particle cancer therapy", "Radiopharmaceutical research", "Scientific thyroid imaging study", "Nuclear tracer"],
    86: ["Cancer radiation brachytherapy seeds", "Hydrological tracer for groundwater", "Earthquake predictive monitoring", "Atmospheric tracer"],
    87: ["Laser atom-trapping quantum research", "Nuclear structure investigations", "Weak atomic interaction studies", "Theoretical physics tests"],
    88: ["Historical luminous glow-in-the-dark dials", "Cancer bone metastases radiotherapy", "Industrial radiography neutron sources", "Early nuclear research"],
    89: ["Targeted alpha therapy for cancer (Ac-225)", "Neutron source for oil well logging", "Thermoelectric space power research", "Radiochemistry studies"],
    90: ["Gas lantern incandescent mantles", "High-index optical camera lenses", "Tungsten TIG welding electrodes", "Nuclear power fuel (thorium cycle)"],
    91: ["Radioactive dating of ocean sediments", "Nuclear fuel breeding research", "Radiochemical research", "Scientific studies"],
    92: ["Nuclear electrical power plant fuel", "Nuclear naval propulsion (submarines)", "Depleted uranium tank armor & munitions", "Radiometric dating"],
    93: ["Precursor in reactor production of Pu-238", "Spacecraft nuclear battery research", "High-energy neutron detectors", "Transuranic study"],
    94: ["Radioisotope thermoelectric power (Voyager, Mars Curiosity)", "Nuclear weapons primary fissile core", "MOX nuclear reactor fuel", "Pacemaker power (historic)"],
    95: ["Commercial household smoke detectors", "Industrial thickness & moisture gauges", "Portable neutron radiography source", "Space exploration power research"],
    96: ["Spacecraft radioisotope thermoelectric generators", "Alpha particle X-ray spectrometers (Mars rovers)", "Production of heavier transuranic isotopes", "Neutron sources"],
    97: ["Scientific synthesis of heavier transuranics", "Californium-252 target material", "Actinide chemistry study", "Nuclear research"],
    98: ["Neutron moisture gauges for highway construction", "Oil well logging neutron source", "Cancer neutron radiotherapy", "Airport luggage neutron inspection"],
    99: ["Production of mendelevium and higher actinides", "Fundamental chemical investigations of heavy elements", "Target material for nuclear reactions", "Spectral research"],
    100: ["Fundamental nuclear physics experiments", "Study of heavy nuclear fission modes", "Target for trans-fermium element research", "Theoretical models"],
    101: ["Fundamental discovery of single-atom chemistry", "Investigating actinide oxidation states", "Decay chain spectroscopy", "Nuclear physics"],
    102: ["Studying relativistic actinide chemistry", "Spontaneous fission experiments", "Nuclear structure physics", "Atomic collision dynamics"],
    103: ["Exploring the end of the actinide series", "Investigating relativistic electron effects", "First ionization potential experiments", "Superheavy physics"],
    104: ["Probing transactinide group 4 chemical periodicity", "Gas-phase chromatography experiments", "Relativistic atomic physics", "Superheavy chemistry"],
    105: ["Gas chromatography of volatile halides", "Aqueous phase extraction experiments", "Nuclear stability island research", "Superheavy chemistry"],
    106: ["Superheavy carbonyl complex synthesis (Sg(CO)6)", "Investigating group 6 chemical behavior", "Decay chain spectroscopy", "Nuclear research"],
    107: ["Chemical isolation of bohrium oxychlorides", "Testing relativistic effects in group 7", "Decay kinematics studies", "Transactinide chemistry"],
    108: ["Gas-phase synthesis of volatile hassium tetroxide (HsO4)", "Confirming periodic behavior with osmium", "Thermodynamic stability studies", "Nuclear physics"],
    109: ["Studying superheavy element production cross-sections", "Testing relativistic quantum chemistry", "Decay channel mapping", "Cold fusion research"],
    110: ["Experimental verification of superheavy nuclear shells", "High-sensitivity recoil separator testing", "Isomer state research", "Nuclear physics"],
    111: ["Investigating relativistic gold-like properties", "Mapping cold fusion reaction pathways", "Decay spectroscopy", "Transactinide research"],
    112: ["Adsorption chromatography testing noble behavior", "Confirming relativistic stabilization of 7s shell", "Superheavy physics", "Gas-phase atom detection"],
    113: ["Probing group 13 superheavy periodicity", "Relativistic p-shell electron studies", "Cold fusion decay chains", "Fundamental chemistry research"],
    114: ["Gas-phase chemistry on gold surfaces", "Testing relativistic noble-gas-like inertness", "Island of stability investigations", "Superheavy research"],
    115: ["Synthesis target for element 117 (tennessine)", "Decay chain research leading to nihonium", "Hot fusion nuclear reactions", "Island of stability physics"],
    116: ["Synthesis target for element 118 discovery", "Nuclear decay systematics of neutron-rich nuclei", "Testing shell closures", "Hot fusion experiments"],
    117: ["Probing halogen trends and relativistic astatine-like chemistry", "Investigating spin-orbit splitting in 7p electrons", "Hot fusion reaction studies", "Nuclear synthesis"],
    118: ["Probing extreme relativistic electron cloud behavior", "Testing noble gas periodicity at the edge of the table", "Island of stability exploration", "Theoretical nuclear physics"],
}

CATEGORY_MAP = {
    'alkali metal': ('alkali-metal', 'Alkali Metal'),
    'alkaline earth metal': ('alkaline-earth', 'Alkaline Earth Metal'),
    'transition metal': ('transition-metal', 'Transition Metal'),
    'post-transition metal': ('post-transition-metal', 'Post-Transition Metal'),
    'metalloid': ('metalloid', 'Metalloid'),
    'polyatomic nonmetal': ('reactive-nonmetal', 'Reactive Nonmetal'),
    'diatomic nonmetal': ('reactive-nonmetal', 'Reactive Nonmetal'),
    'noble gas': ('noble-gas', 'Noble Gas'),
    'lanthanide': ('lanthanide', 'Lanthanide'),
    'actinide': ('actinide', 'Actinide'),
    'unknown, probably transition metal': ('transition-metal', 'Transition Metal'),
    'unknown, probably post-transition metal': ('post-transition-metal', 'Post-Transition Metal'),
    'unknown, probably metalloid': ('metalloid', 'Metalloid'),
    'unknown, predicted to be noble gas': ('noble-gas', 'Noble Gas'),
}

HALOGENS = {9, 17, 35, 53, 85, 117}

# Standardized extended table xpos (32 columns)
# In 32-col layout:
# Groups 1-2: cols 1-2
# f-block (Lanthanides 57-71, Actinides 89-103): cols 3-17
# d-block (Groups 3-12 for periods 4-7): cols 18-27
# p-block (Groups 13-18): cols 28-32
# Period 1: H col 1, He col 32
# Period 2-3: s-block cols 1-2, p-block cols 27-32 (or cols 28-32)
def get_extended_coords(num, period, group, xpos, ypos):
    # 57 to 71 Lanthanides: period 6, cols 3 to 17
    if 57 <= num <= 71:
        return (num - 57 + 3, 6)
    # 89 to 103 Actinides: period 7, cols 3 to 17
    if 89 <= num <= 103:
        return (num - 89 + 3, 7)
    
    # For other elements:
    # If period 1:
    if period == 1:
        return (1 if num == 1 else 32, 1)
    
    # If period 2 or 3:
    if period in (2, 3):
        if group <= 2:
            return (group, period)
        else:
            # group 13..18 -> cols 27..32
            return (group + 14, period)
    
    # If period 4 or 5:
    if period in (4, 5):
        if group <= 2:
            return (group, period)
        else:
            # group 3..18 -> shift by 14
            return (group + 14, period)
            
    # Period 6 or 7:
    if period in (6, 7):
        if group <= 2:
            return (group, period)
        else:
            # group 3..18 (Hf-Hg is cols 4-12 in standard, in extended Hf is col 18)
            # group 4 -> 18, group 5 -> 19 ... group 18 -> 32
            return (group + 14, period)

    return (xpos, ypos)

processed_elements = []

for e in raw_elements:
    num = e['number']
    cat_str = e.get('category', '').lower()
    cat_id, cat_name = CATEGORY_MAP.get(cat_str, ('unknown', 'Unknown'))
    
    period = e.get('period', 1)
    group = e.get('group', 1)
    xpos = e.get('xpos', 1)
    ypos = e.get('ypos', 1)
    
    # Fix xpos / ypos for Lanthanides and Actinides in standard 18-col IUPAC layout
    # Standard: row 9 is Lanthanides (57-71) in cols 4-18 (or 3-17)
    # Standard: row 10 is Actinides (89-103) in cols 4-18 (or 3-17)
    if 57 <= num <= 71:
        grid_col = num - 57 + 3  # cols 3 to 17 or cols 4 to 18
        grid_row = 9
    elif 89 <= num <= 103:
        grid_col = num - 89 + 3
        grid_row = 10
    else:
        grid_col = xpos
        grid_row = ypos

    ext_col, ext_row = get_extended_coords(num, period, group, xpos, ypos)

    # Determine block
    # s-block: group 1, 2, plus He
    # p-block: group 13-18 (except He)
    # d-block: group 3-12 (except lanth/act)
    # f-block: lanthanides (57-71) and actinides (89-103)
    if num == 2:
        block = 's'
    elif 57 <= num <= 71 or 89 <= num <= 103:
        block = 'f'
    elif group in (1, 2):
        block = 's'
    elif 3 <= group <= 12:
        block = 'd'
    else:
        block = 'p'

    # State at room temp (293 K)
    melt = e.get('melt')
    boil = e.get('boil')
    phase = e.get('phase', 'Solid').lower()
    if num >= 99:
        standard_state = 'synthetic'
    elif phase in ('gas', 'liquid', 'solid'):
        standard_state = phase
    else:
        standard_state = 'solid'

    # Common uses
    uses = COMMON_USES.get(num, [
        f"Scientific research into heavy element properties",
        f"Nuclear spectroscopy & physics exploration",
        f"Particle accelerator target experiments"
    ])

    # Clean discoverer and year
    disc_by = e.get('discovered_by') or "Ancient civilization"
    if not disc_by or disc_by == "None":
        disc_by = "Known to the ancients"
    
    # Atomic mass string or rounded
    mass_val = e.get('atomic_mass')
    if isinstance(mass_val, (int, float)):
        atomic_mass_formatted = f"{mass_val:.4f}".rstrip('0').rstrip('.')
    else:
        atomic_mass_formatted = str(mass_val)

    is_halogen = num in HALOGENS
    is_metal = cat_id in ('alkali-metal', 'alkaline-earth', 'transition-metal', 'post-transition-metal', 'lanthanide', 'actinide')
    is_nonmetal = cat_id in ('reactive-nonmetal', 'noble-gas') or is_halogen
    is_metalloid = cat_id == 'metalloid'

    elem_obj = {
        "number": num,
        "symbol": e['symbol'],
        "name": e['name'],
        "atomicMass": atomic_mass_formatted,
        "atomicMassValue": mass_val,
        "category": cat_id,
        "categoryName": cat_name,
        "period": period,
        "group": group,
        "block": block,
        "gridCol": grid_col,
        "gridRow": grid_row,
        "extendedCol": ext_col,
        "extendedRow": ext_row,
        "shells": e.get('shells', []),
        "electronConfiguration": e.get('electron_configuration', ''),
        "electronConfigurationSemantic": e.get('electron_configuration_semantic', ''),
        "standardState": standard_state,
        "meltingPointKelvin": melt,
        "boilingPointKelvin": boil,
        "density": e.get('density'),
        "electronegativity": e.get('electronegativity_pauling'),
        "ionizationEnergy": e.get('ionization_energies', [None])[0] if e.get('ionization_energies') else None,
        "discoveredBy": disc_by,
        "summary": e.get('summary', ''),
        "appearance": e.get('appearance') or 'Not recorded or unknown',
        "commonUses": uses,
        "isHalogen": is_halogen,
        "isMetal": is_metal,
        "isNonmetal": is_nonmetal,
        "isMetalloid": is_metalloid,
        "cpkHex": e.get('cpk_hex') or '#808080'
    }
    processed_elements.append(elem_obj)

# Output TypeScript file
ts_content = """// Autogenerated complete dataset of all 118 chemical elements
export interface ElementData {
  number: number;
  symbol: string;
  name: string;
  atomicMass: string;
  atomicMassValue: number;
  category: string;
  categoryName: string;
  period: number;
  group: number;
  block: 's' | 'p' | 'd' | 'f';
  gridCol: number;
  gridRow: number;
  extendedCol: number;
  extendedRow: number;
  shells: number[];
  electronConfiguration: string;
  electronConfigurationSemantic: string;
  standardState: 'solid' | 'liquid' | 'gas' | 'synthetic';
  meltingPointKelvin: number | null;
  boilingPointKelvin: number | null;
  density: number | null;
  electronegativity: number | null;
  ionizationEnergy: number | null;
  discoveredBy: string;
  summary: string;
  appearance: string | null;
  commonUses: string[];
  isHalogen: boolean;
  isMetal: boolean;
  isNonmetal: boolean;
  isMetalloid: boolean;
  cpkHex: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  bgLight: string;
  bgDark: string;
  textLight: string;
  textDark: string;
  dotColor: string;
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  'alkali-metal': {
    id: 'alkali-metal',
    name: 'Alkali Metal',
    color: '#ef4444',
    borderColor: 'border-red-500/40',
    bgLight: 'bg-red-50 hover:bg-red-100',
    bgDark: 'bg-red-950/30 hover:bg-red-900/40 border-red-500/30',
    textLight: 'text-red-700',
    textDark: 'text-red-300',
    dotColor: '#ef4444'
  },
  'alkaline-earth': {
    id: 'alkaline-earth',
    name: 'Alkaline Earth',
    color: '#f97316',
    borderColor: 'border-orange-500/40',
    bgLight: 'bg-orange-50 hover:bg-orange-100',
    bgDark: 'bg-orange-950/30 hover:bg-orange-900/40 border-orange-500/30',
    textLight: 'text-orange-700',
    textDark: 'text-orange-300',
    dotColor: '#f97316'
  },
  'transition-metal': {
    id: 'transition-metal',
    name: 'Transition Metal',
    color: '#eab308',
    borderColor: 'border-yellow-500/40',
    bgLight: 'bg-yellow-50 hover:bg-yellow-100',
    bgDark: 'bg-yellow-950/30 hover:bg-yellow-900/40 border-yellow-500/30',
    textLight: 'text-yellow-700',
    textDark: 'text-yellow-300',
    dotColor: '#eab308'
  },
  'post-transition-metal': {
    id: 'post-transition-metal',
    name: 'Post-Transition Metal',
    color: '#10b981',
    borderColor: 'border-emerald-500/40',
    bgLight: 'bg-emerald-50 hover:bg-emerald-100',
    bgDark: 'bg-emerald-950/30 hover:bg-emerald-900/40 border-emerald-500/30',
    textLight: 'text-emerald-700',
    textDark: 'text-emerald-300',
    dotColor: '#10b981'
  },
  'metalloid': {
    id: 'metalloid',
    name: 'Metalloid',
    color: '#06b6d4',
    borderColor: 'border-cyan-500/40',
    bgLight: 'bg-cyan-50 hover:bg-cyan-100',
    bgDark: 'bg-cyan-950/30 hover:bg-cyan-900/40 border-cyan-500/30',
    textLight: 'text-cyan-700',
    textDark: 'text-cyan-300',
    dotColor: '#06b6d4'
  },
  'reactive-nonmetal': {
    id: 'reactive-nonmetal',
    name: 'Reactive Nonmetal',
    color: '#3b82f6',
    borderColor: 'border-blue-500/40',
    bgLight: 'bg-blue-50 hover:bg-blue-100',
    bgDark: 'bg-blue-950/30 hover:bg-blue-900/40 border-blue-500/30',
    textLight: 'text-blue-700',
    textDark: 'text-blue-300',
    dotColor: '#3b82f6'
  },
  'noble-gas': {
    id: 'noble-gas',
    name: 'Noble Gas',
    color: '#8b5cf6',
    borderColor: 'border-purple-500/40',
    bgLight: 'bg-purple-50 hover:bg-purple-100',
    bgDark: 'bg-purple-950/30 hover:bg-purple-900/40 border-purple-500/30',
    textLight: 'text-purple-700',
    textDark: 'text-purple-300',
    dotColor: '#8b5cf6'
  },
  'lanthanide': {
    id: 'lanthanide',
    name: 'Lanthanide',
    color: '#ec4899',
    borderColor: 'border-pink-500/40',
    bgLight: 'bg-pink-50 hover:bg-pink-100',
    bgDark: 'bg-pink-950/30 hover:bg-pink-900/40 border-pink-500/30',
    textLight: 'text-pink-700',
    textDark: 'text-pink-300',
    dotColor: '#ec4899'
  },
  'actinide': {
    id: 'actinide',
    name: 'Actinide',
    color: '#f43f5e',
    borderColor: 'border-rose-500/40',
    bgLight: 'bg-rose-50 hover:bg-rose-100',
    bgDark: 'bg-rose-950/30 hover:bg-rose-900/40 border-rose-500/30',
    textLight: 'text-rose-700',
    textDark: 'text-rose-300',
    dotColor: '#f43f5e'
  },
  'unknown': {
    id: 'unknown',
    name: 'Unknown Properties',
    color: '#64748b',
    borderColor: 'border-slate-500/40',
    bgLight: 'bg-slate-50 hover:bg-slate-100',
    bgDark: 'bg-slate-900/40 hover:bg-slate-800/40 border-slate-600/30',
    textLight: 'text-slate-700',
    textDark: 'text-slate-300',
    dotColor: '#64748b'
  }
};

export const ELEMENTS_DATA: ElementData[] = """ + json.dumps(processed_elements, indent=2) + """;
"""

with open('src/data/elements.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"Successfully generated src/data/elements.ts with {len(processed_elements)} elements.")
