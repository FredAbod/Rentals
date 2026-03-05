"use server";

import { getMongooseConnection } from "@/lib/db/mongoose";
import { Order } from "@/lib/models/Order";
import { Customer } from "@/lib/models/Customer";

export async function getOrdersAction(page: number, limit: number = 20) {
  try {
    await getMongooseConnection();

    // Ensure Customer model is registered
    void Customer;

    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate("customerId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalOrders = await Order.countDocuments();
    const hasMore = totalOrders > skip + orders.length;

    // Serialize to pass to client component safely
    return {
      orders: JSON.parse(JSON.stringify(orders)),
      hasMore,
    };
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    throw new Error("Failed to fetch orders");
  }
}
