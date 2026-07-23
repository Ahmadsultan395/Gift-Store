import { NextResponse } from "next/server";

export function ok(data, message = "Success", status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function created(data, message = "Created successfully") {
  return ok(data, message, 201);
}

export function fail(message = "Something went wrong", status = 400, errors = null) {
  return NextResponse.json({ success: false, message, errors }, { status });
}

export function notFound(message = "Resource not found") {
  return fail(message, 404);
}

export function unauthorized(message = "Unauthorized") {
  return fail(message, 401);
}

export function serverError(error) {
  console.error("API_ERROR:", error);
  return fail(error?.message || "Internal server error", 500);
}
