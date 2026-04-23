import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  numeric,
  date,
  time,
  timestamp,
  serial,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ─── users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  role: text("role", { enum: ["customer", "owner", "admin"] })
    .notNull()
    .default("customer"),
  membership: text("membership", { enum: ["standard", "patron_circle"] }).default(
    "standard"
  ),
  hostSince: integer("host_since"),
  responseTime: text("response_time"),
  isSuperhost: boolean("is_superhost").default(false),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(
    sql`now()`
  ),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(
    sql`now()`
  ),
});

// ─── venues ───────────────────────────────────────────────────────────────────
export const venues = pgTable(
  "venues",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description"),
    address: text("address").notNull(),
    city: text("city").notNull(),
    state: text("state"),
    latitude: numeric("latitude", { precision: 9, scale: 6 }),
    longitude: numeric("longitude", { precision: 9, scale: 6 }),
    category: text("category", {
      enum: ["open_air", "theatre", "concert_hall", "palatial"],
    }).notNull(),
    seatingCapacity: integer("seating_capacity").notNull(),
    pricePerEvening: numeric("price_per_evening", {
      precision: 10,
      scale: 2,
    }).notNull(),
    heroImageUrl: text("hero_image_url"),
    status: text("status", {
      enum: ["draft", "pending_review", "live", "archived"],
    })
      .notNull()
      .default("draft"),
    isCurated: boolean("is_curated").default(false),
    demandLabel: text("demand_label"),
    createdAt: timestamp("created_at", { withTimezone: true }).default(
      sql`now()`
    ),
    updatedAt: timestamp("updated_at", { withTimezone: true }).default(
      sql`now()`
    ),
  },
  (table) => [
    index("idx_venues_city").on(table.city),
    index("idx_venues_category").on(table.category),
    index("idx_venues_status").on(table.status),
  ]
);

// ─── venue_images ─────────────────────────────────────────────────────────────
export const venueImages = pgTable(
  "venue_images",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    isHero: boolean("is_hero").default(false),
    position: integer("position").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).default(
      sql`now()`
    ),
  },
  (table) => [index("idx_venue_images_venue").on(table.venueId)]
);

// ─── amenities ────────────────────────────────────────────────────────────────
export const amenities = pgTable("amenities", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  icon: text("icon"),
});

// ─── venue_amenities ──────────────────────────────────────────────────────────
export const venueAmenities = pgTable(
  "venue_amenities",
  {
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "cascade" }),
    amenityId: integer("amenity_id")
      .notNull()
      .references(() => amenities.id),
  },
  (table) => [primaryKey({ columns: [table.venueId, table.amenityId] })]
);

// ─── reviews ──────────────────────────────────────────────────────────────────
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => users.id),
    ratingOverall: numeric("rating_overall", { precision: 2, scale: 1 }).notNull(),
    ratingAcoustics: numeric("rating_acoustics", { precision: 2, scale: 1 }),
    ratingCommunication: numeric("rating_communication", {
      precision: 2,
      scale: 1,
    }),
    ratingCleanliness: numeric("rating_cleanliness", { precision: 2, scale: 1 }),
    ratingLocation: numeric("rating_location", { precision: 2, scale: 1 }),
    body: text("body"),
    createdAt: timestamp("created_at", { withTimezone: true }).default(
      sql`now()`
    ),
  },
  (table) => [index("idx_reviews_venue").on(table.venueId)]
);

// ─── inquiries ────────────────────────────────────────────────────────────────
export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => users.id),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id),
    eventDate: date("event_date").notNull(),
    guestCount: integer("guest_count").notNull(),
    message: text("message"),
    status: text("status", { enum: ["new", "responded", "archived"] })
      .notNull()
      .default("new"),
    whatsappSent: boolean("whatsapp_sent").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).default(
      sql`now()`
    ),
    updatedAt: timestamp("updated_at", { withTimezone: true }).default(
      sql`now()`
    ),
  },
  (table) => [
    index("idx_inquiries_owner").on(table.ownerId),
    index("idx_inquiries_customer").on(table.customerId),
    index("idx_inquiries_venue").on(table.venueId),
    index("idx_inquiries_status").on(table.status),
  ]
);

