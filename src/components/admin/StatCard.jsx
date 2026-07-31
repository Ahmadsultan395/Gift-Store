import { cn } from "@/lib/utils";

export default function StatCard({
  label,
  value,
  exactValue,
  icon: Icon,
  color = "green",
  sub,
}) {
  const colors = {
    green: "bg-primary-50 text-primary-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    yellow: "bg-yellow-50 text-yellow-600",
    teal: "bg-teal-50 text-teal-600",
    pink: "bg-pink-50 text-pink-600",
  };

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>

          {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
        </div>

        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              colors[color],
            )}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      {exactValue && (
        <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
          {exactValue}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
}
