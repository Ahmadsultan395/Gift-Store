import Link from "next/link";

export function SectionTitle({ title, subtitle, viewAll }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-primary">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {viewAll && (
        <Link
          href={viewAll}
          className="text-sm font-medium text-primary hover:underline"
        >
          View All →
        </Link>
      )}
    </div>
  );
}
