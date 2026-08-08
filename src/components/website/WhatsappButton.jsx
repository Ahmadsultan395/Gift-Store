"use client";

import { useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

function buildWhatsAppLink(value) {
  if (!value) return null;

  const trimmed = String(value).trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  let digits = trimmed.replace(/\D/g, "");

  if (!digits) return null;

  // 0312... -> 92312...
  if (digits.startsWith("0")) {
    digits = `92${digits.slice(1)}`;
  }
  // 312... -> 92312...
  else if (digits.length === 11 && digits.startsWith("3")) {
    digits = `92${digits}`;
  }

  return `https://wa.me/${digits}`;
}

export default function WhatsAppButton() {
  const { storeSettings, fetchStoreSettings } = useWebsiteStore();

  useEffect(() => {
    fetchStoreSettings();
  }, [fetchStoreSettings]);

  const whatsappLink = buildWhatsAppLink(storeSettings?.socialLinks?.whatsapp);

  if (!whatsappLink) return null;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="
        group fixed z-50

        /* Mobile */
        bottom-[62px] right-3
        h-8 w-8 min-h-8 min-w-8

        /* Tablet */
        sm:bottom-[72px] sm:right-5
        sm:h-10 sm:w-10 sm:min-h-10 sm:min-w-10

        /* Desktop */
        lg:bottom-[88px] lg:right-5
        lg:h-[52px] lg:w-[52px]
        lg:min-h-[52px] lg:min-w-[52px]

        flex shrink-0 items-center justify-center
        rounded-full
        bg-[#25D366]
        text-white
        border border-white/80
        transition-transform duration-200
        hover:scale-105
        active:scale-95
      "
    >
      {/* Pulse ring */}
      <span
        className="
          wa-pulse
          pointer-events-none
          absolute inset-0
          rounded-full
          border border-[#25D366]
        "
      />

      {/* WhatsApp icon */}
      <FaWhatsapp
        className="
          relative z-10
          !h-[15px] !w-[15px]
          sm:!h-[18px] sm:!w-[18px]
          lg:!h-6 lg:!w-6
        "
      />

      {/* Tooltip — desktop only */}
      <span
        className="
          pointer-events-none
          absolute right-full top-1/2
          mr-3 hidden
          -translate-y-1/2
          whitespace-nowrap
          rounded-lg
          px-3 py-1.5
          text-xs font-medium text-white
          opacity-0
          shadow-md
          transition-opacity duration-200
          lg:block
          lg:group-hover:opacity-100
        "
      >
        Chat on WhatsApp
      </span>

      <style jsx>{`
        @keyframes waPulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }

          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        .wa-pulse {
          animation: waPulse 2.2s ease-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .wa-pulse {
            animation: none;
          }
        }
      `}</style>
    </a>
  );
}
