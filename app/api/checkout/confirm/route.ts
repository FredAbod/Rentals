import { NextResponse } from "next/server";
import { z } from "zod";
import { createBookingWithTransaction } from "@/lib/services/bookingService";

const bookingItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  startDate: z.string().datetime().or(z.string().date()),
  endDate: z.string().datetime().or(z.string().date())
});

const bookingRequestSchema = z.object({
  customer: z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional()
  }),
  items: z.array(bookingItemSchema).min(1),
  delivery: z.object({
    postcode: z.string().min(2),
    deliveryWindow: z.string().optional(),
    distanceKm: z.number().nonnegative().optional()
  }),
  pricing: z.object({
    subtotalMinor: z.number().int().nonnegative(),
    vatAmountMinor: z.number().int().nonnegative(),
    totalMinor: z.number().int().nonnegative(),
    deliveryFeeMinor: z.number().int().nonnegative(),
    congestionChargeApplied: z.boolean(),
    damageWaiverSelected: z.boolean(),
    damageWaiverAmountMinor: z.number().int().nonnegative(),
    securityDepositAmountMinor: z.number().int().nonnegative(),
    currency: z.string().min(3)
  }),
  stripe: z.object({
    stripeCustomerId: z.string(),
    stripePaymentIntentId: z.string(),
    paymentMethodId: z.string()
  })
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bookingRequestSchema.parse(json);

    const order = await createBookingWithTransaction(parsed);

    return NextResponse.json({ orderId: order._id, status: order.status });
  } catch (error) {
    console.error("[checkout.confirm] error", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request payload", issues: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to confirm booking" }, { status: 500 });
  }
}

