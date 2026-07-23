import connectDB from "@/lib/db";
import Sale from "@/models/Sale";
import Customer from "@/models/Customer";
import { ok, notFound, fail, serverError } from "@/lib/apiResponse";

// GET single sale
export async function GET(_, { params }) {
  try {
    await connectDB();
    const sale = await Sale.findById(params.id)
      .populate("customer", "name phone")
      .populate("cashier",  "name");
    if (!sale) return notFound("Sale not found");
    return ok(sale);
  } catch (e) { return serverError(e); }
}
