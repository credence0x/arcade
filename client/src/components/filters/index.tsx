import {
  MarketplaceFilters,
  MarketplaceHeader,
  MarketplaceHeaderReset,
  MarketplacePropertyFilter,
  MarketplacePropertyHeader,
  MarketplaceRadialItem,
  MarketplaceSearchEngine,
} from "@cartridge/ui";
import { useMetadataFilters } from "@cartridge/marketplace";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useFilters, BUY_NOW, SHOW_ALL } from "@/context/filter";

export const Filters = () => {
  const [search, setSearch] = useState<{ [key: string]: string }>({});
  const params = useParams();

  const { onFilterChange, active, setActive } = useFilters();

  const {
    statistics,
    toggleTrait,
    clearFilters,
    isTraitSelected,
  } = useMetadataFilters(params.collection ?? "", import.meta.env.VITE_IDENTITY, onFilterChange);

  return (
    <MarketplaceFilters className="h-full w-[calc(100vw-64px)] max-w-[360px] lg:flex lg:min-w-[360px] overflow-hidden">
      <MarketplaceHeader label="Status" />
      <div className="flex flex-col gap-2 w-fit">
        <MarketplaceRadialItem
          label="Buy Now"
          active={active === "buy-now"}
          onClick={() => setActive(BUY_NOW)}
        />
        <MarketplaceRadialItem
          label="Show All"
          active={active === "show-all"}
          onClick={() => setActive(SHOW_ALL)}
        />
      </div>
      <MarketplaceHeader label="Properties">
        {clearFilters && <MarketplaceHeaderReset onClick={clearFilters} />}
      </MarketplaceHeader>
      {statistics.map(({ traitType, values }) => {
        return (
          <MarketplacePropertyHeader key={traitType} label={traitType} count={values.length}>
            <MarketplaceSearchEngine
              variant="darkest"
              search={search[traitType] || ""}
              setSearch={(value: string) =>
                setSearch((prev) => ({ ...prev, [traitType]: value }))
              }
            />
            <div className="flex flex-col gap-px">
              {values.map(({ value, count }) => (
                <MarketplacePropertyFilter
                  key={`${value}-${count}`}
                  label={value}
                  count={count}
                  value={isTraitSelected(traitType, value) || false}
                  setValue={() =>
                    toggleTrait(traitType, value)
                  }
                />
              ))}
            </div>
          </MarketplacePropertyHeader>
        )
      })}
    </MarketplaceFilters >
  );
};
