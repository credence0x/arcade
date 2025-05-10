import { useContext } from "react";
import { ProjectContext } from "../context/project";

/**
 * Custom hook to access the Project context and account information.
 * Must be used within a ProjectProvider component.
 *
 * @returns An object containing:
 * - project: The project name
 * - namespace: The namespace name
 * - gameId: The game id
 * - setProject: A function to set the project name
 * - setNamespace: A function to set the namespace name
 * - setGameId: A function to set the game id
 * @throws {Error} If used outside of a ProjectProvider context
 */
export const useProject = () => {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error(
      "The `useProject` hook must be used within a `ProjectProvider`",
    );
  }

  const { game, edition, player, tab } = context;

  return {
    game,
    edition,
    player,
    tab,
  };
};
