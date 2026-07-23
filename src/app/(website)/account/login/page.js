"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Phone, Lock } from "lucide-react";
import PageHeroHeader from "@/components/website/PageHeroHeader";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useWebsiteStore((s) => s.login);
  const [form, setForm] = useState({ phone: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setF(k) {
    return (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <PageHeroHeader
        icon="👋"
        eyebrow="Welcome Back"
        title="Sign In"
        subtitle="Access your orders, wishlist, and account details"
        compact
      />

      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={setF("phone")}
                  placeholder="03xx-xxxxxxx"
                  required
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-300/30"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={setF("password")}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-2.5 text-sm outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-300/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700/90 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : null}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              href="/account/register"
              className="font-semibold text-primary-600 hover:text-primary-600/90"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
