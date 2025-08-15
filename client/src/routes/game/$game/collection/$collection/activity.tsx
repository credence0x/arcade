import { createFileRoute } from "@tanstack/react-router";
import { TraceabilityScene } from "@/components/scenes/traceability";

export const Route = createFileRoute("/game/$game/collection/$collection/activity")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      filter: search.filter as string | undefined,
    };
  },
  component: TraceabilityScene,
});
