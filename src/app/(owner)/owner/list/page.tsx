"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Phone, Loader2, CheckCircle } from "lucide-react";
import { AMENITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function ListVenuePage() {
  const router = useRouter();
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const heroFileRef = useRef<HTMLInputElement>(null);

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
    heroImageUrl: "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setForm((f) => ({ ...f, heroImageUrl: data.data.url }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
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
          heroImageUrl: form.heroImageUrl || undefined,
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

        {/* Step 03 — Gallery */}
        <StepSection number="03" label="GALLERY & VISUALS">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => heroFileRef.current?.click()}
              disabled={uploadingImage}
              className="w-full bg-[#1a1a1a] border border-dashed border-[#2a2a2a] rounded-2xl py-10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#3a3a3a] transition-colors relative overflow-hidden group min-h-[200px]"
            >
              {form.heroImageUrl && (
                <div className="absolute inset-0 w-full h-full">
                  <img src={form.heroImageUrl} alt="Hero Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                     <span className="text-white text-2xl mb-2">📷</span>
                     <p className="text-white text-xs font-semibold uppercase tracking-wider">CLICK TO CHANGE IMAGE</p>
                  </div>
                </div>
              )}
              
              {uploadingImage ? (
                <div className="relative z-10 flex flex-col items-center bg-[#1a1a1a]/80 p-4 rounded-xl">
                  <Loader2 className="animate-spin text-amber-400 mb-2" size={24} />
                  <p className="text-neutral-200 text-xs font-semibold uppercase tracking-wider">UPLOADING...</p>
                </div>
              ) : !form.heroImageUrl && (
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-neutral-600 text-3xl mb-2">📷</span>
                  <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">UPLOAD HERO IMAGE</p>
                  <p className="text-neutral-500 text-xs text-center px-6 mt-2">Recommended: 1920x1080 (High Resolution)</p>
                  <p className="text-neutral-600 text-[10px] text-center px-6 mt-1">Formats: JPEG, PNG, WEBP, AVIF (Max 5MB)</p>
                </div>
              )}
            </button>
            <input ref={heroFileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <div className="bg-[#1a1a1a] border border-dashed border-[#2a2a2a] rounded-2xl py-10 flex flex-col items-center gap-2 cursor-pointer hover:border-[#3a3a3a] transition-colors">
              <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">MORE PHOTOS</p>
              <p className="text-neutral-600 text-xs">Upload after listing is created</p>
            </div>
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
