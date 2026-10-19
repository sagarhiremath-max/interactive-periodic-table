import { useState, useMemo, useEffect, useRef } from 'react';
import { ELEMENTS_DATA, type ElementData } from './data/elements';
import { Header } from './components/Header';
import { UnifiedControlBar } from './components/UnifiedControlBar';
import { LegendBar } from './components/LegendBar';
import { PeriodicTable } from './components/PeriodicTable';
import { ElementDetailPanel } from './components/ElementDetailPanel';
import { ElementTooltip } from './components/ElementTooltip';
import { CompareModal } from './components/CompareModal';
import { QuizModal } from './components/QuizModal';
import { ChemistryGuideModal } from './components/ChemistryGuideModal';
import { useFavorites } from './utils/useFavorites';
import type { TrendType } from './data/trends';

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

  // Periodic Trends State
  const [trendMode, setTrendMode] = useState<TrendType>('none');

  // Favorites Hook
  const { isFavorite, toggleFavorite, favoritesCount } = useFavorites();
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  // Modals & Panels
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [hoveredElement, setHoveredElement] = useState<ElementData | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Compare, Quiz & Guide modals
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareElement1, setCompareElement1] = useState<ElementData | null>(ELEMENTS_DATA[0]); // Hydrogen
  const [compareElement2, setCompareElement2] = useState<ElementData | null>(ELEMENTS_DATA[5]); // Carbon
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideInitialTab, setGuideInitialTab] = useState<'trends' | 'about'>('trends');

  const detailPanelRef = useRef<HTMLDivElement>(null);

  // Sync dark mode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Check for ?element= query param on mount (e.g. from Open in New Tab or direct link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
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
      }
    }
  }, []);

  // Close element detail modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedElement) {
        setSelectedElement(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement]);

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
    trendMode !== 'none' ||
    onlyFavorites ||
    Boolean(selectedElement) ||
    Math.round(temperatureKelvin) !== 293;

  const handleResetAll = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setActiveClassification('all');
    setSelectedBlock('all');
    setSelectedStateFilter('all');
    setTemperatureKelvin(293.15);
    setHoveredCategory(null);
    setTrendMode('none');
    setOnlyFavorites(false);
    setSelectedElement(null);
  };

  const handleClassificationChange = (c: 'all' | 'metals' | 'nonmetals' | 'metalloids' | 'halogens') => {
    setActiveClassification(c);
    setSelectedCategory(c);
    setOnlyFavorites(false);
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setActiveClassification('all');
    setOnlyFavorites(false);
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

  const handleOpenTrendExplanation = () => {
    setGuideInitialTab('trends');
    setIsGuideOpen(true);
  };

  const handleOpenGuide = () => {
    setGuideInitialTab('about');
    setIsGuideOpen(true);
  };

  return (
    <div
      className={`h-screen lg:h-[100dvh] flex flex-col overflow-y-auto lg:overflow-hidden font-sans transition-colors duration-200 select-none ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Main Header (Compact ~38-42px) */}
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
        onSelectElement={(el) => setSelectedElement(el)}
      />

      {/* Main Content Workspace: Fit in viewport on Desktop, natural scroll on mobile */}
      <main className="flex-1 min-h-0 flex flex-col max-w-[1780px] w-full mx-auto px-2 sm:px-4 py-1.5 gap-2 overflow-y-auto lg:overflow-hidden">
        {/* Unified 2-Tier Control Toolbar: Classification, Blocks, States, Trends, Temperature */}
        <UnifiedControlBar
          activeClassification={activeClassification}
          onSelectClassification={handleClassificationChange}
          activeBlock={selectedBlock}
          onSelectBlock={setSelectedBlock}
          activeStateFilter={selectedStateFilter}
          onSelectStateFilter={setSelectedStateFilter}
          onlyFavorites={onlyFavorites}
          onToggleOnlyFavorites={() => setOnlyFavorites((prev) => !prev)}
          favoritesCount={favoritesCount}
          trendMode={trendMode}
          onSelectTrend={setTrendMode}
          temperatureKelvin={temperatureKelvin}
          onTemperatureChange={setTemperatureKelvin}
          elements={ELEMENTS_DATA}
          darkMode={darkMode}
          onOpenTrendExplanation={handleOpenTrendExplanation}
          onOpenGuide={handleOpenGuide}
          hasActiveFilters={hasActiveFiltersOrSearch}
          onResetAll={handleResetAll}
        />

        {/* Workspace: Periodic Table (+ Legend) neatly fills the width without being squeezed */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden items-stretch w-full">
          {/* Core Periodic Table Matrix and Bottom Color Legend */}
          <div className="flex-1 min-w-0 h-full flex flex-col justify-between overflow-hidden gap-1.5">
            <div className="flex-1 min-h-0 h-full w-full overflow-hidden flex flex-col">
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
                trendMode={trendMode}
                onlyFavorites={onlyFavorites}
                isFavorite={isFavorite}
                onSelectElement={(el) => setSelectedElement(el)}
                onHoverElement={handleHoverElement}
                onSelectCategory={handleCategorySelect}
                onClearSearch={handleResetAll}
              />
            </div>

            {/* Compact Category Color Legend Bar (visible in standard category mode) */}
            {trendMode === 'none' && (
              <LegendBar
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
                hoveredCategory={hoveredCategory}
                onHoverCategory={setHoveredCategory}
                elements={ELEMENTS_DATA}
                darkMode={darkMode}
              />
            )}
          </div>
        </div>
      </main>

      {/* Element Information Modal Dialog Overlay (opens cleanly on top of periodic table) */}
      {selectedElement && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedElement.name} details`}
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 md:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedElement(null);
            }
          }}
        >
          <div
            ref={detailPanelRef}
            className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl h-[90vh] max-h-[820px] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-slate-700/80 animate-in zoom-in-95 duration-150 bg-slate-900"
          >
            <ElementDetailPanel
              element={selectedElement}
              darkMode={darkMode}
              temperatureKelvin={temperatureKelvin}
              isFavorite={isFavorite(selectedElement.number)}
              onToggleFavorite={toggleFavorite}
              onSelectElement={(el) => setSelectedElement(el)}
              onAddToCompare={handleAddToCompare}
              onClose={() => setSelectedElement(null)}
            />
          </div>
        </div>
      )}

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

      {/* Chemistry & Periodic Trends Guide Modal */}
      <ChemistryGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        initialTab={guideInitialTab}
        selectedTrend={trendMode}
        darkMode={darkMode}
      />
    </div>
  );
}

export default App;
