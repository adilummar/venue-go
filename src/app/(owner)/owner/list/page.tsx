"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Phone, Loader2, CheckCircle, X } from "lucide-react";
import { AMENITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ImageEntry = {
  id: string;
  localPreview: string;
  url: string;
  name: string;
  uploading: boolean;
  error?: string;
};

export default function ListVenuePage() {
  const router = useRouter();
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [images, setImages] = useState<ImageEntry[]>([]);

  const [form, setForm] = useState({
    name: "",
    seating: "",
    address: "",
    city: "",
    state: "",
    whatsapp: "",
    description: "",
    pricePerEvening: "",
    category: "theatre" as "open_air" | "theatre" | "concert_hall" | "palatial",
  });

  const uploadFile = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      return { error: `"${file.name}": Unsupported format. Use JPEG, PNG, WEBP, or AVIF.` };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { error: `"${file.name}": File is too large (max 5MB).` };
    }

    const id = Math.random().toString(36).slice(2);
    const localPreview = URL.createObjectURL(file);

    // Add immediately with uploading=true so preview shows at once
    setImages((prev) => [
      ...prev,
      { id, localPreview, url: "", name: file.name, uploading: true },
    ]);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok) {
        const errorMsg = typeof json.error === "string" ? json.error : 
                         (json.error?.message || JSON.stringify(json.error) || "Upload failed");
        setImages((prev) =>
          prev.map((img) =>
            img.id === id ? { ...img, uploading: false, error: errorMsg } : img
          )
        );
        return { error: errorMsg };
      }

      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, url: json.data.url, uploading: false } : img
        )
      );
      return { url: json.data.url };
    } catch (e: any) {
      const msg = e?.message || "Network error during upload";
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, uploading: false, error: msg } : img
        )
      );
      return { error: msg };
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
      if (entry?.localPreview) URL.revokeObjectURL(entry.localPreview);
      return prev.filter((img) => img.id !== id);
    });
  };

  const toggleAmenity = (id: number) =>
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );

  const update = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const isUploading = images.some((img) => img.uploading);
  const successImages = images.filter((img) => img.url && !img.uploading && !img.error);

  const handleSubmit = async (status: "live" | "draft") => {
    if (!form.name || !form.seating || !form.address || !form.city) {
      setFormError("Please fill in all required fields: name, capacity, address, city.");
      return;
    }
    if (isUploading) {
      setFormError("Please wait for all images to finish uploading.");
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      const imageUrls = successImages.map((img) => img.url);
      const res = await fetch("/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          city: form.city,
          state: form.state || undefined,
          seatingCapacity: Number(form.seating),
          pricePerEvening: form.pricePerEvening || "10000",
          description: form.description || undefined,
          whatsapp: form.whatsapp ? `+91${form.whatsapp}` : undefined,
          amenityIds: selectedAmenities,
          status,
          category: form.category,
          heroImageUrl: imageUrls[0] || undefined,
          images: imageUrls.length > 0 ? imageUrls : undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Submission failed");
      }
      setSubmitted(true);
      setTimeout(() => router.push("/owner/dashboard"), 2000);
    } catch (err: any) {
      setFormError(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-white font-bold text-2xl">Venue Submitted!</h2>
        <p className="text-neutral-400 text-sm">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-neutral-400">
          <ArrowLeft size={18} />
          <span className="text-sm">Back</span>
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-[#2a2a2a]">
          <Search size={16} className="text-neutral-400" />
        </button>
      </header>

      <div className="px-4 pb-12">
        <h1 className="text-white font-bold text-3xl leading-tight mb-2">
          List Your<br />Auditorium
        </h1>
        <p className="text-neutral-400 text-sm mb-8">
          Join the network of premier performance spaces.
        </p>

        {/* ── 01 Core Info ─────────────────────────────────────────── */}
        <Section number="01" label="CORE INFORMATION">
          <div className="space-y-3">
            <Field label="AUDITORIUM NAME *" placeholder="e.g. Shanmukhananda Hall" value={form.name} onChange={(v) => update("name", v)} />
            <Field label="SEATING CAPACITY *" placeholder="500" type="number" suffix="Seats" value={form.seating} onChange={(v) => update("seating", v)} />
            <Field label="FULL ADDRESS *" placeholder="e.g. 292, Sion East, Mumbai" value={form.address} onChange={(v) => update("address", v)} multiline />
            <div className="grid grid-cols-2 gap-3">
              <Field label="CITY *" placeholder="Mumbai" value={form.city} onChange={(v) => update("city", v)} />
              <Field label="STATE" placeholder="Maharashtra" value={form.state} onChange={(v) => update("state", v)} />
            </div>
            <Field label="PRICE PER EVENING (₹)" placeholder="10000" type="number" value={form.pricePerEvening} onChange={(v) => update("pricePerEvening", v)} />

            <div>
              <label className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest block mb-2">VENUE CATEGORY *</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: "theatre", label: "Theatre", emoji: "🎭" },
                  { value: "concert_hall", label: "Concert Hall", emoji: "🎵" },
                  { value: "open_air", label: "Open Air", emoji: "🌿" },
                  { value: "palatial", label: "Palatial", emoji: "🏛️" },
                ] as const).map((cat) => (
                  <button key={cat.value} type="button" onClick={() => update("category", cat.value)}
                    className={cn("flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-semibold transition-all",
                      form.category === cat.value
                        ? "bg-amber-400/10 border-amber-400/50 text-amber-400"
                        : "bg-[#1a1a1a] border-[#2a2a2a] text-neutral-400"
                    )}>
                    <span>{cat.emoji}</span><span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Field label="DESCRIPTION" placeholder="Tell artists about this space..." value={form.description} onChange={(v) => update("description", v)} multiline />
          </div>
        </Section>

        {/* ── 02 Amenities ─────────────────────────────────────────── */}
        <Section number="02" label="AMENITIES & FEATURES">
          <div className="grid grid-cols-2 gap-3">
            {AMENITIES.slice(0, 8).map((a) => {
              const sel = selectedAmenities.includes(a.id);
              return (
                <button key={a.id} type="button" onClick={() => toggleAmenity(a.id)}
                  className={cn("flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                    sel ? "bg-[#2a2a2a] border-amber-400/50 text-white" : "bg-[#1a1a1a] border-[#2a2a2a] text-neutral-400"
                  )}>
                  <span className="text-teal-400 text-xl">{a.emoji}</span>
                  <span className="text-xs text-center">{a.label}</span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── 03 Gallery ───────────────────────────────────────────── */}
        <Section number="03" label="GALLERY & VISUALS">
          {/* Requirements card */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3 mb-4 space-y-1.5">
            <p className="text-amber-400 text-[11px] font-bold uppercase tracking-widest">📋 Image Requirements</p>
            <p className="text-neutral-400 text-xs">Formats: <span className="text-white">JPEG · PNG · WEBP · AVIF</span></p>
            <p className="text-neutral-400 text-xs">Max size: <span className="text-white">5 MB per image</span></p>
            <p className="text-neutral-400 text-xs">Recommended: <span className="text-white">1920 × 1080 px</span></p>
            <p className="text-neutral-400 text-xs">First image → <span className="text-amber-400 font-semibold">Cover photo</span></p>
          </div>

          {/* Uploading global indicator */}
          {isUploading && (
            <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-2.5 mb-3">
              <Loader2 size={14} className="animate-spin text-amber-400" />
              <p className="text-amber-300 text-xs font-semibold">Uploading to server… please wait</p>
            </div>
          )}

          {/* Grid of images + add-more tile */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {images.map((img, i) => (
                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a]">
                  {/* Always show the local preview instantly */}
                  <img src={img.localPreview} alt={img.name} className="w-full h-full object-cover" />

                  {/* Uploading overlay */}
                  {img.uploading && (
                    <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center gap-1.5">
                      <Loader2 size={22} className="animate-spin text-amber-400" />
                      <span className="text-white text-[10px] font-bold uppercase tracking-wider">Uploading…</span>
                    </div>
                  )}

                  {/* Error overlay */}
                  {img.error && !img.uploading && (
                    <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center gap-1 px-2">
                      <span className="text-red-300 text-[9px] font-bold uppercase text-center leading-tight">{img.error}</span>
                      <button onClick={() => removeImage(img.id)}
                        className="mt-1 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Success badges */}
                  {!img.uploading && !img.error && (
                    <>
                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 bg-amber-400 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                          COVER
                        </span>
                      )}
                      <button onClick={() => removeImage(img.id)}
                        className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <X size={10} className="text-white" />
                      </button>
                    </>
                  )}
                </div>
              ))}

              {/* "Add more" tile — uses label so it's always reliable */}
              <label className="aspect-square rounded-xl border-2 border-dashed border-[#333] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-amber-400/50 transition-colors">
                <span className="text-2xl">＋</span>
                <span className="text-neutral-500 text-[9px] font-bold uppercase">Add more</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only"
                  onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
              </label>
            </div>
          )}

          {/* Initial drop zone — uses label for reliable file picker */}
          {images.length === 0 && (
            <label className="block w-full bg-[#111] border-2 border-dashed border-[#2a2a2a] rounded-2xl cursor-pointer hover:border-amber-400/40 hover:bg-[#161616] transition-colors">
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <div className="w-16 h-16 rounded-2xl bg-[#222] flex items-center justify-center text-3xl">
                  📷
                </div>
                <div className="text-center">
                  <p className="text-neutral-200 text-base font-semibold">Tap to Add Photos</p>
                  <p className="text-neutral-500 text-xs mt-1">Select one or multiple images at once</p>
                </div>
              </div>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only"
                onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
            </label>
          )}
        </Section>

        {/* ── 04 Contact ───────────────────────────────────────────── */}
        <Section number="04" label="CONTACT GATEWAY">
          <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-3">
            <Phone size={14} className="text-[#BFC8CA] shrink-0" />
            <span className="text-neutral-400 text-sm">+91</span>
            <input type="tel" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)}
              placeholder="98765 43210"
              className="bg-transparent text-white text-sm outline-none flex-1 placeholder:text-neutral-600" />
          </div>
          <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1">
            <span>✓</span> Direct booking link will be sent to this number.
          </p>
        </Section>

        {/* Form error */}
        {formError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
            <p className="text-red-400 text-sm">{formError}</p>
          </div>
        )}

        {/* Submit buttons */}
        <div className="space-y-3">
          <button type="button" onClick={() => handleSubmit("live")}
            disabled={submitting || isUploading}
            className="w-full py-4 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-black font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting
              ? <><Loader2 size={18} className="animate-spin" /> Submitting…</>
              : isUploading
              ? <><Loader2 size={18} className="animate-spin" /> Waiting for uploads…</>
              : "SUBMIT AUDITORIUM"}
          </button>
          <button type="button" onClick={() => handleSubmit("draft")}
            disabled={submitting || isUploading}
            className="w-full py-4 border border-[#2a2a2a] text-neutral-400 font-bold rounded-2xl hover:bg-[#1a1a1a] transition-colors disabled:opacity-50">
            SAVE AS DRAFT
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Shared sub-components ──────────────────────────────────────────────── */

function Section({ number, label, children }: { number: string; label: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-amber-400 font-bold text-sm">{number}</span>
        <span className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      {children}
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = "text", suffix, multiline }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
  type?: string; suffix?: string; multiline?: boolean;
}) {
  return (
    <div>
      <label className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest block mb-1.5">{label}</label>
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
        {multiline
          ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
              className="w-full bg-transparent text-white text-sm px-4 py-3 outline-none placeholder:text-neutral-600 resize-none" />
          : <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
              className="w-full bg-transparent text-white text-sm px-4 py-3 outline-none placeholder:text-neutral-600" />
        }
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BFC8CA] text-sm">{suffix}</span>}
      </div>
    </div>
  );
}
