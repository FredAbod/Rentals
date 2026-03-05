import { getMongooseConnection } from "@/lib/db/mongoose";
import { Order } from "@/lib/models/Order";
import { Customer } from "@/lib/models/Customer";
import OrdersTable from "./OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await getMongooseConnection();

  // Ensure Customer model is registered for populate
  void Customer;

  const limit = 20;

  const orders = await Order.find()
    .populate("customerId")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const totalOrders = await Order.countDocuments();
  const hasMore = totalOrders > orders.length;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white">Recent orders</h2>
      <OrdersTable
        initialOrders={JSON.parse(JSON.stringify(orders))}
        initialHasMore={hasMore}
      />
    </div>
  );
}
