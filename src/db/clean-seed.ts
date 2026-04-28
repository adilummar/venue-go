/**
 * Clean-seed script — resets demo data for the complete trial flow.
 *
 * What it does:
 *  1. Ensures owner@venuego.dev and customer@venuego.dev exist with correct passwords
 *  2. Removes all venues NOT owned by owner@venuego.dev (orphaned data)
 *  3. Re-seeds 6 demo venues under owner@venuego.dev (skips if already exist)
 *  4. Seeds demo inquiries from customer → owner (for testing inquiry flow)
 *  5. Seeds a demo confirmed booking (for testing My Tickets)
 *
 * Run with: npx tsx src/db/clean-seed.ts
 * ⚠️  WARNING: This DELETES venues not owned by the demo owner account.
 *              Do NOT run against production unless you understand the impact.
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { users, venues, amenities, venueAmenities, inquiries, bookings } from "./schema";
import { generateSlug } from "../lib/utils";
import bcrypt from "bcryptjs";
import { eq, ne, and, notInArray } from "drizzle-orm";

async function cleanSeed() {
  console.log("🧹 VenueGo Clean-Seed Starting...\n");

  // ── 1. Amenities ──────────────────────────────────────────────────────────
  console.log("  → Ensuring amenities...");
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

  // Fetch all amenities (in case they already existed)
  const allAmenities = await db.select().from(amenities);

  // ── 2. Owner user ─────────────────────────────────────────────────────────
  console.log("  → Ensuring owner account (owner@venuego.dev)...");
  const passwordHash = await bcrypt.hash("password123", 10);

  let [owner] = await db
    .select()
    .from(users)
    .where(eq(users.email, "owner@venuego.dev"))
    .limit(1);

  if (!owner) {
    const [newOwner] = await db
      .insert(users)
      .values({
        email: "owner@venuego.dev",
        passwordHash,
        name: "Rajesh Sharma",
        role: "owner",
        whatsapp: "919746117985",
        phone: "+919746117985",
        hostSince: 2018,
        responseTime: "within 1 hour",
        isSuperhost: true,
        membership: "patron_circle",
      })
      .returning();
    owner = newOwner;
    console.log("  ✓ Owner created");
  } else {
    // Update password hash to ensure login works
    await db
      .update(users)
      .set({
        passwordHash,
        whatsapp: "919746117985",
        phone: "+919746117985",
        hostSince: 2018,
        responseTime: "within 1 hour",
        isSuperhost: true,
        role: "owner",
        membership: "patron_circle",
      })
      .where(eq(users.id, owner.id));
    console.log("  ✓ Owner already exists — password reset to password123");
  }

  // ── 3. Customer user ──────────────────────────────────────────────────────
  console.log("  → Ensuring customer account (customer@venuego.dev)...");

  let [customer] = await db
    .select()
    .from(users)
    .where(eq(users.email, "customer@venuego.dev"))
    .limit(1);

  if (!customer) {
    const [newCustomer] = await db
      .insert(users)
      .values({
        email: "customer@venuego.dev",
        passwordHash,
        name: "Priya Nair",
        role: "customer",
        phone: "+919876543210",
        membership: "standard",
      })
      .returning();
    customer = newCustomer;
    console.log("  ✓ Customer created");
  } else {
    await db
      .update(users)
      .set({ passwordHash, role: "customer", phone: "+919876543210" })
      .where(eq(users.id, customer.id));
    console.log("  ✓ Customer already exists — password reset to password123");
  }

  // ── 4. Remove orphaned / ownerless venues ─────────────────────────────────
  console.log("  → Removing venues not owned by owner@venuego.dev...");
  const deleted = await db
    .delete(venues)
    .where(ne(venues.ownerId, owner.id))
    .returning({ name: venues.name });

  if (deleted.length > 0) {
    console.log(`  ✓ Removed ${deleted.length} orphaned venue(s): ${deleted.map(v => v.name).join(", ")}`);
  } else {
    console.log("  ✓ No orphaned venues found");
  }

  // ── 5. Seed demo venues under owner ──────────────────────────────────────
  console.log("  → Seeding demo venues...");
  const venueData = [
    {
      name: "Shanmukhananda Hall",
      description: "One of Mumbai's most acclaimed auditoriums with a 2,952-seat capacity, world-class acoustics, and a legacy of hosting legendary performances. Recently renovated with state-of-the-art lighting and sound systems.",
      address: "292, Comrade Harbanslal Marg, Sion East",
      city: "Mumbai",
      state: "Maharashtra",
      category: "concert_hall" as const,
      seatingCapacity: 2952,
      pricePerEvening: "450000",
      isCurated: true,
      demandLabel: "High demand",
      heroImageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
      status: "live" as const,
    },
    {
      name: "Nehru Centre Auditorium",
      description: "A prestigious cultural venue in the heart of Mumbai's Worli district. Known for hosting international acts and corporate events. Features a 1,010-seat main hall with excellent sightlines.",
      address: "Dr. Annie Besant Road, Worli",
      city: "Mumbai",
      state: "Maharashtra",
      category: "theatre" as const,
      seatingCapacity: 1010,
      pricePerEvening: "320000",
      isCurated: true,
      demandLabel: "Popular",
      heroImageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
      status: "live" as const,
    },
    {
      name: "Siri Fort Auditorium",
      description: "A landmark auditorium in Delhi with 1,800 seats. Offers two halls — the main hall and a smaller 200-seat studio. Ideal for film screenings, dance performances, and cultural festivals.",
      address: "August Kranti Marg, Siri Fort",
      city: "Delhi",
      state: "Delhi",
      category: "theatre" as const,
      seatingCapacity: 1800,
      pricePerEvening: "280000",
      isCurated: false,
      demandLabel: "Trending",
      heroImageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
      status: "live" as const,
    },
    {
      name: "Chowdiah Memorial Hall",
      description: "Built in the shape of a violin to honor violinist T Chowdiah, this iconic Bengaluru venue is a cultural landmark.",
      address: "Vyalikaval, Gavipuram Extension",
      city: "Bengaluru",
      state: "Karnataka",
      category: "concert_hall" as const,
      seatingCapacity: 820,
      pricePerEvening: "220000",
      isCurated: true,
      demandLabel: "High demand",
      heroImageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80",
      status: "live" as const,
    },
    {
      name: "Tagore Open Air Theatre",
      description: "A stunning open-air amphitheatre in Kolkata's Rabindra Sarobar. Set amid lush greenery with a natural lake backdrop.",
      address: "Rabindra Sarobar, Lake Area",
      city: "Kolkata",
      state: "West Bengal",
      category: "open_air" as const,
      seatingCapacity: 3500,
      pricePerEvening: "180000",
      isCurated: false,
      demandLabel: "Newly listed",
      heroImageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
      status: "live" as const,
    },
    {
      name: "Palace Grounds Arena",
      description: "Bengaluru's premier event destination spread across 35 acres. The grand hall features Italian marble flooring, crystal chandeliers, and unmatched palatial elegance.",
      address: "Jayamahal Road, Mehkri Circle",
      city: "Bengaluru",
      state: "Karnataka",
      category: "palatial" as const,
      seatingCapacity: 5000,
      pricePerEvening: "750000",
      isCurated: true,
      demandLabel: "High demand",
      heroImageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
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

  console.log(`  ✓ ${insertedVenues.length} venue(s) inserted (${venueData.length - insertedVenues.length} already existed)`);

  // Fetch all owner's venues for seeding inquiries/bookings
  const allOwnerVenues = await db
    .select()
    .from(venues)
    .where(eq(venues.ownerId, owner.id));

  // ── 6. Link amenities to venues ───────────────────────────────────────────
  if (insertedVenues.length > 0 && allAmenities.length > 0) {
    console.log("  → Linking amenities to new venues...");
    const amenityLinks = insertedVenues.flatMap((venue) =>
      allAmenities.slice(0, 5).map((a) => ({
        venueId: venue.id,
        amenityId: a.id,
      }))
    );
    await db.insert(venueAmenities).values(amenityLinks).onConflictDoNothing();
    console.log(`  ✓ Linked amenities to ${insertedVenues.length} venue(s)`);
  }

  // ── 7. Seed demo inquiries ────────────────────────────────────────────────
  console.log("  → Seeding demo inquiries...");

  if (allOwnerVenues.length >= 2) {
    const venue1 = allOwnerVenues[0];
    const venue2 = allOwnerVenues[1];

    const today = new Date();
    const futureDate1 = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const futureDate2 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    await db
      .insert(inquiries)
      .values([
        {
          venueId: venue1.id,
          customerId: customer.id,
          ownerId: owner.id,
          eventDate: futureDate1,
          guestCount: 500,
          message: "We are planning a classical music concert. Please share availability and pricing details.",
          status: "new",
          whatsappSent: false,
        },
        {
          venueId: venue2.id,
          customerId: customer.id,
          ownerId: owner.id,
          eventDate: futureDate2,
          guestCount: 200,
          message: "Corporate annual event for our team. Need full hall with catering area.",
          status: "responded",
          whatsappSent: true,
        },
      ])
      .onConflictDoNothing();

    console.log("  ✓ Demo inquiries seeded (1 new, 1 responded)");

    // ── 8. Seed a confirmed demo booking ──────────────────────────────────
    console.log("  → Seeding demo confirmed booking...");
    const refNum = 1001;
    await db
      .insert(bookings)
      .values({
        bookingRef: `VG-${refNum}`,
        venueId: venue2.id,
        customerId: customer.id,
        eventName: "Corporate Annual Day",
        eventDate: futureDate2,
        startTime: "18:00",
        endTime: "22:00",
        guestCount: 200,
        status: "confirmed",
        area: "Main Hall",
      })
      .onConflictDoNothing();

    console.log("  ✓ Demo booking seeded (VG-1001, confirmed)");
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log("\n✅ Clean-seed complete!");
  console.log("\n🔑 Demo Accounts (Password for both: password123):");
  console.log("   Owner:    owner@venuego.dev    → /owner/dashboard");
  console.log("   Customer: customer@venuego.dev → / (Explore)");
  console.log("\n🎯 Trial Flow:");
  console.log("   1. Login as customer → explore → wishlist a venue → send inquiry");
  console.log("   2. Login as owner    → /owner/inquiries → Confirm Booking");
  console.log("   3. Login as customer → My Bookings → see confirmed booking ✓");

  process.exit(0);
}

cleanSeed().catch((err) => {
  console.error("❌ Clean-seed failed:", err);
  process.exit(1);
});
