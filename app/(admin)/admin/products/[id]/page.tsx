import { getMongooseConnection } from "@/lib/db/mongoose";
import { Product } from "@/lib/models/Product";
import ProductForm from "./ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const isNew = params.id === "new";
  let product = null;

  if (!isNew) {
    await getMongooseConnection();
    const doc = await Product.findById(params.id).lean();
    if (!doc) {
      notFound();
    }
    // Serialize Mongoose document to a plain JSON-safe object
    product = JSON.parse(JSON.stringify(doc));
  }

  return (
    <div className="space-y-4">
      <ProductForm product={product} />
    </div>
  );
}
