"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, X } from "lucide-react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function PushPermissionPrompt() {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle");

  useEffect(() => {
    // Only show if Notifications API exists and we haven't asked yet
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission === "granted") return;
    if (Notification.permission === "denied") return;

    // Throttle: only show once per 7 days
    const STORAGE_KEY = "venuego_push_prompt_last";
    const last = localStorage.getItem(STORAGE_KEY);
    if (last && Date.now() - Number(last) < 7 * 24 * 60 * 60 * 1000) return;

    // Delay prompt by 5s so it doesn't hit on first load
    const t = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      setShow(true);
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  const handleAllow = async () => {
    setStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        setShow(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) throw new Error("VAPID key missing");

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      });

      const subJson = sub.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        }),
      });

      setStatus("granted");
      setShow(false);
    } catch (err) {
      console.error("[push] Subscribe failed:", err);
      setStatus("denied");
      setShow(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 shadow-2xl max-w-sm mx-auto">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
            <Bell size={20} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">Stay in the loop</p>
            <p className="text-neutral-400 text-xs mt-0.5 leading-relaxed">
              Get notified when someone inquires about your venue or when your booking is confirmed.
            </p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="text-neutral-600 hover:text-neutral-400 shrink-0 p-1"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleAllow}
            disabled={status === "loading"}
            className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-bold text-sm rounded-xl transition-colors disabled:opacity-60"
          >
            {status === "loading" ? "Enabling..." : "Allow Notifications"}
          </button>
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2.5 bg-[#2a2a2a] text-neutral-400 text-sm rounded-xl hover:bg-[#333] transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

// Compact bell icon for settings (shows current permission status)
export function NotificationToggle() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);

  const toggle = async () => {
    if (permission === "granted") {
      // Unsubscribe
      setLoading(true);
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
        setPermission("default");
      } catch (err) {
        console.error("[push] Unsubscribe failed:", err);
      } finally {
        setLoading(false);
      }
    } else if (permission === "default") {
      // Subscribe
      setLoading(true);
      try {
        const newPerm = await Notification.requestPermission();
        setPermission(newPerm);
        if (newPerm === "granted") {
          const reg = await navigator.serviceWorker.ready;
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (!vapidKey) throw new Error("VAPID key missing");

          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
          });

          const subJson = sub.toJSON();
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              endpoint: subJson.endpoint,
              keys: subJson.keys,
            }),
          });
        }
      } catch (err) {
        console.error("[push] Subscribe failed:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 text-sm"
      disabled={loading || permission === "denied"}
    >
      {permission === "granted" ? (
        <><Bell size={16} className="text-amber-400" /><span className="text-amber-400">Notifications ON</span></>
      ) : permission === "denied" ? (
        <><BellOff size={16} className="text-[#BFC8CA]" /><span className="text-[#BFC8CA]">Blocked by browser</span></>
      ) : (
        <><Bell size={16} className="text-neutral-400" /><span className="text-neutral-400">Enable Notifications</span></>
      )}
    </button>
  );
}
