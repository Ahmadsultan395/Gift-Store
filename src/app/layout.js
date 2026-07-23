import StoreHydrate from "@/components/admin/StoreHydrate";
import "./globals.css";

export const metadata = {
  title: { default: "Pansar Store", template: "%s | Pansar Store" },
  description:
    "Your trusted pansar store for fresh groceries and daily essentials.",
  keywords: ["pansar", "grocery", "online shopping", "Pakistan"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <StoreHydrate />
        {children}
      </body>
    </html>
  );
}
