"use client";
import { useEffect, useState } from "react";
import HeroSlider from "@/components/website/HeroSlider";
import NewsletterSection from "@/components/website/NewsletterSection";
import { useWebsiteStore } from "@/stores/useWebsiteStore";
import { CategoryAndBrand } from "@/components/website/CategoryAndBrand";
import ProductShowCase from "@/components/website/ProductShowCase";
import { WhyChooseUS } from "@/components/website/WhyChooseUS";
import StatsBanner from "@/components/website/StatsBanner";
import TestimonialsSection from "@/components/website/TestimonialsSection";
import TestimonialForm from "@/components/website/TestimonialForm";
import FaqSection from "@/components/website/FaqSection";
import FaqHomeSection from "@/components/website/FaqHomeSection";

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
    fetchHomeProducts,
    homeProductsLoading,
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
        <CategoryAndBrand categories={categories} brands={brands} />
        {/* Products Show Case */}
        <ProductShowCase
          homeProductsLoading={homeProductsLoading}
          flashSaleProducts={flashSaleProducts}
          featuredProducts={featuredProducts}
          newArrivals={newArrivals}
        />
        {/* Why Choose Us */}
        <WhyChooseUS />
        {/* Stats Banner */}
        <StatsBanner />
        {/* Newsletter */}

        <TestimonialsSection />
        {/* <TestimonialForm /> */}
        <FaqHomeSection />

        <NewsletterSection />
      </div>
    </div>
  );
}
