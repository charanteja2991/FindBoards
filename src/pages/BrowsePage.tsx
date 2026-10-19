import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { BillboardCard } from "@/components/marketplace/BillboardCard";
import { FilterPanel } from "@/components/marketplace/FilterPanel";
import { fetchPublicBillboards } from "@/lib/api";
import type { BrowseFilters, BillboardWithImages } from "@/lib/domain";

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [panelOpen, setPanelOpen] = useState(false);
  const [results, setResults] = useState<BillboardWithImages[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<BrowseFilters>(() => ({
    search: searchParams.get("q") || undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("max") ? Number(searchParams.get("max")) : undefined,
    type: searchParams.get("type") ? [searchParams.get("type") as any] : undefined,
    sort: (searchParams.get("sort") as any) || "newest",
    illuminated: searchParams.get("illuminatedOnly") === "true" ? true : undefined,
  }));

  useEffect(() => {
    loadBillboards();
  }, [filters]);

  const loadBillboards = async () => {
    setLoading(true);
    try {
      const data = await fetchPublicBillboards(filters);
      setResults(data);
    } catch (err) {
      console.error("Error loading billboards:", err);
    } finally {
      setLoading(false);
    }
  };

  const heading = useMemo(() => {
    const city = filters.city?.trim() || filters.search?.trim();
    return city ? `Billboards in ${city}` : "All billboards";
  }, [filters.city, filters.search]);

  function update(next: Partial<BrowseFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
    const newParams = new URLSearchParams(searchParams);

    if ("search" in next) next.search ? newParams.set("q", next.search) : newParams.delete("q");
    if ("minPrice" in next) next.minPrice ? newParams.set("minPrice", String(next.minPrice)) : newParams.delete("minPrice");
    if ("maxPrice" in next) next.maxPrice ? newParams.set("maxPrice", String(next.maxPrice)) : newParams.delete("maxPrice");
    if ("type" in next) next.type?.length ? newParams.set("type", next.type.join(",")) : newParams.delete("type");
    if ("sort" in next) next.sort ? newParams.set("sort", next.sort) : newParams.delete("sort");
    if ("illuminated" in next) next.illuminated ? newParams.set("illuminatedOnly", "true") : newParams.delete("illuminatedOnly");

    setSearchParams(newParams);
  }

  function reset() {
    setFilters({ sort: "newest" });
    setSearchParams(new URLSearchParams());
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">{heading}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {loading ? "Loading..." : `${results.length} listing${results.length === 1 ? "" : "s"} available`}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className={panelOpen ? "block" : "hidden lg:block"}>
          <FilterPanel filters={filters} onChange={update} onReset={reset} />
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium lg:hidden"
            >
              <SlidersHorizontal className="size-4" />
              Filters
            </button>
            <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              Sort
              <select
                value={filters.sort ?? "newest"}
                onChange={(e) => update({ sort: e.target.value as any })}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              >
                <option value="newest">Newest first</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="popular">Most popular</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="py-20 text-center text-muted-foreground">Loading billboards...</div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <h2 className="font-display text-lg font-semibold">No billboards match this search</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Try widening your price range or clearing a few filters — new spaces are published regularly by owners.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((billboard) => (
                <BillboardCard key={billboard.id} billboard={billboard} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
