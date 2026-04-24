import { db, configRatesTable } from "../lib/db/src";

async function seed() {
  console.log("Seeding default rates...");

  const defaultRates = [
    {
      vehicleType: "light",
      baseFee: 150000,
      pricePerKm: 12000,
      ivaRate: 10,
      currency: "PYG",
    },
    {
      vehicleType: "heavy",
      baseFee: 350000,
      pricePerKm: 25000,
      ivaRate: 10,
      currency: "PYG",
    },
    {
      vehicleType: "flatbed",
      baseFee: 200000,
      pricePerKm: 15000,
      ivaRate: 10,
      currency: "PYG",
    },
  ];

  for (const rate of defaultRates) {
    await db.insert(configRatesTable).values(rate).onConflictDoUpdate({
      target: configRatesTable.vehicleType,
      set: {
        baseFee: rate.baseFee,
        pricePerKm: rate.pricePerKm,
        ivaRate: rate.ivaRate,
      },
    });
  }

  console.log("Successfully seeded 3 default rates.");
}

seed().catch(console.error);
