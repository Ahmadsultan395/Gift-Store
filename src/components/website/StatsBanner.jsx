import React from "react";

const StatsBanner = () => {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-primary-800 to-primary-800 p-8 text-white">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
        {[
          ["500+", "Products"],
          ["1000+", "Happy Customers"],
          ["5+", "Years Experience"],
          ["10+", "Brands"],
        ].map(([n, l]) => (
          <div key={l}>
            <p className="text-3xl font-extrabold text-primary-300">{n}</p>
            <p className="mt-1 text-white/70 text-sm">{l}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsBanner;
