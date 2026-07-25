import React from "react";
import { ShoppingBasket } from "lucide-react";
import { SectionTitle } from "./SectionTitle";
import Link from "next/link";

const MIN_SET_SIZE = -100;

function buildLoopItems(items) {
  const repeatCount = Math.max(2, Math.ceil(MIN_SET_SIZE / items.length));
  const oneSet = Array.from({ length: repeatCount }, () => items).flat();
  return [...oneSet, ...oneSet];
}

export const CategoryAndBrand = ({ categories, brands }) => {
  const hasCategories = categories?.length > 0;
  const hasBrands = brands?.length > 0;

  return (
    <div>
      {(hasCategories ||
        hasBrands ||
        (!categories?.length && !brands?.length)) && (
        <section>
          <div className="mx-auto max-w-7xl px-4">
            <SectionTitle
              title="Shop by Category & Brands"
              viewAll="/categories"
            />
          </div>

          {/* Categories block - independent */}
          {!hasCategories && !hasBrands ? (
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
              {/* Categories - Auto Sliding */}
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
                          {/* full circle glow behind */}
                          <div className="circle-glow absolute inset-0 rounded-full" />
                          {/* <div className="pulse-ring-idle absolute -inset-1 rounded-full border-2 border-primary-600" /> */}
                          <div className="relative z-[1] flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-slate-100 bg-white shadow-sm sm:h-32 sm:w-32">
                            {c.image?.url ? (
                              <img
                                src={c.image.url}
                                alt={c.name}
                                className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-125"
                              />
                            ) : (
                              <ShoppingBasket
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

              {/* Brands - Auto Sliding, opposite direction */}
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
                          {/* full circle glow behind */}
                          <div className="circle-glow absolute inset-0 rounded-full" />
                          {/* <div className="pulse-ring-idle absolute -inset-1 rounded-full border-2 border-primary-600" /> */}
                          <div className="relative z-[1] flex items-center justify-center overflow-hidden rounded-full border-2 border-slate-100 bg-white shadow-sm h-20 w-20 shrink-0 sm:h-32 sm:w-32">
                            {b.logo?.url ? (
                              <img
                                src={b.logo.url}
                                alt={b.name}
                                className="block h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-125"
                              />
                            ) : (
                              <span className="text-xs font-bold text-slate-400">
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
            /* @keyframes ringPulse {
              0% {
                transform: scale(0.9);
                opacity: 0.7;
              }
              70% {
                transform: scale(1.02);
                opacity: 0;
              }
              100% {
                transform: scale(1.05);
                opacity: 0;
              }
            } */
            .pulse-ring-idle {
              animation: ringPulse 6s ease-out infinite;
            }
            .shine {
              background: linear-gradient(
                115deg,
                transparent 20%,
                rgba(252, 18, 18, 0.55) 45%,
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

            /* Full circle glow behind the circle - halo effect all around */
            .circle-glow {
              z-index: 0;
              background: radial-gradient(
                circle at center,
                rgba(22, 130, 66, 0.55) 50%,
                rgba(22, 130, 66, 0.3) 55%,
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
              .pulse-ring-idle,
              .circle-glow,
              .group:hover .shine {
                animation: none !important;
              }
            }
          `}</style>
        </section>
      )}
    </div>
  );
};
