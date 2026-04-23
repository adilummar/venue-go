// Push notification helper — server-side only
import webpush from "web-push";

if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  console.warn("[push] VAPID keys not configured — push notifications disabled");
} else {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL ?? "mailto:admin@venuego.dev",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export { webpush };

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
}

export async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<boolean> {
  if (!process.env.VAPID_PRIVATE_KEY) return false;
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload),
      { TTL: 86400 }
    );
    return true;
  } catch (err: unknown) {
    // 410 Gone = subscription expired, caller should delete it
    if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
      console.info("[push] Subscription expired:", subscription.endpoint);
    } else {
      console.error("[push] Send failed:", err);
    }
    return false;
  }
}
