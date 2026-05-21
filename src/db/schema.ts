import { pgTable, text, timestamp, varchar, boolean, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, approved, rejected
  approvedAt: timestamp("approved_at"),
  role: varchar("role", { length: 20 }).default("user").notNull(), // user, admin
});

export const apiKeys = pgTable("api_keys", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  awsKeyId: varchar("aws_key_id", { length: 255 }).notNull(),
  keyName: varchar("key_name", { length: 255 }).notNull(),
  keyValue: varchar("key_value", { length: 512 }), // stored once at creation, then masked
  isActive: boolean("is_active").default(true).notNull(),
  usagePlanId: varchar("usage_plan_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
});

export const accessRequests = pgTable("access_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  useCase: varchar("use_case", { length: 500 }).notNull(),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  adminNotes: varchar("admin_notes", { length: 1000 }),
});

// NEW: API Key Usage Tracking Table
export const apiKeyUsage = pgTable("api_key_usage", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  apiKeyId: text("api_key_id")
    .notNull()
    .references(() => apiKeys.id, { onDelete: "cascade" }),
  usageCount: integer("usage_count").default(0).notNull(),
  lastFetchedAt: timestamp("last_fetched_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
export type AccessRequest = typeof accessRequests.$inferSelect;
export type NewAccessRequest = typeof accessRequests.$inferInsert;
export type ApiKeyUsage = typeof apiKeyUsage.$inferSelect;
export type NewApiKeyUsage = typeof apiKeyUsage.$inferInsert;
