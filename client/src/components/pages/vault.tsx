import { cn } from "@cartridge/ui";
import { BuySection, MarketChart, VaultTabs } from "../vault";
import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { joinPaths } from "@/helpers";
import { TabValue } from "../modules";
import { VaultHeader } from "../vault/header";

export interface Player {
  name: string;
  color: string;
  baseValue: number; // Base percentage value around which to randomize
  variance: number; // Amount of randomization (+/-)
}

export interface VaultPageProps {
  players?: Player[];
}

export function VaultPage({ players }: VaultPageProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabClick = useCallback(
    (value: string) => {
      let pathname = location.pathname;
      pathname = pathname.replace(/\/tab\/.*$/, "");
      pathname = joinPaths(pathname, `/tab/${value}`);
      navigate(pathname || "/");
    },
    [location, navigate],
  );

  const defaultValue = useMemo(() => {
    const pathname = location.pathname;
    const tabMatch = pathname.match(/\/tab\/([^/]+)/);
    if (tabMatch) {
      const tab = tabMatch[1] as TabValue;
      if (
        [
          "vault-activity",
          "vault-holders",
          "vault-comments",
          "vault-positions",
        ].includes(tab)
      ) {
        return tab;
      }
    }
    return "vault-activity";
  }, [location]);

  return (
    <div
      className={cn("gap-4 overflow-y-scroll")}
      style={{ scrollbarWidth: "none" }}
    >
      <div className="w-full flex flex-col gap-4 lg:p-6 lg:pb-0 p-4">
        <VaultHeader />

        <MarketChart players={players} />

        <BuySection />
      </div>

      <VaultTabs
        defaultValue={defaultValue as TabValue}
        onTabClick={handleTabClick}
      />
    </div>
  );
}
