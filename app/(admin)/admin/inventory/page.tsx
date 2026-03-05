import { getMongooseConnection } from "@/lib/db/mongoose";
import { InventoryInstance } from "@/lib/models/InventoryInstance";
import "@/lib/models/Product"; // Ensure Product schema is registered for populate

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  await getMongooseConnection();
  const instances = await InventoryInstance.find().populate("productId").lean();
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white">Live inventory</h2>
      <div className="glass-surface overflow-hidden text-xs text-white/70">
        <table className="min-w-full border-collapse">
          <thead className="bg-white/5 text-[0.7rem] uppercase tracking-[0.18em]">
            <tr>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Today</th>
              <th className="px-4 py-2 text-left">Weekend</th>
              <th className="px-4 py-2 text-left">PAT expiry</th>
            </tr>
          </thead>
          <tbody>
            {instances.length === 0 ? (
              <tr className="border-t border-white/10">
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-white/40 italic"
                >
                  No inventory data available.
                </td>
              </tr>
            ) : (
              instances.map((inv: any) => (
                <tr
                  key={inv._id.toString()}
                  className="border-t border-white/10"
                >
                  <td className="px-4 py-3 text-white">
                    {inv.productId?.name || "Unknown Product"}
                  </td>
                  <td className="px-4 py-3">
                    {inv.productId?.category || "—"}
                  </td>
                  <td className="px-4 py-3">—</td>
                  <td className="px-4 py-3">
                    {inv.condition === "good" ? "Operational" : "Maintenance"}
                  </td>
                  <td className="px-4 py-3">
                    {inv.nextPatTestDueDate
                      ? new Date(inv.nextPatTestDueDate).toLocaleDateString(
                          "en-GB",
                          { month: "short", day: "numeric", year: "numeric" },
                        )
                      : "—"}
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
