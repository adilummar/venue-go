import type { Metadata, Viewport } from "next";
import { Manrope, Noto_Serif } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ServiceWorkerRegistrar } from "@/components/shared/ServiceWorkerRegistrar";
import { PushPermissionPrompt } from "@/components/shared/PushNotification";
import { PWAInstallPrompt } from "@/components/shared/PWAInstallPrompt";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto-serif",
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "VenueGo — Discover & Book Auditoriums",
    template: "%s | VenueGo",
  },
  description:
    "Find and book the perfect auditorium, concert hall, or event space. Browse 300+ curated venues across India. WhatsApp-first booking experience.",
  keywords: ["venue booking", "auditorium", "event space", "India", "WhatsApp booking"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VenueGo",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://venuego.in",
    siteName: "VenueGo",
    title: "VenueGo — Discover & Book Auditoriums",
    description: "Find and book the perfect auditorium or event space in India.",
  },
  twitter: {
    card: "summary_large_image",
    title: "VenueGo",
    description: "Discover and book auditoriums across India.",
  },
};

export const viewport: Viewport = {
  themeColor: "#121416",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${notoSerif.variable}`} data-scroll-behavior="smooth">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased bg-[#121416] text-white">
        <ServiceWorkerRegistrar />
        <Providers>
          {children}
          <PushPermissionPrompt />
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
