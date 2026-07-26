"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Truck, Phone, Mail } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Badge from "@/components/ui/Badge";
import { useAdminStore } from "@/stores/useAdminStore";

const EMPTY = {
  name: "",
  companyName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  notes: "",
};

export default function SuppliersPage() {
  const {
    suppliers,
    suppliersLoading,
    fetchSuppliers,
    addSupplier,
    updateSupplier,
    removeSupplier,
  } = useAdminStore();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function set(k) {
    return (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  }

  useEffect(() => {
    fetchSuppliers(true);
  }, []);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }
  function openEdit(s) {
    setEditing(s);
    setForm({
      name: s.name,
      companyName: s.companyName || "",
      phone: s.phone,
      email: s.email || "",
      address: s.address || "",
      city: s.city || "",
      notes: s.notes || "",
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.phone.trim())
      return showToast("Name and phone are required", "error");

    setSaving(true);

    try {
      if (editing) {
        await updateSupplier(editing._id, form);
        showToast("Supplier updated!");
      } else {
        await addSupplier(form);
        showToast("Supplier added!");
      }

      setModalOpen(false);
    } catch (err) {
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);

    try {
      await removeSupplier(deleteTarget._id);

      showToast("Supplier deleted");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setDeleting(false);
    }
  }
  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.includes(search),
  );

  return (
    <div>
      <PageHeader
        title="Suppliers"
        subtitle={`${suppliers.length} suppliers`}
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> Add Supplier
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 max-w-xs">
        <Search size={15} className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="flex-1 text-sm outline-none"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {suppliersLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <Truck size={40} className="opacity-30" />
            <p className="text-sm">
              {search ? "No suppliers found" : "No suppliers yet."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {[
                  "#",
                  "Supplier",
                  "Contact",
                  "City",
                  "Balance",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 ${h === "Actions" ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={s._id}
                  className="border-b border-slate-50 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{s.name}</p>
                    {s.companyName && (
                      <p className="text-xs text-slate-400">{s.companyName}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Phone size={11} />
                        {s.phone}
                      </span>
                      {s.email && (
                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                          <Mail size={11} />
                          {s.email}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{s.city || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        s.outstandingBalance > 0
                          ? "font-semibold text-red-600"
                          : "text-slate-500"
                      }
                    >
                      PKR {(s.outstandingBalance || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={s.status === "active" ? "green" : "slate"}>
                      {s.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(s)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(s)}
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Supplier" : "Add Supplier"}
        size="md"
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Full Name *"
            value={form.name}
            onChange={set("name")}
            placeholder="Supplier name"
            className="col-span-2 sm:col-span-1"
          />
          <Input
            label="Company Name"
            value={form.companyName}
            onChange={set("companyName")}
            placeholder="Optional"
            className="col-span-2 sm:col-span-1"
          />
          <Input
            label="Phone *"
            value={form.phone}
            onChange={set("phone")}
            placeholder="03xx-xxxxxxx"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="supplier@email.com"
          />
          <Input
            label="City"
            value={form.city}
            onChange={set("city")}
            placeholder="e.g. Lahore"
          />
          <Input
            label="Address"
            value={form.address}
            onChange={set("address")}
            placeholder="Street address"
          />
          <Textarea
            label="Notes"
            value={form.notes}
            onChange={set("notes")}
            placeholder="Any notes..."
            className="col-span-2"
            rows={2}
          />
        </div>
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setModalOpen(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave} isLoading={saving}>
            {editing ? "Update" : "Add Supplier"}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Supplier?"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
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
