import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  description: z.string().optional(),
  purchasePrice: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative(),
  oldPrice: z.number().nonnegative().optional(),
  discountPrice: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative(),
  unit: z.enum(["kg", "g", "litre", "ml", "pcs", "dozen", "bag", "box"]).optional(),
  weight: z.string().optional(),
  expiryDate: z.string().optional(),
  status: z.enum(["active", "inactive", "draft"]).optional(),
  isFeatured: z.boolean().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  description: z.string().optional(),
  parent: z.string().optional().nullable(),
});

export const brandSchema = z.object({
  name: z.string().min(2, "Brand name is required"),
});

export const customerRegisterSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const checkoutSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(7),
  address: z.string().min(5),
  city: z.string().min(2),
  notes: z.string().optional(),
  paymentMethod: z.enum(["cod", "bank_transfer"]),
  items: z
    .array(
      z.object({
        product: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Cart cannot be empty"),
  couponCode: z.string().optional(),
});

export const purchaseSchema = z.object({
  supplier: z.string().min(1, "Supplier is required"),
  invoiceNumber: z.string().min(1),
  items: z
    .array(
      z.object({
        product: z.string(),
        quantity: z.number().int().positive(),
        purchasePrice: z.number().nonnegative(),
        tax: z.number().nonnegative().optional(),
        discount: z.number().nonnegative().optional(),
      })
    )
    .min(1, "At least one item is required"),
  tax: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  amountPaid: z.number().nonnegative().optional(),
  purchaseDate: z.string().optional(),
});

export const saleSchema = z.object({
  customer: z.string().optional(),
  items: z
    .array(
      z.object({
        product: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().nonnegative(),
        discount: z.number().nonnegative().optional(),
      })
    )
    .min(1, "Cart cannot be empty"),
  tax: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  amountPaid: z.number().nonnegative(),
  paymentMethod: z.enum(["cash", "card", "bank_transfer", "cod"]).optional(),
});

/**
 * Helper to run a zod schema and return a uniform {success, data, errors} shape.
 */
export function validate(schema, payload) {
  const result = schema.safeParse(payload);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }
  return { success: true, data: result.data };
}
