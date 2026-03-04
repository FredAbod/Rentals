import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SplineEmbed } from "@/components/3d/SplineEmbed";
import { getMongooseConnection } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/Product";

const ProductViewerR3F = dynamic(
  () => import("@/components/3d/ProductViewerR3F"),
  { ssr: false }
);

async function getProduct(slug: string) {
  await getMongooseConnection();
  const product = await Product.findOne({ slug }).lean();
  if (!product) {
    notFound();
  }
  return {
    id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    description: product.description,
    threeDModelUrl: product.threeDModelUrl as string,
    splineSceneUrl: product.splineSceneUrl as string,
    baseDailyRateMinor: product.baseDailyRateMinor as number,
    images: (product.images as string[]) || [],
  };
}

interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="space-y-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white/5">
            {product.threeDModelUrl ? (
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center text-xs text-white/60">
                    Loading 3D viewer…
                  </div>
                }
              >
                <ProductViewerR3F modelUrl={product.threeDModelUrl} />
              </Suspense>
            ) : product.splineSceneUrl ? (
              <SplineEmbed sceneUrl={product.splineSceneUrl} />
            ) : product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white/40">
                No image
              </div>
            )}
          </div>
          <article className="space-y-4">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {product.name}
            </h1>
            <p className="max-w-2xl text-sm text-white/70">{product.description}</p>
          </article>
        </section>
        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-sm font-semibold text-white">Booking summary</h2>
            <p className="mt-2 text-xs text-white/70">
              Choose your dates and delivery postcode at checkout. The system will only
              confirm if every physical unit is available for the full range.
            </p>
            <dl className="mt-4 space-y-2 text-xs text-white/70">
              <div className="flex items-center justify-between">
                <dt>Base daily rate</dt>
                <dd className="font-medium text-white">
                  £{(product.baseDailyRateMinor / 100).toFixed(2)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Damage waiver</dt>
                <dd>Optional 12% of equipment total</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>VAT</dt>
                <dd>20% UK standard rate</dd>
              </div>
            </dl>
            <Link
              href={`/checkout?productId=${product.id}&slug=${product.slug}`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-accent px-4 py-3 text-sm font-medium text-black transition hover:bg-accentMuted"
            >
              Add to booking
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

