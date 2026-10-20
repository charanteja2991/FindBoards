import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { MapPin, Ruler, Sun, CalendarDays, ExternalLink, Calendar, MessageSquare } from "lucide-react";
import { fetchBillboardDetail } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  availabilityLabel,
  dimensions,
  googleMapsUrl,
  locationLine,
  periodLabel,
  typeLabel,
} from "@/lib/domain";
import { formatDateRange, formatMoney } from "@/lib/format";
import { SaveButton } from "@/components/marketplace/SaveButton";
import { BillboardMap } from "@/components/marketplace/BillboardMap";

export function BillboardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isOwner } = useAuth();
  const [data, setData] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Booking modal state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadDetails(id);
    }
  }, [id, user, isOwner]);

  const loadDetails = async (billboardId: string) => {
    try {
      const billboard = await fetchBillboardDetail(billboardId);
      setData(billboard);

      // Fetch availability
      const { data: availData } = await supabase
        .from("billboard_availability")
        .select("*")
        .eq("billboard_id", billboardId);

      setAvailability(availData || []);

      if (user && !isOwner) {
        const { data: reqData } = await supabase
          .from("booking_requests")
          .select("id, status")
          .eq("billboard_id", billboardId)
          .eq("advertiser_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);
        if (reqData && reqData.length > 0 && reqData[0]) {
          const req = reqData[0] as { id: string; status: string };
          const localStatus = localStorage.getItem(`request_status_${req.id}`);
          const effectiveStatus = localStatus || req.status;
          if (effectiveStatus === "pending" || effectiveStatus === "accepted") {
            setExistingRequest({ id: req.id, status: effectiveStatus });
          } else {
            setExistingRequest(null);
          }
        } else {
          setExistingRequest(null);
        }
      } else {
        setExistingRequest(null);
      }
    } catch (err) {
      console.error("Error loading billboard details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-muted-foreground">Loading billboard...</div>;
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold">This billboard isn't available</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been unpublished by its owner. Browse other spaces instead.
        </p>
        <Link
          to="/browse"
          className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
        >
          Browse billboards
        </Link>
      </div>
    );
  }

  const billboard = data;
  const owner = data.profiles;
  const gallery = [...(billboard.billboard_images ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order);
  const cover = gallery.find((img: any) => img.is_cover) || gallery[0];
  const lat = Number(billboard.latitude);
  const lng = Number(billboard.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);

  return (
    <article className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/browse" className="text-sm font-medium text-brand hover:text-brand-dark">
        ← Back to browse
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">{billboard.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {billboard.address ? `${billboard.address}, ` : ""}
            {locationLine(billboard)}
          </p>
        </div>
        <SaveButton billboardId={billboard.id} variant="full" className="relative right-auto top-auto" />
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {cover ? (
            <img
              src={cover.url}
              alt={cover.alt_text ?? `${billboard.title} in ${billboard.city}`}
              className="aspect-[16/9] w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="grid aspect-[16/9] w-full place-items-center rounded-2xl bg-muted text-sm text-muted-foreground">
              No photo provided
            </div>
          )}

          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {gallery.slice(0, 4).map((img: any) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.alt_text ?? billboard.title}
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
              ))}
            </div>
          )}

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">About this space</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {billboard.description || "The owner hasn't added a description yet."}
            </p>

            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              <Fact icon={<Ruler className="size-4" />} label="Size" value={dimensions(billboard)} />
              <Fact icon={<Sun className="size-4" />} label="Lighting" value={billboard.is_illuminated ? "Illuminated" : "Non-lit"} />
              <Fact icon={<CalendarDays className="size-4" />} label="Type" value={typeLabel(billboard.billboard_type)} />
            </dl>
          </section>

          {hasCoords && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">Location</h2>
                <a
                  href={googleMapsUrl(lat, lng)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-dark"
                >
                  Open in Google Street View <ExternalLink className="size-3.5" />
                </a>
              </div>
              <div className="h-64 w-full overflow-hidden rounded-xl bg-muted">
                <BillboardMap lat={lat} lng={lng} title={billboard.title} />
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-panel)]">
            <p className="font-display text-3xl font-semibold">
              {formatMoney(billboard.price, billboard.currency)}
            </p>
            <p className="text-sm text-muted-foreground">{periodLabel(billboard.price_period)}</p>
            <span className="mt-4 inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              {availabilityLabel(billboard.availability)}
            </span>
            <p className="mt-4 text-sm">
              <span className="text-muted-foreground">Minimum booking period:</span>{" "}
              <span className="font-semibold">
                {billboard.min_booking_days} day{billboard.min_booking_days === 1 ? "" : "s"}
              </span>
            </p>

            <div className="mt-6">
              {isOwner ? (
                <div className="rounded-xl bg-muted p-3 text-center text-xs text-muted-foreground">
                  Billboard owners cannot submit booking requests.
                </div>
              ) : existingRequest?.status === "pending" ? (
                <Button disabled className="w-full bg-muted text-muted-foreground font-semibold cursor-not-allowed">
                  Request Pending
                </Button>
              ) : existingRequest?.status === "accepted" ? (
                <Button disabled className="w-full bg-emerald-600 text-white font-semibold cursor-not-allowed">
                  Request Accepted
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (!user) {
                      navigate("/auth");
                      return;
                    }
                    setRequestModalOpen(true);
                  }}
                  className="w-full bg-brand hover:bg-brand-dark text-white font-semibold"
                >
                  Request this board
                </Button>
              )}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              {isOwner
                ? "Switch to an advertiser account to browse and request billboards."
                : !user
                ? "Booking requests open up once you sign in — browsing stays free and open."
                : null}
            </p>
          </div>

          {/* Request Booking Modal */}
          <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Request to book {billboard.title}</DialogTitle>
                <DialogDescription>
                  Choose your campaign dates. Minimum booking duration is {billboard.min_booking_days} days. The owner will review and respond to your request.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!user) {
                    navigate("/auth");
                    return;
                  }
                  if (!startDate || !endDate) {
                    toast.error("Please select both start and end dates.");
                    return;
                  }

                  const todayStr = new Date().toISOString().split("T")[0] || "";
                  if (startDate < todayStr) {
                    toast.error("Start date cannot be in the past.");
                    return;
                  }
                  if (endDate < startDate) {
                    toast.error("End date cannot be earlier than start date.");
                    return;
                  }

                  const start = new Date(startDate);
                  const end = new Date(endDate);
                  const diffTime = end.getTime() - start.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                  if (diffDays < billboard.min_booking_days) {
                    toast.error(`Minimum booking duration for this board is ${billboard.min_booking_days} days (you requested ${diffDays} days).`);
                    return;
                  }

                  setSubmitting(true);
                  try {
                    const { error } = await (supabase.from("booking_requests") as any).insert({
                      billboard_id: billboard.id,
                      advertiser_id: user.id,
                      owner_id: billboard.owner_id,
                      start_date: startDate,
                      end_date: endDate,
                      campaign_name: campaignName.trim() || "Advertising Campaign",
                      message: message.trim() || null,
                      status: "pending",
                    });

                    if (error) throw error;

                    toast.success("Booking request submitted successfully! The owner will review it soon.");
                    setExistingRequest({ status: "pending" });
                    setRequestModalOpen(false);
                    setStartDate("");
                    setEndDate("");
                    setCampaignName("");
                    setMessage("");
                  } catch (err: any) {
                    toast.error("Failed to submit request: " + err.message);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="mt-4 space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="campaignName">Campaign Name</Label>
                  <Input
                    id="campaignName"
                    placeholder="e.g. Summer Launch 2026"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      required
                      min={startDate || new Date().toISOString().split("T")[0]}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message to Owner (optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Share details about your brand or special creative needs..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRequestModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-brand hover:bg-brand-dark text-white"
                  >
                    {submitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {availability.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-base font-semibold">Availability calendar</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {[...availability]
                  .sort((a: any, z: any) => a.start_date.localeCompare(z.start_date))
                  .map((slot: any) => (
                  <li key={slot.id} className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">{formatDateRange(slot.start_date, slot.end_date)}</span>
                    <span className="font-medium">{slot.is_available ? "Available" : "Blocked"}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {owner && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-base font-semibold">Listed by</h2>
              <p className="mt-2 font-medium">{owner.company_name || owner.display_name || "Verified owner"}</p>
              {owner.bio && <p className="mt-1 text-sm text-muted-foreground">{owner.bio}</p>}
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-4">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}
