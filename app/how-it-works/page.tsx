export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-12">
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        How CS Signature Celebrations works
      </h1>
      <p className="mt-3 text-sm text-white/70">
        A simple, transparent flow from browsing to delivery.
      </p>
      <ol className="mt-8 space-y-6 text-sm text-white/75">
        <li>
          <span className="font-semibold text-accent">1. Browse online.</span>{" "}
          Explore our collections and pick the items you need for your event.
        </li>
        <li>
          <span className="font-semibold text-accent">2. Add dates & postcode.</span>{" "}
          Enter your event dates and London postcode for an instant, VAT-inclusive quote.
        </li>
        <li>
          <span className="font-semibold text-accent">3. Pay securely.</span>{" "}
          Confirm your booking with card payment. A separate refundable security deposit
          is authorised closer to your event date.
        </li>
        <li>
          <span className="font-semibold text-accent">4. We deliver & collect.</span>{" "}
          Our team delivers across Greater London and collects after your event.
        </li>
      </ol>
    </div>
  );
}

