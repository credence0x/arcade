import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
// Import types statically - this is safe
import type {
  ArcadeProvider as ExternalProviderType,
  PinEvent,
  GameModel,
  RegistryModel,
  SocialModel,
  SocialOptions,
  RegistryOptions,
  FollowEvent,
  EditionModel,
} from "@bal7hazar/arcade-sdk";
import {
  constants,
  getChecksumAddress,
  RpcProvider,
  shortString,
} from "starknet";
import { Chain } from "@starknet-react/chains";

const CHAIN_ID = constants.StarknetChainId.SN_MAIN;

// Define a type for the dynamically loaded SDK modules
type ArcadeSdkModule = typeof import("@bal7hazar/arcade-sdk");

export interface ProjectProps {
  namespace: string;
  project: string;
}

/**
 * Interface defining the shape of the Arcade context.
 */
interface ArcadeContextType {
  /** The Arcade client instance */
  chainId: string;
  provider: ExternalProviderType | null;
  pins: { [playerId: string]: string[] };
  follows: { [playerId: string]: string[] };
  games: GameModel[];
  editions: EditionModel[];
  chains: Chain[];
  player: string | undefined;
  setPlayer: (address: string | undefined) => void;
  isSdkLoading: boolean;
}

/**
 * React context for sharing Arcade-related data throughout the application.
 */
export const ArcadeContext = createContext<ArcadeContextType | null>(null);

/**
 * Provider component that makes Arcade context available to child components.
 *
 * @param props.children - Child components that will have access to the Arcade context
 * @throws {Error} If ArcadeProvider is used more than once in the component tree
 */
