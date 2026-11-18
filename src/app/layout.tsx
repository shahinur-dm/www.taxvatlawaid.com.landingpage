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
    "TaxVat LawAid | Income Tax, VAT, Customs & Corporate Law Firm in Bangladesh",
  description:
    "Book a legal or tax consultation with TaxVat LawAid (Advocate Hossain Ahmed Khan) in Ramna, Dhaka. Trusted Income Tax, VAT, Customs, RJSC Company Law, IP, Tribunal & High Court Writ counsel in Bangladesh.",
  keywords: [
    "TaxVat LawAid",
    "TaxAid",
    "Hossain Ahmed Khan Advocate",
    "Income Tax Lawyer Bangladesh",
    "VAT Consultant Dhaka",
    "Customs Lawyer Bangladesh",
    "RJSC Company Registration Bangladesh",
    "High Court Writ Petition Lawyer Dhaka",
    "Tax Appeal Tribunal Lawyer Bangladesh",
    "Corporate Law Firm Dhaka",
    "Mushak 9.1 VAT Return Bangladesh",
    "IRC ERC BIDA Registration Dhaka",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "TaxVat LawAid | Trusted Tax, VAT, Customs & Corporate Legal Counsel in Bangladesh",
    description:
      "Schedule an in-person Ramna, Dhaka chamber appointment, video call, or phone consultation for Income Tax, VAT, Customs, RJSC Company Law, Tribunals & High Court Writs.",
    url: siteUrl,
    siteName: FIRM_INFO.name,
    locale: "en_BD",
    type: "website",
    images: [
      {
        url: "/images/hero-legal-chamber.jpg",
        width: 1200,
        height: 900,
        alt: "TaxVat LawAid — Legal, Tax, VAT & Corporate Chamber in Dhaka, Bangladesh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TaxVat LawAid | Tax, VAT, Customs & Corporate Legal Solutions",
    description:
      "Book a consultation with Advocate Hossain Ahmed (Khan) in Ramna, Dhaka or online across Bangladesh.",
    images: ["/images/hero-legal-chamber.jpg"],
  },
  icons: {
    icon: "/images/taxvat-lawaid-logo.png",
    apple: "/images/taxvat-lawaid-logo.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const legalServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  name: FIRM_INFO.name,
  alternateName: FIRM_INFO.associatedPractice,
  url: siteUrl,
  logo: `${siteUrl}/images/taxvat-lawaid-logo.png`,
  image: `${siteUrl}/images/hero-legal-chamber.jpg`,
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
    <html lang="en">
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
