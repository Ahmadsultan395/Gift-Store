import CMSPage from "@/components/website/CMSPage";

export const metadata = { title: "Terms & Conditions" };

const DEFAULT = `## Before You Get Started

By using our website, you agree to these Terms & Conditions. If you don't agree with them, please don't continue using the website.

## Our Services

Pansar Store is an online grocery platform delivering groceries and daily essentials across Pakistan.

## Creating An Account

- You must provide accurate information
- Account sharing is not allowed
- Keeping your password safe is your responsibility
- Accounts may be suspended for suspicious activity

## Orders And Payment

- Orders can be cancelled within 1 hour of being placed
- Payment is accepted via Cash on Delivery or Bank Transfer
- Prices may change without prior notice
- Stock availability cannot be guaranteed

## Delivery

- Delivery takes 1-3 working days (same-day in local areas)
- Providing an accurate delivery address is your responsibility — we are not liable for issues caused by an incorrect address
- If the customer is unavailable at the time of delivery, a re-delivery charge may apply

## Products And Quality

- We do our best to ensure top quality products
- Expiry dates are checked before delivery
- Minor variations between products are possible

## Prohibited Activities

The following are not allowed:

- Providing false information
- Attempting to hack the website
- Placing fake orders
- Offensive behavior towards our staff

## Intellectual Property

Our website's content, logo, and branding may not be copied.

## Liability

We are not liable for any indirect losses. Our maximum liability will never exceed the value of the order.

## Changes To These Terms

We may update these terms at any time. Continued use of the website means you accept the updated terms.`;

export default function TermsPage() {
  return (
    <CMSPage
      title="Terms & Conditions"
      subtitle="{store} — please read these terms before using our site"
      icon="📋"
      settingsKey="termsConditions"
      defaultContent={DEFAULT}
      gradient="from-[#0B3D2E] to-[#134E3A]"
    />
  );
}
