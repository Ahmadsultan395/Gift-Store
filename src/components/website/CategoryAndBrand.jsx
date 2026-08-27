import React from "react";
import { Gift, Sparkles } from "lucide-react";
import { SectionTitle } from "./SectionTitle";
import Link from "next/link";

const MIN_SET_SIZE = -100;

function buildLoopItems(items) {
  const repeatCount = Math.max(2, Math.ceil(MIN_SET_SIZE / items.length));
  const oneSet = Array.from({ length: repeatCount }, () => items).flat();

  return [...oneSet, ...oneSet];
}

// Featured segment tiles
const GENDER_TILES = [
  {
    key: "Men",
    tagline: "Watches, perfumes & gift sets",
    image: "/menCat.png",
  },
  {
    key: "Women",
    tagline: "Perfumes, gift boxes & more",
    image: "/womenCat.png",
  },
  {
    key: "Kids",
    tagline: "Fun gift boxes & surprises",
    image: "/kidsCat.png",
  },
];

export const CategoryAndBrand = ({
  categories,
  brands,
  cShow = true,
  bShow = true,
}) => {
  const hasCategories = cShow && categories?.length > 0;
  const hasBrands = bShow && brands?.length > 0;

  const sectionTitle =
    cShow && !bShow
      ? "Shop by Category"
      : bShow && !cShow
        ? "Our Brands"
        : "Shop by Category & Brands";

  const stillLoading =
    (cShow && !categories?.length) || (bShow && !brands?.length);

  return (
    <div>
      {(cShow || bShow) && (
        <section>
          {/* SECTION TITLE */}
          <div className="mx-auto max-w-7xl px-4">
            <SectionTitle
              title={sectionTitle}
              viewAll={cShow ? "/categories" : undefined}
            />
          </div>

          {/* LOADING */}
          {stillLoading && !hasCategories && !hasBrands ? (
            <div className="mx-auto grid max-w-7xl grid-cols-3 items-start gap-x-4 gap-y-6 px-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2.5">
                  <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-slate-50 sm:h-20 sm:w-20" />
                  <div className="h-3 w-12 animate-pulse rounded-full bg-primary/10" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* =========================================================
                  MEN / WOMEN / KIDS
              ========================================================= */}
              {hasCategories && (
                <div className="gender-grid mx-auto mb-10 max-w-7xl px-4 pt-10">
                  {GENDER_TILES.map((g) => (
                    <div key={g.key} className="gender-wrapper relative">
                      {/* =============================================
                          PIN + ROPE — sits ABOVE the card, outside its
                          overflow-hidden box so it never clips. This
                          wrapper is what actually swings, so pin, rope
                          and card all move together as one rigid piece.
                      ============================================= */}
                      <div className="hanging-ropes pointer-events-none absolute inset-x-0 top-0 z-[6]">
                        <span className="pin pin-left" />
                        <span className="rope rope-left" />

                        <span className="pin pin-right" />
                        <span className="rope rope-right" />
                      </div>

                      <Link
                        href={`/products?gender=${g.key}`}
                        className="gender-tile group relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-3xl border border-secondary-200/70 px-6 py-7 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl sm:min-h-[210px]"
                        style={{
                          backgroundImage: `url(${g.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        {/* PRIMARY COLOR OVERLAY */}
                        <span className="pointer-events-none absolute inset-0 z-0 bg-primary/50 transition-all duration-500 group-hover:bg-primary/35" />

                        {/* DARK OVERLAY */}
                        <span className="pointer-events-none absolute inset-0 z-0 bg-black/10 group-hover:bg-black/5" />

                        {/* PREMIUM OUTER GLOW — the flowing glow the card
                            breathes with; no moving sweep line anymore */}
                        <span className="gender-glow pointer-events-none absolute -inset-2 z-0 rounded-[2rem] bg-secondary-300/30 blur-2xl" />

                        {/* DECORATIVE GOLD ORB */}
                        <div className="gender-orb pointer-events-none absolute -right-12 -top-12 z-[1] h-40 w-40 rounded-full bg-secondary-300/20 blur-3xl" />

                        {/* TOP CONTENT */}
                        <div className="relative z-[3] flex items-start justify-between">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary-300/50 bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-secondary-200 backdrop-blur-md">
                            <Sparkles size={11} strokeWidth={2.5} />
                            Collection
                          </span>

                          <div className="gender-icon relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-black/20 backdrop-blur-md sm:h-14 sm:w-14">
                            <Gift
                              size={22}
                              className="text-secondary-200"
                              strokeWidth={1.6}
                            />
                          </div>
                        </div>

                        {/* BOTTOM CONTENT */}
                        <div className="relative z-[3]">
                          <h3 className="text-4xl font-black uppercase leading-none tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.55)] sm:text-[2.6rem]">
                            {g.key}
                          </h3>

                          <p className="mt-2 text-sm font-medium text-white drop-shadow-md">
                            {g.tagline}
                          </p>

                          <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-secondary-200 transition-all duration-300 group-hover:translate-x-2">
                            Shop Now →
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {/* =========================================================
                  CATEGORIES
              ========================================================= */}
              {hasCategories && (
                <div className="cat-slider-viewport">
                  <div className="cat-slider-track pt-3">
                    {buildLoopItems(categories).map((c, i) => (
                      <Link
                        key={`${c._id}-${i}`}
                        href={`/products?category=${c._id}`}
                        className="cat-slide group flex flex-col items-center gap-3 text-center"
                      >
                        <div className="relative h-20 w-20 shrink-0 sm:h-32 sm:w-32">
                          <div className="circle-glow absolute inset-0 rounded-full" />

                          <div className="relative z-[1] flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-secondary-200 bg-primary-700 shadow-sm sm:h-32 sm:w-32">
                            {c.image?.url ? (
                              <img
                                src={c.image.url}
                                alt={c.name}
                                className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-125"
                              />
                            ) : (
                              <Gift
                                size={26}
                                className="text-white transition-transform duration-300 group-hover:scale-125"
                                strokeWidth={1.8}
                              />
                            )}

                            <span className="shine absolute inset-0 -translate-x-full" />
                          </div>
                        </div>

                        <p className="line-clamp-2 w-full text-xs font-semibold leading-tight text-slate-700 transition-colors group-hover:text-primary-700">
                          {c.name}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* =========================================================
                  BRANDS
              ========================================================= */}
              {hasBrands && (
                <div
                  className={`brand-slider-viewport ${
                    hasCategories ? "mt-6" : ""
                  }`}
                >
                  <div className="brand-slider-track pt-3">
                    {buildLoopItems(brands).map((b, i) => (
                      <Link
                        key={`${b._id}-${i}`}
                        href={`/products?brand=${b._id}`}
                        className="brand-slide group flex flex-col items-center gap-2 text-center"
                      >
                        <div className="relative h-20 w-20 shrink-0 sm:h-32 sm:w-32">
                          <div className="circle-glow absolute inset-0 rounded-full" />

                          <div className="relative z-[1] flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-secondary-200 bg-primary-700 shadow-sm sm:h-32 sm:w-32">
                            {b.logo?.url ? (
                              <img
                                src={b.logo.url}
                                alt={b.name}
                                className="block h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-125"
                              />
                            ) : (
                              <span className="text-xs font-bold text-secondary-200">
                                {b.name?.[0]}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="line-clamp-1 w-full text-[11px] font-medium text-slate-500 group-hover:text-primary-700">
                          {b.name}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* =============================================================
              ALL STYLES
          ============================================================= */}
          <style jsx>{`
            /* ============================================================
               GENDER GRID — custom breakpoints (not Tailwind's) so the
               tight zone between 640px and ~700px never squeezes into
               3 columns before there's room. Row-gap is generous
               everywhere so a pin/rope never overlaps the card above it.
            ============================================================ */

            .gender-grid {
              display: grid;
              grid-template-columns: 1fr;
              row-gap: 64px;
              column-gap: 24px;
            }

            @media (min-width: 481px) and (max-width: 991px) {
              .gender-grid {
                grid-template-columns: repeat(2, 1fr);
                row-gap: 56px;
              }

              .gender-grid > .gender-wrapper:nth-child(3) {
                grid-column: 1 / -1;
                max-width: calc(50% - 12px);
                margin-inline: auto;
              }
            }

            @media (min-width: 992px) {
              .gender-grid {
                grid-template-columns: repeat(3, 1fr);
                row-gap: 24px;
              }

              .gender-grid > .gender-wrapper:nth-child(3) {
                grid-column: auto;
                max-width: none;
                margin-inline: 0;
              }
            }

            /* ============================================================
               WRAPPER — this is what actually swings. Pin, rope and
               card are all children of this element, so they move
               together as one rigid body, pivoting from the pin above.
            ============================================================ */

            .gender-wrapper {
              transform-origin: center -40px;
              animation: hangingSwing 6s ease-in-out infinite;
              will-change: transform;
            }

            .gender-wrapper:nth-child(1) {
              animation-delay: 0s;
            }

            .gender-wrapper:nth-child(2) {
              animation-delay: -2s;
            }

            .gender-wrapper:nth-child(3) {
              animation-delay: -4s;
            }

            @keyframes hangingSwing {
              0%,
              100% {
                transform: rotate(0deg);
              }

              25% {
                transform: rotate(2.5deg);
              }

              50% {
                transform: rotate(-2.5deg);
              }

              75% {
                transform: rotate(1.3deg);
              }
            }

            /* ============================================================
               PIN — the fixed anchor point, sits highest, above the rope
            ============================================================ */

            .hanging-ropes {
              height: 40px;
              top: -40px;
            }

            .pin {
              position: absolute;
              top: 0;

              width: 9px;
              height: 9px;

              border-radius: 999px;

              background: radial-gradient(circle at 35% 30%, #3a3a3a, #111 70%);

              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
            }

            .pin-left {
              left: calc(22% - 4.5px);
            }

            .pin-right {
              right: calc(22% - 4.5px);
            }

            /* ============================================================
               ROPE — hangs from the pin down to the card's top border
            ============================================================ */

            .rope {
              position: absolute;
              top: 9px;

              width: 3px;
              height: 31px;

              border-radius: 999px;

              background: linear-gradient(
                to bottom,
                rgba(255, 225, 130, 0.9),
                rgba(212, 175, 55, 1),
                rgba(120, 80, 20, 0.65)
              );

              box-shadow:
                0 0 4px rgba(212, 175, 55, 0.45),
                inset 0 0 2px rgba(255, 255, 255, 0.4);
            }

            .rope-left {
              left: 22%;
            }

            .rope-right {
              right: 22%;
            }

            /* ============================================================
               GENDER CARD
            ============================================================ */

            .gender-tile {
              position: relative;
            }

            /* ============================================================
               PREMIUM GLOW — this is the only glow now; it breathes
               continuously so the card feels alive without any sweep
            ============================================================ */

            .gender-glow {
              opacity: 0.06;
              animation: premiumGlow 2.2s ease-in-out infinite;
              will-change: opacity, transform;
            }

            .gender-wrapper:nth-child(1) .gender-glow {
              animation-delay: 0s;
            }

            .gender-wrapper:nth-child(2) .gender-glow {
              animation-delay: 0.7s;
            }

            .gender-wrapper:nth-child(3) .gender-glow {
              animation-delay: 1.4s;
            }

            @keyframes premiumGlow {
              0%,
              100% {
                opacity: 0.05;
                transform: scale(0.99);
              }

              50% {
                opacity: 0.38;
                transform: scale(1.025);
              }
            }

            /* ============================================================
               ICON VIBRATION
            ============================================================ */

            .gender-icon {
              animation: iconAttention 4s ease-in-out infinite;
            }

            .gender-wrapper:nth-child(1) .gender-icon,
            .gender-wrapper:nth-child(2) .gender-icon,
            .gender-wrapper:nth-child(3) .gender-icon {
              animation-delay: 0s;
            }

            @keyframes iconAttention {
              0%,
              100% {
                transform: scale(1);
                box-shadow: 0 0 0 rgba(212, 175, 55, 0);
              }

              50% {
                transform: scale(1.08);
                box-shadow:
                  0 0 12px rgba(212, 175, 55, 0.45),
                  0 0 25px rgba(212, 175, 55, 0.25);
              }
            }

            /* ============================================================
               DECORATIVE ORB
            ============================================================ */

            .gender-orb {
              animation: orbPulse 3s ease-in-out infinite;
            }

            .gender-wrapper:nth-child(1) .gender-orb {
              animation-delay: 0s;
            }

            .gender-wrapper:nth-child(2) .gender-orb {
              animation-delay: 1s;
            }

            .gender-wrapper:nth-child(3) .gender-orb {
              animation-delay: 2s;
            }

            @keyframes orbPulse {
              0%,
              100% {
                opacity: 0.2;
                transform: scale(1);
              }

              50% {
                opacity: 0.6;
                transform: scale(1.18);
              }
            }

            /* ============================================================
               HOVER — only a small lift/glow on the card itself, swing
               animation on the wrapper is completely unaffected.
            ============================================================ */

            .gender-tile:hover .gender-glow {
              opacity: 0.45;
            }

            /* ============================================================
               CATEGORY / BRAND SLIDER
            ============================================================ */

            .cat-slider-viewport,
            .brand-slider-viewport {
              overflow: hidden;
              width: 100vw;
              position: relative;
              left: 50%;
              right: 50%;
              margin-left: -50vw;
              margin-right: -50vw;
              padding-block: 4px;
            }

            .cat-slider-track {
              display: flex;
              gap: 1.5rem;
              width: max-content;
              animation: catSlide 50s linear infinite;
              padding-inline: 1rem;
            }

            .brand-slider-track {
              display: flex;
              gap: 1.25rem;
              width: max-content;
              animation: brandSlide 50s linear infinite;
              padding-inline: 1rem;
            }

            @media (min-width: 1900px) {
              .cat-slider-viewport,
              .brand-slider-viewport {
                width: 100%;
                left: 0;
                right: 0;
                margin-left: 0;
                margin-right: 0;
                max-width: 80rem;
                margin-inline: auto;
              }

              .cat-slider-track,
              .brand-slider-track {
                padding-inline: 1rem;
              }
            }

            .cat-slider-viewport:hover .cat-slider-track,
            .brand-slider-viewport:hover .brand-slider-track {
              animation-play-state: paused;
            }

            .cat-slide {
              flex: 0 0 auto;
              width: 90px;
            }

            .brand-slide {
              flex: 0 0 auto;
              width: 70px;
            }

            @media (min-width: 640px) {
              .cat-slide {
                width: 130px;
              }

              .brand-slide {
                width: 100px;
              }
            }

            @keyframes catSlide {
              from {
                transform: translateX(0);
              }

              to {
                transform: translateX(-50%);
              }
            }

            @keyframes brandSlide {
              from {
                transform: translateX(-50%);
              }

              to {
                transform: translateX(0);
              }
            }

            /* ============================================================
               CATEGORY SHINE
            ============================================================ */

            .shine {
              background: linear-gradient(
                115deg,
                transparent 20%,
                rgba(212, 175, 55, 0.55) 45%,
                transparent 70%
              );
            }

            .group:hover .shine {
              animation: shineSweep 0.85s ease forwards;
            }

            @keyframes shineSweep {
              from {
                transform: translateX(-100%);
              }

              to {
                transform: translateX(100%);
              }
            }

            /* ============================================================
               CATEGORY CIRCLE GLOW
            ============================================================ */

            .circle-glow {
              z-index: 0;

              background: radial-gradient(
                circle at center,
                rgba(122, 31, 43, 0.5) 50%,
                rgba(201, 162, 39, 0.3) 55%,
                transparent 20%
              );

              filter: blur(10px);
              opacity: 0.6;

              animation: circleGlowPulse 2.4s ease-in-out infinite;

              pointer-events: none;
            }

            @keyframes circleGlowPulse {
              0%,
              100% {
                opacity: 0.4;
                transform: scale(0.9);
              }

              50% {
                opacity: 0.8;
                transform: scale(1.25);
              }
            }

            /* ============================================================
               MOBILE (< 481px — narrowest phones)
            ============================================================ */

            @media (max-width: 480px) {
              .gender-tile {
                min-height: 180px;
              }

              .gender-wrapper {
                animation-duration: 7s;
                transform-origin: center -34px;
              }

              .hanging-ropes {
                height: 34px;
                top: -34px;
              }

              .rope {
                top: 8px;
                height: 26px;
              }
            }

            /* ============================================================
               ACCESSIBILITY
            ============================================================ */

            @media (prefers-reduced-motion: reduce) {
              .gender-wrapper,
              .gender-glow,
              .gender-icon,
              .gender-orb,
              .cat-slider-track,
              .brand-slider-track,
              .circle-glow {
                animation: none !important;
              }
            }
          `}</style>
        </section>
      )}
    </div>
  );
};
