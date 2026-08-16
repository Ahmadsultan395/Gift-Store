// components/website/OurPromise.jsx
import { Truck, ShieldCheck, Gift, Headphones } from "lucide-react";

export default function OurPromise() {
  const items = [
    {
      icon: Truck,
      title: "Fast Delivery",
      desc: "Same day delivery in your area",
      color: "text-secondary-700",
      bg: "bg-secondary-50",
      ring: "ring-secondary-100",
      accent: "bg-secondary-500",
      glow: "group-hover:shadow-secondary-200/60",
    },
    {
      icon: ShieldCheck,
      title: "100% Authentic",
      desc: "Genuine products, quality checked",
      color: "text-primary-600",
      bg: "bg-primary-50",
      ring: "ring-primary-100",
      accent: "bg-primary-500",
      glow: "group-hover:shadow-primary-200/60",
    },
    {
      icon: Gift,
      title: "Gift Wrapped With Care",
      desc: "Every order beautifully packed",
      color: "text-secondary-800",
      bg: "bg-secondary-100",
      ring: "ring-secondary-200",
      accent: "bg-secondary-700",
      glow: "group-hover:shadow-secondary-300/50",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      desc: "Always here to help you",
      color: "text-primary-500",
      bg: "bg-primary-50",
      ring: "ring-primary-100",
      accent: "bg-primary-400",
      glow: "group-hover:shadow-primary-200/60",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 via-white to-secondary-50/60 border border-primary-100 px-6 sm:px-10 py-12">
      {/* decorative soft blobs */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary-200/30 blur-[70px]" />
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-secondary-200/30 blur-[70px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="relative text-center max-w-xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary-800 ring-1 ring-secondary-200">
          ✨ Our Promise
        </span>
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-800">
          Every Gift, Wrapped In Trust
        </h2>
        <p className="mt-2 text-slate-500 text-sm">
          Har order ke sath hamara commitment — packaging se le kar delivery
          tak.
        </p>
      </div>

      <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="group relative flex flex-col items-center text-center rounded-2xl bg-white/70 backdrop-blur-sm px-4 py-7 ring-1 ring-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-transparent"
            >
              <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
                <span
                  className={`absolute inset-0 rounded-2xl ${item.bg} scale-90 opacity-0 transition-all duration-300 group-hover:scale-125 group-hover:opacity-100`}
                />
                <div
                  className={`relative flex h-16 w-16 items-center justify-center rounded-2xl ${item.bg} ring-1 ${item.ring} shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${item.glow}`}
                >
                  <Icon className={`h-7 w-7 ${item.color}`} strokeWidth={2} />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-slate-800">
                {item.title}
              </h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                {item.desc}
              </p>
              <span
                className={`mt-3 h-0.5 w-0 rounded-full ${item.accent} transition-all duration-300 group-hover:w-8`}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
