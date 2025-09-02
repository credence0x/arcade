import { TabsContent } from "@cartridge/ui";
import { ArcadeTabs, TabValue } from "../modules";
import { VaultActivityScene } from "../scenes/vault-activity";
import { VaultHoldersScene } from "../scenes/vault-holders";
import { VaultCommentsScene } from "../scenes/vault-comments";
import { VaultPositionsScene } from "../scenes/vault-positions";

export interface VaultTabsProps {
  defaultValue?: TabValue;
  onTabClick?: (tab: TabValue) => void;
}

export function VaultTabs({
  defaultValue = "vault-activity",
  onTabClick,
}: VaultTabsProps) {
  const order: TabValue[] = [
    "vault-activity",
    "vault-holders",
    "vault-comments",
    "vault-positions",
  ];

  return (
    <ArcadeTabs
      order={order}
      defaultValue={defaultValue as TabValue}
      onTabClick={onTabClick}
      variant="light"
    >
      <div
        className="flex justify-center gap-8 w-full h-full overflow-y-scroll"
        style={{ scrollbarWidth: "none" }}
      >
        <TabsContent
          className="p-0 px-3 lg:px-6 mt-0 grow w-full"
          value="vault-activity"
        >
          <VaultActivityScene />
        </TabsContent>
        <TabsContent
          className="p-0 px-3 lg:px-6 mt-0 grow w-full"
          value="vault-holders"
        >
          <VaultHoldersScene />
        </TabsContent>
        <TabsContent
          className="p-0 px-3 lg:px-6 mt-0 grow w-full"
          value="vault-comments"
        >
          <VaultCommentsScene />
        </TabsContent>
        <TabsContent
          className="p-0 px-3 lg:px-6 mt-0 grow w-full"
          value="vault-positions"
        >
          <VaultPositionsScene />
        </TabsContent>
      </div>
    </ArcadeTabs>
  );
}