// ─── bookings ─────────────────────────────────────────────────────────────────
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    bookingRef: text("booking_ref").unique().notNull(),
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => users.id),
    inquiryId: uuid("inquiry_id").references(() => inquiries.id),
    eventName: text("event_name"),
    area: text("area"),
    eventDate: date("event_date").notNull(),
    startTime: time("start_time"),
    endTime: time("end_time"),
    guestCount: integer("guest_count"),
    status: text("status", {
      enum: ["processing", "confirmed", "completed", "cancelled"],
    })
      .notNull()
      .default("processing"),
    receiptUrl: text("receipt_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).default(
      sql`now()`
    ),
    updatedAt: timestamp("updated_at", { withTimezone: true }).default(
      sql`now()`
    ),
  },
  (table) => [
    index("idx_bookings_customer").on(table.customerId),
    index("idx_bookings_venue").on(table.venueId),
  ]
);

// ─── wishlists ────────────────────────────────────────────────────────────────
export const wishlists = pgTable(
  "wishlists",
  {
    customerId: uuid("customer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).default(
      sql`now()`
    ),
  },
  (table) => [primaryKey({ columns: [table.customerId, table.venueId] })]
);

// ─── notifications ────────────────────────────────────────────────────────────
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    read: boolean("read").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).default(
      sql`now()`
    ),
  },
  (table) => [index("idx_notifications_user").on(table.userId, table.read)]
);

// ─── Relations ────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  venues: many(venues),
  reviews: many(reviews),
  inquiriesAsCustomer: many(inquiries, { relationName: "customerInquiries" }),
  inquiriesAsOwner: many(inquiries, { relationName: "ownerInquiries" }),
  bookings: many(bookings),
  wishlists: many(wishlists),
  notifications: many(notifications),
}));

export const venuesRelations = relations(venues, ({ one, many }) => ({
  owner: one(users, { fields: [venues.ownerId], references: [users.id] }),
  images: many(venueImages),
  amenities: many(venueAmenities),
  reviews: many(reviews),
  inquiries: many(inquiries),
  bookings: many(bookings),
  wishlists: many(wishlists),
}));

export const venueImagesRelations = relations(venueImages, ({ one }) => ({
  venue: one(venues, { fields: [venueImages.venueId], references: [venues.id] }),
}));

export const venueAmenitiesRelations = relations(venueAmenities, ({ one }) => ({
  venue: one(venues, { fields: [venueAmenities.venueId], references: [venues.id] }),
  amenity: one(amenities, {
    fields: [venueAmenities.amenityId],
    references: [amenities.id],
  }),
}));

export const amenitiesRelations = relations(amenities, ({ many }) => ({
  venueAmenities: many(venueAmenities),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  venue: one(venues, { fields: [reviews.venueId], references: [venues.id] }),
  customer: one(users, { fields: [reviews.customerId], references: [users.id] }),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  venue: one(venues, { fields: [inquiries.venueId], references: [venues.id] }),
  customer: one(users, {
    fields: [inquiries.customerId],
    references: [users.id],
    relationName: "customerInquiries",
  }),
  owner: one(users, {
    fields: [inquiries.ownerId],
    references: [users.id],
    relationName: "ownerInquiries",
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  venue: one(venues, { fields: [bookings.venueId], references: [venues.id] }),
  customer: one(users, {
    fields: [bookings.customerId],
    references: [users.id],
  }),
  inquiry: one(inquiries, {
    fields: [bookings.inquiryId],
    references: [inquiries.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  customer: one(users, {
    fields: [wishlists.customerId],
    references: [users.id],
  }),
  venue: one(venues, { fields: [wishlists.venueId], references: [venues.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// ─── push_subscriptions ───────────────────────────────────────────────────────
export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  },
  (t) => ({
    endpointUnique: uniqueIndex("push_subscriptions_endpoint_unique").on(t.endpoint),
    userIdx: index("push_subscriptions_user_idx").on(t.userId),
  })
);

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, { fields: [pushSubscriptions.userId], references: [users.id] }),
}));

