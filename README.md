# ⚛️ Interactive Periodic Table of Elements

A modern, interactive, and visually stunning **Periodic Table of Elements** web application built with **React**, **TypeScript**, and **Tailwind CSS**.

Featuring all **118 officially recognized chemical elements** (from Hydrogen to Oganesson), complete with physical and chemical data, interactive animated **Bohr atomic models**, an interactive **temperature simulator**, **side-by-side element comparison**, and a **chemistry knowledge quiz**.

---

## 🌟 Key Features

### 1. 🧬 Complete & Accurate Dataset (118 Elements)
- **100% Complete**: All 118 chemical elements from Hydrogen (1) to Oganesson (118).
- **Accurate Parameters**: Atomic number, symbol, full name, relative atomic mass, standard state (STP), electron configuration, Bohr orbital shells (`[2, 8, 18, ...]`), melting and boiling points, density, electronegativity, ionization energy, discoverer, summary, and real-world common uses.
- **Accurate Placement**: Positioned according to standard IUPAC 18 groups and 7 periods, with Lanthanides (57–71) and Actinides (89–103) located in dedicated series rows with interactive group 3 anchors.

### 2. 🎨 Modern & Responsive UI
- **Dark & Light Mode**: Seamless theme toggle with high-contrast, glowing accents and glassmorphism.
- **Element Cells**: Display atomic number, symbol, name, atomic mass, category accent bar, and state-of-matter indicator dot.
- **Category Color-Coding**: Distinct visual identities for:
  - Alkali Metals (`#ef4444`)
  - Alkaline Earth Metals (`#f97316`)
  - Transition Metals (`#eab308`)
  - Post-Transition Metals (`#10b981`)
  - Metalloids (`#06b6d4`)
  - Reactive Nonmetals (`#3b82f6`)
  - Noble Gases (`#8b5cf6`)
  - Lanthanides (`#ec4899`)
  - Actinides (`#f43f5e`)
  - Unknown / Superheavy Elements (`#64748b`)
- **Zoom & Pan Controls**: Responsive table viewport with zoom-in, zoom-out, and 100% reset fit controls for mobile, tablet, and widescreen displays.

### 3. 🔬 Interactive Element Details Modal
- **Overview & Chemistry**: Large symbol badge, mass, category, block, oxidation state, density, Pauling electronegativity, and first ionization energy.
- **Interactive Animated Bohr Model**: Concentric SVG electron shells (K, L, M, N, O, P, Q) with dynamically calculated rotating electron particles, orbit speed controls, and valence electron counts.
- **Thermal & Phase Transitions**: Melting and boiling points with unit toggles between Celsius (°C), Kelvin (K), and Fahrenheit (°F), plus a phase indicator.
- **Applications & History**: Curated real-world industrial and medical uses, discovery information, and direct Wikipedia reference link.
- **Keyboard Navigation**: Browse previous and next elements seamlessly with <kbd>←</kbd> and <kbd>→</kbd> arrow keys, or press <kbd>Esc</kbd> to close.

### 4. 🔍 Instant Search & Live Filters
- **Real-time Search**: Search instantly by element name, symbol, or atomic number with <kbd>/</kbd> hotkey shortcut. Matching elements glow while non-matching elements dim.
- **Classification Filters**: Filter by major classes (*Metals*, *Nonmetals*, *Metalloids*, *Halogens*).
- **Block Filters**: Filter by orbital blocks (*s-block*, *p-block*, *d-block*, *f-block*).
- **State Filter**: Filter by room-temperature states (*Solid*, *Liquid*, *Gas*).
- **Interactive Color Legend**: Click any category swatch to isolate it, or hover to highlight all elements in that category.
- **Reset Button**: Single-click button to reset all filters, searches, and temperature back to standard.

### 5. 🌡️ Interactive Temperature Simulator
- Dynamic Kelvin slider from **0 K (-273.15°C)** to **6000 K (Sun's surface)**.
- Watch elements dynamically transition between **Solid**, **Liquid**, and **Gas** states as the temperature changes!
- Live phase tally showing exact counts of solids, liquids, and gases across all 118 elements at any chosen temperature.
- Auto-sweep animation to simulate progressive heating.
- Quick presets: Absolute Zero (0 K), Ice Melting Point (273 K), Room Temperature (293 K), Boiling Water (373 K), and Solar Surface (5778 K).

### 6. ⚖️ Side-by-Side Element Comparison
- Compare any two elements simultaneously across 14 physical, chemical, and atomic parameters.

### 7. 🏆 Chemistry Quiz Challenge
- Test knowledge with dynamically generated questions (symbols, atomic numbers, categories, and element identification) with live score and accuracy tracking.

### 8. 📐 Layout Switcher
- Toggle between **Standard 18-Column** and **Extended 32-Column** periodic table layout where f-block elements are seamlessly placed in-line.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm or yarn

### Installation
```bash
# Clone or navigate to the project directory
cd "c:/Users/hirem/OneDrive/Desktop/Periodic Table"

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

### Production Build & Preview
```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```
Visit `http://localhost:4173/` or `http://localhost:5173/` in your browser.

---

## 📁 Project Architecture

```
├── index.html                   # HTML entry point with fonts & dark theme meta
├── package.json                 # Dependencies & scripts
├── vite.config.ts               # Vite configuration with Tailwind CSS v4
├── src/
│   ├── main.tsx                 # React entry point
│   ├── App.tsx                  # Root component orchestrating state & modals
│   ├── index.css                # Tailwind CSS v4 styles & custom keyframe animations
│   ├── data/
│   │   └── elements.ts          # Complete dataset of all 118 chemical elements
│   ├── utils/
│   │   └── helpers.ts           # Temperature conversions & state calculators
│   └── components/
│       ├── Header.tsx           # Navigation, search bar, theme toggle, action buttons
│       ├── FilterBar.tsx        # Classification, block, and state filter pills
│       ├── TemperatureBar.tsx   # Temperature slider & phase transition simulator
│       ├── PeriodicTable.tsx    # 18-col & 32-col periodic table grid with zoom controls
│       ├── ElementCell.tsx      # Individual element cell with hover & glow
│       ├── ElementTooltip.tsx   # Floating hover tooltip
│       ├── ElementModal.tsx     # Comprehensive popup with tabs & keyboard navigation
│       ├── BohrModel.tsx        # Concentric orbital SVG atomic model with animated electrons
│       ├── CompareModal.tsx     # Side-by-side element comparator
│       └── QuizModal.tsx        # Chemistry knowledge challenge game
└── scripts/
    └── build_dataset.py         # Data compiler and enrichment script
```

---

## 📜 License
MIT License. Created for chemistry students, researchers, educators, and science enthusiasts.
