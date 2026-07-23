"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Award } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ImageUpload from "@/components/ui/ImageUpload";
import { useAdminStore } from "@/stores/useAdminStore";

export default function BrandsPage() {
  const {
    brands,
    brandsLoading,
    fetchBrands,
    addBrand,
    updateBrand,
    removeBrand,
  } = useAdminStore();

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", logo: null });
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    fetchBrands(true);
  }, [fetchBrands]);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", logo: null });
    setModal(true);
  }
  function openEdit(b) {
    setEditing(b);
    setForm({ name: b.name, logo: b.logo || null });
    setModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return showToast("Brand name required", "error");
    setSaving(true);
    try {
      if (editing) {
        await updateBrand(editing._id, form);
      } else {
        await addBrand(form);
      }
      showToast(editing ? "Updated!" : "Brand added!");
      setModal(false);
    } catch (err) {
      showToast(err?.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await removeBrand(del._id);
      showToast("Deleted");
      setDel(null);
    } catch (err) {
      showToast(err?.message || "Error", "error");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Brands"
        subtitle={`${brands.length} brands`}
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> Add Brand
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 max-w-xs">
        <Search size={15} className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brands..."
          className="flex-1 text-sm outline-none"
        />
      </div>

      {brandsLoading ? (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
          <Award size={40} className="opacity-30" />
          <p className="text-sm">No brands yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {filtered.map((b) => (
            <div
              key={b._id}
              className="group relative rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-all"
            >
              <div className="aspect-square  flex items-center justify-center overflow-hidden p-3">
                {b.logo?.url ? (
                  <img
                    src={b.logo.url}
                    alt={b.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-3xl">🏷️</span>
                )}
              </div>
              <div className="px-2 pb-2">
                <p className="text-xs font-semibold text-slate-800 truncate text-center">
                  {b.name}
                </p>
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => openEdit(b)}
                  className="rounded-lg bg-white p-1.5 text-primary-600"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setDel(b)}
                  className="rounded-lg bg-white p-1.5 text-primary-700"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Brand" : "Add Brand"}
        size="sm"
      >
        <div className="space-y-4">
          <ImageUpload
            label="Brand Logo"
            value={form.logo}
            onChange={(img) => setForm((p) => ({ ...p, logo: img }))}
            folder="pansar-store/brands"
            aspect="logo"
          />
          <Input
            label="Brand Name *"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Shan, National"
          />
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setModal(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} isLoading={saving}>
              {editing ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Brand?"
        message={`Delete "${del?.name}"?`}
      />
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg ${toast.type === "error" ? "bg-red-100" : "bg-primary"}`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
