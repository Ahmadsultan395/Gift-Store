import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { Settings } from "@/models/index";
import { ok, fail, serverError } from "@/lib/apiResponse";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * Fetch live store settings + top products once, shared by both the
 * AI system prompt and the rule-based fallback — so storeName, phone,
 * address, currency, and delivery charges are always real, never
 * hardcoded placeholder text.
 */
async function getStoreInfo() {
  let storeInfo = {
    storeName: "Our Store",
    phone: "",
    address: "",
    shippingCharges: 150,
    currency: "PKR",
    returnPolicy: "",
    privacyPolicy: "",
  };
  let topProducts = [];

  try {
    await connectDB();
    const settings = await Settings.findOne();
    if (settings) {
      storeInfo = {
        storeName: settings.storeName || "Our Store",
        phone: settings.phone || "",
        address: settings.address || "",
        shippingCharges: settings.shippingCharges ?? 150,
        currency: settings.currency || "PKR",
        returnPolicy: settings.cms?.returnPolicy || "",
        privacyPolicy: settings.cms?.privacyPolicy || "",
      };
    }

    topProducts = await Product.find({ status: "active" })
      .select("name sellingPrice stock unit category")
      .populate("category", "name")
      .sort({ totalSold: -1 })
      .limit(20)
      .lean();
  } catch (e) {
    console.error("Chat context error:", e.message);
  }

  return { storeInfo, topProducts };
}

/**
 * Build system prompt with live store context
 */
function buildSystemPrompt(storeInfo, topProducts) {
  const productList =
    topProducts.length > 0
      ? topProducts
          .map(
            (p) =>
              `- ${p.name} | PKR ${p.sellingPrice} | Stock: ${p.stock} ${p.unit} | Category: ${p.category?.name || "General"}`,
          )
          .join("\n")
      : "Products loading...";

  return `You are a helpful, friendly customer support AI for ${storeInfo.storeName} — a Pakistani pansar (grocery) store.

STORE INFORMATION:
- Store Name: ${storeInfo.storeName}
- Phone: ${storeInfo.phone || "Contact admin"}
- Address: ${storeInfo.address || "See website"}
- Delivery Charges: PKR ${storeInfo.shippingCharges} (Free on orders above PKR 5000)
- Currency: ${storeInfo.currency || "PKR"}
- Payment Methods: Cash on Delivery (COD), Bank Transfer
- Delivery Time: Same day in local area, 2-3 days for other cities

AVAILABLE PRODUCTS (top items):
${productList}

WEBSITE SECTIONS (mention these when relevant):
- Categories page: browse all product categories
- Products page: search/filter all products, place orders here
- Customer Reviews: see and write verified customer reviews
- Newsletter: subscribe on the homepage for exclusive deals and early access to new arrivals
- Wishlist: save favorite products from a product's page
- FAQs page: common questions are also answered on the dedicated FAQs page

POLICIES:
- Returns: Products can be returned within 7 days if unused and in original packaging
- Order Cancellation: Can be cancelled before "packed" status
- Exchange: available within 7 days, same conditions as returns
- Invoice: provided automatically with every order
- For complaints: Call on store phone or send WhatsApp message

YOUR RULES:
1. Always respond in the SAME LANGUAGE the customer uses (Urdu, Roman Urdu, or English)
2. Be warm, helpful and concise — like a friendly shopkeeper
3. If asked about a product, check the list above and give accurate price/stock info
4. If you don't know something specific (like exact order status), ask for order number and direct to phone
5. Keep responses SHORT — max 3-4 sentences unless a detailed answer is needed
6. Use emojis naturally to seem friendly 😊
7. For placing orders, guide them to the website's Products page
8. Never make up prices, stock, or store details — only use the information provided above
9. If asked in Roman Urdu (e.g. "kya hal hai", "price kya hai"), respond in Roman Urdu
10. Recommend similar products (from the list above) if an item is unavailable
11. Answer questions about delivery, payment, returns, exchange, cancellation, refund, shipping, timings and contact details using the store information above
12. If you genuinely don't know something, politely direct the customer to call or WhatsApp the store phone number above
13. Sign off helpfully — always offer to help with anything else`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const message = body.message;
    const history = body.history || [];

    if (!message?.trim()) return fail("Message is required");

    const { storeInfo, topProducts } = await getStoreInfo();

    if (!ANTHROPIC_API_KEY) {
      return ok({ reply: getFallbackReply(message, storeInfo) });
    }

    const systemPrompt = buildSystemPrompt(storeInfo, topProducts);

    // Build conversation history for Claude
    const messages = [
      ...history.slice(-10).map((h) => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.text,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Claude API error:", err);
      return ok({ reply: getFallbackReply(message, storeInfo) });
    }

    const data = await response.json();
    const reply =
      data.content?.[0]?.text ||
      "Sorry, I couldn't process that. Please try again.";

    return ok({ reply });
  } catch (e) {
    console.error("Chat API error:", e);
    // Always return something — never crash the chat
    return ok({
      reply:
        "Sorry, main abhi available nahi hoon. Please store ko call karein! 📞",
    });
  }
}

