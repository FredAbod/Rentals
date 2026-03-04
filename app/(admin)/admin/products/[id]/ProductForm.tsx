"use client";

import { useState } from "react";
import { saveProductAction, deleteProductAction } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductForm({ product }: { product?: any }) {
  const isNew = !product;
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    try {
      await saveProductAction(formData);
    } catch (e) {
      console.error(e);
      setIsPending(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setIsDeleting(true);
    try {
      await deleteProductAction(product._id.toString());
    } catch (e) {
      console.error(e);
      setIsDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {isNew ? "Create New Product" : "Edit Product"}
        </h2>
        <Link
          href="/admin/products"
          className="text-xs text-white/50 hover:text-white"
        >
          &larr; Back to catalog
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="hidden"
          name="id"
          value={isNew ? "new" : product._id.toString()}
        />

        <div className="glass-surface p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/70">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={product?.name}
              className="mt-1 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70">
              Category
            </label>
            <input
              type="text"
              name="category"
              required
              defaultValue={product?.category}
              className="mt-1 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="e.g. Party Tents, Barware..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70">
              Description
            </label>
            <textarea
              name="description"
              required
              rows={4}
              defaultValue={product?.description}
              className="mt-1 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70">
              Image URL
            </label>
            <input
              type="url"
              name="image"
              defaultValue={product?.images?.[0] || ""}
              className="mt-1 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[0.65rem] uppercase tracking-wider text-white/50">
                Daily Rate (minor pence)
              </label>
              <input
                type="number"
                name="baseDailyRateMinor"
                required
                min={0}
                defaultValue={product?.baseDailyRateMinor || 0}
                className="mt-1 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-[0.65rem] uppercase tracking-wider text-white/50">
                Deposit (minor pence)
              </label>
              <input
                type="number"
                name="securityDepositAmountMinor"
                required
                min={0}
                defaultValue={product?.securityDepositAmountMinor || 0}
                className="mt-1 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-[0.65rem] uppercase tracking-wider text-accent font-semibold">
                Total Inventory
              </label>
              <input
                type="number"
                name="totalQuantity"
                required
                min={0}
                defaultValue={product?.totalQuantity || 0}
                className="mt-1 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {!isNew ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isPending}
              className="rounded-md border border-red-500/50 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Product"}
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="rounded-md border border-white/20 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || isDeleting}
              className="rounded-md bg-accent px-6 py-2 text-xs font-semibold text-black transition hover:bg-accentMuted disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
