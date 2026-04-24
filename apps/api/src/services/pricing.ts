import { db, configRatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface PricingInput {
  vehicleType: string;
  distanceKm: number;
  maneuverExtras?: number;
}

export interface PricingResult {
  baseFee: number;
  pricePerKm: number;
  distanceKm: number;
  maneuverExtras: number;
  netAmount: number;
  ivaAmount: number;
  totalAmount: number;
  currency: string;
}

export async function calculatePrice(input: PricingInput): Promise<PricingResult> {
  // 1. Fetch rates for the vehicle type
  const [rates] = await db
    .select()
    .from(configRatesTable)
    .where(eq(configRatesTable.vehicleType, input.vehicleType))
    .limit(1);

  if (!rates) {
    throw new Error(`Rates not found for vehicle type: ${input.vehicleType}`);
  }

  const baseFee = rates.baseFee;
  const pricePerKm = rates.pricePerKm;
  const distanceKm = input.distanceKm;
  const maneuverExtras = input.maneuverExtras || 0;

  // 2. Calculate Subtotal (Net)
  // Formula: Base + (KM * Rate) + Extras
  const travelCost = Math.round(distanceKm * pricePerKm);
  const netAmount = baseFee + travelCost + maneuverExtras;

  // 3. Calculate IVA (10%)
  // For PYG, usually price is IVA included, but user mentioned "consider IVA (10%) for electronic billing"
  // Usually: Total = Net + IVA
  // If the total should be the final rounded number:
  const ivaRate = rates.ivaRate / 100;
  const ivaAmount = Math.round(netAmount * ivaRate);
  const totalAmount = netAmount + ivaAmount;

  return {
    baseFee,
    pricePerKm,
    distanceKm,
    maneuverExtras,
    netAmount,
    ivaAmount,
    totalAmount,
    currency: rates.currency,
  };
}
