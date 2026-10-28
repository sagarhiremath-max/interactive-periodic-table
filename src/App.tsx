import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ELEMENTS_DATA, type ElementData } from './data/elements';
import { Navbar } from './components/Navbar';
import { CompareModal } from './components/CompareModal';
import { QuizModal } from './components/QuizModal';
import { ElectronExplorerModal } from './components/ElectronExplorerModal';
import { ChemistryGuideModal } from './components/ChemistryGuideModal';
import { AboutModal } from './components/AboutModal';
import { HelpModal } from './components/HelpModal';
import { useFavorites } from './utils/useFavorites';
import type { TrendType } from './data/trends';
import { PeriodicTablePage } from './pages/PeriodicTablePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Atom } from 'lucide-react';

// Inner component to access router hooks like useNavigate and useLocation
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Theme state: defaults to dark futuristic navy science-lab interface
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [layoutMode, setLayoutMode] = useState<'standard' | 'extended'>('standard');

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeClassification, setActiveClassification] = useState<
    'all' | 'metals' | 'nonmetals' | 'metalloids'
  >('all');
  const [activeStateFilter, setActiveStateFilter] = useState<'all' | 'solid' | 'liquid' | 'gas'>('all');
  const [atomicRange, setAtomicRange] = useState<[number, number]>([1, 118]);
  const [temperatureKelvin, setTemperatureKelvin] = useState<number>(293.15); // 20°C room temp
  const [trendMode, setTrendMode] = useState<TrendType>('none');

  // Favorites
  const { isFavorite, toggleFavorite, favoritesCount } = useFavorites();
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  // Selected element for the medium-sized panel ABOVE the periodic table
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);

  // Hover & Tooltip
  const [hoveredElement, setHoveredElement] = useState<ElementData | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Modals state
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareElement1, setCompareElement1] = useState<ElementData | null>(ELEMENTS_DATA[0]); // Hydrogen
  const [compareElement2, setCompareElement2] = useState<ElementData | null>(ELEMENTS_DATA[5]); // Carbon
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isElectronExplorerOpen, setIsElectronExplorerOpen] = useState(false);
  const [isTrendsGuideOpen, setIsTrendsGuideOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFitViewOpen, setIsFitViewOpen] = useState(false);
  const [isElementModalOpen, setIsElementModalOpen] = useState(false);

  // Search input ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Toggle theme mode
  const handleToggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  // Sync theme class to document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  // Support direct URLs or query links by selecting element on same page
  useEffect(() => {
    if (location.pathname.startsWith('/element/')) {
      const param = location.pathname.replace('/element/', '');
      const match = ELEMENTS_DATA.find(
        (el) =>
          String(el.number) === param ||
          el.symbol.toLowerCase() === param.toLowerCase() ||
          el.name.toLowerCase() === param.toLowerCase()
      );
      if (match) {
        setSelectedElement(match);
        setIsElementModalOpen(true);
      }
      navigate('/', { replace: true });
      return;
    }

    const params = new URLSearchParams(location.search);
    const elementParam = params.get('element');
    if (elementParam) {
      const match = ELEMENTS_DATA.find(
        (el) =>
          el.symbol.toLowerCase() === elementParam.toLowerCase() ||
          el.name.toLowerCase() === elementParam.toLowerCase() ||
          String(el.number) === elementParam
      );
      if (match) {
        setSelectedElement(match);
        setIsElementModalOpen(true);
      }
    }
  }, [location.pathname, location.search, navigate]);

  // Keyboard navigation shortcuts: '/' for search, Esc to close/clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isElementModalOpen) setIsElementModalOpen(false);
        if (selectedElement) setSelectedElement(null);
        if (isCompareOpen) setIsCompareOpen(false);
        if (isQuizOpen) setIsQuizOpen(false);
        if (isElectronExplorerOpen) setIsElectronExplorerOpen(false);
        if (isTrendsGuideOpen) setIsTrendsGuideOpen(false);
        if (isAboutOpen) setIsAboutOpen(false);
        if (isHelpOpen) setIsHelpOpen(false);
        if (isFitViewOpen) setIsFitViewOpen(false);
        if (searchQuery) setSearchQuery('');
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isElementModalOpen,
    selectedElement,
    isCompareOpen,
    isQuizOpen,
    isElectronExplorerOpen,
    isTrendsGuideOpen,
    isAboutOpen,
    isHelpOpen,
    isFitViewOpen,
    searchQuery,
  ]);

  // Search match count calculation
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

  // Check if any filter or selection is active
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedElement !== null ||
    selectedCategory !== 'all' ||
    activeClassification !== 'all' ||
    activeStateFilter !== 'all' ||
    atomicRange[0] > 1 ||
    atomicRange[1] < 118 ||
    trendMode !== 'none' ||
    layoutMode !== 'standard' ||
    onlyFavorites ||
    Math.round(temperatureKelvin) !== 293 ||
    hoveredCategory !== null ||
    hoveredElement !== null ||
    isFitViewOpen ||
    isElementModalOpen;

  const handleResetFilters = () => {
    setSelectedElement(null);
    setIsElementModalOpen(false);
    setIsFitViewOpen(false);
    setSearchQuery('');
    setSelectedCategory('all');
    setActiveClassification('all');
    setActiveStateFilter('all');
    setAtomicRange([1, 118]);
    setTemperatureKelvin(293.15);
    setTrendMode('none');
    setLayoutMode('standard');
    setOnlyFavorites(false);
    setHoveredCategory(null);
    setHoveredElement(null);
    setTooltipPos(null);
    setIsCompareOpen(false);
    setIsQuizOpen(false);
    setIsElectronExplorerOpen(false);
    setIsTrendsGuideOpen(false);
    setIsAboutOpen(false);
    setIsHelpOpen(false);
  };

  const handleHoverElement = (el: ElementData | null, e?: React.MouseEvent<HTMLDivElement>) => {
    setHoveredElement(el);
    if (el && e) {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    } else {
      setTooltipPos(null);
    }
  };

  const handlePickRandomElement = () => {
    const randomIdx = Math.floor(Math.random() * ELEMENTS_DATA.length);
    const randomEl = ELEMENTS_DATA[randomIdx];
    setSelectedElement(randomEl);
    setIsElementModalOpen(true);
  };

  const handleOpenCompare = (el1?: ElementData, el2?: ElementData) => {
    if (el1) setCompareElement1(el1);
    if (el2) setCompareElement2(el2);
    setIsCompareOpen(true);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 font-sans ${
        darkMode ? 'bg-[#050814] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. Global Navigation Bar */}
      <Navbar
        darkMode={darkMode}
        onToggleTheme={handleToggleTheme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
        searchInputRef={searchInputRef}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenTrends={() => {
          setIsTrendsGuideOpen(true);
        }}
        onOpenElectronExplorer={() => setIsElectronExplorerOpen(true)}
        onPickRandomElement={handlePickRandomElement}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        favoritesCount={favoritesCount}
        onlyFavorites={onlyFavorites}
        onToggleOnlyFavorites={() => {
          setOnlyFavorites(!onlyFavorites);
        }}
        searchMatchCount={searchMatchCount}
        onOpenFitView={() => setIsFitViewOpen(true)}
        onResetAll={handleResetFilters}
        hasActiveSelections={hasActiveFilters}
      />

      {/* 2. Main Page */}
      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <PeriodicTablePage
                darkMode={darkMode}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                activeClassification={activeClassification}
                setActiveClassification={setActiveClassification}
                activeStateFilter={activeStateFilter}
                setActiveStateFilter={setActiveStateFilter}
                atomicRange={atomicRange}
                setAtomicRange={setAtomicRange}
                temperatureKelvin={temperatureKelvin}
                setTemperatureKelvin={setTemperatureKelvin}
                trendMode={trendMode}
                setTrendMode={setTrendMode}
                layoutMode={layoutMode}
                setLayoutMode={setLayoutMode}
                onlyFavorites={onlyFavorites}
                setOnlyFavorites={setOnlyFavorites}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
                selectedElement={selectedElement}
                onSelectElement={setSelectedElement}
                hoveredElement={hoveredElement}
                hoveredCategory={hoveredCategory}
                setHoveredCategory={setHoveredCategory}
                tooltipPos={tooltipPos}
                handleHoverElement={handleHoverElement}
                handleResetFilters={handleResetFilters}
                hasActiveFilters={hasActiveFilters}
                onOpenQuiz={() => setIsQuizOpen(true)}
                onOpenCompare={handleOpenCompare}
                isFitViewOpen={isFitViewOpen}
                setIsFitViewOpen={setIsFitViewOpen}
                isModalOpen={isElementModalOpen}
                setIsModalOpen={setIsElementModalOpen}
              />
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      {/* 3. Global Modals */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        element1={compareElement1}
        element2={compareElement2}
        darkMode={darkMode}
        onSelectElement1={setCompareElement1}
        onSelectElement2={setCompareElement2}
      />

      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        darkMode={darkMode}
        onInspectElement={(el) => {
          setSelectedElement(el);
          setIsElementModalOpen(true);
        }}
      />

      <ElectronExplorerModal
        isOpen={isElectronExplorerOpen}
        onClose={() => setIsElectronExplorerOpen(false)}
        initialElement={selectedElement || ELEMENTS_DATA[25]} // Iron
        darkMode={darkMode}
      />

      <ChemistryGuideModal
        isOpen={isTrendsGuideOpen}
        onClose={() => setIsTrendsGuideOpen(false)}
        selectedTrend={trendMode}
        darkMode={darkMode}
        onApplyTrend={(trend) => {
          setTrendMode(trend);
        }}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* 4. Footer */}
      <footer className="mt-12 py-8 border-t border-slate-800/80 bg-slate-950/70 text-slate-400 text-xs font-mono">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Atom className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">ELEMENTS LAB v3.0</span>
            <span>—</span>
            <span>Complete 118-Element Interactive Periodic Table</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <button
              type="button"
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Help & Shortcuts
            </button>
            <button
              type="button"
              onClick={() => setIsQuizOpen(true)}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Science Quiz
            </button>
            <button
              type="button"
              onClick={() => setIsCompareOpen(true)}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Compare
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
