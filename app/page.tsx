import Link from "next/link";
import Image from "next/image";
import { getMongooseConnection } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/Product";

async function getCategories() {
  await getMongooseConnection();

  // Aggregate unique categories and pick the first image for each
  const uniqueCategories = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        title: { $first: "$category" },
        description: { $first: "$description" },
        image: { $first: { $arrayElemAt: ["$images", 0] } },
      },
    },
    { $sort: { title: 1 } },
  ]);

  return uniqueCategories.map((cat) => ({
    title: cat.title,
    description: `Explore our collection of ${cat.title.toLowerCase()}.`,
    href: "/products",
    image:
      cat.image ||
      "https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=800&q=80",
  }));
}

export default async function HomePage() {
  const categories = await getCategories();
  return (
    <div className="relative mx-auto max-w-6xl px-6 pb-32 pt-16 lg:pt-24 z-10">
      {/* Background glow effects */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      {/* Hero — minimal, one clear message */}
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-5xl xl:text-6xl">
          Premium party rentals
          <span className="mt-2 block bg-gradient-to-r from-accent to-accentMuted bg-clip-text text-transparent">
            for London events
          </span>
        </h1>
        <p className="mt-6 text-base text-white/70 sm:text-lg">
          Spoons, coolers, party tents and more. Book online with live
          availability and transparent pricing.
        </p>
        <Link
          href="/products"
          className="mt-10 inline-block rounded-full bg-accent px-8 py-3.5 text-sm font-medium text-black transition hover:bg-accentMuted"
        >
          Browse collections
        </Link>
      </section>

      {/* Featured categories — image-first, spacious */}
      <section className="mt-24 lg:mt-32">
        <h2 className="text-center text-xl font-semibold text-white sm:text-2xl">
          Popular categories
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-white/60">
          Everything you need for parties, receptions and celebrations
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:gap-12">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group block overflow-hidden rounded-2xl bg-white/5 transition hover:bg-white/[0.08]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white">
                  {cat.title}
                </h3>
                <p className="mt-2 text-sm text-white/60">{cat.description}</p>
                <span className="mt-4 inline-block text-sm font-medium text-accent">
                  View range →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works — compact strip */}
      <section className="mt-24 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 sm:px-10">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent">
              Step 1
            </p>
            <h3 className="mt-2 font-semibold text-white">Browse & select</h3>
            <p className="mt-1 text-sm text-white/60">
              Choose items, dates and delivery postcode for an instant quote.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent">
              Step 2
            </p>
            <h3 className="mt-2 font-semibold text-white">Pay securely</h3>
            <p className="mt-1 text-sm text-white/60">
              Rental, delivery and VAT calculated upfront. Security deposit held
              separately.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-accent">
              Step 3
            </p>
            <h3 className="mt-2 font-semibold text-white">We deliver</h3>
            <p className="mt-1 text-sm text-white/60">
              Delivery and collection across Greater London on your event dates.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-24 text-center">
        <Link
          href="/products"
          className="inline-block rounded-full border border-white/20 px-8 py-3.5 text-sm font-medium text-white/90 transition hover:border-accent hover:text-white"
        >
          Explore all collections
        </Link>
      </section>
    </div>
  );
}
