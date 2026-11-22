import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FIRM_INFO } from "@/data/firm";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || FIRM_INFO.website;

export const viewport: Viewport = {
  themeColor: "#2B2E7E",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title:
    "TaxVat LawAid | Strategic Tax, VAT, Customs & Corporate Legal Counsel in Bangladesh",
  description:
    "Book a legal or tax consultation with TaxVat LawAid (Advocate Hossain Ahmed Khan) in Ramna, Dhaka. Trusted Income Tax, VAT, Customs, RJSC Company Law, IP, Tribunal & High Court Writ counsel in Bangladesh.",
  keywords: [
    "Tax Lawyer Bangladesh",
    "Tax Consultant Bangladesh",
    "Income Tax Lawyer Bangladesh",
    "Income Tax Consultant Dhaka",
    "VAT Consultant Bangladesh",
    "VAT Lawyer Bangladesh",
    "VAT & Mushak Consultant",
    "Tax Return Bangladesh",
    "Corporate Lawyer Bangladesh",
    "Corporate Legal Consultant Bangladesh",
    "RJSC Consultant Bangladesh",
    "RJSC Company Compliance",
    "Customs Lawyer Bangladesh",
    "Customs Consultant Bangladesh",
    "Tax Appeal Bangladesh",
    "Tax Tribunal Lawyer Bangladesh",
    "High Court Writ Lawyer Bangladesh",
    "Company Legal Compliance Bangladesh",
    "Intellectual Property Lawyer Bangladesh",
    "Legal Consultant Dhaka",
    "Business Legal Consultant Bangladesh",
    "TaxVat LawAid",
    "TaxAid",
    "Hossain Ahmed Khan Advocate",
    "আয়কর আইনজীবী ঢাকা",
    "ভ্যাট পরামর্শক বাংলাদেশ",
    "কাস্টমস আইনজীবী",
    "কোম্পানি রেজিস্ট্রেশন আরজেএসসি",
    "হাইকোর্ট রিট পিটিশন",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "bn-BD": "/",
      "en-US": "/",
    },
  },
  openGraph: {
    title:
      "TaxVat LawAid | Strategic Legal Counsel & Trusted Business Protection",
    description:
      "Schedule an in-person Ramna, Dhaka chamber appointment, video call, or phone consultation for Income Tax, VAT, Customs, RJSC Company Law, Tribunals & High Court Writs.",
    url: siteUrl,
    siteName: FIRM_INFO.name,
    locale: "bn_BD",
    alternateLocale: ["en_US"],
    type: "website",
    images: [
      {
        url: "/images/taxvat-og-preview.png",
        width: 1200,
        height: 630,
        alt: "TaxVat LawAid — Strategic Legal Counsel, Tax, VAT & Corporate Law Firm Bangladesh",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TaxVat LawAid | Tax, VAT, Customs & Corporate Legal Solutions",
    description:
      "Book a consultation with Advocate Hossain Ahmed (Khan) in Ramna, Dhaka or online across Bangladesh.",
    images: ["/images/taxvat-og-preview.png"],
  },
  icons: {
    icon: "/images/taxvat-lawaid-logo.png",
    apple: "/images/taxvat-lawaid-logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const legalServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  name: FIRM_INFO.name,
  alternateName: [FIRM_INFO.associatedPractice, "ট্যাক্সভ্যাট ল-এইড"],
  url: siteUrl,
  logo: `${siteUrl}/images/taxvat-lawaid-logo.png`,
  image: `${siteUrl}/images/taxvat-og-preview.png`,
  description:
    "Integrated legal, income tax, VAT, customs, RJSC company law, intellectual property, tribunal and High Court writ services in Bangladesh.",
  telephone: FIRM_INFO.phones[0].tel,
  email: FIRM_INFO.email,
  areaServed: {
    "@type": "Country",
    name: "Bangladesh",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "14/7, Eastern Mansion, Lift-14, 67/9, Pioneer Road, Ramna",
    addressLocality: "Dhaka",
    addressCountry: "BD",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "15:00",
      closes: "20:00",
    },
  ],
  founder: {
    "@type": "Person",
    name: FIRM_INFO.leadCounsel.name,
    jobTitle: FIRM_INFO.leadCounsel.title,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-white text-[#1E2438]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(legalServiceJsonLd),
          }}
        />
        <AnalyticsScripts />
        {children}
      </body>
    </html>
  );
}
