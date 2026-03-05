import { getMongooseConnection } from "@/lib/db/mongoose";
import { Customer } from "@/lib/models/Customer";
import { Order } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { getMonthlyRevenueData } from "./actions/analytics";
import { RevenueChart } from "./components/RevenueChart";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await getMongooseConnection();

  const customerCount = await Customer.countDocuments();
  const orderCount = await Order.countDocuments();
  const productCount = await Product.countDocuments();

  // Aggregate total revenue across all orders
  const revenueAgg = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenueMinor: { $sum: "$totalMinor" },
      },
    },
  ]);
  const totalRevenueMinor = revenueAgg[0]?.totalRevenueMinor || 0;

  // Fetch recent activity (last 5 orders)
  const recentOrders = await Order.find()
    .populate("customerId")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Fetch chart data
  const revenueData = await getMonthlyRevenueData();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="glass-surface px-4 py-3 text-xs text-white/70">
          <p className="uppercase tracking-[0.22em] text-accent">
            Total revenue
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            £{(totalRevenueMinor / 100).toFixed(2)}
          </p>
          <p className="mt-1 text-[0.7rem] text-white/50">All-time</p>
        </div>
        <div className="glass-surface px-4 py-3 text-xs text-white/70">
          <p className="uppercase tracking-[0.22em] text-accent">
            Total orders
          </p>
          <p className="mt-2 text-lg font-semibold text-white">{orderCount}</p>
          <p className="mt-1 text-[0.7rem] text-white/50">Platform-wide</p>
        </div>
        <div className="glass-surface px-4 py-3 text-xs text-white/70">
          <p className="uppercase tracking-[0.22em] text-accent">
            Total Customers
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {customerCount}
          </p>
          <p className="mt-1 text-[0.7rem] text-white/50">Registered users</p>
        </div>
        <div className="glass-surface px-4 py-3 text-xs text-white/70">
          <p className="uppercase tracking-[0.22em] text-accent">
            Products listed
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {productCount}
          </p>
          <p className="mt-1 text-[0.7rem] text-white/50">Catalog items</p>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="glass-surface p-4 text-xs text-white/70 flex flex-col items-start justify-start">
          <p className="uppercase tracking-[0.22em] text-accent font-semibold text-sm mb-4">
            30-Day Revenue Trend
          </p>
          <div className="w-full">
            <RevenueChart data={revenueData} />
          </div>
        </div>
        <div className="glass-surface p-4 text-xs text-white/70 max-h-[350px] overflow-y-auto custom-scrollbar">
          <p className="uppercase tracking-[0.22em] text-accent sticky top-0 bg-[#0B0C10] pb-2 z-10">
            Recent Activity
          </p>
          <ul className="mt-3 space-y-3">
            {recentOrders.length === 0 ? (
              <li className="text-white/40 italic">No recent activity</li>
            ) : (
              recentOrders.map((order: any) => (
                <li
                  key={order._id.toString()}
                  className="flex items-center justify-between border-b border-white/5 pb-2"
                >
                  <div>
                    <p className="text-white font-medium">New booking placed</p>
                    <p className="text-white/50 text-[10px]">
                      {order.customerId?.firstName} {order.customerId?.lastName}{" "}
                      • #{order._id.toString().slice(-6).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-semibold">
                      £{(order.totalMinor / 100).toFixed(2)}
                    </p>
                    <p className="text-white/40 text-[9px]">
                      {new Date(order.createdAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
