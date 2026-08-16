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

// Featured segment tiles — clicking one goes to /products?gender=<Men|Women|Kids>
// The products page resolves this against every active category tagged
// with that gender (plus anything marked "Unisex") and shows all of
// their products together.
const GENDER_TILES = [
  {
    key: "Men",
    tagline: "Watches, perfumes & gift sets",
  },
  {
    key: "Women",
    tagline: "Perfumes, gift boxes & more",
  },
  {
    key: "Kids",
    tagline: "Fun gift boxes & surprises",
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
          <div className="mx-auto max-w-7xl px-4">
            <SectionTitle
              title={sectionTitle}
              viewAll={cShow ? "/categories" : undefined}
            />
          </div>

          {stillLoading && !hasCategories && !hasBrands ? (
            <div className="mx-auto max-w-7xl px-4 grid grid-cols-3 items-start gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2.5">
                  <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-slate-50 sm:h-20 sm:w-20" />
                  <div className="h-3 w-12 animate-pulse rounded-full bg-primary/10" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* ── Featured segment tiles — the main entry point ──────── */}
              {hasCategories && (
                <div className="mx-auto max-w-7xl px-4 mt-2 mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  {GENDER_TILES.map((g) => (
                    <Link
                      key={g.key}
                      href={`/products?gender=${g.key}`}
                      className="gender-tile group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-3xl border border-secondary-200/70 bg-gradient-to-br from-primary-700 to-primary-900 px-6 py-7 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:min-h-[190px]"
                    >
                      {/* gold shimmer sweep on hover */}
                      <span className="tile-shine pointer-events-none absolute inset-0 -translate-x-full" />

                      {/* decorative ring */}
                      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-secondary-300/10 blur-2xl transition-all duration-500 group-hover:scale-125" />

                      <div className="relative z-[1] flex items-start justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary-300/40 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-secondary-200 backdrop-blur-sm">
                          <Sparkles size={11} strokeWidth={2.5} />
                          Collection
                        </span>
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14">
                          <Gift
                            size={22}
                            className="text-secondary-200"
                            strokeWidth={1.6}
                          />
                        </div>
                      </div>

                      <div className="relative z-[1]">
                        <h3 className="text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-[2.6rem]">
                          {g.key}
                        </h3>
                        <p className="mt-2 text-sm font-medium text-white/70">
                          {g.tagline}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-secondary-200 transition-transform duration-300 group-hover:translate-x-1">
                          Shop Now →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* ── Browse by type — existing auto-sliding strip ───────── */}
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

              {hasBrands && (
                <div
                  className={`brand-slider-viewport ${hasCategories ? "mt-6" : ""}`}
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
                          <div className="relative z-[1] flex items-center justify-center overflow-hidden rounded-full border-2 border-secondary-200 bg-primary-700 shadow-sm h-20 w-20 shrink-0 sm:h-32 sm:w-32">
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

          <style jsx>{`
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

            .tile-shine {
              background: linear-gradient(
                115deg,
                transparent 20%,
                rgba(212, 175, 55, 0.18) 45%,
                transparent 70%
              );
            }
            .gender-tile:hover .tile-shine {
              animation: shineSweep 1.1s ease forwards;
            }

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

            @media (prefers-reduced-motion: reduce) {
              .cat-slider-track,
              .brand-slider-track,
              .circle-glow,
              .group:hover .shine,
              .gender-tile:hover .tile-shine {
                animation: none !important;
              }
            }
          `}</style>
        </section>
      )}
    </div>
  );
};
