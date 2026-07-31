"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Ticket } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Badge from "@/components/ui/Badge";
import { useAdminStore } from "@/stores/useAdminStore";

const EMPTY = {
  code: "",
  type: "percentage",
  value: "",
  expiryDate: "",
  usageLimit: "1",
  minPurchase: "",
  maxDiscount: "",
};
const TYPE_OPTS = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount (PKR)" },
];

export default function CouponsPage() {
  const {
    coupons,
    couponsLoading,
    fetchCoupons,
    addCoupon,
    updateCoupon,
    removeCoupon,
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
    fetchCoupons(true);
  }, [fetchCoupons]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  }
  function openEdit(c) {
    setEditing(c);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      expiryDate: c.expiryDate?.split("T")[0] || "",
      usageLimit: c.usageLimit,
      minPurchase: c.minPurchase || "",
      maxDiscount: c.maxDiscount || "",
    });
    setModal(true);
  }

  async function handleSave() {
    if (!form.code || !form.value || !form.expiryDate)
      return showToast("Code, value and expiry required", "error");
    setSaving(true);
    try {
      if (editing) {
        await updateCoupon(editing._id, form);
      } else {
        await addCoupon(form);
      }
      showToast(editing ? "Updated!" : "Coupon created!");
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
      await removeCoupon(del._id);
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
        title="Coupons"
        subtitle={`${coupons.length} coupons`}
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> Create Coupon
          </Button>
        }
      />
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          {couponsLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-lg bg-slate-200"
                />
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
              <Ticket size={40} className="opacity-20" />
              <p>No coupons yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-100 bg-slate-50">
                <tr>
                  {[
                    "Code",
                    "Type",
                    "Value",
                    "Min Purchase",
                    "Used/Limit",
                    "Expiry",
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
                {coupons.map((c) => {
                  const expired = new Date(c.expiryDate) < new Date();
                  const exhausted = c.usedCount >= c.usageLimit;
                  const statusColor =
                    c.status === "active" && !expired && !exhausted
                      ? "green"
                      : "red";
                  const statusLabel = expired
                    ? "Expired"
                    : exhausted
                      ? "Exhausted"
                      : c.status;
                  return (
                    <tr
                      key={c._id}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">
                        {c.code}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="blue">{c.type}</Badge>
                      </td>
                      <td className="px-4 py-3 font-medium text-primary-700">
                        {c.type === "percentage"
                          ? `${c.value}%`
                          : `PKR ${c.value}`}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {c.minPurchase > 0 ? `PKR ${c.minPurchase}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {c.usedCount}/{c.usageLimit}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(c.expiryDate).toLocaleDateString("en-PK")}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusColor}>{statusLabel}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(c)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDel(c)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-primary-700"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Coupon" : "Create Coupon"}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Coupon Code *"
            value={form.code}
            onChange={setF("code")}
            placeholder="e.g. SAVE20"
            className="uppercase"
          />
          <Select
            label="Discount Type *"
            value={form.type}
            onChange={setF("type")}
            options={TYPE_OPTS}
          />
          <Input
            label={`Value (${form.type === "percentage" ? "%" : "PKR"}) *`}
            type="number"
            value={form.value}
            onChange={setF("value")}
            placeholder="0"
          />
          <Input
            label="Expiry Date *"
            type="date"
            value={form.expiryDate}
            onChange={setF("expiryDate")}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Usage Limit"
              type="number"
              value={form.usageLimit}
              onChange={setF("usageLimit")}
              placeholder="1"
            />
            <Input
              label="Min Purchase (PKR)"
              type="number"
              value={form.minPurchase}
              onChange={setF("minPurchase")}
              placeholder="0"
            />
          </div>
          {form.type === "percentage" && (
            <Input
              label="Max Discount (PKR)"
              type="number"
              value={form.maxDiscount}
              onChange={setF("maxDiscount")}
              placeholder="Optional cap"
            />
          )}
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
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Coupon?"
        message={`Delete "${del?.code}"?`}
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
