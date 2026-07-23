import PageHeader from "@/components/ui/PageHeader";
import ProductForm from "@/components/admin/ProductForm";

export default function AddProductPage() {
  return (
    <div>
      <PageHeader title="Add New Product" subtitle="Fill in the details to add a product to your inventory" />
      <ProductForm />
    </div>
  );
}
