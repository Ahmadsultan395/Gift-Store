import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import Sale from "@/models/Sale";
import { ok, created, fail, serverError } from "@/lib/apiResponse";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const query = {};
    if (search)
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search } },
        { email: { $regex: search, $options: "i" } },
      ];

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const ids = customers.map((c) => c._id);

    // ── Orders (website) aggregated per customer ─────────────────
    const orderAgg = await Order.aggregate([
      { $match: { customer: { $in: ids } } },
      {
        $group: {
          _id: "$customer",
          ordersCount: { $sum: 1 },
          ordersSpending: { $sum: "$grandTotal" },
        },
      },
    ]);
    const orderMap = Object.fromEntries(
      orderAgg.map((o) => [String(o._id), o]),
    );

    // ── POS sales aggregated per customer ─────────────────────────
    const saleAgg = await Sale.aggregate([
      { $match: { customer: { $in: ids } } },
      {
        $group: {
          _id: "$customer",
          posCount: { $sum: 1 },
          posSpending: { $sum: "$grandTotal" },
        },
      },
    ]);
    const saleMap = Object.fromEntries(saleAgg.map((s) => [String(s._id), s]));

    const enriched = customers.map((c) => {
      const o = orderMap[String(c._id)];
      const s = saleMap[String(c._id)];
      return {
        ...c,
        ordersCount: o?.ordersCount || 0,
        ordersSpending: o?.ordersSpending || 0,
        posCount: s?.posCount || 0,
        posSpending: s?.posSpending || 0,
      };
    });

    return ok({
      customers: enriched,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    if (!body.name || !body.phone) return fail("Name and phone are required");
    const customer = await Customer.create(body);
    return created(customer);
  } catch (e) {
    return serverError(e);
  }
}
