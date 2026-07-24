/**
 * ADMIN GLOBAL STORE — Zustand
 *
 * Usage in any admin component:
 *   import { useAdminStore } from "@/stores/useAdminStore";
 *   const { categories, fetchCategories, addCategory } = useAdminStore();
 */

import { create } from "zustand";
import {
  adminAuthApi,
  categoriesApi,
  brandsApi,
  suppliersApi,
  productsApi,
  dashboardApi,
  notificationsApi,
  settingsApi,
  couponsApi,
  bannersApi,
  customersApi,
  expensesApi,
  purchasesApi,
  salesApi,
  inventoryApi,
  reportsApi,
  ordersApi,
} from "@/services/api";

export const useAdminStore = create((set, get) => ({
  // ── Auth ──────────────────────────────────────────────────────
  admin: null,
  authChecked: false,

  checkAuth: async () => {
    try {
      const data = await adminAuthApi.me();
      set({ admin: data.user, authChecked: true });
    } catch {
      set({ admin: null, authChecked: true });
    }
  },

  login: async (body) => {
    const data = await adminAuthApi.login(body);

    // if (!data.success) {
    //   throw new Error(data.message || "Login failed");
    // }

    set({
      admin: data.user,
    });

    return data;
  },

  logout: async () => {
    await adminAuthApi.logout();
    set({ admin: null });
  },

  // ── Settings ──────────────────────────────────────────────────
  settings: null,
  settingsLoading: false,

  fetchSettings: async () => {
    if (get().settings) return;
    set({ settingsLoading: true });
    try {
      const data = await settingsApi.getAdmin();
      set({ settings: data });
    } catch {
    } finally {
      set({ settingsLoading: false });
    }
  },

  updateSettings: async (body) => {
    const data = await settingsApi.update(body);
    set({ settings: data });
    return data;
  },

  // ── Dashboard ─────────────────────────────────────────────────
  dashboardData: null,
  dashboardLoading: false,

  fetchDashboard: async (force = false) => {
    if (get().dashboardData && !force) return;
    set({ dashboardLoading: true });
    try {
      const data = await dashboardApi.getStats();
      set({ dashboardData: data });
    } catch {
    } finally {
      set({ dashboardLoading: false });
    }
  },

  // ── Notifications ─────────────────────────────────────────────
  notifications: [],
  unreadCount: 0,
  notifLoading: false,

  fetchUnreadCount: async () => {
    try {
      const data = await notificationsApi.getUnreadCount();
      set({ unreadCount: data.count || 0 });
    } catch {}
  },

  fetchNotifications: async () => {
    set({ notifLoading: true });
    try {
      const data = await notificationsApi.getAll(50);
      set({
        notifications: data || [],
        unreadCount: (data || []).filter((n) => !n.isRead).length,
      });
    } catch {
    } finally {
      set({ notifLoading: false });
    }
  },

  markAllRead: async () => {
    await notificationsApi.markAllRead();
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  // ── POS ─────────────────────────────────────────────────────
  posLoading: false,

  createPOSSale: async (body) => {
    set({ posLoading: true });

    try {
      const data = await salesApi.createSale(body);

      // sales list update
      set((s) => ({
        sales: [data, ...s.sales],
      }));

      return data;
    } finally {
      set({ posLoading: false });
    }
  },

  // ── Categories ────────────────────────────────────────────────
  categories: [],
  categoriesLoading: false,

  fetchCategories: async (force = false) => {
    if (get().categories.length && !force) return;
    set({ categoriesLoading: true });
    try {
      const data = await categoriesApi.adminGetAll();
      set({ categories: data || [] });
    } catch {
    } finally {
      set({ categoriesLoading: false });
    }
  },

  addCategory: async (body) => {
    const data = await categoriesApi.create(body);
    set((s) => ({ categories: [...s.categories, data] }));
    return data;
  },

  updateCategory: async (id, body) => {
    const data = await categoriesApi.update(id, body);
    set((s) => ({
      categories: s.categories.map((c) => (c._id === id ? data : c)),
    }));
    return data;
  },

  removeCategory: async (id) => {
    await categoriesApi.remove(id);
    set((s) => ({ categories: s.categories.filter((c) => c._id !== id) }));
  },

  // ── Brands ────────────────────────────────────────────────────
  brands: [],
  brandsLoading: false,

  fetchBrands: async (force = false) => {
    if (get().brands.length && !force) return;
    set({ brandsLoading: true });
    try {
      const data = await brandsApi.adminGetAll();
      set({ brands: data || [] });
    } catch {
    } finally {
      set({ brandsLoading: false });
    }
  },

  addBrand: async (body) => {
    const data = await brandsApi.create(body);
    set((s) => ({ brands: [...s.brands, data] }));
    return data;
  },

  updateBrand: async (id, body) => {
    const data = await brandsApi.update(id, body);
    set((s) => ({ brands: s.brands.map((b) => (b._id === id ? data : b)) }));
    return data;
  },

  removeBrand: async (id) => {
    await brandsApi.remove(id);
    set((s) => ({ brands: s.brands.filter((b) => b._id !== id) }));
  },

  // ── Suppliers ─────────────────────────────────────────────────
  suppliers: [],
  suppliersLoading: false,

  fetchSuppliers: async (force = false) => {
    if (get().suppliers.length && !force) return;
    set({ suppliersLoading: true });
    try {
      const data = await suppliersApi.getAll();
      set({ suppliers: data || [] });
    } catch {
    } finally {
      set({ suppliersLoading: false });
    }
  },

  addSupplier: async (body) => {
    const data = await suppliersApi.create(body);
    set((s) => ({ suppliers: [...s.suppliers, data] }));
    return data;
  },

  updateSupplier: async (id, body) => {
    const data = await suppliersApi.update(id, body);
    set((s) => ({
      suppliers: s.suppliers.map((sup) => (sup._id === id ? data : sup)),
    }));
    return data;
  },

  removeSupplier: async (id) => {
    await suppliersApi.remove(id);
    set((s) => ({ suppliers: s.suppliers.filter((sup) => sup._id !== id) }));
  },

  // ── Products ─────────────────────────────────────────────────
  products: [],
  productsPagination: { total: 0, page: 1, pages: 1 },
  productsLoading: false,
  productFilters: {
    search: "",
    category: "",
    brand: "",
    status: "",
    stock: "",
    page: 1,
  },

  setProductFilters: (filters) => {
    set((s) => ({
      productFilters: {
        ...s.productFilters,
        ...filters,
        page: filters.page || 1,
      },
    }));
  },

  fetchProducts: async (params) => {
    const filters = params || get().productFilters;
    set({ productsLoading: true });
    try {
      const data = await productsApi.adminGetList({ limit: 20, ...filters });
      set({
        products: data.products || [],
        productsPagination: data.pagination || {},
      });
    } catch {
    } finally {
      set({ productsLoading: false });
    }
  },

  getProductById: async (id) => {
    const data = await productsApi.getById(id);
    return data;
  },

  addProduct: async (body) => {
    const data = await productsApi.create(body);
    set((s) => ({ products: [data, ...s.products] }));
    return data;
  },

  updateProduct: async (id, body) => {
    const data = await productsApi.update(id, body);
    set((s) => ({
      products: s.products.map((p) => (p._id === id ? data : p)),
    }));
    return data;
  },

  removeProduct: async (id) => {
    await productsApi.remove(id);
    set((s) => ({ products: s.products.filter((p) => p._id !== id) }));
  },

  // ── Customers ────────────────────────────────────────────────
  customers: [],
  customersPagination: { total: 0, page: 1, pages: 1 },
  customersLoading: false,

  fetchCustomers: async (params = {}) => {
    set({ customersLoading: true });
    try {
      const data = await customersApi.getList({ limit: 20, ...params });
      set({
        customers: data.customers || [],
        customersPagination: data.pagination || {},
      });
    } catch {
    } finally {
      set({ customersLoading: false });
    }
  },

  addCustomer: async (body) => {
    const data = await customersApi.create(body);
    set((s) => ({ customers: [data, ...s.customers] }));
    return data;
  },

  updateCustomer: async (id, body) => {
    const data = await customersApi.update(id, body);
    set((s) => ({
      customers: s.customers.map((c) => (c._id === id ? data : c)),
    }));
    return data;
  },

  removeCustomer: async (id) => {
    await customersApi.remove(id);
    set((s) => ({ customers: s.customers.filter((c) => c._id !== id) }));
  },

  // ── Expenses ─────────────────────────────────────────────────
  expenses: [],
  expensesTotalAmount: 0,
  expensesLoading: false,

  fetchExpenses: async (params = {}) => {
    set({ expensesLoading: true });
    try {
      const data = await expensesApi.getList({ limit: 50, ...params });
      set({
        expenses: data.expenses || [],
        expensesTotalAmount: data.totalAmount || 0,
      });
    } catch {
    } finally {
      set({ expensesLoading: false });
    }
  },

  addExpense: async (body) => {
    const data = await expensesApi.create(body);
    set((s) => ({
      expenses: [data, ...s.expenses],
      expensesTotalAmount: s.expensesTotalAmount + data.amount,
    }));
    return data;
  },

  updateExpense: async (id, body) => {
    const data = await expensesApi.update(id, body);
    set((s) => ({
      expenses: s.expenses.map((e) => (e._id === id ? data : e)),
    }));
    return data;
  },

  removeExpense: async (id) => {
    const expense = get().expenses.find((e) => e._id === id);
    await expensesApi.remove(id);
    set((s) => ({
      expenses: s.expenses.filter((e) => e._id !== id),
      expensesTotalAmount: s.expensesTotalAmount - (expense?.amount || 0),
    }));
  },

  // ── Coupons ───────────────────────────────────────────────────
  coupons: [],
  couponsLoading: false,

  fetchCoupons: async (force = false) => {
    if (get().coupons.length && !force) return;
    set({ couponsLoading: true });
    try {
      const data = await couponsApi.getAll();
      set({ coupons: data || [] });
    } catch {
    } finally {
      set({ couponsLoading: false });
    }
  },

  addCoupon: async (body) => {
    const data = await couponsApi.create(body);
    set((s) => ({ coupons: [data, ...s.coupons] }));
    return data;
  },

  updateCoupon: async (id, body) => {
    const data = await couponsApi.update(id, body);
    set((s) => ({ coupons: s.coupons.map((c) => (c._id === id ? data : c)) }));
    return data;
  },

  removeCoupon: async (id) => {
    await couponsApi.remove(id);
    set((s) => ({ coupons: s.coupons.filter((c) => c._id !== id) }));
  },

  // ── Banners ───────────────────────────────────────────────────
  banners: [],
  bannersLoading: false,

  fetchBanners: async (force = false) => {
    if (get().banners.length && !force) return;
    set({ bannersLoading: true });
    try {
      const data = await bannersApi.getAll();
      set({ banners: data || [] });
    } catch {
    } finally {
      set({ bannersLoading: false });
    }
  },

  addBanner: async (body) => {
    const data = await bannersApi.create(body);
    set((s) => ({ banners: [...s.banners, data] }));
    return data;
  },

  updateBanner: async (id, body) => {
    const data = await bannersApi.update(id, body);
    set((s) => ({ banners: s.banners.map((b) => (b._id === id ? data : b)) }));
    return data;
  },

  removeBanner: async (id) => {
    await bannersApi.remove(id);
    set((s) => ({ banners: s.banners.filter((b) => b._id !== id) }));
  },

  // ── Orders ────────────────────────────────────────────────────
  orders: [],
  ordersStats: {},
  ordersPagination: { total: 0, page: 1, pages: 1 },
  ordersLoading: false,

  fetchOrders: async (params = {}) => {
    set({ ordersLoading: true });
    try {
      const data = await ordersApi.adminGetList({ limit: 20, ...params });
      set({
        orders: data.orders || [],
        ordersStats: data.stats || {},
        ordersPagination: data.pagination || {},
      });
    } catch {
    } finally {
      set({ ordersLoading: false });
    }
  },

  updateOrderStatus: async (id, body) => {
    const data = await ordersApi.updateStatus(id, body);
    set((s) => ({
      orders: s.orders.map((o) =>
        o._id === id ? { ...o, status: data.status } : o,
      ),
    }));
    return data;
  },

  // ── Sales ─────────────────────────────────────────────────────
  sales: [],
  salesPagination: { total: 0, page: 1, pages: 1 },
  salesLoading: false,

  fetchSales: async (params = {}) => {
    set({ salesLoading: true });
    try {
      const data = await salesApi.getList({ limit: 20, ...params });
      set({ sales: data.sales || [], salesPagination: data.pagination || {} });
    } catch {
    } finally {
      set({ salesLoading: false });
    }
  },

  // After POS sale — optimistic add
  addSale: (sale) => {
    set((s) => ({ sales: [sale, ...s.sales] }));
  },

  // After payment added — update in list
  updateSaleInList: (id, updated) => {
    set((s) => ({
      sales: s.sales.map((sale) =>
        sale._id === id ? { ...sale, ...updated } : sale,
      ),
    }));
  },

  // ── Purchases ────────────────────────────────────────────────
  purchases: [],
  purchasesPagination: { total: 0, page: 1, pages: 1 },
  purchasesStats: {},
  purchasesLoading: false,

  fetchPurchases: async (params = {}) => {
    set({ purchasesLoading: true });
    try {
      const data = await purchasesApi.getList({ limit: 20, ...params });
      set({
        purchases: data.purchases || [],
        purchasesPagination: data.pagination || {},
        purchasesStats: data.stats || {},
      });
    } catch {
    } finally {
      set({ purchasesLoading: false });
    }
  },

  addPurchase: async (body) => {
    const data = await purchasesApi.create(body);
    set((s) => ({ purchases: [data, ...s.purchases] }));
    return data;
  },

  removePurchase: async (id) => {
    await purchasesApi.remove(id);
    set((s) => ({ purchases: s.purchases.filter((p) => p._id !== id) }));
  },

  // ── Inventory ────────────────────────────────────────────────
  inventory: { products: [], counts: {} },
  inventoryLoading: false,

  fetchInventory: async (view = "all") => {
    set({ inventoryLoading: true });
    try {
      const data = await inventoryApi.get(view);
      set({ inventory: data });
    } catch {
    } finally {
      set({ inventoryLoading: false });
    }
  },

  // ── Reports ───────────────────────────────────────────────────
  reportData: null,
  reportLoading: false,

  fetchReport: async (params = {}) => {
    set({ reportLoading: true });
    try {
      const data = await reportsApi.get(params);
      set({ reportData: data });
    } catch {
    } finally {
      set({ reportLoading: false });
    }
  },
}));
