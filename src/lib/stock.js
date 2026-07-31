import Product from "@/models/Product";
import { StockHistory, Notification } from "@/models/index";

/**
 * Centralized stock mutation helper.
 * Every purchase, sale, order, adjustment, damage, or return MUST go through
 * this function so that StockHistory stays accurate and notifications fire
 * automatically for low/out-of-stock products.
 *
 * @param {Object} params
 * @param {string} params.productId
 * @param {number} params.quantityChange - positive to increase stock, negative to decrease
 * @param {"purchase"|"sale"|"adjustment"|"damaged"|"returned"|"order"} params.type
 * @param {string} [params.reference] - invoice/order number
 * @param {string} [params.note]
 * @param {string} [params.userId]
 */
export async function adjustStock({
  productId,
  quantityChange,
  type,
  reference,
  note,
  userId,
}) {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found for stock adjustment");

  const newStock = product.stock + quantityChange;
  if (newStock < 0) {
    throw new Error(
      `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${-quantityChange}`,
    );
  }

  product.stock = newStock;
  await product.save();

  await StockHistory.create({
    product: product._id,
    type,
    quantityChange,
    stockAfter: newStock,
    reference,
    note,
    createdBy: userId || undefined,
  });

  // Auto notifications
  if (newStock === 0) {
    await Notification.create({
      type: "out_of_stock",
      title: "Product out of stock",
      message: `${product.name} is now out of stock.`,
      relatedId: product._id,
    });
  } else if (newStock <= product.lowStockThreshold) {
    await Notification.create({
      type: "low_stock",
      title: "Low stock alert",
      message: `${product.name} has only ${newStock} units left.`,
      relatedId: product._id,
    });
  }

  return product;
}

/**
 * Increases stock for every item in a purchase (called after a Purchase is created).
 */
export async function increaseStockFromPurchase(purchase, userId) {
  for (const item of purchase.items) {
    await adjustStock({
      productId: item.product,
      quantityChange: item.quantity,
      type: "purchase",
      reference: purchase.invoiceNumber,
      note: "Stock added via purchase",
      userId,
    });
  }
}

/**
 * Decreases stock for every item in a sale (called after a Sale/POS transaction is created).
 */
export async function decreaseStockFromSale(sale, userId) {
  for (const item of sale.items) {
    await adjustStock({
      productId: item.product,
      quantityChange: -item.quantity,
      type: "sale",
      reference: sale.invoiceNumber,
      note: "Stock removed via POS sale",
      userId,
    });
  }
}

/**
 * Decreases stock for every item in a confirmed website order.
 */
export async function decreaseStockFromOrder(order, userId) {
  for (const item of order.items) {
    await adjustStock({
      productId: item.product,
      quantityChange: -item.quantity,
      type: "order",
      reference: order.orderNumber,
      note: "Stock removed via website order",
      userId,
    });
  }
}
