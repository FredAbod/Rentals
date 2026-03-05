"use client";

import { useState, useRef, useCallback } from "react";
import { saveProductAction, deleteProductAction } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProductForm({ product }: { product?: any }) {
  const isNew = !product;
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Multi-image upload state
  const [imageUrls, setImageUrls] = useState<string[]>(product?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) return false;
      if (file.size > 10 * 1024 * 1024) return false;
      return true;
    });

    if (validFiles.length === 0) {
      setUploadError(
        "Please select valid image files (JPEG, PNG, WebP) under 10MB.",
      );
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Upload failed");
        }

        const data = await res.json();
        return data.url as string;
      });

      const newUrls = await Promise.all(uploadPromises);
      setImageUrls((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      console.error("[upload] error", err);
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files?.length) handleUpload(e.dataTransfer.files);
    },
    [handleUpload],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) handleUpload(e.target.files);
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [handleUpload],
  );

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= imageUrls.length) return;
    setImageUrls((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

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
        {/* Hidden field carries the JSON array of Cloudinary URLs */}
        <input type="hidden" name="images" value={JSON.stringify(imageUrls)} />

        <div className="glass-surface p-4 space-y-4 sm:p-6">
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

          {/* ─── Multi-Image Upload Zone ─── */}
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-2">
              Product Images{" "}
              <span className="font-normal text-white/40">
                ({imageUrls.length} uploaded)
              </span>
            </label>

            {/* Image grid preview */}
            {imageUrls.length > 0 && (
              <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {imageUrls.map((url, idx) => (
                  <div
                    key={url + idx}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-black/40"
                  >
                    <Image
                      src={url}
                      alt={`Product image ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                    {/* Badge for first image */}
                    {idx === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold text-black">
                        COVER
                      </span>
                    )}
                    {/* Controls overlay */}
                    <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveImage(idx, idx - 1)}
                          disabled={idx === 0}
                          className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white/80 hover:bg-black disabled:opacity-30"
                          title="Move left"
                        >
                          ◀
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(idx, idx + 1)}
                          disabled={idx === imageUrls.length - 1}
                          className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white/80 hover:bg-black disabled:opacity-30"
                          title="Move right"
                        >
                          ▶
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="rounded bg-red-500/80 px-1.5 py-0.5 text-[10px] text-white hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition-all ${
                isDragOver
                  ? "border-accent bg-accent/10"
                  : "border-white/15 bg-black/30 hover:border-white/30 hover:bg-black/40"
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  <p className="text-xs text-white/60">Uploading to cloud...</p>
                </div>
              ) : (
                <>
                  <svg
                    className="mb-2 h-8 w-8 text-white/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-xs text-white/60">
                    <span className="font-semibold text-accent">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="mt-1 text-[10px] text-white/40">
                    PNG, JPG, WebP up to 10MB • Multiple files supported
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {uploadError && (
              <p className="mt-2 text-xs text-red-400">{uploadError}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              disabled={isPending || isDeleting || isUploading}
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