/**
 * Rule-based fallback when no API key is set (or the AI call fails).
 *
 * IMPORTANT — ordering: checks go from MOST specific phrase to LEAST
 * specific. Generic words like "hai", "available", "kya" appear in
 * almost every Urdu/Roman-Urdu sentence, so they must never be used
 * as a stand-alone match condition near the top — that was the bug
 * causing unrelated questions (contact, address, timing, WhatsApp,
 * bulk orders, COD...) to all fall into the "stock" reply. Every
 * condition below requires a genuinely distinguishing keyword.
 */
function getFallbackReply(message = "", storeInfo = {}) {
  const msg = message.toLowerCase();
  const name = storeInfo.storeName || "Hamara store";
  const phone = storeInfo.phone;
  const address = storeInfo.address;
  const shippingCharges = storeInfo.shippingCharges ?? 150;
  const currency = storeInfo.currency || "PKR";

  // ── Greeting (checked early — distinct, common opener) ──
  if (
    msg.includes("assalam") ||
    msg.includes("salam") ||
    /\bhi\b/.test(msg) ||
    /\bhello\b/.test(msg) ||
    msg.includes("helo")
  ) {
    return `Assalam o Alaikum! 👋 ${name} mein khush aamdeed! Main aapki kya madad kar sakta hoon?`;
  }

  // ── Ordering flow ──
  if (
    msg.includes("kaise place") || // was: msg.includes("order kaise")
    msg.includes("order place") ||
    msg.includes("place order")
  ) {
    return "Website ke Products page se item choose karein, cart mein add karein, aur checkout par apni detail bhar kar order place kar dein — bohat asaan hai! 🛒";
  }

  if (
    msg.includes("new arrival") ||
    msg.includes("naye product") ||
    msg.includes("new product") // added
  ) {
    return "New arrivals homepage par sab se pehle dikhaye jate hain — zaroor check karein! ⭐";
  }

  // ── Delivery ──
  if (msg.includes("free delivery")) {
    return `Free delivery PKR 5000 se zyada ke order par milti hai! Us se kam order par PKR ${shippingCharges} delivery charges lagtay hain 🚚`;
  }
  if (msg.includes("delivery charge") || msg.includes("shipping charge")) {
    return `Delivery charges PKR ${shippingCharges} hain, aur PKR 5000+ ke order par ye free ho jate hain! 🚚`;
  }
  if (msg.includes("same day")) {
    return "Ji haan, local area mein same day delivery available hai! 📅";
  }
  if (
    msg.includes("other cit") ||
    msg.includes("doosre cit") ||
    msg.includes("doosray shehar")
  ) {
    return "Ji haan, hum tamam Pakistan mein deliver karte hain — doosre shehron mein 2-3 working days lagte hain 🌍";
  }

  // ── Payment (moved above the generic delivery catch-all — "Cash on
  // Delivery" contains the word "delivery" and was matching there first) ──
  if (msg.includes("bank transfer")) {
    return "Ji haan, Bank Transfer available hai — order ke waqt ye option choose kar sakte hain 🏦";
  }
  if (msg.includes("cash on delivery") || msg.includes("cod")) {
    return "Ji haan, Cash on Delivery (COD) available hai — delivery pe cash mein payment kar sakte hain! 💵";
  }
  if (msg.includes("payment")) {
    return "Hum Cash on Delivery (COD) aur Bank Transfer accept karte hain. COD mein delivery pe payment karein! 💵";
  }
  if (msg.includes("currency")) {
    return `Hamari saari prices ${currency} mein hain 💱`;
  }

  // ── Generic delivery catch-all — now safely LAST in this group ──
  if (
    msg.includes("delivery") ||
    msg.includes("shipping") ||
    msg.includes("kitne din")
  ) {
    return "Local area mein same day delivery hoti hai, doosre shehron ke liye 2-3 working days lagte hain! 🚚";
  }
  // ── Payment ──
  if (msg.includes("bank transfer")) {
    return "Ji haan, Bank Transfer available hai — order ke waqt ye option choose kar sakte hain 🏦";
  }
  if (msg.includes("cash on delivery") || msg.includes("cod")) {
    return "Ji haan, Cash on Delivery (COD) available hai — delivery pe cash mein payment kar sakte hain! 💵";
  }
  if (msg.includes("payment")) {
    return "Hum Cash on Delivery (COD) aur Bank Transfer accept karte hain. COD mein delivery pe payment karein! 💵";
  }
  if (msg.includes("currency")) {
    return `Hamari saari prices ${currency} mein hain 💱`;
  }

  // ── Bulk / minimum order ──
  if (msg.includes("minimum order")) {
    return "Filhaal koi minimum order amount required nahi hai — chota ya bara, jitna chahein order kar sakte hain 📋";
  }
  if (msg.includes("bulk")) {
    return `Bulk order par acha discount milta hai — is ke liye humein ${phone ? `${phone} par` : "direct"} call karein 🧾`;
  }

  // ── Gift / special ──
  if (msg.includes("gift pack")) {
    return "Gift packing available hai — order ke waqt note mein mention kar dein 🎁";
  }

  // ── Product categories ──
  if (msg.includes("organic")) {
    return "Ji haan, humare paas organic products bhi available hain — Categories page se dekh sakte hain 🌿";
  }
  if (msg.includes("dry fruit")) {
    return "Ji haan, dry fruits ki wide range available hai — Products page pe 'Dry Fruits' category check karein 🥜";
  }
  if (msg.includes("spice") || msg.includes("masal") || msg.includes("herb")) {
    return "Ji haan, masalay aur herbs available hain — Categories mein dekh sakte hain 🌾";
  }
  if (msg.includes("categor")) {
    return "Aap humari Categories page se saari product categories browse kar sakte hain — top menu mein 'Categories' pe click karein 🧺";
  }
  if (msg.includes("best sell")) {
    return "Best selling products aap Products page par 'Popular' ya 'Best Selling' filter se dekh sakte hain 🧂";
  }
  if (msg.includes("new arrival") || msg.includes("naye product")) {
    return "New arrivals homepage par sab se pehle dikhaye jate hain — zaroor check karein! ⭐";
  }
  if (msg.includes("stock") || msg.includes("product available")) {
    return "Product availability ke liye search mein product ka naam likhein — stock ka status wahan show hoga! ✅";
  }

  // ── Orders / invoice / cancel / exchange / return ──
  if (msg.includes("invoice") || msg.includes("bill")) {
    return "Invoice har order ke sath automatically provide kiya jata hai 🧾";
  }
  if (msg.includes("exchange")) {
    return "7 din ke andar, unused aur original packaging mein product exchange available hai 🔄";
  }
  if (msg.includes("cancel")) {
    return "Order 'packed' status se pehle cancel kiya ja sakta hai. 'Contact lain' humein call karein ❌";
  }
  if (
    msg.includes("return") ||
    msg.includes("refund") ||
    msg.includes("wapis")
  ) {
    return "Aap 7 din ke andar product return kar sakte hain agar wo unused aur original packaging mein ho. Store pe contact karein! 📦";
  }
  if (msg.includes("track")) {
    return "Apna order track karne ke liye 'My Orders' section mein jayein ya apna order number share karein 🚚";
  }
  if (msg.includes("order")) {
    return "Order se related kisi bhi madad ke liye 'My Orders' section check karein ya order number share karein 📦";
  }

  // ── Support channels ──
  if (msg.includes("whatsapp")) {
    return phone
      ? `WhatsApp support available hai — ${phone} par message karein 📲`
      : "WhatsApp support available hai — number footer mein diya gaya hai 📲";
  }
  if (msg.includes("email")) {
    return "Email support bhi available hai — detail footer mein di gayi hai 📧";
  }
  if (msg.includes("customer support")) {
    return phone
      ? `Customer support se ${phone} par call ya WhatsApp kar sakte hain 🤝`
      : "Customer support se contact page ke zariye rabta kar sakte hain 🤝";
  }
  if (
    msg.includes("timing") ||
    msg.includes("hours") ||
    msg.includes("khulta")
  ) {
    return "Store timings Contact page par available hain 🕒";
  }
  if (msg.includes("address") || msg.includes("location")) {
    return address
      ? `Hamara address: ${address} 📍`
      : "Store ka address Contact page par available hai 📍";
  }
  if (
    msg.includes("contact") ||
    msg.includes("phone") ||
    msg.includes("number") ||
    msg.includes("call")
  ) {
    return phone
      ? `Aap hamein ${phone} par call ya WhatsApp kar sakte hain 📞`
      : "Aap hamein call ya WhatsApp kar sakte hain. Contact details footer mein hain! 📞";
  }

  // ── Discounts / pricing ──
  if (
    msg.includes("discount") ||
    msg.includes("sale") ||
    msg.includes("offer")
  ) {
    return "Hamare Flash Sale section mein best discounts milti hain! Homepage pe jakar check karein 🔥";
  }
  if (
    msg.includes("price") ||
    msg.includes("qeemat") ||
    msg.includes("rate") ||
    msg.includes("cost")
  ) {
    return "Prices ke liye humari Products page visit karein ya store pe call karein. Hum best rates guarantee karte hain! 💰";
  }

  // ── Thanks ──
  if (
    msg.includes("thanks") ||
    msg.includes("shukriya") ||
    msg.includes("thank")
  ) {
    return "Shukriya! Apki madad karke khushi hui 😊 Koi aur sawaal ho to zaroor poochhein!";
  }

  return `Main samjha nahi. Kya aap thoda aur detail mein bata sakte hain? Ya${phone ? ` ${phone} par` : ""} call karein — hum hamesha ready hain! 😊`;
}