export const ArcadeProvider = ({ children }: { children: ReactNode }) => {
  const [player, setPlayer] = useState<string | undefined>();
  const [pins, setPins] = useState<{ [playerId: string]: string[] }>({});
  const [follows, setFollows] = useState<{ [playerId: string]: string[] }>({});
  const [games, setGames] = useState<{ [gameId: string]: GameModel }>({});
  const [editions, setEditions] = useState<{
    [editionId: string]: EditionModel;
  }>({});
  const [chains, setChains] = useState<Chain[]>([]);
  const [initialized, setInitialized] = useState<boolean>(false);

  // State to hold the loaded SDK module and loading status
  const [sdk, setSdk] = useState<ArcadeSdkModule | null>(null);
  const [isLoadingSdk, setIsLoadingSdk] = useState<boolean>(true);

  // Dynamically load the SDK only in the browser
  useEffect(() => {
    // Check if running in browser environment
    if (typeof window !== "undefined") {
      setIsLoadingSdk(true);
      import("@bal7hazar/arcade-sdk")
        .then((loadedSdk) => {
          setSdk(loadedSdk);
          setIsLoadingSdk(false);
          console.log("Arcade SDK loaded dynamically.");
        })
        .catch((error) => {
          console.error("Failed to load Arcade SDK:", error);
          setIsLoadingSdk(false); // Stop loading even on error
          // Handle error appropriately - maybe set an error state
        });
    } else {
      // If not in browser, set loading to false immediately
      // Or handle SSR case specifically if needed
      setIsLoadingSdk(false);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Extract modules/classes only when SDK is loaded
  const ExternalProvider = useMemo(() => sdk?.ArcadeProvider, [sdk]);
  const Registry = useMemo(() => sdk?.Registry, [sdk]);
  const Social = useMemo(() => sdk?.Social, [sdk]);

  const provider = useMemo(
    () => {
      // Only instantiate if the provider class is loaded
      if (!ExternalProvider) return null;
      return new ExternalProvider(CHAIN_ID);
    },
    [ExternalProvider] // Re-run when ExternalProvider becomes available
  );

  const handlePinEvent = useCallback((event: PinEvent) => {
    const playerId = getChecksumAddress(event.playerId);
    if (event.time == 0) {
      // Remove the achievement from the player's list
      setPins((prevPins) => {
        const achievementIds = prevPins[playerId] || [];
        return {
          ...prevPins,
          [playerId]: achievementIds.filter(
            (id: string) => id !== event.achievementId
          ),
        };
      });
    } else {
      // Otherwise, add the achievement to the player's list
      setPins((prevPins) => {
        const achievementIds = prevPins[playerId] || [];
        return {
          ...prevPins,
          [playerId]: [...new Set([...achievementIds, event.achievementId])],
        };
      });
    }
  }, []);

  const handleFollowEvent = useCallback((event: FollowEvent) => {
    const follower = getChecksumAddress(event.follower);
    const followed = getChecksumAddress(event.followed);
    if (event.time == 0) {
      // Remove the follow
      setFollows((prevFollows) => {
        const followeds = prevFollows[follower] || [];
        return {
          ...prevFollows,
          [follower]: followeds.filter((id: string) => id !== followed),
        };
      });
    } else {
      // Otherwise, add the follow
      setFollows((prevFollows) => {
        const followeds = prevFollows[follower] || [];
        return {
          ...prevFollows,
          [follower]: [...new Set([...followeds, followed])],
        };
      });
    }
  }, []);

  const handleSocialEvents = useCallback(
    (models: SocialModel[]) => {
      // Ensure sdk and necessary types are loaded before processing
      if (!sdk) return;
      models.forEach((model: SocialModel) => {
        if (sdk.PinEvent.isType(model as PinEvent))
          return handlePinEvent(model as PinEvent);
        if (sdk.FollowEvent.isType(model as FollowEvent))
          return handleFollowEvent(model as FollowEvent);
      });
    },
    [sdk, handlePinEvent, handleFollowEvent] // Depend on sdk being loaded
  );

  const handleRegistryModels = useCallback(
    (models: RegistryModel[]) => {
      // Ensure sdk and necessary types are loaded before processing
      if (!sdk) return;
      models.forEach(async (model: RegistryModel) => {
        if (sdk.GameModel.isType(model as GameModel)) {
          const game = model as GameModel;
          if (!game.exists()) {
            setGames((prevGames) => {
              const newGames = { ...prevGames };
              delete newGames[game.identifier];
              return newGames;
            });
            return;
          }
          setGames((prevGames) => ({
            ...prevGames,
            [game.identifier]: game,
          }));
        } else if (sdk.EditionModel.isType(model as EditionModel)) {
          const edition = model as EditionModel;
          if (!edition.exists()) {
            setEditions((prevEditions) => {
              const newEditions = { ...prevEditions };
              delete newEditions[edition.identifier];
              return newEditions;
            });
            return;
          }
          setEditions((prevEditions) => ({
            ...prevEditions,
            [edition.identifier]: edition,
          }));
        }
      });
    },
    [sdk]
  ); // Depend on sdk being loaded

  useEffect(() => {
    async function getChains() {
      // Ensure sdk.EditionModel is available if needed inside, or adjust logic
      const chainsData: Chain[] = await Promise.all(
        Object.values(editions).map(async (edition) => {
          const rpcProvider = new RpcProvider({ nodeUrl: edition.config.rpc });
          const id = await rpcProvider.getChainId();
          return {
            id: BigInt(id),
            name: shortString.decodeShortString(id),
            network: id,
            rpcUrls: {
              default: { http: [edition.config.rpc] },
              public: { http: [edition.config.rpc] },
            },
            nativeCurrency: {
              address: "0x0",
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
          };
        })
      );
      const uniques = chainsData.filter(
        (chain, index) =>
          index === chainsData.findIndex((t) => t.id === chain.id)
      );
      setChains(uniques);
    }
    if (Object.keys(editions).length > 0) {
      // Only run if editions are populated
      getChains();
    }
  }, [editions]); // Keep dependency on editions

  useEffect(() => {
    // Only initialize if SDK is loaded and not already initialized
    if (initialized || !Registry || !Social) return;
    const initialize = async () => {
      try {
        await Social.init(CHAIN_ID);
        await Registry.init(CHAIN_ID);
        setInitialized(true);
        console.log("SDK Systems Initialized");
      } catch (error) {
        console.error("Failed to initialize SDK systems:", error);
      }
    };
    initialize();
  }, [initialized, Registry, Social]); // Depend on loaded modules

  useEffect(() => {
    // Only subscribe if initialized and Social is available
    if (!initialized || !Social) return;
    console.log("Subscribing to Social events");
    const options: SocialOptions = { pin: true, follow: true };
    Social.fetch(handleSocialEvents, options);
    Social.sub(handleSocialEvents, options);
    return () => {
      console.log("Unsubscribing from Social events");
      Social.unsub(); // Ensure Social is available on cleanup too
    };
  }, [initialized, Social, handleSocialEvents]); // Depend on Social module

  useEffect(() => {
    // Only subscribe if initialized and Registry is available
    if (!initialized || !Registry) return;
    console.log("Subscribing to Registry events");
    const options: RegistryOptions = { game: true, edition: true };
    Registry.fetch(handleRegistryModels, options);
    Registry.sub(handleRegistryModels, options);
    return () => {
      console.log("Unsubscribing from Registry events");
      Registry.unsub(); // Ensure Registry is available on cleanup too
    };
  }, [initialized, Registry, handleRegistryModels]); // Depend on Registry module

  const sortedGames = useMemo(() => {
    return Object.values(games).sort((a, b) => a.name.localeCompare(b.name));
  }, [games]);

  const sortedEditions = useMemo(() => {
    return Object.values(editions)
      .sort((a, b) => a.priority - b.priority)
      .sort((a, b) => {
        const gameA = sortedGames.find((game) => game.id === a.gameId);
        const gameB = sortedGames.find((game) => game.id === b.gameId);
        return gameA?.name.localeCompare(gameB?.name || "") || 0;
      });
  }, [editions, sortedGames]);

  // Show loading state until SDK is ready
  if (isLoadingSdk) {
    return <div>Loading Arcade SDK...</div>; // Or return null, or a skeleton loader
  }

  // Check if provider failed to initialize (optional, based on error handling)
  if (!provider && typeof window !== "undefined") {
    return <div>Error loading Arcade Provider.</div>;
  }

  return (
    <ArcadeContext.Provider
      value={{
        chainId: CHAIN_ID,
        provider, // Now potentially null initially
        pins,
        follows,
        games: sortedGames,
        editions: sortedEditions,
        chains,
        player,
        setPlayer,
        isSdkLoading: isLoadingSdk,
      }}
    >
      {children}
    </ArcadeContext.Provider>
  );
};

// Hook to use the context remains the same
export const useArcade = (): ArcadeContextType => {
  const context = useContext(ArcadeContext);
  if (!context) {
    throw new Error("useArcade must be used within an ArcadeProvider");
  }
  return context;
};
