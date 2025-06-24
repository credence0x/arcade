import { CollectibleCard, Empty, Skeleton } from "@cartridge/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import placeholder from "@/assets/placeholder.svg";
import { useAddress } from "@/hooks/address";
import { addAddressPadding, getChecksumAddress } from "starknet";
import { OrderModel, StatusType } from "@cartridge/marketplace";
import { useMarketplace } from "@/hooks/marketplace";
import { useMarketCollections } from "@/hooks/market-collections";
import { Token } from "@dojoengine/torii-wasm";
import { useProject } from "@/hooks/project";

const getToriiImage = async (
  project: string,
  token: Token,
): Promise<string | undefined> => {
  if (!token.contract_address || !token.token_id) return;
  const toriiImage = `https://api.cartridge.gg/x/${project}/torii/static/0x${BigInt(token.contract_address).toString(16)}/${addAddressPadding(token.token_id)}/image`;
  // Fetch if the image exists
  try {
    const response = await fetch(toriiImage);
    if (response.ok) {
      return toriiImage;
    }
  } catch (error) {
    console.error("Error fetching image:", error);
  }
};

const getMetadataImage = async (token: Token): Promise<string | undefined> => {
  if (!token.metadata) return;
  let metadata;
  if (typeof token.metadata === "string") {
    try {
      metadata = JSON.parse(token.metadata);
      const response = await fetch(metadata.image);
      if (response.ok) {
        return metadata.image;
      }
    } catch (error) {
      console.error("Error parsing metadata:", error);
    }
  }
};

export const Marketplace = () => {
  const { collections } = useMarketCollections();
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
        />
      ))}
    </div>
  );
};

function Item({
  project,
  collection,
}: {
  project: string;
  collection: Token & { count: number };
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
  }, [orders]);

  useEffect(() => {
    const fetchImage = async () => {
      const toriiImage = await getToriiImage(project, collection);
      if (toriiImage) {
        setImage(toriiImage);
        return;
      }
      const metadataImage = await getMetadataImage(collection);
      if (metadataImage) {
        setImage(metadataImage);
        return;
      }
    };
    fetchImage();
  }, [collection, project]);

  const handleClick = useCallback(async () => {
    return;
  }, []);

  return (
    <div className="w-full group select-none">
      <CollectibleCard
        title={collection.name}
        image={image}
        totalCount={collection.count}
        listingCount={listingCount}
        onClick={isSelf ? handleClick : undefined}
        price={"$-"}
        className={
          isSelf ? "cursor-pointer" : "cursor-default pointer-events-none"
        }
      />
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
