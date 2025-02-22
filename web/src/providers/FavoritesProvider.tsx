import { createContext, useContext, ReactNode } from 'react';
import { useFavorites } from '@/hooks/useFavorites';

const FavoritesContext = createContext<ReturnType<typeof useFavorites> | null>(
  null
);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const favoritesState = useFavorites();

  return (
    <FavoritesContext.Provider value={favoritesState}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useGlobalFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error(
      'useGlobalFavorites must be used within a FavoritesProvider'
    );
  }
  return context;
}
