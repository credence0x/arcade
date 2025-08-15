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
import { useArcade } from "@/hooks/arcade";
import { EditionModel, GameModel } from "@cartridge/arcade";
import placeholder from "@/assets/placeholder.svg";

export const Marketplace = () => {
  const { collections } = useMarketCollections();
  const { editions, games } = useArcade();
  const { edition } = useProject();

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

  if (!collections) {
    return <LoadingState />;
  }

  if (!!collections && fileteredCollections.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      className="py-6 grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 place-items-center select-none overflow-y-scroll"
      style={{ scrollbarWidth: "none" }}
    >
      {fileteredCollections.map((collection) => (
        <Item
          key={`${collection.project}-${collection.contract_address}`}
          project={collection.project}
          collection={collection}
          editions={editions}
          games={games}
        />
      ))}
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
  const { orders } = useMarketplace();
  const [image, setImage] = useState<string>(placeholder);


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
  }, [collection, editions]);

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
