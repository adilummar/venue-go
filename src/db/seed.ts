/**
 * Seed script — inserts demo data for local development
 * Run with: npx tsx src/db/seed.ts
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { users, venues, amenities, venueAmenities } from "./schema";
import { generateSlug } from "../lib/utils";

async function seed() {
  console.log("🌱 Seeding database...");

  // ── 1. Amenities ──────────────────────────────────────────────────────────
  console.log("  → Inserting amenities...");
  const seededAmenities = await db
    .insert(amenities)
    .values([
      { name: "Central AC", icon: "ac" },
      { name: "Stage Camera", icon: "camera" },
      { name: "High-speed WiFi", icon: "wifi" },
      { name: "Grand Piano", icon: "piano" },
      { name: "Parking Lot", icon: "parking" },
      { name: "Catering Area", icon: "catering" },
      { name: "Green Room", icon: "greenroom" },
      { name: "Accessibility Ramps", icon: "ramps" },
    ])
    .onConflictDoNothing()
    .returning();

  // ── 2. Owner user ─────────────────────────────────────────────────────────
  console.log("  → Inserting owner user...");
  const [owner] = await db
    .insert(users)
    .values({
      email: "owner@venuego.dev",
      name: "Rajesh Sharma",
      role: "owner",
      whatsapp: "919746117985",
      hostSince: 2018,
      responseTime: "within 1 hour",
      isSuperhost: true,
      membership: "patron_circle",
    })
    .onConflictDoNothing()
    .returning();

  // ── 3. Customer user ──────────────────────────────────────────────────────
  console.log("  → Inserting customer user...");
  await db
    .insert(users)
    .values({
      email: "customer@venuego.dev",
      name: "Priya Nair",
      role: "customer",
      membership: "standard",
    })
    .onConflictDoNothing();

  if (!owner) {
    console.log("  ⚠ Owner already exists, skipping venues...");
    console.log("✅ Seed complete (skipped — data already exists).");
    process.exit(0);
  }

  // ── 4. Demo venues ────────────────────────────────────────────────────────
  console.log("  → Inserting venues...");
  const venueData = [
    {
      name: "Shanmukhananda Hall",
      description:
        "One of Mumbai's most acclaimed auditoriums with a 2,952-seat capacity, world-class acoustics, and a legacy of hosting legendary performances. Recently renovated with state-of-the-art lighting and sound systems.",
      address: "292, Comrade Harbanslal Marg, Sion East",
      city: "Mumbai",
      state: "Maharashtra",
      category: "concert_hall" as const,
      seatingCapacity: 2952,
      pricePerEvening: "450000",
      isCurated: true,
      demandLabel: "High demand",
      heroImageUrl:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
      status: "live" as const,
    },
    {
      name: "Nehru Centre Auditorium",
      description:
        "A prestigious cultural venue in the heart of Mumbai's Worli district. Known for hosting international acts and corporate events. Features a 1,010-seat main hall with excellent sightlines.",
      address: "Dr. Annie Besant Road, Worli",
      city: "Mumbai",
      state: "Maharashtra",
      category: "theatre" as const,
      seatingCapacity: 1010,
      pricePerEvening: "320000",
      isCurated: true,
      demandLabel: "Popular",
      heroImageUrl:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
      status: "live" as const,
    },
    {
      name: "Siri Fort Auditorium",
      description:
        "A landmark auditorium in Delhi with 1,800 seats. Offers two halls — the main hall and a smaller 200-seat studio. Ideal for film screenings, dance performances, and cultural festivals.",
      address: "August Kranti Marg, Siri Fort",
      city: "Delhi",
      state: "Delhi",
      category: "theatre" as const,
      seatingCapacity: 1800,
      pricePerEvening: "280000",
      isCurated: false,
      demandLabel: "Trending",
      heroImageUrl:
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
      status: "live" as const,
    },
    {
      name: "Chowdiah Memorial Hall",
      description:
        "Built in the shape of a violin to honor violinist T Chowdiah, this iconic Bengaluru venue is a cultural landmark. Hosts the prestigious Bengaluru Gayana Samaja concerts.",
      address: "Vyalikaval, Gavipuram Extension",
      city: "Bengaluru",
      state: "Karnataka",
      category: "concert_hall" as const,
      seatingCapacity: 820,
      pricePerEvening: "220000",
      isCurated: true,
      demandLabel: "High demand",
      heroImageUrl:
        "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80",
      status: "live" as const,
    },
    {
      name: "Tagore Open Air Theatre",
      description:
        "A stunning open-air amphitheatre in Kolkata's Rabindra Sarobar. Set amid lush greenery with a natural lake backdrop — unmatched for outdoor concerts and cultural evenings.",
      address: "Rabindra Sarobar, Lake Area",
      city: "Kolkata",
      state: "West Bengal",
      category: "open_air" as const,
      seatingCapacity: 3500,
      pricePerEvening: "180000",
      isCurated: false,
      demandLabel: "Newly listed",
      heroImageUrl:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
      status: "live" as const,
    },
    {
      name: "Palace Grounds Arena",
      description:
        "Bengaluru's premier event destination spread across 35 acres of palace grounds. The grand hall features Italian marble flooring, crystal chandeliers, and unmatched palatial elegance for large-scale events.",
      address: "Jayamahal Road, Mehkri Circle",
      city: "Bengaluru",
      state: "Karnataka",
      category: "palatial" as const,
      seatingCapacity: 5000,
      pricePerEvening: "750000",
      isCurated: true,
      demandLabel: "High demand",
      heroImageUrl:
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
      status: "live" as const,
    },
  ];

  const insertedVenues = await db
    .insert(venues)
    .values(
      venueData.map((v) => ({
        ...v,
        slug: generateSlug(v.name),
        ownerId: owner.id,
      }))
    )
    .onConflictDoNothing()
    .returning();

  // ── 5. Link amenities to venues ───────────────────────────────────────────
  if (insertedVenues.length > 0 && seededAmenities.length > 0) {
    console.log("  → Linking amenities to venues...");
    const amenityLinks = insertedVenues.flatMap((venue) =>
      seededAmenities.slice(0, 5).map((a) => ({
        venueId: venue.id,
        amenityId: a.id,
      }))
    );

    await db.insert(venueAmenities).values(amenityLinks).onConflictDoNothing();
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   ${insertedVenues.length} venues created`);
  console.log(`   ${seededAmenities.length} amenities created`);
  console.log(`\n🔑 Test accounts:`);
  console.log(`   Owner:    owner@venuego.dev`);
  console.log(`   Customer: customer@venuego.dev`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
