import { cn } from "@cartridge/ui";
import { BuySection } from "../vault/buy-section";
import { MarketChart } from "../vault/chart";

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
  return (
    <div className={cn("w-full flex flex-col gap-4 lg:p-6 lg:pb-0 p-4")}>
      <MarketChart players={players} />

      <BuySection />
    </div>
  );
}
