import { pgTable, text, serial, timestamp, integer, doublePrecision, pgEnum, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";

export const serviceStatusEnum = pgEnum("service_status", [
  "pending",
  "assigned",
  "arriving",
  "loaded",
  "completed",
  "canceled",
]);

export const servicesTable = pgTable("services", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  originAddress: text("origin_address").notNull(),
  destinationAddress: text("destination_address").notNull(),
  originLat: doublePrecision("origin_lat").notNull(),
  originLng: doublePrecision("origin_lng").notNull(),
  destLat: doublePrecision("dest_lat").notNull(),
  destLng: doublePrecision("dest_lng").notNull(),
  status: serviceStatusEnum("status").default("pending").notNull(),
  baseFee: integer("base_fee").default(0).notNull(),
  pricePerKm: integer("price_per_km").default(0).notNull(),
  totalDistance: doublePrecision("total_distance"),
  maneuverExtras: integer("maneuver_extras").default(0).notNull(),
  netAmount: integer("net_amount").default(0).notNull(),
  ivaAmount: integer("iva_amount").default(0).notNull(),
  totalAmount: integer("total_amount").default(0).notNull(),
  isPaid: integer("is_paid").default(0), // 0: no, 1: yes
  driverId: integer("driver_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertServiceSchema = createInsertSchema(servicesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof servicesTable.$inferSelect;
