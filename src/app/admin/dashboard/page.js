"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  XCircle,
  DollarSign,
  ShoppingCart,
  Layers,
  TrendingDown,
  RotateCcw,
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";

const PIE_COLORS = [
  "#0F4C39",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
];

function fmt(n) {
  if (!n) return "0";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 min-[450px]:grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    );
  }

  const s = data?.stats || {};

  function exactFmt(n) {
    if (!n) return "0";

    return Number(n).toLocaleString("en-US");
  }
  const statCards = [
    {
      label: "Today's Sales",
      value: `PKR ${fmt(s.todaySales || 0)}`,
      exactValue: `PKR ${exactFmt(s.todaySales || 0)}`,
      icon: TrendingUp,
      color: "green",
      sub: `${s.todaySalesCount || 0} transactions`,
    },
    {
      label: "Monthly Sales",
      value: `PKR ${fmt(s.monthlySales || 0)}`,
      exactValue: `PKR ${exactFmt(s.monthlySales || 0)}`,
      icon: ShoppingBag,
      color: "blue",
    },
    {
      label: "Yearly Sales",
      value: `PKR ${fmt(s.yearlySales || 0)}`,
      exactValue: `PKR ${exactFmt(s.yearlySales || 0)}`,
      icon: TrendingDown,
      color: "purple",
    },
    {
      label: "Total Revenue",
      value: `PKR ${fmt(s.totalRevenue || 0)}`,
      exactValue: `PKR ${exactFmt(s.totalRevenue || 0)}`,
      icon: DollarSign,
      color: "teal",
    },
    {
      label: "Refunded Sales",
      value: `PKR ${fmt(s.totalRefundedSales || 0)}`,
      exactValue: `PKR ${exactFmt(s.totalRefundedSales || 0)}`,
      icon: RotateCcw,
      color: "red",
      sub: `${s.refundedSalesCount || 0} sale(s)`,
    },
    {
      label: "Refunded Orders",
      value: `PKR ${fmt(s.totalRefundedOrders || 0)}`,
      exactValue: `PKR ${exactFmt(s.totalRefundedOrders || 0)}`,
      icon: RotateCcw,
      color: "red",
      sub: `${s.refundedOrdersCount || 0} order(s)`,
    },

    {
      label: "Total Purchase",
      value: `PKR ${fmt(s.totalCost || 0)}`,
      exactValue: `PKR ${exactFmt(s.totalCost || 0)}`,
      icon: Package,
      color: "blue",
    },
    {
      label: "Paid Purchase",
      value: `PKR ${fmt(s.totalPaid || 0)}`,
      exactValue: `PKR ${exactFmt(s.totalPaid || 0)}`,
      icon: DollarSign,
      color: "green",
    },

    {
      label: "Purchase Due",
      value: `PKR ${fmt(s.totalDue || 0)}`,
      exactValue: `PKR ${exactFmt(s.totalDue || 0)}`,
      icon: AlertTriangle,
      color: "red",
    },

    {
      label: "Total Expenses",
      value: `PKR ${fmt(s.totalExpenses || 0)}`,
      exactValue: `PKR ${exactFmt(s.totalExpenses || 0)}`,
      icon: DollarSign,
      color: "red",
    },

    {
      label: "Total Profit",
      value: `PKR ${fmt(s.totalProfit || 0)}`,
      exactValue: `PKR ${exactFmt(s.totalProfit || 0)}`,
      icon: TrendingDown,
      color: s.totalProfit > 0 ? "green" : "red",
    },
    {
      label: "Total Orders",
      value: s.totalOrders,
      exactValue: s.totalOrders,
      icon: ShoppingCart,
      color: "orange",
    },
    {
      label: "Pending Orders",
      value: s.pendingOrders,
      exactValue: s.pendingOrders,
      icon: AlertTriangle,
      color: "yellow",
    },
    {
      label: "Delivered Orders",
      value: s.deliveredOrders,
      exactValue: s.deliveredOrders,
      icon: TrendingUp,
      color: "green",
    },
    {
      label: "Total Products",
      value: s.totalProducts,
      exactValue: s.totalProducts,
      icon: Package,
      color: "blue",
    },
    {
      label: "Total Customers",
      value: s.totalCustomers,
      exactValue: s.totalCustomers,
      icon: Users,
      color: "purple",
    },
    {
      label: "Low Stock",
      value: s.lowStockProducts,
      exactValue: s.lowStockProducts,
      icon: AlertTriangle,
      color: "yellow",
      sub: "Need restocking",
    },
    {
      label: "Out of Stock",
      value: s.outOfStockProducts,
      exactValue: s.outOfStockProducts,
      icon: XCircle,
      color: "red",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Welcome back! Here's your store overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 min-[450px]:grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales Line Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            Sales — Last 6 Months
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data?.salesChartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `PKR ${fmt(v)}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#0F4C39"
                strokeWidth={2}
                dot={false}
                name="Sales (PKR)"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            Sales by Category
          </h2>
          {data?.categoryWiseSales?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.categoryWiseSales}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {data.categoryWiseSales.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `PKR ${fmt(v)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-slate-400">
              No sales data yet
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Bar Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            Monthly Order Comparison
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.salesChartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `PKR ${fmt(v)}`} />
              <Bar
                dataKey="sales"
                fill="#0F4C39"
                radius={[4, 4, 0, 0]}
                name="Sales"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Table */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            Top Selling Products
          </h2>
          {data?.topProducts?.length ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="pb-2">#</th>
                  <th className="pb-2">Product</th>
                  <th className="pb-2 text-right">Qty Sold</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((p, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="py-2 text-slate-400">{i + 1}</td>
                    <td className="py-2 font-medium text-slate-700 max-w-[130px] truncate">
                      {p.name || "—"}
                    </td>
                    <td className="py-2 text-right text-slate-600">
                      {p.totalQty}
                    </td>
                    <td className="py-2 text-right text-primary-600 font-medium">
                      PKR {fmt(p.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-slate-400">
              No sales data yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
