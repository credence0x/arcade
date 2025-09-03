import { VaultActivityFeed } from "../vault/activity-feed";

const MOCKDATA = {
  username: "fortunaragem",
  total: 100,
  itemName: "shinobi",
  timestamp: "2 days ago",
};

export const VaultActivityScene = () => {
  return (
    <div className="w-full h-full self-stretch flex flex-col gap-px rounded overflow-clip">
      {Array.from({ length: 5 }).map((_, index) => (
        <VaultActivityFeed key={index} {...MOCKDATA} />
      ))}
    </div>
  );
};
