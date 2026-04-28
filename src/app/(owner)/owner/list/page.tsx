"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Phone, Loader2, CheckCircle, X, Plus } from "lucide-react";
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

  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // reset so same file can be re-selected if needed
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
        setUploadStatus({ type: "success", msg: `"${file.name}" uploaded successfully!` });
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

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (id: number) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const update = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (status: "live" | "draft") => {
    if (!form.name || !form.seating || !form.address || !form.city) {
      setError("Please fill in all required fields (name, capacity, address, city).");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
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
          heroImageUrl: images[0] || undefined,
          images: images.length > 0 ? images : undefined,
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
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-neutral-400"
        >
          <ArrowLeft size={18} /> <span className="text-sm">Venue Go</span>
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-[#2a2a2a]">
          <Search size={16} className="text-neutral-400" />
        </button>
      </header>

      <div className="px-4">
        <h1 className="text-white font-bold text-3xl leading-tight mb-2">
          List Your<br />Auditorium
        </h1>
        <p className="text-neutral-400 text-sm mb-8">
          Join the network of premier performance spaces. Fill in the details to list your venue on Venue Go.
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
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => update("category", cat.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-semibold transition-all",
                      form.category === cat.value
                        ? "bg-amber-400/10 border-amber-400/50 text-amber-400"
                        : "bg-[#1a1a1a] border-[#2a2a2a] text-neutral-400"
                    )}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
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
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleAmenity(a.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                    isSelected
                      ? "bg-[#2a2a2a] border-amber-400/50 text-white"
                      : "bg-[#1a1a1a] border-[#2a2a2a] text-neutral-400"
                  )}
                >
                  <span className="text-teal-400 text-xl">{a.emoji}</span>
                  <span className="text-xs text-center">{a.label}</span>
                </button>
              );
            })}
          </div>
        </StepSection>

        {/* Step 03 — Gallery (Multi-upload) */}
        <StepSection number="03" label="GALLERY & VISUALS">
          <div className="space-y-3">
            {/* Instructions */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 space-y-1">
              <p className="text-neutral-400 text-xs font-semibold">📋 IMAGE REQUIREMENTS</p>
              <p className="text-neutral-500 text-[11px]">• Formats: JPEG, PNG, WEBP, AVIF</p>
              <p className="text-neutral-500 text-[11px]">• Max size: 5MB per image</p>
              <p className="text-neutral-500 text-[11px]">• Recommended resolution: 1920×1080</p>
              <p className="text-neutral-500 text-[11px]">• First image becomes the cover photo</p>
            </div>

            {/* Inline upload status */}
            {uploadStatus && (
              <div className={`rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-semibold ${
                uploadStatus.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}>
                <span>{uploadStatus.type === "success" ? "✓" : "✕"}</span>
                <span>{uploadStatus.msg}</span>
              </div>
            )}

            {/* Uploaded images grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((url, i) => (
                  <div key={url} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                    {/* Hero badge */}
                    {i === 0 && (
                      <div className="absolute top-1.5 left-1.5 bg-amber-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        COVER
                      </div>
                    )}
                    {/* Remove button */}
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
                  {uploadingImage ? (
                    <Loader2 size={18} className="animate-spin text-amber-400" />
                  ) : (
                    <>
                      <Plus size={18} className="text-neutral-600" />
                      <span className="text-neutral-600 text-[9px] font-bold uppercase">Add</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Initial upload area (shown when no images yet) */}
            {images.length === 0 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingImage}
                className="w-full bg-[#1a1a1a] border-2 border-dashed border-[#2a2a2a] rounded-2xl min-h-[180px] flex flex-col items-center justify-center gap-2 hover:border-amber-400/30 transition-colors"
              >
                {uploadingImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-amber-400" size={24} />
                    <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">UPLOADING...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">📷</span>
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
          </div>
        </StepSection>

        {/* Step 04 — Contact */}
        <StepSection number="04" label="CONTACT GATEWAY">
          <div>
            <label className="text-[#BFC8CA] text-[10px] font-bold uppercase tracking-widest block mb-2">
              WHATSAPP NUMBER <span className="text-neutral-600">ℹ</span>
            </label>
            <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-3">
              <Phone size={14} className="text-[#BFC8CA] shrink-0" />
              <span className="text-neutral-400 text-sm">+91</span>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value)}
                placeholder="98765 43210"
                className="bg-transparent text-white text-sm outline-none flex-1 placeholder:text-neutral-600"
              />
            </div>
            <p className="text-emerald-400 text-xs mt-1.5 flex items-center gap-1">
              <span>✓</span> Direct booking link will be sent to this number.
            </p>
          </div>
        </StepSection>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="mt-6 space-y-3 pb-8">
          <button
            type="button"
            onClick={() => handleSubmit("live")}
            disabled={submitting}
            className="w-full py-4 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-black font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : "SUBMIT AUDITORIUM DETAILS"}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            disabled={submitting}
            className="w-full py-4 bg-transparent border border-[#2a2a2a] text-neutral-400 font-bold rounded-2xl hover:bg-[#1a1a1a] transition-colors disabled:opacity-60"
          >
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
