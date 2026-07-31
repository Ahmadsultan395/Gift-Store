"use client";
import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

/**
 * ImageUpload — Local Storage Version
 *
 * Props:
 *   value    → { url, publicId } current image
 *   onChange → callback({ url, publicId })
 *   folder   → subfolder inside public/uploads/ (products|categories|brands|banners|general)
 *   label    → field label string
 *   aspect   → "square" | "banner" | "logo"
 *   multiple → if true, calls onChange for each file (parent handles array)
 */
export default function ImageUpload({
  value,
  onChange,
  folder = "general",
  label = "Upload Image",
  aspect = "square",
  multiple = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const previewClass =
    aspect === "banner"
      ? "aspect-video max-w-md"
      : aspect === "logo"
        ? "h-28 w-28"
        : "h-36 w-36";

  async function uploadFile(file) {
    if (!file) return;

    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowed.includes(file.type)) {
      setError("Only JPG, PNG, WEBP or GIF allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Max file size is 5MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Upload failed");
        return;
      }

      onChange({ url: data.data.url, publicId: data.data.publicId });
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (multiple) {
      for (const file of files) await uploadFile(file);
    } else {
      await uploadFile(files[0]);
    }
    // reset input so same file can be re-selected
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;
    if (multiple) {
      files.forEach(uploadFile);
    } else {
      uploadFile(files[0]);
    }
  }

  function clear(e) {
    e.stopPropagation();
    onChange(null);
    setError("");
  }

  return (
    <div className="w-full">
      {label && (
        <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p>
      )}

      {/* ── Current image preview ─────────────────────────────── */}
      {value?.url && (
        <div
          className={`relative mb-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 ${previewClass}`}
        >
          <img
            src={value.url}
            alt="Preview"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src = "/placeholder-image.png";
            }}
          />
          <button
            type="button"
            onClick={clear}
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white shadow hover:bg-red-600 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* ── Drop zone ─────────────────────────────────────────── */}
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className={`
          flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-all
          ${dragOver ? "border-primary-500 bg-primary-50 scale-[1.01]" : ""}
          ${uploading ? "border-primary-300 bg-primary-50 cursor-wait" : ""}
          ${!dragOver && !uploading ? "border-slate-200 hover:border-primary-400 hover:bg-primary-50" : ""}
        `}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          multiple={multiple}
          className="hidden"
          onChange={handleFileChange}
        />

        {uploading ? (
          <>
            <Loader2 size={30} className="animate-spin text-primary-600" />
            <div>
              <p className="text-sm font-semibold text-primary-700">
                Uploading...
              </p>
              <p className="text-xs text-primary-500">Please wait</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Upload size={22} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {value?.url ? "Replace image" : "Click to upload"} or drag &
                drop
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                JPG, PNG, WEBP, GIF — max 5 MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── Error ─────────────────────────────────────────────── */}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}
