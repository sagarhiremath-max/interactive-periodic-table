import { useState, useMemo, useEffect, useRef } from 'react';
import { ELEMENTS_DATA, type ElementData, CATEGORIES } from './data/elements';
import { Header } from './components/Header';
import { UnifiedControlBar } from './components/UnifiedControlBar';
import { LegendBar } from './components/LegendBar';
import { PeriodicTable } from './components/PeriodicTable';
import { ElementDetailPanel } from './components/ElementDetailPanel';
import { ElementTooltip } from './components/ElementTooltip';
import { CompareModal } from './components/CompareModal';
import { QuizModal } from './components/QuizModal';
import { ChemistryGuideModal } from './components/ChemistryGuideModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(ELEMENTS_DATA[0]); // Start with Hydrogen
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

  const handleMobileStep = (direction: 'prev' | 'next') => {
    if (!selectedElement) return;
    const currentNum = selectedElement.number;
    const nextIdx =
      direction === 'prev'
        ? currentNum > 1
          ? currentNum - 2
          : 117
        : currentNum < 118
        ? currentNum
        : 0;
    setSelectedElement(ELEMENTS_DATA[nextIdx]);
  };

  const mobileCat = selectedElement
    ? CATEGORIES[selectedElement.category] || CATEGORIES['unknown']
    : CATEGORIES['unknown'];

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
        />

        {/* Workspace: Left = Periodic Table (+ Legend), Right = Selected Element Details Panel */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3 overflow-hidden items-stretch w-full pb-16 lg:pb-0">
          {/* LEFT SIDE: Core Periodic Table Matrix and Bottom Color Legend */}
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
                onClearSearch={() => setSearchQuery('')}
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

          {/* RIGHT SIDE: Dedicated Element Information Panel with internal slide scrolling */}
          <aside
            id="element-detail-panel"
            ref={detailPanelRef}
            className="w-full lg:w-[335px] xl:w-[365px] 2xl:w-[395px] h-full flex flex-col min-h-0 shrink-0"
          >
            <ElementDetailPanel
              element={selectedElement}
              darkMode={darkMode}
              temperatureKelvin={temperatureKelvin}
              isFavorite={selectedElement ? isFavorite(selectedElement.number) : false}
              onToggleFavorite={toggleFavorite}
              onSelectElement={(el) => setSelectedElement(el)}
              onAddToCompare={handleAddToCompare}
            />
          </aside>
        </div>
      </main>

      {/* Mobile Floating Quick-Selection Dock (Visible only on mobile devices) */}
      {selectedElement && (
        <div className="fixed bottom-3 left-3 right-3 z-30 lg:hidden p-2 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center justify-between gap-2 bg-slate-900/95 border-cyan-500/40 text-white animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-9 h-9 rounded-xl font-bold flex flex-col items-center justify-center shrink-0 border shadow-xs"
              style={{
                backgroundColor: `${mobileCat.color}25`,
                borderColor: mobileCat.color,
                color: mobileCat.color,
              }}
            >
              <span className="text-[7.5px] opacity-75 font-mono">{selectedElement.number}</span>
              <span className="text-xs font-black leading-none">{selectedElement.symbol}</span>
            </div>

            <div className="min-w-0 truncate">
              <span className="text-xs font-bold block truncate leading-tight">{selectedElement.name}</span>
              <span className="text-[9.5px] text-slate-400 block font-mono truncate">
                {selectedElement.atomicMass} u • {selectedElement.categoryName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => handleMobileStep('prev')}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300"
              title="Previous element"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => handleMobileStep('next')}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300"
              title="Next element"
            >
              <ChevronRight size={15} />
            </button>
            <button
              type="button"
              onClick={() => {
                detailPanelRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-2.5 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-xs ml-1"
            >
              Details ↓
            </button>
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
