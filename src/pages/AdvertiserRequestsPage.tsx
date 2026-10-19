import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Inbox, Calendar, MessageSquare, Building2, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatMoney } from "@/lib/format";
import { locationLine } from "@/lib/domain";

export function AdvertiserRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (user) {
      loadRequests(user.id);
      localStorage.setItem(`advertiser_requests_viewed_at_${user.id}`, new Date().toISOString());
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadRequests = async (advertiserId: string) => {
    try {
      const { data, error } = await supabase
        .from("booking_requests")
        .select(`
          *,
          billboards (
            id,
            title,
            city,
            address,
            area,
            state,
            price,
            price_period,
            billboard_images (
              url,
              is_cover,
              sort_order
            )
          ),
          profiles!booking_requests_owner_id_fkey (
            id,
            display_name,
            company_name,
            email,
            phone
          )
        `)
        .eq("advertiser_id", advertiserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      toast.error("Failed to load your booking requests: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      const { error } = await (supabase.from("booking_requests") as any)
        .update({
          status: "cancelled",
          owner_response: "Cancelled by advertiser",
        })
        .eq("id", requestId);

      if (error) throw error;
      toast.success("Booking request cancelled.");
      loadRequests(user!.id);
    } catch (err: any) {
      toast.error("Failed to cancel request: " + err.message);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">Sign in required</h1>
        <p className="mt-2 text-muted-foreground">Please sign in to view your submitted booking requests.</p>
        <Button className="mt-6" asChild>
          <Link to="/auth">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">My Booking Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track the status of your submitted billboard booking inquiries.</p>
        </div>
        <Button asChild className="bg-brand hover:bg-brand-dark text-white">
          <Link to="/browse">Browse More Billboards</Link>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Loading your booking requests...</div>
      ) : (
        <>
          {/* Filters & Search */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {["all", "pending", "accepted", "declined", "cancelled", "superseded"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                    filterStatus === status
                      ? "bg-brand text-white shadow-sm"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="w-full md:w-72">
              <input
                type="text"
                placeholder="Search campaign or billboard title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center bg-card">
              <Inbox className="mx-auto size-10 text-muted-foreground/60" />
              <p className="mt-3 font-semibold text-lg">No booking requests submitted yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Browse our marketplace and request to book your first billboard.</p>
              <Button asChild className="mt-5 bg-brand hover:bg-brand-dark text-white">
                <Link to="/browse">Browse Billboards</Link>
              </Button>
            </div>
          ) : requests.filter((req) => {
              const matchesStatus = filterStatus === "all" || req.status === filterStatus;
              const query = searchQuery.toLowerCase();
              const matchesSearch =
                !query ||
                req.campaign_name?.toLowerCase().includes(query) ||
                req.billboards?.title?.toLowerCase().includes(query);
              return matchesStatus && matchesSearch;
            }).length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center bg-card">
              <Inbox className="mx-auto size-10 text-muted-foreground/60" />
              <p className="mt-3 font-semibold text-lg">No matching requests found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {requests
                .filter((req) => {
                  const matchesStatus = filterStatus === "all" || req.status === filterStatus;
                  const query = searchQuery.toLowerCase();
                  const matchesSearch =
                    !query ||
                    req.campaign_name?.toLowerCase().includes(query) ||
                    req.billboards?.title?.toLowerCase().includes(query);
                  return matchesStatus && matchesSearch;
                })
                .map((req) => {
                  const board = req.billboards;
                  const owner = req.profiles;
                  const images = board?.billboard_images || [];
                  const cover = images.find((i: any) => i.is_cover) || images[0];
                  const isDeclinedOrCancelled = req.status === "declined" || req.status === "cancelled";

                  return (
                    <div key={req.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex gap-4 items-start flex-1">
                        {/* Status Tinted Image */}
                        <div className={`relative size-28 shrink-0 overflow-hidden rounded-xl ${
                          req.status === "accepted" ? "bg-emerald-500" :
                          isDeclinedOrCancelled ? "bg-red-500" :
                          "bg-black"
                        }`}>
                          {cover ? (
                            <img
                              src={cover.url}
                              alt={board?.title}
                              className={`h-full w-full object-cover transition ${
                                req.status === "pending" ? "grayscale opacity-100" : "opacity-80"
                              }`}
                            />
                          ) : (
                            <div className="grid h-full place-items-center text-xs text-muted-foreground bg-muted">
                              No image
                            </div>
                          )}
                          {req.status === "accepted" && <div className="absolute inset-0 bg-emerald-500/20 pointer-events-none" />}
                          {isDeclinedOrCancelled && <div className="absolute inset-0 bg-red-500/20 pointer-events-none" />}
                        </div>

                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-3">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                                req.status === "accepted" ? "bg-emerald-500/10 text-emerald-600" :
                                isDeclinedOrCancelled ? "bg-destructive/10 text-destructive" :
                                req.status === "superseded" ? "bg-amber-500/10 text-amber-600" :
                                "bg-brand/10 text-brand"
                              }`}>
                                {req.status === "accepted" ? "Confirmed / Accepted" :
                                 req.status === "declined" ? "Declined by Owner" :
                                 req.status === "cancelled" ? "Cancelled" :
                                 req.status === "superseded" ? "No Longer Available" :
                                 "Pending Review"}
                              </span>
                              <span className="text-xs text-muted-foreground">Submitted on {new Date(req.created_at).toLocaleDateString()}</span>
                            </div>

                            {req.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelRequest(req.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 text-xs"
                              >
                                Cancel Request
                              </Button>
                            )}
                          </div>

                          <div>
                            <Link to={`/billboards/${board?.id}`} className="font-display text-lg font-semibold hover:text-brand transition">
                              {board?.title || "Billboard Listing"}
                            </Link>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="size-3.5" /> {locationLine(board || {})} • Campaign: <span className="font-medium text-foreground">{req.campaign_name || "General Campaign"}</span>
                            </p>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2 text-sm bg-muted/30 p-3 rounded-xl">
                            <div className="flex items-center gap-2">
                              <Calendar className="size-4 text-brand" />
                              <span>{req.start_date} to {req.end_date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="size-4 text-brand" />
                              <span>Listed price: {formatMoney(board?.price, board?.currency)}</span>
                            </div>
                          </div>

                          {req.message && (
                            <div className="text-sm bg-muted/50 p-2.5 rounded-lg flex items-start gap-2">
                              <MessageSquare className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                              <p><span className="font-medium">Your Message:</span> "{req.message}"</p>
                            </div>
                          )}

                          {req.owner_response && (
                            <div className="text-sm bg-brand/5 p-3 rounded-lg border border-brand/10">
                              <p className="font-medium text-brand-dark">
                                {isDeclinedOrCancelled
                                  ? `Response: "${req.owner_response}"`
                                  : `Owner Response: "${req.owner_response}"`}
                              </p>
                            </div>
                          )}

                          {owner && (
                            <p className="text-xs text-muted-foreground">
                              Owner contact: {owner.display_name || owner.company_name || "Owner"} ({owner.email || owner.phone || "N/A"})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
