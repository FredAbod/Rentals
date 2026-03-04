import Link from "next/link";
import Image from "next/image";
import { getMongooseConnection } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/Product";

async function getProducts() {
  await getMongooseConnection();
  const products = await Product.find({}).sort({ name: 1 }).lean();
  return products.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    description: p.description,
    category: p.category,
    baseDailyRateMinor: p.baseDailyRateMinor,
    images: (p.images as string[]) || [],
    threeDModelUrl: p.threeDModelUrl as string,
  }));
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-12">
      <header className="mb-12">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Collections
        </h1>
        <p className="mt-3 max-w-xl text-sm text-white/60">
          Browse our party and event rentals. All items are available for same-week
          delivery across Greater London.
        </p>
      </header>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-16 text-center">
          <p className="text-sm text-white/60">No products yet.</p>
          <p className="mt-2 text-xs text-white/40">
            Run POST /api/dev/seed-products to add sample inventory.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group block overflow-hidden rounded-2xl bg-white/5 transition hover:bg-white/[0.08]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/30">
                    No image
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-accent">
                  {product.category}
                </p>
                <h2 className="mt-2 font-semibold text-white">{product.name}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-white/60">
                  {product.description}
                </p>
                <p className="mt-4 text-sm font-medium text-white">
                  £{(product.baseDailyRateMinor / 100).toFixed(2)}
                  <span className="ml-1 text-xs font-normal text-white/50">/ day</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
