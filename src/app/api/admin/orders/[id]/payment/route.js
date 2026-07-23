import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { ok, notFound, fail, serverError } from "@/lib/apiResponse";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { amountPaid, note } = await request.json();
    if (amountPaid === undefined) return fail("amountPaid is required");

    const order = await Order.findById(params.id);
    if (!order) return notFound("Order not found");

    order.paymentStatus = Number(amountPaid) >= order.grandTotal ? "paid" : Number(amountPaid) > 0 ? "partial" : "pending";
    if (note) order.statusHistory.push({ status: order.status, note: `Payment: PKR ${amountPaid} received`, changedAt: new Date() });
    await order.save();

    return ok(order, `Payment status updated to ${order.paymentStatus}`);
  } catch (e) { return serverError(e); }
}
