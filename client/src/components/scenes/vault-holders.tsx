import { UserAvatar } from "../user/avatar";
import { HolderLabel } from "../vault/holder-label";
import { HolderRow, THolders } from "../vault/holder-row";

const MOCKDATA = [
  {
    ownerName: "tedison",
    shares: 100,
    percentHeld: 20,
  },
  {
    ownerName: "fortunaregem",
    shares: 100,
    percentHeld: 14,
  },
  {
    ownerName: "bal7hazar",
    shares: 100,
    percentHeld: 12,
  },
  {
    ownerName: "tarrence",
    shares: 100,
    percentHeld: 8,
  },
  {
    ownerName: "raschel0x",
    shares: 100,
    percentHeld: 4,
  },
  {
    ownerName: "load69",
    shares: 100,
    percentHeld: 2,
  },
  {
    ownerName: "clicksave",
    shares: 100,
    percentHeld: 1,
  },
] satisfies Array<THolders>;

export const VaultHoldersScene = () => {
  return (
    <div className="w-full h-full self-stretch flex flex-col gap-3 rounded overflow-clip">
      <HolderLabel />

      <div className="flex flex-col items-start gap-px self-stretch rounded overflow-clip">
        {MOCKDATA.map((holder, index) => (
          <HolderRow key={index} order={index + 1} {...holder} />
        ))}
      </div>
    </div>
  );
};
