import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Building2, Globe2, Edit3, Trash2, Eye, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchMyBillboards, updateBillboard, deleteBillboard } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function MyBillboardsPage() {
  const { user, isOwner } = useAuth();
  const [billboards, setBillboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMyBillboards();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadMyBillboards = async () => {
    if (!user) return;
    try {
      const data = await fetchMyBillboards(user.id);
      setBillboards(data);
    } catch (err: any) {
      toast.error("Failed to load your billboards");
    } finally {
      setLoading(false);
    }
  };

  const togglePublishStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    try {
      const { error } = await updateBillboard(id, { status: newStatus });
      if (error) throw error;
      toast.success(`Billboard ${newStatus === "published" ? "published" : "unpublished"} successfully!`);
      setBillboards((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this billboard?")) return;
    try {
      const { error } = await deleteBillboard(id);
      if (error) throw error;
      toast.success("Billboard deleted successfully.");
      setBillboards((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      toast.error("Failed to delete: " + err.message);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">Sign in required</h1>
        <p className="mt-2 text-muted-foreground">Please sign in as an owner to manage your billboards.</p>
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
          <h1 className="font-display text-3xl font-semibold tracking-tight">My billboards</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your billboard listings and publishing status.</p>
        </div>
        <Button asChild className="bg-brand hover:bg-brand-dark">
          <Link to="/billboards/new">
            <Plus className="mr-2 size-4" /> Add billboard
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Loading your listings...</div>
      ) : billboards.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center bg-card">
          <Building2 className="mx-auto size-10 text-muted-foreground/60" />
          <p className="mt-3 font-semibold text-lg">No listings yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add your first advertising space to start receiving booking requests.</p>
          <Button className="mt-5" asChild>
            <Link to="/billboards/new">
              <Plus className="mr-2 size-4" /> Add billboard
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {billboards.map((board) => {
            const coverImage = board.billboard_images?.find((img: any) => img.is_cover)?.url || board.billboard_images?.[0]?.url;
            const isPublished = board.status === "published";

            return (
              <div key={board.id} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col shadow-sm">
                <div className="relative h-48 bg-muted">
                  {coverImage ? (
                    <img src={coverImage} alt={board.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
                  )}
                  <span className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                    isPublished ? "bg-emerald-500/90 text-white" : "bg-amber-500/90 text-white"
                  }`}>
                    {board.status}
                  </span>
                </div>

                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase font-medium text-brand">{board.billboard_type?.replace("_", " ")}</span>
                    <h3 className="font-display font-semibold text-lg mt-1 line-clamp-1">{board.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{board.city} • ₹{board.price?.toLocaleString()} / {board.price_period}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/billboards/${board.id}/edit`}>
                          <Edit3 className="size-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/billboards/${board.id}`} target="_blank">
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePublishStatus(board.id, board.status)}
                      >
                        {isPublished ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(board.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
