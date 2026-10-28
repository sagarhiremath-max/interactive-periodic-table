import { useState, useEffect, useCallback } from 'react';

const RECENT_KEY = 'chemistry_explorer_recent_elements';
const EXPLORED_KEY = 'chemistry_explorer_explored_elements';

export function useRecentElements() {
  const [recentNumbers, setRecentNumbers] = useState<number[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(RECENT_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed.filter((n): n is number => typeof n === 'number' && n >= 1 && n <= 118).slice(0, 8);
          }
        }
      }
    } catch (e) {
      console.warn('Could not read recent elements:', e);
    }
    // Default starter elements: Hydrogen, Carbon, Nitrogen, Oxygen, Iron, Gold
    return [1, 6, 7, 8, 26, 79];
  });

  const [exploredSet, setExploredSet] = useState<Set<number>>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(EXPLORED_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return new Set(parsed.filter((n): n is number => typeof n === 'number' && n >= 1 && n <= 118));
          }
        }
      }
    } catch (e) {
      console.warn('Could not read explored elements:', e);
    }
    return new Set([1, 6, 7, 8, 26, 79]);
  });

  // Sync recent to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(recentNumbers));
      }
    } catch (e) {
      console.warn('Could not save recent elements:', e);
    }
  }, [recentNumbers]);

  // Sync explored to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(EXPLORED_KEY, JSON.stringify(Array.from(exploredSet)));
      }
    } catch (e) {
      console.warn('Could not save explored elements:', e);
    }
  }, [exploredSet]);

  const addViewedElement = useCallback((atomicNumber: number) => {
    if (atomicNumber < 1 || atomicNumber > 118) return;

    setRecentNumbers((prev) => {
      const filtered = prev.filter((n) => n !== atomicNumber);
      return [atomicNumber, ...filtered].slice(0, 8);
    });

    setExploredSet((prev) => {
      const next = new Set(prev);
      next.add(atomicNumber);
      return next;
    });
  }, []);

  const exploredCount = exploredSet.size;
  const progressPercentage = Math.min(100, Math.round((exploredCount / 118) * 100));

  return {
    recentNumbers,
    exploredCount,
    progressPercentage,
    addViewedElement,
  };
}
