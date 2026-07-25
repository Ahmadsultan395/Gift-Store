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
 *  - continuously animated flowing wave along the bottom edge
 *    (paths are built so the start and end y-values match exactly,
 *    so the tiled copies loop with zero seam/glitch)
 *  - soft floating dot particles for ambient texture
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
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-700 to-primary-700">
      {/* ambient glows — same treatment as the homepage hero */}
      <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-primary-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-[#FF7A3D]/10 blur-3xl" />

      {/* floating dot particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="float-dot float-dot-1" />
        <span className="float-dot float-dot-2" />
        <span className="float-dot float-dot-3" />
        <span className="float-dot float-dot-4" />
        <span className="float-dot float-dot-5" />
        <span className="float-dot float-dot-6" />
        <span className="float-dot float-dot-7" />
        <span className="float-dot float-dot-8" />
      </div>

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

      {/* wave edge — continuously flowing/waving animation, seamless loop */}
      <div className="absolute inset-x-0 bottom-0 h-12 overflow-hidden md:h-16">
        <svg
          className="wave-layer wave-layer-back absolute bottom-0 left-0 h-full w-[200%]"
          viewBox="0 0 2400 140"
          preserveAspectRatio="none"
        >
          {/*
            Back layer — one period is 1200 units wide.
            Start point (0,90) and end point (1200,90) share the exact
            same y-value, so the second copy (shifted +1200) continues
            with zero jump. That's what removes the seam glitch.
          */}
          <path
            d="M0,90 C130,60 270,60 400,90 C530,120 670,120 800,90 C930,60 1070,60 1200,90
               L1200,140 L0,140 Z
               M1200,90 C1330,60 1470,60 1600,90 C1730,120 1870,120 2000,90 C2130,60 2270,60 2400,90
               L2400,140 L1200,140 Z"
            className="fill-white"
            opacity="0.45"
          />
        </svg>
        <svg
          className="wave-layer wave-layer-front absolute bottom-0 left-0 h-full w-[200%]"
          viewBox="0 0 2400 140"
          preserveAspectRatio="none"
        >
          {/*
            Front layer — same seamless technique, different baseline (60)
            and amplitude/phase so it visually layers over the back wave.
          */}
          <path
            d="M0,60 C100,10 200,10 300,60 C400,110 500,110 600,60 C700,10 800,10 900,60 C1000,110 1100,110 1200,60
               L1200,140 L0,140 Z
               M1200,60 C1300,10 1400,10 1500,60 C1600,110 1700,110 1800,60 C1900,10 2000,10 2100,60 C2200,110 2300,110 2400,60
               L2400,140 L1200,140 Z"
            className="fill-white"
            opacity="1"
          />
        </svg>
      </div>

      <style jsx>{`
        .wave-layer {
          will-change: transform;
          backface-visibility: hidden;
          transform: translateZ(0);
        }
        .wave-layer-back {
          animation: waveDriftBack 22s linear infinite;
        }
        .wave-layer-front {
          animation: waveDriftFront 15s linear infinite;
        }
        @keyframes waveDriftBack {
          from {
            transform: translateX(0) translateZ(0);
          }
          to {
            transform: translateX(-50%) translateZ(0);
          }
        }
        @keyframes waveDriftFront {
          from {
            transform: translateX(-50%) translateZ(0);
          }
          to {
            transform: translateX(0) translateZ(0);
          }
        }

        .float-dot {
          position: absolute;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.5);
          will-change: transform, opacity;
          animation: dotFloat 8s ease-in-out infinite;
        }
        .float-dot-1 {
          left: 8%;
          top: 22%;
          width: 5px;
          height: 5px;
          background: rgba(168, 224, 99, 0.55);
          animation-duration: 9s;
        }
        .float-dot-2 {
          left: 18%;
          top: 65%;
          width: 4px;
          height: 4px;
          animation-duration: 7.5s;
          animation-delay: 0.6s;
        }
        .float-dot-3 {
          left: 32%;
          top: 15%;
          width: 4px;
          height: 4px;
          background: rgba(255, 122, 61, 0.5);
          animation-duration: 10s;
          animation-delay: 1.2s;
        }
        .float-dot-4 {
          left: 78%;
          top: 25%;
          width: 4px;
          height: 4px;
          animation-duration: 8.5s;
          animation-delay: 0.3s;
        }
        .float-dot-5 {
          left: 88%;
          top: 60%;
          width: 5px;
          height: 5px;
          background: rgba(168, 224, 99, 0.5);
          animation-duration: 9.5s;
          animation-delay: 1.6s;
        }
        .float-dot-6 {
          left: 62%;
          top: 78%;
          width: 4px;
          height: 4px;
          animation-duration: 8s;
          animation-delay: 2s;
        }
        .float-dot-7 {
          left: 45%;
          top: 12%;
          width: 3px;
          height: 3px;
          background: rgba(255, 122, 61, 0.45);
          animation-duration: 7s;
          animation-delay: 0.9s;
        }
        .float-dot-8 {
          left: 95%;
          top: 40%;
          width: 4px;
          height: 4px;
          animation-duration: 9s;
          animation-delay: 1.4s;
        }

        @keyframes dotFloat {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-10px) scale(1.2);
            opacity: 0.75;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .wave-layer-back,
          .wave-layer-front,
          .float-dot {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
