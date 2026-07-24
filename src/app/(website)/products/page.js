import { Suspense } from "react";
import ProductsContentPage from "./ProductsContent";

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <ProductsContentPage />
    </Suspense>
  );
}
