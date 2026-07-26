"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Badge from "@/components/ui/Badge";
import { useAdminStore } from "@/stores/useAdminStore";

const EMPTY = { name: "", phone: "", email: "", status: "active" };

export default function CustomersPage() {
  const {
    customers,
    customersPagination,
    customersLoading,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    removeCustomer,
  } = useAdminStore();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModal] = useState(false);
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
    setPage(1);
  }, [search]);

  useEffect(() => {
    const params = { page, limit: 20 };
    if (search) params.search = search;
    fetchCustomers(params);
  }, [page, search, fetchCustomers]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  }
  function openEdit(c) {
    setEditing(c);
    setForm({
      name: c.name,
      phone: c.phone,
      email: c.email || "",
      status: c.status,
    });
    setModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.phone)
      return showToast("Name and phone required", "error");
    setSaving(true);
    try {
      if (editing) {
        await updateCustomer(editing._id, form);
      } else {
        await addCustomer(form);
      }
      showToast(editing ? "Customer updated!" : "Customer added!");
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
      await removeCustomer(del._id);
      showToast("Deleted");
      setDel(null);
    } catch (err) {
      showToast(err?.message || "Error", "error");
    } finally {
      setDeleting(false);
    }
  }

  const pagination = customersPagination || {};

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${pagination.total || 0} customers`}
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> Add Customer
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 max-w-xs">
        <Search size={15} className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="flex-1 text-sm outline-none"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          {customersLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
              <Users size={48} className="opacity-20" />
              <p>No customers found.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {[
                    "#",
                    "Name",
                    "Phone",
                    "Email",
                    "Orders",
                    "Order Spending",
                    "POS Count",
                    "POS Spending",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 ${h === "Actions" ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr
                    key={c._id}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="px-5 py-3 text-slate-400">
                      {(page - 1) * 20 + i + 1}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {c.name}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{c.phone}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {c.email || "—"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {c.ordersCount || 0}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      PKR {(c.ordersSpending || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-center">{c.posCount || 0}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      PKR {(c.posSpending || 0).toLocaleString()}
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
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-400">
              Page {page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border p-1.5 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={page === pagination.pages}
                className="rounded-lg border p-1.5 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModal(false)}
        title={editing ? "Edit Customer" : "Add Customer"}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            value={form.name}
            onChange={setF("name")}
            placeholder="Customer name"
          />
          <Input
            label="Phone *"
            value={form.phone}
            onChange={setF("phone")}
            placeholder="03xx-xxxxxxx"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={setF("email")}
            placeholder="Optional"
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
              {editing ? "Update" : "Add Customer"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Customer?"
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
