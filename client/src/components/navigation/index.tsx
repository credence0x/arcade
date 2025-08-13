import {
  ClockIcon,
  cn,
  CoinsIcon,
  StateIconProps,
  TrophyIcon,
} from "@cartridge/ui";
import { useMemo } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

export function Navigation() {
  return (
    <div className="flex overflow-hidden shrink-0 gap-x-4">
      <Item Icon={CoinsIcon} variant="inventory" title="Assets" />
      <Item Icon={TrophyIcon} variant="achievements" title="Achievements" />
      <Item Icon={ClockIcon} variant="activity" title="Activity" disabled />
    </div>
  );
}

function Item({
  Icon,
  title,
  variant,
  disabled = false,
}: {
  Icon: React.ComponentType<StateIconProps>;
  title: string;
  variant: string;
  disabled?: boolean;
}) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const search = routerState.location.search;

  const isActive = useMemo(() => {
    // Check if the tab search param equals the variant
    const searchParams = new URLSearchParams(search);
    const tab = searchParams.get("tab");

    if (tab === variant) return true;

    // Default to inventory if we're on root without a tab param
    return variant === "inventory" && pathname === "/" && !tab;
  }, [pathname, search, variant]);

  if (disabled) {
    return (
      <div
        className={cn(
          "flex gap-2 px-4 py-3 h-11 justify-center items-center rounded border border-secondary",
          "bg-background opacity-50 cursor-not-allowed",
        )}
      >
        <Icon size="sm" variant="line" />
        <span>{title}</span>
      </div>
    );
  }

  return (
    <Link
      className={cn(
        "flex gap-2 px-4 py-3 h-11 justify-center items-center cursor-pointer hover:opacity-[0.8] rounded border border-secondary",
        isActive ? "bg-secondary" : "bg-background",
      )}
      to="/"
      search={(prev) => ({
        ...prev,
        tab: variant === "inventory" ? undefined : variant,
        filter: prev?.filter || undefined,
      })}
    >
      <Icon size="sm" variant={isActive ? "solid" : "line"} />
      <span>{title}</span>
    </Link>
  );
}
