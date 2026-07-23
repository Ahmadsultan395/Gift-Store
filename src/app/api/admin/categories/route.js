import connectDB from "@/lib/db";
import Category from "@/models/Category";
import { ok, created, fail, serverError } from "@/lib/apiResponse";
import slugify from "slugify";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find()
      .populate("parent", "name")
      .sort({ sortOrder: 1, name: 1 });
    return ok(categories);
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, parent, status, image } = body;
    if (!name) return fail("Category name is required");

    await connectDB();
    const slug = slugify(name, { lower: true, strict: true });
    const exists = await Category.findOne({ slug });
    if (exists) return fail("Category with this name already exists");

    const category = await Category.create({
      name,
      slug,
      description,
      parent: parent || null,
      image,
      status: status || "active",
    });
    return created(category);
  } catch (e) {
    return serverError(e);
  }
}
