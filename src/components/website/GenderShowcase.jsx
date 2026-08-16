import Link from "next/link";
import {
  Watch,
  Gem,
  PartyPopper,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import ProductCard from "./ProductCard";

const GENDER_META = {
  Men: {
    icon: Watch,
    eyebrow: "For Him",
    title: "Men's Picks",
    tagline: "Watches, perfumes & sharp gift sets",
    variant: "carousel",
  },
  Women: {
    icon: Gem,
    eyebrow: "For Her",
    title: "Women's Picks",
    tagline: "Perfumes, jewellery boxes & more",
    variant: "elegant",
  },
  Kids: {
    icon: PartyPopper,
    eyebrow: "For Them",
    title: "Kids' Picks",
    tagline: "Fun gift boxes & little surprises",
    variant: "playful",
  },
};

function LoadingGrid({ count = 4, className = "" }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-square shrink-0 animate-pulse rounded-2xl bg-slate-50"
        />
      ))}
    </div>
  );
}

export default function GenderShowcase({ gender, products, loading }) {
  const meta = GENDER_META[gender] || GENDER_META.Men;
  const Icon = meta.icon;

  if (!loading && (!products || products.length === 0)) return null;

  // ── Men: dark horizontal-scroll carousel, sleek and minimal ──────────
  if (meta.variant === "carousel") {
    return (
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 p-6 sm:p-8">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="menDots"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <circle cx="7" cy="7" r="1.4" fill="#D4AF37" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#menDots)" />
        </svg>

        <div className="relative mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary-300/30 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-secondary-200">
              <Icon size={13} strokeWidth={2.5} />
              {meta.eyebrow}
            </span>
            <h2 className="mt-2 font-serif text-2xl italic text-white sm:text-3xl">
              {meta.title}
            </h2>
            <p className="mt-1 text-sm text-white/60">{meta.tagline}</p>
          </div>
          <Link
            href={`/products?gender=${gender}`}
            className="group hidden shrink-0 items-center gap-1 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-secondary-200 transition-colors hover:bg-white/5 sm:flex"
          >
            View All
            <ChevronRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {loading ? (
          <LoadingGrid
            count={5}
            className="relative flex gap-4 overflow-hidden"
          />
        ) : (
          <div className="relative flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {products.map((p) => (
              <div key={p._id} className="w-[42%] shrink-0 sm:w-[22%]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}

        <Link
          href={`/products?gender=${gender}`}
          className="relative mt-5 flex items-center justify-center gap-1 rounded-full border border-white/15 py-2.5 text-sm font-semibold text-secondary-200 sm:hidden"
        >
          View All Men's Products
          <ChevronRight size={15} />
        </Link>
      </section>
    );
  }

  // ── Women: elegant, airy, fewer per row, centered heading ────────────
  if (meta.variant === "elegant") {
    return (
      <section className="rounded-[28px] border border-primary-100 bg-gradient-to-b from-primary-50/50 to-white px-6 py-10 sm:px-10">
        <div className="mx-auto mb-9 max-w-lg text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary-600 ring-1 ring-primary-100">
            <Icon size={13} strokeWidth={2.5} />
            {meta.eyebrow}
          </span>
          <h2 className="mt-3 font-serif text-3xl italic tracking-tight text-slate-900">
            {meta.title}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{meta.tagline}</p>
        </div>

        {loading ? (
          <LoadingGrid
            count={3}
            className="grid grid-cols-2 gap-6 sm:grid-cols-3"
          />
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {products.slice(0, 6).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link
            href={`/products?gender=${gender}`}
            className="group inline-flex items-center gap-1.5 rounded-full border border-primary-300 px-6 py-2.5 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50"
          >
            View All Women's Products
            <ChevronRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </section>
    );
  }

  // ── Kids: playful, colorful, compact grid with alternating tilt ─────
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-secondary-50 via-white to-primary-50 px-6 py-9 sm:px-10">
      <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-secondary-300/20 blur-2xl" />
      <div className="pointer-events-none absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-primary-300/20 blur-2xl" />

      <div className="relative mb-6 flex items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary-700">
            <Icon size={13} strokeWidth={2.5} />
            {meta.eyebrow}
          </span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {meta.title} 🎉
          </h2>
          <p className="mt-1 text-sm text-slate-500">{meta.tagline}</p>
        </div>
        <Link
          href={`/products?gender=${gender}`}
          className="group hidden shrink-0 items-center gap-1 rounded-full bg-primary-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-800 sm:flex"
        >
          View All
          <ChevronRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      {loading ? (
        <LoadingGrid
          count={4}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        />
      ) : (
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          {products.map((p, i) => (
            <div
              key={p._id}
              className={`kids-card transition-transform duration-300 hover:!rotate-0 hover:scale-[1.03] ${
                i % 2 === 0 ? "rotate-[-1.5deg]" : "rotate-[1.5deg]"
              }`}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}

      <Link
        href={`/products?gender=${gender}`}
        className="relative mt-6 flex items-center justify-center gap-1 rounded-full bg-primary-700 py-2.5 text-sm font-semibold text-white sm:hidden"
      >
        View All Kids' Products
        <ChevronRight size={15} />
      </Link>
    </section>
  );
}
