import {
  Empty,
  LayoutContent,
  Skeleton,
  TabsContent,
} from "@cartridge/ui-next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useArcade } from "@/hooks/arcade";
import { EditionModel } from "@bal7hazar/arcade-sdk";
import { Connect } from "../errors";
import { addAddressPadding, getChecksumAddress } from "starknet";
import { ArcadeDiscoveryGroup } from "../modules/discovery-group";
import { useNavigate, useSearchParams } from "react-router-dom";
import ArcadeSubTabs, { SubTabValue } from "../modules/sub-tabs";
import { useAccount } from "@starknet-react/core";
import { useActivities } from "@/hooks/activities";
import { UserAvatar } from "../user/avatar";

type Events = {
  all: {
    identifier: string;
    name: string;
    address: string;
    Icon: React.ReactNode;
    data: {
      title: string;
      label: string;
      icon: string;
      count: number;
    };
    timestamp: number;
    logo: string | undefined;
    color: string;
    onClick: () => void;
  }[];
  following: {
    identifier: string;
    name: string;
    address: string;
    Icon: React.ReactNode;
    data: {
      title: string;
      label: string;
      icon: string;
      count: number;
    };
    timestamp: number;
    logo: string | undefined;
    color: string;
    onClick: () => void;
  }[];
};

export function Discover({ edition }: { edition?: EditionModel }) {
  const [events, setEvents] = useState<Events>({
    all: [],
    following: [],
  });
  const [searchParams] = useSearchParams();
  const { isConnected, address } = useAccount();
  const {
    aggregatedActivities,
    usernames: activitiesUsernames,
    status: activitiesStatus,
  } = useActivities();
  const { editions, follows } = useArcade();

  const following = useMemo(() => {
    if (!address) return [];
    const addresses = follows[getChecksumAddress(address)] || [];
    if (addresses.length === 0) return [];
    return [...addresses, getChecksumAddress(address)];
  }, [follows, address]);

  const filteredEditions = useMemo(() => {
    return !edition ? editions : [edition];
  }, [editions, edition]);

  const navigate = useNavigate();
  const handleClick = useCallback(
    (gameId: number, editionId: number, address: string) => {
      // If there are several games displayed, then clicking a card link to the game
      const url = new URL(window.location.href);
      if (filteredEditions.length > 1) {
        url.searchParams.set("game", gameId.toString());
        url.searchParams.set("edition", editionId.toString());
        navigate(url.toString().replace(window.location.origin, ""));
        return;
      }
      // Otherwise it links to the player
      url.searchParams.set("address", address);
      url.searchParams.set("playerTab", "activity");
      navigate(url.toString().replace(window.location.origin, ""));
    },
    [navigate, filteredEditions],
  );

  const defaultValue = useMemo(() => {
    // Default tab is ignored if there is no address,
    // meanning the user is not connected and doesnt inspect another user
    return searchParams.get("subTab") || "all";
  }, [searchParams]);

  const handleTabClick = useCallback(
    (value: string) => {
      // Clicking on a tab updates the url param tab to the value of the tab
      // So the tab is persisted in the url and the user can update and share the url
      const url = new URL(window.location.href);
      url.searchParams.set("subTab", value);
      navigate(url.toString().replace(window.location.origin, ""));
    },
    [navigate],
  );

  useEffect(() => {
    if (!filteredEditions) return;
    if (!Object.entries(aggregatedActivities)) return;
    if (!Object.entries(activitiesUsernames)) return;
    const data = filteredEditions
      .flatMap((edition) => {
        const activities =
          aggregatedActivities[edition?.config.project]?.map((activity) => {
            const username =
              activitiesUsernames[addAddressPadding(activity.callerAddress)];
            if (!username) return null;
            const count = activity.count;
            return {
              identifier: activity.identifier,
              name: username,
              address: getChecksumAddress(activity.callerAddress),
              Icon: <UserAvatar username={username} size="sm" />,
              data: {
                title: count > 1 ? `Actions` : activity.entrypoint,
                label: "performed",
                icon: "fa-wave-pulse",
                count,
              },
              timestamp: Math.floor(activity.timestamp / 1000),
              logo: edition.properties.icon,
              color: edition.color,
              onClick: () =>
                handleClick(
                  edition.gameId,
                  edition.id,
                  getChecksumAddress(activity.callerAddress),
                ),
            };
          }) || [];
        return [...activities].filter((item) => item !== null);
      })
      .sort((a, b) => b.timestamp - a.timestamp);
    if (!data) return;
    const newEvents: Events = {
      all: data.slice(0, 100),
      following: data
        .filter((event) => following.includes(event.address))
        .slice(0, 100),
    };
    if (newEvents.all.length === 0) return;
    setEvents(newEvents);
  }, [
    aggregatedActivities,
    filteredEditions,
    activitiesUsernames,
    following,
    handleClick,
  ]);

  return (
    <LayoutContent className="select-none h-full overflow-clip p-0">
      <div
        className="p-0 pt-3 lg:pt-6 mt-0 h-full overflow-y-scroll"
        style={{ scrollbarWidth: "none" }}
      >
        <ArcadeSubTabs
          tabs={["all", "following"]}
          defaultValue={defaultValue as SubTabValue}
          onTabClick={(tab: SubTabValue) => handleTabClick(tab)}
          className="mb-3 lg:mb-4"
        >
          <div
            className="flex justify-center gap-8 w-full h-full overflow-y-scroll"
            style={{ scrollbarWidth: "none" }}
          >
            <TabsContent className="p-0 mt-0 grow w-full" value="all">
              {activitiesStatus === "error" ? (
                <EmptyState />
              ) : activitiesStatus === "loading" && events.all.length === 0 ? (
                <LoadingState />
              ) : (
                <div className="pb-6">
                  <ArcadeDiscoveryGroup events={events.all} rounded />
                </div>
              )}
            </TabsContent>
            <TabsContent className="pb-0 mt-0 grow w-full" value="following">
              {!isConnected ? (
                <Connect />
              ) : activitiesStatus === "error" ||
                following.length === 0 ||
                events.following.length === 0 ? (
                <EmptyState />
              ) : activitiesStatus === "loading" &&
                events.following.length === 0 ? (
                <LoadingState />
              ) : (
                <div className="pb-6">
                  <ArcadeDiscoveryGroup events={events.following} rounded />
                </div>
              )}
            </TabsContent>
          </div>
        </ArcadeSubTabs>
      </div>
    </LayoutContent>
  );
}

const LoadingState = () => {
  return (
    <div className="flex flex-col gap-y-px overflow-hidden h-full">
      {Array.from({ length: 20 }).map((_, index) => (
        <Skeleton key={index} className="min-h-11 w-full" />
      ))}
    </div>
  );
};

const EmptyState = () => {
  return (
    <Empty
      title="It's feel lonely here"
      icon="discover"
      className="h-full pb-6"
    />
  );
};
