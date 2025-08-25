import { CollectibleCard, Empty, Skeleton } from "@cartridge/ui";
import { useEffect, useMemo, useState } from "react";
import { useAddress } from "@/hooks/address";
import { getChecksumAddress } from "starknet";
import { OrderModel, StatusType } from "@cartridge/marketplace";
import { useMarketplace } from "@/hooks/marketplace";
import { useMarketCollections } from "@/hooks/market-collections";
import { Token } from "@dojoengine/torii-wasm";
import { useProject } from "@/hooks/project";
import { Link } from "@tanstack/react-router";
import { MetadataHelper } from "@/helpers/metadata";
import { EditionModel, GameModel } from "@cartridge/arcade";
import placeholder from "@/assets/placeholder.svg";
import { useGamesQuery, useEditionsQuery } from "@/queries/games";
import { constants } from "starknet";
// New TanStack Query imports (commented out until fully integrated)
// import { useOrdersQuery, useSalesQuery, useMarketplaceSubscription } from "@/queries/marketplace";

export const Marketplace = () => {
  // Use suspense queries for games and editions - data is guaranteed
  const { data: games = [] } = useGamesQuery(constants.StarknetChainId.SN_MAIN);
  const { data: editions = [] } = useEditionsQuery(constants.StarknetChainId.SN_MAIN);

  // Keep collections from context (depends on Torii clients)
  const { collections } = useMarketCollections();
  const { edition } = useProject();

  // New TanStack Query usage example (uncomment to use):
  /*
  // Get orders for specific collections
  const collectionIds = useMemo(() => 
    Object.keys(collections || {}), [collections]);
  
  // Query orders for each collection
  const ordersQueries = collectionIds.map(collectionId => 
    useOrdersQuery(collectionId));
  
  // Setup real-time subscriptions
  useMarketplaceSubscription({
    collection: edition?.config.collection,
    onOrder: (order) => {
      // Handle new orders
    },
    onSale: (sale) => {
      // Handle new sales
    }
  });
  
  // Get sales history
  const { data: salesData } = useSalesQuery(edition?.config.collection || '', 50);
  */

  const fileteredCollections: (Token & { count: number; project: string })[] =
    useMemo(() => {
      const data = Object.entries(collections).flatMap(
        ([project, collection]) => {
          return Object.entries(collection).map(([address, token]) => {
            return {
              ...token,
              contract_address: getChecksumAddress(address),
              count: (token as Token & { count: number }).count,
              project,
            };
          });
        },
      );
      if (!edition) return data;
      return data.filter(
        (collection) => collection.project === edition.config.project,
      );
    }, [collections, edition]);

  // Render immediately with loading state if needed
  return (
    <div
      className="py-6 grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 place-items-center select-none overflow-y-scroll"
      style={{ scrollbarWidth: "none" }}
    >
      {!collections ? (
        <LoadingState />
      ) : fileteredCollections.length === 0 ? (
        <EmptyState />
      ) : (
        fileteredCollections.map((collection) => (
          <Item
            key={`${collection.project}-${collection.contract_address}`}
            project={collection.project}
            collection={collection}
            editions={editions}
            games={games}
          />
        ))
      )}
    </div>
  );
};

function Item({
  project,
  collection,
  editions,
  games,
}: {
  project: string;
  collection: Token & { count: number };
  editions: EditionModel[];
  games: GameModel[];
}) {
  const { isSelf } = useAddress();
  // TODO: Replace with new TanStack Query implementation below
  const { orders } = useMarketplace();
  const [image, setImage] = useState<string>(placeholder);

  // New TanStack Query usage example (uncomment to use):
  /*
  const { data: ordersData, isLoading } = useOrdersQuery(collection.contract_address);
  const orders = ordersData?.orders || {};
  */


  const listingCount = useMemo(() => {
    const collectionOrders = orders[collection.contract_address];
    if (!collectionOrders) return 0;
    const tokenOrders = Object.entries(collectionOrders).reduce(
      (acc, [token, orders]) => {
        if (Object.values(orders).length === 0) return acc;
        acc[token] = Object.values(orders).filter(
          (order) => !!order && order.status.value === StatusType.Placed,
        );
        return acc;
      },
      {} as { [token: string]: OrderModel[] },
    );
    return Object.values(tokenOrders).length;
  }, [collection, orders]);

  const { game, edition } = useMemo(() => {
    if (!project) return { game: null, edition: null };
    const edition = editions.find(
      (edition) => edition.config.project === project,
    );
    if (!edition) return { game: null, edition: null };
    const game = games.find((game) => game.id === edition.gameId);
    return { game, edition };
  }, [project, editions, games]);

  useEffect(() => {
    const fetchImage = async () => {
      const toriiImage = await MetadataHelper.getToriiImage(
        project,
        collection,
      );
      if (toriiImage) {
        setImage(toriiImage);
        return;
      }
      const metadataImage = await MetadataHelper.getMetadataImage(collection);
      if (metadataImage) {
        setImage(metadataImage);
        return;
      }
    };
    fetchImage();
  }, [collection, project]);

  const navigationLink = useMemo(() => {
    const gameName = game?.name.replace(/ /g, "-").toLowerCase();
    const editionName = edition?.name.replace(/ /g, "-").toLowerCase();
    const collectionAddress = collection.contract_address.toLowerCase();
    if (game && edition) {
      return `/game/${gameName}/edition/${editionName}/collection/${collectionAddress}`;
    }
    if (game) {
      return `/game/${gameName}/collection/${collectionAddress}`;
    }
    return `/collection/${collectionAddress}`;

  }, [edition, game, collection])

  return (
    <div className="w-full group select-none">
      <Link to={navigationLink}>
        <CollectibleCard
          title={collection.name}
          image={image}
          totalCount={collection.count}
          listingCount={listingCount}
          onClick={undefined}
          lastSale="--"
          className={
            isSelf ? "cursor-pointer" : "cursor-default pointer-events-none"
          }
        />
      </Link>
    </div>
  );
}

const LoadingState = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 place-items-center select-none">
      <Skeleton className="w-full h-[164px] rounded" />
      <Skeleton className="w-full h-[164px] rounded" />
      <Skeleton className="hidden lg:block w-full h-[164px] rounded" />
    </div>
  );
};

const EmptyState = () => {
  return (
    <Empty
      title="No related collections"
      icon="inventory"
      className="h-full py-3 lg:py-6"
    />
  );
};
