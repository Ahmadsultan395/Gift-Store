// HOME ONE
// ========================================================

// "use client";
// import { useState, useEffect, useRef, useCallback } from "react";
// import Link from "next/link";
// import { ChevronLeft, ChevronRight, Gift, Truck, Sparkles } from "lucide-react";

// const DEFAULT_SLIDES = [
//   {
//     _id: "1",
//     title: "Gifts That Speak From The Heart",
//     subtitle: "Curated gift packs & premium picks for every occasion",
//     link: "/products",
//     image: { url: "" },
//   },
//   {
//     _id: "2",
//     title: "Make Every Occasion Special",
//     subtitle: "Eid, Christmas, Birthdays & more — gifts for kids, women & men",
//     link: "/products",
//     image: { url: "" },
//   },
// ];

// const SLIDE_DURATION = 5000;

// export default function HeroSlider({ banners = [] }) {
//   const slides = banners.length > 0 ? banners : DEFAULT_SLIDES;
//   const [cur, setCur] = useState(0);
//   const [paused, setPaused] = useState(false);
//   const [progressKey, setProgressKey] = useState(0);
//   const touchStartX = useRef(null);

//   useEffect(() => {
//     if (paused || slides.length <= 1) return;
//     const t = setInterval(() => {
//       setCur((p) => (p + 1) % slides.length);
//       setProgressKey((k) => k + 1);
//     }, SLIDE_DURATION);
//     return () => clearInterval(t);
//   }, [slides.length, paused]);

//   const goTo = useCallback((i) => {
//     setCur(i);
//     setProgressKey((k) => k + 1);
//   }, []);

//   const prev = () => goTo((cur - 1 + slides.length) % slides.length);
//   const next = () => goTo((cur + 1) % slides.length);

//   const onKeyDown = (e) => {
//     if (e.key === "ArrowLeft") prev();
//     if (e.key === "ArrowRight") next();
//   };

//   const onTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
//   const onTouchEnd = (e) => {
//     if (touchStartX.current === null) return;
//     const diff = touchStartX.current - e.changedTouches[0].clientX;
//     if (Math.abs(diff) > 50) (diff > 0 ? next : prev)();
//     touchStartX.current = null;
//   };

//   const slide = slides[cur];

//   return (
//     <div
//       className="relative w-full overflow-hidden focus:outline-none"
//       tabIndex={0}
//       role="region"
//       aria-label="Promotional banner carousel"
//       onKeyDown={onKeyDown}
//       onMouseEnter={() => setPaused(true)}
//       onMouseLeave={() => setPaused(false)}
//       onTouchStart={onTouchStart}
//       onTouchEnd={onTouchEnd}
//     >
//       <div className="relative min-h-[520px] overflow-hidden bg-gradient-to-b from-primary-900 via-primary-800 to-primary-700 md:min-h-[600px]">
//         {/* Wrapping-paper texture — faint diamond dot lattice */}
//         <svg
//           className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <defs>
//             <pattern
//               id="wrapDots"
//               width="34"
//               height="34"
//               patternUnits="userSpaceOnUse"
//               patternTransform="rotate(45)"
//             >
//               <circle cx="8" cy="8" r="1.6" fill="#D4AF37" />
//             </pattern>
//           </defs>
//           <rect width="100%" height="100%" fill="url(#wrapDots)" />
//         </svg>

//         {/* Ambient glows */}
//         <div className="pointer-events-none absolute -left-24 top-1/3 z-10 h-72 w-72 rounded-full bg-secondary-500/10 blur-3xl" />
//         <div className="pointer-events-none absolute -right-16 bottom-10 z-10 h-64 w-64 rounded-full bg-primary-400/10 blur-3xl" />

//         {/* Background image layers with crossfade + ken burns */}
//         {slides.map((s, i) => (
//           <div
//             key={s._id ?? i}
//             className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
//               i === cur ? "opacity-100 z-0" : "opacity-0 z-0"
//             }`}
//           >
//             {s.image?.url && (
//               <img
//                 src={s.image.url}
//                 alt=""
//                 className={`h-full w-full object-cover ${i === cur ? "kenburns" : ""}`}
//               />
//             )}
//             {/* Gradient overlay for text legibility — image stays visible through it */}
//             <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 via-primary-900/55 to-primary-900/85" />
//           </div>
//         ))}

