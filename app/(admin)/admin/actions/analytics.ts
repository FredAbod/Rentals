import { Order } from "@/lib/models/Order";
import { getMongooseConnection } from "@/lib/db/mongoose";

export async function getMonthlyRevenueData() {
  await getMongooseConnection();

  // Get the date exactly 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Aggregate orders from the last 30 days
  const data = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
        status: { $in: ["confirmed", "completed"] }, // Only count successful orders
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        revenueMinor: { $sum: "$totalMinor" },
        orders: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 }, // Sort chronologically
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        revenue: { $divide: ["$revenueMinor", 100] }, // Convert pennies to formatted pounds
        orders: 1,
      },
    },
  ]);

  return data;
}
