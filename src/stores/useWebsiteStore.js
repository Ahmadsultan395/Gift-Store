/**
 * WEBSITE GLOBAL STORE — Zustand
 *
 * Usage in any website component:
 *   import { useWebsiteStore } from "@/stores/useWebsiteStore";
 *   const { cart, addToCart, categories, customer } = useWebsiteStore();
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  customerAuthApi,
  categoriesApi,
  settingsApi,
  productsApi,
  ordersApi,
  wishlistApi,
  couponsApi,
  newsletterApi,
  bannersApi,
  brandsApi,
} from "@/services/api";

export const useWebsiteStore = create(
  persist(
    (set, get) => ({
      // ── Customer Auth ────────────────────────────────────────
      customer: null,
      authChecked: false,
      authLoading: false,

      checkAuth: async () => {
        if (get().authChecked) return;
        try {
          const data = await customerAuthApi.me();
          set({ customer: data.customer, authChecked: true });
        } catch {
          set({ customer: null, authChecked: true });
        }
      },

      register: async (body) => {
        set({ authLoading: true });
        try {
          const data = await customerAuthApi.register(body);
          set({ customer: data.customer });
          return data;
        } finally {
          set({ authLoading: false });
        }
      },

      login: async (body) => {
        set({ authLoading: true });
        try {
          const data = await customerAuthApi.login(body);
          set({ customer: data.customer });
          // Load wishlist after login
          get().fetchWishlist();
          return data;
        } finally {
          set({ authLoading: false });
        }
      },

      logout: async () => {
        await customerAuthApi.logout();
        set({ customer: null, wishlist: [], myOrders: [] });
      },

      updateProfile: async (body) => {
        const data = await customerAuthApi.updateProfile(body);
        set((s) => ({ customer: { ...s.customer, ...data } }));
        return data;
      },

      // ── Banners ─────────────────────────────────────────────
      banners: [],
      bannersLoaded: false,
      bannersLoading: false,

      fetchBanners: async () => {
        if (get().bannersLoaded) return;

        set({ bannersLoading: true });

        try {
          const data = await bannersApi.getAll();

          set({
            banners: data || [],
            bannersLoaded: true,
          });
        } catch {
        } finally {
          set({ bannersLoading: false });
        }
      },

      // ── Settings / Store Info ─────────────────────────────────
      storeSettings: null,
      settingsLoaded: false,

      fetchStoreSettings: async () => {
        if (get().settingsLoaded) return;
        try {
          const data = await settingsApi.get();
          set({ storeSettings: data, settingsLoaded: true });
        } catch {}
      },

      // ── Categories ───────────────────────────────────────────
      categories: [],
      categoriesLoaded: false,
      categoriesLoading: false,

      fetchCategories: async () => {
        if (get().categoriesLoaded) return;
        set({ categoriesLoading: true });
        try {
          const data = await categoriesApi.getAll();
          set({ categories: data || [], categoriesLoaded: true });
        } catch {
        } finally {
          set({ categoriesLoading: false });
        }
      },

      // ── Brands ───────────────────────────────────────────────
      brands: [],
      brandsLoaded: false,
      brandsLoading: false,

      fetchBrands: async () => {
        if (get().brandsLoaded) return;
        set({ brandsLoading: true });
        try {
          const data = await brandsApi.getAll();
          set({ brands: data || [], brandsLoaded: true });
        } catch {
        } finally {
          set({ brandsLoading: false });
        }
      },

      // ── Products ─────────────────────────────────────────────
      products: [],
      productsPagination: { total: 0, page: 1, pages: 1 },
      productsLoading: false,
      productFilters: {
        search: "",
        category: "",
        gender: "",
        sort: "createdAt",
        page: 1,
      },

      setProductFilters: (f) =>
        set((s) => ({
          productFilters: { ...s.productFilters, ...f, page: f.page || 1 },
        })),

      fetchProducts: async (params) => {
        const filters = params || get().productFilters;

        const cleanFilters = {
          page: filters.page || 1,
          limit: filters.limit || 24,
          sort: filters.sort || "createdAt",
        };

        if (filters.search) {
          cleanFilters.search = filters.search;
        }

        if (filters.category) {
          cleanFilters.category = filters.category;
        }

        if (filters.gender) {
          cleanFilters.gender = filters.gender;
        }

        if (filters.featured) {
          cleanFilters.featured = "true";
        }

        if (filters.newArrival) {
          cleanFilters.newArrival = "true";
        }

        if (filters.flashSale) {
          cleanFilters.flashSale = "true";
        }

        console.log("FINAL API FILTER:", cleanFilters);

        set({ productsLoading: true });

        try {
          const data = await productsApi.getList(cleanFilters);

          console.log("STORE RESPONSE:", data);

          set({
            products: data.products || [],
            productsPagination: data.pagination || {},
          });
        } catch (e) {
          console.log(e);
        } finally {
          set({ productsLoading: false });
        }
      },

      // ── Home Page Products ───────────────────────────────────
      // Each section has its OWN loading flag and fetches independently —
      // no single Promise.all blocking every section behind the slowest
      // request. On serverless (Vercel), gender-filtered queries do an
      // extra Category lookup before the Product query, so they're
      // naturally slower; sections that resolve first should render
      // immediately instead of waiting for all seven to finish together.
      featuredProducts: [],
      newArrivals: [],
      flashSaleProducts: [],
      menProducts: [],
      womenProducts: [],
      kidsProducts: [],
      bestSellers: [],

      featuredLoading: true,
      newArrivalsLoading: true,
      flashSaleLoading: true,
      menLoading: true,
      womenLoading: true,
      kidsLoading: true,
      bestSellersLoading: true,

      fetchHomeProducts: async () => {
        set({
          featuredLoading: true,
          newArrivalsLoading: true,
          flashSaleLoading: true,
          menLoading: true,
          womenLoading: true,
          kidsLoading: true,
          bestSellersLoading: true,
        });

        // Fetched ONE AT A TIME (not Promise.all) — firing 7 DB-hitting
        // requests at once was overloading the connection pool on
        // serverless (Vercel), causing random ones to silently fail or
        // time out. Sequential keeps things reliable; each section still
        // updates and renders the moment ITS data lands, so the page
        // still fills in progressively rather than waiting for all seven.
        const jobs = [
          {
            params: { flashSale: true, limit: 8 },
            dataKey: "flashSaleProducts",
            loadingKey: "flashSaleLoading",
          },
          {
            params: { featured: true, limit: 8 },
            dataKey: "featuredProducts",
            loadingKey: "featuredLoading",
          },
          {
            params: { newArrival: true, limit: 8 },
            dataKey: "newArrivals",
            loadingKey: "newArrivalsLoading",
          },
          {
            params: { sort: "popular", limit: 8 },
            dataKey: "bestSellers",
            loadingKey: "bestSellersLoading",
          },
          {
            params: { gender: "Men", limit: 8 },
            dataKey: "menProducts",
            loadingKey: "menLoading",
          },
          {
            params: { gender: "Women", limit: 8 },
            dataKey: "womenProducts",
            loadingKey: "womenLoading",
          },
          {
            params: { gender: "Kids", limit: 8 },
            dataKey: "kidsProducts",
            loadingKey: "kidsLoading",
          },
        ];

        for (const job of jobs) {
          try {
            const data = await productsApi.getList(job.params);
            set({ [job.dataKey]: data.products || [] });
          } catch (e) {
            console.log(`HOME ${job.dataKey} ERROR`, e);
          } finally {
            set({ [job.loadingKey]: false });
          }
        }
      },

      // ── Single Product ────────────────────────────────────────
      currentProduct: null,
      currentProductLoading: false,

      fetchProductBySlug: async (slug) => {
        set({ currentProductLoading: true, currentProduct: null });
        try {
          const data = await productsApi.getBySlug(slug);
          set({ currentProduct: data });
        } catch {
        } finally {
          set({ currentProductLoading: false });
        }
      },

      // ── Cart ─────────────────────────────────────────────────
      cart: [],
      hydrated: false,

      setHydrated: (value) =>
        set({
          hydrated: value,
        }),

      addToCart: (product, qty = 1) => {
        set((s) => {
          const existing = s.cart.find((i) => i._id === product._id);
          if (existing) {
            const newQty = existing.qty + qty;
            if (newQty > product.stock) return s;
            return {
              cart: s.cart.map((i) =>
                i._id === product._id ? { ...i, qty: newQty } : i,
              ),
            };
          }
          return {
            cart: [
              ...s.cart,
              {
                _id: product._id,
                name: product.name,
                slug: product.slug,
                price: product.sellingPrice,
                image: product.images?.[0]?.url || "",
                unit: product.unit || "pcs",
                stock: product.stock,
                qty,
              },
            ],
          };
        });
      },

      updateCartQty: (id, qty) => {
        if (qty <= 0) {
          get().removeFromCart(id);
          return;
        }
        set((s) => ({
          cart: s.cart.map((i) => (i._id === id ? { ...i, qty } : i)),
        }));
      },

      removeFromCart: (id) =>
        set((s) => ({ cart: s.cart.filter((i) => i._id !== id) })),

      clearCart: () =>
        set({ cart: [], appliedCoupon: null, couponDiscount: 0 }),

      get cartCount() {
        return get().cart.reduce((s, i) => s + i.qty, 0);
      },
      get cartSubTotal() {
        return get().cart.reduce((s, i) => s + i.price * i.qty, 0);
      },

      // ── Coupon ────────────────────────────────────────────────
      appliedCoupon: null,
      couponDiscount: 0,

      applyCoupon: async (code) => {
        const subTotal = get().cart.reduce((s, i) => s + i.price * i.qty, 0);
        const data = await couponsApi.validate({ code, total: subTotal });
        set({ appliedCoupon: data.coupon, couponDiscount: data.discount });
        return data;
      },

      removeCoupon: () => set({ appliedCoupon: null, couponDiscount: 0 }),

      // ── Orders ───────────────────────────────────────────────
      myOrders: [],
      ordersLoading: false,

      fetchMyOrders: async () => {
        if (!get().customer) return;
        set({ ordersLoading: true });
        try {
          const data = await ordersApi.getMyOrders();
          set({ myOrders: data || [] });
        } catch {
        } finally {
          set({ ordersLoading: false });
        }
      },

      placeOrder: async (body) => {
        const data = await ordersApi.placeOrder(body);
        // Add to local orders list
        set((s) => ({ myOrders: [data.order, ...s.myOrders] }));
        get().clearCart();
        return data;
      },

      // ── Wishlist ─────────────────────────────────────────────
      wishlist: [],
      wishlistLoading: false,

      fetchWishlist: async () => {
        if (!get().customer) return;
        set({ wishlistLoading: true });
        try {
          const data = await wishlistApi.get();
          set({ wishlist: data || [] });
        } catch {
        } finally {
          set({ wishlistLoading: false });
        }
      },

      toggleWishlist: async (productId) => {
        if (!get().customer) return false; // not logged in
        const inWishlist = get().wishlist.some(
          (p) => (p._id || p) === productId,
        );
        // Optimistic update
        if (inWishlist) {
          set((s) => ({
            wishlist: s.wishlist.filter((p) => (p._id || p) !== productId),
          }));
        } else {
          set((s) => ({ wishlist: [...s.wishlist, { _id: productId }] }));
        }
        try {
          await wishlistApi.toggle(productId);
          // Refresh from server
          const data = await wishlistApi.get();
          set({ wishlist: data || [] });
        } catch {
          // Revert on error
          get().fetchWishlist();
        }
        return !inWishlist;
      },

      isInWishlist: (productId) => {
        return get().wishlist.some((p) => (p._id || p) === productId);
      },

      // ── Newsletter ───────────────────────────────────────────
      newsletterSubscribe: async (email) => {
        return await newsletterApi.subscribe({ email });
      },
    }),

    {
      name: "pansar-website",

      skipHydration: true,

      partialize: (s) => ({
        cart: s.cart,
        appliedCoupon: s.appliedCoupon,
        couponDiscount: s.couponDiscount,
      }),
    },
  ),
);
