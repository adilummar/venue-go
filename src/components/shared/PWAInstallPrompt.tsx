"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      
      // Check if we've been dismissed recently
      const dismissed = localStorage.getItem("venuego_pwa_install_dismissed");
      // Show if never dismissed, or dismissed more than 7 days ago
      if (!dismissed || Date.now() - Number(dismissed) > 7 * 24 * 60 * 60 * 1000) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Also listen for successful install to hide the prompt
    window.addEventListener("appinstalled", () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for 7 days
    localStorage.setItem("venuego_pwa_install_dismissed", String(Date.now()));
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[60] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 shadow-2xl max-w-sm mx-auto flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
              <Download size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Install VenueGo</p>
              <p className="text-neutral-400 text-xs mt-0.5">Fast, offline-ready experience</p>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-neutral-500 hover:text-white p-1 transition-colors">
            <X size={16} />
          </button>
        </div>
        <button
          onClick={handleInstall}
          className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-bold text-sm rounded-xl transition-colors"
        >
          Install App
        </button>
      </div>
    </div>
  );
}
