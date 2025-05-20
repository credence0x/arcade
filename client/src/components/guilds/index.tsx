import { Empty } from "@cartridge/ui";

export function Guilds() {
  return <EmptyState />;
}

const EmptyState = () => {
  return (
    <Empty
      title="Coming soon"
      icon="guild"
      className="h-full pt-4 pb-[88px] lg:py-6"
    />
  );
};
