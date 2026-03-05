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
  const productNameUrl = searchParams.get("productName") ?? "Rental Equipment";

  // Checkout Flow State
  const [checkoutStep, setCheckoutStep] = useState<"form" | "quote">("form");

  // Product Data
  const [productName, setProductName] = useState(productNameUrl);
  const [baseDailyRateMinor, setBaseDailyRateMinor] = useState(0);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [postcode, setPostcode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [damageWaiverSelected, setDamageWaiverSelected] = useState(true);

  // Quote & Submission State
  const [quote, setQuote] = useState<QuoteState | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Real Product Price on Mount
  useEffect(() => {
    async function fetchProduct() {
      if (!productIdFromUrl) {
        setProductError(
          "Missing product ID. Please start from a product page.",
        );
        setIsLoadingProduct(false);
        return;
      }
      try {
        const res = await fetch(`/api/products/${productIdFromUrl}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setBaseDailyRateMinor(data.baseDailyRateMinor);
        setProductName(data.name);
      } catch (err) {
        console.error(err);
        setProductError("Failed to load product pricing.");
      } finally {
        setIsLoadingProduct(false);
      }
    }
    fetchProduct();
  }, [productIdFromUrl]);

  // 2. Handle Quote Calculation (Step 1 -> Step 2)
  async function handleCalculateQuote(e: React.FormEvent) {
    e.preventDefault();
    if (isLoadingProduct || productError) return;

    try {
      setIsSubmitting(true);
      setStatus("Calculating final quote...");

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
          delivery: { postcode },
          damageWaiverSelected,
        }),
      });

      if (!quoteRes.ok) {
        const error = await quoteRes.json().catch(() => ({}));
        throw new Error(error.error ?? "Failed to calculate quote");
      }

      const quoteJson: QuoteState = await quoteRes.json();
      setQuote(quoteJson);
      setStatus(null);
      setCheckoutStep("quote"); // Move to review step
    } catch (error) {
      console.error("[checkout.quote] error", error);
      setStatus((error as Error).message ?? "Failed to generate quote.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // 3. Handle Stripe Payment Redirect (Step 2 -> Stripe)
  async function handleProceedToPayment() {
    if (!quote) return;

    try {
      setIsSubmitting(true);
      setStatus("Creating secure session. Redirecting to Stripe...");

      const bookingData = {
        customer: { email, firstName, lastName },
        items: [
          {
            productId: productIdFromUrl,
            quantity,
            startDate,
            endDate,
            baseDailyRateMinor, // Important for backend verification if needed later
          },
        ],
        delivery: {
          postcode,
          deliveryWindow: "09:00-12:00",
          distanceKm: quote.distanceKm,
        },
        pricing: {
          subtotalMinor: quote.equipmentTotalMinor,
          vatAmountMinor: quote.vatAmountMinor,
          totalMinor: quote.grandTotalMinor,
          deliveryFeeMinor: quote.deliveryFeeMinor,
          congestionChargeApplied: quote.congestionChargeApplied,
          damageWaiverSelected,
          damageWaiverAmountMinor: quote.damageWaiverAmountMinor,
          securityDepositAmountMinor: Math.round(
            quote.equipmentTotalMinor * 0.5,
          ), // Fixed 50% deposit rule
          currency: "gbp",
        },
      };

      const sessionRes = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountMinor: quote.grandTotalMinor,
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
      window.location.href = sessionJson.checkoutUrl; // Redirect to Stripe
    } catch (error) {
      console.error("[checkout.stripe] error", error);
      setStatus((error as Error).message ?? "Something went wrong.");
      setIsSubmitting(false);
    }
  }

  // Loading / Error States
  if (isLoadingProduct) {
    return (
      <div className="mx-auto max-w-4xl px-6 pb-16 pt-10 text-white/50">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          Loading product pricing...
        </div>
      </div>
    );
  }

  if (productError) {
    return (
      <div className="mx-auto max-w-4xl px-6 pb-16 pt-10">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {productError}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Complete Booking
        </h1>
        <p className="mt-2 text-sm text-white/70">
          {productName} — £{(baseDailyRateMinor / 100).toFixed(2)} / day
        </p>
      </div>

      <div className="glass-surface p-6 sm:p-8">
        {/* Step 1: Form Input */}
        {checkoutStep === "form" && (
          <form onSubmit={handleCalculateQuote} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-[0.7rem] uppercase tracking-[0.22em] text-accent">
                  First name
                </span>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none ring-accent/40 transition placeholder:text-white/20 focus:ring-1"
                  placeholder="Jane"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-[0.7rem] uppercase tracking-[0.22em] text-accent">
                  Last name
                </span>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none ring-accent/40 transition placeholder:text-white/20 focus:ring-1"
                  placeholder="Doe"
                />
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-[0.7rem] uppercase tracking-[0.22em] text-accent">
                Email address
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none ring-accent/40 transition placeholder:text-white/20 focus:ring-1"
                placeholder="jane@example.com"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-1.5">
                <span className="text-[0.7rem] uppercase tracking-[0.22em] text-accent">
                  Start date
                </span>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none ring-accent/40 transition focus:ring-1"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-[0.7rem] uppercase tracking-[0.22em] text-accent">
                  End date
                </span>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none ring-accent/40 transition focus:ring-1"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-[0.7rem] uppercase tracking-[0.22em] text-accent">
                  Quantity
                </span>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                  className="w-full rounded-md border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none ring-accent/40 transition focus:ring-1"
                />
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-[0.7rem] uppercase tracking-[0.22em] text-accent">
                Delivery Postcode
              </span>
              <input
                type="text"
                required
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white uppercase outline-none ring-accent/40 transition placeholder:text-white/20 placeholder:normal-case focus:ring-1"
                placeholder="e.g. EC2A 3XY"
              />
            </label>

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={damageWaiverSelected}
                onChange={(e) => setDamageWaiverSelected(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/30 bg-black text-accent focus:ring-accent"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">
                  Add Damage Waiver
                </span>
                <span className="text-[0.7rem] text-white/50">
                  Optional protection against accidental breaks (12% of
                  equipment rental total).
                </span>
              </div>
            </label>

            {status && (
              <div className="rounded-md border border-accent/20 bg-accent/10 p-3 text-sm text-accent">
                {status}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-8 flex w-full items-center justify-center rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-black shadow-[0_0_30px_rgba(198,166,103,0.4)] transition-all hover:bg-accentMuted disabled:cursor-not-allowed disabled:bg-accent/60"
            >
              {isSubmitting ? "Calculating..." : "Review Quote"}
            </button>
          </form>
        )}

        {/* Step 2: Quote Review */}
        {checkoutStep === "quote" && quote && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-widest text-accent">
              Final Quote Summary
            </h3>

            <dl className="space-y-4 text-sm text-white/80">
              <div className="flex justify-between">
                <dt>
                  Equipment Rental{" "}
                  <span className="text-white/40">
                    ({quantity}x for {quote.rentalDays} days)
                  </span>
                </dt>
                <dd className="font-medium">
                  {formatMoney(quote.equipmentTotalMinor)}
                </dd>
              </div>

              {damageWaiverSelected && (
                <div className="flex justify-between">
                  <dt>Damage Waiver (12%)</dt>
                  <dd className="font-medium">
                    {formatMoney(quote.damageWaiverAmountMinor)}
                  </dd>
                </div>
              )}

              <div className="flex justify-between">
                <dt>
                  Delivery & Collection{" "}
                  <span className="text-white/40">
                    (Approx. {quote.distanceKm}km)
                  </span>
                </dt>
                <dd className="font-medium">
                  {formatMoney(quote.deliveryFeeMinor)}
                </dd>
              </div>

              {quote.congestionChargeApplied && (
                <div className="flex justify-between text-yellow-500/90">
                  <dt>London Congestion Charge</dt>
                  <dd className="font-medium">
                    {formatMoney(quote.congestionChargeMinor)}
                  </dd>
                </div>
              )}

              <div className="flex justify-between border-t border-white/10 pt-4 text-white/60">
                <dt>VAT (20%)</dt>
                <dd>{formatMoney(quote.vatAmountMinor)}</dd>
              </div>

              <div className="flex justify-between border-t border-white/10 pt-4 text-lg font-bold text-white">
                <dt>Grand Total To Pay Now</dt>
                <dd>{formatMoney(quote.grandTotalMinor)}</dd>
              </div>

              <div className="flex justify-between rounded-md bg-white/5 p-3 text-[0.7rem] text-white/60 mt-4">
                <dt>Refundable Security Deposit</dt>
                <dd>Authorised later near event date</dd>
              </div>
            </dl>

            {status && (
              <div className="mt-6 rounded-md border border-accent/20 bg-accent/10 p-3 text-sm text-accent">
                {status}
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setCheckoutStep("form");
                  setStatus(null);
                }}
                disabled={isSubmitting}
                className="flex-1 rounded-full border border-white/20 px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={isSubmitting}
                className="flex-[2] flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-black shadow-[0_0_30px_rgba(198,166,103,0.4)] transition-all hover:bg-accentMuted disabled:cursor-not-allowed disabled:bg-accent/60"
              >
                {isSubmitting ? (
                  "Redirecting to Stripe..."
                ) : (
                  <>
                    Proceed to Payment
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>

            <p className="mt-4 text-center text-[0.65rem] text-white/40">
              You will be securely redirected to Stripe to complete your
              booking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
