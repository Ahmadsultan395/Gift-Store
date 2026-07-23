import WebsiteProvider from "@/providers/WebsiteProvider";
import Navbar from "@/components/website/Navbar";
import Footer from "@/components/website/Footer";
import ChatWidget from "@/components/website/ChatWidget";

export const metadata = {
  title: { default: "Pansar Store", template: "%s | Pansar Store" },
  description: "Fresh groceries and daily essentials",
};

export default function WebsiteLayout({ children }) {
  return (
    <WebsiteProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </div>
    </WebsiteProvider>
  );
}
