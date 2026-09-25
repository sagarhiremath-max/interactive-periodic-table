import { useState, useMemo, useEffect } from 'react';
import { ELEMENTS_DATA, type ElementData } from './data/elements';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { LegendBar } from './components/LegendBar';
import { PeriodicTable } from './components/PeriodicTable';
import { ElementDetailPanel } from './components/ElementDetailPanel';
import { ElementTooltip } from './components/ElementTooltip';
import { TemperatureBar } from './components/TemperatureBar';
import { CompareModal } from './components/CompareModal';
import { QuizModal } from './components/QuizModal';
import { Atom, Sparkles, Layers } from 'lucide-react';

export function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeClassification, setActiveClassification] = useState<
    'all' | 'metals' | 'nonmetals' | 'metalloids' | 'halogens'
  >('all');
  const [selectedBlock, setSelectedBlock] = useState<'all' | 's' | 'p' | 'd' | 'f'>('all');
  const [selectedStateFilter, setSelectedStateFilter] = useState<'all' | 'solid' | 'liquid' | 'gas'>('all');
  const [layoutMode, setLayoutMode] = useState<'standard' | 'extended'>('standard');
  const [temperatureKelvin, setTemperatureKelvin] = useState<number>(293.15); // 20°C room temp

  // Modals & Panels
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [hoveredElement, setHoveredElement] = useState<ElementData | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Compare & Quiz modals
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareElement1, setCompareElement1] = useState<ElementData | null>(ELEMENTS_DATA[0]); // Hydrogen
  const [compareElement2, setCompareElement2] = useState<ElementData | null>(ELEMENTS_DATA[5]); // Carbon
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Sync dark mode class on document body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle Search match count calculation
  const searchMatchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const q = searchQuery.trim().toLowerCase();
    return ELEMENTS_DATA.filter(
      (el) =>
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase() === q ||
        el.symbol.toLowerCase().startsWith(q) ||
        `${el.number}` === q
    ).length;
  }, [searchQuery]);

  // Check if any filter is active for easy reset
  const hasActiveFiltersOrSearch =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== 'all' ||
    activeClassification !== 'all' ||
    selectedBlock !== 'all' ||
    selectedStateFilter !== 'all' ||
    Math.round(temperatureKelvin) !== 293;

  const handleResetAll = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setActiveClassification('all');
    setSelectedBlock('all');
    setSelectedStateFilter('all');
    setTemperatureKelvin(293.15);
    setHoveredCategory(null);
  };

  const handleClassificationChange = (c: 'all' | 'metals' | 'nonmetals' | 'metalloids' | 'halogens') => {
    setActiveClassification(c);
    setSelectedCategory(c);
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setActiveClassification('all');
  };

  const handleHoverElement = (el: ElementData | null, e?: React.MouseEvent<HTMLDivElement>) => {
    setHoveredElement(el);
    if (el && e) {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    } else {
      setTooltipPos(null);
    }
  };

  const handleAddToCompare = (el: ElementData) => {
    if (!compareElement1) {
      setCompareElement1(el);
    } else if (!compareElement2) {
      setCompareElement2(el);
    } else {
      setCompareElement2(el);
    }
    setIsCompareOpen(true);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Main Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchMatchCount={searchMatchCount}
        layoutMode={layoutMode}
        onToggleLayout={() =>
          setLayoutMode((prev) => (prev === 'standard' ? 'extended' : 'standard'))
        }
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onResetAll={handleResetAll}
        hasActiveFiltersOrSearch={hasActiveFiltersOrSearch}
      />

      {/* Main Content Workspace */}
      <main
        className={`flex-1 max-w-[1700px] w-full mx-auto px-3 sm:px-6 py-5 space-y-5 transition-all duration-300 ${
          selectedElement ? '2xl:mr-[530px]' : ''
        }`}
      >
        {/* Top Control Panels: Classification & Block Filters */}
        <FilterBar
          activeClassification={activeClassification}
          onSelectClassification={handleClassificationChange}
          activeBlock={selectedBlock}
          onSelectBlock={setSelectedBlock}
          activeStateFilter={selectedStateFilter}
          onSelectStateFilter={setSelectedStateFilter}
          hasActiveFilters={hasActiveFiltersOrSearch}
          onResetAll={handleResetAll}
          darkMode={darkMode}
        />

        {/* Temperature State Simulator Bar */}
        <TemperatureBar
          temperatureKelvin={temperatureKelvin}
          onTemperatureChange={setTemperatureKelvin}
          elements={ELEMENTS_DATA}
          darkMode={darkMode}
        />

        {/* Main Workspace: Left Side = Periodic Table, Right Side = Element Information */}
        <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
          {/* LEFT SIDE: Periodic Table & Color Legend */}
          <div className="flex-1 w-full min-w-0 space-y-5">
            {/* The Core Periodic Table Matrix */}
            <section className="relative">
              <PeriodicTable
                elements={ELEMENTS_DATA}
                selectedElement={selectedElement}
                hoveredElement={hoveredElement}
                hoveredCategory={hoveredCategory}
                selectedCategory={selectedCategory}
                selectedBlock={selectedBlock}
                selectedStateFilter={selectedStateFilter}
                searchQuery={searchQuery}
                layoutMode={layoutMode}
                temperatureKelvin={temperatureKelvin}
                darkMode={darkMode}
                onSelectElement={(el) => setSelectedElement(el)}
                onHoverElement={handleHoverElement}
                onSelectCategory={handleCategorySelect}
              />
            </section>

            {/* Color Legend Bar */}
            <LegendBar
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
              hoveredCategory={hoveredCategory}
              onHoverCategory={setHoveredCategory}
              elements={ELEMENTS_DATA}
              darkMode={darkMode}
            />
          </div>

          {/* RIGHT SIDE: Dedicated Element Information Panel */}
          <aside className="w-full lg:w-[340px] xl:w-[370px] 2xl:w-[395px] shrink-0 lg:sticky lg:top-20">
            <ElementDetailPanel
              element={selectedElement}
              darkMode={darkMode}
              temperatureKelvin={temperatureKelvin}
              onSelectElement={(el) => setSelectedElement(el)}
              onAddToCompare={handleAddToCompare}
            />
          </aside>
        </div>

        {/* Informative Chemistry Overview Section */}
        <section className={`rounded-2xl p-5 sm:p-6 border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Atom size={18} />
                <h3>About The Periodic Table</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The periodic table arranges all 118 chemical elements in order of increasing atomic number. Elements with similar chemical properties appear in the same vertical column (group), revealing recurring chemical periodicity.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Layers size={18} />
                <h3>Bohr Atomic Orbital Diagrams</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click on any element in the grid to open the full interactive Bohr atomic model. Watch orbiting electrons distributed across concentric electron shells (K through Q) and examine electronic configurations.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Sparkles size={18} />
                <h3>Phase Simulator & Explorer</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Use the temperature slider to simulate temperatures from 0 K (absolute zero) up to 6000 K (solar surface). Observe elements melting into liquids and evaporating into gases in real-time according to their melting and boiling points.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Hover Tooltip */}
      <ElementTooltip
        element={hoveredElement}
        position={tooltipPos}
        temperatureKelvin={temperatureKelvin}
        darkMode={darkMode}
      />

      {/* Side-by-Side Element Comparison Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        element1={compareElement1}
        element2={compareElement2}
        darkMode={darkMode}
        onSelectElement1={setCompareElement1}
        onSelectElement2={setCompareElement2}
      />

      {/* Chemistry Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        darkMode={darkMode}
        onInspectElement={(el) => {
          setSelectedElement(el);
        }}
      />

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-xs transition-colors ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-500'}`}>
        <div className="max-w-[1700px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Periodic Table of Elements Explorer. Complete IUPAC 118 Elements Dataset.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              118 / 118 Elements Loaded
            </span>
            <span>•</span>
            <button
              onClick={() => handleResetAll()}
              className="text-cyan-400 hover:underline"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
