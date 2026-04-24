import { pgTable, text, serial, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";

export const vehicleStatusEnum = pgEnum("vehicle_status", ["active", "maintenance", "inactive"]);
export const vehicleTypeEnum = pgEnum("vehicle_type", ["light", "heavy", "flatbed"]);

export const vehiclesTable = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  plateNumber: text("plate_number").unique().notNull(),
  model: text("model").notNull(),
  type: vehicleTypeEnum("type").default("light").notNull(),
  status: vehicleStatusEnum("status").default("active").notNull(),
  driverId: integer("driver_id").references(() => usersTable.id),
});

export const insertVehicleSchema = createInsertSchema(vehiclesTable).omit({ id: true });
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehiclesTable.$inferSelect;
