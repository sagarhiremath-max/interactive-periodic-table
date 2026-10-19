import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'chemistry_explorer_favorite_elements';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return new Set(parsed.filter((n): n is number => typeof n === 'number' && n >= 1 && n <= 118));
          }
        }
      }
    } catch (e) {
      console.warn('Could not read favorites from localStorage:', e);
    }
    // Default favorites for quick start: Carbon, Gold, Hydrogen
    return new Set([1, 6, 79]);
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)));
      }
    } catch (e) {
      console.warn('Could not save favorites to localStorage:', e);
    }
  }, [favorites]);

  const toggleFavorite = useCallback((atomicNumber: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(atomicNumber)) {
        next.delete(atomicNumber);
      } else {
        next.add(atomicNumber);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (atomicNumber: number) => favorites.has(atomicNumber),
    [favorites]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    favoritesCount: favorites.size,
  };
}
