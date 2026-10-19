import { useEffect, useRef, useState } from "react";
import { ExternalLink, Navigation } from "lucide-react";
import { createMap, tt } from "@/lib/tomtom";

type Props = { lat: number; lng: number; title: string; mode?: "map" | "street" };

export function BillboardMap({ lat, lng, title, mode = "map" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (mode === "street" || !ref.current) return;
    let map: ReturnType<typeof createMap> | null = null;
    try {
      map = createMap(ref.current, lat, lng, 15);
      new tt.Marker().setLngLat([lng, lat]).addTo(map);
    } catch {
      setFailed(true);
    }
    return () => map?.remove();
  }, [lat, lng, mode]);

  if (mode === "street") {
    return (
      <div className="flex h-full min-h-56 w-full flex-col items-center justify-center gap-3 rounded-xl bg-muted px-6 text-center">
        <Navigation className="size-6 text-brand" />
        <p className="text-sm text-muted-foreground">See the street-level view of this exact spot.</p>
        <a
          href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:brightness-95"
        >
          Open Street View <ExternalLink className="size-3.5" />
        </a>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="grid h-full min-h-56 w-full place-items-center rounded-xl bg-muted px-6 text-center text-sm text-muted-foreground">
        Map is unavailable right now.
      </div>
    );
  }

  return <div ref={ref} className="h-full min-h-56 w-full overflow-hidden rounded-xl bg-muted shadow-inner" aria-label={`${title} map`} />;
}
