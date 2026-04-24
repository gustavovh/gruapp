import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { servicesTable } from "./services";

export const serviceSignaturesTable = pgTable("service_signatures", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => servicesTable.id).notNull(),
  signaturePath: text("signature_path").notNull(), // URL to image in storage
  signerName: text("signer_name"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertServiceSignatureSchema = createInsertSchema(serviceSignaturesTable).omit({ id: true, timestamp: true });
export type InsertServiceSignature = z.infer<typeof insertServiceSignatureSchema>;
export type ServiceSignature = typeof serviceSignaturesTable.$inferSelect;
