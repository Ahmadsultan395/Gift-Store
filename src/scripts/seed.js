/**
 * Seed script: creates the first Admin user and default store settings.
 * Run with: npm run seed
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "admin" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "Pansar Store" },
    currency: { type: String, default: "PKR" },
    taxPercent: { type: Number, default: 0 },
    shippingCharges: { type: Number, default: 0 },
  },
  { timestamps: true }
);

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not set in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);

  const email = process.env.ADMIN_EMAIL || "admin@pansarstore.com";
  const plainPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
  const name = process.env.ADMIN_NAME || "Super Admin";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`ℹ️  Admin user already exists: ${email}`);
  } else {
    const hashed = await bcrypt.hash(plainPassword, 10);
    await User.create({ name, email, password: hashed, role: "admin" });
    console.log(`✅ Admin user created -> email: ${email} | password: ${plainPassword}`);
  }

  const settingsExists = await Settings.findOne();
  if (!settingsExists) {
    await Settings.create({});
    console.log("✅ Default store settings created");
  } else {
    console.log("ℹ️  Store settings already exist");
  }

  await mongoose.disconnect();
  console.log("🌱 Seeding complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
