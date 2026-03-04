import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe/stripe";

// Note: In a production app, more fields might be validated here.
const createSessionSchema = z.object({
  amountMinor: z.number().int().positive(),
  currency: z.string().min(3),
  customerEmail: z.string().email(),
  productName: z.string(),
  bookingData: z.any(), // We will pass booking data through session metadata to retrieve on success
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { amountMinor, currency, customerEmail, productName, bookingData } =
      createSessionSchema.parse(json);

    // Ensure we have an absolute URL for redirects
    const origin = request.headers.get("origin") || "http://localhost:3000";

    const bookingDataStr = JSON.stringify(bookingData);
    const metadata: Record<string, string> = {};
    const chunkSize = 500;

    for (let i = 0; i < bookingDataStr.length; i += chunkSize) {
      metadata[`chunk${i / chunkSize}`] = bookingDataStr.slice(
        i,
        i + chunkSize,
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: productName,
              description: "CS Signature Celebrations Rental",
            },
            unit_amount: amountMinor,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=true`,
      metadata: metadata,
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("[checkout.create-session] error", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request payload", issues: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create Stripe Checkout Session" },
      { status: 500 },
    );
  }
}
