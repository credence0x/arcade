import { initSDK } from "..";
import { constants } from "starknet";
import { Access, AccessModel } from "./access";
import { Game, GameModel } from "./game";
import { Edition, EditionModel } from "./edition";
import {
  ClauseBuilder,
  ParsedEntity,
  SDK,
  StandardizedQueryResult,
  SubscriptionCallbackArgs,
  ToriiQueryBuilder,
  ToriiResponse,
} from "@dojoengine/sdk";
import { SchemaType } from "../../bindings";
import { NAMESPACE } from "../../constants";
import { type RegistryOptions, DefaultRegistryOptions } from "./options";
import { Helpers } from "../../helpers";

export * from "./policies";
export { AccessModel, GameModel, EditionModel, RegistryOptions };
export type RegistryModel = AccessModel | GameModel | EditionModel;

export const Registry = {
  sdk: undefined as SDK<SchemaType> | undefined,
  unsubEntities: undefined as (() => void) | undefined,

  init: async (chainId: constants.StarknetChainId) => {
    Registry.sdk = await initSDK(chainId);
  },

  isEntityQueryable(options: RegistryOptions) {
    return options.game || options.edition || options.access;
  },

  getEntityQuery: (options: RegistryOptions = DefaultRegistryOptions) => {
    const keys: `${string}-${string}`[] = [];
    if (options.access) keys.push(`${NAMESPACE}-${Access.getModelName()}`);
    if (options.game) keys.push(`${NAMESPACE}-${Game.getModelName()}`);
    if (options.edition) keys.push(`${NAMESPACE}-${Edition.getModelName()}`);
    const clauses = new ClauseBuilder().keys(keys, []);
    return new ToriiQueryBuilder<SchemaType>().withClause(clauses.build()).includeHashedKeys();
  },

  fetchEntities: async (callback: (models: RegistryModel[]) => void, options: RegistryOptions) => {
    if (!Registry.sdk) return;

    const wrappedCallback = async (entities?: ToriiResponse<SchemaType>) => {
      if (!entities) return;
      const models: RegistryModel[] = [];
      const items = entities?.getItems();
      await Promise.all(
        items.map(async (entity: ParsedEntity<SchemaType>) => {
          if (entity.models[NAMESPACE][Access.getModelName()]) {
            models.push(Access.parse(entity));
          }
          if (entity.models[NAMESPACE][Game.getModelName()]) {
            const game = Game.parse(entity);
            game.image = await Helpers.getImage(game.image, game.properties.preset);
            models.push(game);
          }
          if (entity.models[NAMESPACE][Edition.getModelName()]) {
            models.push(Edition.parse(entity));
          }
          return entity;
        }),
      );
      callback(models);
    };
    const query = Registry.getEntityQuery(options);
    try {
      const entities = await Registry.sdk.getEntities({ query });
      await wrappedCallback(entities);
    } catch (error) {
      console.error("Error fetching entities:", error);
    }
  },

  subEntities: async (callback: (models: RegistryModel[]) => void, options: RegistryOptions) => {
    if (!Registry.sdk) return;
    const wrappedCallback = ({ data, error }: SubscriptionCallbackArgs<StandardizedQueryResult<SchemaType>, Error>) => {
      if (error) {
        console.error("Error subscribing to entities:", error);
        return;
      }
      if (!data || data.length === 0 || BigInt(data[0].entityId) === 0n) return;
      const entity = data[0];
      const eraseable = !entity.models[NAMESPACE];
      if (!!entity.models[NAMESPACE]?.[Access.getModelName()] || eraseable) {
        const access = Access.parse(entity);
        callback([access]);
      }
      if (!!entity.models[NAMESPACE]?.[Game.getModelName()] || eraseable) {
        const game = Game.parse(entity);
        callback([game]);
      }
      if (!!entity.models[NAMESPACE]?.[Edition.getModelName()] || eraseable) {
        const edition = Edition.parse(entity);
        callback([edition]);
      }
    };

    const query = Registry.getEntityQuery(options);
    const [_, subscription] = await Registry.sdk.subscribeEntityQuery({ query, callback: wrappedCallback });
    Registry.unsubEntities = () => subscription.cancel();
  },

  fetch: async (callback: (models: RegistryModel[]) => void, options: RegistryOptions = DefaultRegistryOptions) => {
    if (!Registry.sdk) {
      throw new Error("SDK not initialized");
    }
    if (Registry.isEntityQueryable(options)) {
      await Registry.fetchEntities(callback, options);
    }
  },

  sub: async (callback: (models: RegistryModel[]) => void, options: RegistryOptions = DefaultRegistryOptions) => {
    if (!Registry.sdk) {
      throw new Error("SDK not initialized");
    }
    if (Registry.isEntityQueryable(options)) {
      await Registry.subEntities(callback, options);
    }
  },

  unsub: () => {
    if (Registry.unsubEntities) {
      Registry.unsubEntities();
      Registry.unsubEntities = undefined;
    }
  },
};
