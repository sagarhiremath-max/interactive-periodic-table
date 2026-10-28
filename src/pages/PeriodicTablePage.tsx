import React, { useState, useRef } from 'react';
import { ELEMENTS_DATA, type ElementData } from '../data/elements';
import { HeroSection } from '../components/HeroSection';
import { CategoryLegend } from '../components/CategoryLegend';
import { FilterControls } from '../components/FilterControls';
import { PeriodicTable } from '../components/PeriodicTable';
import { ElementTooltip } from '../components/ElementTooltip';
import { ElementModal } from '../components/ElementModal';
import { FitTableView } from '../components/FitTableView';
import type { TrendType } from '../data/trends';
import { Maximize2 } from 'lucide-react';

interface PeriodicTablePageProps {
  darkMode: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  activeClassification: 'all' | 'metals' | 'nonmetals' | 'metalloids';
  setActiveClassification: (c: 'all' | 'metals' | 'nonmetals' | 'metalloids') => void;
  activeStateFilter: 'all' | 'solid' | 'liquid' | 'gas';
  setActiveStateFilter: (s: 'all' | 'solid' | 'liquid' | 'gas') => void;
  atomicRange: [number, number];
  setAtomicRange: (r: [number, number]) => void;
  temperatureKelvin: number;
  setTemperatureKelvin: (t: number) => void;
  trendMode: TrendType;
  setTrendMode: (m: TrendType) => void;
  layoutMode: 'standard' | 'extended';
  setLayoutMode: React.Dispatch<React.SetStateAction<'standard' | 'extended'>>;
  onlyFavorites: boolean;
  setOnlyFavorites: (f: boolean) => void;
  isFavorite: (num: number) => boolean;
  onToggleFavorite: (num: number) => void;
  selectedElement: ElementData | null;
  onSelectElement: (element: ElementData | null) => void;
  hoveredElement: ElementData | null;
  hoveredCategory: string | null;
  setHoveredCategory: (cat: string | null) => void;
  tooltipPos: { x: number; y: number } | null;
  handleHoverElement: (el: ElementData | null, e?: React.MouseEvent<HTMLDivElement>) => void;
  handleResetFilters: () => void;
  hasActiveFilters: boolean;
  onOpenQuiz: () => void;
  onOpenCompare: (el1?: ElementData, el2?: ElementData) => void;
  isFitViewOpen?: boolean;
  setIsFitViewOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  isModalOpen?: boolean;
  setIsModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PeriodicTablePage: React.FC<PeriodicTablePageProps> = ({
  darkMode,
  searchQuery,
  setSearchQuery: _setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  activeClassification,
  setActiveClassification,
  activeStateFilter,
  setActiveStateFilter,
  atomicRange,
  setAtomicRange,
  temperatureKelvin,
  setTemperatureKelvin,
  trendMode,
  setTrendMode,
  layoutMode,
  setLayoutMode,
  onlyFavorites,
  setOnlyFavorites: _setOnlyFavorites,
  isFavorite,
  selectedElement,
  onSelectElement,
  hoveredElement,
  hoveredCategory,
  setHoveredCategory,
  tooltipPos,
  handleHoverElement,
  handleResetFilters,
  hasActiveFilters,
  onOpenQuiz,
  onOpenCompare,
  isFitViewOpen: externalFitViewOpen,
  setIsFitViewOpen: setExternalFitViewOpen,
  isModalOpen: externalModalOpen,
  setIsModalOpen: setExternalModalOpen,
}) => {
  const [internalModalOpen, setInternalModalOpen] = useState<boolean>(false);
  const modalOpen = externalModalOpen !== undefined ? externalModalOpen : internalModalOpen;
  const setModalOpen = setExternalModalOpen || setInternalModalOpen;

  const [internalFitViewOpen, setInternalFitViewOpen] = useState<boolean>(false);
  const periodicTableRef = useRef<HTMLDivElement>(null);

  const fitViewOpen = externalFitViewOpen !== undefined ? externalFitViewOpen : internalFitViewOpen;
  const handleOpenFitView = () => {
    if (setExternalFitViewOpen) {
      setExternalFitViewOpen(true);
    } else {
      setInternalFitViewOpen(true);
    }
  };
  const handleCloseFitView = () => {
    if (setExternalFitViewOpen) {
      setExternalFitViewOpen(false);
    } else {
      setInternalFitViewOpen(false);
    }
  };

  const scrollToTable = () => {
    periodicTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // When clicking any element: select it and open the small page modal to show all information
  const handleSelectElementAndOpenModal = (element: ElementData) => {
    onSelectElement(element);
    setModalOpen(true);
  };

  const handlePickRandomElement = () => {
    const randomIdx = Math.floor(Math.random() * ELEMENTS_DATA.length);
    const randomEl = ELEMENTS_DATA[randomIdx];
    handleSelectElementAndOpenModal(randomEl);
  };

  return (
    <main className="flex-1 max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-5 animate-in fade-in duration-300">
      {/* 1. Hero Section */}
      <HeroSection
        darkMode={darkMode}
        onExploreTable={scrollToTable}
        onOpenQuiz={onOpenQuiz}
        onOpenCompare={() => onOpenCompare()}
        onPickRandomElement={handlePickRandomElement}
        totalElementsCount={ELEMENTS_DATA.length}
        onOpenFitView={handleOpenFitView}
      />

      {/* 2. Top Toolbar: Category Filters, Physical State, and Control Bar */}
      <section className="space-y-3" id="filters-center">
        {/* Category Legend & Instant Category Toggling */}
        <CategoryLegend
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          hoveredCategory={hoveredCategory}
          onHoverCategory={setHoveredCategory}
          elements={ELEMENTS_DATA}
          darkMode={darkMode}
        />

        {/* Multi-Criteria Filters Bar */}
        <FilterControls
          activeClassification={activeClassification}
          onSelectClassification={setActiveClassification}
          activeStateFilter={activeStateFilter}
          onSelectStateFilter={setActiveStateFilter}
          atomicRange={atomicRange}
          onAtomicRangeChange={setAtomicRange}
          trendMode={trendMode}
          onSelectTrend={setTrendMode}
          layoutMode={layoutMode}
          onToggleLayout={() =>
            setLayoutMode((prev) => (prev === 'standard' ? 'extended' : 'standard'))
          }
          temperatureKelvin={temperatureKelvin}
          onTemperatureChange={setTemperatureKelvin}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          onOpenFitView={handleOpenFitView}
        />
      </section>

      {/* 3. Full-Width Interactive Periodic Table Grid Directly Below Toolbar */}
      <section
        ref={periodicTableRef}
        className="rounded-2xl border border-cyan-500/20 bg-slate-900/40 backdrop-blur-xl p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        id="periodic-table-matrix"
      >
        <div className="w-full">
          <PeriodicTable
            elements={ELEMENTS_DATA}
            selectedElement={selectedElement}
            hoveredElement={hoveredElement}
            hoveredCategory={hoveredCategory}
            selectedCategory={selectedCategory}
            activeClassification={activeClassification}
            activeStateFilter={activeStateFilter}
            atomicRange={atomicRange}
            searchQuery={searchQuery}
            layoutMode={layoutMode}
            temperatureKelvin={temperatureKelvin}
            darkMode={darkMode}
            trendMode={trendMode}
            onlyFavorites={onlyFavorites}
            isFavorite={isFavorite}
            onSelectElement={handleSelectElementAndOpenModal}
            onHoverElement={handleHoverElement}
            onSelectCategory={setSelectedCategory}
            onResetAllFilters={handleResetFilters}
            onOpenFitView={handleOpenFitView}
          />
        </div>
      </section>

      {/* Floating Hover Tooltip */}
      <ElementTooltip
        element={hoveredElement}
        position={tooltipPos}
        temperatureKelvin={temperatureKelvin}
        darkMode={darkMode}
      />

      {/* Complete Periodic Table Fitted to Screen Without Scrolling */}
      <FitTableView
        isOpen={fitViewOpen}
        onClose={handleCloseFitView}
        elements={ELEMENTS_DATA}
        selectedElement={selectedElement}
        onSelectElement={handleSelectElementAndOpenModal}
        darkMode={darkMode}
        temperatureKelvin={temperatureKelvin}
      />

      {/* Small Page Modal Overlay displaying all information */}
      <ElementModal
        element={selectedElement}
        isOpen={modalOpen}
        darkMode={darkMode}
        temperatureKelvin={temperatureKelvin}
        onClose={() => setModalOpen(false)}
        onSelectElement={(el) => {
          onSelectElement(el);
        }}
        onAddToCompare={(el) => onOpenCompare(el, ELEMENTS_DATA[5])}
      />

      {/* Floating Highlighted Button: Always visible on screen as user scrolls */}
      {!fitViewOpen && !modalOpen && (
        <aside aria-label="Quick Actions" className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            type="button"
            onClick={handleOpenFitView}
            className="group flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 text-slate-950 font-black text-xs sm:text-sm shadow-[0_10px_35px_rgba(6,182,212,0.65)] hover:shadow-[0_15px_45px_rgba(6,182,212,0.9)] border-2 border-cyan-100 ring-4 ring-cyan-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Click to view complete periodic table without scrolling"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-950"></span>
            </span>
            <Maximize2 size={18} strokeWidth={2.8} className="text-slate-950 group-hover:rotate-12 transition-transform" />
            <span className="tracking-tight uppercase">Full Table (No Scroll)</span>
          </button>
        </aside>
      )}
    </main>
  );
};
