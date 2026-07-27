import connectDB from "@/lib/db";
import Category from "@/models/Category";
import { ok, fail, notFound, serverError } from "@/lib/apiResponse";
import slugify from "slugify";
import { deleteModelImage, updateImage } from "@/lib/cloudinaryDelete";

export async function GET(_, { params }) {
  try {
    await connectDB();
    const oldCat = await updateImage(Category, params.id, image, "image");

    if (!oldCat) return notFound("Category not found");

    const cat = await Category.findById(params.id).populate("parent", "name");
    if (!cat) return notFound("Category not found");
    return ok(cat);
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { name, description, parent, status, image } = body;
    await connectDB();

    const oldCat = await deleteModelImage(Category, params.id, "image");

    if (!oldCat) return notFound("Category not found");
    const cat = await Category.findById(params.id);
    if (!cat) return notFound("Category not found");

    if (name) {
      cat.name = name;
      cat.slug = slugify(name, { lower: true, strict: true });
    }
    if (description !== undefined) cat.description = description;
    if (parent !== undefined) cat.parent = parent || null;
    if (status) cat.status = status;
    if (image) cat.image = image;

    await cat.save();
    return ok(cat, "Category updated");
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_, { params }) {
  try {
    await connectDB();
    const cat = await Category.findByIdAndDelete(params.id);
    if (!cat) return notFound("Category not found");
    return ok(null, "Category deleted");
  } catch (e) {
    return serverError(e);
  }
}
