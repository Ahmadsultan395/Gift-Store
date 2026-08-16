"use client";
/**
 * Categories page using useAdminStore
 */
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Tags } from "lucide-react";
import { useAdminStore } from "@/stores/useAdminStore";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Badge from "@/components/ui/Badge";
import ImageUpload from "@/components/ui/ImageUpload";

const EMPTY = { name: "", description: "", image: null, gender: "Unisex" };

const GENDER_OPTIONS = [
  { value: "Men", label: "Men" },
  { value: "Women", label: "Women" },
  { value: "Kids", label: "Kids" },
  { value: "Unisex", label: "Unisex (shows under every gender tile)" },
];

const GENDER_BADGE = {
  Men: "blue",
  Women: "pink",
  Kids: "yellow",
  Unisex: "slate",
};

export default function CategoriesPage() {
  const {
    categories,
    categoriesLoading,
    fetchCategories,
    addCategory,
    updateCategory,
    removeCategory,
  } = useAdminStore();

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  }
  function openEdit(c) {
    setEditing(c);
    setForm({
      name: c.name,
      description: c.description || "",
      image: c.image || null,
      gender: c.gender || "Unisex",
    });
    setModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return showToast("Category name required", "error");
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing._id, form);
        showToast("Category updated!");
      } else {
        await addCategory(form);
        showToast("Category added!");
      }
      setModal(false);
    } catch (e) {
      showToast(e.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await removeCategory(del._id);
      showToast("Category deleted");
      setDel(null);
    } catch (e) {
      showToast(e.message || "Failed", "error");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} total`}
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> Add Category
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 max-w-xs">
        <Search size={15} className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="flex-1 text-sm outline-none"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          {categoriesLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-lg bg-slate-200"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
              <Tags size={40} className="opacity-30" />
              <p className="text-sm">No categories found.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {["#", "Name", "Gender", "Slug", "Status", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 ${h === "Actions" ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c._id}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="px-5 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {c.image?.url ? (
                          <img
                            src={c.image.url}
                            className="h-8 w-8 rounded-lg object-cover flex-shrink-0"
                            alt=""
                          />
                        ) : (
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            🛒
                          </div>
                        )}
                        <span className="font-medium text-slate-800">
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={GENDER_BADGE[c.gender] || "slate"}>
                        {c.gender || "Unisex"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">
                      {c.slug}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={c.status === "active" ? "green" : "slate"}
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDel(c)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Category" : "Add Category"}
        size="sm"
      >
        <div className="space-y-4">
          <ImageUpload
            label="Category Image"
            value={form.image}
            onChange={(img) => setForm((p) => ({ ...p, image: img }))}
            folder="pansar-store/categories"
          />
          <Input
            label="Name *"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Watches"
          />
          <Select
            label="Gender / Audience *"
            value={form.gender}
            onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
            options={GENDER_OPTIONS}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            rows={2}
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
        title="Delete Category?"
        message={`Delete "${del?.name}"?`}
      />

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg ${toast.type === "error" ? "bg-red-600" : "bg-primary-600"}`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
