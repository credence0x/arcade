import { createFileRoute } from "@tanstack/react-router";
import { App } from "@/components/app";

export const Route = createFileRoute("/game/$game/edition/$edition")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: search.tab as string | undefined,
      filter: search.filter as string | undefined,
    };
  },
  component: App,
});
