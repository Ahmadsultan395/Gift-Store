"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import PageHeroHeader from "@/components/website/PageHeroHeader";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

function Field({ icon: Icon, label, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
        <Icon size={14} className="text-slate-400" /> {label}
      </label>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { customer, authChecked, checkAuth, updateProfile, authLoading } =
    useWebsiteStore();

  const [tab, setTab] = useState("info"); // "info" | "password"
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Profile form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Password form
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    async function init() {
      if (!authChecked) await checkAuth();
    }
    init();
  }, [authChecked, checkAuth]);

  useEffect(() => {
    if (!authChecked) return;
    if (!customer) {
      router.push("/account/login");
      return;
    }
    setName(customer.name || "");
    setPhone(customer.phone || "");
    setEmail(customer.email || "");
  }, [authChecked, customer, router]);

  const loading = !authChecked;

  function clearMessages() {
    setSuccess("");
    setError("");
  }

  // Update profile info
  async function handleUpdateInfo(e) {
    e.preventDefault();
    clearMessages();
    if (!name.trim()) return setError("Please enter your name");
    if (!phone.trim()) return setError("Please enter your phone number");

    try {
      const data = await updateProfile({ name, phone, email });
      setSuccess("✅ Profile updated successfully!");
      setName(data.name);
      setPhone(data.phone);
      setEmail(data.email);
    } catch (err) {
      setError(err?.message || "Failed to update profile");
    }
  }

  // Change password
  async function handleChangePassword(e) {
    e.preventDefault();
    clearMessages();
    if (!curPw) return setError("Please enter your current password");
    if (!newPw) return setError("Please enter a new password");
    if (newPw.length < 6)
      return setError("Password must be at least 6 characters");
    if (newPw !== confirmPw) return setError("New passwords don't match");

    try {
      await updateProfile({ currentPassword: curPw, newPassword: newPw });
      setSuccess("✅ Password changed! No need to log in again.");
      setCurPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      setError(err?.message || "Failed to change password");
    }
  }

  const saving = authLoading;

  return (
    <div className="min-h-screen">
      <PageHeroHeader
        icon={name?.charAt(0)?.toUpperCase() || "👤"}
        eyebrow="My Account"
        title={loading ? "My Profile" : name || "My Profile"}
        subtitle={loading ? "Loading your details..." : phone}
        compact
      />

      <div className="mx-auto max-w-lg px-4 py-10">
        <Link
          href="/account"
          className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Account
        </Link>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="mb-6 flex rounded-xl border border-slate-200 overflow-hidden">
              {[
                ["info", "👤 Profile Info"],
                ["password", "🔒 Change Password"],
              ].map(([t, l]) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    clearMessages();
                  }}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${tab === t ? "bg-primary-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                <span>⚠</span> {error}
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bgprimary-600 border border-[#DCF3C4] px-4 py-3 text-sm text-primary-600">
                <CheckCircle size={16} /> {success}
              </div>
            )}

            {/* ── Profile Info Tab ─────────────────────────────────────── */}
            {tab === "info" && (
              <form
                onSubmit={handleUpdateInfo}
                className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5"
              >
                <Field icon={User} label="Full Name *">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-300/30 transition-all"
                  />
                </Field>

                <Field icon={Phone} label="Phone Number *">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03xx-xxxxxxx"
                    type="tel"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-300/30 transition-all"
                  />
                </Field>

                <Field icon={Mail} label="Email (Optional)">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    type="email"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-300/30 transition-all"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700/90 disabled:opacity-60 transition-colors"
                >
                  {saving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <User size={16} />
                  )}
                  {saving ? "Saving..." : "Update Profile"}
                </button>
              </form>
            )}

            {/* ── Change Password Tab ──────────────────────────────────── */}
            {tab === "password" && (
              <form
                onSubmit={handleChangePassword}
                className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5"
              >
                <Field icon={Lock} label="Current Password *">
                  <div className="relative">
                    <input
                      type={showCur ? "text" : "password"}
                      value={curPw}
                      onChange={(e) => setCurPw(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-300/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCur((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCur ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>

                <Field icon={Lock} label="New Password *">
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-300/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPw && (
                    <div className="mt-1.5 flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            newPw.length >= i * 3
                              ? newPw.length >= 12
                                ? "bg-primary-600"
                                : newPw.length >= 8
                                  ? "bg-yellow-400"
                                  : "bg-red-400"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-[10px] text-slate-400">
                        {newPw.length < 6
                          ? "Weak"
                          : newPw.length < 9
                            ? "OK"
                            : newPw.length < 12
                              ? "Good"
                              : "Strong"}
                      </span>
                    </div>
                  )}
                </Field>

                <Field icon={Lock} label="Confirm New Password *">
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all ${
                      confirmPw && confirmPw !== newPw
                        ? "border-red-300 focus:border-red-400 bg-red-50"
                        : "border-slate-200 focus:border-primary-300 focus:ring-1 focus:ring-primary-300/30"
                    }`}
                  />
                  {confirmPw && confirmPw !== newPw && (
                    <p className="mt-1 text-xs text-red-500">
                      Passwords don't match
                    </p>
                  )}
                  {confirmPw && confirmPw === newPw && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-[#0F4C39]">
                      <CheckCircle size={11} /> Match!
                    </p>
                  )}
                </Field>

                <button
                  type="submit"
                  disabled={saving || (!!confirmPw && confirmPw !== newPw)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700/90 disabled:opacity-60 transition-colors"
                >
                  {saving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Lock size={16} />
                  )}
                  {saving ? "Changing..." : "Change Password"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
