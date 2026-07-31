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

    // ── Combined Sales (Sale + Delivered Orders) — plain paid amounts,
    // refunded sales/orders are excluded here; they have their own boxes ──

    const deliveredOrdersMatch = { status: "delivered" };
    const netOrderTotal = "$grandTotal";

    const [
      todayOrderSales,
      monthOrderSales,
      yearOrderSales,
      totalDeliveredSales,
    ] = await Promise.all([
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
            total: { $sum: netOrderTotal },
            count: { $sum: 1 },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            ...deliveredOrdersMatch,
            createdAt: { $gte: monthStart },
          },
        },
        { $group: { _id: null, total: { $sum: netOrderTotal } } },
      ]),

      Order.aggregate([
        {
          $match: {
            ...deliveredOrdersMatch,
            createdAt: { $gte: yearStart },
          },
        },
        { $group: { _id: null, total: { $sum: netOrderTotal } } },
      ]),

      Order.aggregate([
        { $match: deliveredOrdersMatch },
        { $group: { _id: null, total: { $sum: netOrderTotal } } },
      ]),
    ]);

    // Sale totals — exclude refunded sales from revenue (they have their own box)
    const notRefundedMatch = { paymentStatus: { $ne: "refunded" } };
    const netSaleTotal = "$amountPaid";

    const [saleToday, saleMonth, saleYear, saleTotal, refundedSalesStats] =
      await Promise.all([
        Sale.aggregate([
          {
            $match: {
              ...notRefundedMatch,
              saleDate: { $gte: todayStart },
            },
          },
          { $group: { _id: null, total: { $sum: netSaleTotal } } },
        ]),

        Sale.aggregate([
          {
            $match: {
              ...notRefundedMatch,
              saleDate: { $gte: monthStart },
            },
          },
          { $group: { _id: null, total: { $sum: netSaleTotal } } },
        ]),

        Sale.aggregate([
          {
            $match: {
              ...notRefundedMatch,
              saleDate: { $gte: yearStart },
            },
          },
          { $group: { _id: null, total: { $sum: netSaleTotal } } },
        ]),

        Sale.aggregate([
          { $match: notRefundedMatch },
          { $group: { _id: null, total: { $sum: netSaleTotal } } },
        ]),

        // ── Refunded Sales — separate dashboard box (all-time) ──
        Sale.aggregate([
          { $match: { paymentStatus: "refunded" } },
          {
            $group: {
              _id: null,
              total: { $sum: { $ifNull: ["$refundedAmount", 0] } },
              count: { $sum: 1 },
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

    // ── Refunded Orders — separate dashboard box (all-time) ──
    // Order model has no refundedAmount field — "refunded" is a status
    const [refundedOrdersStats] = await Order.aggregate([
      { $match: { status: "refunded" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
    ]);

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

    // ── Monthly sales graph (last 6 months) — Sale (non-refunded) +
    // delivered Orders combined, refunded excluded from both ──
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const [saleMonthlyGraph, orderMonthlyGraph] = await Promise.all([
      Sale.aggregate([
        {
          $match: {
            ...notRefundedMatch,
            saleDate: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$saleDate" },
              month: { $month: "$saleDate" },
            },
            sales: { $sum: netSaleTotal },
            count: { $sum: 1 },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            ...deliveredOrdersMatch,
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            sales: { $sum: netOrderTotal },
            count: { $sum: 1 },
          },
        },
      ]),
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

    const monthlyMap = new Map();
    for (const m of saleMonthlyGraph) {
      const key = `${m._id.year}-${m._id.month}`;
      monthlyMap.set(key, {
        year: m._id.year,
        month: m._id.month,
        sales: m.sales,
        orders: m.count,
      });
    }
    for (const m of orderMonthlyGraph) {
      const key = `${m._id.year}-${m._id.month}`;
      const existing = monthlyMap.get(key);
      if (existing) {
        existing.sales += m.sales;
        existing.orders += m.count;
      } else {
        monthlyMap.set(key, {
          year: m._id.year,
          month: m._id.month,
          sales: m.sales,
          orders: m.count,
        });
      }
    }

    const salesChartData = Array.from(monthlyMap.values())
      .sort((a, b) => a.year - b.year || a.month - b.month)
      .map((m) => ({
        month: monthNames[m.month - 1],
        sales: m.sales,
        orders: m.orders,
      }));

    // ── Category wise sales — excludes refunded sales ───────────────
    const categoryWiseSales = await Sale.aggregate([
      { $match: notRefundedMatch },
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

    // ── Top selling products — Sale (non-refunded) + delivered Orders ──
    const [saleTopProducts, orderTopProducts] = await Promise.all([
      Sale.aggregate([
        { $match: notRefundedMatch },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            name: { $first: "$items.name" },
            totalQty: { $sum: "$items.quantity" },
            totalRevenue: { $sum: "$items.total" },
          },
        },
      ]),

      Order.aggregate([
        { $match: deliveredOrdersMatch },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            name: { $first: "$items.name" },
            totalQty: { $sum: "$items.quantity" },
            totalRevenue: { $sum: "$items.total" },
          },
        },
      ]),
    ]);

    const topProductsMap = new Map();
    for (const p of saleTopProducts) {
      const key = String(p._id);
      topProductsMap.set(key, {
        _id: p._id,
        name: p.name,
        totalQty: p.totalQty,
        totalRevenue: p.totalRevenue,
      });
    }
    for (const p of orderTopProducts) {
      const key = String(p._id);
      const existing = topProductsMap.get(key);
      if (existing) {
        existing.totalQty += p.totalQty;
        existing.totalRevenue += p.totalRevenue;
      } else {
        topProductsMap.set(key, {
          _id: p._id,
          name: p.name,
          totalQty: p.totalQty,
          totalRevenue: p.totalRevenue,
        });
      }
    }

    const topProducts = Array.from(topProductsMap.values())
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 5);

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

        // ── Separate refund boxes ──
        totalRefundedSales: refundedSalesStats[0]?.total || 0,
        refundedSalesCount: refundedSalesStats[0]?.count || 0,

        totalRefundedOrders: refundedOrdersStats?.total || 0,
        refundedOrdersCount: refundedOrdersStats?.count || 0,

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