//         {/* ── Signature: crossed ribbons + wax seal emblem, top-center ── */}
//         <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-40 w-full max-w-md -translate-x-1/2 md:h-52">
//           <div className="ribbon-x-a absolute left-1/2 top-0 h-full w-16 -translate-x-1/2 bg-gradient-to-b from-secondary-300 via-secondary-400 to-secondary-500/0 shadow-[0_0_18px_rgba(0,0,0,0.2)]" />
//           <div className="seal-drop absolute left-1/2 top-16 z-[1] flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full border-4 border-secondary-200 bg-gradient-to-br from-secondary-400 to-secondary-600 shadow-[0_6px_16px_rgba(0,0,0,0.35)] md:top-20 md:h-24 md:w-24">
//             <div className="flex h-[85%] w-[85%] items-center justify-center rounded-full border border-secondary-200/60">
//               <Gift size={28} className="text-primary-900" strokeWidth={2} />
//             </div>
//           </div>
//         </div>

//         {/* Floating delivery badge */}
//         <div className="absolute right-6 top-6 z-30 hidden items-center gap-2 rounded-full border border-secondary-300/30 bg-primary-950/40 px-4 py-2 backdrop-blur-md md:flex">
//           <Truck size={15} className="text-secondary-200" strokeWidth={2.5} />
//           <span className="text-xs font-semibold text-white/90">
//             Free delivery on orders over Rs. 5000
//           </span>
//         </div>

//         {/* Content card */}
//         <div className="relative z-20 mx-auto flex h-full max-w-7xl items-center px-6 pb-16 pt-32 md:px-12 md:pt-40">
//           <div
//             key={cur}
//             className="fade-in-up max-w-xl rounded-[28px] border border-secondary-300/20 bg-white/[0.06] p-7 text-center shadow-2xl backdrop-blur-md md:mx-auto md:p-10"
//           >
//             <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-secondary-200">
//               Premium Gifts
//             </span>

//             <h1 className="mt-3 font-serif text-4xl italic leading-[1.08] tracking-tight text-white md:text-6xl">
//               {slide.title}
//             </h1>

//             <p className="mx-auto mt-4 max-w-md text-base font-medium text-white/70 md:text-lg">
//               {slide.subtitle}
//             </p>

//             <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
//               {slide.link && (
//                 <Link
//                   href={slide.link}
//                   className="group inline-flex items-center gap-2 rounded-full bg-secondary-400 px-7 py-3.5 text-sm font-bold text-primary-950 shadow-lg shadow-black/20 transition-all hover:bg-secondary-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
//                 >
//                   Shop Now
//                   <ChevronRight
//                     size={16}
//                     strokeWidth={3}
//                     className="transition-transform group-hover:translate-x-1"
//                   />
//                 </Link>
//               )}

//               {/* Hanging gift tag */}
//               <div className="tag-swing">
//                 <svg width="4" height="22" className="mx-auto -mb-px">
//                   <line
//                     x1="2"
//                     y1="0"
//                     x2="2"
//                     y2="22"
//                     stroke="rgba(255,255,255,0.45)"
//                     strokeWidth="1.5"
//                     strokeDasharray="1 2"
//                   />
//                 </svg>
//                 <div className="relative flex items-center gap-1.5 rounded-lg border border-secondary-300/50 bg-secondary-50 px-3 py-1.5 shadow-md">
//                   <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-secondary-400 bg-primary-800" />
//                   <Sparkles
//                     size={12}
//                     className="text-primary-700"
//                     strokeWidth={2.5}
//                   />
//                   <span className="text-[11px] font-bold uppercase tracking-wide text-primary-800">
//                     Gift Wrapped Free
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Arrows */}
//         {slides.length > 1 && (
//           <>
//             <button
//               onClick={prev}
//               aria-label="Previous slide"
//               className="absolute left-4 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
//             >
//               <ChevronLeft size={20} />
//             </button>
//             <button
//               onClick={next}
//               aria-label="Next slide"
//               className="absolute right-4 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
//             >
//               <ChevronRight size={20} />
//             </button>
//           </>
//         )}

