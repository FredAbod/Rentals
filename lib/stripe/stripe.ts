import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set");
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16"
});

export interface CreateCheckoutIntentsArgs {
  amountMinor: number;
  currency: string;
  customerEmail: string;
}

/**
 * createCheckoutIntents creates both:
 * - A PaymentIntent for the rental total (captured at checkout).
 * - A SetupIntent so we can later create a security-deposit PaymentIntent
 *   (e.g. 7 days before the event) using the saved payment method.
 */
export async function createCheckoutIntents({
  amountMinor,
  currency,
  customerEmail
}: CreateCheckoutIntentsArgs) {
  let customer = (
    await stripe.customers.list({
      email: customerEmail,
      limit: 1
    })
  ).data[0];

  if (!customer) {
    customer = await stripe.customers.create({
      email: customerEmail
    });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountMinor,
    currency,
    customer: customer.id,
    capture_method: "automatic"
  });

  const setupIntent = await stripe.setupIntents.create({
    customer: customer.id,
    payment_method_types: ["card"]
  });

  return {
    stripeCustomerId: customer.id,
    paymentIntentClientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    setupIntentClientSecret: setupIntent.client_secret,
    setupIntentId: setupIntent.id
  };
}

