import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/**
 * Product documents describe a rentable SKU (e.g. a specific chair or lighting rig).
 *
 * The physical quantity of this product is tracked via `totalQuantity`
 * combined with per-day reservations in the InventoryInstance collection.
 */
const productSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    images: { type: [String], default: [] },
    threeDModelUrl: { type: String, default: "" },
    splineSceneUrl: { type: String, default: "" },

    // Monetary fields are always stored in minor units (pence) to avoid floating point drift.
    baseDailyRateMinor: { type: Number, required: true, min: 0 },
    securityDepositAmountMinor: { type: Number, required: true, min: 0 },

    // PAT testing metadata for electrical compliance in the UK.
    isElectrical: { type: Boolean, default: false },
    patTestExpiryDate: { type: Date },

    // Total number of physical units owned for this SKU.
    totalQuantity: { type: Number, required: true, min: 0 },

    tags: { type: [String], default: [] },
    attributes: { type: Schema.Types.Mixed, default: {} }
  },
  {
    timestamps: true
  }
);

export type ProductDocument = InferSchemaType<typeof productSchema>;

export const Product: Model<ProductDocument> =
  models.Product || model<ProductDocument>("Product", productSchema);