//         {/* Progress indicators — gold beads on a string */}
//         {slides.length > 1 && (
//           <div className="absolute bottom-16 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 md:bottom-20">
//             {slides.map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => goTo(i)}
//                 aria-label={`Go to slide ${i + 1}`}
//                 className="group relative flex h-4 w-4 items-center justify-center"
//               >
//                 <span
//                   className={`h-2 w-2 rounded-full border transition-all duration-300 ${
//                     i === cur
//                       ? "scale-125 border-secondary-200 bg-secondary-300"
//                       : i < cur
//                         ? "border-white/50 bg-white/50"
//                         : "border-white/30 bg-transparent"
//                   }`}
//                 />
//                 {i === cur && (
//                   <span
//                     key={progressKey}
//                     className="bead-ring absolute inset-0 rounded-full border border-secondary-200"
//                     style={{
//                       animationDuration: `${SLIDE_DURATION}ms`,
//                       animationPlayState: paused ? "paused" : "running",
//                     }}
//                   />
//                 )}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* ── Stitched ribbon hem — clean gold dashed edge ── */}
//         <div className="absolute inset-x-0 bottom-0 z-20 h-6">
//           <svg
//             className="absolute inset-x-0 top-0 h-px w-full"
//             preserveAspectRatio="none"
//             viewBox="0 0 1200 1"
//           >
//             <line
//               x1="0"
//               y1="0.5"
//               x2="1200"
//               y2="0.5"
//               stroke="#D4AF37"
//               strokeOpacity="0.5"
//               strokeWidth="1"
//               strokeDasharray="6 6"
//             />
//           </svg>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes kenburns {
//           0% {
//             transform: scale(1);
//           }
//           100% {
//             transform: scale(1.08);
//           }
//         }
//         .kenburns {
//           animation: kenburns 6s ease-out forwards;
//         }

//         @keyframes fadeInUp {
//           from {
//             opacity: 0;
//             transform: translateY(16px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .fade-in-up {
//           animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
//         }

//         @keyframes tagSwing {
//           0%,
//           100% {
//             transform: rotate(-3deg);
//           }
//           50% {
//             transform: rotate(3deg);
//           }
//         }
//         .tag-swing {
//           transform-origin: top center;
//           animation: tagSwing 3.2s ease-in-out infinite;
//         }

//         .seal-drop {
//           animation: sealDrop 0.7s cubic-bezier(0.2, 0.9, 0.3, 1.2) both;
//         }
//         @keyframes sealDrop {
//           0% {
//             transform: translate(-50%, -30px) scale(0.6);
//             opacity: 0;
//           }
//           100% {
//             transform: translate(-50%, 0) scale(1);
//             opacity: 1;
//           }
//         }

//         @keyframes beadRing {
//           from {
//             transform: scale(1);
//             opacity: 0.8;
//           }
//           to {
//             transform: scale(2.2);
//             opacity: 0;
//           }
//         }
//         .bead-ring {
//           animation: beadRing linear forwards;
//         }

//         @media (prefers-reduced-motion: reduce) {
//           .kenburns,
//           .fade-in-up,
//           .tag-swing,
//           .seal-drop,
//           .bead-ring {
//             animation: none !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// =====================================================
// HOME TWO
// =====================================

// "use client";
// import { useState, useEffect, useRef, useCallback } from "react";
// import Link from "next/link";
// import { ChevronLeft, ChevronRight, Gift, Truck, Sparkles } from "lucide-react";

// const DEFAULT_SLIDES = [
//   {
//     _id: "1",
//     title: "Gifts That Speak From The Heart",
//     subtitle: "Curated gift packs & premium picks for every occasion",
//     link: "/products",
//     image: { url: "" },
//   },
//   {
//     _id: "2",
//     title: "Make Every Occasion Special",
//     subtitle: "Eid, Christmas, Birthdays & more — gifts for kids, women & men",
//     link: "/products",
//     image: { url: "" },
//   },
// ];

// const SLIDE_DURATION = 5000;

// // Stamp-style perforation strip — a repeating row of punched-out semicircles,
// // like the edge of a postage stamp, where the photo meets the kraft dock.
// const PERFORATION_STYLE = {
//   height: "18px",
//   backgroundImage:
//     "radial-gradient(circle at 9px -1px, transparent 9px, #EFE4C9 9.5px)",
//   backgroundSize: "20px 20px",
//   backgroundRepeat: "repeat-x",
// };

// export default function HeroSlider({ banners = [] }) {
//   const slides = banners.length > 0 ? banners : DEFAULT_SLIDES;
//   const [cur, setCur] = useState(0);
//   const [paused, setPaused] = useState(false);
//   const [progressKey, setProgressKey] = useState(0);
//   const touchStartX = useRef(null);

