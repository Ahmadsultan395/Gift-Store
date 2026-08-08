// components/website/BrandMarquee.jsx
"use client";

export default function HeaderMarquee({ brands = [], speed = 80 }) {
  const normalized = brands.map((b) =>
    typeof b === "string" ? { name: b, logo: null } : b,
  );

  if (!normalized.length) return null;

  // Jitna zyada items chahiye track lamba karne ke liye, utni baar repeat karein
  // taake loop seamless lage (jump na aaye) — bade screens par bhi track
  // dense rahe, isliye kam items hone par zyada repeat karte hain.
  const repeatCount = normalized.length < 4 ? 8 : normalized.length < 8 ? 5 : 3;
  const items = Array.from({ length: repeatCount }).flatMap(() => normalized);

  return (
    <section className="overflow-hidden py-3 bg-[#030B1A]">
      <div className="relative flex overflow-hidden">
        <div
          className="flex w-max animate-marquee items-center gap-x-10 sm:gap-x-20 lg:gap-x-44"
          style={{ animationDuration: `${speed}s` }}
        >
          {items.map((item, i) =>
            item.logo ? (
              <img
                key={i}
                src={item.logo}
                alt={item.name}
                className="h-7 w-auto opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 shrink-0"
              />
            ) : (
              <span
                key={i}
                className="text-sm font-medium text-white whitespace-nowrap shrink-0"
              >
                {item.name}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
