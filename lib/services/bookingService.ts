import mongoose from "mongoose";
import { getMongooseConnection } from "@/lib/db/mongoose";
import { Product, type ProductDocument } from "@/lib/models/Product";
import {
  InventoryInstance,
  type InventoryInstanceDocument,
} from "@/lib/models/InventoryInstance";
import { Order, type OrderDocument } from "@/lib/models/Order";
import { Customer, type CustomerDocument } from "@/lib/models/Customer";

export interface BookingItemInput {
  productId: string;
  quantity: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

export interface BookingCustomerInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface BookingDeliveryInput {
  postcode: string;
  deliveryWindow?: string;
  distanceKm?: number;
}

export interface BookingPricingInput {
  subtotalMinor: number;
  vatAmountMinor: number;
  totalMinor: number;
  deliveryFeeMinor: number;
  congestionChargeApplied: boolean;
  damageWaiverSelected: boolean;
  damageWaiverAmountMinor: number;
  securityDepositAmountMinor: number;
  currency: string;
}

export interface BookingStripeInput {
  stripeCustomerId: string;
  stripePaymentIntentId: string;
  paymentMethodId: string;
}

export interface CreateBookingArgs {
  customer: BookingCustomerInput;
  items: BookingItemInput[];
  delivery: BookingDeliveryInput;
  pricing: BookingPricingInput;
  stripe: BookingStripeInput;
}

function getInclusiveDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
  );
  const endUtc = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
  );
  while (current <= endUtc) {
    dates.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

/**
 * createBookingWithTransaction encapsulates the concurrency-safe booking logic.
 *
 * It uses a MongoDB multi-document transaction with conditional $inc updates to
 * guarantee that no two overlapping bookings can reserve more units than exist.
 */
export async function createBookingWithTransaction(
  args: CreateBookingArgs,
): Promise<OrderDocument> {
  const conn = await getMongooseConnection();
  const session = await conn.startSession();

  try {
    let createdOrder: OrderDocument | null = null;

    await session.withTransaction(async () => {
      // 1. Create or load customer inside the transaction.
      const existingCustomer = await Customer.findOne(
        { email: args.customer.email },
        null,
        { session },
      );

      let customerDoc: CustomerDocument;

      if (existingCustomer) {
        customerDoc = existingCustomer;
      } else {
        customerDoc = await Customer.create(
          [
            {
              email: args.customer.email,
              firstName: args.customer.firstName,
              lastName: args.customer.lastName,
              phone: args.customer.phone,
            },
          ],
          { session },
        ).then((res) => res[0]);
      }

      // 2. Load all referenced products.
      const productIds = args.items.map(
        (item) => new mongoose.Types.ObjectId(item.productId),
      );
      const products = await Product.find({ _id: { $in: productIds } }, null, {
        session,
      });

      const productMap = new Map<string, ProductDocument>();
      for (const product of products) {
        productMap.set((product as any)._id.toHexString(), product);
      }

      if (productMap.size !== productIds.length) {
        throw new Error("One or more products not found for booking");
      }

      // 3. For each item and each date in range, perform guarded $inc on InventoryInstance.
      for (const item of args.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error("Product not found in map");
        }

        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);

        const dates = getInclusiveDateRange(startDate, endDate);

        for (const date of dates) {
          const dateUtc = new Date(
            Date.UTC(
              date.getUTCFullYear(),
              date.getUTCMonth(),
              date.getUTCDate(),
            ),
          );

          // We guard the increment by asserting that reservedQuantity <= maxAllowedBeforeIncrement.
          const maxAllowedBeforeIncrement =
            product.totalQuantity - item.quantity;

          const filter = {
            productId: (product as any)._id,
            date: dateUtc,
            reservedQuantity: { $lte: maxAllowedBeforeIncrement },
          };

          const update = {
            $inc: { reservedQuantity: item.quantity },
          };

          const options = {
            upsert: true,
            new: true,
            session,
          } as const;

          const result = (await InventoryInstance.findOneAndUpdate(
            filter,
            update,
            options,
          )) as InventoryInstanceDocument | null;

          // If result is null, the conditional filter failed (oversubscription / race condition).
          if (!result) {
            throw new Error("Insufficient inventory for requested dates");
          }
        }
      }

      // 4. Create order snapshot.
      const rentalStartDate = new Date(
        args.items
          .map((i) => new Date(i.startDate).getTime())
          .reduce((a, b) => Math.min(a, b)),
      );
      const rentalEndDate = new Date(
        args.items
          .map((i) => new Date(i.endDate).getTime())
          .reduce((a, b) => Math.max(a, b)),
      );

      const orderDoc = await Order.create(
        [
          {
            customerId: (customerDoc as any)._id,
            items: args.items.map((item) => {
              const product = productMap.get(item.productId)!;
              return {
                productId: (product as any)._id,
                nameSnapshot: product.name,
                quantity: item.quantity,
                unitPriceMinor: product.baseDailyRateMinor,
                startDate: new Date(item.startDate),
                endDate: new Date(item.endDate),
              };
            }),
            status: "confirmed",
            rentalStartDate,
            rentalEndDate,
            deliveryPostcode: args.delivery.postcode,
            deliveryWindow: args.delivery.deliveryWindow,
            deliveryFeeMinor: args.pricing.deliveryFeeMinor,
            congestionChargeApplied: args.pricing.congestionChargeApplied,
            distanceKm: args.delivery.distanceKm,
            damageWaiverSelected: args.pricing.damageWaiverSelected,
            damageWaiverAmountMinor: args.pricing.damageWaiverAmountMinor,
            subtotalMinor: args.pricing.subtotalMinor,
            vatAmountMinor: args.pricing.vatAmountMinor,
            totalMinor: args.pricing.totalMinor,
            currency: args.pricing.currency,
            securityDepositAmountMinor: args.pricing.securityDepositAmountMinor,
            securityDepositStatus:
              args.pricing.securityDepositAmountMinor > 0
                ? "pending"
                : "not_required",
            stripePaymentIntentId: args.stripe.stripePaymentIntentId,
            stripeCustomerId: args.stripe.stripeCustomerId,
            paymentMethodId: args.stripe.paymentMethodId,
            events: [
              {
                type: "order_created",
                message: "Order created and inventory reserved.",
                createdAt: new Date(),
              },
            ],
          },
        ],
        { session },
      );

      createdOrder = orderDoc[0];
    });

    if (!createdOrder) {
      throw new Error("Booking transaction did not create an order");
    }

    return createdOrder;
  } finally {
    await session.endSession();
  }
}
