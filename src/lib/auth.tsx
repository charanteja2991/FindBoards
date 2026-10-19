import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { AppRole, ProfileRow } from "@/lib/domain";

type AuthGate = {
  open: boolean;
  title: string;
  description: string;
};

type AuthContextValue = {
  user: User | null;
  profile: ProfileRow | null;
  roles: AppRole[];
  loading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isAdvertiser: boolean;
  gate: AuthGate;
  requireAuth: (options: { title: string; description: string }, action: () => void) => void;
  closeGate: () => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string, role?: "advertiser" | "owner" | "both") => Promise<{ error: Error | null }>;
  toggleRole: (role: AppRole, add: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const CLOSED_GATE: AuthGate = { open: false, title: "", description: "" };

/**
 * Supabase authentication provider.
 * Manages user authentication state, profile data, and role assignments.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [gate, setGate] = useState<AuthGate>(CLOSED_GATE);

  // Fetch user profile and roles
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (rolesError) throw rolesError;
      setRoles(rolesData?.map((r: any) => r.role) || []);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
      setRoles([]);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setRoles([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const requireAuth: AuthContextValue["requireAuth"] = useCallback(
    (options, action) => {
      if (user) {
        action();
      } else {
        window.location.href = "/auth";
      }
    },
    [user],
  );

  const closeGate = useCallback(() => {
    setGate(CLOSED_GATE);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string, role: "advertiser" | "owner" | "both" = "advertiser") => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) return { error };

    if (data.user) {
      // Ensure profile exists
      await (supabase as any)
        .from("profiles")
        .upsert({
          id: data.user.id,
          email,
          display_name: displayName || email.split("@")[0],
        }, { onConflict: "id" });

      // Insert roles
      const rolesToInsert: AppRole[] = [];
      if (role === "advertiser" || role === "both") rolesToInsert.push("advertiser");
      if (role === "owner" || role === "both") rolesToInsert.push("owner");

      for (const r of rolesToInsert) {
        await (supabase as any)
          .from("user_roles")
          .upsert({ user_id: data.user.id, role: r }, { onConflict: "user_id,role" });
      }
    }

    return { error: null };
  }, []);

  const toggleRole = useCallback(async (roleToToggle: AppRole, add: boolean) => {
    if (!user) return;
    if (add) {
      await (supabase as any)
        .from("user_roles")
        .upsert({ user_id: user.id, role: roleToToggle }, { onConflict: "user_id,role" });
    } else {
      await (supabase as any)
        .from("user_roles")
        .delete()
        .eq("user_id", user.id)
        .eq("role", roleToToggle);
    }
    await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const isAdmin = useMemo(() => roles.includes("admin"), [roles]);
  const isOwner = useMemo(() => roles.includes("owner"), [roles]);
  const isAdvertiser = useMemo(() => roles.includes("advertiser"), [roles]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      roles,
      loading,
      isAdmin,
      isOwner,
      isAdvertiser,
      gate,
      requireAuth,
      closeGate,
      refreshProfile,
      signOut,
      signIn,
      signInWithGoogle,
      signUp,
      toggleRole,
    }),
    [user, profile, roles, loading, isAdmin, isOwner, isAdvertiser, gate, requireAuth, closeGate, refreshProfile, signOut, signIn, signInWithGoogle, signUp, toggleRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
