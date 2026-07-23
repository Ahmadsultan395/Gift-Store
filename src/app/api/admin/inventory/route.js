import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { StockHistory } from "@/models/index";
import { ok, serverError } from "@/lib/apiResponse";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "all";

    let query = {};
    if (view === "low")
      query = {
        $expr: {
          $and: [
            { $gt: ["$stock", 0] },
            { $lte: ["$stock", "$lowStockThreshold"] },
          ],
        },
      };
    if (view === "out") query = { stock: { $lte: 0 } };
    if (view === "expired") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      query = {
        expiryDate: { $lt: today },
      };
    }
    if (view === "near")
      query = {
        expiryDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      };

    const products = await Product.find(query)
      .populate("category", "name")
      .sort({ stock: 1 })
      .select(
        "name sku stock unit lowStockThreshold expiryDate category images status",
      )
      .lean();

    const [counts] = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          inStock: {
            $sum: { $cond: [{ $gt: ["$stock", "$lowStockThreshold"] }, 1, 0] },
          },
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
          outOfStock: { $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] } },
          expired: {
            $sum: {
              $cond: [
                {
                  $lt: ["$expiryDate", new Date()],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    return ok({ products, counts: counts || {} });
  } catch (e) {
    return serverError(e);
  }
}
