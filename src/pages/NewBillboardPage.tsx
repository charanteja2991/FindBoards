import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Upload, MapPin, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LocationPicker } from "@/components/owner/LocationPicker";

const BILLBOARD_TYPES = [
  "highway",
  "digital",
  "roadside",
  "in_mall",
  "transit",
  "wall_wrap",
  "gantry",
  "rooftop",
] as const;

export function NewBillboardPage() {
  const { user, isOwner } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    billboard_type: "highway" as const,
    address: "",
    area: "",
    city: "",
    state: "",
    country: "India",
    latitude: "17.3850",
    longitude: "78.4867",
    width: "40",
    height: "20",
    dimension_unit: "ft" as const,
    is_illuminated: true,
    price: "50000",
    currency: "INR",
    price_period: "monthly" as const,
    min_booking_days: "30",
  });

  const [images, setImages] = useState<Array<{ url: string; storage_path?: string; is_cover: boolean }>>([]);
  const [availability, setAvailability] = useState<Array<{ start_date: string; end_date: string; is_available: boolean; note: string }>>([
    { start_date: new Date().toISOString().split("T")[0] as string, end_date: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0] as string, is_available: true, note: "Standard availability" }
  ]);

  const updateForm = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploadingImage(true);
    try {
      for (const file of Array.from(files)) {
        // Instant local preview object URL
        const localPreviewUrl = URL.createObjectURL(file);
        const tempIndex = images.length;

        // Optimistically add to images with local preview
        setImages((prev) => [
          ...prev,
          { url: localPreviewUrl, is_cover: prev.length === 0 }
        ]);

        const fileExt = file.name.split(".").pop();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `${user.id}/${Date.now()}_${sanitizedName}`;

        const { error: uploadError } = await supabase.storage
          .from("billboard-images")
          .upload(fileName, file, { upsert: true });

        if (uploadError) {
          toast.error(`Storage upload failed for ${file.name}: ${uploadError.message}. Using local preview.`);
          continue;
        }

        const { data } = supabase.storage
          .from("billboard-images")
          .getPublicUrl(fileName);

        if (data?.publicUrl) {
          setImages((prev) =>
            prev.map((img, i) =>
              i === tempIndex + (prev.length - images.length) || img.url === localPreviewUrl
                ? { ...img, url: data.publicUrl, storage_path: fileName }
                : img
            )
          );
        }
      }
      toast.success("Images processed successfully!");
    } catch (err: any) {
      toast.error("Error uploading images: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((img) => img.is_cover)) {
        if (next[0]) next[0].is_cover = true;
      }
      return next;
    });
  };

  const setCoverImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, is_cover: i === index }))
    );
  };

  const handleSubmit = async (publishStatus: "draft" | "published") => {
    if (!user) {
      toast.error("You must be signed in to create a billboard");
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      // 1. Insert billboard record
      const { data: billboardData, error: billboardError } = await supabase
        .from("billboards")
        .insert({
          owner_id: user.id,
          title: form.title,
          description: form.description,
          billboard_type: form.billboard_type,
          address: form.address,
          area: form.area || form.city,
          city: form.city,
          state: form.state,
          country: form.country,
          latitude: parseFloat(form.latitude) || 17.3850,
          longitude: parseFloat(form.longitude) || 78.4867,
          width: parseFloat(form.width) || 40,
          height: parseFloat(form.height) || 20,
          dimension_unit: form.dimension_unit,
          is_illuminated: form.is_illuminated,
          price: parseFloat(form.price) || 50000,
          currency: form.currency,
          price_period: form.price_period,
          min_booking_days: parseInt(form.min_booking_days) || 30,
          status: publishStatus,
          is_visible: true,
          availability: "available",
        } as any)
        .select()
        .single();

      if (billboardError) throw billboardError;
      const billboardId = (billboardData as any).id;

      // 2. Insert images
      if (images.length > 0) {
        const imageRecords = images.map((img, idx) => ({
          billboard_id: billboardId,
          url: img.url.startsWith("blob:") ? "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=800&q=80" : img.url,
          storage_path: img.storage_path || null,
          sort_order: idx,
          is_cover: img.is_cover,
        }));
        const { error: imgError } = await supabase.from("billboard_images").insert(imageRecords as any);
        if (imgError) console.error("Error saving image records:", imgError);
      }

      // 3. Insert availability
      if (availability.length > 0) {
        const availRecords = availability.map((av) => ({
          billboard_id: billboardId,
          start_date: av.start_date,
          end_date: av.end_date,
          is_available: av.is_available,
          note: av.note,
        }));
        const { error: availError } = await supabase.from("billboard_availability").insert(availRecords as any);
        if (availError) console.error("Error saving availability records:", availError);
      }

      toast.success(publishStatus === "published" ? "Billboard published successfully!" : "Billboard saved as draft!");
      navigate("/my-billboards");
    } catch (err: any) {
      toast.error("Error creating billboard: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    "Basic Info",
    "Location",
    "Dimensions",
    "Pricing",
    "Photos",
    "Availability",
    "Review",
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/my-billboards">
            <ArrowLeft className="mr-2 size-4" /> Back to My Billboards
          </Link>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          Step {step} of 7: {steps[step - 1]}
        </span>
      </div>

      <div className="mb-8 flex gap-2">
        {steps.map((s, idx) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full transition-colors ${
              idx + 1 <= step ? "bg-brand" : "bg-border"
            }`}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-semibold">Basic Information</h2>
              <p className="text-sm text-muted-foreground">Give your billboard a clear title and description.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Billboard Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Grand Highway LED Billboard - Electronic City"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe visibility, daily traffic count, surrounding landmarks..."
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billboard_type">Billboard Type *</Label>
                <select
                  id="billboard_type"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm capitalize"
                  value={form.billboard_type}
                  onChange={(e) => updateForm("billboard_type", e.target.value)}
                >
                  {BILLBOARD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_illuminated"
                  checked={form.is_illuminated}
                  onChange={(e) => updateForm("is_illuminated", e.target.checked)}
                  className="size-4 rounded border-border text-brand focus:ring-brand"
                />
                <Label htmlFor="is_illuminated" className="cursor-pointer font-normal">
                  Illuminated / Backlit (visible 24/7)
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-semibold">Location & Address</h2>
              <p className="text-sm text-muted-foreground">Where is your billboard located?</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  placeholder="e.g., Banjara Hills Road No. 12"
                  value={form.address}
                  onChange={(e) => updateForm("address", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g., Hyderabad"
                  value={form.city}
                  onChange={(e) => updateForm("city", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State / Province</Label>
                <Input
                  id="state"
                  placeholder="e.g., Telangana"
                  value={form.state}
                  onChange={(e) => updateForm("state", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => updateForm("country", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area / Neighborhood</Label>
                <Input
                  id="area"
                  placeholder="e.g., Banjara Hills"
                  value={form.area}
                  onChange={(e) => updateForm("area", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => updateForm("latitude", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => updateForm("longitude", e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground flex items-center gap-2">
              <MapPin className="size-4 text-brand shrink-0" />
              <span>You can find exact coordinates via Google Maps by right-clicking your location and copying the coordinates.</span>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Interactive Map Pinpointer</Label>
              <LocationPicker
                lat={parseFloat(form.latitude) || 17.3850}
                lng={parseFloat(form.longitude) || 78.4867}
                onChange={(lat, lng) => {
                  updateForm("latitude", lat.toFixed(6));
                  updateForm("longitude", lng.toFixed(6));
                }}
              />
            </div>
          </div>
        )}

        {/* Step 3: Dimensions */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-semibold">Dimensions & Size</h2>
              <p className="text-sm text-muted-foreground">Specify the physical width and height of the billboard.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="width">Width *</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.1"
                  value={form.width}
                  onChange={(e) => updateForm("width", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height *</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={form.height}
                  onChange={(e) => updateForm("height", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimension_unit">Unit</Label>
                <select
                  id="dimension_unit"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  value={form.dimension_unit}
                  onChange={(e) => updateForm("dimension_unit", e.target.value)}
                >
                  <option value="ft">Feet (ft)</option>
                  <option value="m">Meters (m)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Pricing */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-semibold">Pricing & Rental Terms</h2>
              <p className="text-sm text-muted-foreground">Set your rental price and minimum booking duration.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => updateForm("price", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={form.currency}
                  onChange={(e) => updateForm("currency", e.target.value)}
                  maxLength={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_period">Period *</Label>
                <select
                  id="price_period"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm capitalize"
                  value={form.price_period}
                  onChange={(e) => updateForm("price_period", e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="min_booking_days">Minimum Booking Duration (Days) *</Label>
                <Input
                  id="min_booking_days"
                  type="number"
                  value={form.min_booking_days}
                  onChange={(e) => updateForm("min_booking_days", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Photos */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-semibold">Billboard Photos</h2>
              <p className="text-sm text-muted-foreground">Upload high-resolution photos. First photo or cover image is featured.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-border p-6 text-center">
                <label className="cursor-pointer space-y-2">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <Upload className="size-5" />
                  </div>
                  <p className="font-medium">Click to upload photos</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadingImage && <p className="text-center text-sm text-brand animate-pulse">Uploading photos...</p>}

              {images.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-3">
                  {images.map((img, idx) => (
                    <div key={img.url || idx} className="group relative rounded-xl border border-border bg-muted/20 p-2">
                      <img src={img.url} alt={`Upload ${idx + 1}`} className="h-32 w-full rounded-lg object-cover" />
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => setCoverImage(idx)}
                          className={`font-medium ${img.is_cover ? "text-brand font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          {img.is_cover ? "★ Cover Photo" : "Set Cover"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 6: Availability */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-semibold">Availability Schedule</h2>
              <p className="text-sm text-muted-foreground">Specify the initial date range and availability status for booking.</p>
            </div>

            <div className="space-y-4">
              {availability.map((av, idx) => (
                <div key={idx} className="grid gap-4 sm:grid-cols-3 items-end rounded-xl border border-border p-4 bg-muted/20">
                  <div className="space-y-1">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={av.start_date}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAvailability((prev) => prev.map((item, i) => i === idx ? { ...item, start_date: val } : item));
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={av.end_date}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAvailability((prev) => prev.map((item, i) => i === idx ? { ...item, end_date: val } : item));
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Booking Status</Label>
                    <select
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      value={av.is_available ? "true" : "false"}
                      onChange={(e) => {
                        const val = e.target.value === "true";
                        setAvailability((prev) => prev.map((item, i) => i === idx ? { ...item, is_available: val } : item));
                      }}
                    >
                      <option value="true">Available for Booking</option>
                      <option value="false">Unavailable / Booked</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Review & Publish */}
        {step === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-semibold">Review & Publish</h2>
              <p className="text-sm text-muted-foreground">Review your billboard details before publishing to the marketplace.</p>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase text-brand">
                    {form.billboard_type}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-semibold">{form.title || "Untitled Billboard"}</h3>
                  <p className="text-sm text-muted-foreground">{form.address}, {form.city}, {form.state}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-semibold text-brand">₹{parseInt(form.price || "0").toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">per {form.price_period}</p>
                </div>
              </div>

              {images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <div key={img.url || i} className="relative shrink-0">
                      <img src={img.url} alt="Preview" className="h-24 w-32 rounded-lg object-cover" />
                      {img.is_cover && (
                        <span className="absolute top-1 left-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2 text-sm border-t border-border">
                <div>
                  <span className="text-muted-foreground">Dimensions:</span> <span className="font-medium">{form.width} × {form.height} {form.dimension_unit}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Illuminated:</span> <span className="font-medium">{form.is_illuminated ? "Yes (24/7)" : "No"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Min Booking:</span> <span className="font-medium">{form.min_booking_days} days</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Photos:</span> <span className="font-medium">{images.length} uploaded</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={loading}
                onClick={() => handleSubmit("draft")}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                className="flex-1 bg-brand hover:bg-brand-dark"
                disabled={loading}
                onClick={() => handleSubmit("published")}
              >
                <Sparkles className="mr-2 size-4" /> Publish to Marketplace
              </Button>
            </div>
          </div>
        )}

        {/* Wizard navigation buttons */}
        <div className="mt-8 flex justify-between border-t border-border pt-6">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="mr-2 size-4" /> Previous
            </Button>
          ) : (
            <div />
          )}

          {step < 7 && (
            <Button
              type="button"
              onClick={() => {
                if (step === 1 && !form.title) {
                  toast.error("Please enter a billboard title");
                  return;
                }
                if (step === 2 && (!form.address || !form.city)) {
                  toast.error("Please enter address and city");
                  return;
                }
                setStep((s) => s + 1);
              }}
            >
              Next <ArrowRight className="ml-2 size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
