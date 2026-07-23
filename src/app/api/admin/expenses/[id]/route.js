import connectDB from "@/lib/db";
import { Expense } from "@/models/index";
import { ok, notFound, serverError } from "@/lib/apiResponse";

export async function PUT(request,{ params }) {
  try {
    await connectDB();
    const body = await request.json();
    const e    = await Expense.findByIdAndUpdate(params.id, body, { new:true });
    if (!e) return notFound("Expense not found");
    return ok(e,"Updated");
  } catch(e){ return serverError(e); }
}

export async function DELETE(_,{ params }) {
  try {
    await connectDB();
    await Expense.findByIdAndDelete(params.id);
    return ok(null,"Expense deleted");
  } catch(e){ return serverError(e); }
}
