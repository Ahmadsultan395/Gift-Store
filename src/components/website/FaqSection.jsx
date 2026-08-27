"use client";
import { useState } from "react";
import { HelpCircle, Plus, Gift } from "lucide-react";

function FaqItem({ faq, index, isOpen, onToggle }) {
  return (
    <div
      style={{ animationDelay: `${index * 70}ms` }}
      className={`faq-item-in group relative overflow-hidden rounded-[20px] border transition-all duration-500 ease-out
        shadow-[0_8px_12px_rgba(15,23,42,0.08),0_18px_30px_rgba(15,23,42,0.14),0_30px_50px_rgba(15,23,42,0.08)]
        hover:shadow-[0_10px_15px_rgba(15,23,42,0.10),0_22px_40px_rgba(15,23,42,0.18),0_35px_60px_rgba(15,23,42,0.10)]
        
         ${
           isOpen
             ? "-translate-y-1 border-primary-300 bg-gradient-to-br from-primary-50/70 to-white shadow-xl shadow-primary-200/60"
             : "border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/60"
         }`}
    >
      {/* Top gradient bar — gold instead of teal, matches the rest of the site */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary-500 via-secondary-400 to-primary-600 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-60"
        }`}
      />

      <div
        aria-hidden
        className={`faq-blob pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-secondary-300/25 blur-3xl transition-opacity duration-700 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        aria-hidden
        className={`absolute left-0 top-1/2 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-secondary-400 via-primary-600 to-secondary-400 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isOpen ? "h-[70%]" : "h-0"
        }`}
      />

      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="relative z-10 flex w-full items-center gap-4 px-6 py-5 text-left active:scale-[0.995]"
      >
        {/* Number badge — clean gift-icon circle, count in the center,
            small gift-icon accent tucked at the bottom-right corner so
            it never overlaps the number */}
        <span className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center">
          {isOpen && (
            <span className="absolute inset-0 animate-ping rounded-full bg-secondary-400/40" />
          )}

          <span
            className={`giftbox-badge relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full shadow-sm transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isOpen
                ? "is-open scale-110 bg-gradient-to-br from-primary-600 to-primary-800 shadow-lg shadow-primary-500/40"
                : "bg-gradient-to-br from-secondary-200 to-secondary-400 group-hover:scale-105"
            }`}
          >
            <span className="giftbox-shine pointer-events-none absolute inset-0 -translate-x-full" />

            <span
              className={`relative z-10 text-xs font-extrabold transition-colors duration-500 ${
                isOpen ? "text-secondary-100" : "text-primary-800"
              }`}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </span>

          {/* gift-icon accent, corner-tucked */}
          <span
            className={`pointer-events-none absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-sm transition-all duration-500 ${
              isOpen
                ? "bg-secondary-400 text-primary-900"
                : "bg-primary-700 text-secondary-200"
            }`}
          >
            <Gift size={11} strokeWidth={2.5} />
          </span>
        </span>

        <span
          className={`flex-1 text-sm font-semibold leading-snug transition-all duration-300 sm:text-[15px] ${
            isOpen
              ? "translate-x-0.5 text-primary-800"
              : "text-slate-800 group-hover:text-primary-700"
          }`}
        >
          {faq.question}
        </span>

        <span
          className={`giftbox-badge relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full shadow-sm transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isOpen
              ? "is-open rotate-[135deg] scale-110 bg-gradient-to-br from-primary-600 to-primary-800 shadow-lg shadow-primary-500/40"
              : "bg-gradient-to-br from-secondary-200 to-secondary-400 group-hover:scale-105"
          }`}
        >
          <span className="giftbox-shine pointer-events-none absolute inset-0 -translate-x-full" />

          <Plus
            size={16}
            strokeWidth={2.5}
            className={`relative z-10 transition-colors duration-500 ${
              isOpen ? "text-secondary-100" : "text-primary-800"
            }`}
          />
        </span>
      </button>

      <div
        className="relative z-10 grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div
            className={`px-6 pb-6 pl-[68px] pr-6 transition-all duration-500 ease-out ${
              isOpen
                ? "translate-y-0 opacity-100 blur-0 delay-150"
                : "-translate-y-2 opacity-0 blur-[2px]"
            }`}
          >
            {/* ticket-stub perforation — same motif as the hero CTA divider */}
            <div className="mb-3 ml-[-68px] border-t border-dashed border-primary-800/15" />
            <p className="text-sm leading-relaxed text-slate-600">
              {faq.answer}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes faqItemIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .faq-item-in {
          animation: faqItemIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes blobFloat {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-6px, 8px) scale(1.15);
          }
        }
        .faq-blob {
          animation: blobFloat 6s ease-in-out infinite;
        }

        .giftbox-shine {
          background: linear-gradient(
            115deg,
            transparent 20%,
            rgba(255, 255, 255, 0.55) 45%,
            transparent 70%
          );
        }
        .giftbox-badge.is-open .giftbox-shine {
          animation: giftboxShineSweep 0.7s ease forwards;
        }
        @keyframes giftboxShineSweep {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Reusable, modern accordion-style FAQ list. Only one item is open at a time.
 * Visual language matches the rest of the site (wax-seal index badges,
 * gold accent bar, ticket-stub perforation on reveal) so it feels part of
 * the same gift-shop identity rather than a generic accordion.
 *
 * Props:
 * - faqs: array of { question, answer }
 * - loading: boolean, shows skeleton placeholders
 * - emptyText: string shown when there are no faqs
 * - defaultOpenFirst: boolean, whether first item is open by default (default true)
 */
export default function FaqSection({
  faqs = [],
  loading = false,
  emptyText = "No FAQs available yet.",
  defaultOpenFirst = true,
}) {
  const validFaqs = faqs.filter((f) => f?.question && f?.answer);
  const [openIndex, setOpenIndex] = useState(defaultOpenFirst ? 0 : -1);

  const handleToggle = (i) => {
    setOpenIndex((prev) => (prev === i ? -1 : i));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-16 rounded-[20px] bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:200%_100%]"
            style={{ animation: "shimmer 1.6s ease-in-out infinite" }}
          />
        ))}
        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}</style>
      </div>
    );
  }

  if (validFaqs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-primary-200 bg-[#FBF6EA]/50 py-16 text-center text-slate-400">
        <Gift size={40} className="opacity-20" />
        <p className="text-sm font-medium">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-3 ">
      {validFaqs.map((faq, i) => (
        <FaqItem
          key={i}
          faq={faq}
          index={i}
          isOpen={openIndex === i}
          onToggle={() => handleToggle(i)}
        />
      ))}
    </div>
  );
}
