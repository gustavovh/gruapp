import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { db, servicesTable, configRatesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { calculatePrice } from "./services/pricing";
import { sendPushNotification } from "./services/notifications";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.get("/", (c) => {
  return c.json({
    message: "GruaDirect API is running",
    version: "0.1.0",
  });
});

// Get all drivers
app.get("/api/drivers", async (c) => {
  try {
    const drivers = await db.select().from(usersTable).where(eq(usersTable.role, "driver"));
    return c.json(drivers);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Get all services
app.get("/api/services", async (c) => {
  try {
    const services = await db.select().from(servicesTable);
    return c.json(services);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Estimate price before creating service
app.post("/api/pricing/estimate", async (c) => {
  try {
    const input = await c.req.json();
    const result = await calculatePrice(input);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

// Create a new service
app.post("/api/services", async (c) => {
  try {
    const body = await c.req.json();
    
    // Auto-calculate price if distance and vehicleType are provided
    if (body.vehicleType && body.totalDistance) {
      const pricing = await calculatePrice({
        vehicleType: body.vehicleType,
        distanceKm: body.totalDistance,
        maneuverExtras: body.maneuverExtras,
      });
      
      body.baseFee = pricing.baseFee;
      body.pricePerKm = pricing.pricePerKm;
      body.netAmount = pricing.netAmount;
      body.ivaAmount = pricing.ivaAmount;
      body.totalAmount = pricing.totalAmount;
    }

    const [newService] = await db.insert(servicesTable).values(body).returning();

    // Send push notification to assigned driver
    if (body.driverId) {
      const [driver] = await db.select().from(usersTable).where(eq(usersTable.id, body.driverId)).limit(1);
      if (driver && driver.pushToken) {
        await sendPushNotification(
          driver.pushToken,
          "New Service Assigned",
          `Towing for ${body.customerName} - From ${body.originAddress}`,
          { serviceId: newService.id }
        );
      }
    }

    return c.json(newService, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update service status
app.patch("/api/services/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const [updated] = await db
      .update(servicesTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(servicesTable.id, id))
      .returning();
    
    if (!updated) return c.json({ error: "Service not found" }, 404);
    return c.json(updated);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

const port = Number(process.env.PORT) || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0'
});
