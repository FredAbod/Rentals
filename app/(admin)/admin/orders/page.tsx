import { getMongooseConnection } from "@/lib/db/mongoose";
import { Order } from "@/lib/models/Order";

export default async function AdminOrdersPage() {
  await getMongooseConnection();
  const orders = await Order.find()
    .populate("customerId")
    .sort({ createdAt: -1 })
    .lean();
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white">Recent orders</h2>
      <div className="glass-surface overflow-x-auto text-xs text-white/70">
        <table className="min-w-full border-collapse">
          <thead className="bg-white/5 text-[0.7rem] uppercase tracking-[0.18em]">
            <tr>
              <th className="px-4 py-2 text-left">Order</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Event window</th>
              <th className="px-4 py-2 text-left">Postcode</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr className="border-t border-white/10">
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-white/40 italic"
                >
                  No recent orders.
                </td>
              </tr>
            ) : (
              orders.map((o: any) => (
                <tr key={o._id.toString()} className="border-t border-white/10">
                  <td className="px-4 py-3 text-white">
                    #{o._id.toString().slice(-6).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">{o.customerId?.email || "—"}</td>
                  <td className="px-4 py-3">
                    {o.rentalStartDate
                      ? new Date(o.rentalStartDate).toLocaleDateString(
                          "en-GB",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )
                      : "N/A"}
                    {" – "}
                    {o.rentalEndDate
                      ? new Date(o.rentalEndDate).toLocaleDateString("en-GB", {
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3">{o.deliveryPostcode || "—"}</td>
                  <td className="px-4 py-3">
                    £{o.totalMinor ? (o.totalMinor / 100).toFixed(2) : "0.00"}
                  </td>
                  <td
                    className={`px-4 py-3 ${o.status === "confirmed" ? "text-emerald-400" : "text-white/70"}`}
                  >
                    {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
