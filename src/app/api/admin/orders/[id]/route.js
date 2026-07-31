import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { ok, notFound, serverError, fail } from "@/lib/apiResponse";

const FORWARD_STATUSES = ["confirmed", "packed", "shipped", "delivered"];
const BACK_STATUSES = ["pending", "cancelled", "refunded"];

// GET SINGLE ORDER
export async function GET(request, { params }) {
  try {
    await connectDB();

    const order = await Order.findById(params.id).populate(
      "customer",
      "name phone email",
    );

    if (!order) {
      return notFound("Order not found");
    }

    return ok(order);
  } catch (e) {
    console.log("GET ORDER ERROR:", e);
    return serverError(e);
  }
}

// UPDATE ORDER STATUS
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const body = await request.json();
    const { status, note } = body;

    if (!status) {
      return fail("Status is required");
    }

    const order = await Order.findById(params.id);
    if (!order) {
      return notFound("Order not found");
    }

    const oldStatus = order.status;

    // ===============================
    // STOCK MINUS
    // Fires the FIRST time the order enters ANY forward status
    // (confirmed / packed / shipped / delivered) — not just "confirmed".
    // Only runs if stock isn't already deducted.
    // ===============================
    if (FORWARD_STATUSES.includes(status) && !order.stockDeducted) {
      for (const item of order.items) {
        const product = await Product.findById(item.product);

        if (!product) {
          return fail(`Product not found ${item.name}`);
        }

        if (product.stock < item.quantity) {
          return fail(`${product.name} stock not available`);
        }

        product.stock -= item.quantity;
        await product.save();
      }

      order.stockDeducted = true;
    }

    // ===============================
    // STOCK RESTORE
    // Fires when the order enters ANY back status
    // (pending / cancelled / refunded) — only if stock is currently deducted.
    // ===============================
    if (BACK_STATUSES.includes(status) && order.stockDeducted) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }

      order.stockDeducted = false;
    }

    // ── Refund bookkeeping (only meaningful for "refunded") ──
    if (status === "refunded") {
      order.paymentStatus = "refunded";
    }

    // UPDATE STATUS
    order.status = status;
    order.statusHistory.push({
      status,
      note: note || `Status changed from ${oldStatus} to ${status}`,
      changedAt: new Date(),
    });

    await order.save();

    return ok(order, `Order status updated to ${status}`);
  } catch (e) {
    console.log("UPDATE ORDER ERROR:", e);
    return serverError(e);
  }
}
