import connectDB from "@/lib/db";
import Brand from "@/models/Brand";
import { ok, created, fail, notFound, serverError } from "@/lib/apiResponse";
import slugify from "slugify";

export async function GET() {
  try {
    await connectDB();
    const brands = await Brand.find().sort({ name: 1 });
    return ok(brands);
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(request) {
  try {
    const { name, logo, status } = await request.json();
    if (!name) return fail("Brand name is required");
    await connectDB();
    const slug = slugify(name, { lower: true, strict: true });
    const exists = await Brand.findOne({ slug });
    if (exists) return fail("Brand already exists");
    const brand = await Brand.create({
      name,
      slug,
      logo,
      status: status || "active",
    });
    return created(brand);
  } catch (e) {
    return serverError(e);
  }
}
