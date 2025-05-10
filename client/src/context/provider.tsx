import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ArcadeProvider } from "./arcade";
import { ThemeProvider } from "./theme";
import { CartridgeAPIProvider } from "@cartridge/utils/api/cartridge";
import { IndexerAPIProvider } from "@cartridge/utils/api/indexer";
import { AchievementProvider } from "./achievement";
import { StarknetProvider } from "./starknet";
import { ProjectProvider } from "./project";
import { CollectionProvider } from "./collection";
import { TokenProvider } from "./token";
import { ActivitiesProvider } from "./activities";
import { DiscoversProvider } from "./discovers";
import { MetricsProvider } from "./metrics";
import { OwnershipsProvider } from "./ownerships";
import { SidebarProvider } from "./sidebar";

export function Provider({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <CartridgeAPIProvider
      url={`${import.meta.env.VITE_CARTRIDGE_API_URL}/query`}
    >
      <IndexerAPIProvider credentials="omit">
        <QueryClientProvider client={queryClient}>
          <ArcadeProvider>
            <StarknetProvider>
              <ProjectProvider>
                <ThemeProvider defaultScheme="dark">
                  <OwnershipsProvider>
                    <CollectionProvider>
                      <TokenProvider>
                        <AchievementProvider>
                          <DiscoversProvider>
                            <ActivitiesProvider>
                              <MetricsProvider>
                                <SidebarProvider>{children}</SidebarProvider>
                              </MetricsProvider>
                            </ActivitiesProvider>
                          </DiscoversProvider>
                        </AchievementProvider>
                      </TokenProvider>
                    </CollectionProvider>
                  </OwnershipsProvider>
                </ThemeProvider>
              </ProjectProvider>
            </StarknetProvider>
          </ArcadeProvider>
        </QueryClientProvider>
      </IndexerAPIProvider>
    </CartridgeAPIProvider>
  );
}
