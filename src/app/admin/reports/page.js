"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PIE_COLORS = [
  "#0F4C39",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
];
const TYPES = ["daily", "weekly", "monthly", "yearly"];

function fmt(n) {
  if (!n) return "0";
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
}

function SummaryCard({ label, value, sub, color = "green", icon: Icon }) {
  const colors = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
    orange: "bg-orange-50 text-orange-700",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
        </div>
        {Icon && (
          <div className={`rounded-xl p-2.5 ${colors[color]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("monthly");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  async function fetchReport() {
    setLoading(true);
    const params = new URLSearchParams({ type });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const res = await fetch(`/api/admin/reports?${params}`);
    const json = await res.json();
    setData(json.data);
    setLoading(false);
  }
  useEffect(() => {
    fetchReport();
  }, [type]);

  function exportPDF() {
    if (!data) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Business Report", 14, 15);

    doc.setFontSize(11);
    doc.text(`Period: ${type}`, 14, 25);

    autoTable(doc, {
      startY: 35,
      head: [["Title", "Amount"]],
      body: [
        ["Total Revenue", `PKR ${fmt(s.totalRevenue)}`],
        ["POS Sales", `PKR ${fmt(s.totalSales)}`],
        ["Website Orders", `PKR ${fmt(s.totalOrders)}`],
        ["Total Purchases", `PKR ${fmt(s.totalPurchases)}`],
        ["Paid Purchase", `PKR ${fmt(s.totalPaid)}`],
        ["Remaining Due", `PKR ${fmt(s.totalDue)}`],
        ["Expenses", `PKR ${fmt(s.totalExpenses)}`],
        ["Profit", `PKR ${fmt(s.totalProfit)}`],
      ],
    });

    doc.save(`report-${type}.pdf`);
  }

  const s = data?.summary || {};

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Business performance overview"
        action={
          <Button variant="outline" onClick={exportPDF}>
            <Download size={15} /> Export PDF
          </Button>
        }
      />

      {/* Period selector */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${type === t ? "bg-green-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
          />
          <span className="text-slate-400 text-sm">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
          />
          <Button size="sm" onClick={fetchReport}>
            Apply
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryCard
              label="Total Revenue"
              value={`PKR ${fmt(s.totalRevenue)}`}
              color="green"
              icon={DollarSign}
            />
            <SummaryCard
              label="POS Sales"
              value={`PKR ${fmt(s.totalSales)}`}
              color="blue"
              icon={TrendingUp}
              sub={`${s.totalSalesTxn} transactions`}
            />
            <SummaryCard
              label="Website Orders"
              value={`PKR ${fmt(s.totalOrders)}`}
              color="orange"
              icon={ShoppingBag}
              sub={`${s.totalOrdersTxn} orders`}
            />
            <SummaryCard
              label="Total Profit"
              value={`PKR ${fmt(s.totalProfit)}`}
              color={s.totalProfit >= 0 ? "green" : "red"}
              icon={s.totalProfit >= 0 ? TrendingUp : TrendingDown}
            />
            <SummaryCard
              label="Purchases Cost"
              value={`PKR ${fmt(s.totalPurchases)}`}
              color="blue"
            />
            <SummaryCard
              label="Purchase Paid"
              value={`PKR ${fmt(s.totalPaid)}`}
              color="green"
            />

            <SummaryCard
              label="Purchase Due"
              value={`PKR ${fmt(s.totalDue)}`}
              color="red"
            />
            <SummaryCard
              label="Total Expenses"
              value={`PKR ${fmt(s.totalExpenses)}`}
              color="red"
            />
            <SummaryCard
              label="Low Stock Items"
              value={data.inventory?.lowStock?.length || 0}
              color="orange"
            />
            <SummaryCard
              label="Out of Stock"
              value={data.inventory?.outOfStock?.length || 0}
              color="red"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-700">
                Daily Sales Trend
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.dailySales || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => `PKR ${fmt(v)}`} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#0F4C39"
                    strokeWidth={2}
                    dot={false}
                    name="Sales"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-700">
                Sales by Category
              </h2>
              {data.categoryReport?.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.categoryReport}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="total"
                      nameKey="_id"
                      label={({ _id, percent }) =>
                        `${_id} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {data.categoryReport.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `PKR ${fmt(v)}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-slate-400">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">
              Top Selling Products
            </h2>
            {data.topProducts?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs text-slate-400">
                      <th className="pb-2 text-left">#</th>
                      <th className="pb-2 text-left">Product</th>
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
                        <td className="py-2 font-medium text-slate-700">
                          {p.name || "—"}
                        </td>
                        <td className="py-2 text-right text-slate-600">
                          {p.qty}
                        </td>
                        <td className="py-2 text-right font-semibold text-green-700">
                          PKR {fmt(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-sm text-slate-400 py-8">
                No sales data in this period
              </p>
            )}
          </div>

          {/* Inventory Alerts */}
          {(data.inventory?.lowStock?.length > 0 ||
            data.inventory?.outOfStock?.length > 0) && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {[
                ["⚠️ Low Stock Items", "yellow", data.inventory.lowStock],
                ["🔴 Out of Stock", "red", data.inventory.outOfStock],
              ].map(
                ([title, color, items]) =>
                  items?.length > 0 && (
                    <div
                      key={title}
                      className="rounded-xl border border-slate-200 bg-white p-5"
                    >
                      <h2 className="mb-3 text-sm font-semibold text-slate-700">
                        {title}
                      </h2>
                      <div className="space-y-2">
                        {items.map((p) => (
                          <div
                            key={p._id}
                            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                          >
                            <span className="font-medium text-slate-700 truncate">
                              {p.name}
                            </span>
                            <span
                              className={`ml-2 font-bold flex-shrink-0 ${color === "red" ? "text-red-600" : "text-yellow-600"}`}
                            >
                              {p.stock} {p.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
