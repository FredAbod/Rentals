import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    // Snapshot fields allow reporting even if the product later changes.
    nameSnapshot: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPriceMinor: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  { _id: false }
);

const orderEventSchema = new Schema(
  {
    type: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() }
  },
  { _id: false }
);

/**
 * Order is the canonical record of a booking.
 *
 * It stores a summary of the rental window, pricing breakdown, Stripe
 * PaymentIntent/SetupIntent identifiers, and operational events for the
 * admin dashboard activity feed.
 */
const orderSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: (value: unknown[]) => Array.isArray(value) && value.length > 0
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending"
    },
    rentalStartDate: { type: Date, required: true },
    rentalEndDate: { type: Date, required: true },

    // Logistics
    deliveryPostcode: { type: String, required: true },
    deliveryWindow: { type: String },
    deliveryFeeMinor: { type: Number, required: true, min: 0 },
    congestionChargeApplied: { type: Boolean, default: false },
    distanceKm: { type: Number },

    // Damage waiver
    damageWaiverSelected: { type: Boolean, default: false },
    damageWaiverAmountMinor: { type: Number, required: true, min: 0 },

    // Pricing
    subtotalMinor: { type: Number, required: true, min: 0 },
    vatAmountMinor: { type: Number, required: true, min: 0 },
    totalMinor: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "gbp" },

    // Security deposit handling.
    securityDepositAmountMinor: { type: Number, required: true, min: 0 },
    securityDepositStatus: {
      type: String,
      enum: ["pending", "authorized", "released", "captured", "not_required"],
      default: "pending"
    },
    securityDepositPaymentIntentId: { type: String },
    paymentMethodId: { type: String },

    // Stripe checkout identifiers.
    stripePaymentIntentId: { type: String, required: true },
    stripeCustomerId: { type: String, required: true },

    events: {
      type: [orderEventSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

orderSchema.index({ customerId: 1, rentalStartDate: 1 });
orderSchema.index({ rentalStartDate: 1, rentalEndDate: 1 });
orderSchema.index({ status: 1, rentalStartDate: 1 });

export type OrderDocument = InferSchemaType<typeof orderSchema>;

export const Order: Model<OrderDocument> =
  models.Order || model<OrderDocument>("Order", orderSchema);

