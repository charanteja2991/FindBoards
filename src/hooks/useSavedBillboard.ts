import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { isBillboardSaved, saveBillboard, unsaveBillboard } from "@/lib/api";

/**
 * Hook to manage saved billboard state
 */
export function useSavedBillboard(billboardId: string) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if billboard is saved on mount
  useEffect(() => {
    if (user) {
      isBillboardSaved(user.id, billboardId).then(setIsSaved);
    } else {
      setIsSaved(false);
    }
  }, [user, billboardId]);

  const toggleSaved = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (isSaved) {
        const { error } = await unsaveBillboard(user.id, billboardId);
        if (!error) {
          setIsSaved(false);
        }
      } else {
        const { error } = await saveBillboard(user.id, billboardId);
        if (!error) {
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error("Error toggling saved:", error);
    } finally {
      setLoading(false);
    }
  };

  return { isSaved, toggleSaved, loading };
}
