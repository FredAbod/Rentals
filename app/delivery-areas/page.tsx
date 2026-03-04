export default function DeliveryAreasPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-12">
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Delivery areas
      </h1>
      <p className="mt-3 text-sm text-white/70">
        We deliver across London, with pricing that reflects distance and any city
        surcharges.
      </p>
      <ul className="mt-8 space-y-3 text-sm text-white/75">
        <li>
          <span className="font-semibold text-accent">Central London.</span> Postcodes in
          EC, WC and W1 typically incur Congestion Charge, which is included in your
          quote.
        </li>
        <li>
          <span className="font-semibold text-accent">Inner London.</span> N, E, SE, SW,
          W and NW postcodes are covered as standard.
        </li>
        <li>
          <span className="font-semibold text-accent">Outer London / by request.</span>{" "}
          For edge postcodes we&apos;ll confirm availability and pricing after you submit
          your booking.
        </li>
      </ul>
    </div>
  );
}

