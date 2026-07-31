import { cn } from "@/lib/utils";

export default function Textarea({
  label,
  error,
  className,
  id,
  rows = 3,
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={cn(
          "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition-colors resize-none",
          "focus:border-primary-600 focus:ring-1 focus:ring-primary-600",
          error && "border-red-500",
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
