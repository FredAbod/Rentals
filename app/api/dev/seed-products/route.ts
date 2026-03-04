import { NextResponse } from "next/server";
import { getMongooseConnection } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/Product";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    await getMongooseConnection();

    const seed = [
      {
        name: "Sculpted Lounge Collection",
        slug: "sculpted-lounge-collection",
        description:
          "Modular lounge seating, low tables and ambient lighting for intimate receptions.",
        category: "Seating",
        images: [],
        threeDModelUrl: "/models/sculpted-lounge.glb",
        splineSceneUrl: "",
        baseDailyRateMinor: 4500,
        securityDepositAmountMinor: 50000,
        isElectrical: false,
        totalQuantity: 10,
        tags: ["lounge", "sofa"],
        attributes: {}
      },
      {
        name: "Premium party spoons & stirrers",
        slug: "party-spoons-stirrers",
        description:
          "Cocktail sticks, swizzle sticks and decorative stirrers. Gold, silver and mixed finishes. Set of 100.",
        category: "Barware",
        images: ["https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80"],
        threeDModelUrl: "",
        splineSceneUrl: "",
        baseDailyRateMinor: 800,
        securityDepositAmountMinor: 2000,
        isElectrical: false,
        totalQuantity: 50,
        tags: ["spoons", "stirrers", "cocktail"],
        attributes: {}
      },
      {
        name: "Champagne coolers & ice buckets",
        slug: "champagne-coolers-ice-buckets",
        description:
          "Silver-plated coolers and ice buckets for champagne, prosecco and wine. Elegant standalone pieces.",
        category: "Coolers",
        images: ["https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80"],
        threeDModelUrl: "",
        splineSceneUrl: "",
        baseDailyRateMinor: 1200,
        securityDepositAmountMinor: 15000,
        isElectrical: false,
        totalQuantity: 20,
        tags: ["cooler", "ice-bucket", "champagne"],
        attributes: {}
      },
      {
        name: "Drink dispensers & glass jugs",
        slug: "drink-dispensers-jugs",
        description:
          "Glass dispensers for cocktails, punch and lemonade. Includes stand and tap. 5L capacity.",
        category: "Barware",
        images: ["https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80"],
        threeDModelUrl: "",
        splineSceneUrl: "",
        baseDailyRateMinor: 1500,
        securityDepositAmountMinor: 8000,
        isElectrical: false,
        totalQuantity: 15,
        tags: ["dispenser", "jug", "bar"],
        attributes: {}
      }
    ];

    for (const product of seed) {
      await Product.updateOne(
        { slug: product.slug },
        { $set: product },
        { upsert: true }
      );
    }

    return NextResponse.json({ ok: true, count: seed.length });
  } catch (error) {
    console.error("[dev.seed-products] error", error);
    return NextResponse.json({ error: "Failed to seed products" }, { status: 500 });
  }
}

