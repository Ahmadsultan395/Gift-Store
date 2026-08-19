"use client";
import { useState, useRef } from "react";
import {
  Upload,
  X,
  Loader2,
  Video as VideoIcon,
  PlayCircle,
} from "lucide-react";

/**
 * VideoUpload — Local Storage Version
 *
 * Mirrors ImageUpload exactly (same /api/admin/upload endpoint, same
 * response shape { success, data: { url, publicId } }, same folder
 * convention) — just restricted to video mime types.
 *
 * IMPORTANT: your /api/admin/upload route currently likely validates/
 * accepts only image mime types (since it was built for ImageUpload).
 * Make sure the backend route also allows video/mp4, video/webm, etc.
 * — otherwise the upload will be rejected server-side even though this
 * component sends it correctly.
 *
 * Props:
 *   value    → { url, publicId } current video
 *   onChange → callback({ url, publicId } | null)
 *   folder   → subfolder inside public/uploads/
 *   label    → field label string
 *   maxSizeMB → max file size in MB (default 25 — videos are heavy)
 */
export default function VideoUpload({
  value,
  onChange,
  folder = "banners",
  label = "Video (optional)",
  maxSizeMB = 25,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  async function uploadFile(file) {
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Only video files are allowed");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Max file size is ${maxSizeMB}MB`);
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
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    // reset input so same file can be re-selected
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
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

      {/* ── Current video preview ─────────────────────────────── */}
      {value?.url && (
        <div className="relative mb-3 max-w-md overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
          <video
            src={value.url}
            className="aspect-video w-full object-cover"
            muted
            playsInline
            controls
          />
          <button
            type="button"
            onClick={clear}
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white shadow hover:bg-red-600 transition-colors"
          >
            <X size={12} />
          </button>
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            <PlayCircle size={11} /> Video attached
          </div>
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
          accept="video/*"
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
              <p className="text-xs text-primary-500">
                Please wait, this may take a moment
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <VideoIcon size={22} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {value?.url ? "Replace video" : "Click to upload"} or drag &
                drop
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                MP4, WEBM — max {maxSizeMB} MB
              </p>
            </div>
          </>
        )}
      </div>

      <p className="mt-1.5 text-[11px] text-slate-400">
        Optional. If added, this plays in the hero slider once loaded — the
        image above is shown as the poster/fallback until then.
      </p>

      {/* ── Error ─────────────────────────────────────────────── */}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}
