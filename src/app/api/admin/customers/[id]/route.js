import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import Sale from "@/models/Sale";
import { ok, notFound, serverError } from "@/lib/apiResponse";

export async function GET(_, { params }) {
  try {
    await connectDB();
    const customer = await Customer.findById(params.id);
    if (!customer) return notFound("Customer not found");

    const orders = await Order.find({ customer: params.id }).sort({
      createdAt: -1,
    });
    const sales = await Sale.find({ customer: params.id }).sort({
      saleDate: -1,
    });

    const deliveredOrders = orders.filter((o) => o.status === "delivered");
    const cancelledOrders = orders.filter((o) => o.status === "cancelled");

    const stats = {
      totalOrders: orders.length,
      deliveredOrdersCount: deliveredOrders.length,
      deliveredAmount: deliveredOrders.reduce(
        (s, o) => s + (o.grandTotal || 0),
        0,
      ),
      cancelledOrdersCount: cancelledOrders.length,
      totalOrdersAmount: orders.reduce((s, o) => s + (o.grandTotal || 0), 0),

      totalPosSales: sales.length,
      totalPosAmount: sales.reduce((s, sl) => s + (sl.grandTotal || 0), 0),
      totalPosPaid: sales.reduce((s, sl) => s + (sl.amountPaid || 0), 0),
      totalPosBalanceDue: sales.reduce((s, sl) => s + (sl.balanceDue || 0), 0),
    };

    return ok({ customer, orders, sales, stats });
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const c = await Customer.findByIdAndUpdate(params.id, body, {
      new: true,
    });
    if (!c) return notFound("Customer not found");
    return ok(c, "Customer updated");
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_, { params }) {
  try {
    await connectDB();
    await Customer.findByIdAndDelete(params.id);
    return ok(null, "Customer deleted");
  } catch (e) {
    return serverError(e);
  }
}
