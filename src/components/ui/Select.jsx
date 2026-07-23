import { cn } from "@/lib/utils";

export default function Select({
  label,
  error,
  className,
  id,
  options = [],
  placeholder,
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
      <select
        id={id}
        className={cn(
          "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition-colors bg-white",
          "focus:border-green-600 focus:ring-1 focus:ring-green-600",
          error && "border-red-500",
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
