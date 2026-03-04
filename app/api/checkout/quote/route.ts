import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateQuote } from "@/lib/pricing/calculateQuote";

const quoteItemSchema = z.object({
  productId: z.string(),
  baseDailyRateMinor: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  startDate: z.string().datetime().or(z.string().date()),
  endDate: z.string().datetime().or(z.string().date())
});

const quoteRequestSchema = z.object({
  items: z.array(quoteItemSchema).min(1),
  delivery: z.object({
    postcode: z.string().min(2),
    baseDeliveryFeeMinor: z.number().int().nonnegative().optional()
  }),
  damageWaiverSelected: z.boolean().optional()
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { items, delivery, damageWaiverSelected } = quoteRequestSchema.parse(json);

    const quote = calculateQuote(items, delivery, {
      damageWaiverSelected,
      currency: "gbp"
    });

    return NextResponse.json(quote);
  } catch (error) {
    console.error("[checkout.quote] error", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request payload", issues: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to calculate quote" }, { status: 500 });
  }
}

