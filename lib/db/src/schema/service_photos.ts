import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { servicesTable } from "./services";

export const photoTypeEnum = pgEnum("photo_type", ["before_loading", "after_delivery", "general"]);

export const servicePhotosTable = pgTable("service_photos", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => servicesTable.id).notNull(),
  photoUrl: text("photo_url").notNull(),
  type: photoTypeEnum("type").default("general").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertServicePhotoSchema = createInsertSchema(servicePhotosTable).omit({ id: true, timestamp: true });
export type InsertServicePhoto = z.infer<typeof insertServicePhotoSchema>;
export type ServicePhoto = typeof servicePhotosTable.$inferSelect;
