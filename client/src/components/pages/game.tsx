import { useCallback, useMemo, useState } from "react";
import { TabsContent, Thumbnail, TabValue, Empty } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { DiscoverScene } from "../scenes/discover";
import { LeaderboardScene } from "../scenes/leaderboard";
import { useNavigate } from "@tanstack/react-router";
import { Socials } from "@cartridge/arcade";
import { ArcadeTabs } from "../modules";
import { MarketplaceScene } from "../scenes/marketplace";
import { GuildsScene } from "../scenes/guild";
import { AboutScene } from "../scenes/about";
import GameSocials from "../modules/game-socials";
import { Editions } from "../editions";
import arcade from "@/assets/arcade-logo.png";
import { GameSocialWebsite } from "../modules/game-social";
import { useProject } from "@/hooks/project";
import { useDevice } from "@/hooks/device";

export function GamePage() {
  const { game, edition } = useProject();
  const { tab } = useProject();
  const { isMobile } = useDevice();
  const [showMarketplace, setShowMarketplace] = useState(false);

  const navigate = useNavigate();
  const handleClick = useCallback(
    (value: string) => {
      if (edition) {
        const gameName = game?.name.toLowerCase().replace(/ /g, "-") || game?.id.toString();
        const editionName = edition.name.toLowerCase().replace(/ /g, "-") || edition.id.toString();
        navigate({ to: `/game/${gameName}/edition/${editionName}/${value}` as any });
      } else if (game) {
        const gameName = game.name.toLowerCase().replace(/ /g, "-") || game.id.toString();
        navigate({ to: `/game/${gameName}/${value}` as any });
      } else {
        navigate({ to: `/${value}` as any });
      }
    },
    [navigate, game, edition],
  );

  const order: TabValue[] = useMemo(() => {
    if (!game) return ["activity", "leaderboard", "marketplace"];
    return ["activity", "leaderboard", "marketplace", "guilds", "about"];
  }, [game]);

  const defaultValue = useMemo(() => {
    if (!order.includes(tab as TabValue)) return "activity";
    return tab;
  }, [tab, order]);

  const socials = useMemo(() => {
    return Socials.merge(edition?.socials, game?.socials);
  }, [edition, game]);

  const isDashboard = !(edition && game);

  return (
    <>
      <div
        className={cn(
          "lg:h-[88px] w-full flex flex-col gap-4 lg:p-6 lg:pb-0 border-b border-background-200 lg:border-none",
          isDashboard ? "p-0" : "p-4",
        )}
      >
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex gap-4 items-center overflow-hidden",
              isDashboard && isMobile && "hidden",
            )}
          >
            <Thumbnail
              icon={edition?.properties.icon || game?.properties.icon || arcade}
              size="xl"
              className="min-w-16 min-h-16"
            />
            <div className="flex flex-col gap-2 overflow-hidden">
              <p
                className="font-semibold text-xl/[24px] text-foreground-100 truncate"
                onClick={() => setShowMarketplace(!showMarketplace)}
              >
                {game?.name || "Dashboard"}
              </p>
              <Editions />
            </div>
          </div>
          <GameSocials socials={socials} />
        </div>
        <div className={cn("lg:hidden", !socials?.website && "hidden")}>
          <GameSocialWebsite website={socials?.website || ""} label />
        </div>
      </div>
      <ArcadeTabs
        order={order}
        defaultValue={defaultValue as TabValue}
        onTabClick={(tab: TabValue) => handleClick(tab)}
      >
        <div
          className="flex justify-center gap-8 w-full h-full overflow-y-scroll"
          style={{ scrollbarWidth: "none" }}
        >
          <TabsContent
            className="p-0 px-3 lg:px-6 mt-0 grow w-full"
            value="activity"
          >
            <DiscoverScene />
          </TabsContent>
          <TabsContent
            className="p-0 px-3 lg:px-6 mt-0 grow w-full"
            value="leaderboard"
          >
            <LeaderboardScene />
          </TabsContent>
          <TabsContent
            className="p-0 px-3 lg:px-6 mt-0 grow w-full"
            value="marketplace"
          >
            {showMarketplace ? (
              <MarketplaceScene />
            ) : (
              <Empty
                title="Coming soon"
                icon="inventory"
                className="h-full py-3 lg:py-6"
              />
            )}
          </TabsContent>
          <TabsContent
            className="p-0 px-3 lg:px-6 mt-0 grow w-full"
            value="guilds"
          >
            <GuildsScene />
          </TabsContent>
          <TabsContent
            className="p-0 px-3 lg:px-6 mt-0 grow w-full"
            value="about"
          >
            <AboutScene />
          </TabsContent>
        </div>
      </ArcadeTabs>
    </>
  );
}
