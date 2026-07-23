import CMSPage from "@/components/website/CMSPage";

export const metadata = { title: "Return Policy" };

const DEFAULT = `## Our Return Policy

We want you to be 100% satisfied. If anything goes wrong, we'll help you sort it out — no hassle.

## How Long Do You Have To Return An Item?

- Request a return within **7 days** of delivery
- The product must be in its original packaging
- The product must be unused

## What Can Be Returned?

- You received a damaged or defective product
- You received the wrong item
- The product doesn't match its description
- The item was already expired at the time of delivery

## What Can't Be Returned?

- Perishable items (fresh vegetables, dairy) — only returnable if damaged
- Personal hygiene products (once opened)
- Sale / clearance items (unless damaged)
- Requests made after 7 days

## How To Return An Item

- Step 1: Call us or send a WhatsApp message
- Step 2: Share your order number and a photo of the issue
- Step 3: We'll respond within 24 hours
- Step 4: We'll arrange a pickup for the product
- Step 5: Replacement or refund within 3-5 working days

## How Do Refunds Work?

- **Cash on Delivery orders**: Cash refund or store credit
- **Bank transfer orders**: Refunded to the same account
- **Refund time**: 3-5 working days

## Received A Damaged Item?

Contact us right away with a photo. We'll issue a replacement or full refund — no questions asked.`;

export default function ReturnPolicyPage() {
  return (
    <CMSPage
      title="Return Policy"
      subtitle="{store} — hassle-free returns within 7 days"
      icon="📦"
      settingsKey="returnPolicy"
      defaultContent={DEFAULT}
      gradient="from-[#0B3D2E] to-[#134E3A]"
    />
  );
}
