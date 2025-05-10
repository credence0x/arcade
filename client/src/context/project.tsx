import { createContext, ReactNode, useMemo } from "react";
import { useArcade } from "@/hooks/arcade";
import { EditionModel, GameModel } from "@bal7hazar/arcade-sdk";
import { useParams } from "react-router-dom";
import { useAddressByUsernameQuery } from "@cartridge/utils/api/cartridge";
import { getChecksumAddress } from "starknet";

type ProjectContextType = {
  game?: GameModel;
  edition?: EditionModel;
  player?: string;
  tab?: string;
};

export const ProjectContext = createContext<ProjectContextType>({});

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { games, editions } = useArcade();

  const {
    game: gameParam,
    edition: editionParam,
    player: playerParam,
    tab,
  } = useParams<{
    game: string;
    edition: string;
    player: string;
    tab: string;
  }>();

  const { data } = useAddressByUsernameQuery(
    {
      username: playerParam?.toLowerCase() || "",
    },
    {
      enabled: !!playerParam && !playerParam.match(/^0x[0-9a-fA-F]+$/),
    },
  );

  const game = useMemo(() => {
    if (!gameParam || games.length === 0) return;
    return games.find(
      (game) =>
        game.id.toString() === gameParam ||
        game.name.toLowerCase().replace(/ /g, "-") === gameParam.toLowerCase(),
    );
  }, [gameParam, games]);

  const edition = useMemo(() => {
    if (!game || editions.length === 0) return;
    const gameEditions = editions.filter(
      (edition) => edition.gameId === game.id,
    );
    if (gameEditions.length === 0) return;
    if (!editionParam) {
      return gameEditions
        .sort((a, b) => b.id - a.id)
        .sort((a, b) => b.priority - a.priority)[0];
    }
    return gameEditions.find(
      (edition) =>
        edition.id.toString() === editionParam ||
        edition.name.toLowerCase().replace(/ /g, "-") ===
          editionParam.toLowerCase(),
    );
  }, [game, editionParam, editions]);

  const player = useMemo(() => {
    if (!playerParam) return;
    const address = data?.account?.controllers?.edges?.[0]?.node?.address;
    if (!!address) return address;
    if (!playerParam.match(/^0x[0-9a-fA-F]+$/)) return;
    return getChecksumAddress(playerParam);
  }, [playerParam, data]);

  return (
    <ProjectContext.Provider
      value={{
        tab,
        game,
        edition,
        player,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
