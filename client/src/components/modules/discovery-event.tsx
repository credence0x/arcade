import {
  CardTitle,
  cn,
  SpaceInvaderIcon,
  SparklesIcon,
  Thumbnail,
} from "@cartridge/ui-next";
import { cva, VariantProps } from "class-variance-authority";
import { useMemo, HTMLAttributes, useState, useEffect } from "react";

export interface ArcadeDiscoveryEventProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof arcadeDiscoveryEventVariants> {
  identifier: string;
  name: string;
  timestamp: number;
  Icon?: React.ReactNode;
  data?: {
    title: string;
    label: string;
    icon: string;
    count?: number;
  };
  loading?: boolean;
  color?: string;
  logo?: string;
  points?: number;
}

export const arcadeDiscoveryEventVariants = cva(
  "relative select-none h-11 flex justify-between items-center px-3 py-2.5 cursor-pointer",
  {
    variants: {
      variant: {
        darkest: "bg-background-100",
        darker: "bg-background-100",
        dark: "bg-background-100",
        default: "bg-background-200 hover:bg-background-300",
        light: "bg-background-200",
        lighter: "bg-background-200",
        lightest: "bg-background-200",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const ArcadeDiscoveryEvent = ({
  name,
  timestamp,
  Icon,
  data,
  logo,
  color,
  points,
  variant,
  className,
  ...props
}: ArcadeDiscoveryEventProps) => {
  const colorMix = useMemo(
    () => `color-mix(in srgb, ${color} 1%, transparent 100%)`,
    [color],
  );
  return (
    <div
      className={cn(arcadeDiscoveryEventVariants({ variant }), className)}
      style={{
        backgroundImage: `linear-gradient(0deg, ${colorMix})`,
      }}
      {...props}
    >
      <div className="flex items-center gap-x-1.5">
        {Icon ? Icon : <SpaceInvaderIcon size="sm" variant="solid" />}
        <CardTitle className="text-sm font-normal tracking-normal text-foreground-100 truncate max-w-20 lg:max-w-none lg:truncate-none">
          {name}
        </CardTitle>
        {data && (
          <DiscoveryEvent
            title={data.title}
            label={data.label}
            icon={data.icon}
            count={data.count}
            className={className}
            color={color}
            points={points}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <Timestamp timestamp={timestamp} />
        <Thumbnail icon={logo} size="sm" variant="dark" />
      </div>
    </div>
  );
};

const DiscoveryEvent = ({
  title,
  label,
  icon,
  count,
  className,
  color,
  points,
}: {
  title: string;
  label: string;
  icon: string;
  count?: number;
  className?: string;
  color?: string;
  points?: number;
}) => {
  return (
    <div
      data-theme
      className={cn(
        "flex items-center gap-x-1.5 data-[theme=true]:text-primary",
        className,
      )}
      style={{ color }}
    >
      <p className="text-sm text-[#FFFFFF29]">{label}</p>
      <div className="flex items-center lg:gap-0.5 p-1 rounded-sm bg-[#00000029]">
        <div className="w-4 h-4 p-[2.5px] flex justify-center items-center">
          <div className={cn(icon, "fa-solid w-full h-full")} />
        </div>
        <p
          className={cn(
            "text-xs px-px flex lg:gap-1",
            !count && "hidden lg:block",
          )}
        >
          {!!count && (
            <span className={cn("block", count <= 1 && "lg:hidden")}>
              {count}
            </span>
          )}
          <span className="capitalize hidden lg:block">
            {title.replace(/_/g, " ")}
          </span>
        </p>
      </div>
      {!!points && (
        <div className="flex items-center gap-0.5 p-1 rounded-sm bg-[#00000029]">
          <SparklesIcon variant="solid" size="xs" />
          <p className="text-xs px-px">{points}</p>
        </div>
      )}
    </div>
  );
};

const Timestamp = ({ timestamp }: { timestamp: number }) => {
  const [state, setState] = useState<{
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    months: number;
    years: number;
  }>({
    seconds: 0,
    minutes: 0,
    hours: 0,
    days: 0,
    months: 0,
    years: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = now - timestamp * 1000;
      setState({
        seconds: Math.floor(diff / 1000),
        minutes: Math.floor(diff / (1000 * 60)),
        hours: Math.floor(diff / (1000 * 60 * 60)),
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        months: Math.floor(diff / (1000 * 60 * 60 * 24 * 30)),
        years: Math.floor(diff / (1000 * 60 * 60 * 24 * 30 * 12)),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  const label = useMemo(() => {
    if (state.years > 0) return `${state.years}y`;
    if (state.months > 0) return `${state.months}mo`;
    if (state.days > 0) return `${state.days}d`;
    if (state.hours > 0) return `${state.hours}h`;
    if (state.minutes > 0) return `${state.minutes}m`;
    return `${state.seconds}s`;
  }, [state]);

  return (
    <p className="text-xs text-[#FFFFFF29] flex gap-1">
      {label}
      <span className="hidden lg:block">{" ago"}</span>
    </p>
  );
};
