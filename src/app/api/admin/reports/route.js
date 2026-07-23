import connectDB from "@/lib/db";
import Sale from "@/models/Sale";
import Purchase from "@/models/Purchase";
import Order from "@/models/Order";
import { Expense } from "@/models/index";
import Product from "@/models/Product";
import { ok, serverError } from "@/lib/apiResponse";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "daily";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    let startDate, endDate;
    const now = new Date();

    if (from && to) {
      startDate = new Date(from);
      endDate = new Date(to + "T23:59:59");
    } else {
      switch (type) {
        case "daily":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date();
          break;
        case "weekly":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          endDate = new Date();
          break;
        case "monthly":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date();
          break;
        case "yearly":
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date();
          break;
        default:
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date();
      }
    }

    // Sales
    const [salesStats] = await Sale.aggregate([
      { $match: { saleDate: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amountPaid" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Purchases
    const [purchaseStats] = await Purchase.aggregate([
      {
        $group: {
          _id: null,
          totalPurchases: {
            $sum: "$grandTotal",
          },
          totalPaid: {
            $sum: "$amountPaid",
          },
        },
      },
    ]);

    const totalPurchases = purchaseStats?.totalPurchases || 0;
    const totalPaid = purchaseStats?.totalPaid || 0;
    const totalDue = totalPurchases - totalPaid;

    // Orders (website)
    const [orderStats] = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$grandTotal" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Expenses
    const [expenseStats] = await Expense.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Daily breakdown for chart
    const dailySales = await Sale.aggregate([
      { $match: { saleDate: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
          sales: { $sum: "$amountPaid" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Category-wise
    const categoryReport = await Sale.aggregate([
      { $match: { saleDate: { $gte: startDate, $lte: endDate } } },
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
          qty: { $sum: "$items.quantity" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Top products
    const topProducts = await Sale.aggregate([
      { $match: { saleDate: { $gte: startDate, $lte: endDate } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          qty: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.total" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    // Low stock products
    const lowStock = await Product.find({
      $expr: {
        $and: [
          { $gt: ["$stock", 0] },
          { $lte: ["$stock", "$lowStockThreshold"] },
        ],
      },
    })
      .select("name sku stock lowStockThreshold unit")
      .limit(20);
    const outOfStock = await Product.find({ stock: { $lte: 0 } })
      .select("name sku stock unit")
      .limit(20);

    const totalRevenue = (salesStats?.total || 0) + (orderStats?.total || 0);
    const totalCost = purchaseStats?.totalPurchases || 0;
    const totalExpenses = expenseStats?.total || 0;
    const totalProfit = totalRevenue - totalCost - totalExpenses;

    return ok({
      period: { type, from: startDate, to: endDate },
      summary: {
        totalSales: salesStats?.total || 0,
        totalSalesTxn: salesStats?.count || 0,
        totalOrders: orderStats?.total || 0,
        totalOrdersTxn: orderStats?.count || 0,
        totalRevenue,
        totalPurchases,
        totalPaid,
        totalDue,
        totalExpenses,
        totalProfit,
      },
      dailySales,
      categoryReport,
      topProducts,
      inventory: { lowStock, outOfStock },
    });
  } catch (e) {
    return serverError(e);
  }
}
