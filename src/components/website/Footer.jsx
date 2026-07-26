"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  Store,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useWebsiteStore } from "@/stores/useWebsiteStore";
import Image from "next/image";

const quickLinks = [
  ["Home", "/"],
  ["Products", "/products"],
  ["Cart", "/cart"],
  ["My Orders", "/account/orders"],
  ["Contact", "/contact"],
];

const policies = [
  ["Privacy Policy", "/privacy"],
  ["Return Policy", "/return-policy"],
  ["Terms & Conditions", "/terms"],
];

const socials = {
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: FaWhatsapp,
  youtube: Youtube,
};

const linkStyle =
  "group flex items-center gap-3 text-sm text-slate-300 transition-all duration-500 ease-out hover:text-white hover:translate-x-1";

function FooterLink({ name, url }) {
  return (
    <Link href={url} className={linkStyle}>
      <span className="h-1 w-0 rounded bg-primary-500 transition-all duration-500 ease-out group-hover:w-3" />
      {name}
    </Link>
  );
}

function ContactItem({ icon: Icon, value, href }) {
  if (!value) return null;

  return (
    <a href={href} className={linkStyle}>
      <span
        className="
        h-10 w-10 shrink-0 rounded-full
        bg-slate-900
        flex items-center justify-center
        text-primary-500
        transition-all duration-500
        group-hover:bg-primary-500
        group-hover:text-white
        group-hover:scale-110
        "
      >
        <Icon size={16} />
      </span>

      <span>{value}</span>
    </a>
  );
}

export default function Footer() {
  const { storeSettings, fetchStoreSettings } = useWebsiteStore();

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const form = storeSettings || {};

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-slate-300">
      <div
        className="
absolute top-0 left-1/2
-translate-x-1/2
h-44 w-[420px]
bg-primary-500/10
blur-[90px]
"
      />

      <div className="relative max-w-7xl mx-auto px-5 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* BRAND */}

          <div>
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <span
                className="
h-12 w-12 rounded-xl
bg-primary-500
flex items-center justify-center
text-white shadow-lg
transition-transform duration-700
group-hover:scale-110
group-hover:rotate-6
"
              >
                {storeSettings?.logo?.url ? (
                  <Image
                    src={storeSettings.logo.url}
                    alt={storeSettings?.storeName || "Store Logo"}
                    width={44}
                    height={44}
                    className="h-full w-full rounded-lg object-contain"
                  />
                ) : (
                  <Store size={21} className="h-4 w-4 sm:h-6 sm:w-6" />
                )}
              </span>

              <span
                className="
text-xl font-bold text-white
group-hover:text-primary-400
"
              >
                {form.storeName || "Store"}
              </span>
            </Link>

            <p className="text-sm leading-7 text-slate-300">
              {form.description ||
                "Premium products with trusted quality and smooth shopping experience."}
            </p>

            <div className="flex gap-3 mt-6">
              {Object.entries(socials).map(([key, Icon]) => {
                if (!form.socialLinks?.[key]) return null;

                return (
                  <a
                    key={key}
                    href={form.socialLinks[key]}
                    target="_blank"
                    rel="noreferrer"
                    className="
h-10 w-10 rounded-full
bg-slate-900
border border-slate-800
flex items-center justify-center
text-slate-300
transition-all duration-500
hover:bg-primary-500
hover:text-white
hover:-translate-y-1
"
                  >
                    <Icon size={17} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* LINKS */}

          {[
            ["Quick Links", quickLinks],
            ["Policies", policies],
          ].map(([title, items]) => (
            <div key={title}>
              <h3
                className="
text-white text-sm font-semibold
uppercase tracking-[.2em]
mb-6
"
              >
                {title}
              </h3>

              <ul className="space-y-4">
                {items.map(([name, url]) => (
                  <li key={url}>
                    <FooterLink name={name} url={url} />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CONTACT */}

          <div>
            <h3
              className="
text-white text-sm font-semibold
uppercase tracking-[.2em]
mb-6
"
            >
              Contact
            </h3>

            <div className="space-y-5">
              <ContactItem
                icon={Phone}
                value={form.phone}
                href={`tel:${form.phone}`}
              />

              <ContactItem
                icon={Mail}
                value={form.email}
                href={`mailto:${form.email}`}
              />

              <ContactItem
                icon={MapPin}
                value={form.address}
                href={`https://www.google.com/maps/search/${encodeURIComponent(form.address || "")}`}
              />
            </div>
          </div>
        </div>

        <div
          className="
mt-14 pt-6
border-t border-slate-800
flex flex-col sm:flex-row
justify-between items-center
gap-3
text-xs text-slate-400
"
        >
          <p>
            © {new Date().getFullYear()} {form.storeName || "Store"}. All rights
            reserved.
          </p>

          <p className="hover:text-white">Premium Shopping Experience</p>
        </div>
      </div>
    </footer>
  );
}
