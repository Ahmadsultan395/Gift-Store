"use client";
import { useEffect, useState } from "react";
import { Truck, PackageCheck } from "lucide-react";
import HeroSlider from "@/components/website/HeroSlider";
import { useWebsiteStore } from "@/stores/useWebsiteStore";
import { CategoryAndBrand } from "@/components/website/CategoryAndBrand";
import ProductShowCase from "@/components/website/ProductShowCase";
import GenderShowcase from "@/components/website/GenderShowcase";
import BestSellersStrip from "@/components/website/BestSellersStrip";
import PromoBanner from "@/components/website/PromoBanner";
import StatsBanner from "@/components/website/StatsBanner";
import TestimonialsSection from "@/components/website/TestimonialsSection";
import FaqHomeSection from "@/components/website/FaqHomeSection";
import HomeContactSection from "@/components/website/HomeContactSection";
import LovedByStrip from "@/components/website/LovedByStrip";
import OurPromise from "@/components/website/OurPromise";

export default function HomePage() {
  const {
    banners,
    fetchBanners,
    categories,
    fetchCategories,
    brands,
    fetchBrands,
    storeSettings,
    featuredProducts,
    newArrivals,
    flashSaleProducts,
    menProducts,
    womenProducts,
    kidsProducts,
    bestSellers,
    featuredLoading,
    newArrivalsLoading,
    flashSaleLoading,
    menLoading,
    womenLoading,
    kidsLoading,
    bestSellersLoading,
    fetchHomeProducts,
    fetchStoreSettings,
  } = useWebsiteStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchBanners();
    fetchBrands();
  }, [fetchCategories, fetchBanners, fetchBrands]);

  useEffect(() => {
    fetchHomeProducts();
    fetchStoreSettings().finally(() => setLoading(false));
  }, []);

  const faqs = storeSettings?.faqs || [];

  return (
    <div>
      {/* Hero */}
      <HeroSlider banners={banners} />
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-14">
        {/* Category */}
        <CategoryAndBrand
          categories={categories}
          brands={brands}
          bShow={false}
          cShow={true}
        />

        {/* Trending — Flash Sale / Featured / New Arrivals — each section
            renders as soon as ITS OWN data is back, independent of the
            others */}
        <ProductShowCase
          flashSaleLoading={flashSaleLoading}
          featuredLoading={featuredLoading}
          newArrivalsLoading={newArrivalsLoading}
          flashSaleProducts={flashSaleProducts}
          featuredProducts={featuredProducts}
          newArrivals={newArrivals}
        />

        {/* Best Sellers — ranked strip */}
        <BestSellersStrip products={bestSellers} loading={bestSellersLoading} />

        {/* Men's Picks — dark horizontal carousel */}
        <GenderShowcase
          gender="Men"
          products={menProducts}
          loading={menLoading}
        />

        {/* Promo — free gift wrapping */}
        <PromoBanner
          eyebrow="Every Order"
          title="Gift Wrapped, Always Free"
          subtitle="Every single order leaves us beautifully packed — no extra charge, no exceptions."
          ctaLabel="Explore Gifts"
          ctaHref="/products"
          icon={PackageCheck}
        />

        {/* Women's Picks — elegant airy grid */}
        <GenderShowcase
          gender="Women"
          products={womenProducts}
          loading={womenLoading}
        />

        {/* Promo — delivery */}
        <PromoBanner
          eyebrow="Nationwide"
          title="Fast, Reliable Delivery"
          subtitle="Same-day delivery in your area, and safe nationwide shipping for everywhere else."
          ctaLabel="Start Shopping"
          ctaHref="/products"
          icon={Truck}
          reverse
        />

        {/* Kids' Picks — playful colorful grid */}
        <GenderShowcase
          gender="Kids"
          products={kidsProducts}
          loading={kidsLoading}
        />

        {/* Loved By Our Customers — compact rotating-quote banner */}
        <LovedByStrip />

        {/* Why Choose Us / Our Promise (merged) — trust building right after products */}
        <OurPromise />

        {/* Stats Banner — visual break with dark contrast */}
        <StatsBanner />

        {/* Brand */}
        <CategoryAndBrand
          categories={categories}
          brands={brands}
          bShow={true}
          cShow={false}
        />

        {/* Testimonials — social proof */}
        <TestimonialsSection />

        {/* FAQ — clear objections */}
        <FaqHomeSection />

        {/* Contact — last, for further help */}
        <HomeContactSection />
      </div>
    </div>
  );
}
