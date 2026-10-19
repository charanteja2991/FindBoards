import { AVAILABILITY_STATUSES, BILLBOARD_TYPES, type AvailabilityStatus, type BillboardType, type BrowseFilters } from "@/lib/domain";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FilterPanel({
  filters,
  onChange,
  onReset,
}: {
  filters: BrowseFilters;
  onChange: (next: Partial<BrowseFilters>) => void;
  onReset: () => void;
}) {
  const selectedTypes = (filters.type ?? []) as BillboardType[];

  function toggleType(value: BillboardType) {
    const next = selectedTypes.includes(value)
      ? selectedTypes.filter((t) => t !== value)
      : [...selectedTypes, value];
    onChange({ type: next.length ? next : undefined });
  }

  return (
    <aside className="space-y-6 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">Filters</h2>
        <button type="button" onClick={onReset} className="text-xs font-medium text-brand hover:text-brand-dark">
          Reset
        </button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-search">Search</Label>
        <Input
          id="filter-search"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value || undefined })}
          placeholder="Search billboards..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-city">City or area</Label>
        <Input
          id="filter-city"
          value={filters.city ?? ""}
          onChange={(e) => onChange({ city: e.target.value || undefined })}
          placeholder="Hyderabad"
        />
      </div>

      <div className="space-y-2">
        <Label>Billboard type</Label>
        <div className="flex flex-wrap gap-2">
          {BILLBOARD_TYPES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleType(option.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                selectedTypes.includes(option.value)
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-card hover:border-brand/40"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Price range</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            inputMode="numeric"
            value={filters.minPrice ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (!value) return onChange({ minPrice: undefined });
              const num = Number(value);
              return onChange({ minPrice: Number.isFinite(num) ? num : undefined });
            }}
            placeholder="Min"
            aria-label="Minimum price"
          />
          <Input
            inputMode="numeric"
            value={filters.maxPrice ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (!value) return onChange({ maxPrice: undefined });
              const num = Number(value);
              return onChange({ maxPrice: Number.isFinite(num) ? num : undefined });
            }}
            placeholder="Max"
            aria-label="Maximum price"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(filters.illuminated)}
          onChange={(e) => onChange({ illuminated: e.target.checked || undefined })}
          className="size-4 rounded border-border accent-[var(--brand)]"
        />
        Illuminated / 24×7 lit only
      </label>
    </aside>
  );
}
