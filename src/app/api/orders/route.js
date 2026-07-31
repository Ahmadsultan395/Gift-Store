import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import { Coupon, Notification } from "@/models/index";
import { ok, created, fail, serverError } from "@/lib/apiResponse";

async function getCustomer() {
  const token = cookies().get("pansar_customer")?.value;
  const payload = token ? verifyToken(token) : null;
  return payload?.type === "customer" ? payload.id : null;
}

export async function GET() {
  try {
    const customerId = await getCustomer();
    if (!customerId) return fail("Login required", 401);
    await connectDB();
    const orders = await Order.find({ customer: customerId }).sort({
      createdAt: -1,
    });
    return ok(orders);
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      name,
      phone,
      address,
      city,
      notes,
      paymentMethod,
      items,
      couponCode,
    } = body;

    if (!name || !phone || !address || !city)
      return fail("Shipping info is required");
    if (!items?.length) return fail("Cart is empty");

    let subTotal = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product).select(
        "name sellingPrice stock images",
      );
      if (!product) return fail(`Product not found: ${item.product}`);
      if (product.stock < item.quantity)
        return fail(`"${product.name}" only has ${product.stock} in stock`);
      const total = product.sellingPrice * item.quantity;
      subTotal += total;
      enrichedItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0]?.url || "",
        quantity: item.quantity,
        price: product.sellingPrice,
        total,
      });
    }

    // Coupon
    let discount = 0;
    let usedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        status: "active",
      });
      if (!coupon) return fail("Invalid or expired coupon code");
      if (coupon.expiryDate < new Date()) return fail("Coupon has expired");
      if (coupon.usedCount >= coupon.usageLimit)
        return fail("Coupon usage limit reached");
      discount =
        coupon.type === "percentage"
          ? Math.min(
              (subTotal * coupon.value) / 100,
              coupon.maxDiscount || Infinity,
            )
          : coupon.value;
      usedCoupon = coupon;
    }

    const deliveryCharges = 150; // flat for now
    const grandTotal = subTotal - discount + deliveryCharges;
    const orderNumber = `ORD-${Date.now()}`;

    // Get customer id if logged in
    const custId = await getCustomer();

    const order = await Order.create({
      orderNumber,
      customer: custId || undefined,
      items: enrichedItems,
      shippingInfo: { name, phone, address, city, notes },

      subTotal,
      deliveryCharges,
      discount,
      couponCode: couponCode || undefined,
      grandTotal,

      paymentMethod: paymentMethod || "cod",

      status: "pending",

      stockDeducted: false,
      stockRestored: false,

      statusHistory: [
        {
          status: "pending",
          changedAt: new Date(),
        },
      ],
    });
    // Update coupon usage
    if (usedCoupon)
      await Coupon.findByIdAndUpdate(usedCoupon._id, {
        $inc: { usedCount: 1 },
      });

    // Update customer stats
    if (custId)
      await Customer.findByIdAndUpdate(custId, { $inc: { totalOrders: 1 } });

    // New order notification for admin
    await Notification.create({
      type: "new_order",
      title: "New Order Received",
      message: `Order ${orderNumber} placed by ${name}`,
      relatedId: order._id,
    });

    return created({ order, orderNumber }, "Order placed successfully!");
  } catch (e) {
    return serverError(e);
  }
}
