"use server";

import { revalidatePath } from "next/cache";
import { getMongooseConnection } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/Product";
import { redirect } from "next/navigation";

export async function saveProductAction(formData: FormData) {
  try {
    await getMongooseConnection();

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const imagesRaw = formData.get("images") as string;
    const baseDailyRateMinor = parseInt(
      formData.get("baseDailyRateMinor") as string,
      10,
    );
    const securityDepositAmountMinor = parseInt(
      formData.get("securityDepositAmountMinor") as string,
      10,
    );
    const totalQuantity = parseInt(formData.get("totalQuantity") as string, 10);

    // Parse images JSON array
    let images: string[] = [];
    try {
      images = JSON.parse(imagesRaw || "[]");
    } catch {
      images = [];
    }

    // Auto-generate slug from name if new
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const productData = {
      name,
      slug,
      description,
      category,
      images,
      baseDailyRateMinor,
      securityDepositAmountMinor,
      totalQuantity,
    };

    if (id && id !== "new") {
      // Update existing
      await Product.findByIdAndUpdate(id, productData);
    } else {
      // Create new
      await Product.create(productData);
    }
  } catch (error: any) {
    console.error("Failed to save product:", error);
    throw new Error(error.message);
  }

  // Revalidate and redirect outside the try-catch to avoid swallowing redirect errors
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProductAction(id: string) {
  try {
    await getMongooseConnection();
    await Product.findByIdAndDelete(id);
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products");
}
