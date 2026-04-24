import { pgTable, text, decimal, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const configRatesTable = pgTable("config_rates", {
  id: serial("id").primaryKey(),
  vehicleType: text("vehicle_type").notNull(), // 'light', 'heavy', etc.
  baseFee: integer("base_fee").notNull(),
  pricePerKm: integer("price_per_km").notNull(),
  ivaRate: integer("iva_rate").default(10).notNull(), // Percent (e.g., 10 for 10%)
  currency: text("currency").default("PYG").notNull(), // Default to Paraguay (Guaraníes) as hinted in previous conversations
});

export const insertConfigRateSchema = createInsertSchema(configRatesTable).omit({ id: true });
export type InsertConfigRate = z.infer<typeof insertConfigRateSchema>;
export type ConfigRate = typeof configRatesTable.$inferSelect;
