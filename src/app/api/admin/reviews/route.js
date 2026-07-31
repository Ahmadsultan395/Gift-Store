import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import { ok, serverError } from "@/lib/apiResponse";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const match = {};

    if (status) {
      match.status = status;
    }

    const pipeline = [
      {
        $match: match,
      },

      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },

      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customer",
        },
      },

      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            {
              "product.name": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "customer.name": {
                $regex: search,
                $options: "i",
              },
            },
            {
              title: {
                $regex: search,
                $options: "i",
              },
            },
            {
              comment: {
                $regex: search,
                $options: "i",
              },
            },
          ],
        },
      });
    }

    pipeline.push(
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    );

    const reviews = await Review.aggregate(pipeline);

    const total = await Review.countDocuments(match);

    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      Review.countDocuments({ status: "pending" }),
      Review.countDocuments({ status: "approved" }),
      Review.countDocuments({ status: "rejected" }),
    ]);

    return ok({
      reviews,
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: pendingCount + approvedCount + rejectedCount,
      },
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    return serverError(e);
  }
}
