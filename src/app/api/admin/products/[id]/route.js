import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { ok, fail, notFound, serverError } from "@/lib/apiResponse";
import slugify from "slugify";
import { deleteModelImage, updateImage } from "@/lib/cloudinaryDelete";

export async function GET(_, { params }) {
  try {
    await connectDB();
    const product = await Product.findById(params.id)
      .populate("category", "name slug")
      .populate("brand", "name");
    if (!product) return notFound("Product not found");
    return ok(product);
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();

    const product = await Product.findById(params.id);
    if (!product) return notFound("Product not found");

    // Cloudinary old product images delete
    if (body.images) {
      const oldImages = product.images || [];

      const newIds = body.images.map((img) => img.publicId);

      for (const img of oldImages) {
        if (img.publicId && !newIds.includes(img.publicId)) {
          await deleteImage(img.publicId);
        }
      }
    }

    // If SKU changed, check uniqueness
    if (body.sku && body.sku !== product.sku) {
      const skuExists = await Product.findOne({
        sku: body.sku,
        _id: { $ne: params.id },
      });
      if (skuExists) return fail("SKU already in use by another product");
    }

    // Recompute slug if name changed
    if (body.name && body.name !== product.name) {
      let slug = slugify(body.name, { lower: true, strict: true });
      const slugExists = await Product.findOne({
        slug,
        _id: { $ne: params.id },
      });
      if (slugExists) slug = `${slug}-${Date.now()}`;
      body.slug = slug;
    }

    // Recompute discount percent
    const sp = body.sellingPrice ?? product.sellingPrice;
    const op = body.oldPrice ?? product.oldPrice;
    if (op && op > sp) {
      body.discountPercent = Math.round(((op - sp) / op) * 100);
    }

    Object.assign(product, body);
    await product.save();
    await product.populate(["category", "brand"]);

    return ok(product, "Product updated successfully");
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_, { params }) {
  try {
    await connectDB();
    const oldProduct = await Product.findById(params.id);

    if (!oldProduct) return notFound("Product not found");

    for (const img of oldProduct.images || []) {
      if (img.publicId) {
        await deleteImage(img.publicId);
      }
    }

    const product = await Product.findByIdAndDelete(params.id);
    if (!product) return notFound("Product not found");
    return ok(null, "Product deleted");
  } catch (e) {
    return serverError(e);
  }
}
