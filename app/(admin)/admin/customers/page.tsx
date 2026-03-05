import { getMongooseConnection } from "@/lib/db/mongoose";
import { Customer } from "@/lib/models/Customer";
import { Order } from "@/lib/models/Order";

export default async function AdminCustomersPage() {
  await getMongooseConnection();

  // Use an aggregation pipeline to left-join orders onto customers
  const customers = await Customer.aggregate([
    {
      $lookup: {
        from: Order.collection.name, // "orders" collection
        localField: "_id",
        foreignField: "customerId",
        as: "orders",
      },
    },
    {
      $addFields: {
        lifetimeValueMinor: { $sum: "$orders.totalMinor" },
        lastOrder: {
          $arrayElemAt: [
            {
              $sortArray: { input: "$orders", sortBy: { createdAt: -1 } },
            },
            0,
          ],
        },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white">Customers</h2>
      <div className="glass-surface overflow-x-auto text-xs text-white/70">
        <table className="min-w-full border-collapse">
          <thead className="bg-white/5 text-[0.7rem] uppercase tracking-[0.18em]">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Lifetime value</th>
              <th className="px-4 py-2 text-left">Last booking</th>
              <th className="px-4 py-2 text-left">City</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr className="border-t border-white/10">
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-white/40 italic"
                >
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((c: any) => (
                <tr key={c._id.toString()} className="border-t border-white/10">
                  <td className="px-4 py-3 text-white">
                    {c.firstName} {c.lastName}
                  </td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3 text-emerald-400 font-medium">
                    £{(c.lifetimeValueMinor / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-white/90">
                    {c.lastOrder?.rentalStartDate ? (
                      new Date(c.lastOrder.rentalStartDate).toLocaleDateString(
                        "en-GB",
                        { month: "short", day: "numeric", year: "numeric" },
                      )
                    ) : (
                      <span className="text-white/40">Never</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.defaultBillingAddress?.city || "—"}
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
