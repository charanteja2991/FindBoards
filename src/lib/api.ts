import { supabase } from "./supabase";
import type { BrowseFilters, BillboardWithImages } from "./domain";

// Type-safe wrapper for Supabase operations with less strict typing for updates

/**
 * Fetch public billboards with filters
 */
export async function fetchPublicBillboards(filters: BrowseFilters = {}): Promise<BillboardWithImages[]> {
  let query = supabase
    .from("billboards")
    .select(`
      *,
      billboard_images (
        id,
        url,
        alt_text,
        sort_order,
        is_cover
      )
    `)
    .eq("status", "published")
    .eq("is_visible", true);

  // Apply filters
  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }

  if (filters.type && filters.type.length > 0) {
    query = query.in("billboard_type", filters.type);
  }

  if (filters.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters.illuminated !== undefined) {
    query = query.eq("is_illuminated", filters.illuminated);
  }

  if (filters.search) {
    query = query.textSearch("title", filters.search);
  }

  // Sorting
  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    newest: { column: "created_at", ascending: false },
    "price-low": { column: "price", ascending: true },
    "price-high": { column: "price", ascending: false },
    popular: { column: "views", ascending: false },
  };

  const sort = sortMap[filters.sort || "newest"];
  if (sort) {
    query = query.order(sort.column, { ascending: sort.ascending });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching billboards:", error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch a single billboard with full details
 */
export async function fetchBillboardDetail(id: string): Promise<BillboardWithImages | null> {
  const { data, error } = await supabase
    .from("billboards")
    .select(`
      *,
      billboard_images (
        id,
        url,
        alt_text,
        sort_order,
        is_cover
      ),
      profiles!billboards_owner_id_fkey (
        id,
        display_name,
        company_name,
        bio,
        avatar_url
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching billboard detail:", error);
    return null;
  }

  // Increment view count (fire and forget)
  const currentViews = (data as any).views || 0;
  (supabase as any)
    .from("billboards")
    .update({ views: currentViews + 1 })
    .eq("id", id)
    .then();

  return data;
}

/**
 * Fetch featured billboards (for homepage)
 */
export async function fetchFeaturedBillboards(limit = 6): Promise<BillboardWithImages[]> {
  const { data, error } = await supabase
    .from("billboards")
    .select(`
      *,
      billboard_images (
        id,
        url,
        alt_text,
        sort_order,
        is_cover
      )
    `)
    .eq("status", "published")
    .eq("is_visible", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured billboards:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch popular cities with billboard count
 */
export async function fetchPopularCities(): Promise<Array<{ city: string; count: number }>> {
  const { data, error } = await supabase
    .from("billboards")
    .select("city")
    .eq("status", "published")
    .eq("is_visible", true);

  if (error) {
    console.error("Error fetching cities:", error);
    return [];
  }

  // Group by city and count
  const cityMap = new Map<string, number>();
  data?.forEach((row: any) => {
    const count = cityMap.get(row.city) || 0;
    cityMap.set(row.city, count + 1);
  });

  // Convert to array and sort by count
  return Array.from(cityMap.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

/**
 * Fetch saved billboards for a user
 */
export async function fetchSavedBillboards(userId: string): Promise<BillboardWithImages[]> {
  const { data, error } = await supabase
    .from("saved_billboards")
    .select(`
      billboard_id,
      billboards (
        *,
        billboard_images (
          id,
          url,
          alt_text,
          sort_order,
          is_cover
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching saved billboards:", error);
    return [];
  }

  return data?.map((item: any) => item.billboards).filter(Boolean) || [];
}

/**
 * Check if a billboard is saved by the user
 */
export async function isBillboardSaved(userId: string, billboardId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("saved_billboards")
    .select("id")
    .eq("user_id", userId)
    .eq("billboard_id", billboardId)
    .maybeSingle();

  if (error) {
    console.error("Error checking saved status:", error);
    return false;
  }

  return !!data;
}

/**
 * Save a billboard
 */
export async function saveBillboard(userId: string, billboardId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from("saved_billboards")
    .insert({ user_id: userId, billboard_id: billboardId } as any);

  return { error: error as any };
}

/**
 * Unsave a billboard
 */
export async function unsaveBillboard(userId: string, billboardId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from("saved_billboards")
    .delete()
    .eq("user_id", userId)
    .eq("billboard_id", billboardId);

  return { error };
}

/**
 * Fetch billboards owned by a user
 */
export async function fetchMyBillboards(ownerId: string): Promise<BillboardWithImages[]> {
  const { data, error } = await supabase
    .from("billboards")
    .select(`
      *,
      billboard_images (
        id,
        url,
        alt_text,
        sort_order,
        is_cover
      )
    `)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching my billboards:", error);
    return [];
  }

  return data || [];
}

/**
 * Create a new billboard
 */
export async function createBillboard(billboard: any): Promise<{ data: any; error: Error | null }> {
  const { data, error } = await supabase
    .from("billboards")
    .insert(billboard as any)
    .select()
    .single();

  return { data, error: error as any };
}

/**
 * Update a billboard
 */
export async function updateBillboard(id: string, updates: any): Promise<{ error: Error | null }> {
  const { error } = await (supabase as any)
    .from("billboards")
    .update(updates)
    .eq("id", id);

  return { error: error as any };
}

/**
 * Delete a billboard
 */
export async function deleteBillboard(id: string): Promise<{ error: Error | null }> {
  try {
    // Try via database RPC (trusted middleman bypassing RLS restrictions)
    const { error: rpcError } = await (supabase.rpc as any)('delete_billboard_fully', {
      board_id: id,
    });

    if (!rpcError) {
      return { error: null };
    }

    // Fallback: client-side deletion of child records and billboard
    await supabase.from("bookings").delete().eq("billboard_id", id);
    await supabase.from("booking_requests").delete().eq("billboard_id", id);
    await supabase.from("billboard_availability").delete().eq("billboard_id", id);
    await supabase.from("billboard_images").delete().eq("billboard_id", id);
    await supabase.from("saved_billboards").delete().eq("billboard_id", id);

    const { error } = await supabase
      .from("billboards")
      .delete()
      .eq("id", id);

    return { error };
  } catch (err: any) {
    return { error: err };
  }
}

/**
 * Upload billboard image to storage
 */
export async function uploadBillboardImage(file: File, billboardId: string): Promise<{ url: string | null; error: Error | null }> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${billboardId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("billboard-images")
    .upload(fileName, file);

  if (uploadError) {
    return { url: null, error: uploadError };
  }

  const { data } = supabase.storage
    .from("billboard-images")
    .getPublicUrl(fileName);

  return { url: data.publicUrl, error: null };
}

/**
 * Add image record to database
 */
export async function addBillboardImage(image: {
  billboard_id: string;
  url: string;
  storage_path?: string;
  alt_text?: string;
  sort_order?: number;
  is_cover?: boolean;
}): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from("billboard_images")
    .insert(image as any);

  return { error: error as any };
}

/**
 * Delete billboard image
 */
export async function deleteBillboardImage(imageId: string, storagePath?: string): Promise<{ error: Error | null }> {
  // Delete from database
  const { error: dbError } = await supabase
    .from("billboard_images")
    .delete()
    .eq("id", imageId);

  if (dbError) {
    return { error: dbError };
  }

  // Delete from storage if path provided
  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from("billboard-images")
      .remove([storagePath]);

    if (storageError) {
      console.error("Error deleting from storage:", storageError);
    }
  }

  return { error: null };
}