//   useEffect(() => {
//     if (paused || slides.length <= 1) return;
//     const t = setInterval(() => {
//       setCur((p) => (p + 1) % slides.length);
//       setProgressKey((k) => k + 1);
//     }, SLIDE_DURATION);
//     return () => clearInterval(t);
//   }, [slides.length, paused]);

//   const goTo = useCallback((i) => {
//     setCur(i);
//     setProgressKey((k) => k + 1);
//   }, []);

//   const prev = () => goTo((cur - 1 + slides.length) % slides.length);
//   const next = () => goTo((cur + 1) % slides.length);

//   const onKeyDown = (e) => {
//     if (e.key === "ArrowLeft") prev();
//     if (e.key === "ArrowRight") next();
//   };

//   const onTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
//   const onTouchEnd = (e) => {
//     if (touchStartX.current === null) return;
//     const diff = touchStartX.current - e.changedTouches[0].clientX;
//     if (Math.abs(diff) > 50) (diff > 0 ? next : prev)();
//     touchStartX.current = null;
//   };

//   const slide = slides[cur];

//   return (
//     <div
//       className="relative w-full overflow-hidden focus:outline-none"
//       tabIndex={0}
//       role="region"
//       aria-label="Promotional banner carousel"
//       onKeyDown={onKeyDown}
//       onMouseEnter={() => setPaused(true)}
//       onMouseLeave={() => setPaused(false)}
//       onTouchStart={onTouchStart}
//       onTouchEnd={onTouchEnd}
//     >
//       <div className="relative min-h-[560px] overflow-hidden bg-primary-900 md:min-h-[640px]">
//         {/* ── Full-bleed photo layers, crossfading ── */}
//         {slides.map((s, i) => (
//           <div
//             key={s._id ?? i}
//             className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
//               i === cur ? "opacity-100 z-0" : "opacity-0 z-0"
//             }`}
//           >
//             {s.image?.url ? (
//               <img
//                 src={s.image.url}
//                 alt=""
//                 className={`h-full w-full object-cover ${i === cur ? "kenburns" : ""}`}
//               />
//             ) : (
//               <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-800 via-primary-900 to-[#2A0A11]">
//                 <svg
//                   className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <defs>
//                     <pattern
//                       id={`wrapDots-${i}`}
//                       width="34"
//                       height="34"
//                       patternUnits="userSpaceOnUse"
//                       patternTransform="rotate(45)"
//                     >
//                       <circle cx="8" cy="8" r="1.6" fill="#D4AF37" />
//                     </pattern>
//                   </defs>
//                   <rect
//                     width="100%"
//                     height="100%"
//                     fill={`url(#wrapDots-${i})`}
//                   />
//                 </svg>
//                 <Gift
//                   size={90}
//                   className="text-secondary-300/25"
//                   strokeWidth={1}
//                 />
//               </div>
//             )}
//             {/* light top scrim only — just enough for the delivery badge to read */}
//             <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/35 to-transparent" />
//           </div>
//         ))}

//         {/* Draped ribbon corner accent — top-left, small footprint, doesn't cover the photo */}
//         <div className="pointer-events-none absolute -left-10 -top-10 z-10 h-32 w-32 overflow-hidden">
//           <div className="absolute left-1/2 top-1/2 h-9 w-[150%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-gradient-to-b from-secondary-300 via-secondary-400 to-secondary-500 shadow-[0_2px_10px_rgba(0,0,0,0.3)]" />
//         </div>

//         {/* Floating delivery badge */}
//         <div className="absolute right-6 top-6 z-30 hidden items-center gap-2 rounded-full border border-secondary-300/30 bg-primary-950/50 px-4 py-2 backdrop-blur-md md:flex">
//           <Truck size={15} className="text-secondary-200" strokeWidth={2.5} />
//           <span className="text-xs font-semibold text-white/90">
//             Free delivery on orders over Rs. 5000
//           </span>
//         </div>

//         {/* Arrows */}
//         {slides.length > 1 && (
//           <>
//             <button
//               onClick={prev}
//               aria-label="Previous slide"
//               className="absolute left-4 top-[42%] z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
//             >
//               <ChevronLeft size={20} />
//             </button>
//             <button
//               onClick={next}
//               aria-label="Next slide"
//               className="absolute right-4 top-[42%] z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
//             >
//               <ChevronRight size={20} />
//             </button>
//           </>
//         )}

