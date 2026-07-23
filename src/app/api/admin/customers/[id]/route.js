import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import { ok, notFound, serverError } from "@/lib/apiResponse";

export async function GET(_,{ params }) {
  try {
    await connectDB();
    const customer = await Customer.findById(params.id);
    if (!customer) return notFound("Customer not found");
    const orders   = await Order.find({ customer:params.id }).sort({ createdAt:-1 }).limit(10);
    return ok({ customer, orders });
  } catch(e){ return serverError(e); }
}

export async function PUT(request,{ params }) {
  try {
    await connectDB();
    const body = await request.json();
    const c    = await Customer.findByIdAndUpdate(params.id, body, { new:true });
    if (!c) return notFound("Customer not found");
    return ok(c,"Customer updated");
  } catch(e){ return serverError(e); }
}

export async function DELETE(_,{ params }) {
  try {
    await connectDB();
    await Customer.findByIdAndDelete(params.id);
    return ok(null,"Customer deleted");
  } catch(e){ return serverError(e); }
}
