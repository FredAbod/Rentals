import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const addressSchema = new Schema(
  {
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    postcode: { type: String, required: true },
    country: { type: String, default: "GB" }
  },
  { _id: false }
);

/**
 * Customer represents a B2C customer in London booking event rentals.
 *
 * We keep a reference to the Stripe customer for payment flows and store
 * default billing/delivery addresses for faster checkout.
 */
const customerSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    stripeCustomerId: { type: String },
    defaultBillingAddress: { type: addressSchema },
    defaultDeliveryAddress: { type: addressSchema }
  },
  {
    timestamps: true
  }
);

customerSchema.index({ email: 1 }, { unique: true });

export type CustomerDocument = InferSchemaType<typeof customerSchema>;

export const Customer: Model<CustomerDocument> =
  models.Customer || model<CustomerDocument>("Customer", customerSchema);

