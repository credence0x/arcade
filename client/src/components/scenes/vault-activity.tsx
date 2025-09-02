import { Empty } from "@cartridge/ui";

export const VaultActivityScene = () => {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground-200">Vault Activity</h2>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <Empty
          title="No activity yet"
          icon="activity"
          className="h-full py-3 lg:py-6"
        />
      </div>
    </div>
  );
};
