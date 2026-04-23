import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Book, Phone } from "lucide-react";

export const metadata: Metadata = { title: "Help & Support" };

const FAQ = [
  {
    q: "How do I book a venue?",
    a: "Browse venues on the Explore page, open a venue you like, and tap 'Send Inquiry'. Fill in your event details and tap 'Send Message via WhatsApp' to connect directly with the owner.",
  },
  {
    q: "How does the WhatsApp inquiry work?",
    a: "When you send an inquiry, it opens WhatsApp with a pre-filled message to the venue owner. Your event date, guest count, and message are included automatically.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Contact the venue owner directly via WhatsApp. Cancellation policies vary by venue.",
  },
  {
    q: "How do I list my venue?",
    a: "Go to Owner Dashboard → tap the '+' button or 'New Auditorium'. Fill in the 4-step form with venue details, amenities, photos, and WhatsApp number.",
  },
  {
    q: "Why am I not getting push notifications?",
    a: "Go to Profile → Notification Settings. Make sure notifications are enabled. If blocked, you need to allow them from your browser's site settings.",
  },
  {
    q: "How do I update my profile?",
    a: "Go to Profile → Personal Information to update your name, phone, and WhatsApp number.",
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] pb-12">
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <Link href="/profile" className="text-neutral-400"><ArrowLeft size={20} /></Link>
        <h1 className="text-white font-bold text-lg">Help & Support</h1>
      </header>

      <div className="px-4 space-y-6">
        {/* Contact */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href="https://wa.me/919746117985?text=Hi%2C%20I%20need%20help%20with%20VenueGo"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
          >
            <MessageCircle size={24} className="text-emerald-400" />
            <p className="text-white font-semibold text-sm">Chat on WhatsApp</p>
            <p className="text-[#BFC8CA] text-xs">Fastest response</p>
          </a>
          <a
            href="tel:+919746117985"
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
          >
            <Phone size={24} className="text-amber-400" />
            <p className="text-white font-semibold text-sm">Call Support</p>
            <p className="text-[#BFC8CA] text-xs">Mon–Sat 10AM–6PM</p>
          </a>
        </div>

        {/* FAQ */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Book size={16} className="text-amber-400" />
            <h2 className="text-white font-bold text-base">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <details
                key={i}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden group"
              >
                <summary className="px-4 py-4 text-white font-medium text-sm cursor-pointer flex items-center justify-between">
                  {item.q}
                  <span className="text-[#BFC8CA] group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <div className="px-4 pb-4 text-neutral-400 text-sm leading-relaxed border-t border-[#2a2a2a] pt-3">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-neutral-700 text-xs">
          VenueGo v1.0.0 · Built with ❤️ for India
        </p>
      </div>
    </div>
  );
}
