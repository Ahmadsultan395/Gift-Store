import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { ok, fail, serverError } from "@/lib/apiResponse";

// Allowed image types
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB   = 5;

/**
 * Generates a unique filename: timestamp-randomhex.ext
 */
function uniqueFilename(originalName) {
  const ext       = path.extname(originalName).toLowerCase() || ".jpg";
  const timestamp = Date.now();
  const random    = Math.random().toString(36).slice(2, 8);
  return `${timestamp}-${random}${ext}`;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file     = formData.get("file");
    const folder   = formData.get("folder") || "general"; // products | categories | brands | banners | general

    // ── Validations ────────────────────────────────────────────────
    if (!file || typeof file === "string") {
      return fail("No file provided");
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return fail("Only JPG, PNG, WEBP and GIF images are allowed");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.byteLength > MAX_SIZE_MB * 1024 * 1024) {
      return fail(`File size must be under ${MAX_SIZE_MB}MB`);
    }

    // ── Build save path ────────────────────────────────────────────
    // public/uploads/{folder}/{filename}  →  served at /uploads/{folder}/{filename}
    const safeFolder  = folder.replace(/[^a-z0-9_-]/gi, ""); // sanitize
    const saveDir     = path.join(process.cwd(), "public", "uploads", safeFolder);
    const filename    = uniqueFilename(file.name || "image.jpg");
    const filePath    = path.join(saveDir, filename);
    const publicUrl   = `/uploads/${safeFolder}/${filename}`;

    // Create folder if it doesn't exist
    if (!existsSync(saveDir)) {
      await mkdir(saveDir, { recursive: true });
    }

    // ── Write file ──────────────────────────────────────────────────
    await writeFile(filePath, buffer);

    return ok(
      { url: publicUrl, publicId: publicUrl, filename },
      "Image uploaded successfully"
    );
  } catch (e) {
    console.error("Upload error:", e);
    return serverError(e);
  }
}
