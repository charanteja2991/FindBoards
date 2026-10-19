import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: profile?.display_name || "",
    company_name: profile?.company_name || "",
    contact_email: profile?.contact_email || user?.email || "",
    phone: profile?.phone || "",
    city: profile?.city || "",
    bio: profile?.bio || "",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be signed in to update your profile");
      return;
    }

    setSaving(true);
    try {
      const updates = {
        display_name: form.display_name,
        company_name: form.company_name,
        contact_email: form.contact_email,
        phone: form.phone,
        city: form.city,
        bio: form.bio,
        updated_at: new Date().toISOString(),
      };

      const { error } = await (supabase as any)
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
      await refreshProfile();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error("Failed to update profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Your profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Owners see these details when you contact them about a space.</p>

      <form
        className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="p-company" label="Business / company name">
            <Input id="p-company" value={form.company_name} onChange={set("company_name")} maxLength={120} />
          </Field>
          <Field id="p-name" label="Contact name">
            <Input id="p-name" value={form.display_name} onChange={set("display_name")} maxLength={80} required />
          </Field>
          <Field id="p-email" label="Contact email">
            <Input id="p-email" type="email" value={form.contact_email} onChange={set("contact_email")} maxLength={160} />
          </Field>
          <Field id="p-phone" label="Phone">
            <Input id="p-phone" type="tel" value={form.phone} onChange={set("phone")} maxLength={20} />
          </Field>
          <Field id="p-city" label="City / location">
            <Input id="p-city" value={form.city} onChange={set("city")} maxLength={80} />
          </Field>
        </div>
        <Field id="p-bio" label="About your business (optional)">
          <Textarea id="p-bio" value={form.bio} onChange={set("bio")} maxLength={600} rows={4} />
        </Field>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save profile"}
        </Button>
      </form>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
