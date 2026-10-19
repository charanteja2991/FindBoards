import type { BillboardWithImages, AvailabilitySlot, ProfileRow } from "@/lib/domain";

/**
 * Development-only fixtures for Board Spot.
 * These stand in for a real backend and should be replaced with actual API
 * calls once a backend is chosen.
 */

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=800&q=80",
  "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
];

function img(index: number, billboardId: string, isCover = false): BillboardWithImages["billboard_images"][number] {
  return {
    id: `img-${billboardId}-${index}`,
    billboard_id: billboardId,
    url: PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]!,
    alt_text: null,
    storage_path: null,
    sort_order: index,
    is_cover: isCover,
  };
}

export const MOCK_BILLBOARDS: BillboardWithImages[] = [
  {
    id: "bb-1",
    owner_id: "owner-1",
    title: "Highway hoarding near Banjara Hills",
    description: "High-traffic location with excellent visibility from both directions. This 40×20 ft highway hoarding is positioned at one of the busiest intersections in Banjara Hills, Hyderabad. Illuminated 24/7 for maximum brand exposure.",
    billboard_type: "highway",
    address: "Road No. 12, Banjara Hills",
    area: "Banjara Hills",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    latitude: 17.4156,
    longitude: 78.4347,
    width: 40,
    height: 20,
    dimension_unit: "ft",
    is_illuminated: true,
    price: 150000,
    currency: "INR",
    price_period: "monthly",
    min_booking_days: 30,
    availability: "available",
    status: "published",
    is_visible: true,
    is_featured: true,
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-15T10:00:00Z",
    billboard_images: [img(0, "bb-1", true), img(1, "bb-1"), img(2, "bb-1")],
  },
  {
    id: "bb-2",
    owner_id: "owner-1",
    title: "Digital screen at Inorbit Mall",
    description: "Premium digital screen inside Inorbit Mall, Hyderabad. Located at the main atrium with footfall of 50,000+ visitors daily during weekends.",
    billboard_type: "digital",
    address: "Inorbit Mall, Hitech City",
    area: "Hitech City",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    latitude: 17.4375,
    longitude: 78.3841,
    width: 12,
    height: 8,
    dimension_unit: "ft",
    is_illuminated: true,
    price: 85000,
    currency: "INR",
    price_period: "monthly",
    min_booking_days: 14,
    availability: "available",
    status: "published",
    is_visible: true,
    is_featured: true,
    created_at: "2024-11-15T10:00:00Z",
    updated_at: "2024-12-10T10:00:00Z",
    billboard_images: [img(3, "bb-2", true), img(4, "bb-2")],
  },
  {
    id: "bb-3",
    owner_id: "owner-2",
    title: "Roadside billboard on MG Road",
    description: "Prime roadside location on MG Road, Bangalore. 30×15 ft billboard with non-stop traffic exposure. Near major tech parks and commercial hubs.",
    billboard_type: "roadside",
    address: "MG Road, near Trinity Circle",
    area: "MG Road",
    city: "Bangalore",
    state: "Karnataka",
    country: "India",
    latitude: 12.9752,
    longitude: 77.6066,
    width: 30,
    height: 15,
    dimension_unit: "ft",
    is_illuminated: false,
    price: 120000,
    currency: "INR",
    price_period: "monthly",
    min_booking_days: 30,
    availability: "available",
    status: "published",
    is_visible: true,
    is_featured: true,
    created_at: "2024-11-20T10:00:00Z",
    updated_at: "2024-12-05T10:00:00Z",
    billboard_images: [img(1, "bb-3", true), img(5, "bb-3")],
  },
  {
    id: "bb-4",
    owner_id: "owner-2",
    title: "Transit shelter at Mumbai Central",
    description: "Bus shelter advertising panel at Mumbai Central, one of the busiest transit hubs in Mumbai. Thousands of daily commuters see this space.",
    billboard_type: "transit",
    address: "Mumbai Central Station Road",
    area: "Mumbai Central",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    latitude: 18.9691,
    longitude: 72.8198,
    width: 10,
    height: 6,
    dimension_unit: "ft",
    is_illuminated: true,
    price: 45000,
    currency: "INR",
    price_period: "monthly",
    min_booking_days: 7,
    availability: "booked",
    status: "published",
    is_visible: true,
    is_featured: false,
    created_at: "2024-10-15T10:00:00Z",
    updated_at: "2024-11-20T10:00:00Z",
    billboard_images: [img(2, "bb-4", true)],
  },
  {
    id: "bb-5",
    owner_id: "owner-1",
    title: "Rooftop display near Connaught Place",
    description: "Large rooftop billboard visible from Connaught Place's outer circle. Prime location for brands looking for maximum visibility in central Delhi.",
    billboard_type: "rooftop",
    address: "Block A, Connaught Place",
    area: "Connaught Place",
    city: "Delhi",
    state: "Delhi",
    country: "India",
    latitude: 28.6315,
    longitude: 77.2167,
    width: 50,
    height: 25,
    dimension_unit: "ft",
    is_illuminated: true,
    price: 250000,
    currency: "INR",
    price_period: "monthly",
    min_booking_days: 30,
    availability: "available",
    status: "published",
    is_visible: true,
    is_featured: false,
    created_at: "2024-09-01T10:00:00Z",
    updated_at: "2024-11-15T10:00:00Z",
    billboard_images: [img(4, "bb-5", true), img(0, "bb-5"), img(5, "bb-5")],
  },
  {
    id: "bb-6",
    owner_id: "owner-3",
    title: "Wall wrap on Linking Road",
    description: "Full building wall wrap on Linking Road, Bandra. High visibility from the street with massive footfall from shoppers and commuters.",
    billboard_type: "wall_wrap",
    address: "Linking Road, near Bandra Station",
    area: "Bandra West",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    latitude: 19.0596,
    longitude: 72.8295,
    width: 60,
    height: 40,
    dimension_unit: "ft",
    is_illuminated: false,
    price: 320000,
    currency: "INR",
    price_period: "monthly",
    min_booking_days: 90,
    availability: "available",
    status: "published",
    is_visible: true,
    is_featured: true,
    created_at: "2024-08-10T10:00:00Z",
    updated_at: "2024-10-20T10:00:00Z",
    billboard_images: [img(5, "bb-6", true), img(3, "bb-6")],
  },
];

