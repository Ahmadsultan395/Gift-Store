"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import ProductForm from "@/components/admin/ProductForm";
import { useAdminStore } from "@/stores/useAdminStore";

export default function EditProductPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProductById = useAdminStore((state) => state.getProductById);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Failed to load product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id, getProductById]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-24 text-center text-slate-400">Product not found.</div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit: ${product.name}`}
        subtitle={`SKU: ${product.sku}`}
      />

      <ProductForm product={product} />
    </div>
  );
}
