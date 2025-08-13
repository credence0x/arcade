import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Provider } from "@/context";
import { SonnerToaster } from "@cartridge/ui";

export const Route = createRootRoute({
  component: () => (
    <Provider>
      <Outlet />
      <SonnerToaster position="top-center" />
    </Provider>
  ),
});
