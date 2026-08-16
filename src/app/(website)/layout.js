import WebsiteProvider from "@/providers/WebsiteProvider";
import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import ChatWidget from "@/components/website/ChatWidget";
import HeaderMarquee from "@/components/website/HeaderMarquee";
import WhatsAppButton from "@/components/website/WhatsappButton";
import SubscribePopup from "@/components/website/SubscribePopup";

export const metadata = {
  title: { default: "Pansar Store", template: "%s | Pansar Store" },
  description: "Fresh groceries and daily essentials",
};

export default function WebsiteLayout({ children }) {
  return (
    <WebsiteProvider>
      <div className="flex min-h-screen flex-col">
        <HeaderMarquee
          brands={[
            "100% Authentic Products",
            "Cash on Delivery Available",
            "Free Delivery Nationwide",
            "Easy & Hassle-Free Returns",
            "Secure & Trusted Shopping",
            "Best Quality Guaranteed",
          ]}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
        <WhatsAppButton />

        {/* Site-wide subscribe popup — shows on entry per the timing
            rules defined inside SubscribePopup.jsx. Mounted once here
            so it works across every page, not per-page. */}
        {/* <SubscribePopup /> */}
      </div>
    </WebsiteProvider>
  );
}
