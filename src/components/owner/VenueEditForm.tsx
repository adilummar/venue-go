"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, Phone, X, Plus } from "lucide-react";
import { AMENITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface VenueEditFormProps {
  venue: {
    id: string;
    name: string;
    description?: string | null;
    address: string;
    city: string;
    state?: string | null;
    seatingCapacity: number;
    pricePerEvening: string;
    status: string;
    heroImageUrl?: string | null;
  };
  ownerWhatsapp?: string | null;
  selectedAmenityIds: number[];
  existingImages?: string[];
}

export function VenueEditForm({ venue, ownerWhatsapp, selectedAmenityIds, existingImages = [] }: VenueEditFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [amenities, setAmenities] = useState<number[]>(selectedAmenityIds);

  const [form, setForm] = useState({
    name: venue.name,
    description: venue.description ?? "",
    address: venue.address,
    city: venue.city,
    state: venue.state ?? "",
    seatingCapacity: String(venue.seatingCapacity),
    pricePerEvening: venue.pricePerEvening,
    whatsapp: ownerWhatsapp ?? "",
  });

  // Initialise with existing images; if none fall back to heroImageUrl
  const initImages = existingImages.length > 0
    ? existingImages
    : venue.heroImageUrl ? [venue.heroImageUrl] : [];
  const [images, setImages] = useState<string[]>(initImages);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    e.target.value = "";

    for (const file of Array.from(files)) {
      if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
        setError(`"${file.name}" is not a supported format. Use JPEG, PNG, WEBP, or AVIF.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`"${file.name}" exceeds 5MB. Please compress it first.`);
        continue;
      }

      setUploadingImage(true);
      setUploadStatus(null);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        setImages((prev) => [...prev, data.data.url]);
        setUploadStatus({ type: "success", msg: `"${file.name}" uploaded!` });
        setTimeout(() => setUploadStatus(null), 3000);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to upload image";
        setError(msg);
        setUploadStatus({ type: "error", msg });
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggleAmenity = (id: number) =>
    setAmenities((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);

  const handleSave = async (status = venue.status) => {
    if (!form.name || !form.address || !form.city) {
      setError("Name, address, and city are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/venues/${venue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          address: form.address,
          city: form.city,
          state: form.state || undefined,
          seatingCapacity: Number(form.seatingCapacity),
          pricePerEvening: Number(form.pricePerEvening),
          whatsapp: form.whatsapp || undefined,
          heroImageUrl: images[0] || undefined,
          images: images.length > 0 ? images : undefined,
          amenityIds: amenities,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data.error));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {saved && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <CheckCircle size={16} className="text-emerald-400" />
          <p className="text-emerald-400 text-sm font-semibold">Changes saved successfully!</p>
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Core Info */}
      <section>
        <p className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-3">01 CORE INFORMATION</p>
        <div className="space-y-3">
          <Field label="VENUE NAME *" value={form.name} onChange={(v) => update("name", v)} />
          <Field label="DESCRIPTION" value={form.description} onChange={(v) => update("description", v)} multiline />
          <Field label="FULL ADDRESS *" value={form.address} onChange={(v) => update("address", v)} multiline />
          <div className="grid grid-cols-2 gap-3">
            <Field label="CITY *" value={form.city} onChange={(v) => update("city", v)} />
            <Field label="STATE" value={form.state} onChange={(v) => update("state", v)} />
          </div>
          <Field label="SEATING CAPACITY" value={form.seatingCapacity} onChange={(v) => update("seatingCapacity", v)} type="number" suffix="Seats" />
          <Field label="PRICE PER EVENING (₹)" value={form.pricePerEvening} onChange={(v) => update("pricePerEvening", v)} type="number" />
        </div>
      </section>

      {/* Gallery — Multi-upload */}
      <section>
        <p className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-3">02 GALLERY & VISUALS</p>

        {/* Instructions */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 space-y-1 mb-3">
          <p className="text-neutral-400 text-xs font-semibold">📋 IMAGE REQUIREMENTS</p>
          <p className="text-neutral-500 text-[11px]">• Formats: JPEG, PNG, WEBP, AVIF  •  Max 5MB each</p>
          <p className="text-neutral-500 text-[11px]">• Recommended resolution: 1920×1080</p>
          <p className="text-neutral-500 text-[11px]">• First image becomes the cover / hero photo</p>
        </div>

        {/* Inline upload status */}
        {uploadStatus && (
          <div className={`rounded-xl px-4 py-2.5 mb-3 flex items-center gap-2 text-sm font-semibold ${
            uploadStatus.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}>
            <span>{uploadStatus.type === "success" ? "✓" : "✕"}</span>
            <span>{uploadStatus.msg}</span>
          </div>
        )}

        {/* Images grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {images.map((url, i) => (
              <div key={url} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                {i === 0 && (
                  <div className="absolute top-1.5 left-1.5 bg-amber-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    COVER
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} className="text-white" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] text-center py-0.5">
                  {i + 1}
                </div>
              </div>
            ))}
            {/* Add more tile */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingImage}
              className="aspect-square rounded-xl border-2 border-dashed border-[#2a2a2a] flex flex-col items-center justify-center gap-1 hover:border-amber-400/40 transition-colors"
            >
              {uploadingImage
                ? <Loader2 size={18} className="animate-spin text-amber-400" />
                : <><Plus size={18} className="text-neutral-600" /><span className="text-neutral-600 text-[9px] font-bold uppercase">Add</span></>
              }
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingImage}
            className="w-full bg-[#1a1a1a] border-2 border-dashed border-[#2a2a2a] rounded-2xl min-h-[160px] flex flex-col items-center justify-center gap-2 hover:border-amber-400/30 transition-colors"
          >
            {uploadingImage ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-amber-400" size={24} />
                <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">UPLOADING...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">📷</span>
                <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">TAP TO ADD PHOTOS</p>
                <p className="text-neutral-600 text-[10px]">Select multiple images at once</p>
              </div>
            )}
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />
      </section>

      {/* Amenities */}
      <section>
        <p className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-3">03 AMENITIES</p>
        <div className="grid grid-cols-2 gap-2">
          {AMENITIES.map((a) => {
            const selected = amenities.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleAmenity(a.id)}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-xl border text-sm transition-all",
                  selected ? "bg-[#2a2a2a] border-amber-400/40 text-white" : "bg-[#1a1a1a] border-[#2a2a2a] text-neutral-400"
                )}
              >
                <span className="text-teal-400">{a.emoji}</span>
                <span className="text-xs">{a.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Contact */}
      <section>
        <p className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-3">04 CONTACT</p>
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-3">
          <Phone size={14} className="text-[#BFC8CA] shrink-0" />
          <span className="text-neutral-400 text-sm">+91</span>
          <input
            type="tel"
            value={form.whatsapp}
            onChange={(e) => update("whatsapp", e.target.value)}
            placeholder="WhatsApp number"
            className="bg-transparent text-white text-sm outline-none flex-1 placeholder:text-neutral-600"
          />
        </div>
      </section>

      {/* Actions */}
      <div className="space-y-2 pt-2">
        <button
          onClick={() => handleSave("live")}
          disabled={loading}
          className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save & Publish"}
        </button>
        <button
          onClick={() => handleSave("draft")}
          disabled={loading}
          className="w-full py-4 border border-[#2a2a2a] text-neutral-400 font-bold rounded-2xl hover:bg-[#1a1a1a] transition-colors disabled:opacity-60"
        >
          Save as Draft
        </button>
        <button
          onClick={() => router.back()}
          className="w-full py-3 text-neutral-600 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", suffix, multiline }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; suffix?: string; multiline?: boolean;
}) {
  return (
    <div>
      <label className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest block mb-1.5">{label}</label>
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
        {multiline ? (
          <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-white text-sm px-4 py-3 outline-none focus:border-amber-400 resize-none placeholder:text-neutral-600" />
        ) : (
          <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-white text-sm px-4 py-3 outline-none focus:border-amber-400 placeholder:text-neutral-600" />
        )}
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BFC8CA] text-sm">{suffix}</span>}
      </div>
    </div>
  );
}
