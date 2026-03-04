import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

/**
 * InventoryInstance represents reserved quantity for a single product on a
 * single calendar day. This allows us to answer availability questions for any
 * date range without joining across orders.
 *
 * For a given product and rental request [startDate, endDate]:
 * - We query InventoryInstance where date is in that range.
 * - For each day, we derive available = product.totalQuantity - reservedQuantity.
 * - The product is available if available >= requestedQty for every day.
 *
 * Reservation updates are performed with conditional $inc operations inside a
 * MongoDB transaction to avoid overselling during concurrent checkouts.
 */
const inventoryInstanceSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    // Stored as UTC midnight for the given day.
    date: {
      type: Date,
      required: true
    },
    reservedQuantity: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Ensure only one document exists per product/day.
inventoryInstanceSchema.index(
  { productId: 1, date: 1 },
  { unique: true }
);

export type InventoryInstanceDocument = InferSchemaType<typeof inventoryInstanceSchema>;

export const InventoryInstance: Model<InventoryInstanceDocument> =
  models.InventoryInstance ||
  model<InventoryInstanceDocument>("InventoryInstance", inventoryInstanceSchema);

