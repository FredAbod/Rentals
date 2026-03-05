import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/stripe";
import { getMongooseConnection } from "@/lib/db/mongoose";
import {
  createBookingWithTransaction,
  BookingStripeInput,
} from "@/lib/services/bookingService";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return new NextResponse("Webhook Secret is missing", { status: 500 });
  }

  // Ensure DB connection is warm before processing
  await getMongooseConnection();

  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as any;

      if (session.payment_status === "paid") {
        let bookingDataStr = "";
        let chunkIndex = 0;

        while (session.metadata && session.metadata[`chunk${chunkIndex}`]) {
          bookingDataStr += session.metadata[`chunk${chunkIndex}`];
          chunkIndex++;
        }

        if (bookingDataStr) {
          try {
            const bookingData = JSON.parse(bookingDataStr);

            const stripeData: BookingStripeInput = {
              stripeCustomerId: session.customer || "unknown",
              stripePaymentIntentId: session.payment_intent || "unknown",
              paymentMethodId: "checkout_session",
            };

            const fullOrderPayload = {
              ...bookingData,
              stripe: stripeData,
            };

            // Complete the database transaction securely!
            const order = await createBookingWithTransaction(fullOrderPayload);
            console.log(
              `[Webhook] Successfully booked Order ${(order as any)._id}`,
            );
          } catch (e) {
            console.error(
              "[Webhook] Failed to execute DB booking transaction:",
              e,
            );
            return new NextResponse(
              "Failed to execute DB booking transaction",
              { status: 500 },
            );
          }
        }
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new NextResponse("OK", { status: 200 });
}
