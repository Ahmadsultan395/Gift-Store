"use client";
import { useEffect, useState } from "react";
import {
  Mail,
  MailOpen,
  Trash2,
  Reply,
  Phone,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Check,
  Clock,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function MessagesPage() {
  const [data, setData] = useState({ messages: [], stats: {}, pagination: {} });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);
  const [del, setDel] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function fetchData() {
    setLoading(true);
    const p = new URLSearchParams({ page, limit: 20, filter });
    const res = await fetch(`/api/admin/messages?${p}`);
    const json = await res.json();
    setData(json.data || {});
    setLoading(false);
  }

  useEffect(() => {
    setPage(1);
  }, [filter]);
  useEffect(() => {
    fetchData();
  }, [page, filter]);

  async function openMessage(msg) {
    setViewing(msg);
    setReplyText("");
    // Mark as read
    if (!msg.isRead) {
      await fetch(`/api/admin/messages/${msg._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead" }),
      });
      fetchData();
    }
  }

  async function handleReply() {
    if (!replyText.trim())
      return showToast("Please write a reply first", "error");
    setReplying(true);
    try {
      const res = await fetch(`/api/admin/messages/${viewing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply", replyText }),
      });
      const json = await res.json();
      if (!json.success) return showToast(json.message || "Failed", "error");
      showToast(json.message || "Reply sent!");
      setViewing((prev) => ({
        ...prev,
        isReplied: true,
        reply: replyText,
        repliedAt: new Date(),
      }));
      setReplyText("");
      fetchData();
    } catch {
      showToast("Error", "error");
    } finally {
      setReplying(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/admin/messages/${del._id}`, { method: "DELETE" });
      showToast("Message deleted");
      setDel(null);
      if (viewing?._id === del._id) setViewing(null);
      fetchData();
    } catch {
      showToast("Error", "error");
    } finally {
      setDeleting(false);
    }
  }

  const { messages = [], stats = {}, pagination = {} } = data;

  return (
    <div>
      <PageHeader
        title="Messages / Inbox"
        subtitle="Messages received from the website contact form"
      />

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-4">
        {[
          ["All", stats.total || 0, "all", "slate"],
          ["Unread", stats.unread || 0, "unread", "yellow"],
          ["Replied", stats.replied || 0, "replied", "green"],
        ].map(([l, v, f, c]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl border p-4 text-left transition-all hover:shadow-sm ${filter === f ? "border-primary-400 bg-primary-50" : "border-slate-200 bg-white"}`}
          >
            <p className="text-xs font-medium uppercase text-slate-400">{l}</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{v}</p>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
              <MessageSquare size={48} className="opacity-20" />
              <p>No messages yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {[
                    "",
                    "Name",
                    "Contact",
                    "Subject",
                    "Date",
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
                {messages.map((msg) => (
                  <tr
                    key={msg._id}
                    className={`border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${!msg.isRead ? "bg-primary-50/40" : ""}`}
                    onClick={() => openMessage(msg)}
                  >
                    <td className="pl-4 py-3 w-8">
                      {msg.isRead ? (
                        <MailOpen size={16} className="text-slate-300" />
                      ) : (
                        <Mail size={16} className="text-primary-500" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p
                        className={`font-medium ${!msg.isRead ? "text-slate-900" : "text-slate-600"}`}
                      >
                        {msg.name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-500">
                        {msg.phone || "—"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {msg.email || ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-[180px]">
                      <p className="truncate text-xs">
                        {msg.subject || (
                          <span className="italic text-slate-300">
                            No subject
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {msg.message}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {msg.isReplied ? (
                        <Badge variant="green">Replied</Badge>
                      ) : msg.isRead ? (
                        <Badge variant="slate">Read</Badge>
                      ) : (
                        <Badge variant="blue">New</Badge>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openMessage(msg)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setDel(msg)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
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
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-400">
              Page {page} of {pagination.pages} • {pagination.total} messages
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

      {/* ── Message Detail + Reply Modal ─────────────────────────── */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Message Detail"
        size="md"
      >
        {viewing && (
          <div className="space-y-4 text-sm">
            {/* Sender info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-400 mb-1">From</p>
                <p className="font-semibold text-slate-800">{viewing.name}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-400 mb-1">Date</p>
                <p className="font-medium text-slate-700">
                  {new Date(viewing.createdAt).toLocaleString("en-PK", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              {viewing.phone && (
                <a
                  href={`tel:${viewing.phone}`}
                  className="flex items-center gap-2 rounded-xl bg-primary-50 p-3 hover:bg-primary-100 transition-colors"
                >
                  <Phone size={14} className="text-primary-600" />
                  <div>
                    <p className="text-xs text-slate-400">Phone</p>
                    <p className="font-semibold text-primary-700">
                      {viewing.phone}
                    </p>
                  </div>
                </a>
              )}
              {viewing.email && (
                <a
                  href={`mailto:${viewing.email}`}
                  className="flex items-center gap-2 rounded-xl bg-blue-50 p-3 hover:bg-blue-100 transition-colors"
                >
                  <Mail size={14} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="font-semibold text-blue-700 truncate">
                      {viewing.email}
                    </p>
                  </div>
                </a>
              )}
            </div>

            {/* Subject */}
            {viewing.subject && (
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-400 mb-0.5">Subject</p>
                <p className="font-medium text-slate-700">{viewing.subject}</p>
              </div>
            )}

            {/* Message */}
            <div className="rounded-xl border border-slate-200 px-4 py-4">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
                Message
              </p>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {viewing.message}
              </p>
            </div>

            {/* Previous reply */}
            {viewing.isReplied && viewing.reply && (
              <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-4">
                <p className="text-xs font-semibold text-primary-600 uppercase mb-2 flex items-center gap-1">
                  <Check size={12} /> Your Reply —{" "}
                  {new Date(viewing.repliedAt).toLocaleDateString("en-PK")}
                </p>
                <p className="text-primary-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {viewing.reply}
                </p>
              </div>
            )}

            {/* Reply box */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                <Reply size={13} />{" "}
                {viewing.isReplied ? "Send Another Reply" : "Write Reply"}
              </p>

              {!viewing.email && (
                <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                  ⚠ Customer didn't provide an email — the reply will be saved
                  here, contact them by phone instead:{" "}
                  <a
                    href={`tel:${viewing.phone}`}
                    className="font-bold underline"
                  >
                    {viewing.phone}
                  </a>
                </div>
              )}

              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                placeholder={`Hello ${viewing.name},\n\nThank you for your message...`}
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-100"
              />

              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => setViewing(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={handleReply}
                  disabled={replying || !replyText.trim()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {replying ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Reply size={14} />
                  )}
                  {replying
                    ? "Sending..."
                    : viewing.email
                      ? "Send Email Reply"
                      : "Save Reply"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Message?"
        message={`Delete the message from "${del?.name}"?`}
      />

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg ${toast.type === "error" ? "bg-red-600" : "bg-primary-600"}`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
