"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, Phone, X, Plus, GripVertical, ImageIcon } from "lucide-react";
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

type ImageEntry = {
  id: string;
  localPreview: string; // blob URL or original server URL
  url: string;          // server URL (empty while uploading)
  name: string;
  uploading: boolean;
  error?: string;
};

export function VenueEditForm({ venue, ownerWhatsapp, selectedAmenityIds, existingImages = [] }: VenueEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState("");
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

  // Seed from existing images
  const seedImages = (): ImageEntry[] => {
    const urls =
      existingImages.length > 0
        ? existingImages
        : venue.heroImageUrl
        ? [venue.heroImageUrl]
        : [];
    return urls.map((url) => ({
      id: Math.random().toString(36).slice(2),
      localPreview: url,
      url,
      name: url.split("/").pop() ?? "image",
      uploading: false,
    }));
  };
  const [images, setImages] = useState<ImageEntry[]>(seedImages);

  const uploadFile = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      setFormError(`❌ "${file.name}": Unsupported format. Use JPEG, PNG, WEBP, or AVIF.`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError(`❌ "${file.name}": File too large (max 5MB).`);
      return;
    }

    const id = Math.random().toString(36).slice(2);
    const localPreview = URL.createObjectURL(file);
    setImages((prev) => [...prev, { id, localPreview, url: "", name: file.name, uploading: true }]);
    setFormError("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        const errorMsg = typeof json.error === "string" ? json.error : 
                         (json.error?.message || JSON.stringify(json.error) || "Upload failed");
        setImages((prev) => prev.map((img) => img.id === id ? { ...img, uploading: false, error: errorMsg } : img));
        setFormError(`❌ "${file.name}": ${errorMsg}`);
      } else {
        setImages((prev) => prev.map((img) => img.id === id ? { ...img, url: json.data.url, uploading: false } : img));
      }
    } catch (e: any) {
      const msg = e?.message || "Network error";
      setImages((prev) => prev.map((img) => img.id === id ? { ...img, uploading: false, error: msg } : img));
      setFormError(`❌ "${file.name}": ${msg}`);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      await uploadFile(file);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const entry = prev.find((img) => img.id === id);
      if (entry && entry.localPreview !== entry.url) URL.revokeObjectURL(entry.localPreview);
      return prev.filter((img) => img.id !== id);
    });
  };

  const setCover = (id: string) => {
    setImages((prev) => {
      const idx = prev.findIndex((img) => img.id === id);
      if (idx <= 0) return prev;
      const reordered = [...prev];
      const [item] = reordered.splice(idx, 1);
      reordered.unshift(item);
      return reordered;
    });
  };

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggleAmenity = (id: number) =>
    setAmenities((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);

  const isUploading = images.some((img) => img.uploading);
  const successImages = images.filter((img) => img.url && !img.uploading && !img.error);

  const handleSave = async (status = venue.status) => {
    if (!form.name || !form.address || !form.city) {
      setFormError("Name, address, and city are required.");
      return;
    }
    if (isUploading) {
      setFormError("Please wait for all images to finish uploading.");
      return;
    }
    setFormError("");
    setLoading(true);
    try {
      const imageUrls = successImages.map((img) => img.url);
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
    } catch (err: any) {
      setFormError(err?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Success banner */}
      {saved && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <CheckCircle size={16} className="text-emerald-400" />
          <p className="text-emerald-400 text-sm font-semibold">Changes saved successfully!</p>
        </div>
      )}

      {/* Error banner */}
      {formError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{formError}</p>
        </div>
      )}

      {/* ── 01 Core Info ────────────────────────────────────────────── */}
      <Section number="01" label="CORE INFORMATION">
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
      </Section>

      {/* ── 02 Gallery ──────────────────────────────────────────────── */}
      <Section number="02" label="GALLERY & VISUALS">

        {/* Requirements */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3 mb-4 space-y-1.5">
          <p className="text-amber-400 text-[11px] font-bold uppercase tracking-widest">📋 Image Requirements</p>
          <p className="text-neutral-400 text-xs">Formats: <span className="text-white">JPEG · PNG · WEBP · AVIF</span></p>
          <p className="text-neutral-400 text-xs">Max size: <span className="text-white">5 MB per image</span></p>
          <p className="text-neutral-400 text-xs">First image → <span className="text-amber-400 font-semibold">Cover / Hero photo</span></p>
        </div>

        {/* Uploading bar */}
        {isUploading && (
          <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-2.5 mb-3">
            <Loader2 size={14} className="animate-spin text-amber-400" />
            <p className="text-amber-300 text-xs font-semibold">Uploading to server… please wait</p>
          </div>
        )}

        {/* Image grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {images.map((img, i) => (
              <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] group">
                <img
                  src={img.localPreview}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />

                {/* Uploading overlay */}
                {img.uploading && (
                  <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center gap-1.5">
                    <Loader2 size={22} className="animate-spin text-amber-400" />
                    <span className="text-white text-[10px] font-bold uppercase">Uploading…</span>
                  </div>
                )}

                {/* Error overlay */}
                {img.error && !img.uploading && (
                  <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center gap-1 px-2">
                    <span className="text-red-300 text-[9px] font-bold uppercase text-center">{img.error}</span>
                    <button onClick={() => removeImage(img.id)} className="mt-1 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Remove</button>
                  </div>
                )}

                {/* Success badges */}
                {!img.uploading && !img.error && (
                  <>
                    {/* Cover badge */}
                    {i === 0
                      ? <span className="absolute top-1.5 left-1.5 bg-amber-400 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full">COVER</span>
                      : <button onClick={() => setCover(img.id)}
                          className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          Set Cover
                        </button>
                    }
                    {/* Remove */}
                    <button onClick={() => removeImage(img.id)}
                      className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                      <X size={10} className="text-white" />
                    </button>
                    {/* Position badge */}
                    <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                      {i + 1}
                    </span>
                  </>
                )}
              </div>
            ))}

            {/* Add more tile */}
            <label className="aspect-square rounded-xl border-2 border-dashed border-[#333] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-amber-400/50 transition-colors">
              <Plus size={20} className="text-neutral-500" />
              <span className="text-neutral-600 text-[9px] font-bold uppercase">Add More</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only"
                onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
            </label>
          </div>
        )}

        {/* Initial drop zone */}
        {images.length === 0 && (
          <label className="block w-full bg-[#111] border-2 border-dashed border-[#2a2a2a] rounded-2xl cursor-pointer hover:border-amber-400/40 hover:bg-[#161616] transition-colors mb-3">
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#222] flex items-center justify-center">
                <ImageIcon size={24} className="text-neutral-500" />
              </div>
              <div className="text-center">
                <p className="text-neutral-200 text-sm font-semibold">Tap to Add Photos</p>
                <p className="text-neutral-500 text-xs mt-1">Select one or multiple images</p>
              </div>
            </div>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only"
              onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
          </label>
        )}

        {/* Manage tip */}
        {images.length > 1 && (
          <p className="text-neutral-600 text-[10px] text-center">
            Hover a photo → <span className="text-amber-400/70">Set Cover</span> or <span className="text-red-400/70">Remove</span>
          </p>
        )}
      </Section>

      {/* ── 03 Amenities ────────────────────────────────────────────── */}
      <Section number="03" label="AMENITIES">
        <div className="grid grid-cols-2 gap-2">
          {AMENITIES.map((a) => {
            const sel = amenities.includes(a.id);
            return (
              <button key={a.id} type="button" onClick={() => toggleAmenity(a.id)}
                className={cn("flex items-center gap-2 p-3 rounded-xl border text-sm transition-all",
                  sel ? "bg-[#2a2a2a] border-amber-400/40 text-white" : "bg-[#1a1a1a] border-[#2a2a2a] text-neutral-400"
                )}>
                <span className="text-teal-400">{a.emoji}</span>
                <span className="text-xs">{a.label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── 04 Contact ──────────────────────────────────────────────── */}
      <Section number="04" label="CONTACT">
        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-3">
          <Phone size={14} className="text-[#BFC8CA] shrink-0" />
          <span className="text-neutral-400 text-sm">+91</span>
          <input type="tel" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)}
            placeholder="WhatsApp number"
            className="bg-transparent text-white text-sm outline-none flex-1 placeholder:text-neutral-600" />
        </div>
      </Section>

      {/* Actions */}
      <div className="space-y-2 pt-2 pb-8">
        <button onClick={() => handleSave("live")} disabled={loading || isUploading}
          className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-black font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
           : isUploading ? <><Loader2 size={16} className="animate-spin" /> Wait for uploads…</>
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

/* ── Shared sub-components ─────────────────────────────────────────────── */
function Section({ number, label, children }: { number: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-amber-400 font-bold text-sm">{number}</span>
        <span className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      {children}
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
        {multiline
          ? <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)}
              className="w-full bg-transparent text-white text-sm px-4 py-3 outline-none resize-none placeholder:text-neutral-600" />
          : <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
              className="w-full bg-transparent text-white text-sm px-4 py-3 outline-none placeholder:text-neutral-600" />
        }
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BFC8CA] text-sm">{suffix}</span>}
      </div>
    </div>
  );
}
