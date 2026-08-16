import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { ok, fail, notFound, serverError } from "@/lib/apiResponse";

import slugify from "slugify";
import { deleteImage } from "@/lib/cloudinaryDelete";

export async function GET(_, { params }) {
  try {
    await connectDB();

    const product = await Product.findById(params.id)
      .populate("category", "name slug gender")
      .populate("brand", "name");

    if (!product) {
      return notFound("Product not found");
    }

    return ok(product);
  } catch (e) {
    console.error(e);

    return serverError(e);
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const body = await request.json();

    const product = await Product.findById(params.id);

    if (!product) {
      return notFound("Product not found");
    }

    // SKU check
    if (body.sku && body.sku !== product.sku) {
      const skuExists = await Product.findOne({
        sku: body.sku,
        _id: {
          $ne: params.id,
        },
      });

      if (skuExists) {
        return fail("SKU already in use by another product");
      }
    }

    // slug update
    if (body.name && body.name !== product.name) {
      let slug = slugify(body.name, {
        lower: true,
        strict: true,
      });

      const slugExists = await Product.findOne({
        slug,
        _id: {
          $ne: params.id,
        },
      });

      if (slugExists) {
        slug = `${slug}-${Date.now()}`;
      }

      body.slug = slug;
    }

    // discount update

    const sellingPrice = body.sellingPrice ?? product.sellingPrice;

    const oldPrice = body.oldPrice ?? product.oldPrice;

    if (oldPrice && oldPrice > sellingPrice) {
      body.discountPercent = Math.round(
        ((oldPrice - sellingPrice) / oldPrice) * 100,
      );
    }

    // PRODUCT IMAGES UPDATE

    if (body.images && Array.isArray(body.images)) {
      const oldImages = product.images || [];

      const newIds = body.images.map((img) => img.publicId);

      for (const oldImg of oldImages) {
        if (oldImg?.publicId && !newIds.includes(oldImg.publicId)) {
          await deleteImage(oldImg.publicId);
        }
      }
    }

    Object.assign(product, body);

    await product.save();

    await product.populate([
      { path: "category", select: "name slug gender" },
      { path: "brand" },
    ]);

    return ok(product, "Product updated successfully");
  } catch (e) {
    console.error(e);

    return serverError(e);
  }
}

export async function DELETE(_, { params }) {
  try {
    await connectDB();

    const product = await Product.findById(params.id);

    if (!product) {
      return notFound("Product not found");
    }

    // delete all product images

    for (const img of product.images || []) {
      if (img?.publicId) {
        await deleteImage(img.publicId);
      }
    }

    await Product.findByIdAndDelete(params.id);

    return ok(null, "Product deleted");
  } catch (e) {
    console.error(e);

    return serverError(e);
  }
}
