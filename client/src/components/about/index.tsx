import { useMemo } from "react";
import Details from "./details";
import Media from "./media";
import Metrics from "./metrics";
import { EditionModel } from "@cartridge/arcade";

export function About({ edition }: { edition: EditionModel }) {
  const items = useMemo(() => {
    const videos = edition.socials.videos?.filter((v) => !!v) ?? [];
    const images = edition.socials.images?.filter((i) => !!i) ?? [];
    return [...videos, ...images];
  }, [edition]);

  return (
    <div className="flex flex-col gap-4 py-4 pb-[88px] lg:py-6">
      <Media key={edition.id} items={items} />
      <Details content={edition.description || ""} />
      <Metrics />
    </div>
  );
}
