import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { fetchSavedBillboards } from "@/lib/api";
import { BillboardCard } from "@/components/marketplace/BillboardCard";

export function SavedPage() {
  const { user } = useAuth();
  const [billboards, setBillboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedBillboards(user.id)
        .then((data) => setBillboards(data))
        .catch((err) => console.error("Error fetching saved billboards:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">Sign in required</h1>
        <p className="mt-2 text-muted-foreground">Please sign in to view your saved billboards.</p>
        <Button className="mt-6" asChild>
          <Link to="/auth">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Saved billboards</h1>
      <p className="mt-1 text-sm text-muted-foreground">Spaces you've shortlisted.</p>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Loading saved billboards...</div>
      ) : billboards.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <Heart className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-3 font-semibold">No saved billboards yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any listing to add it here.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button asChild>
              <Link to="/browse">Browse billboards</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {billboards.map((billboard) => (
            <BillboardCard key={billboard.id} billboard={billboard} />
          ))}
        </div>
      )}
    </div>
  );
}