//         {/* Progress indicators — gold beads, sit over the photo just above the dock */}
//         {slides.length > 1 && (
//           <div className="absolute bottom-[192px] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 sm:bottom-[164px] md:bottom-[152px]">
//             {slides.map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => goTo(i)}
//                 aria-label={`Go to slide ${i + 1}`}
//                 className="group relative flex h-4 w-4 items-center justify-center"
//               >
//                 <span
//                   className={`h-2 w-2 rounded-full border transition-all duration-300 ${
//                     i === cur
//                       ? "scale-125 border-secondary-200 bg-secondary-300"
//                       : i < cur
//                         ? "border-white/50 bg-white/50"
//                         : "border-white/30 bg-transparent"
//                   }`}
//                 />
//                 {i === cur && (
//                   <span
//                     key={progressKey}
//                     className="bead-ring absolute inset-0 rounded-full border border-secondary-200"
//                     style={{
//                       animationDuration: `${SLIDE_DURATION}ms`,
//                       animationPlayState: paused ? "paused" : "running",
//                     }}
//                   />
//                 )}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* ── Kraft dock — stamp-perforated strip where the photo meets the info panel ── */}
//         <div className="absolute inset-x-0 bottom-0 z-20">
//           <div style={PERFORATION_STYLE} />
//           <div className="relative bg-[#EFE4C9] px-6 pb-7 pt-8 md:px-12 md:pb-9 md:pt-9">
//             {/* postmark stamp, straddling the perforation line */}
//             <div className="stamp-drop absolute -top-9 right-6 flex h-16 w-16 rotate-[8deg] items-center justify-center rounded-full border-2 border-dashed border-primary-800/50 bg-[#EFE4C9] shadow-md md:right-12 md:h-[4.5rem] md:w-[4.5rem]">
//               <div className="flex flex-col items-center justify-center rounded-full border border-primary-800/40 px-1 py-2 text-center">
//                 <Gift size={16} className="text-primary-800" strokeWidth={2} />
//                 <span className="mt-0.5 text-[6.5px] font-extrabold uppercase tracking-[0.12em] text-primary-800 md:text-[7px]">
//                   Premium
//                 </span>
//               </div>
//             </div>

//             <div
//               key={cur}
//               className="fade-in-up flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
//             >
//               <div className="max-w-xl">
//                 <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-700">
//                   A Gift, Chosen With Care
//                 </span>
//                 <h1 className="mt-2 font-serif text-2xl italic leading-[1.12] tracking-tight text-[#2A0A11] sm:text-3xl md:text-4xl lg:text-[2.75rem]">
//                   {slide.title}
//                 </h1>
//                 <p className="mt-3 max-w-md text-sm font-medium text-[#2A0A11]/70 md:text-base">
//                   {slide.subtitle}
//                 </p>
//               </div>

//               <div className="flex shrink-0 items-center gap-5">
//                 {slide.link && (
//                   <Link
//                     href={slide.link}
//                     className="group inline-flex items-center gap-2 rounded-full bg-primary-800 px-6 py-3 text-sm font-bold text-secondary-200 shadow-lg shadow-primary-900/20 transition-all hover:bg-primary-900 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
//                   >
//                     Shop Now
//                     <ChevronRight
//                       size={16}
//                       strokeWidth={3}
//                       className="transition-transform group-hover:translate-x-1"
//                     />
//                   </Link>
//                 )}

