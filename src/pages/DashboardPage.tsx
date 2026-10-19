import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Building2, FileText, Globe2, Inbox, Plus, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    pendingRequests: 0,
    acceptedBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOwnerStats(user.id);
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadOwnerStats = async (ownerId: string) => {
    try {
      // Fetch billboards
      const { data: billboards, error: bbError } = await supabase
        .from("billboards")
        .select("status")
        .eq("owner_id", ownerId);

      if (bbError) throw bbError;

      const total = billboards?.length || 0;
      const published = billboards?.filter((b: any) => b.status === "published").length || 0;
      const drafts = total - published;

      // Fetch booking requests
      const { count: pendingCount } = await supabase
        .from("booking_requests")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", ownerId)
        .eq("status", "pending");

      // Fetch confirmed bookings
      const { count: bookingCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", ownerId);

      setStats({
        total,
        published,
        drafts,
        pendingRequests: pendingCount || 0,
        acceptedBookings: bookingCount || 0,
      });
    } catch (err) {
      console.error("Error loading owner stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">Sign in required</h1>
        <p className="mt-2 text-muted-foreground">Please sign in as an owner to view your dashboard.</p>
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
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Welcome back{profile?.display_name ? `, ${profile.display_name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Your listings and booking activity at a glance.</p>
        </div>
        <Button asChild className="bg-brand hover:bg-brand-dark">
          <Link to="/billboards/new">
            <Plus className="mr-2 size-4" /> Add billboard
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={<Building2 className="size-4" />} label="Total billboards" value={loading ? "..." : stats.total} />
        <StatCard icon={<Globe2 className="size-4" />} label="Published" value={loading ? "..." : stats.published} />
        <StatCard icon={<FileText className="size-4" />} label="Drafts / unpublished" value={loading ? "..." : stats.drafts} />
        <StatCard icon={<Inbox className="size-4" />} label="Pending requests" value={loading ? "..." : stats.pendingRequests} />
        <StatCard icon={<CheckCircle2 className="size-4" />} label="Accepted bookings" value={loading ? "..." : stats.acceptedBookings} />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/my-billboards"
          className="rounded-2xl border border-border bg-card p-5 transition hover:border-brand/40"
        >
          <BarChart3 className="size-5 text-brand" />
          <p className="mt-3 font-semibold">My billboards</p>
          <p className="mt-1 text-sm text-muted-foreground">Edit, publish, unpublish or remove your listings.</p>
        </Link>
        <Link
          to="/owner/requests"
          className="rounded-2xl border border-border bg-card p-5 transition hover:border-brand/40"
        >
          <Inbox className="size-5 text-brand" />
          <p className="mt-3 font-semibold">Booking requests</p>
          <p className="mt-1 text-sm text-muted-foreground">Review, accept, or reject advertiser inquiries.</p>
        </Link>
        <Link to="/billboards/new" className="rounded-2xl border border-border bg-card p-5 transition hover:border-brand/40">
          <Plus className="size-5 text-brand" />
          <p className="mt-3 font-semibold">Add a billboard</p>
          <p className="mt-1 text-sm text-muted-foreground">List a new advertising space in seven guided steps.</p>
        </Link>
        <Link
          to="/browse"
          className="rounded-2xl border border-border bg-card p-5 transition hover:border-brand/40"
        >
          <Globe2 className="size-5 text-brand" />
          <p className="mt-3 font-semibold">View public marketplace</p>
          <p className="mt-1 text-sm text-muted-foreground">See what advertisers see when they browse spaces.</p>
        </Link>
      </div>
    </div>
  );
}
