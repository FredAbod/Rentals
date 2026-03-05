import { NextResponse } from "next/server";
import { getMongooseConnection } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/Product";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await getMongooseConnection();

    if (!params.id) {
      return NextResponse.json(
        { error: "Product ID is missing" },
        { status: 400 },
      );
    }

    const doc = await Product.findById(params.id).lean();

    if (!doc) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Return the minimum needed for the checkout quote
    return NextResponse.json({
      id: (doc as any)._id.toString(),
      name: doc.name,
      baseDailyRateMinor: doc.baseDailyRateMinor,
      securityDepositAmountMinor: doc.securityDepositAmountMinor,
    });
  } catch (error) {
    console.error("[product.get] error", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}