//                 {/* hanging gift tag */}
//                 <div className="tag-swing hidden sm:block">
//                   <svg width="4" height="18" className="mx-auto -mb-px">
//                     <line
//                       x1="2"
//                       y1="0"
//                       x2="2"
//                       y2="18"
//                       stroke="rgba(42,10,17,0.35)"
//                       strokeWidth="1.5"
//                       strokeDasharray="1 2"
//                     />
//                   </svg>
//                   <div className="relative flex items-center gap-1.5 rounded-lg border border-primary-800/25 bg-primary-800 px-3 py-1.5 shadow-md">
//                     <Sparkles
//                       size={12}
//                       className="text-secondary-200"
//                       strokeWidth={2.5}
//                     />
//                     <span className="text-[11px] font-bold uppercase tracking-wide text-secondary-200">
//                       Wrapped Free
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes kenburns {
//           0% {
//             transform: scale(1);
//           }
//           100% {
//             transform: scale(1.08);
//           }
//         }
//         .kenburns {
//           animation: kenburns 6s ease-out forwards;
//         }

//         @keyframes fadeInUp {
//           from {
//             opacity: 0;
//             transform: translateY(12px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .fade-in-up {
//           animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
//         }

//         @keyframes tagSwing {
//           0%,
//           100% {
//             transform: rotate(-3deg);
//           }
//           50% {
//             transform: rotate(3deg);
//           }
//         }
//         .tag-swing {
//           transform-origin: top center;
//           animation: tagSwing 3.2s ease-in-out infinite;
//         }

//         .stamp-drop {
//           animation: stampDrop 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.3) 0.15s both;
//         }
//         @keyframes stampDrop {
//           0% {
//             transform: rotate(8deg) scale(0.4);
//             opacity: 0;
//           }
//           100% {
//             transform: rotate(8deg) scale(1);
//             opacity: 1;
//           }
//         }

//         @keyframes beadRing {
//           from {
//             transform: scale(1);
//             opacity: 0.8;
//           }
//           to {
//             transform: scale(2.2);
//             opacity: 0;
//           }
//         }
//         .bead-ring {
//           animation: beadRing linear forwards;
//         }

//         @media (prefers-reduced-motion: reduce) {
//           .kenburns,
//           .fade-in-up,
//           .tag-swing,
//           .stamp-drop,
//           .bead-ring {
//             animation: none !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// =======================================================
// HOME THREE
// =======================================
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Gift,
  Truck,
  ArrowUpRight,
} from "lucide-react";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";

const DEFAULT_SLIDES = [
  {
    _id: "1",
    title: "Gifts That Speak From The Heart",
    subtitle: "Curated gift packs & premium picks for every occasion",
    link: "/products",
    image: { url: "" },
    video: null,
  },
  {
    _id: "2",
    title: "Make Every Occasion Special",
    subtitle: "Eid, Christmas, Birthdays & more — gifts for kids, women & men",
    link: "/products",
    image: { url: "" },
    video: null,
  },
];

const SLIDE_DURATION = 3000;

