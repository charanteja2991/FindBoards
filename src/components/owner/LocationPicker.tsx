import { useEffect, useRef, useState } from "react";
import type { Map as TTMap, Marker } from "@tomtom-international/web-sdk-maps";
import { createMap, tt } from "@/lib/tomtom";
import { Button } from "@/components/ui/button";

type Props = {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
};

const DEFAULT_CENTER = { lat: 17.385, lng: 78.4867 }; // Hyderabad

/** Click-to-place map picker and draggable pin for a billboard's exact coordinates using TomTom Maps. */
export function LocationPicker({ lat, lng, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<TTMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    try {
      const center = lat != null && lng != null ? { lat, lng } : DEFAULT_CENTER;
      const map = createMap(ref.current, center.lat, center.lng, lat != null ? 15 : 11);
      mapRef.current = map;

      const placeMarker = (la: number, ln: number) => {
        if (markerRef.current) {
          markerRef.current.setLngLat([ln, la]);
          return;
        }
        const marker = new tt.Marker({ draggable: true }).setLngLat([ln, la]).addTo(map);
        marker.on("dragend", () => {
          const p = marker.getLngLat();
          onChangeRef.current(p.lat, p.lng);
        });
        markerRef.current = marker;
      };

      if (lat != null && lng != null) placeMarker(lat, lng);
      map.on("click", (e) => {
        placeMarker(e.lngLat.lat, e.lngLat.lng);
        onChangeRef.current(e.lngLat.lat, e.lngLat.lng);
      });
    } catch {
      setFailed(true);
    }
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the pin in sync when coordinates or presets are applied
  useEffect(() => {
    const map = mapRef.current;
    if (!map || lat == null || lng == null) return;
    if (markerRef.current) markerRef.current.setLngLat([lng, lat]);
    else {
      const marker = new tt.Marker({ draggable: true }).setLngLat([lng, lat]).addTo(map);
      marker.on("dragend", () => {
        const p = marker.getLngLat();
        onChangeRef.current(p.lat, p.lng);
      });
      markerRef.current = marker;
    }
    map.setCenter([lng, lat]);
  }, [lat, lng]);

  const setPreset = (presetLat: number, presetLng: number) => {
    onChange(presetLat, presetLng);
    if (mapRef.current) {
      mapRef.current.setCenter([presetLng, presetLat]);
      mapRef.current.setZoom(14);
    }
  };

  if (failed) {
    return (
      <div className="grid h-64 place-items-center rounded-xl bg-muted px-6 text-center text-sm text-muted-foreground">
        TomTom map key missing or unavailable — please check your .env file (`VITE_TOMTOM_API_KEY`).
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div ref={ref} className="h-64 w-full overflow-hidden rounded-xl bg-muted shadow-inner" aria-label="Pick the billboard location" />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Click anywhere on the map to drop a pin, or drag the marker to fine-tune.</span>
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPreset(17.3850, 78.4867)}>
            Hyderabad
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPreset(12.9716, 77.5946)}>
            Bangalore
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPreset(19.0760, 72.8777)}>
            Mumbai
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPreset(28.6139, 77.2090)}>
            Delhi
          </Button>
        </div>
      </div>
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
        <span className="font-bold shrink-0">⚠️ Notice:</span>
        <span>Please recheck your pin location. GPS accuracy can vary, and your billboard position may be several meters away from the actual marker location. Drag or re-pin to ensure precise placement.</span>
      </div>
    </div>
  );
}
