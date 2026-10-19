import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Inbox, CheckCircle2, XCircle, Calendar, MessageSquare, Building2, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function OwnerRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseNotes, setResponseNotes] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [rejectModalRequest, setRejectModalRequest] = useState<any | null>(null);
  const [rejectComment, setRejectComment] = useState<string>("");

  useEffect(() => {
    if (user) {
      loadRequests(user.id);
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadRequests = async (ownerId: string) => {
    try {
      const { data, error } = await supabase
        .from("booking_requests")
        .select(`
          *,
          billboards (
            id,
            title,
            city,
            price,
            price_period,
            billboard_images (
              url,
              is_cover,
              sort_order
            )
          ),
          profiles!booking_requests_advertiser_id_fkey (
            id,
            display_name,
            company_name,
            email,
            phone
          )
        `)
        .eq("owner_id", ownerId)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      toast.error("Failed to load booking requests: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (request: any) => {
    try {
      // 1. Update request status to accepted
      const { error: reqError } = await (supabase.from("booking_requests") as any)
        .update({
          status: "accepted",
          responded_at: new Date().toISOString(),
          owner_response: responseNotes[request.id] || "Booking request accepted.",
        })
        .eq("id", request.id);

      if (reqError) throw reqError;

      // 2. Insert into bookings table
      const amount = request.billboards?.price || 50000;
      const { error: bookingError } = await (supabase.from("bookings") as any)
        .insert({
          billboard_id: request.billboard_id,
          advertiser_id: request.advertiser_id,
          owner_id: request.owner_id,
          booking_request_id: request.id,
          start_date: request.start_date,
          end_date: request.end_date,
          amount,
          currency: "INR",
          status: "confirmed",
          payment_status: "pending",
        });

      if (bookingError) {
        console.error("Error creating booking record:", bookingError);
      }

      toast.success("Booking request accepted successfully!");
      loadRequests(user!.id);
    } catch (err: any) {
      toast.error("Failed to accept request: " + err.message);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalRequest) return;
    const note = rejectComment.trim() || null;
    try {
      const { error } = await (supabase.from("booking_requests") as any)
        .update({
          status: "declined",
          responded_at: new Date().toISOString(),
          owner_response: note,
        })
        .eq("id", rejectModalRequest.id);

      if (error) throw error;
      toast.success("Booking request rejected.");
      setRejectModalRequest(null);
      setRejectComment("");
      loadRequests(user!.id);
    } catch (err: any) {
      toast.error("Failed to reject request: " + err.message);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">Sign in required</h1>
        <p className="mt-2 text-muted-foreground">Please sign in as an owner to view booking requests.</p>
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
          <h1 className="font-display text-3xl font-semibold tracking-tight">Booking requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review and respond to advertising inquiries for your billboards.</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/dashboard">Owner Dashboard</Link>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Loading booking requests...</div>
      ) : (
        <>
          {/* Filters & Search */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {["all", "pending", "accepted", "declined", "superseded"].map((status) => (
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
                placeholder="Search campaign, billboard or advertiser..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center bg-card">
              <Inbox className="mx-auto size-10 text-muted-foreground/60" />
              <p className="mt-3 font-semibold text-lg">No booking requests yet</p>
              <p className="mt-1 text-sm text-muted-foreground">When advertisers request to book your listings, they will appear here.</p>
            </div>
          ) : requests.filter((req) => {
              const matchesStatus = filterStatus === "all" || req.status === filterStatus;
              const query = searchQuery.toLowerCase();
              const matchesSearch =
                !query ||
                req.campaign_name?.toLowerCase().includes(query) ||
                req.billboards?.title?.toLowerCase().includes(query) ||
                req.profiles?.display_name?.toLowerCase().includes(query) ||
                req.profiles?.company_name?.toLowerCase().includes(query);
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
                    req.billboards?.title?.toLowerCase().includes(query) ||
                    req.profiles?.display_name?.toLowerCase().includes(query) ||
                    req.profiles?.company_name?.toLowerCase().includes(query);
                  return matchesStatus && matchesSearch;
                })
                .map((req) => {
                  const adv = req.profiles;
                  const board = req.billboards;
                  const isPending = req.status === "pending";
                  const images = board?.billboard_images || [];
                  const cover = images.find((i: any) => i.is_cover) || images[0];

                  return (
                    <div key={req.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex gap-4 items-start flex-1">
                        {/* Status Tinted Image */}
                        <div className={`relative size-28 shrink-0 overflow-hidden rounded-xl ${
                          req.status === "accepted" ? "bg-emerald-500" :
                          req.status === "declined" ? "bg-red-500" :
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
                          {req.status === "declined" && <div className="absolute inset-0 bg-red-500/20 pointer-events-none" />}
                        </div>

                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                              req.status === "accepted" ? "bg-emerald-500/10 text-emerald-600" :
                              req.status === "declined" ? "bg-destructive/10 text-destructive" :
                              "bg-amber-500/10 text-amber-600"
                            }`}>
                              {req.status}
                            </span>
                            <span className="text-xs text-muted-foreground">Requested on {new Date(req.created_at).toLocaleDateString()}</span>
                          </div>

                          <div>
                            <h3 className="font-display text-lg font-semibold">{board?.title || "Billboard Listing"}</h3>
                            <p className="text-sm text-muted-foreground">{board?.city} • Campaign: <span className="font-medium text-foreground">{req.campaign_name || "General Campaign"}</span></p>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2 text-sm bg-muted/30 p-4 rounded-xl">
                            <div className="flex items-center gap-2">
                              <Calendar className="size-4 text-brand" />
                              <span>{req.start_date} to {req.end_date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="size-4 text-brand" />
                              <span>{adv?.display_name || adv?.email || "Advertiser"} ({adv?.company_name || "Independent"})</span>
                            </div>
                          </div>

                          {req.message && (
                            <div className="text-sm bg-muted/50 p-3 rounded-lg flex items-start gap-2">
                              <MessageSquare className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                              <p><span className="font-medium">Message:</span> "{req.message}"</p>
                            </div>
                          )}

                          {req.owner_response && (
                            <div className="text-sm bg-brand/5 p-3 rounded-lg border border-brand/10">
                              <p className="font-medium text-brand-dark">Your Response: "{req.owner_response}"</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {isPending && (
                        <div className="w-full md:w-80 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium text-muted-foreground">Response Note (optional)</label>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <button
                                type="button"
                                onClick={() => setResponseNotes({ ...responseNotes, [req.id]: "Accepted! Looking forward to your campaign." })}
                                className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                              >
                                + Accept note
                              </button>
                              <button
                                type="button"
                                onClick={() => setResponseNotes({ ...responseNotes, [req.id]: "Dates requested are unavailable. We can offer alternative dates next week." })}
                                className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                              >
                                + Dates unavailable
                              </button>
                            </div>
                            <Textarea
                              placeholder="Add a note or alternative dates..."
                              value={responseNotes[req.id] || ""}
                              onChange={(e) => setResponseNotes({ ...responseNotes, [req.id]: e.target.value })}
                              rows={2}
                              className="text-xs"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleAccept(req)}
                            >
                              <CheckCircle2 className="mr-1 size-4" /> Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                              onClick={() => {
                                setRejectModalRequest(req);
                                setRejectComment("");
                              }}
                            >
                              <XCircle className="mr-1 size-4" /> Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}

      {/* Reject Confirmation Dialog */}
      {rejectModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg space-y-4">
            <h3 className="font-display text-xl font-semibold">Confirm Rejection</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to reject?
            </p>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Reason for rejection (optional)</label>
              <Textarea
                placeholder="Explain why you are rejecting or suggest alternative dates/billboards..."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRejectModalRequest(null);
                  setRejectComment("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmReject}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
