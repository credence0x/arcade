import { useArcade } from "@/hooks/arcade";
import { Chain, mainnet, sepolia } from "@starknet-react/chains";
import { jsonRpcProvider, StarknetConfig, voyager } from "@starknet-react/core";
import { PropsWithChildren, useMemo, useRef } from "react";
import { constants } from "starknet";
import ControllerConnector from "@cartridge/connector/controller";
import {
  KeychainOptions,
  ProfileOptions,
  ProviderOptions,
} from "@cartridge/controller";
import { DEFAULT_PRESET, DEFAULT_PROJECT } from "@/constants";

let getSocialPolicies: any = null;
let getRegistryPolicies: any = null;

if (typeof window !== "undefined") {
  (async () => {
    const {
      getSocialPolicies: _getSocialPolicies,
      getRegistryPolicies: _getRegistryPolicies,
    } = await import("@bal7hazar/arcade-sdk");
    getSocialPolicies = _getSocialPolicies;
    getRegistryPolicies = _getRegistryPolicies;
  })();
}

const chainId = constants.StarknetChainId.SN_MAIN;

const keychain: KeychainOptions =
  typeof window !== "undefined"
    ? {
        policies: {
          contracts: {
            ...getSocialPolicies(chainId).contracts,
            ...getRegistryPolicies(chainId).contracts,
          },
        },
      }
    : {
        policies: {
          contracts: {},
        },
      };

const profile: ProfileOptions = {
  preset: DEFAULT_PRESET,
  slot: DEFAULT_PROJECT,
};

export function StarknetProvider({ children }: PropsWithChildren) {
  const { chains } = useArcade();
  const controllerRef = useRef<ControllerConnector | null>(null);

  const jsonProvider = useMemo(() => {
    return jsonRpcProvider({
      rpc: (chain: Chain) => {
        switch (chain) {
          case mainnet:
            return { nodeUrl: "https://api.cartridge.gg/x/starknet/mainnet" };
          case sepolia:
            return { nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia" };
          default:
            const found = chains.find((c) => c.id === chain.id);
            if (!found) {
              throw new Error(`Chain ${chain.id} not found`);
            }
            return { nodeUrl: found.rpcUrls.default.http[0] };
        }
      },
    });
  }, [chains]);

  const provider: ProviderOptions | null = useMemo(() => {
    if (!chains.length)
      return {
        defaultChainId: constants.StarknetChainId.SN_MAIN,
        chains: [
          {
            rpcUrl: import.meta.env.VITE_RPC_URL,
          },
        ],
      };
    return {
      defaultChainId: chainId,
      chains: chains.map((chain) => ({ rpcUrl: chain.rpcUrls.public.http[0] })),
    };
  }, [chains]);

  const controller = useMemo(() => {
    if (!provider) return null;
    if (controllerRef.current) return controllerRef.current;
    controllerRef.current = new ControllerConnector({
      ...provider,
      ...keychain,
      ...profile,
    });
    return controllerRef.current;
  }, [controllerRef, provider]);

  return (
    <StarknetConfig
      autoConnect
      chains={[mainnet, sepolia]}
      connectors={!controller ? [] : [controller]}
      explorer={voyager}
      provider={jsonProvider}
    >
      {children}
    </StarknetConfig>
  );
}
