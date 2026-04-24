import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { db, servicesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { calculatePrice } from "./services/pricing";
import { sendPushNotification } from "./services/notifications";
import { autoAssignDriver } from "./services/dispatch";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.get("/", (c) => {
  return c.json({
    message: "GruaDirect API is running",
    version: "0.1.1",
  });
});

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Get all drivers
app.get("/api/drivers", async (c) => {
  try {
    const drivers = await db.select().from(usersTable).where(eq(usersTable.role, "driver"));
    return c.json(drivers);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get all services
app.get("/api/services", async (c) => {
  try {
    const services = await db.select().from(servicesTable);
    return c.json(services);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Estimate price
app.post("/api/pricing/estimate", async (c) => {
  try {
    const input = await c.req.json();
    const result = await calculatePrice(input);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

// Create a new service (with Auto-Assignment)
app.post("/api/services", async (c) => {
  try {
    const body = await c.req.json();
    
    // Auto-calculate price
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

    // Force 'searching' status for automatic flow
    body.status = 'searching';

    const [newService] = await db.insert(servicesTable).values(body).returning();

    // TRIGGER AUTO-ASSIGNMENT BRAIN
    const assignedDriver = await autoAssignDriver(newService.id, body.originLat, body.originLng);

    if (assignedDriver && assignedDriver.pushToken) {
      await sendPushNotification(
        assignedDriver.pushToken,
        "¡Nuevo Servicio Cerca!",
        `Solicitud de grúa en ${body.originAddress}. Distancia mínima.`,
        { serviceId: newService.id, type: 'OFFER' }
      );
    }

    return c.json({ 
      ...newService, 
      assignedDriver: assignedDriver ? { id: assignedDriver.id, name: assignedDriver.fullName } : null 
    }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update status
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
serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0'
});
