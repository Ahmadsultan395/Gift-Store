import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import { ok, created, fail, serverError } from "@/lib/apiResponse";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page   = parseInt(searchParams.get("page")||"1");
    const limit  = parseInt(searchParams.get("limit")||"20");
    const search = searchParams.get("search")||"";

    const query = {};
    if (search) query.$or = [{ name:{$regex:search,$options:"i"} },{ phone:{$regex:search} },{ email:{$regex:search,$options:"i"} }];

    const total     = await Customer.countDocuments(query);
    const customers = await Customer.find(query).sort({ createdAt:-1 }).skip((page-1)*limit).limit(limit);

    return ok({ customers, pagination:{ total,page,limit,pages:Math.ceil(total/limit) } });
  } catch(e){ return serverError(e); }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    if (!body.name||!body.phone) return fail("Name and phone are required");
    const customer = await Customer.create(body);
    return created(customer);
  } catch(e){ return serverError(e); }
}
