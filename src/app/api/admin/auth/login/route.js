import connectDB from "@/lib/db";
import User from "@/models/User";
import { comparePassword, signToken, buildAuthCookie } from "@/lib/auth";
import { ok, fail, serverError } from "@/lib/apiResponse";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return fail("Email and password are required", 422);
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user || !user.isActive) {
      return fail("Invalid email or password", 401);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return fail("Invalid email or password", 401);
    }

    // update last login
    user.lastLogin = new Date();
    await user.save();

    const token = signToken({ id: user._id.toString(), role: user.role, name: user.name });

    const response = ok(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      },
      "Login successful"
    );
    response.headers.set("Set-Cookie", buildAuthCookie(token));
    return response;
  } catch (error) {
    return serverError(error);
  }
}
