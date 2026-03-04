"use server";

import { revalidatePath } from "next/cache";
import { getMongooseConnection } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/Product";

const sampleProducts = [
  {
    name: "Luxury Gold Cocktail Spoons (Set of 50)",
    slug: "luxury-gold-cocktail-spoons-50",
    description:
      "Elegant gold-plated swizzle sticks perfect for luxury weddings and high-end corporate receptions.",
    category: "Party spoons & stirrers",
    images: [
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80",
    ],
    baseDailyRateMinor: 1500, // £15.00
    securityDepositAmountMinor: 5000,
    totalQuantity: 20,
    tags: ["gold", "luxury", "cutlery", "bar"],
  },
  {
    name: "Vintage Copper Ice Bucket",
    slug: "vintage-copper-ice-bucket",
    description:
      "Large hand-hammered copper ice bucket for chilling multiple bottles of champagne or wine.",
    category: "Drink coolers & ice buckets",
    images: [
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80",
    ],
    baseDailyRateMinor: 2500, // £25.00
    securityDepositAmountMinor: 7500,
    totalQuantity: 15,
    tags: ["copper", "vintage", "cooler", "bar"],
  },
  {
    name: "Crystal Drink Dispenser 10L",
    slug: "crystal-drink-dispenser-10l",
    description:
      "Premium cut-glass style large capacity drink dispenser with a gold spigot. Ideal for self-serve cocktails or infused water.",
    category: "Drink dispensers & barware",
    images: [
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80",
    ],
    baseDailyRateMinor: 3500, // £35.00
    securityDepositAmountMinor: 10000,
    totalQuantity: 8,
    tags: ["dispenser", "glass", "bar"],
  },
  {
    name: "Classic White Marquee (6m x 12m)",
    slug: "classic-white-marquee-6x12",
    description:
      "Spacious, heavy-duty classic white party tent suitable for up to 80 seated guests. Fully waterproof.",
    category: "Party Tents",
    images: [
      "https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=800&q=80",
    ],
    baseDailyRateMinor: 45000, // £450.00
    securityDepositAmountMinor: 50000,
    totalQuantity: 3,
    tags: ["tent", "marquee", "outdoor"],
  },
  {
    name: "Elegant Champagne Flutes (Set of 100)",
    slug: "elegant-champagne-flutes-100",
    description:
      "Classic crystal clear champagne flutes for toasts and formal receptions.",
    category: "Drink dispensers & barware",
    images: [
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
    ],
    baseDailyRateMinor: 4000, // £40.00
    securityDepositAmountMinor: 15000,
    totalQuantity: 10,
    tags: ["glassware", "champagne", "bar"],
  },
];

export async function seedProductsAction() {
  try {
    await getMongooseConnection();

    // Clear existing to avoid duplicate slug issues during testing
    await Product.deleteMany({});

    // Seed new samples
    await Product.insertMany(sampleProducts);

    // Revalidate paths to update the UI instantly
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Seeding error:", error);
    return { error: error.message };
  }
}
