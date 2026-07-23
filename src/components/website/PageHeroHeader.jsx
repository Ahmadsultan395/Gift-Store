"use client";

/**
 * PageHeroHeader
 * ---------------------------------------------------------------------
 * The one shared "hero" header used across every inner page (About,
 * Categories, Wishlist, Products, Account, Privacy, Terms, Return
 * Policy) so the whole site reads as one product instead of a set of
 * pages each with their own color/shape language.
 *
 * Visual language is inherited directly from the homepage HeroSlider:
 *  - deep forest green gradient background (#0B3D2E -> #134E3A)
 *  - lime accent (#A8E063) for eyebrow badges / highlights
 *  - orange accent (#FF7A3D) for primary actions
 *  - soft wave silhouette along the bottom edge
 *
 * Usage:
 *  <PageHeroHeader
 *    eyebrow="Our Story"
 *    icon="🛒"
 *    title="About Pansar Store"
 *    subtitle="Fresh groceries, delivered with care."
 *    stat={{ value: "500+", label: "Products" }}
 *  />
 */
export default function PageHeroHeader({
  eyebrow,
  icon,
  title,
  subtitle,
  stats = [],
  compact = false,
  children,
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-600/90 to-primary-600/80">
      {/* ambient glows — same treatment as the homepage hero */}
      <div className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full bg-primary-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-[#FF7A3D]/10 blur-3xl" />

      {/* subtle dot texture, matches homepage hero */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div
        className={`relative mx-auto max-w-5xl px-6 text-center ${
          compact ? "py-14 md:py-16" : "py-20 md:py-24"
        }`}
      >
        {icon && (
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-3xl backdrop-blur-sm ring-1 ring-white/15 md:h-20 md:w-20 md:text-4xl">
            {icon}
          </div>
        )}

        {eyebrow && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-300/40 bg-primary-300/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#C8F08A] backdrop-blur-sm">
            {eyebrow}
          </span>
        )}

        <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-lg">
            {subtitle}
          </p>
        )}

        {children && (
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {children}
          </div>
        )}

        {stats.length > 0 && (
          <div className="mx-auto mt-10 flex max-w-lg flex-wrap justify-center gap-6 border-t border-white/10 pt-8">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <p className="text-xl font-extrabold text-primary-300 md:text-2xl">
                  {s.value}
                </p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-white/60">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* wave edge — identical curve family to the homepage hero */}
      <div className="absolute inset-x-0 bottom-0 h-12 md:h-16">
        <svg
          className="absolute -left-[10%] bottom-0 h-full w-[120%]"
          viewBox="0 0 1200 140"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C150,130 300,-10 450,60 C600,130 750,-10 900,60 C1000,105 1100,20 1200,70 L1200,140 L0,140 Z"
            className="fill-white"
            opacity="1"
          />
          <path
            d="M0,90 C180,140 340,30 500,85 C660,140 820,20 980,80 C1060,110 1140,50 1200,95 L1200,140 L0,140 Z"
            className="fill-white"
            opacity="0.45"
          />
        </svg>
      </div>
    </section>
  );
}