// ── Single slide's media layer ───────────────────────────────────────
// Image paints instantly (poster). Video preloads silently underneath
// and crossfades in only once it can play smoothly — nothing ever
// waits on the video.
function SlideMedia({ slide, active, index }) {
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setVideoReady(false);
  }, [slide?.video?.url]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !slide?.video?.url) return;
    if (active) {
      el.play?.().catch(() => {});
    } else {
      el.pause?.();
    }
  }, [active, slide?.video?.url]);

  const hasImage = !!slide.image?.url;
  const hasVideo = !!slide.video?.url;

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-[1100ms] ease-out ${
        active ? "opacity-100 z-0" : "opacity-0 z-0"
      }`}
    >
      {hasImage ? (
        <img
          src={slide.image.url}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            hasVideo && videoReady ? "opacity-0" : "opacity-100"
          } ${active && !(hasVideo && videoReady) ? "kenburns" : ""}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#4A0E1C] via-[#3B0A14] to-[#1C0508]">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id={`wrapDots-${index}`}
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <circle cx="7" cy="7" r="1.4" fill="#D4AF37" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#wrapDots-${index})`} />
          </svg>
          <Gift size={84} className="text-[#D4AF37]/25" strokeWidth={1} />
        </div>
      )}

      {hasVideo && (
        <video
          ref={videoRef}
          src={slide.video.url}
          muted
          loop
          playsInline
          preload="auto"
          onCanPlayThrough={() => setVideoReady(true)}
          onLoadedData={(e) => {
            if (e.target.readyState >= 3) setVideoReady(true);
          }}
          onError={() => setVideoReady(false)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* full scrim for legibility of the overlaid label panel */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1C0508]/85 via-[#1C0508]/15 to-[#1C0508]/40" />
    </div>
  );
}

export default function HeroSlider({ banners = [] }) {
  const slides = banners.length > 0 ? banners : DEFAULT_SLIDES;
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const touchStartX = useRef(null);

  const pathname = usePathname();

  const [isHome, setIsHome] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkPage = () => {
      const path = window.location.pathname;

      const home = path === "/" || path === "/home" || path === "/school";

      setIsHome(home);
      setScrolled(window.scrollY > 40);
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    checkPage();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
      {isHome && (
        <div
          className={`absolute left-0 right-0 top-0 z-[60]
      transform-gpu
      transition-[transform,opacity,filter]
      duration-1000
      ${
        !scrolled
          ? "translate-y-0 scale-100 opacity-100 blur-0 pointer-events-auto"
          : "-translate-y-[110%] scale-[0.98] opacity-0 blur-[2px] pointer-events-none"
      }
    `}
          style={{
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <Navbar isHome={isHome} scrolled={scrolled} />
        </div>
      )}
      <div className="relative min-h-[560px] overflow-hidden bg-[#1C0508] md:min-h-[640px]">
        {slides.map((s, i) => (
          <SlideMedia key={s._id ?? i} slide={s} active={i === cur} index={i} />
        ))}

        {/* ── Signature: folded ribbon banner, top-right ── */}
        <div className="ribbon-drop pointer-events-none absolute -right-20 top-12 z-30 rotate-45">
          <div className="flex items-center gap-1.5 border-y-2 border-[#1C0508]/20 bg-gradient-to-b from-[#E9C468] via-[#D4AF37] to-[#B8912A] px-16 py-1.5 shadow-[0_3px_10px_rgba(0,0,0,0.35)]">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#3B0A14] whitespace-nowrap">
              Gift Of The Season
            </span>
          </div>
        </div>

        {/* Delivery badge */}
        <div className="absolute right-6 bottom-32 z-30 hidden items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#1C0508]/45 px-4 py-2 backdrop-blur-md md:flex">
          <Truck size={15} className="text-[#E9C468]" strokeWidth={2.5} />
          <span className="text-xs font-semibold text-white/90">
            Free delivery on orders over Rs. 5000
          </span>
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

        {/* ── Content label panel — bottom, frosted, full-bleed media stays visible ── */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-8 pt-16 sm:px-10 md:px-14 md:pb-11">
          <div
            key={cur}
            className="fade-in-up flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          >
            <div className="max-w-xl">
              <div className="flex items-center gap-2.5">
                <span className="h-px w-8 bg-[#D4AF37]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#E9C468]">
                  A Gift, Chosen With Care
                </span>
              </div>
              <h1 className="mt-3 font-serif text-2xl italic leading-[1.1] tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[2.75rem]">
                {slide.title}
              </h1>
              <p className="mt-3 max-w-md text-sm font-medium text-white/70 md:text-base">
                {slide.subtitle}
              </p>
            </div>

            {slide.link && (
              <Link
                href={slide.link}
                className="group inline-flex shrink-0 items-center gap-2.5 self-start rounded-full bg-[#D4AF37] py-1 pl-6 pr-1 text-sm font-bold text-[#1C0508] shadow-lg shadow-black/30 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 md:self-auto"
              >
                Shop Now
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1C0508] text-[#E9C468] transition-transform group-hover:rotate-45">
                  <ArrowUpRight size={16} strokeWidth={2.5} />
                </span>
              </Link>
            )}
          </div>

          {/* ── Segmented gold progress bar ── */}
          {slides.length > 1 && (
            <div className="mt-7 flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="group relative h-[3px] flex-1 max-w-[64px] overflow-hidden rounded-full bg-white/20"
                >
                  {i === cur && (
                    <span
                      key={progressKey}
                      className="segment-fill absolute inset-y-0 left-0 rounded-full bg-[#E9C468]"
                      style={{
                        animationDuration: `${SLIDE_DURATION}ms`,
                        animationPlayState: paused ? "paused" : "running",
                      }}
                    />
                  )}
                  {i < cur && (
                    <span className="absolute inset-0 rounded-full bg-[#E9C468]/70" />
                  )}
                </button>
              ))}
            </div>
          )}
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
          animation: kenburns 8s ease-out forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in-up {
          animation: fadeInUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .ribbon-drop {
          animation: ribbonDrop 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.2) 0.1s both;
        }
        @keyframes ribbonDrop {
          0% {
            transform: rotate(45deg) translateY(-14px);
            opacity: 0;
          }
          100% {
            transform: rotate(45deg) translateY(0);
            opacity: 1;
          }
        }

        @keyframes segmentFill {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .segment-fill {
          animation: segmentFill linear forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .kenburns,
          .fade-in-up,
          .ribbon-drop,
          .segment-fill {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
