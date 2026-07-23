import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Sale from "@/models/Sale";
import Purchase from "@/models/Purchase";
import { Expense, Notification } from "@/models/index";
import Customer from "@/models/Customer";
import Category from "@/models/Category";
import { ok, serverError } from "@/lib/apiResponse";
import { startOfDay, startOfMonth, startOfYear } from "date-fns";

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const todayStart = startOfDay(now);
    const monthStart = startOfMonth(now);
    const yearStart = startOfYear(now);

    // ── Sales totals ───────────────────────────────────────────────
    // ── Combined Sales (Sale + Delivered Orders) ─────────────────────

    const deliveredOrdersMatch = {
      status: "delivered",
    };

    const [
      todayOrderSales,
      monthOrderSales,
      yearOrderSales,
      totalDeliveredSales,
    ] = await Promise.all([
      // Today Delivered Orders
      Order.aggregate([
        {
          $match: {
            ...deliveredOrdersMatch,
            createdAt: { $gte: todayStart },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$grandTotal" },
            count: { $sum: 1 },
          },
        },
      ]),

      // Monthly Delivered Orders
      Order.aggregate([
        {
          $match: {
            ...deliveredOrdersMatch,
            createdAt: { $gte: monthStart },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$grandTotal" },
          },
        },
      ]),

      // Yearly Delivered Orders
      Order.aggregate([
        {
          $match: {
            ...deliveredOrdersMatch,
            createdAt: { $gte: yearStart },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$grandTotal" },
          },
        },
      ]),

      // All delivered orders
      Order.aggregate([
        {
          $match: deliveredOrdersMatch,
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$grandTotal" },
          },
        },
      ]),
    ]);

    // Existing Sale Collection
    const [saleToday, saleMonth, saleYear, saleTotal] = await Promise.all([
      Sale.aggregate([
        {
          $match: {
            saleDate: {
              $gte: todayStart,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amountPaid",
            },
          },
        },
      ]),

      Sale.aggregate([
        {
          $match: {
            saleDate: {
              $gte: monthStart,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amountPaid",
            },
          },
        },
      ]),

      Sale.aggregate([
        {
          $match: {
            saleDate: {
              $gte: yearStart,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amountPaid",
            },
          },
        },
      ]),

      Sale.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amountPaid",
            },
          },
        },
      ]),
    ]);

    const todaySales =
      (todayOrderSales[0]?.total || 0) + (saleToday[0]?.total || 0);

    const monthlySales =
      (monthOrderSales[0]?.total || 0) + (saleMonth[0]?.total || 0);

    const yearlySales =
      (yearOrderSales[0]?.total || 0) + (saleYear[0]?.total || 0);

    const totalRevenue =
      (totalDeliveredSales[0]?.total || 0) + (saleTotal[0]?.total || 0);

    // ── Orders ────────────────────────────────────────────────────
    const [orderStats] = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          confirmed: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
          delivered: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          revenue: { $sum: "$grandTotal" },
        },
      },
    ]);

    // ── Purchase cost ─────────────────────────────────────────────
    // ── Purchase cost + Payment ─────────────────────────────────────
    const [purchaseStats] = await Purchase.aggregate([
      {
        $group: {
          _id: null,
          totalCost: { $sum: "$grandTotal" },
          totalPaid: { $sum: "$amountPaid" },
        },
      },
    ]);

    const totalPurchase = purchaseStats?.totalCost || 0;
    const totalPaid = purchaseStats?.totalPaid || 0;
    const totalDue = totalPurchase - totalPaid;
    // ── Expenses ──────────────────────────────────────────────────
    const [expenseStats] = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // ── Products ─────────────────────────────────────────────────
    const [productStats] = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          outOfStock: { $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] } },
          lowStock: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$stock", 0] },
                    { $lte: ["$stock", "$lowStockThreshold"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // ── Monthly sales graph (last 6 months) ───────────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlySalesGraph = await Sale.aggregate([
      { $match: { saleDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$saleDate" },
            month: { $month: "$saleDate" },
          },
          sales: { $sum: "$amountPaid" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const salesChartData = monthlySalesGraph.map((m) => ({
      month: monthNames[m._id.month - 1],
      sales: m.sales,
      orders: m.orders,
    }));

    // ── Category wise sales ───────────────────────────────────────
    const categoryWiseSales = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category.name",
          total: { $sum: "$items.total" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 6 },
    ]);

    // ── Top selling products ──────────────────────────────────────
    const topProducts = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          totalQty: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]);

    // ── Totals ────────────────────────────────────────────────────

    const totalCost = totalPurchase;

    const totalExpenses = expenseStats?.total || 0;

    const totalProfit = totalRevenue - totalCost - totalExpenses;

    const [totalCustomers, totalCategories, unreadNotifications] =
      await Promise.all([
        Customer.countDocuments(),
        Category.countDocuments({ status: "active" }),
        Notification.countDocuments({ isRead: false }),
      ]);

    return ok({
      stats: {
        todaySales,
        todaySalesCount: todayOrderSales[0]?.count || 0,

        monthlySales,
        yearlySales,

        totalRevenue,
        totalOrders: orderStats?.total || 0,
        pendingOrders: orderStats?.pending || 0,
        deliveredOrders: orderStats?.delivered || 0,
        totalProducts: productStats?.total || 0,
        lowStockProducts: productStats?.lowStock || 0,
        outOfStockProducts: productStats?.outOfStock || 0,
        totalCategories,
        totalCustomers,
        totalCost,
        totalPaid,
        totalDue,
        totalExpenses,
        totalProfit,
        unreadNotifications,
      },
      salesChartData,
      categoryWiseSales: categoryWiseSales.map((c) => ({
        name: c._id,
        value: c.total,
      })),
      topProducts,
    });
  } catch (error) {
    return serverError(error);
  }
}
