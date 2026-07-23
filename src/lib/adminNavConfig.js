import {
  LayoutDashboard,
  Package,
  Tags,
  Award,
  Truck,
  ShoppingCart,
  Receipt,
  ClipboardList,
  Users,
  Wallet,
  ClipboardCheck,
  Ticket,
  Image,
  BarChart3,
  Settings,
} from "lucide-react";

export const navGroups = [
  {
    label: "Main",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      {
        href: "/admin/pos",
        label: "POS Terminal",
        icon: ShoppingCart,
        badge: "HOT",
      },
    ],
  },
  {
    label: "Inventory",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: Tags },
      { href: "/admin/brands", label: "Brands", icon: Award },
      { href: "/admin/inventory", label: "Inventory", icon: ClipboardCheck },
    ],
  },
  {
    label: "Purchases & Sales",
    items: [
      { href: "/admin/suppliers", label: "Suppliers", icon: Truck },
      { href: "/admin/purchases", label: "Purchases", icon: Receipt },
      { href: "/admin/sales", label: "Sales History", icon: ClipboardList },
      { href: "/admin/orders", label: "Website Orders", icon: ShoppingCart },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/expenses", label: "Expenses", icon: Wallet },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/coupons", label: "Coupons", icon: Ticket },
      { href: "/admin/banners", label: "Banners & Offers", icon: Image },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/reports", label: "Reports", icon: BarChart3 },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

// Flat list — search ke liye asaan
export const flatNavItems = navGroups.flatMap((g) => g.items);
