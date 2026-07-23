import connectDB from "@/lib/db";
import { Coupon } from "@/models/index";
import { ok, notFound, serverError } from "@/lib/apiResponse";

export async function PUT(request,{ params }) {
  try {
    await connectDB();
    const body = await request.json();
    const c    = await Coupon.findByIdAndUpdate(params.id,body,{ new:true });
    if (!c) return notFound("Coupon not found");
    return ok(c,"Updated");
  } catch(e){ return serverError(e); }
}

export async function DELETE(_,{ params }) {
  try {
    await connectDB();
    await Coupon.findByIdAndDelete(params.id);
    return ok(null,"Coupon deleted");
  } catch(e){ return serverError(e); }
}
