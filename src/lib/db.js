import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.warn("⚠️  MONGODB_URI not set — skipping DB connection");
    return null;
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => { console.log("✅ MongoDB connected"); return m; })
      .catch((err) => { cached.promise = null; throw err; });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
