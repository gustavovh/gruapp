import { pgTable, serial, timestamp, integer, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";

export const locationsTable = pgTable("locations", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").references(() => usersTable.id).notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  heading: doublePrecision("heading"),
  speed: doublePrecision("speed"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertLocationSchema = createInsertSchema(locationsTable).omit({ id: true, timestamp: true });
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type DriverLocation = typeof locationsTable.$inferSelect;
