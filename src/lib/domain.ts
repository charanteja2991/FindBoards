export type BillboardType = "highway" | "digital" | "roadside" | "in_mall" | "transit" | "wall_wrap" | "gantry" | "rooftop";
export type PricePeriod = "daily" | "weekly" | "monthly" | "yearly";
export type ListingStatus = "draft" | "published" | "pending" | "rejected" | "suspended";
export type AvailabilityStatus = "available" | "booked" | "unavailable";
export type DimensionUnit = "ft" | "m";
export type AppRole = "admin" | "owner" | "advertiser";

export const BILLBOARD_TYPES: { value: BillboardType; label: string }[] = [
  { value: "highway", label: "Highway" },
  { value: "digital", label: "Digital" },
  { value: "roadside", label: "Roadside" },
  { value: "in_mall", label: "In-mall" },
  { value: "transit", label: "Transit" },
  { value: "wall_wrap", label: "Wall wrap" },
  { value: "gantry", label: "Gantry" },
  { value: "rooftop", label: "Rooftop" },
];

export const PRICE_PERIODS: { value: PricePeriod; label: string; short: string }[] = [
  { value: "daily", label: "Per day", short: "/day" },
  { value: "weekly", label: "Per week", short: "/wk" },
  { value: "monthly", label: "Per month", short: "/mo" },
  { value: "yearly", label: "Per year", short: "/yr" },
];

export const AVAILABILITY_STATUSES: { value: AvailabilityStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "booked", label: "Booked" },
  { value: "unavailable", label: "Unavailable" },
];

export function typeLabel(value: BillboardType) {
  return BILLBOARD_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function periodShort(value: PricePeriod) {
  return PRICE_PERIODS.find((p) => p.value === value)?.short ?? "";
}

export function periodLabel(value: PricePeriod) {
  return PRICE_PERIODS.find((p) => p.value === value)?.label ?? value;
}

export function availabilityLabel(value: AvailabilityStatus) {
  return AVAILABILITY_STATUSES.find((a) => a.value === value)?.label ?? value;
}

export type BillboardRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  billboard_type: BillboardType;
  address: string;
  area: string | null;
  city: string;
  state: string | null;
  country: string;
  latitude: number;
  longitude: number;
  width: number;
  height: number;
  dimension_unit: DimensionUnit;
  is_illuminated: boolean;
  price: number;
  currency: string;
  price_period: PricePeriod;
  min_booking_days: number;
  availability: AvailabilityStatus;
  status: ListingStatus;
  is_visible: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type BillboardImageRow = {
  id: string;
  billboard_id: string;
  url: string;
  alt_text: string | null;
  storage_path: string | null;
  sort_order: number;
  is_cover: boolean;
};

export type BillboardWithImages = BillboardRow & {
  billboard_images: BillboardImageRow[];
};

export type AvailabilitySlot = {
  id: string;
  billboard_id: string;
  start_date: string;
  end_date: string;
  is_available: boolean;
  note: string | null;
};

export type ProfileRow = {
  id: string;
  display_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  phone: string | null;
  contact_email: string | null;
};

export type BrowseFilters = {
  city?: string;
  type?: BillboardType[];
  minPrice?: number;
  maxPrice?: number;
  illuminated?: boolean;
  search?: string;
  sort?: "newest" | "price-low" | "price-high" | "popular";
};

export function dimensions(b: Pick<BillboardRow, "width" | "height" | "dimension_unit">) {
  const w = Number(b.width);
  const h = Number(b.height);
  const strip = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
  return `${strip(w)}${b.dimension_unit} × ${strip(h)}${b.dimension_unit}`;
}

export function locationLine(b: Pick<BillboardRow, "area" | "city" | "state">) {
  return [b.area, b.city, b.state].filter(Boolean).join(", ");
}

export function googleMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
}
