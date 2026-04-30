"use client";

import { useState } from "react";

export default function NotificationList() {
  const [settings, setSettings] = useState([
    { id: "inquiry", label: "New Inquiry", sub: "When someone inquires about your venue", on: true },
    { id: "booking", label: "Booking Confirmed", sub: "When your booking request is approved", on: true },
    { id: "whatsapp", label: "WhatsApp Responses", sub: "Reminders for pending WhatsApp messages", on: false },
    { id: "promo", label: "Promotional", sub: "Offers, curated picks and venue news", on: false },
  ]);

  const toggleSetting = (index: number) => {
    const newSettings = [...settings];
    newSettings[index].on = !newSettings[index].on;
    setSettings(newSettings);
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
      {settings.map((item, i) => (
        <div
          key={item.id}
          className={`flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-[#222] transition-colors ${
            i > 0 ? "border-t border-[#2a2a2a]" : ""
          }`}
          onClick={() => toggleSetting(i)}
        >
          <div>
            <p className="text-white text-sm font-medium">{item.label}</p>
            <p className="text-[#BFC8CA] text-xs mt-0.5">{item.sub}</p>
          </div>
          <div
            className={`w-11 h-6 rounded-full transition-colors relative ${
              item.on ? "bg-amber-400" : "bg-[#2a2a2a]"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                item.on ? "left-6" : "left-1"
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
