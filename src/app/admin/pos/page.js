"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  ShoppingCart,
  X,
  CheckCircle,
  Scale,
  CreditCard,
  UserPlus,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useAdminStore } from "@/stores/useAdminStore";

// ── Unit converter helper ───────────────────────────────────────────
const UNIT_CONVERSIONS = {
  kg: { sub: "g", factor: 0.001, label: "gm → kg" },
  litre: { sub: "ml", factor: 0.001, label: "ml → litre" },
  g: { sub: "mg", factor: 0.001, label: "mg → g" },
};

function formatQty(qty, unit) {
  if (qty === Math.floor(qty)) return `${qty} ${unit}`;
  return `${qty} ${unit}`;
}

export default function POSPage() {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [customer, setCustomer] = useState(null);
  const [custSearch, setCustSearch] = useState("");
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [receipt, setReceipt] = useState(null);
  const [qtyModal, setQtyModal] = useState(null);
  const [customQty, setCustomQty] = useState("");
  const [subUnit, setSubUnit] = useState(false);
  const searchRef = useRef();

  // ── Quick-add customer state ──────────────────────────────────
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [addCustError, setAddCustError] = useState("");

  const {
    products,
    fetchProducts,
    categories,
    fetchCategories,
    customers,
    fetchCustomers,
    addCustomer,
    createPOSSale,
    posLoading,
  } = useAdminStore();

  const processing = useAdminStore((state) => state.posLoading);

  useEffect(() => {
    fetchProducts({
      limit: 500,
      status: "active",
    });

    fetchCategories();

    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    if (custSearch.length < 2) return;

    const t = setTimeout(() => {
      fetchCustomers({
        search: custSearch,
        limit: 5,
      });
    }, 400);

    return () => clearTimeout(t);
  }, [custSearch]);

  const filtered = products.filter((p) => {
    const ms =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.includes(search) ||
      p.barcode?.includes(search);
    const mc =
      !catFilter || p.category?._id === catFilter || p.category === catFilter;
    return ms && mc;
  });

  function handleProductClick(product) {
    if (product.stock <= 0) return;
    const needsQtyModal = ["kg", "litre", "g", "ml"].includes(product.unit);
    if (needsQtyModal) {
      setQtyModal(product);
      setCustomQty("1");
      setSubUnit(false);
    } else {
      addToCart(product, 1);
    }
  }

  function confirmQtyModal() {
    if (!qtyModal || !customQty) return;
    let qty = parseFloat(customQty);
    if (isNaN(qty) || qty <= 0) return;

    const conv = UNIT_CONVERSIONS[qtyModal.unit];
    if (subUnit && conv) qty = qty * conv.factor;

    qty = Math.round(qty * 10000) / 10000;

    if (qty > qtyModal.stock) {
      alert(`Only ${qtyModal.stock} ${qtyModal.unit} in stock!`);
      return;
    }

    addToCart(qtyModal, qty);
    setQtyModal(null);
    setCustomQty("");
  }

  function addToCart(product, qty = 1) {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === product._id);
      if (existing) {
        const newQty = Math.round((existing.qty + qty) * 10000) / 10000;
        if (newQty > product.stock) return prev;
        return prev.map((c) =>
          c._id === product._id ? { ...c, qty: newQty } : c,
        );
      }
      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          price: product.sellingPrice,
          unit: product.unit || "pcs",
          stock: product.stock,
          qty,
          image: product.images?.[0]?.url || "",
          itemDiscount: 0,
        },
      ];
    });
  }

  function updateQty(id, qty) {
    const num = parseFloat(qty);
    if (isNaN(num) || num <= 0) return removeItem(id);
    const item = cart.find((c) => c._id === id);
    if (item && num > item.stock) return;
    setCart((prev) =>
      prev.map((c) =>
        c._id === id ? { ...c, qty: Math.round(num * 10000) / 10000 } : c,
      ),
    );
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((c) => c._id !== id));
  }
  function clearCart() {
    setCart([]);
    setDiscount(0);
    setTax(0);
    setAmountPaid("");
    setCustomer(null);
    setCustSearch("");
  }

  // Customer select karte hi search dropdown band ho jaye (customers list
  // ko store me clear karne ki zaroorat nahi — dropdown custSearch pe depend karta hai)
  function selectCustomer(c) {
    setCustomer(c);
    setCustSearch("");
  }

  // ── Quick-add customer ────────────────────────────────────────
  function openAddCustomer() {
    // agar search me number type kiya hai to phone field prefill, warna name
    const isPhoneLike = /^[\d+\-\s]+$/.test(custSearch.trim());
    setNewCustName(isPhoneLike ? "" : custSearch);
    setNewCustPhone(isPhoneLike ? custSearch : "");
    setNewCustAddress("");
    setAddCustError("");
    setShowAddCustomer(true);
  }

  async function handleAddCustomer() {
    if (!newCustName.trim() || !newCustPhone.trim()) {
      setAddCustError("Name and phone are required");
      return;
    }
    setAddingCustomer(true);
    setAddCustError("");
    try {
      const created = await addCustomer({
        name: newCustName.trim(),
        phone: newCustPhone.trim(),
        addresses: newCustAddress.trim()
          ? [{ address: newCustAddress.trim(), isDefault: true }]
          : [],
      });
      selectCustomer(created);
      setShowAddCustomer(false);
      setNewCustName("");
      setNewCustPhone("");
      setNewCustAddress("");
    } catch (err) {
      setAddCustError(err.message || "Customer could not be added");
    } finally {
      setAddingCustomer(false);
    }
  }

  const subTotal = cart.reduce(
    (s, c) => s + (c.price * c.qty - c.itemDiscount),
    0,
  );
  const grandTotal = subTotal + Number(tax) - Number(discount);
  const change = Math.max(0, Number(amountPaid || 0) - grandTotal);
  const balanceDue = Math.max(0, grandTotal - Number(amountPaid || 0));

  async function handleCheckout() {
    try {
      const data = await createPOSSale({
        customer: customer?._id,

        items: cart.map((c) => ({
          product: c._id,
          quantity: c.qty,
          price: c.price,
          discount: c.itemDiscount,
        })),

        tax: Number(tax),
        discount: Number(discount),
        amountPaid: Number(amountPaid || 0),
        paymentMethod: payMethod,
      });

      setReceipt({
        ...data,
        cartItems: cart,
        customer,
        subTotal,
        tax: Number(tax),
        discount: Number(discount),
        grandTotal,
        changeReturned: change,
        balanceDue,
      });

      clearCart();
    } catch (err) {
      alert(err.message);
    }
  }

  if (receipt)
    return (
      <ReceiptView
        receipt={receipt}
        onNew={() => setReceipt(null)}
        onPrint={() => window.print()}
      />
    );

  return (
    <div className="flex h-[calc(100vh+10rem)] sm:h-[calc(100vh-3.5rem)] overflow-hidden -m-4 md:-m-6 max-[600px]:flex-col">
      {/* LEFT — Products */}
      <div className="flex flex-1 min-h-0 flex-col border-r border-slate-200 bg-slate-50 overflow-hidden max-[600px]:h-[55vh] max-[600px]:flex-none">
        <div className="border-b border-slate-200 bg-white p-3 space-y-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 bg-slate-50">
            <Search size={15} className="text-slate-400 flex-shrink-0" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, SKU or barcode..."
              className="flex-1 text-sm outline-none bg-transparent"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={14} className="text-slate-400" />
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCatFilter("")}
              className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium ${!catFilter ? "bg-primary-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => setCatFilter(c._id)}
                className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium ${catFilter === c._id ? "bg-primary-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          <div className="grid min-[300px]:grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((p) => (
              <button
                key={p._id}
                onClick={() => handleProductClick(p)}
                disabled={p.stock <= 0}
                className={`group relative flex flex-col rounded-xl border bg-white p-3 text-left transition-all hover:border-primary-400 hover:shadow-sm ${p.stock <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="mb-2 flex h-16 w-full items-center justify-center rounded-lg bg-slate-50 overflow-hidden">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0].url}
                      alt={p.name}
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <ShoppingCart size={20} className="text-slate-300" />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-tight">
                  {p.name}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {p.sku} • {p.stock} {p.unit}
                </p>
                <p className="mt-1 text-sm font-bold text-primary-700">
                  PKR {p.sellingPrice?.toLocaleString()}
                </p>
                {["kg", "litre", "g", "ml"].includes(p.unit) && (
                  <span className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">
                    <Scale size={8} /> {p.unit}
                  </span>
                )}
                {p.stock <= 0 && (
                  <span className="absolute top-2 left-2 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">
                    OUT
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Cart */}
      <div className="flex w-80 min-h-0 flex-col bg-white xl:w-96 max-[600px]:w-full max-[600px]:h-[45vh] max-[600px]:flex-none">
        <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-primary-600" />
            <span className="font-semibold text-slate-800">Cart</span>
            {cart.length > 0 && (
              <span className="rounded-full bg-primary-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                {cart.length}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Customer */}
        <div className="border-b border-slate-100 px-4 py-2">
          {customer ? (
            <div className="flex items-center justify-between rounded-lg bg-primary-50 px-3 py-2">
              <div>
                <p className="text-xs font-semibold text-primary-800">
                  {customer.name}
                </p>
                <p className="text-[10px] text-primary-600">{customer.phone}</p>
              </div>
              <button
                onClick={() => {
                  setCustomer(null);
                  setCustSearch("");
                }}
                className="text-primary-600"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                value={custSearch}
                onChange={(e) => setCustSearch(e.target.value)}
                placeholder="Customer search (optional)..."
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-primary-500"
              />
              {customers.length > 0 && custSearch && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                  {customers.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => selectCustomer(c)}
                      className="flex w-full flex-col px-3 py-2 text-left hover:bg-slate-50"
                    >
                      <span className="text-xs font-medium">{c.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {c.phone}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {/* Search me kuch type hua, koi match nahi mila → quick add */}
              {custSearch.length >= 2 && customers.length === 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                  <p className="mb-1.5 px-1 text-[11px] text-slate-400">
                    No customer found
                  </p>
                  <button
                    onClick={openAddCustomer}
                    className="flex w-full items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-2 text-left text-xs font-semibold text-primary-700 hover:bg-primary-100"
                  >
                    <UserPlus size={13} /> Add "{custSearch}" as a new customer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 min-h-[9rem] overflow-y-auto px-4 py-2 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-slate-300">
              <ShoppingCart size={40} />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item._id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-2.5"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      PKR {item.price?.toLocaleString()} / {item.unit}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-slate-300 hover:text-red-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQty(
                        item._id,
                        item.qty -
                          (["kg", "litre"].includes(item.unit) ? 0.25 : 1),
                      )
                    }
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-600"
                  >
                    <Minus size={11} />
                  </button>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => updateQty(item._id, e.target.value)}
                    step={
                      ["kg", "litre", "g", "ml"].includes(item.unit)
                        ? "0.001"
                        : "1"
                    }
                    min="0.001"
                    className="w-16 text-center text-xs font-bold border border-slate-200 rounded-lg py-1 outline-none focus:border-primary-500"
                  />
                  <span className="text-[10px] text-slate-400">
                    {item.unit}
                  </span>
                  <button
                    onClick={() =>
                      updateQty(
                        item._id,
                        item.qty +
                          (["kg", "litre"].includes(item.unit) ? 0.25 : 1),
                      )
                    }
                    disabled={item.qty >= item.stock}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-600 disabled:opacity-40"
                  >
                    <Plus size={11} />
                  </button>
                  <p className="ml-auto text-xs font-bold text-primary-700">
                    PKR{" "}
                    {(
                      item.price * item.qty -
                      item.itemDiscount
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-slate-100 px-4 py-3 space-y-2">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>PKR {subTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-xs">Tax</span>
              <input
                type="number"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                className="w-20 text-right rounded border border-slate-200 px-1.5 py-0.5 text-xs outline-none"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-xs">Discount</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-20 text-right rounded border border-slate-200 px-1.5 py-0.5 text-xs outline-none"
              />
            </div>
            <div className="flex justify-between font-bold text-base border-t border-slate-100 pt-1.5">
              <span>Total</span>
              <span className="text-primary-700">
                PKR {grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex gap-1.5">
            {["cash", "card", "bank_transfer"].map((m) => (
              <button
                key={m}
                onClick={() => setPayMethod(m)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium capitalize transition-colors ${payMethod === m ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {m.replace("_", " ")}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[10px] font-medium text-slate-500 mb-1">
              Amount Received (PKR)
            </label>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0 = save as partial"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold outline-none focus:border-primary-600"
            />
          </div>

          {amountPaid > 0 && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {change > 0 && (
                <div className="rounded-lg bg-blue-50 p-2 text-center">
                  <p className="text-blue-400">Change</p>
                  <p className="font-bold text-blue-600">
                    PKR {change.toLocaleString()}
                  </p>
                </div>
              )}
              {balanceDue > 0 && (
                <div className="rounded-lg bg-red-50 p-2 text-center">
                  <p className="text-red-400">Balance Due</p>
                  <p className="font-bold text-red-600">
                    PKR {balanceDue.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
          {!amountPaid && (
            <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg px-2 py-1">
              ⚠ Amount 0 — Sale as partial payment
            </p>
          )}

          <button
            onClick={handleCheckout}
            disabled={!cart.length || processing}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {processing ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <CheckCircle size={18} />
            )}
            {processing
              ? "Processing..."
              : `Complete Sale • PKR ${grandTotal.toLocaleString()}`}
          </button>
        </div>
      </div>

      {/* Qty Modal for kg/litre products */}
      {qtyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-80 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">{qtyModal.name}</h3>
              <button onClick={() => setQtyModal(null)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-1">
              Stock:{" "}
              <span className="font-semibold text-primary-700">
                {qtyModal.stock} {qtyModal.unit}
              </span>
            </p>
            <p className="text-sm text-slate-500 mb-3">
              Price:{" "}
              <span className="font-semibold">
                PKR {qtyModal.sellingPrice} / {qtyModal.unit}
              </span>
            </p>

            {UNIT_CONVERSIONS[qtyModal.unit] && (
              <div className="mb-3 flex rounded-lg border border-slate-200 overflow-hidden text-sm">
                <button
                  onClick={() => setSubUnit(false)}
                  className={`flex-1 py-2 font-medium ${!subUnit ? "bg-primary-600 text-white" : "text-slate-600"}`}
                >
                  {qtyModal.unit}
                </button>
                <button
                  onClick={() => setSubUnit(true)}
                  className={`flex-1 py-2 font-medium ${subUnit ? "bg-primary-600 text-white" : "text-slate-600"}`}
                >
                  {UNIT_CONVERSIONS[qtyModal.unit].sub}
                </button>
              </div>
            )}

            <input
              type="number"
              value={customQty}
              onChange={(e) => setCustomQty(e.target.value)}
              step="0.001"
              min="0.001"
              placeholder={`Enter ${subUnit ? UNIT_CONVERSIONS[qtyModal.unit]?.sub : qtyModal.unit}`}
              className="w-full rounded-xl border-2 border-primary-500 px-4 py-3 text-lg font-bold text-center outline-none mb-2"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && confirmQtyModal()}
            />

            {customQty > 0 && (
              <div className="mb-3 rounded-lg bg-primary-50 p-2 text-center text-sm">
                <p className="text-slate-500">
                  {subUnit && UNIT_CONVERSIONS[qtyModal.unit]
                    ? `${customQty} ${UNIT_CONVERSIONS[qtyModal.unit].sub} = ${(customQty * UNIT_CONVERSIONS[qtyModal.unit].factor).toFixed(3)} ${qtyModal.unit}`
                    : `${customQty} ${qtyModal.unit}`}
                </p>
                <p className="font-bold text-primary-700 text-base">
                  PKR{" "}
                  {(
                    qtyModal.sellingPrice *
                    (subUnit && UNIT_CONVERSIONS[qtyModal.unit]
                      ? customQty * UNIT_CONVERSIONS[qtyModal.unit].factor
                      : customQty)
                  ).toFixed(2)}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setQtyModal(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmQtyModal}
                className="flex-1 rounded-xl bg-primary-600 py-2.5 text-sm font-bold text-white hover:bg-primary-700"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick-add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-80 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Add New Customer</h3>
              <button onClick={() => setShowAddCustomer(false)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Name *
                </label>
                <input
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="Customer name"
                  autoFocus
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Phone *
                </label>
                <input
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="03xx-xxxxxxx"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Address (optional)
                </label>
                <input
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="Address"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
                />
              </div>
              {addCustError && (
                <p className="text-xs font-medium text-red-600">
                  {addCustError}
                </p>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowAddCustomer(false)}
                disabled={addingCustomer}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomer}
                disabled={addingCustomer}
                className="flex-1 rounded-xl bg-primary-600 py-2.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {addingCustomer ? "Adding..." : "Add & Select"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Receipt Component ───────────────────────────────────────────────
function ReceiptView({ receipt, onNew, onPrint }) {
  return (
    <div className="flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-sm">
        <div
          id="receipt"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
              <CheckCircle size={24} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Pansar Store</h2>
            <p className="text-xs text-slate-400">Sale Receipt</p>
            <p className="text-xs font-mono text-slate-500 mt-1">
              {receipt.sale?.invoiceNumber}
            </p>
            <p className="text-xs text-slate-400">
              {new Date().toLocaleString("en-PK")}
            </p>
          </div>

          {receipt.customer && (
            <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-xs">
              <span className="text-slate-500">Customer: </span>
              <span className="font-medium">{receipt.customer.name}</span>
            </div>
          )}

          <table className="w-full text-xs mb-3">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-1 text-left text-slate-400">Item</th>
                <th className="pb-1 text-right text-slate-400">Qty</th>
                <th className="pb-1 text-right text-slate-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {receipt.cartItems?.map((item, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="py-1.5 text-slate-700">{item.name}</td>
                  <td className="py-1.5 text-right text-slate-500">
                    {item.qty} {item.unit}
                  </td>
                  <td className="py-1.5 text-right font-medium">
                    PKR {(item.price * item.qty).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-1 text-xs border-t border-dashed border-slate-200 pt-3">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>PKR {receipt.subTotal?.toFixed(2)}</span>
            </div>
            {receipt.tax > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Tax</span>
                <span>PKR {receipt.tax}</span>
              </div>
            )}
            {receipt.discount > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Discount</span>
                <span>-PKR {receipt.discount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm border-t border-slate-100 pt-1.5">
              <span>Grand Total</span>
              <span className="text-primary-700">
                PKR {receipt.grandTotal?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Paid</span>
              <span>PKR {receipt.sale?.amountPaid?.toFixed(2)}</span>
            </div>
            {receipt.changeReturned > 0 && (
              <div className="flex justify-between font-medium text-blue-600">
                <span>Change</span>
                <span>PKR {receipt.changeReturned?.toFixed(2)}</span>
              </div>
            )}
            {receipt.balanceDue > 0 && (
              <div className="flex justify-between font-bold text-red-600 bg-red-50 rounded px-2 py-1 mt-1">
                <span>⚠ Balance Due</span>
                <span>PKR {receipt.balanceDue?.toFixed(2)}</span>
              </div>
            )}
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            Thank you! 🙏 Please visit again
          </p>
        </div>

        <div className="mt-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onPrint}>
            <Printer size={15} /> Print
          </Button>
          <Button className="flex-1" onClick={onNew}>
            New Sale
          </Button>
        </div>
      </div>
    </div>
  );
}
