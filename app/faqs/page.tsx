const faqs = [
  {
    q: "Do you include VAT?",
    a: "Yes. All quotes shown in checkout include UK VAT at the standard rate."
  },
  {
    q: "How far in advance should I book?",
    a: "For peak weekends we recommend booking at least 4–6 weeks ahead. Last-minute bookings are possible subject to availability."
  },
  {
    q: "Do you deliver and collect?",
    a: "Yes. We handle delivery and collection across Greater London. Exact fees depend on your postcode and timing."
  }
];

export default function FaqsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-12">
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Frequently asked questions
      </h1>
      <div className="mt-8 space-y-6 text-sm text-white/75">
        {faqs.map((item) => (
          <div key={item.q}>
            <h2 className="font-semibold text-white">{item.q}</h2>
            <p className="mt-2 text-white/70">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

