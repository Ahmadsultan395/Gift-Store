"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Leaf,
  Truck,
  Apple,
  Carrot,
  Milk,
  Fish,
  Wheat,
  Egg,
} from "lucide-react";

const DEFAULT_SLIDES = [
  {
    _id: "1",
    title: "Fresh Groceries Delivered",
    subtitle: "Farm-picked produce at your doorstep, same day",
    link: "/products",
    image: { url: "" },
  },
  {
    _id: "2",
    title: "Best Prices in Town",
    subtitle: "Compare and save on every daily essential",
    link: "/products",
    image: { url: "" },
  },
];

const SLIDE_DURATION = 5000;

// Grocery-category icons: produce, dairy, seafood, bakery
const FLOATING_ICONS = [
  { Icon: Apple, left: "9%", delay: "0s", size: 17, rotate: "-8deg" },
  { Icon: Milk, left: "23%", delay: "0.5s", size: 18, rotate: "5deg" },
  { Icon: Carrot, left: "38%", delay: "1s", size: 16, rotate: "-4deg" },
  { Icon: Fish, left: "55%", delay: "0.3s", size: 17, rotate: "7deg" },
  { Icon: Wheat, left: "71%", delay: "0.8s", size: 17, rotate: "-6deg" },
  { Icon: Egg, left: "87%", delay: "0.2s", size: 15, rotate: "4deg" },
];

export default function HeroSlider({ banners = [] }) {
  const slides = banners.length > 0 ? banners : DEFAULT_SLIDES;
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const touchStartX = useRef(null);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(() => {
      setCur((p) => (p + 1) % slides.length);
      setProgressKey((k) => k + 1);
    }, SLIDE_DURATION);
    return () => clearInterval(t);
  }, [slides.length, paused]);

  const goTo = useCallback((i) => {
    setCur(i);
    setProgressKey((k) => k + 1);
  }, []);

  const prev = () => goTo((cur - 1 + slides.length) % slides.length);
  const next = () => goTo((cur + 1) % slides.length);

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  const onTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) (diff > 0 ? next : prev)();
    touchStartX.current = null;
  };

  const slide = slides[cur];

  return (
    <div
      className="relative w-full overflow-hidden focus:outline-none"
      tabIndex={0}
      role="region"
      aria-label="Promotional banner carousel"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative min-h-[480px] md:min-h-[580px] bg-primary">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -left-20 top-1/4 z-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-10 z-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

        {/* Background layers with crossfade + ken burns */}
        {slides.map((s, i) => (
          <div
            key={s._id ?? i}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
              i === cur ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {s.image?.url ? (
              <img
                src={s.image.url}
                alt=""
                className={`h-full w-full object-cover ${i === cur ? "kenburns" : ""}`}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary via-primary/50 to-primary/10" />
            )}
            <svg
              className="absolute -right-24 -top-24 h-[420px] w-[420px] opacity-20"
              viewBox="0 0 200 200"
            >
              <path
                fill="#A8E063"
                d="M45.3,-58.6C58.5,-49.6,68.6,-34.8,72.1,-18.5C75.6,-2.1,72.5,15.8,64.2,30.7C55.9,45.6,42.4,57.4,26.8,64.5C11.2,71.6,-6.5,74,-23.4,69.7C-40.3,65.4,-56.3,54.4,-65.8,39.3C-75.3,24.2,-78.2,5.1,-74.5,-12.4C-70.8,-29.9,-60.5,-45.9,-46.6,-55.1C-32.7,-64.3,-15.4,-66.7,1.4,-68.4C18.1,-70.1,32.1,-67.6,45.3,-58.6Z"
                transform="translate(100 100)"
              />
            </svg>
          </div>
        ))}

        {/* Dark diagonal overlay for text legibility */}
        {/* <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 via-black/30 to-transparent" /> */}

        {/* Floating delivery badge */}
        <div className="absolute right-6 top-6 z-30 hidden items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-2 backdrop-blur-md md:flex">
          <Truck
            size={15}
            className="text-background text-white"
            strokeWidth={2.5}
          />
          <span className="text-xs font-semibold text-background text-white">
            Free delivery on orders over Rs. 5000
          </span>
        </div>

        {/* Content */}
        <div className="relative z-20 mx-auto flex h-full max-w-7xl items-center px-6 py-16 md:px-12">
          <div
            key={cur}
            className="fade-in-up max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm md:border-none md:bg-transparent md:p-0 md:backdrop-blur-none"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent backdrop-blur-sm">
              <Leaf size={13} strokeWidth={2.5} />
              Fresh Picks
            </span>

            <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-white md:text-6xl">
              {slide.title}
            </h1>

            <p className="mt-4 max-w-md text-base font-medium text-white/75 md:text-lg">
              {slide.subtitle}
            </p>

            {slide.link && (
              <Link
                href={slide.link}
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-950/30 transition-all hover:bg-accent/80 hover:shadow-xl hover:shadow-orange-950/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                Shop Now
                <ChevronRight
                  size={16}
                  strokeWidth={3}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            )}
          </div>
        </div>

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Progress-bar indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-20 left-1/2 z-30 flex -translate-x-1/2 gap-2 md:bottom-24">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="h-1.5 w-10 overflow-hidden rounded-full bg-white/25"
              >
                {i === cur && (
                  <span
                    key={progressKey}
                    className="block h-full rounded-full bg-accent progress-fill"
                    style={{
                      animationDuration: `${SLIDE_DURATION}ms`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                  />
                )}
                {i < cur && (
                  <span className="block h-full w-full rounded-full bg-white/70" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Unique wave edge — grocery-category icons riding the waves */}
        <div className="absolute inset-x-0 bottom-0 z-20 h-20 md:h-28">
          {FLOATING_ICONS.map(({ Icon, left, delay, size, rotate }, idx) => (
            <span
              key={idx}
              className="bob absolute bottom-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/5 md:bottom-5 md:h-9 md:w-9"
              style={{ left, animationDelay: delay, ["--tilt"]: rotate }}
            >
              <Icon size={size} className="text-primary" strokeWidth={2.2} />
            </span>
          ))}

          <svg
            className="wave-drift absolute -left-[15%] bottom-0 h-full w-[130%]"
            viewBox="0 0 1200 140"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C150,130 300,-10 450,60 C600,130 750,-10 900,60 C1000,105 1100,20 1200,70 L1200,140 L0,140 Z"
              className="fill-white"
              opacity="1"
            />
            <path
              d="M0,90 C180,140 340,30 500,85 C660,140 820,20 980,80 C1060,110 1140,50 1200,95 L1200,140 L0,140 Z"
              className="fill-white"
              opacity="0.45"
            />
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes kenburns {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.08);
          }
        }
        .kenburns {
          animation: kenburns 6s ease-out forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes progressFill {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .progress-fill {
          animation-name: progressFill;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }

        @keyframes waveDrift {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-4%);
          }
        }
        .wave-drift {
          animation: waveDrift 5s ease-in-out infinite alternate;
        }

        @keyframes bob {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(var(--tilt));
          }
        }
        .bob {
          animation: bob 2.8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .kenburns,
          .fade-in-up,
          .progress-fill,
          .wave-drift,
          .bob {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
