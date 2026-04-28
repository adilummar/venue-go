"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, Phone, X, Plus, ImageIcon } from "lucide-react";
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

type ImageEntry = { localPreview: string; url: string; uploading: boolean; error?: string };

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

  // Initialise from existing server images (they already have a real URL, no upload needed)
  const initImages = (): ImageEntry[] => {
    const src = existingImages.length > 0
      ? existingImages
      : venue.heroImageUrl ? [venue.heroImageUrl] : [];
    return src.map((url) => ({ localPreview: url, url, uploading: false }));
  };
  const [images, setImages] = useState<ImageEntry[]>(initImages);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    e.target.value = "";

    for (const file of Array.from(files)) {
      if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
        setError(`❌ "${file.name}": Format not supported. Use JPEG, PNG, WEBP, or AVIF.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`❌ "${file.name}": File too large (max 5MB).`);
        continue;
      }

      const localPreview = URL.createObjectURL(file);
      setImages((prev) => [...prev, { localPreview, url: "", uploading: true }]);

      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) {
          setImages((prev) =>
            prev.map((img) =>
              img.localPreview === localPreview
                ? { ...img, uploading: false, error: data.error || "Upload failed" }
                : img
            )
          );
          setError(`❌ "${file.name}": ${data.error || "Upload failed"}`);
        } else {
          setImages((prev) =>
            prev.map((img) =>
              img.localPreview === localPreview
                ? { ...img, url: data.data.url, uploading: false }
                : img
            )
          );
          setError("");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Network error";
        setImages((prev) =>
          prev.map((img) =>
            img.localPreview === localPreview
              ? { ...img, uploading: false, error: msg }
              : img
          )
        );
        setError(`❌ "${file.name}": ${msg}`);
      }
    }
  };

  const removeImage = (localPreview: string) => {
    setImages((prev) => {
      const entry = prev.find((img) => img.localPreview === localPreview);
      // Revoke object URL only for newly added images (not existing server URLs)
      if (entry && entry.localPreview !== entry.url) {
        URL.revokeObjectURL(entry.localPreview);
      }
      return prev.filter((img) => img.localPreview !== localPreview);
    });
  };

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggleAmenity = (id: number) =>
    setAmenities((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);

  const isUploading = images.some((img) => img.uploading);
  const successfulImages = images.filter((img) => img.url && !img.uploading && !img.error);

  const handleSave = async (status = venue.status) => {
    if (!form.name || !form.address || !form.city) {
      setError("Name, address, and city are required.");
      return;
    }
    if (isUploading) {
      setError("Please wait for all images to finish uploading.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const imageUrls = successfulImages.map((img) => img.url);
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
          heroImageUrl: imageUrls[0] || undefined,
          images: imageUrls.length > 0 ? imageUrls : undefined,
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

      {/* Gallery */}
      <section>
        <p className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-3">02 GALLERY & VISUALS</p>

        {/* Requirements */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 space-y-1 mb-3">
          <p className="text-[#BFC8CA] text-xs font-bold uppercase tracking-widest mb-1">📋 Image Requirements</p>
          <p className="text-neutral-500 text-[11px]">• <span className="text-neutral-300">Formats:</span> JPEG, PNG, WEBP, AVIF</p>
          <p className="text-neutral-500 text-[11px]">• <span className="text-neutral-300">Max size:</span> 5MB per image</p>
          <p className="text-neutral-500 text-[11px]">• <span className="text-neutral-300">Resolution:</span> 1920×1080 recommended</p>
          <p className="text-neutral-500 text-[11px]">• <span className="text-neutral-300">Note:</span> First image becomes the Cover photo</p>
        </div>

        {/* Uploading status bar */}
        {isUploading && (
          <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3 mb-3">
            <Loader2 size={14} className="animate-spin text-amber-400" />
            <p className="text-amber-400 text-xs font-semibold">Uploading images to server...</p>
          </div>
        )}

        {/* Images grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <div key={img.localPreview} className="relative aspect-square rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] group">
                <img src={img.localPreview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />

                {/* Uploading overlay */}
                {img.uploading && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1">
                    <Loader2 size={20} className="animate-spin text-amber-400" />
                    <span className="text-white text-[9px] font-bold uppercase tracking-wider">Uploading</span>
                  </div>
                )}

                {/* Error overlay */}
                {img.error && !img.uploading && (
                  <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center gap-1 p-1">
                    <span className="text-red-300 text-[9px] font-bold uppercase text-center">Failed</span>
                    <button type="button" onClick={() => removeImage(img.localPreview)}
                      className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold mt-1">
                      Remove
                    </button>
                  </div>
                )}

                {/* Success state */}
                {!img.uploading && !img.error && (
                  <>
                    {i === 0 && (
                      <div className="absolute top-1.5 left-1.5 bg-amber-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        COVER
                      </div>
                    )}
                    <div className="absolute top-1.5 right-1.5 bg-emerald-500/90 rounded-full w-4 h-4 flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">✓</span>
                    </div>
                    <button type="button" onClick={() => removeImage(img.localPreview)}
                      className="absolute bottom-1.5 right-1.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} className="text-white" />
                    </button>
                  </>
                )}
              </div>
            ))}

            {/* Add more tile */}
            <button type="button" onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-[#2a2a2a] flex flex-col items-center justify-center gap-1 hover:border-amber-400/40 active:bg-[#1a1a1a] transition-colors">
              <Plus size={20} className="text-neutral-500" />
              <span className="text-neutral-600 text-[9px] font-bold uppercase">Add More</span>
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()}
            className="w-full bg-[#1a1a1a] border-2 border-dashed border-[#2a2a2a] rounded-2xl min-h-[180px] flex flex-col items-center justify-center gap-3 hover:border-amber-400/30 active:bg-[#222] transition-colors cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-[#2a2a2a] flex items-center justify-center">
              <ImageIcon size={26} className="text-neutral-500" />
            </div>
            <div className="text-center">
              <p className="text-neutral-300 text-sm font-semibold">Tap to Add Photos</p>
              <p className="text-neutral-600 text-xs mt-0.5">Select one or multiple images</p>
            </div>
          </button>
        )}

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif"
          multiple className="hidden" onChange={handleImageUpload} />
      </section>

      {/* Amenities */}
      <section>
        <p className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-3">03 AMENITIES</p>
        <div className="grid grid-cols-2 gap-2">
          {AMENITIES.map((a) => {
            const selected = amenities.includes(a.id);
            return (
              <button key={a.id} type="button" onClick={() => toggleAmenity(a.id)}
                className={cn("flex items-center gap-2 p-3 rounded-xl border text-sm transition-all",
                  selected ? "bg-[#2a2a2a] border-amber-400/40 text-white" : "bg-[#1a1a1a] border-[#2a2a2a] text-neutral-400"
                )}>
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
          <input type="tel" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)}
            placeholder="WhatsApp number"
            className="bg-transparent text-white text-sm outline-none flex-1 placeholder:text-neutral-600" />
        </div>
      </section>

      {/* Actions */}
      <div className="space-y-2 pt-2">
        <button onClick={() => handleSave("live")} disabled={loading || isUploading}
          className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
           : isUploading ? <><Loader2 size={16} className="animate-spin" /> Wait for uploads...</>
           : "Save & Publish"}
        </button>
        <button onClick={() => handleSave("draft")} disabled={loading || isUploading}
          className="w-full py-4 border border-[#2a2a2a] text-neutral-400 font-bold rounded-2xl hover:bg-[#1a1a1a] transition-colors disabled:opacity-60">
          Save as Draft
        </button>
        <button onClick={() => router.back()} className="w-full py-3 text-neutral-600 text-sm">
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
