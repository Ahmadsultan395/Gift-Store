"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Image } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Badge from "@/components/ui/Badge";
import ImageUpload from "@/components/ui/ImageUpload";
import { useAdminStore } from "@/stores/useAdminStore";

const TYPE_OPTS = [
  { value: "hero", label: "Hero Banner (Homepage Slider)" },
  { value: "poster", label: "Home Poster" },
  { value: "flash_sale", label: "Flash Sale Banner" },
  { value: "offer", label: "Special Offer" },
  { value: "festival", label: "Festival Banner" },
];
const TYPE_COLOR = {
  hero: "green",
  poster: "blue",
  flash_sale: "orange",
  offer: "purple",
  festival: "yellow",
};
const EMPTY = {
  title: "",
  subtitle: "",
  image: null,
  link: "",
  type: "hero",
  sortOrder: "0",
};

export default function BannersPage() {
  const {
    banners,
    bannersLoading,
    fetchBanners,
    addBanner,
    updateBanner,
    removeBanner,
  } = useAdminStore();

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
  function setF(k) {
    return (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  }

  useEffect(() => {
    fetchBanners(true);
  }, [fetchBanners]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  }
  function openEdit(b) {
    setEditing(b);
    setForm({
      title: b.title || "",
      subtitle: b.subtitle || "",
      image: b.image || null,
      link: b.link || "",
      type: b.type,
      sortOrder: b.sortOrder || 0,
    });
    setModal(true);
  }

  async function handleSave() {
    if (!form.image?.url) return showToast("Banner image is required", "error");
    setSaving(true);
    try {
      const body = { ...form, sortOrder: Number(form.sortOrder) };
      if (editing) {
        await updateBanner(editing._id, body);
      } else {
        await addBanner(body);
      }
      showToast(editing ? "Banner updated!" : "Banner added!");
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
      await removeBanner(del._id);
      showToast("Deleted");
      setDel(null);
    } catch (err) {
      showToast(err?.message || "Error", "error");
    } finally {
      setDeleting(false);
    }
  }

  async function toggleStatus(b) {
    const status = b.status === "active" ? "inactive" : "active";
    try {
      await updateBanner(b._id, { status });
    } catch (err) {
      showToast(err?.message || "Error", "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Banners & Offers"
        subtitle="Manage homepage banners and promotional images"
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> Add Banner
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bannersLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-2xl bg-slate-100"
            />
          ))
        ) : banners.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center gap-3 py-20 text-slate-400">
            <Image size={48} className="opacity-20" />
            <p>No banners yet. Add one!</p>
          </div>
        ) : (
          banners.map((b) => (
            <div
              key={b._id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-video bg-slate-100">
                {b.image?.url ? (
                  <img
                    src={b.image.url}
                    alt={b.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Image size={32} className="text-slate-300" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge variant={TYPE_COLOR[b.type] || "slate"}>
                    {b.type.replace("_", " ")}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant={b.status === "active" ? "green" : "red"}>
                    {b.status}
                  </Badge>
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-slate-800 truncate">
                  {b.title || "Untitled Banner"}
                </p>
                {b.subtitle && (
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {b.subtitle}
                  </p>
                )}
                {b.link && (
                  <p className="text-xs text-primary-600 truncate mt-0.5">
                    {b.link}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(b)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${b.status === "active" ? "bg-primary-50 text-primary-700 hover:bg-red-100" : "bg-primary-50 text-primary-600 hover:bg-primary-100"}`}
                  >
                    {b.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => openEdit(b)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-blue-600"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDel(b)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-700"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Banner" : "Add Banner"}
        size="md"
      >
        <div className="space-y-4">
          <ImageUpload
            label="Banner Image"
            value={form.image}
            onChange={(img) =>
              setForm((p) => ({
                ...p,
                image: img,
              }))
            }
            folder="pansar-store/banners"
            aspect="square"
          />
          <Select
            label="Banner Type"
            value={form.type}
            onChange={setF("type")}
            options={TYPE_OPTS}
          />
          <Input
            label="Title"
            value={form.title}
            onChange={setF("title")}
            placeholder="e.g. Summer Sale!"
          />
          <Input
            label="Subtitle"
            value={form.subtitle}
            onChange={setF("subtitle")}
            placeholder="e.g. Up to 50% off"
          />
          <Input
            label="Link (optional)"
            value={form.link}
            onChange={setF("link")}
            placeholder="/products?flashSale=true"
          />
          <Input
            label="Sort Order"
            type="number"
            value={form.sortOrder}
            onChange={setF("sortOrder")}
            placeholder="0"
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
              {editing ? "Update" : "Add Banner"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Banner?"
        message={`Delete "${del?.title || "this banner"}"?`}
      />
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg ${toast.type === "error" ? "bg-red-600" : "bg-primary"}`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
