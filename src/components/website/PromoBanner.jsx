import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function PromoBanner({
  eyebrow,
  title,
  subtitle,
  ctaLabel = "Shop Now",
  ctaHref = "/products",
  icon: Icon,
  reverse = false,
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 px-6 py-10 sm:px-10 ${
        reverse ? "sm:pr-14" : "sm:pl-14"
      }`}
    >
      {/* wrapping-paper dot texture, consistent with the hero */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={`promoDots-${reverse ? "r" : "l"}`}
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <circle cx="7" cy="7" r="1.4" fill="#D4AF37" />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#promoDots-${reverse ? "r" : "l"})`}
        />
      </svg>

      {/* draped ribbon corner accent, same language as the hero */}
      <div
        className={`pointer-events-none absolute -top-10 h-28 w-28 overflow-hidden ${
          reverse ? "-left-10" : "-right-10"
        }`}
      >
        <div className="absolute left-1/2 top-1/2 h-8 w-[150%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gradient-to-b from-secondary-300 via-secondary-400 to-secondary-500 shadow-[0_2px_8px_rgba(0,0,0,0.25)]" />
      </div>

      <div
        className={`relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between ${
          reverse ? "sm:flex-row-reverse" : ""
        }`}
      >
        <div className="max-w-md">
          {eyebrow && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-secondary-200">
              {eyebrow}
            </span>
          )}
          <h3 className="mt-2 font-serif text-2xl italic leading-tight text-white sm:text-3xl">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-2 text-sm font-medium text-white/70 sm:text-base">
              {subtitle}
            </p>
          )}

          <Link
            href={ctaHref}
            className="group mt-5 inline-flex items-center gap-2 rounded-full bg-secondary-400 px-6 py-3 text-sm font-bold text-primary-950 shadow-lg shadow-black/20 transition-all hover:bg-secondary-300 hover:-translate-y-0.5"
          >
            {ctaLabel}
            <ChevronRight
              size={16}
              strokeWidth={3}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {Icon && (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/10 backdrop-blur-sm sm:h-28 sm:w-28">
            <Icon size={44} className="text-secondary-200" strokeWidth={1.4} />
          </div>
        )}
      </div>
    </section>
  );
}
