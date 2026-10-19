import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { isBillboardSaved, saveBillboard, unsaveBillboard } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function SaveButton({
  billboardId,
  variant = "icon",
  className,
}: {
  billboardId: string;
  variant?: "icon" | "full";
  className?: string;
}) {
  const { user, isOwner, requireAuth } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !isOwner && billboardId) {
      isBillboardSaved(user.id, billboardId).then(setSaved);
    }
  }, [user, isOwner, billboardId]);

  if (isOwner) {
    return null; // Save billboard option should not be shown or removed for owner
  }

  async function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      requireAuth(
        {
          title: "Sign in to save this billboard",
          description: "Keep a shortlist of the spaces you like and come back to them anytime.",
        },
        () => {},
      );
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (saved) {
        const { error } = await unsaveBillboard(user.id, billboardId);
        if (error) throw error;
        setSaved(false);
        toast.success("Removed from saved billboards");
      } else {
        const { error } = await saveBillboard(user.id, billboardId);
        if (error) throw error;
        setSaved(true);
        toast.success("Saved to your shortlist");
      }
    } catch (err: any) {
      toast.error("Failed to update saved status: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-semibold transition-colors hover:border-brand/40",
          saved && "border-brand/50 text-brand",
          className,
        )}
      >
        <Heart className={cn("size-4", saved && "fill-brand text-brand")} />
        {saved ? "Saved" : "Save billboard"}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from saved" : "Save billboard"}
      onClick={handleClick}
      className={cn(
        "absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-card/95 text-muted-foreground shadow-sm transition-colors hover:text-foreground",
        saved && "text-brand",
        className,
      )}
    >
      <Heart className={cn("size-4", saved && "fill-brand text-brand")} />
    </button>
  );
}