export const MOCK_AVAILABILITY: AvailabilitySlot[] = [
  { id: "av-1", billboard_id: "bb-1", start_date: "2025-01-01", end_date: "2025-06-30", is_available: true, note: null },
  { id: "av-2", billboard_id: "bb-1", start_date: "2025-03-15", end_date: "2025-03-31", is_available: false, note: "Booked for event" },
  { id: "av-3", billboard_id: "bb-2", start_date: "2025-01-01", end_date: "2025-12-31", is_available: true, note: null },
  { id: "av-4", billboard_id: "bb-3", start_date: "2025-02-01", end_date: "2025-08-31", is_available: true, note: null },
];

export const MOCK_OWNER_PROFILE: ProfileRow = {
  id: "owner-1",
  display_name: "Rajesh Verma",
  company_name: "Skyline Outdoor Media",
  avatar_url: null,
  bio: "Leading outdoor media company with 15+ years of experience across Hyderabad and Delhi NCR.",
  city: "Hyderabad",
  phone: "+91 9876543210",
  contact_email: "rajesh@skylineoutdoor.in",
};

export const MOCK_CITIES = [
  { city: "Hyderabad", count: 2 },
  { city: "Mumbai", count: 2 },
  { city: "Bangalore", count: 1 },
  { city: "Delhi", count: 1 },
];

/** Fetch featured billboards (development fixtures). */
export function fetchFeaturedBillboards(limit = 6): BillboardWithImages[] {
  return MOCK_BILLBOARDS.filter((b) => b.status === "published" && b.is_visible).slice(0, limit);
}

/** Fetch popular cities (development fixtures). */
export function fetchPopularCities() {
  return MOCK_CITIES;
}

export type BrowseFilters = {
  q?: string;
  city?: string;
  types?: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
  minWidth?: number | null;
  minHeight?: number | null;
  availability?: string;
  illuminatedOnly?: boolean;
  sort?: "recent" | "price_asc" | "price_desc";
};

/** Filter and return billboards (development fixtures). */
export function fetchPublicBillboards(filters: BrowseFilters = {}): BillboardWithImages[] {
  let results = MOCK_BILLBOARDS.filter((b) => b.status === "published" && b.is_visible);

  if (filters.q?.trim()) {
    const term = filters.q.trim().toLowerCase();
    results = results.filter(
      (b) =>
        b.title.toLowerCase().includes(term) ||
        b.city.toLowerCase().includes(term) ||
        b.address.toLowerCase().includes(term) ||
        (b.area ?? "").toLowerCase().includes(term),
    );
  }
  if (filters.city?.trim()) {
    const city = filters.city.trim().toLowerCase();
    results = results.filter((b) => b.city.toLowerCase().includes(city));
  }
  if (filters.types?.length) {
    results = results.filter((b) => filters.types!.includes(b.billboard_type));
  }
  if (filters.minPrice != null) results = results.filter((b) => b.price >= filters.minPrice!);
  if (filters.maxPrice != null) results = results.filter((b) => b.price <= filters.maxPrice!);
  if (filters.minWidth != null) results = results.filter((b) => b.width >= filters.minWidth!);
  if (filters.minHeight != null) results = results.filter((b) => b.height >= filters.minHeight!);
  if (filters.availability && filters.availability !== "any") {
    results = results.filter((b) => b.availability === filters.availability);
  }
  if (filters.illuminatedOnly) results = results.filter((b) => b.is_illuminated);

  if (filters.sort === "price_asc") results.sort((a, b) => a.price - b.price);
  else if (filters.sort === "price_desc") results.sort((a, b) => b.price - a.price);

  return results;
}

/** Fetch billboard detail (development fixture). */
export function fetchBillboardDetail(id: string) {
  const billboard = MOCK_BILLBOARDS.find((b) => b.id === id);
  if (!billboard) return null;
  const availability = MOCK_AVAILABILITY.filter((a) => a.billboard_id === id);
  return { billboard, owner: MOCK_OWNER_PROFILE, availability };
}
