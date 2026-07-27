import connectDB from "@/lib/db";
import Brand from "@/models/Brand";
import { ok, notFound, serverError } from "@/lib/apiResponse";
import slugify from "slugify";
import { deleteModelImage, updateImage } from "@/lib/cloudinaryDelete";

export async function PUT(request, { params }) {
  try {
    const { name, status, logo } = await request.json();
    await connectDB();
    const oldBrand = await updateImage(Brand, params.id, logo);
    if (!oldBrand) return notFound("Brand not found");

    const brand = await Brand.findById(params.id);
    if (!brand) return notFound("Brand not found");
    if (name) {
      brand.name = name;
      brand.slug = slugify(name, { lower: true, strict: true });
    }
    if (status) brand.status = status;
    if (logo) brand.logo = logo;
    await brand.save();
    return ok(brand, "Brand updated");
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_, { params }) {
  try {
    await connectDB();

    const oldBrand = await deleteModelImage(Brand, params.id);

    if (!oldBrand) return notFound("Brand not found");

    const brand = await Brand.findByIdAndDelete(params.id);
    if (!brand) return notFound("Brand not found");
    return ok(null, "Brand deleted");
  } catch (e) {
    return serverError(e);
  }
}
