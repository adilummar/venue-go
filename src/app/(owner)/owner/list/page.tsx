"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Phone, Loader2, CheckCircle, X, Plus, ImageIcon } from "lucide-react";
import { AMENITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function ListVenuePage() {
  const router = useRouter();
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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

  // Each entry: { localPreview: string (object URL), url: string (server url), uploading: boolean, error?: string }
  type ImageEntry = { localPreview: string; url: string; uploading: boolean; error?: string };
  const [images, setImages] = useState<ImageEntry[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    // Reset input so same file can be picked again
    e.target.value = "";

    const fileArray = Array.from(files);

    for (const file of fileArray) {
      // --- Client-side validation ---
      if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
        setError(`❌ "${file.name}": Format not supported. Please use JPEG, PNG, WEBP, or AVIF.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`❌ "${file.name}": File too large (max 5MB).`);
        continue;
      }

      // Immediately show a local preview with uploading=true
      const localPreview = URL.createObjectURL(file);
      const tempEntry: ImageEntry = { localPreview, url: "", uploading: true };
      setImages((prev) => [...prev, tempEntry]);
      const entryIndex = (await new Promise<number>((resolve) => {
        setImages((prev) => {
          const idx = prev.length - 1;
          resolve(idx);
          return prev;
        });
      }));

      // Upload to server
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) {
          setImages((prev) =>
            prev.map((img, i) =>
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
          setError(""); // Clear any previous error on success
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Network error. Check your connection.";
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
      if (entry) URL.revokeObjectURL(entry.localPreview);
      return prev.filter((img) => img.localPreview !== localPreview);
    });
  };

  const toggleAmenity = (id: number) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const update = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const successfulImages = images.filter((img) => img.url && !img.uploading && !img.error);
  const isUploading = images.some((img) => img.uploading);

  const handleSubmit = async (status: "live" | "draft") => {
    if (!form.name || !form.seating || !form.address || !form.city) {
      setError("Please fill in all required fields (name, capacity, address, city).");
      return;
    }
    if (isUploading) {
      setError("Please wait for all images to finish uploading.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const imageUrls = successfulImages.map((img) => img.url);
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
        const data = await res.json();
        throw new Error(data.error ?? "Submission failed");
      }

      setSubmitted(true);
      setTimeout(() => router.push("/owner/dashboard"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
        <p className="text-neutral-400 text-sm">Your auditorium is under review. We'll notify you once it's live.</p>
        <p className="text-neutral-600 text-xs">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-neutral-400">
          <ArrowLeft size={18} /> <span className="text-sm">Venue Go</span>
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-[#2a2a2a]">
          <Search size={16} className="text-neutral-400" />
        </button>
      </header>

      <div className="px-4">
        <h1 className="text-white font-bold text-3xl leading-tight mb-2">List Your<br />Auditorium</h1>
        <p className="text-neutral-400 text-sm mb-8">
          Join the network of premier performance spaces.
        </p>

        {/* Step 01 — Core Info */}
        <StepSection number="01" label="CORE INFORMATION">
          <div className="space-y-3">
            <FormField label="AUDITORIUM NAME *" placeholder="e.g. Shanmukhananda Hall" value={form.name} onChange={(v) => update("name", v)} />
            <FormField label="TOTAL SEATING CAPACITY *" placeholder="0" type="number" suffix="Seats" value={form.seating} onChange={(v) => update("seating", v)} />
            <FormField label="FULL ADDRESS *" placeholder="e.g. 292, Comrade Harbanslal Marg, Sion East, Mumbai" value={form.address} onChange={(v) => update("address", v)} multiline />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="CITY *" placeholder="Mumbai" value={form.city} onChange={(v) => update("city", v)} />
              <FormField label="STATE" placeholder="Maharashtra" value={form.state} onChange={(v) => update("state", v)} />
            </div>
            <FormField label="PRICE PER EVENING (₹)" placeholder="10000" type="number" value={form.pricePerEvening} onChange={(v) => update("pricePerEvening", v)} />

            {/* Category selector */}
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
                      form.category === cat.value ? "bg-amber-400/10 border-amber-400/50 text-amber-400" : "bg-[#1a1a1a] border-[#2a2a2a] text-neutral-400"
                    )}>
                    <span>{cat.emoji}</span><span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <FormField label="DESCRIPTION" placeholder="Tell artists about this space..." value={form.description} onChange={(v) => update("description", v)} multiline />
          </div>
        </StepSection>

        {/* Step 02 — Amenities */}
        <StepSection number="02" label="AMENITIES & FEATURES">
          <div className="grid grid-cols-2 gap-3">
            {AMENITIES.slice(0, 8).map((a) => {
              const isSelected = selectedAmenities.includes(a.id);
              return (
                <button key={a.id} type="button" onClick={() => toggleAmenity(a.id)}
                  className={cn("flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                    isSelected ? "bg-[#2a2a2a] border-amber-400/50 text-white" : "bg-[#1a1a1a] border-[#2a2a2a] text-neutral-400"
                  )}>
                  <span className="text-teal-400 text-xl">{a.emoji}</span>
                  <span className="text-xs text-center">{a.label}</span>
                </button>
              );
            })}
          </div>
        </StepSection>

        {/* Step 03 — Gallery */}
        <StepSection number="03" label="GALLERY & VISUALS">
          <div className="space-y-3">

            {/* Requirements box */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 space-y-1">
              <p className="text-[#BFC8CA] text-xs font-bold uppercase tracking-widest mb-1">📋 Image Requirements</p>
              <p className="text-neutral-500 text-[11px]">• <span className="text-neutral-300">Formats:</span> JPEG, PNG, WEBP, AVIF</p>
              <p className="text-neutral-500 text-[11px]">• <span className="text-neutral-300">Max size:</span> 5MB per image</p>
              <p className="text-neutral-500 text-[11px]">• <span className="text-neutral-300">Resolution:</span> 1920×1080 recommended</p>
              <p className="text-neutral-500 text-[11px]">• <span className="text-neutral-300">Note:</span> First image becomes the Cover photo</p>
            </div>

            {/* Error box */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Images grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, i) => (
                  <div key={img.localPreview} className="relative aspect-square rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a]">
                    {/* Preview using local object URL (shows immediately!) */}
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
                          className="absolute bottom-1.5 right-1.5 w-5 h-5 bg-red-500/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={10} className="text-white" />
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
            )}

            {/* Initial upload button (when no images yet) */}
            {images.length === 0 && (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full bg-[#1a1a1a] border-2 border-dashed border-[#2a2a2a] rounded-2xl min-h-[200px] flex flex-col items-center justify-center gap-3 hover:border-amber-400/30 active:bg-[#222] transition-colors cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-[#2a2a2a] flex items-center justify-center">
                  <ImageIcon size={26} className="text-neutral-500" />
                </div>
                <div className="text-center">
                  <p className="text-neutral-300 text-sm font-semibold">Tap to Add Photos</p>
                  <p className="text-neutral-600 text-xs mt-0.5">Select one or multiple images</p>
                </div>
              </button>
            )}

            {/* Overall uploading indicator */}
            {isUploading && (
              <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3">
                <Loader2 size={14} className="animate-spin text-amber-400" />
                <p className="text-amber-400 text-xs font-semibold">Uploading images to server...</p>
              </div>
            )}

            <input ref={fileRef} type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple className="hidden" onChange={handleImageUpload} />
          </div>
        </StepSection>

        {/* Step 04 — Contact */}
        <StepSection number="04" label="CONTACT GATEWAY">
          <div>
            <label className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest block mb-2">
              WHATSAPP NUMBER
            </label>
            <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-3">
              <Phone size={14} className="text-[#BFC8CA] shrink-0" />
              <span className="text-neutral-400 text-sm">+91</span>
              <input type="tel" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)}
                placeholder="98765 43210"
                className="bg-transparent text-white text-sm outline-none flex-1 placeholder:text-neutral-600" />
            </div>
            <p className="text-emerald-400 text-xs mt-1.5 flex items-center gap-1">
              <span>✓</span> Direct booking link will be sent to this number.
            </p>
          </div>
        </StepSection>

        {/* Submit */}
        <div className="mt-6 space-y-3 pb-8">
          <button type="button" onClick={() => handleSubmit("live")} disabled={submitting || isUploading}
            className="w-full py-4 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-black font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {submitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : isUploading ? <><Loader2 size={18} className="animate-spin" /> Wait for uploads...</> : "SUBMIT AUDITORIUM DETAILS"}
          </button>
          <button type="button" onClick={() => handleSubmit("draft")} disabled={submitting || isUploading}
            className="w-full py-4 bg-transparent border border-[#2a2a2a] text-neutral-400 font-bold rounded-2xl hover:bg-[#1a1a1a] transition-colors disabled:opacity-60">
            SAVE AS DRAFT
          </button>
        </div>
      </div>
    </div>
  );
}

function StepSection({ number, label, children }: { number: string; label: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-amber-400 font-bold text-sm">{number}</span>
        <span className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      {children}
    </div>
  );
}

function FormField({ label, placeholder, value, onChange, type = "text", suffix, multiline }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
  type?: string; suffix?: string; multiline?: boolean;
}) {
  return (
    <div>
      <label className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest block mb-1.5">{label}</label>
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
        {multiline ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
            className="w-full bg-transparent text-white text-sm px-4 py-3 outline-none placeholder:text-neutral-600 resize-none" />
        ) : (
          <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            className="w-full bg-transparent text-white text-sm px-4 py-3 outline-none placeholder:text-neutral-600" />
        )}
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BFC8CA] text-sm">{suffix}</span>}
      </div>
    </div>
  );
}
