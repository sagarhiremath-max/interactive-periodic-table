import React, { useState, useMemo, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { ELEMENTS_DATA, type ElementData } from './data/elements';
import { Navbar } from './components/Navbar';
import { CompareModal } from './components/CompareModal';
import { QuizModal } from './components/QuizModal';
import { ElectronExplorerModal } from './components/ElectronExplorerModal';
import { ChemistryGuideModal } from './components/ChemistryGuideModal';
import { AboutModal } from './components/AboutModal';
import { HelpModal } from './components/HelpModal';
import { AtomExplorerModal } from './components/atom-explorer/AtomExplorerModal';
import { FeedbackButton } from './components/FeedbackButton';
import { FeedbackModal } from './components/FeedbackModal';
import { useFavorites } from './utils/useFavorites';
import type { TrendType } from './data/trends';
import { PeriodicTablePage } from './pages/PeriodicTablePage';
import { ElementDetailsPage } from './pages/ElementDetailsPage';
import { AdminFeedbackPage } from './pages/AdminFeedbackPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Atom, Maximize2, CheckCircle2 } from 'lucide-react';

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
  const [compareElement1, setCompareElement1] = useState<ElementData | null>(null);
  const [compareElement2, setCompareElement2] = useState<ElementData | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isAtomExplorerOpen, setIsAtomExplorerOpen] = useState(false);
  const [atomExplorerElement, setAtomExplorerElement] = useState<ElementData | null>(null);
  const [isElectronExplorerOpen, setIsElectronExplorerOpen] = useState(false);
  const [isTrendsGuideOpen, setIsTrendsGuideOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFitViewOpen, setIsFitViewOpen] = useState(false);
  const [isElementModalOpen, setIsElementModalOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-dismiss toast notification
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

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

    const compareParam = params.get('compare');
    if (compareParam) {
      const parts = compareParam.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        const match1 = ELEMENTS_DATA.find(
          (el) => String(el.number) === parts[0] || el.symbol.toLowerCase() === parts[0].toLowerCase()
        );
        const match2 = ELEMENTS_DATA.find(
          (el) => String(el.number) === parts[1] || el.symbol.toLowerCase() === parts[1].toLowerCase()
        );
        if (match1 && match2) {
          setCompareElement1(match1);
          setCompareElement2(match2);
          setIsCompareOpen(true);
        }
      }
    }
  }, [location.pathname, location.search, navigate]);

  const handleOpenAtomExplorer = (el?: ElementData | null) => {
    if (el) {
      setAtomExplorerElement(el);
    }
    setIsAtomExplorerOpen(true);
  };

  // Keyboard navigation shortcuts: '/' for search, Esc to close/clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAtomExplorerOpen) setIsAtomExplorerOpen(false);
        if (isFeedbackOpen) setIsFeedbackOpen(false);
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
      } else if (
        (e.key === 'a' || e.key === 'A') &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        handleOpenAtomExplorer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isAtomExplorerOpen,
    isFeedbackOpen,
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
    const rawClean = q.replace(/^#|^z=/, '').trim();
    return ELEMENTS_DATA.filter(
      (el) =>
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase() === q ||
        el.symbol.toLowerCase().startsWith(q) ||
        `${el.number}` === q ||
        `${el.number}` === rawClean
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
    setCompareElement1(el1 || null);
    setCompareElement2(el2 || null);
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
        onOpenCompare={() => handleOpenCompare()}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenTrends={() => {
          setIsTrendsGuideOpen(true);
        }}
        onOpenAtomExplorer={() => handleOpenAtomExplorer()}
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
                onOpenAtomExplorer={() => handleOpenAtomExplorer()}
                isFitViewOpen={isFitViewOpen}
                setIsFitViewOpen={setIsFitViewOpen}
                isModalOpen={isElementModalOpen}
                setIsModalOpen={setIsElementModalOpen}
              />
            }
          />
          <Route
            path="/element/:atomicNumber"
            element={
              <ElementDetailsPage
                darkMode={darkMode}
                onOpenCompare={handleOpenCompare}
              />
            }
          />
          <Route path="/admin" element={<AdminFeedbackPage />} />
          <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      {/* 3. Global Modals */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        darkMode={darkMode}
        activeElement={selectedElement}
        onSubmitted={(msg) => setToastMessage(msg)}
      />

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
        onOpenAtomExplorer={(el) => handleOpenAtomExplorer(el)}
      />

      <AtomExplorerModal
        isOpen={isAtomExplorerOpen}
        onClose={() => setIsAtomExplorerOpen(false)}
        initialElement={atomExplorerElement || selectedElement || undefined}
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
              onClick={() => handleOpenCompare()}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Compare
            </button>
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Report a Mistake
            </button>
            <Link
              to="/admin"
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Admin
            </Link>
          </div>
        </div>
      </footer>

      {/* 5. Unified Floating Quick Action Bar */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col-reverse sm:flex-row items-end sm:items-center gap-3 font-sans pointer-events-none">
        {/* Full Table (No Scroll) Button */}
        {location.pathname === '/' && !isFitViewOpen && !isElementModalOpen && (
          <button
            type="button"
            onClick={() => setIsFitViewOpen(true)}
            className="pointer-events-auto shrink-0 group flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 text-slate-950 font-black text-xs sm:text-sm shadow-[0_8px_30px_rgba(6,182,212,0.6)] hover:shadow-[0_12px_40px_rgba(6,182,212,0.85)] border-2 border-cyan-100 ring-2 ring-cyan-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            title="Click to view complete periodic table without scrolling"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
            </span>
            <Maximize2 size={15} strokeWidth={2.8} className="text-slate-950 group-hover:rotate-12 transition-transform" />
            <span className="tracking-tight uppercase">Full Table</span>
          </button>
        )}

        {/* Feedback Button */}
        {!isFeedbackOpen && (
          <FeedbackButton
            onClick={() => setIsFeedbackOpen(true)}
            isOpen={false}
            inline
          />
        )}
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 sm:top-6 sm:right-6 z-50 max-w-md flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 text-slate-100 border border-cyan-500/50 shadow-[0_10px_35px_rgba(6,182,212,0.35)] backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-300"
        >
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <p className="text-xs sm:text-sm font-medium text-slate-100 leading-snug flex-1">
            {toastMessage}
          </p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 -mr-1 transition-colors cursor-pointer text-base leading-none"
            aria-label="Dismiss notification"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

export function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
