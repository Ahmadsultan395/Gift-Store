import CMSPage from "@/components/website/CMSPage";

export const metadata = { title: "Privacy Policy" };

const DEFAULT = `## Your Privacy Is Our Responsibility

Welcome to Pansar Store. This Privacy Policy explains how we collect, use, and protect your personal information.

## Information We Collect

- Your name, phone number, and email address (when you register)
- Delivery address (when you place an order)
- Order history and purchase records
- Device information and browsing activity (to help improve the website)

## How We Use Your Information

We use your information to:

- Process and deliver your orders
- Send you order updates and delivery notifications
- Provide customer support
- Improve your website experience
- Send promotional offers (only with your permission)

## How We Protect Your Information

- Your data is protected with SSL encryption
- We never sell your data to third parties
- Only authorized staff can access your information
- We run regular security audits

## Cookies

Our website uses cookies to improve your experience. You can disable cookies in your browser settings, though some features may stop working properly.

## Your Rights

- You can access your personal information at any time
- You can request that your information be updated or deleted
- You can unsubscribe from promotional emails
- Reach out to us with any concerns

## Changes To This Policy

We may update this policy from time to time. We'll notify you of any significant changes by email.`;

export default function PrivacyPolicyPage() {
  return (
    <CMSPage
      title="Privacy Policy"
      subtitle="{store} — keeping your personal information safe"
      icon="🔒"
      settingsKey="privacyPolicy"
      defaultContent={DEFAULT}
      gradient="from-[#0B3D2E] to-[#134E3A]"
    />
  );
}
