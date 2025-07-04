import { type TokenMetadataUI } from "@cartridge/marketplace";
import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useState } from "react";

export const MetadataFilterContext = createContext<MetadataFilterContextType | null>(null);
export type MetadataFilterContextType = {
  tokenIds: string[];
  setTokenIds: Dispatch<SetStateAction<string[]>>;
  active: CollectionFilter;
  setActive: Dispatch<SetStateAction<CollectionFilter>>;
}
export const BUY_NOW = "buy-now";
export const SHOW_ALL = "show-all";

export function useFilters() {
  const ctx = useContext(MetadataFilterContext);

  if (null === ctx) {
    throw new Error('useFilters must be used inside a MetadataFilterProvider');
  }

  const { tokenIds, setTokenIds, active, setActive } = ctx

  const onFilterChange = useCallback((tokenIds: TokenMetadataUI[]) => {
    setTokenIds(tokenIds.map(t => t.tokenId));
  }, []);

  return { onFilterChange, tokenIds, active, setActive };
}

type CollectionFilter = typeof SHOW_ALL | typeof BUY_NOW;

export function MetadataFilterProvider({ children }: { children: ReactNode }) {
  const [tokenIds, setTokenIds] = useState<string[]>([]);
  const [active, setActive] = useState<CollectionFilter>(SHOW_ALL);

  return (
    <MetadataFilterContext.Provider value={{
      tokenIds, setTokenIds, active, setActive
    }}>
      {children}
    </MetadataFilterContext.Provider>
  )
}
