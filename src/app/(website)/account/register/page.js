"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeroHeader from "@/components/website/PageHeroHeader";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

export default function RegisterPage() {
  const router = useRouter();
  const register = useWebsiteStore((s) => s.register);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
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
      await register(form);
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <PageHeroHeader
        icon="🎉"
        eyebrow="Join Us"
        title="Create Account"
        subtitle="Sign up for exclusive deals and faster checkout"
        compact
      />

      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              ["Full Name *", "name", "text", "Your full name"],
              ["Phone *", "phone", "tel", "03xx-xxxxxxx"],
              ["Email", "email", "email", "Optional"],
              ["Password *", "password", "password", "Min 6 characters"],
            ].map(([l, k, t, ph]) => (
              <div key={k}>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  {l}
                </label>
                <input
                  type={t}
                  value={form[k]}
                  onChange={setF(k)}
                  placeholder={ph}
                  required={!l.includes("Optional")}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-300/30"
                />
              </div>
            ))}

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
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/account/login"
              className="font-semibold text-primary-600 hover:text-primary-700/90"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
