import { Suspense } from "react";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <ProductsClient />
    </Suspense>
  );
}
