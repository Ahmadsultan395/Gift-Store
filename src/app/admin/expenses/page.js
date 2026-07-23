"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Badge from "@/components/ui/Badge";
import { useAdminStore } from "@/stores/useAdminStore";

const CATS = [
  { value: "rent", label: "Shop Rent" },
  { value: "electricity", label: "Electricity" },
  { value: "internet", label: "Internet" },
  { value: "salary", label: "Salary" },
  { value: "other", label: "Other" },
];
const CAT_COLOR = {
  rent: "blue",
  electricity: "yellow",
  internet: "purple",
  salary: "orange",
  other: "slate",
};
const EMPTY = {
  title: "",
  category: "other",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  notes: "",
};

export default function ExpensesPage() {
  const {
    expenses,
    expensesTotalAmount,
    expensesLoading,
    fetchExpenses,
    addExpense,
    updateExpense,
    removeExpense,
  } = useAdminStore();

  const [modalOpen, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [catFilter, setCatF] = useState("");
  const [dateFrom, setFrom] = useState("");
  const [dateTo, setTo] = useState("");

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }
  function setF(k) {
    return (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  }

  useEffect(() => {
    const params = { page: 1, limit: 50 };
    if (catFilter) params.category = catFilter;
    if (dateFrom) params.from = dateFrom;
    if (dateTo) params.to = dateTo;
    fetchExpenses(params);
  }, [catFilter, dateFrom, dateTo, fetchExpenses]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  }
  function openEdit(e) {
    setEditing(e);
    setForm({
      title: e.title,
      category: e.category,
      amount: e.amount,
      date: e.date?.split("T")[0] || "",
      notes: e.notes || "",
    });
    setModal(true);
  }

  async function handleSave() {
    if (!form.title || !form.amount)
      return showToast("Title and amount required", "error");
    setSaving(true);
    try {
      const body = { ...form, amount: Number(form.amount) };
      if (editing) {
        await updateExpense(editing._id, body);
      } else {
        await addExpense(body);
      }
      showToast(editing ? "Updated!" : "Added!");
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
      await removeExpense(del._id);
      showToast("Deleted");
      setDel(null);
    } catch (err) {
      showToast(err?.message || "Error", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Track all store expenses"
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> Add Expense
          </Button>
        }
      />

      {/* Total card */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="col-span-1 sm:col-span-1 rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-xs font-medium text-red-400 uppercase tracking-wide">
            Total Expenses
          </p>
          <p className="mt-1 text-2xl font-bold text-red-700">
            PKR {expensesTotalAmount.toLocaleString()}
          </p>
        </div>
        {/* Filters */}
        <div className="col-span-1 sm:col-span-3 grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <Select
            value={catFilter}
            onChange={(e) => setCatF(e.target.value)}
            options={CATS}
            placeholder="All Categories"
          />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="From date"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setTo(e.target.value)}
            placeholder="To date"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {expensesLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <Wallet size={40} className="opacity-20" />
            <p>No expenses found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                {[
                  "#",
                  "Title",
                  "Category",
                  "Amount",
                  "Date",
                  "Notes",
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
              {expenses.map((e, i) => (
                <tr
                  key={e._id}
                  className="border-b border-slate-50 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {e.title}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={CAT_COLOR[e.category]}>{e.category}</Badge>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    PKR {e.amount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(e.date).toLocaleDateString("en-PK")}
                  </td>
                  <td className="px-4 py-3 text-slate-400 max-w-[150px] truncate">
                    {e.notes || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(e)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDel(e)}
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
        onClose={() => setModal(false)}
        title={editing ? "Edit Expense" : "Add Expense"}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Title *"
            value={form.title}
            onChange={setF("title")}
            placeholder="e.g. Monthly Rent"
          />
          <Select
            label="Category"
            value={form.category}
            onChange={setF("category")}
            options={CATS}
          />
          <Input
            label="Amount (PKR) *"
            type="number"
            value={form.amount}
            onChange={setF("amount")}
            placeholder="0"
          />
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={setF("date")}
          />
          <Input
            label="Notes"
            value={form.notes}
            onChange={setF("notes")}
            placeholder="Optional notes"
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
        title="Delete Expense?"
        message={`Delete "${del?.title}"?`}
      />
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg ${toast.type === "error" ? "bg-red-600" : "bg-green-600"}`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
