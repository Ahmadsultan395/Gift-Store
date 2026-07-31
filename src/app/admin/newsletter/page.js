"use client";
import { useEffect, useState } from "react";
import {
  Mail,
  Search,
  Trash2,
  Copy,
  Download,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  Send,
  X,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function NewsletterPage() {
  const [data, setData] = useState({
    subscribers: [],
    stats: {},
    pagination: {},
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [del, setDel] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  // ── Selection ────────────────────────────────────────────────
  const [selected, setSelected] = useState(new Set());

  // ── Compose / Send Email ────────────────────────────────────
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMode, setComposeMode] = useState("selected"); // "selected" | "all"
  const [emailForm, setEmailForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 50 });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/newsletter?${params}`);
    const json = await res.json();
    setData(json.data || {});
    setLoading(false);
  }

  useEffect(() => {
    setPage(1);
  }, [search]);
  useEffect(() => {
    fetchData();
  }, [page, search]);

  // Clear selection when page/search changes (ids no longer on screen)
  useEffect(() => {
    setSelected(new Set());
  }, [page, search]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/admin/newsletter/${del._id}`, { method: "DELETE" });
      showToast("Subscriber removed");
      setDel(null);
      fetchData();
    } catch {
      showToast("Error", "error");
    } finally {
      setDeleting(false);
    }
  }

  async function toggleStatus(sub) {
    await fetch(`/api/admin/newsletter/${sub._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !sub.isActive }),
    });
    fetchData();
  }

  // Copy all emails to clipboard
  function copyAllEmails() {
    const emails = data.subscribers.map((s) => s.email).join(", ");
    navigator.clipboard.writeText(emails).then(() => {
      setCopied(true);
      showToast(`${data.subscribers.length} emails copied!`);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Export as PDF
  function exportPDF() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Newsletter Subscribers", 14, 18);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString("en-PK")}`, 14, 26);

    autoTable(doc, {
      startY: 34,

      head: [["#", "Email", "Status", "Subscribed On"]],

      body: subscribers.map((sub, index) => [
        index + 1,
        sub.email,
        sub.isActive ? "Active" : "Inactive",
        new Date(sub.createdAt).toLocaleDateString("en-PK"),
      ]),

      theme: "grid",

      headStyles: {
        fillColor: [22, 163, 74],
        textColor: 255,
        fontStyle: "bold",
        halign: "left",
        valign: "middle",
      },

      styles: {
        fontSize: 10,
        cellPadding: 4,
        valign: "middle",
        halign: "left",
        overflow: "linebreak",
      },

      columnStyles: {
        0: {
          cellWidth: 15,
          halign: "left",
        },
        1: {
          cellWidth: 90,
          halign: "left",
        },
        2: {
          cellWidth: 30,
          halign: "left",
        },
        3: {
          cellWidth: 45,
          halign: "left",
        },
      },
    });

    doc.save(`newsletter-subscribers-${Date.now()}.pdf`);

    showToast("PDF exported!");
  }

  // ── Selection helpers ────────────────────────────────────────
  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => {
      if (prev.size === subscribers.length) return new Set();
      return new Set(subscribers.map((s) => s._id));
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  // ── Compose / Send ───────────────────────────────────────────
  function openCompose(mode) {
    setComposeMode(mode);
    setEmailForm({ subject: "", message: "" });
    setComposeOpen(true);
  }

  async function handleSendEmail() {
    if (!emailForm.subject.trim() || !emailForm.message.trim()) {
      return showToast("Subject and message required", "error");
    }
    setSending(true);
    try {
      const body =
        composeMode === "all"
          ? {
              sendToAll: true,
              subject: emailForm.subject,
              message: emailForm.message,
            }
          : {
              subscriberIds: Array.from(selected),
              subject: emailForm.subject,
              message: emailForm.message,
            };
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success)
        return showToast(json.message || "Failed to send", "error");
      showToast(
        composeMode === "all"
          ? "Email queued for all active subscribers!"
          : `Email queued for ${selected.size} subscriber${selected.size === 1 ? "" : "s"}!`,
      );
      setComposeOpen(false);
      clearSelection();
    } catch {
      showToast("Network error while sending", "error");
    } finally {
      setSending(false);
    }
  }

  const { subscribers = [], stats = {}, pagination = {} } = data;
  const allSelected =
    subscribers.length > 0 && selected.size === subscribers.length;

  return (
    <div>
      <PageHeader
        title="Newsletter Subscribers"
        subtitle="Manage website newsletter subscribers"
        action={
          <div className="flex  flex-wrap gap-2">
            <button
              onClick={copyAllEmails}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-primary-400 hover:text-primary-700 transition-colors"
            >
              {copied ? (
                <CheckCircle size={15} className="text-primary-600" />
              ) : (
                <Copy size={15} />
              )}
              {copied ? "Copied!" : "Copy All Emails"}
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-primary-400 hover:text-primary-700 transition-colors"
            >
              <Download size={15} />
              Export PDF
            </button>
            <button
              onClick={() => openCompose("all")}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            >
              <Send size={15} /> Email All
            </button>
          </div>
        }
      />

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-1 min-[450px]:grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Total Subscribers",
            value: stats.total || 0,
            icon: Users,
            color: "text-primary-600",
            bg: "bg-primary-50",
          },
          {
            label: "Active",
            value: stats.active || 0,
            icon: CheckCircle,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Joined Today",
            value: stats.today || 0,
            icon: TrendingUp,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            label: "This Month",
            value: stats.thisMonth || 0,
            icon: Calendar,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {s.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {s.value}
                </p>
              </div>
              <div className={`rounded-xl p-2.5 ${s.bg}`}>
                <s.icon size={20} className={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* IS PAGE KA FAIDA EXPLAIN */}
      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-800 mb-1">
          📧 What can you do with Newsletter?
        </p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>
            <b>Email All</b> → Send emails to all <b>subscribers or selected</b>{" "}
            subscribers
          </li>
          <li>
            <b>Copy all emails</b> → WhatsApp Broadcast and use them in your
            email campaigns
          </li>
          <li>
            <b>Export CSV</b> → Export subscriber data and use it with email
            marketing tools
          </li>
        </ul>
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 max-w-xs">
        <Search size={15} className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search email..."
          className="flex-1 text-sm outline-none text-slate-600"
        />
      </div>

      {/* Selection bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5">
          <p className="text-sm font-medium text-primary-800">
            {selected.size} subscriber{selected.size === 1 ? "" : "s"} selected
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={clearSelection}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-white"
            >
              <X size={13} /> Clear
            </button>
            <button
              onClick={() => openCompose("selected")}
              className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
            >
              <Send size={13} /> Email Selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-lg bg-slate-200"
                />
              ))}
            </div>
          ) : subscribers.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
              <Mail size={48} className="opacity-20" />
              <p className="font-medium">
                {search ? "No email found" : "No subscribers yet"}
              </p>
              <p className="text-xs">
                Subscribers will appear here after joining the newsletter
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  {[
                    "#",
                    "Email Address",
                    "Status",
                    "Subscribed On",
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
                {subscribers.map((sub, i) => (
                  <tr
                    key={sub._id}
                    className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${selected.has(sub._id) ? "bg-primary-50/50" : ""}`}
                  >
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(sub._id)}
                        onChange={() => toggleSelect(sub._id)}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">
                      {(page - 1) * 50 + i + 1}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                          {sub.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-700">
                          {sub.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={sub.isActive ? "green" : "slate"}>
                        {sub.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(sub.createdAt).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(sub)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                            sub.isActive
                              ? "bg-slate-100 text-slate-600 hover:bg-yellow-100 hover:text-yellow-700"
                              : "bg-primary-50 text-primary-600 hover:bg-primary-100"
                          }`}
                        >
                          {sub.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => setDel(sub)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-400">
              {pagination.total} total subscribers
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={page === pagination.pages}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Compose email modal */}
      <Modal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title={
          composeMode === "all"
            ? "Email All Active Subscribers"
            : `Email ${selected.size} Selected Subscriber${selected.size === 1 ? "" : "s"}`
        }
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Subject *"
            value={emailForm.subject}
            onChange={(e) =>
              setEmailForm((p) => ({ ...p, subject: e.target.value }))
            }
            placeholder="e.g. Flash Sale — 30% off this weekend!"
          />
          <Textarea
            label="Message *"
            value={emailForm.message}
            onChange={(e) =>
              setEmailForm((p) => ({ ...p, message: e.target.value }))
            }
            rows={6}
            placeholder="Write your email message here..."
          />
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setComposeOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSendEmail}
              isLoading={sending}
            >
              <Send size={14} className="mr-1.5" />
              {sending ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Remove Subscriber?"
        message={`"${del?.email}" from subscriber list?`}
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
