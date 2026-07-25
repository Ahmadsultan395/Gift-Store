/**
 * CENTRAL API SERVICE
 * Sari API calls yahan hain — stores yahan se call karti hain
 * Kisi page par directly fetch() mat karo
 */

const BASE = "";

async function req(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed");
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// AUTH — ADMIN
// ─────────────────────────────────────────────────────────────────
export const adminAuthApi = {
  login: (body) =>
    req("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  logout: () => req("/api/admin/auth/logout", { method: "POST" }),
  me: () => req("/api/admin/auth/me"),
};

// ─────────────────────────────────────────────────────────────────
// AUTH — CUSTOMER
// ─────────────────────────────────────────────────────────────────
export const customerAuthApi = {
  register: (body) =>
    req("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    req("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => req("/api/auth/logout", { method: "POST" }),
  me: () => req("/api/auth/me"),
  getProfile: () => req("/api/auth/profile"),
  updateProfile: (body) =>
    req("/api/auth/profile", { method: "PUT", body: JSON.stringify(body) }),
};

// ─────────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────────
export const settingsApi = {
  get: () => req("/api/settings"),
  getAdmin: () => req("/api/admin/settings"),
  update: (body) =>
    req("/api/admin/settings", { method: "PUT", body: JSON.stringify(body) }),
};

// ─────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────
export const categoriesApi = {
  // public
  getAll: () => req("/api/categories"),
  // admin
  adminGetAll: () => req("/api/admin/categories"),
  create: (body) =>
    req("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id, b) =>
    req(`/api/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(b),
    }),
  remove: (id) => req(`/api/admin/categories/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────
// BRANDS
// ─────────────────────────────────────────────────────────────────
export const brandsApi = {
  getAll: () => req("/api/brands"),
  adminGetAll: () => req("/api/admin/brands"),
  create: (body) =>
    req("/api/admin/brands", { method: "POST", body: JSON.stringify(body) }),
  update: (id, b) =>
    req(`/api/admin/brands/${id}`, { method: "PUT", body: JSON.stringify(b) }),
  remove: (id) => req(`/api/admin/brands/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────────────
export const productsApi = {
  // public website
  getList: (params = {}) => req(`/api/products?${new URLSearchParams(params)}`),
  getBySlug: (slug) => req(`/api/products/${slug}`),
  // admin
  getById: async (id) => {
    const res = await api.get(`/admin/products/${id}`);
    return res.data.data;
  },
  adminGetList: (params = {}) =>
    req(`/api/admin/products?${new URLSearchParams(params)}`),
  getById: (id) => req(`/api/admin/products/${id}`),
  create: (body) =>
    req("/api/admin/products", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    req(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  remove: (id) => req(`/api/admin/products/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────
// SUPPLIERS
// ─────────────────────────────────────────────────────────────────
export const suppliersApi = {
  getAll: () => req("/api/admin/suppliers"),
  create: (body) =>
    req("/api/admin/suppliers", { method: "POST", body: JSON.stringify(body) }),
  update: (id, b) =>
    req(`/api/admin/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(b),
    }),
  remove: (id) => req(`/api/admin/suppliers/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────
// PURCHASES
// ─────────────────────────────────────────────────────────────────
export const purchasesApi = {
  getList: (params = {}) =>
    req(`/api/admin/purchases?${new URLSearchParams(params)}`),
  create: (body) =>
    req("/api/admin/purchases", { method: "POST", body: JSON.stringify(body) }),
  remove: (id) => req(`/api/admin/purchases/${id}`, { method: "DELETE" }),
  updatePayment: (id, b) =>
    req(`/api/admin/purchases/${id}/payment`, {
      method: "PUT",
      body: JSON.stringify(b),
    }),
};

// ─────────────────────────────────────────────────────────────────
// SALES / POS
// ─────────────────────────────────────────────────────────────────
export const salesApi = {
  getList: (params = {}) =>
    req(`/api/admin/pos?${new URLSearchParams(params)}`),
  createSale: (body) =>
    req("/api/admin/pos", { method: "POST", body: JSON.stringify(body) }),
  addPayment: (id, body) =>
    req(`/api/admin/sales/${id}/payment`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  processRefund: (id, body) =>
    req(`/api/admin/sales/${id}/refund`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ─────────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────────
export const ordersApi = {
  // admin
  adminGetList: (params = {}) =>
    req(`/api/admin/orders?${new URLSearchParams(params)}`),
  adminGetById: (id) => req(`/api/admin/orders/${id}`),
  updateStatus: (id, body) =>
    req(`/api/admin/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  updatePayment: (id, body) =>
    req(`/api/admin/orders/${id}/payment`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  // customer
  getMyOrders: () => req("/api/orders"),
  placeOrder: (body) =>
    req("/api/orders", { method: "POST", body: JSON.stringify(body) }),
};

// ─────────────────────────────────────────────────────────────────
// CUSTOMERS
// ─────────────────────────────────────────────────────────────────
export const customersApi = {
  getList: (params = {}) =>
    req(`/api/admin/customers?${new URLSearchParams(params)}`),
  getById: (id) => req(`/api/admin/customers/${id}`),
  create: (body) =>
    req("/api/admin/customers", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    req(`/api/admin/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  remove: (id) => req(`/api/admin/customers/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────
// EXPENSES
// ─────────────────────────────────────────────────────────────────
export const expensesApi = {
  getList: (params = {}) =>
    req(`/api/admin/expenses?${new URLSearchParams(params)}`),
  create: (body) =>
    req("/api/admin/expenses", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    req(`/api/admin/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  remove: (id) => req(`/api/admin/expenses/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────
// COUPONS
// ─────────────────────────────────────────────────────────────────
export const couponsApi = {
  getAll: () => req("/api/admin/coupons"),
  create: (body) =>
    req("/api/admin/coupons", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    req(`/api/admin/coupons/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  remove: (id) => req(`/api/admin/coupons/${id}`, { method: "DELETE" }),
  validate: (body) =>
    req("/api/coupons/validate", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ─────────────────────────────────────────────────────────────────
// BANNERS
// ─────────────────────────────────────────────────────────────────
export const bannersApi = {
  getAll: () => req("/api/banners"),

  adminGetAll: () => req("/api/admin/banners"),

  create: (body) =>
    req("/api/admin/banners", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id, body) =>
    req(`/api/admin/banners/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  remove: (id) =>
    req(`/api/admin/banners/${id}`, {
      method: "DELETE",
    }),
};

// ─────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: (limit = 20) => req(`/api/admin/notifications?limit=${limit}`),
  getUnreadCount: () => req("/api/admin/notifications/unread-count"),
  markAllRead: () => req("/api/admin/notifications", { method: "PUT" }),
};

// ─────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => req("/api/admin/dashboard"),
};

// ─────────────────────────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────────────────────────
export const reportsApi = {
  get: (params = {}) =>
    req(`/api/admin/reports?${new URLSearchParams(params)}`),
};

// ─────────────────────────────────────────────────────────────────
// INVENTORY
// ─────────────────────────────────────────────────────────────────
export const inventoryApi = {
  get: (view = "all") => req(`/api/admin/inventory?view=${view}`),
};

// ─────────────────────────────────────────────────────────────────
// NEWSLETTER
// ─────────────────────────────────────────────────────────────────
export const newsletterApi = {
  subscribe: (body) =>
    req("/api/newsletter", { method: "POST", body: JSON.stringify(body) }),
  adminGetAll: (params = {}) =>
    req(`/api/admin/newsletter?${new URLSearchParams(params)}`),
  remove: (id) => req(`/api/admin/newsletter/${id}`, { method: "DELETE" }),
  toggleStatus: (id, body) =>
    req(`/api/admin/newsletter/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  sendEmail: (body) =>
    req("/api/admin/newsletter/send", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ─────────────────────────────────────────────────────────────────
// WISHLIST
// ─────────────────────────────────────────────────────────────────
export const wishlistApi = {
  get: () => req("/api/wishlist"),
  toggle: (id) =>
    req("/api/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId: id }),
    }),
};

// ─────────────────────────────────────────────────────────────────
// UPLOAD
// ─────────────────────────────────────────────────────────────────
export const uploadApi = {
  upload: async (file, folder = "general") => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Upload failed");
    return data.data;
  },
};

// ─────────────────────────────────────────────────────────────────
// CHAT
// ─────────────────────────────────────────────────────────────────
export const chatApi = {
  send: (body) =>
    req("/api/chat", { method: "POST", body: JSON.stringify(body) }),
};
