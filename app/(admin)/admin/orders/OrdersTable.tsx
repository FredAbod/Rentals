"use client";

import { useState } from "react";
import { getOrdersAction } from "./actions";

interface OrdersTableProps {
  initialOrders: any[];
  initialHasMore: boolean;
}

export default function OrdersTable({
  initialOrders,
  initialHasMore,
}: OrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLoadMore() {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const nextPage = page + 1;
      const res = await getOrdersAction(nextPage, 20);
      setOrders((prev) => [...prev, ...res.orders]);
      setHasMore(res.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error(error);
      alert("Failed to load more orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
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

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="rounded-full border border-white/10 bg-white/5 px-6 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
