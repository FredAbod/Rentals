import { getDistanceKmFromCentralLondon, isInCongestionZone } from "@/lib/postcode/postcodeUtils";

export interface QuoteItemInput {
  productId: string;
  baseDailyRateMinor: number;
  quantity: number;
  startDate: string; // ISO
  endDate: string; // ISO
}

export interface QuoteDeliveryInput {
  postcode: string;
  baseDeliveryFeeMinor?: number;
}

export interface QuoteResult {
  equipmentTotalMinor: number;
  damageWaiverAmountMinor: number;
  deliveryFeeMinor: number;
  congestionChargeMinor: number;
  vatAmountMinor: number;
  grandTotalMinor: number;
  currency: string;
  rentalDays: number;
  distanceKm: number;
  congestionChargeApplied: boolean;
}

const VAT_RATE = 0.2;
const DAMAGE_WAIVER_RATE = 0.12;
const CONGESTION_CHARGE_MINOR = 1800; // £18

function calculateRentalDays(start: Date, end: Date): number {
  const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const endUtc = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  const diffMs = endUtc - startUtc;
  const days = diffMs / (1000 * 60 * 60 * 24);
  return days + 1;
}

function toMinor(amount: number): number {
  return Math.round(amount);
}

export function calculateQuote(
  items: QuoteItemInput[],
  delivery: QuoteDeliveryInput,
  options?: { damageWaiverSelected?: boolean; currency?: string }
): QuoteResult {
  if (items.length === 0) {
    throw new Error("Cannot calculate quote with no items");
  }

  const damageWaiverSelected = options?.damageWaiverSelected ?? false;
  const currency = options?.currency ?? "gbp";

  // Derive the overall rental window from all lines.
  const startDates = items.map((item) => new Date(item.startDate));
  const endDates = items.map((item) => new Date(item.endDate));

  const globalStart = new Date(
    Math.min(...startDates.map((d) => d.getTime()))
  );
  const globalEnd = new Date(
    Math.max(...endDates.map((d) => d.getTime()))
  );

  const rentalDays = calculateRentalDays(globalStart, globalEnd);

  // Sum equipment totals across all items.
  let equipmentTotalMinor = 0;
  for (const item of items) {
    const daysForItem = calculateRentalDays(
      new Date(item.startDate),
      new Date(item.endDate)
    );
    const lineTotalMinor = item.baseDailyRateMinor * daysForItem * item.quantity;
    equipmentTotalMinor += lineTotalMinor;
  }

  const damageWaiverAmountMinor = damageWaiverSelected
    ? toMinor(equipmentTotalMinor * DAMAGE_WAIVER_RATE)
    : 0;

  const distance = getDistanceKmFromCentralLondon(delivery.postcode);
  const congestion = isInCongestionZone(delivery.postcode);

  // Base delivery fee can be customised; here we scale with distance.
  const baseDeliveryFeeMinor =
    delivery.baseDeliveryFeeMinor ??
    toMinor(1500 + Math.max(0, distance.distanceKm - 5) * 100);

  const congestionChargeMinor = congestion ? CONGESTION_CHARGE_MINOR : 0;

  const deliveryFeeMinor = baseDeliveryFeeMinor;

  const subtotalBeforeVatMinor =
    equipmentTotalMinor +
    damageWaiverAmountMinor +
    deliveryFeeMinor +
    congestionChargeMinor;

  const vatAmountMinor = toMinor(subtotalBeforeVatMinor * VAT_RATE);
  const grandTotalMinor = subtotalBeforeVatMinor + vatAmountMinor;

  return {
    equipmentTotalMinor,
    damageWaiverAmountMinor,
    deliveryFeeMinor,
    congestionChargeMinor,
    vatAmountMinor,
    grandTotalMinor,
    currency,
    rentalDays,
    distanceKm: distance.distanceKm,
    congestionChargeApplied: congestion
  };
}

