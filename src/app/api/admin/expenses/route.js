import connectDB from "@/lib/db";
import { Expense } from "@/models/index";
import { ok, created, fail, notFound, serverError } from "@/lib/apiResponse";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page  = parseInt(searchParams.get("page")||"1");
    const limit = parseInt(searchParams.get("limit")||"20");
    const from  = searchParams.get("from")||"";
    const to    = searchParams.get("to")||"";
    const cat   = searchParams.get("category")||"";

    const query = {};
    if (cat) query.category = cat;
    if (from||to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to)   query.date.$lte = new Date(to+"T23:59:59");
    }

    const total    = await Expense.countDocuments(query);
    const expenses = await Expense.find(query).sort({ date:-1 }).skip((page-1)*limit).limit(limit);

    const [stats] = await Expense.aggregate([
      { $match: query },
      { $group:{ _id:null, total:{$sum:"$amount"} } }
    ]);

    return ok({ expenses, totalAmount:stats?.total||0, pagination:{ total,page,limit,pages:Math.ceil(total/limit) } });
  } catch(e){ return serverError(e); }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    if (!body.title||!body.amount) return fail("Title and amount are required");
    const userId  = request.headers.get("x-user-id");
    const expense = await Expense.create({ ...body, createdBy:userId||undefined });
    return created(expense);
  } catch(e){ return serverError(e); }
}
