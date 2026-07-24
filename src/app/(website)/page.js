"use client";
import { useEffect } from "react";
import Link from "next/link";
import { ShoppingBasket } from "lucide-react";
import ProductCard from "@/components/website/ProductCard";
import HeroSlider from "@/components/website/HeroSlider";
import NewsletterSection from "@/components/website/NewsletterSection";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

function SectionTitle({ title, subtitle, viewAll }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <h2 className="text-2xl font-bold text-primary">{title}</h2>
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

export default function HomePage() {
  const {
    banners,
    fetchBanners,
    categories,
    fetchCategories,

    featuredProducts,
    newArrivals,
    flashSaleProducts,
    fetchHomeProducts,
    homeProductsLoading,
  } = useWebsiteStore();

  useEffect(() => {
    fetchCategories();
    fetchBanners();
  }, [fetchCategories, fetchBanners]);

  useEffect(() => {
    fetchHomeProducts();
  }, []);

  return (
    <div>
      {/* Hero */}
      <HeroSlider banners={banners} />

      <div className="mx-auto max-w-7xl px-4 py-10 space-y-14">
        {/* Categories */}
        {(categories.length > 0 || !categories.length) && (
          <section>
            <SectionTitle title="Shop by Category" viewAll="/categories" />
            <div className="grid grid-cols-3 items-start gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {!categories.length
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2.5">
                      <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-primary-50 sm:h-20 sm:w-20" />
                      <div className="h-3 w-12 animate-pulse rounded-full bg-primary/10" />
                    </div>
                  ))
                : categories.slice(0, 8).map((c, i) => (
                    <Link
                      key={c._id}
                      href={`/products?category=${c._id}`}
                      className="cat-pop group flex flex-col items-center gap-3 text-center"
                      style={{ animationDelay: `${i * 70}ms` }}
                    >
                      <div className="relative h-20 w-20 shrink-0 sm:h-32 sm:w-32">
                        {/* idle pulse ring */}
                        <div className="pulse-ring-idle absolute -inset-1 rounded-full border border-primary-300/40" />

                        {/* glow on hover */}
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary to-primary-700 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-40" />

                        <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-slate-100 bg-gradient-to-br from-[#F3FBE9] to-[#EAF7DD] shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:rotate-3 group-hover:border-primary-300 group-hover:shadow-xl group-hover:shadow-emerald-900/15 sm:h-32 sm:w-32">
                          {c.image?.url ? (
                            <img
                              src={c.image.url}
                              alt={c.name}
                              className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <ShoppingBasket
                              size={26}
                              className="text-[#3D8B5F] transition-all duration-300 group-hover:scale-110 group-hover:text-primary-700"
                              strokeWidth={1.8}
                            />
                          )}

                          {/* shine sweep on hover */}
                          <span className="shine absolute inset-0 -translate-x-full" />
                        </div>
                      </div>

                      <p className="line-clamp-2 w-full text-xs font-semibold leading-tight text-slate-700 transition-colors group-hover:text-primary-700">
                        {c.name}
                      </p>
                    </Link>
                  ))}
            </div>

            <style jsx>{`
              @keyframes catPop {
                from {
                  opacity: 0;
                  transform: translateY(14px) scale(0.9);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
              .cat-pop {
                animation: catPop 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
              }

              @keyframes ringPulse {
                0% {
                  transform: scale(0.94);
                  opacity: 0.55;
                }
                70% {
                  transform: scale(1.12);
                  opacity: 0;
                }
                100% {
                  transform: scale(1.12);
                  opacity: 0;
                }
              }
              .pulse-ring-idle {
                animation: ringPulse 2.8s ease-out infinite;
              }

              .shine {
                background: linear-gradient(
                  115deg,
                  transparent 20%,
                  rgba(255, 255, 255, 0.55) 45%,
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

              @media (prefers-reduced-motion: reduce) {
                .cat-pop,
                .pulse-ring-idle,
                .group:hover .shine {
                  animation: none !important;
                }
              }
            `}</style>
          </section>
        )}

        {/* Flash Sale — kept red intentionally: urgency needs to visually break from the calm brand green */}
        {(homeProductsLoading || flashSaleProducts.length > 0) && (
          <section>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-white">
                <span className="text-lg">⚡</span>
                <span className="font-bold">Flash Sale</span>
              </div>
              <div className="h-px flex-1 bg-red-100" />
              <Link
                href="/products?flashSale=true"
                className="text-sm font-medium text-primary-700 hover:underline"
              >
                View All →
              </Link>
            </div>
            {homeProductsLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square animate-pulse rounded-2xl bg-primary-50"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {flashSaleProducts.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Featured */}
        {(homeProductsLoading || featuredProducts.length > 0) && (
          <section>
            <SectionTitle
              title="Featured Products"
              subtitle="Handpicked best sellers"
              viewAll="/products?featured=true"
            />
            {homeProductsLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square animate-pulse rounded-2xl bg-primary-50"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {featuredProducts.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* New Arrivals */}
        {(homeProductsLoading || newArrivals.length > 0) && (
          <section>
            <SectionTitle
              title="New Arrivals"
              subtitle="Fresh stock just added"
              viewAll="/products?newArrival=true"
            />
            {homeProductsLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square animate-pulse rounded-2xl bg-primary-50"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {newArrivals.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Why Choose Us */}
        <section className="rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 p-8 border border-primary-200">
          <h2 className="mb-8 text-center text-2xl font-bold text-slate-800">
            Why Choose Pansar Store?
          </h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              {
                icon: "🚚",
                title: "Fast Delivery",
                desc: "Same day delivery in your area",
              },
              {
                icon: "✅",
                title: "100% Authentic",
                desc: "Genuine products guaranteed",
              },
              {
                icon: "💰",
                title: "Best Prices",
                desc: "Competitive market prices",
              },
              {
                icon: "📞",
                title: "24/7 Support",
                desc: "Always here to help you",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm border border-primary-100">
                  {item.icon}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Banner */}
        <section className="rounded-2xl bg-gradient-to-br from-primary-800 to-primary-800 p-8 text-white">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
            {[
              ["500+", "Products"],
              ["1000+", "Happy Customers"],
              ["5+", "Years Experience"],
              ["10+", "Brands"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="text-3xl font-extrabold text-primary-300">{n}</p>
                <p className="mt-1 text-white/70 text-sm">{l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <NewsletterSection />
      </div>
    </div>
  );
}
