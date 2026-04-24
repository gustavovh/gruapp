import { db, usersTable, locationsTable, servicesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export async function autoAssignDriver(serviceId: number, originLat: number, originLng: number) {
  try {
    // 1. Get all drivers
    const drivers = await db.select().from(usersTable).where(eq(usersTable.role, "driver"));
    
    if (drivers.length === 0) return null;

    const driverDistances = await Promise.all(drivers.map(async (driver) => {
      // 2. Get latest location for this driver
      const [latestLocation] = await db
        .select()
        .from(locationsTable)
        .where(eq(locationsTable.driverId, driver.id))
        .orderBy(desc(locationsTable.timestamp))
        .limit(1);

      if (!latestLocation) return { driver, distance: Infinity };

      const distance = calculateDistance(
        originLat, 
        originLng, 
        latestLocation.lat, 
        latestLocation.lng
      );

      return { driver, distance };
    }));

    // 3. Find nearest driver
    const sortedDrivers = driverDistances
      .filter(d => d.distance !== Infinity)
      .sort((a, b) => a.distance - b.distance);

    if (sortedDrivers.length === 0) return null;

    const nearest = sortedDrivers[0].driver;

    // 4. Assign to service
    await db.update(servicesTable)
      .set({ 
        driverId: nearest.id,
        status: 'pending' // For now, we'll auto-assign. For acceptance logic, we'd use 'offered'
      })
      .where(eq(servicesTable.id, serviceId));

    return nearest;
  } catch (error) {
    console.error("Error in auto-assignment:", error);
    return null;
  }
}
