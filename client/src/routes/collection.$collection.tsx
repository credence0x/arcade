import { createFileRoute } from "@tanstack/react-router";
import { App } from "@/components/app";

export const Route = createFileRoute("/collection/$collection")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: search.tab as string | undefined,
      filter: search.filter as string | undefined,
    };
  },
  component: App,
});
