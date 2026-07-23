import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { Notification } from "@/models/index";
import { ok, notFound, fail, serverError } from "@/lib/apiResponse";
import { decreaseStockFromOrder } from "@/lib/stock";

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

export async function GET(_, { params }) {
  try {
    await connectDB();
    const order = await Order.findById(params.id)
      .populate("customer", "name phone email")
      .populate("items.product", "name sku images");
    if (!order) return notFound("Order not found");
    return ok(order);
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { status, note } = await request.json();
    if (!VALID_STATUSES.includes(status)) return fail("Invalid status");

    const order = await Order.findById(params.id);
    if (!order) return notFound("Order not found");

    const prevStatus = order.status;
    order.status = status;
    order.statusHistory.push({ status, note, changedAt: new Date() });

    // When confirmed → decrease stock
    if (status === "confirmed" && prevStatus === "pending") {
      const userId = request.headers.get("x-user-id");
      try {
        await decreaseStockFromOrder(order, userId);
      } catch (stockErr) {
        return fail(`Stock error: ${stockErr.message}`);
      }
    }

    await order.save();
    return ok(order, `Order status updated to ${status}`);
  } catch (e) {
    return serverError(e);
  }
}
