import Link from "next/link";
import { Flame, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

export default function BestSellersStrip({ products, loading }) {
  if (!loading && (!products || products.length === 0)) return null;

  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-red-700">
            <Flame size={13} strokeWidth={2.5} />
            Most Loved
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Best Sellers
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            What everyone's gifting right now
          </p>
        </div>
        <Link
          href="/products?sort=popular"
          className="group hidden shrink-0 items-center gap-1 rounded-full border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50 sm:flex"
        >
          Browse All
          <ChevronRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square w-[42%] shrink-0 animate-pulse rounded-2xl bg-slate-50 sm:w-[19%]"
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {products.map((p, i) => (
            <div key={p._id} className="relative w-[42%] shrink-0 sm:w-[19%]">
              <span className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary-800 text-xs font-extrabold text-secondary-200 shadow-md">
                #{i + 1}
              </span>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}

      <Link
        href="/products?sort=popular"
        className="mt-5 flex items-center justify-center gap-1 rounded-full border border-primary-200 py-2.5 text-sm font-semibold text-primary-700 sm:hidden"
      >
        Browse All Best Sellers
        <ChevronRight size={15} />
      </Link>
    </section>
  );
}
