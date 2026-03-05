"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface QuoteState {
  equipmentTotalMinor: number;
  deliveryFeeMinor: number;
  congestionChargeMinor: number;
  damageWaiverAmountMinor: number;
  vatAmountMinor: number;
  grandTotalMinor: number;
  rentalDays: number;
  distanceKm: number;
  congestionChargeApplied: boolean;
}

function formatMoney(minor: number) {
  return `£${(minor / 100).toFixed(2)}`;
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-6 pb-16 pt-10 text-white/50">
          Loading checkout…
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}

function CheckoutInner() {
  const searchParams = useSearchParams();
  const productIdFromUrl = searchParams.get("productId") ?? "";
  const productName = searchParams.get("productName") ?? "Rental Equipment"; // We'll pass the exact name later if needed

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [postcode, setPostcode] = useState("EC2A 3XY");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [baseDailyRateMinor] = useState(4500); // For demo purposes, we fetch the real price in a full app
  const [damageWaiverSelected, setDamageWaiverSelected] = useState(true);

  const [quote, setQuote] = useState<QuoteState | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setStatus(null);
  }, [productIdFromUrl]);

  async function handleCheckoutRedirect(e: React.FormEvent) {
    e.preventDefault();
    if (!productIdFromUrl) {
      setStatus(
        "Missing productId in URL. Please start checkout from a product page.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus("Calculating quote and redirecting to Stripe...");

      // 1. Get the Quote
      const quoteRes = await fetch("/api/checkout/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              productId: productIdFromUrl,
              baseDailyRateMinor,
              quantity,
              startDate,
              endDate,
            },
          ],
          delivery: {
            postcode,
          },
          damageWaiverSelected,
        }),
      });

      if (!quoteRes.ok) {
        const error = await quoteRes.json().catch(() => ({}));
        throw new Error(error.error ?? "Failed to calculate quote");
      }

      const quoteJson: QuoteState = await quoteRes.json();
      setQuote(quoteJson);

      // 2. Build the Booking Data payload that the /success page will need
      const bookingData = {
        customer: { email, firstName, lastName },
        items: [
          {
            productId: productIdFromUrl,
            quantity,
            startDate,
            endDate,
          },
        ],
        delivery: {
          postcode,
          deliveryWindow: "09:00-12:00",
          distanceKm: quoteJson.distanceKm,
        },
        pricing: {
          subtotalMinor: quoteJson.equipmentTotalMinor,
          vatAmountMinor: quoteJson.vatAmountMinor,
          totalMinor: quoteJson.grandTotalMinor,
          deliveryFeeMinor: quoteJson.deliveryFeeMinor,
          congestionChargeApplied: quoteJson.congestionChargeApplied,
          damageWaiverSelected,
          damageWaiverAmountMinor: quoteJson.damageWaiverAmountMinor,
          securityDepositAmountMinor: Math.round(
            quoteJson.equipmentTotalMinor * 0.5,
          ),
          currency: "gbp",
        },
      };

      // 3. Create Stripe Session
      const sessionRes = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountMinor: quoteJson.grandTotalMinor,
          currency: "gbp",
          customerEmail: email,
          productName: productName,
          bookingData: bookingData,
        }),
      });

      if (!sessionRes.ok) {
        const error = await sessionRes.json().catch(() => ({}));
        throw new Error(
          error.error ?? "Failed to create Stripe Checkout Session",
        );
      }

      const sessionJson = await sessionRes.json();

      // 4. Redirect to Hosted Stripe Checkout!
      window.location.href = sessionJson.checkoutUrl;
    } catch (error) {
      console.error("[checkout.form] error", error);
      setStatus(
        (error as Error).message ?? "Something went wrong during checkout.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 pb-16 pt-10">
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Checkout
      </h1>
      <p className="mt-3 text-sm text-white/70">
        Review your event details below. You will be redirected securely to
        Stripe to complete your payment.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className="glass-surface p-5 text-xs text-white/80">
          <form onSubmit={handleCheckoutRedirect} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-[0.7rem] uppercase tracking-[0.22em] text-accent">
                  First name
                </span>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none ring-accent/40 focus:ring-1"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[0.7rem] uppercase tracking-[0.22em] text-accent">
                  Last name
                </span>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none ring-accent/40 focus:ring-1"
                />
              </label>
            </div>

            <label className="space-y-1 block">
              <span className="text-[0.7rem] uppercase tracking-[0.22em] text-accent">
                Email for confirmation
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none ring-accent/40 focus:ring-1"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1">
                <span className="text-[0.7rem] uppercase tracking-[0.22em] text-accent">
                  Start date
                </span>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none ring-accent/40 focus:ring-1"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[0.7rem] uppercase tracking-[0.22em] text-accent">
                  End date
                </span>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none ring-accent/40 focus:ring-1"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[0.7rem] uppercase tracking-[0.22em] text-accent">
                  Quantity
                </span>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                  className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none ring-accent/40 focus:ring-1"
                />
              </label>
            </div>

            <label className="space-y-1 block">
              <span className="text-[0.7rem] uppercase tracking-[0.22em] text-accent">
                London postcode
              </span>
              <input
                type="text"
                required
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none ring-accent/40 focus:ring-1"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-[0.7rem] text-white/70">
              <input
                type="checkbox"
                checked={damageWaiverSelected}
                onChange={(e) => setDamageWaiverSelected(e.target.checked)}
                className="h-3 w-3 rounded border border-white/40 bg-black/60 cursor-pointer"
              />
              Optional damage waiver (12% of equipment total)
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-accent px-4 py-3 text-sm font-semibold text-black shadow-[0_0_30px_rgba(198,166,103,0.6)] hover:bg-accentMuted disabled:cursor-not-allowed disabled:bg-accent/60 transition-colors"
            >
              {isSubmitting
                ? "Generating Session..."
                : "Pay Securely with Stripe"}
            </button>

            {status && (
              <div className="mt-4 rounded-md border border-white/15 bg-black/60 px-3 py-2 text-[0.7rem] text-white/80">
                {status}
              </div>
            )}
          </form>
        </section>

        <aside className="glass-surface p-5 text-xs text-white/70">
          <p className="font-semibold uppercase tracking-[0.22em] text-accent">
            Live quote engine
          </p>
          <p className="mt-2">
            Pricing is calculated using rental duration, London delivery
            distance, optional damage waiver and VAT. Congestion Charge is added
            automatically for central postcodes.
          </p>
          {quote && (
            <dl className="mt-6 space-y-2">
              <div className="flex justify-between">
                <dt>Equipment</dt>
                <dd>{formatMoney(quote.equipmentTotalMinor)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Damage waiver</dt>
                <dd>{formatMoney(quote.damageWaiverAmountMinor)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd>{formatMoney(quote.deliveryFeeMinor)}</dd>
              </div>
              {quote.congestionChargeApplied && (
                <div className="flex justify-between">
                  <dt>Congestion Charge</dt>
                  <dd>{formatMoney(quote.congestionChargeMinor)}</dd>
                </div>
              )}
              <div className="flex justify-between text-white/50 border-t border-white/10 pt-2 mt-2">
                <dt>VAT (20%)</dt>
                <dd>{formatMoney(quote.vatAmountMinor)}</dd>
              </div>
              <div className="mt-2 flex justify-between text-base font-bold text-white border-t border-white/10 pt-3">
                <dt>Total</dt>
                <dd>{formatMoney(quote.grandTotalMinor)}</dd>
              </div>
              <p className="mt-2 text-[0.7rem] text-white/40 pt-2 text-center">
                {quote.rentalDays} rental day(s), approx. {quote.distanceKm}km
                from central London.
              </p>
            </dl>
          )}
        </aside>
      </div>
    </div>
  );
}
