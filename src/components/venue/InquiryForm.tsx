"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Users, MessageSquare, Lock, Loader2 } from "lucide-react";
import { buildWaLink, buildInquiryMessage } from "@/lib/utils";

interface InquiryFormProps {
  venueId: string;
  venueName: string;
  ownerWhatsapp: string;
  ownerName: string;
}

/* ─── Tiny calendar helpers ─── */
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function toISO(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}
function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function firstDayOfMonth(y: number, m: number) {
  return new Date(y, m, 1).getDay();
}

/* ─── Calendar component ─── */
function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const today = new Date();
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const totalDays = daysInMonth(viewYear, viewMonth);
  const firstDay = firstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  // Build grid cells (leading empty + day numbers)
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  return (
    <div className="mt-3 rounded-xl border border-[#2a2a2a] bg-[#111] p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#222] transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-white text-sm font-semibold">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#222] transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <span key={d} className="text-center text-[10px] font-bold text-[#BFC8CA] uppercase">
            {d}
          </span>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (day === null) return <span key={`empty-${idx}`} />;

          const iso = toISO(viewYear, viewMonth, day);
          const isPast = iso < todayISO;
          const isSelected = iso === value;
          const isToday = iso === todayISO;

          return (
            <button
              key={iso}
              type="button"
              disabled={isPast}
              onClick={() => onChange(iso)}
              className={`
                mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all
                ${isPast ? "text-neutral-700 cursor-not-allowed" : "cursor-pointer"}
                ${isSelected
                  ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-900/30"
                  : isToday && !isPast
                    ? "border border-amber-400 text-amber-400 hover:bg-amber-400/10"
                    : !isPast
                      ? "text-neutral-300 hover:bg-[#2a2a2a] hover:text-white"
                      : ""
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Selected date display */}
      {value && (
        <p className="mt-3 text-center text-xs text-amber-400 font-medium">
          ✓ Selected: {new Date(value + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </p>
      )}
    </div>
  );
}

/* ─── Main InquiryForm ─── */
export const InquiryForm = ({
  venueId,
  venueName,
  ownerWhatsapp,
  ownerName,
}: InquiryFormProps) => {
  const [date, setDate] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [guests, setGuests] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const waMessage = buildInquiryMessage({
    venueName,
    date: date || "TBD",
    guestCount: Number(guests) || 0,
    message: message || "I am interested in booking this venue.",
  });

  const waLink = ownerWhatsapp ? buildWaLink(ownerWhatsapp, waMessage) : "#";

  const handleSendViaWhatsApp = async () => {
    if (!saved && date && guests) {
      setLoading(true);
      try {
        await fetch("/api/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            venueId,
            eventDate: date,
            guestCount: Number(guests),
            message: message || undefined,
          }),
        });
        setSaved(true);
      } catch {
        // Non-blocking — still open WhatsApp even if save fails
      } finally {
        setLoading(false);
      }
    }
    if (ownerWhatsapp) {
      window.open(waLink, "_blank", "noopener,noreferrer");
    }
  };

  const isReady = !!date && !!guests;

  // Human-friendly selected date label
  const dateLabel = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
      <h2 className="text-white font-bold text-2xl mb-2" style={{fontFamily: 'var(--font-noto-serif)'}}>Send an Inquiry</h2>
      <p className="text-neutral-400 text-sm mb-6">
        Connecting you with{" "}
        <span className="text-white font-medium">{ownerName}</span>, the venue
        manager. Your details will be pre-filled in a WhatsApp message.
      </p>

      <div className="space-y-5">
        {/* Date */}
        <div>
          <label className="text-[#BFC8CA] text-[11px] font-bold uppercase tracking-widest block mb-2">
            DATE OF EVENT
          </label>
          {/* Trigger button */}
          <button
            type="button"
            onClick={() => setCalendarOpen(o => !o)}
            className={`flex items-center gap-3 w-full border-b pb-3 transition-colors ${
              calendarOpen ? "border-amber-400/60" : "border-[#2a2a2a]"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`shrink-0 transition-colors ${
                calendarOpen ? "text-amber-400" : "text-[#BFC8CA]"
              }`}
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span className={`text-sm text-left flex-1 ${date ? "text-white" : "text-neutral-600"}`}>
              {dateLabel ?? "Pick a date from calendar"}
            </span>
            <ChevronRight
              size={14}
              className={`text-neutral-600 transition-transform ${calendarOpen ? "rotate-90" : ""}`}
            />
          </button>

          {/* Inline calendar */}
          {calendarOpen && (
            <DatePicker
              value={date}
              onChange={(v) => {
                setDate(v);
                setCalendarOpen(false);
              }}
            />
          )}
        </div>

        {/* Guests */}
        <div>
          <label className="text-[#BFC8CA] text-[11px] font-bold uppercase tracking-widest block mb-2">
            EXPECTED GUESTS
          </label>
          <div className="flex items-center gap-3 border-b border-[#2a2a2a] pb-3">
            <Users size={18} className="text-[#BFC8CA] shrink-0" />
            <input
              type="number"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              placeholder="Number of attendees"
              min={1}
              className="bg-transparent text-white text-sm outline-none w-full placeholder:text-neutral-600"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="text-[#BFC8CA] text-[11px] font-bold uppercase tracking-widest block mb-2">
            MESSAGE TO OWNER
          </label>
          <div className="flex items-start gap-3">
            <MessageSquare size={18} className="text-[#BFC8CA] shrink-0 mt-1" />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Tell us about your event (e.g. Wedding Reception, Engagement)..."
              className="bg-transparent text-white text-sm outline-none w-full placeholder:text-neutral-600 resize-none"
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleSendViaWhatsApp}
        disabled={loading || !ownerWhatsapp}
        className={`mt-6 flex items-center justify-center gap-2 w-full font-bold py-4 rounded-2xl text-base transition-all
          ${isReady
            ? "bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-black shadow-lg shadow-amber-900/20"
            : "bg-[#2a2a2a] text-[#BFC8CA] cursor-not-allowed"
          }
          ${loading ? "opacity-70" : ""}`}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Saving...
          </>
        ) : saved ? (
          "✓ Inquiry Sent — Open WhatsApp Again"
        ) : (
          "Send Message via WhatsApp →"
        )}
      </button>

      {!isReady && (
        <p className="text-center text-neutral-600 text-xs mt-2">
          Please select a date and number of guests first
        </p>
      )}

      {/* Trust note */}
      <div className="mt-3 flex items-center justify-center gap-2 text-[#BFC8CA] text-xs">
        <Lock size={12} />
        <span>This will open WhatsApp directly to contact the owner.</span>
      </div>

      {/* Success tracking link */}
      {saved && (
        <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
          <p className="text-emerald-400 text-xs font-bold mb-1">✓ Inquiry logged successfully!</p>
          <a
            href="/tickets"
            className="text-amber-400 text-xs underline underline-offset-2 hover:text-amber-300"
          >
            Track your enquiry status → My Bookings
          </a>
        </div>
      )}
    </div>
  );
};

