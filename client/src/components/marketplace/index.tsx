import { Empty } from "@cartridge/ui";

export function Marketplace() {
  return <EmptyState />;
}

const EmptyState = () => {
  return (
    <Empty
      title="Coming soon"
      icon="inventory"
      className="h-full pt-4 pb-[88px] lg:py-6"
    />
  );
};
