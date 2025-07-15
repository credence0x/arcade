import { useUsernames } from "@/hooks/account";
import { useBalances } from "@/hooks/market-collections";
import { useProject } from "@/hooks/project";
import { Empty } from "@cartridge/ui";
import { useMemo } from "react";
import { UserAvatar } from "../user/avatar";
import { getChecksumAddress } from "starknet";

export const HoldersScene = () => {
  const { collection: collectionAddress } = useProject();
  const { balances } = useBalances(collectionAddress || "", 10000);

  const { accounts, total } = useMemo(() => {
    if (!balances || balances.length === 0) return { accounts: [], total: 0 };
    const filtered = balances.filter(
      (balance) => parseInt(balance.balance, 16) > 0,
    );
    const owners = filtered.map(
      (balance) => `0x${BigInt(balance.account_address).toString(16)}`,
    );
    const total = filtered.reduce(
      (acc, balance) => acc + parseInt(balance.balance, 16),
      0,
    );
    return { accounts: Array.from(new Set(owners)), total };
  }, [balances, collectionAddress]);

  const { usernames } = useUsernames({ addresses: accounts });

  const data = useMemo(() => {
    return usernames
      .map((user) => {
        const userBalances = balances.filter(
          (balance) =>
            BigInt(balance.account_address) === BigInt(user.address || "0x0"),
        );
        const shorten = (user.address || getChecksumAddress("0x0")).slice(0, 6);
        const quantity = userBalances.reduce(
          (acc, balance) => acc + parseInt(balance.balance, 16),
          0,
        );
        return {
          username: user.username || shorten,
          address: user.address,
          balance: quantity,
          ratio: `${((quantity / total) * 100).toFixed(1)}%`,
        };
      })
      .sort((a, b) => b.balance - a.balance);
  }, [balances, usernames, total]);

  if (!balances) return <EmptyState />;

  return (
    <div className="flex flex-col pt-6 gap-4">
      <div className="flex items-center gap-3 text-foreground-300 font-medium text-xs w-full">
        <div className="flex items-center gap-2 w-1/2 px-3 py-1">
          <p className="w-8">#</p>
          <p className="grow">Owner</p>
        </div>
        <div className="flex items-center gap-2 w-1/2 px-3 py-1">
          <p className="w-1/2 text-right"># Held</p>
          <p className="w-1/2 text-right">% Held</p>
        </div>
      </div>
      <div className="rounded overflow-hidden w-full mb-6">
        <div className="flex flex-col gap-px overflow-y-auto">
          {data.map((holder, index) => (
            <div className="flex items-center gap-3 bg-background-200 text-foreground-100 font-medium text-sm h-10 w-full">
              <div className="flex items-center gap-2 w-1/2 px-3 py-1">
                <p className="w-8 text-foreground-400 font-normal">
                  {index + 1}.
                </p>
                <div className="flex items-center gap-1">
                  <UserAvatar username={holder.username} size="sm" />
                  <p>{holder.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-1/2 px-3 py-1">
                <p className="w-1/2 text-right">{holder.balance}</p>
                <p className="w-1/2 text-right">{holder.ratio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => {
  return (
    <Empty title="No holders" icon="guild" className="h-full py-3 lg:py-6" />
  );
};
