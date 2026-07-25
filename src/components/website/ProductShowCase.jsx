import Link from "next/link";
import React from "react";
import ProductCard from "./ProductCard";
import { SectionTitle } from "./SectionTitle";

const ProductShowCase = ({
  homeProductsLoading,
  flashSaleProducts,
  featuredProducts,
  newArrivals,
}) => {
  return (
    <>
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
                  className="aspect-square animate-pulse rounded-2xl bg-slate-50"
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
                  className="aspect-square animate-pulse rounded-2xl bg-slate-50"
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
                  className="aspect-square animate-pulse rounded-2xl bg-slate-50"
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
    </>
  );
};

export default ProductShowCase;
