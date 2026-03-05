import { getMongooseConnection } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/Product";
import SeedProductsButton from "./SeedProductsButton";
import Image from "next/image";
import Link from "next/link";

export default async function AdminProductsPage() {
  await getMongooseConnection();
  const products = await Product.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Product Catalog</h2>
        <div className="flex items-center gap-3">
          <SeedProductsButton />
          <Link
            href="/admin/products/new"
            className="rounded-md bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            + New
          </Link>
        </div>
      </div>

      <div className="glass-surface overflow-x-auto text-xs text-white/70">
        <table className="min-w-full border-collapse">
          <thead className="bg-white/5 text-[0.7rem] uppercase tracking-[0.18em]">
            <tr>
              <th className="px-4 py-2 text-left">Image</th>
              <th className="px-4 py-2 text-left">SKU Name</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Daily Rate</th>
              <th className="px-4 py-2 text-left">Total Qty (Owned)</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr className="border-t border-white/10">
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-white/40 italic"
                >
                  <p>Your catalog is empty.</p>
                  <p className="mt-2 text-[0.7rem]">
                    Click the button above to generate sample items.
                  </p>
                </td>
              </tr>
            ) : (
              products.map((p: any) => (
                <tr key={p._id.toString()} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-md bg-white/5 border border-white/10">
                      {p.images?.[0] ? (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[0.6rem] text-white/30">
                          N/A
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/admin/products/${p._id.toString()}`}
                      className="text-white hover:text-accent transition-colors"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3 text-white/90">
                    £{(p.baseDailyRateMinor / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">{p.totalQuantity} Units</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
