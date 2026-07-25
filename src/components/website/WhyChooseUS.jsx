import React from "react";

export const WhyChooseUS = () => {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 p-8 border border-primary-200">
      <h2 className="mb-8 text-center text-2xl font-bold text-slate-800">
        Why Choose Pansar Store?
      </h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {[
          {
            icon: "🚚",
            title: "Fast Delivery",
            desc: "Same day delivery in your area",
          },
          {
            icon: "✅",
            title: "100% Authentic",
            desc: "Genuine products guaranteed",
          },
          {
            icon: "💰",
            title: "Best Prices",
            desc: "Competitive market prices",
          },
          {
            icon: "📞",
            title: "24/7 Support",
            desc: "Always here to help you",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex flex-col items-center text-center gap-3"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm border border-primary-100">
              {item.icon}
            </div>
            <div>
              <p className="font-bold text-slate-800">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
