import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Upload, Trash2, Globe2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LocationPicker } from "@/components/owner/LocationPicker";

export function EditBillboardPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchBillboard(id);
    }
  }, [id]);

  const fetchBillboard = async (billboardId: string) => {
    try {
      const { data, error } = await supabase
        .from("billboards")
        .select(`
          *,
          billboard_images (
            id,
            url,
            storage_path,
            alt_text,
            sort_order,
            is_cover
          )
        `)
        .eq("id", billboardId)
        .single();

      if (error) throw error;
      if (data) {
        setForm(data);
        setImages((data as any).billboard_images || []);
      }
    } catch (err: any) {
      toast.error("Failed to load billboard: " + err.message);
      navigate("/my-billboards");
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("billboards")
        .update({
          title: form.title,
          description: form.description,
          billboard_type: form.billboard_type,
          address: form.address,
          city: form.city,
          state: form.state,
          country: form.country,
          latitude: parseFloat(form.latitude) || 17.3850,
          longitude: parseFloat(form.longitude) || 78.4867,
          price: parseFloat(form.price),
          price_period: form.price_period,
          status: form.status,
          is_illuminated: form.is_illuminated,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Billboard updated successfully!");
      navigate("/my-billboards");
    } catch (err: any) {
      toast.error("Error updating billboard: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this billboard?")) return;
    try {
      const { error } = await supabase.from("billboards").delete().eq("id", id);
      if (error) throw error;
      toast.success("Billboard deleted successfully.");
      navigate("/my-billboards");
    } catch (err: any) {
      toast.error("Failed to delete billboard: " + err.message);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-muted-foreground">Loading billboard...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/my-billboards">
            <ArrowLeft className="mr-2 size-4" /> Back to My Billboards
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/billboards/${id}`} target="_blank">
              <Globe2 className="mr-2 size-4" /> View Public
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 size-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold mb-6">Edit Billboard</h1>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Billboard Title *</Label>
            <Input
              id="title"
              value={form.title || ""}
              onChange={(e) => updateForm("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description || ""}
              onChange={(e) => updateForm("description", e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={form.city || ""}
                onChange={(e) => updateForm("city", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Listing Status *</Label>
              <select
                id="status"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm capitalize"
                value={form.status || "draft"}
                onChange={(e) => updateForm("status", e.target.value)}
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Public)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={form.latitude ?? ""}
                onChange={(e) => updateForm("latitude", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={form.longitude ?? ""}
                onChange={(e) => updateForm("longitude", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={form.price || ""}
                onChange={(e) => updateForm("price", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_period">Pricing Period *</Label>
              <select
                id="price_period"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm capitalize"
                value={form.price_period || "monthly"}
                onChange={(e) => updateForm("price_period", e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label>Billboard Location (Click map to repin or drag marker)</Label>
            <LocationPicker
              lat={form.latitude != null ? parseFloat(form.latitude) : 17.3850}
              lng={form.longitude != null ? parseFloat(form.longitude) : 78.4867}
              onChange={(lat, lng) => {
                updateForm("latitude", lat);
                updateForm("longitude", lng);
              }}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_illuminated"
              checked={!!form.is_illuminated}
              onChange={(e) => updateForm("is_illuminated", e.target.checked)}
              className="size-4 rounded border-border text-brand focus:ring-brand"
            />
            <Label htmlFor="is_illuminated" className="cursor-pointer font-normal">
              Illuminated / Backlit (visible 24/7)
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <Button type="button" variant="outline" asChild>
              <Link to="/my-billboards">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 size-4" /> {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
