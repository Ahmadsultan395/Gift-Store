"use client";
import { useEffect, useState } from "react";
import { Star, Quote, User } from "lucide-react";

export default function LovedByStrip() {
  const [testimonials, setTestimonials] = useState([]);
  const [active, setActive] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    fetch("/api/testimonials?page=1&limit=8")
      .then((r) => r.json())
      .then((res) => setTestimonials(res.data?.testimonials || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (testimonials.length < 2) return;
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setActive((p) => (p + 1) % testimonials.length);
        setFade(true);
      }, 250);
    }, 4000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;

  const current = testimonials[active];

  function scrollToReviews() {
    document
      .getElementById("testimonials-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      onClick={scrollToReviews}
      className="group relative cursor-pointer overflow-hidden rounded-[24px] border border-primary-100 bg-gradient-to-r from-primary-50/60 via-white to-primary-50/60 px-6 py-6 transition-colors hover:border-primary-200 sm:px-9 sm:py-7"
    >
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
        {/* overlapping avatar stack */}
        <div className="flex shrink-0 items-center">
          <div className="flex -space-x-3">
            {testimonials.slice(0, 5).map((t, i) => (
              <div
                key={t._id || i}
                className="h-11 w-11 overflow-hidden rounded-full border-2 border-white shadow-sm ring-1 ring-primary-100"
                style={{ zIndex: 5 - i }}
              >
                {t.photo ? (
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary-700 text-secondary-200">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="ml-3">
            <div className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className="fill-amber-400" />
              ))}
            </div>
            <p className="text-xs font-bold text-primary-800">
              Loved By Our Customers
            </p>
          </div>
        </div>

        <div className="hidden h-10 w-px bg-primary-100 sm:block" />

        {/* rotating quote */}
        <div className="min-w-0 flex-1">
          <div
            className={`flex items-start gap-2 transition-opacity duration-300 ${fade ? "opacity-100" : "opacity-0"}`}
          >
            <Quote
              size={22}
              className="mt-0.5 shrink-0 text-primary-200"
              fill="currentColor"
              strokeWidth={0}
            />
            <p className="line-clamp-2 font-serif text-base italic leading-snug text-[#2A0A11]/85 sm:text-lg">
              {current.message}
            </p>
          </div>
          <p className="mt-1.5 pl-7 text-xs font-semibold text-primary-700/70">
            — {current.name}
          </p>
        </div>

        <span className="hidden shrink-0 text-xs font-bold uppercase tracking-wide text-primary-600 underline-offset-4 group-hover:underline sm:inline-block">
          Read All Reviews →
        </span>
      </div>
    </section>
  );
}
