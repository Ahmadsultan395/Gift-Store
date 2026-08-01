import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { Settings } from "@/models/index";
import { ok, fail, serverError } from "@/lib/apiResponse";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * Build system prompt with live store context
 */
async function buildSystemPrompt() {
  let storeInfo = {
    storeName: "Pansar Store",
    phone: "",
    address: "",
    shippingCharges: 150,
  };
  let topProducts = [];

  try {
    await connectDB();
    const settings = await Settings.findOne();
    if (settings) {
      storeInfo = {
        storeName: settings.storeName || "Pansar Store",
        phone: settings.phone || "0300-0000000",
        address: settings.address || "Main Bazaar",
        shippingCharges: settings.shippingCharges || 150,
        currency: settings.currency || "PKR",
        returnPolicy: settings.cms?.returnPolicy || "",
        privacyPolicy: settings.cms?.privacyPolicy || "",
      };
    }

    // Get top 20 active products for context
    topProducts = await Product.find({ status: "active" })
      .select("name sellingPrice stock unit category")
      .populate("category", "name")
      .sort({ totalSold: -1 })
      .limit(20)
      .lean();
  } catch (e) {
    console.error("Chat context error:", e.message);
  }

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
- Delivery Charges: PKR ${storeInfo.shippingCharges} (Free on orders above PKR 2000)
- Currency: ${storeInfo.currency || "PKR"}
- Payment Methods: Cash on Delivery (COD), Bank Transfer
- Delivery Time: Same day in local area, 2-3 days for other cities

AVAILABLE PRODUCTS (top items):
${productList}

POLICIES:
- Returns: Products can be returned within 7 days if unused and in original packaging
- Order Cancellation: Can be cancelled before "packed" status
- For complaints: Call on store phone or send WhatsApp message

YOUR RULES:
1. Always respond in the SAME LANGUAGE the customer uses (Urdu, Roman Urdu, or English)
2. Be warm, helpful and concise — like a friendly shopkeeper
3. If asked about a product, check the list above and give accurate price/stock info
4. If you don't know something specific (like exact order status), ask for order number and direct to phone
5. Keep responses SHORT — max 3-4 sentences unless a detailed answer is needed
6. Use emojis naturally to seem friendly 😊
7. For placing orders, guide them to the website's Products page
8. Never make up prices — only use prices from the product list above
9. If asked in Roman Urdu (e.g. "kya hal hai", "price kya hai"), respond in Roman Urdu
10. Sign off helpfully — always offer to help with anything else
11. Answer questions about delivery, payment, returns, exchange, cancellation, refund, shipping, timings and contact details.
12. Use the store information from Settings whenever possible.
13. Recommend similar products if an item is unavailable.
14. Never make up prices or stock.
15. If you don't know something, politely ask the customer to contact the store.
16. Keep replies short and professional.
17. Answer using the store policies provided above.
18. End every reply by asking if the customer needs anything else.`;
}

export async function POST(request) {
  try {
    if (!ANTHROPIC_API_KEY) {
      // Fallback if no API key — smart rule-based responses
      const { message } = await request.json();
      return ok({ reply: getFallbackReply(message) });
    }

    const { message, history = [] } = await request.json();
    if (!message?.trim()) return fail("Message is required");

    const systemPrompt = await buildSystemPrompt();

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
      // Fallback to rule-based
      const { message: msg } = await request.json().catch(() => ({ message }));
      return ok({ reply: getFallbackReply(message) });
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
 * Rule-based fallback when no API key is set
 */
function getFallbackReply(message = "") {
  const msg = message.toLowerCase();

  if (
    msg.includes("price") ||
    msg.includes("qeemat") ||
    msg.includes("rate") ||
    msg.includes("cost")
  ) {
    return "Prices ke liye humari Products page visit karein ya store pe call karein. Hum best rates guarantee karte hain! 💰";
  }
  if (
    msg.includes("order") ||
    msg.includes("track") ||
    msg.includes("delivery")
  ) {
    return "Apna order track karne ke liye 'My Orders' section mein jayein ya apna order number share karein. Delivery 1-3 working days mein hoti hai! 🚚";
  }
  if (
    msg.includes("return") ||
    msg.includes("refund") ||
    msg.includes("wapis")
  ) {
    return "Aap 7 din ke andar product return kar sakte hain agar wo unused aur original packaging mein ho. Store pe contact karein! 📦";
  }
  if (msg.includes("payment") || msg.includes("paisa") || msg.includes("cod")) {
    return "Hum Cash on Delivery (COD) aur Bank Transfer accept karte hain. COD mein delivery pe payment karein! 💵";
  }
  if (
    msg.includes("hello") ||
    msg.includes("hi") ||
    msg.includes("assalam") ||
    msg.includes("salam") ||
    msg.includes("helo")
  ) {
    return "Assalam o Alaikum! 👋 Pansar Store mein khush aamdeed! Main aapki kya madad kar sakta hoon?";
  }
  if (
    msg.includes("stock") ||
    msg.includes("available") ||
    msg.includes("hai")
  ) {
    return "Product availability ke liye search mein product ka naam likhein — stock ka status wahan show hoga! ✅";
  }
  if (
    msg.includes("discount") ||
    msg.includes("sale") ||
    msg.includes("offer")
  ) {
    return "Hamare Flash Sale section mein best discounts milti hain! Homepage pe jakar check karein 🔥";
  }
  if (
    msg.includes("contact") ||
    msg.includes("phone") ||
    msg.includes("number") ||
    msg.includes("call")
  ) {
    return "Aap hamein call kar sakte hain ya WhatsApp message bhej sakte hain. Contact details footer mein hain! 📞";
  }
  if (
    msg.includes("thanks") ||
    msg.includes("shukriya") ||
    msg.includes("thank")
  ) {
    return "Shukriya! Apki madad karke khushi hui 😊 Koi aur sawaal ho to zaroor poochhein!";
  }
  if (msg.includes("address") || msg.includes("location")) {
    return "Store ka address Contact page par available hai. 📍";
  }

  if (msg.includes("timing") || msg.includes("hours")) {
    return "Store timings Contact page par available hain. 🕒";
  }

  if (msg.includes("whatsapp")) {
    return "WhatsApp support available hai. 📲";
  }

  if (msg.includes("email")) {
    return "Email support available hai. 📧";
  }

  if (msg.includes("cancel")) {
    return "Packed hone se pehle order cancel kiya ja sakta hai. ❌";
  }

  if (msg.includes("exchange")) {
    return "7 din ke andar exchange available hai. 🔄";
  }

  if (msg.includes("invoice") || msg.includes("bill")) {
    return "Invoice har order ke sath provide kiya jata hai. 🧾";
  }

  if (msg.includes("bulk")) {
    return "Bulk orders ke liye support se rabta karein. 📦";
  }

  return "Main samjha nahi. Kya aap thoda aur detail mein bata sakte hain? Ya call karein — hum hamesha ready hain! 😊";
}
