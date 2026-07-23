// app/admin/products/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Package,
  Tag,
  Barcode,
  Layers,
  DollarSign,
  Boxes,
  CalendarDays,
  Star,
} from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useAdminStore } from "@/stores/useAdminStore";

const STATUS_BADGE = {
  active: "green",
  inactive: "slate",
  draft: "yellow",
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getProductById = useAdminStore((state) => state.getProductById);

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    async function loadProduct() {
      setLoading(true);
      setError(null);

      try {
        const data = await getProductById(id);

        if (!mounted) return;

        setProduct(data);
      } catch (err) {
        if (!mounted) return;

        setError(err?.message || "Product not found");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [id, getProductById]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-slate-400">
        <Package size={48} className="opacity-20" />

        <p className="text-sm font-medium">{error || "Product not found"}</p>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/products")}
        >
          <ArrowLeft size={14} />
          Back to Products
        </Button>
      </div>
    );
  }

  const availability =
    product.stock <= 0
      ? {
          label: "Out of Stock",
          color: "red",
        }
      : product.stock <= product.lowStockThreshold
        ? {
            label: "Low Stock",
            color: "yellow",
          }
        : {
            label: "In Stock",
            color: "green",
          };

  return (
    <div>
      <PageHeader
        title={product.name}
        subtitle={`SKU: ${product.sku}`}
        action={
          <div className="flex gap-2">
            <Link href="/admin/products">
              <Button variant="outline">
                <ArrowLeft size={16} />
                Back
              </Button>
            </Link>

            <Link href={`/admin/products/${product._id}/edit`}>
              <Button>
                <Pencil size={16} />
                Edit
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Images */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            {product.images?.length ? (
              <div className="space-y-3">
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="h-64 w-full rounded-lg object-cover border"
                />

                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {product.images.slice(1).map((img, i) => (
                      <img
                        key={i}
                        src={img.url}
                        alt=""
                        className="h-16 w-16 rounded-lg object-cover border"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-lg bg-slate-100">
                <Package size={40} className="text-slate-300" />
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant={STATUS_BADGE[product.status]}>
              {product.status}
            </Badge>

            <Badge variant={availability.color}>{availability.label}</Badge>

            {product.isFeatured && (
              <Badge variant="yellow">
                <Star size={12} />
                Featured
              </Badge>
            )}

            {product.isNewArrival && <Badge variant="green">New Arrival</Badge>}

            {product.isFlashSale && <Badge variant="red">Flash Sale</Badge>}
          </div>

          <InfoCard title="Pricing" icon={<DollarSign size={16} />}>
            <Info
              label="Purchase Price"
              value={`PKR ${(product.purchasePrice || 0).toLocaleString()}`}
            />

            <Info
              label="Selling Price"
              value={`PKR ${(product.sellingPrice || 0).toLocaleString()}`}
            />
          </InfoCard>

          <InfoCard title="Inventory" icon={<Boxes size={16} />}>
            <Info label="Stock" value={`${product.stock} ${product.unit}`} />

            <Info
              label="Low Stock Threshold"
              value={product.lowStockThreshold}
            />

            {product.barcode && (
              <Info label="Barcode" value={product.barcode} />
            )}
          </InfoCard>

          <InfoCard title="Classification" icon={<Layers size={16} />}>
            <Info label="Category" value={product.category?.name || "—"} />

            <Info label="Brand" value={product.brand?.name || "—"} />
          </InfoCard>

          {(product.description || product.shortDescription) && (
            <InfoCard title="Description">
              <p className="text-sm text-slate-600">
                {product.shortDescription}
              </p>

              <p className="text-sm text-slate-500 mt-2 whitespace-pre-line">
                {product.description}
              </p>
            </InfoCard>
          )}

          <InfoCard title="Meta" icon={<CalendarDays size={16} />}>
            <Info
              label="Created"
              value={new Date(product.createdAt).toLocaleDateString()}
            />

            <Info
              label="Updated"
              value={new Date(product.updatedAt).toLocaleDateString()}
            />
          </InfoCard>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, icon, children }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-700">
        {icon}
        {title}
      </h3>

      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>

      <p className="font-medium text-slate-700">{value}</p>
    </div>
  );
}
