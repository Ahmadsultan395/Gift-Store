// components/website/OurPromise.jsx
import { Truck, ShieldCheck, HandCoins, Headphones } from "lucide-react";

export default function OurPromise() {
  const items = [
    {
      icon: Truck,
      title: "Fast Delivery",
      desc: "Same day delivery in your area",
      color: "text-blue-600",
      bg: "bg-blue-50",
      ring: "ring-blue-100",
      accent: "bg-blue-500",
      glow: "group-hover:shadow-blue-200/60",
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
      icon: HandCoins,
      title: "Best Prices",
      desc: "Fair value, no hidden charges",
      color: "text-amber-600",
      bg: "bg-amber-50",
      ring: "ring-amber-100",
      accent: "bg-amber-500",
      glow: "group-hover:shadow-amber-200/60",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      desc: "Always here to help you",
      color: "text-rose-600",
      bg: "bg-rose-50",
      ring: "ring-rose-100",
      accent: "bg-rose-500",
      glow: "group-hover:shadow-rose-200/60",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 via-white to-primary-50/60 border border-primary-100 px-6 sm:px-10 py-12">
      {/* decorative soft blobs */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary-200/30 blur-[70px]" />
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-amber-200/25 blur-[70px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="relative text-center max-w-xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-700 ring-1 ring-primary-200">
          ✨ Our Promise
        </span>
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-800">
          Quality You Can Trust, Every Single Time
        </h2>
        <p className="mt-2 text-slate-500 text-sm">
          Har order ke sath hamara commitment — freshness se le kar delivery
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
