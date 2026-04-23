"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "shared">("idle");

  const handleShare = async () => {
    // Use native Web Share API if available (works great on mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        setState("shared");
        setTimeout(() => setState("idle"), 2500);
      } catch {
        // User cancelled — do nothing
      }
      return;
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      // Clipboard also failed — last resort: prompt
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        aria-label="Share venue"
        className="w-9 h-9 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-all active:scale-90"
      >
        {state === "idle" ? (
          <Share2 size={16} className="text-white" />
        ) : (
          <Check size={16} className="text-amber-400" />
        )}
      </button>

      {/* Toast */}
      {state !== "idle" && (
        <div className="absolute right-0 top-11 z-50 flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 text-xs text-white shadow-xl animate-fade-in">
          {state === "copied" ? (
            <>
              <Copy size={11} className="text-amber-400" />
              Link copied!
            </>
          ) : (
            <>
              <Check size={11} className="text-green-400" />
              Shared!
            </>
          )}
        </div>
      )}
    </div>
  );
}
