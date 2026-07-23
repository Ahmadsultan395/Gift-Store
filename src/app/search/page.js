"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, PackageX } from "lucide-react";

export default function SearchPage() {
  const params = useSearchParams();
  const q = params.get("q") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/products?search=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data?.products || []);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Search size={20} className="text-primary-400" />
        <h1 className="text-xl font-semibold text-primary-600">
          Search results for{" "}
          <span className="text-primary-700">&ldquo;{q}&rdquo;</span>
        </h1>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-primary-100 bg-primary-50 p-3"
            >
              <div className="aspect-square w-full rounded-lg bg-slate-200" />
              <div className="mt-3 h-4 w-3/4 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-primary-100 py-16 text-center">
          <PackageX size={40} className="mb-3 text-primary-300" />
          <p className="text-base font-medium text-slate-700">
            No products found
          </p>
          <p className="mt-1 text-sm text-primary-400">
            Try searching with a different keyword.
          </p>
        </div>
      )}

      {/* Results grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((p) => (
            <Link
              key={p._id}
              href={`/products/${p.slug}`}
              className="group rounded-xl border border-slate-100 bg-primary-0 p-3 transition-shadow hover:shadow-md"
            >
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-primary-50">
                {p.images?.[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.images[0].url}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-primary-300">
                    No image
                  </div>
                )}
              </div>
              <p className="mt-3 line-clamp-2 text-sm font-medium text-slate-700">
                {p.name}
              </p>
              {p.sellingPrice != null && (
                <p className="mt-1 text-sm font-semibold text-primary-700">
                  PKR {p.sellingPrice}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
