import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://scoremycv.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ScoreMyCV — Free ATS Resume Checker | CV Rewrite for ₹19",
  description:
    "Check your resume ATS score for free. See missing keywords and exactly why recruiters ignore your CV. Get your full CV professionally rewritten and download instantly for just ₹19.",
  keywords:
    "ATS resume checker, ATS score India, resume rewrite India, CV score free, ATS optimized resume, resume checker online, CV rewrite ₹19, job resume India",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "ScoreMyCV",
    title: "Free ATS Score Check + CV Rewrite for ₹19 — ScoreMyCV",
    description:
      "Upload your resume. Get your free ATS score instantly. See missing keywords. Get your entire CV professionally rewritten and download the polished PDF for just ₹19.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "ScoreMyCV — Free ATS Resume Checker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free ATS Score Check + CV Rewrite for ₹19 — ScoreMyCV",
    description:
      "Upload your resume. Get your free ATS score instantly. See missing keywords. Get your entire CV professionally rewritten and download the polished PDF for just ₹19.",
    images: [`${SITE_URL}/og-image.png`],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is an ATS score and why does it matter?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ATS stands for Applicant Tracking System — software companies use to automatically filter resumes before a human ever sees them. If your score is too low, your resume gets rejected instantly. Our free check tells you exactly where you stand.",
      },
    },
    {
      "@type": "Question",
      name: "What do I get for ₹19?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your entire CV is professionally rewritten — better language, strong action verbs, missing keywords added, and ATS-optimised formatting. The rewritten CV is generated instantly and downloads as a clean PDF the moment payment is confirmed.",
      },
    },
    {
      "@type": "Question",
      name: "Will my CV actually be rewritten — or just suggestions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Fully rewritten. Every section is improved — language, structure, keywords, and formatting — tailored to your target job role. You download the final polished PDF instantly after payment.",
      },
    },
    {
      "@type": "Question",
      name: "How long does it take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Instant. Your CV is rewritten in seconds after payment. Your PDF downloads automatically — no waiting, no email.",
      },
    },
    {
      "@type": "Question",
      name: "Is my data safe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Your resume is used only to generate the rewritten CV. We do not store, sell, or share your information with any third party.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use this for any job role or industry?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — it works across all IT and tech roles. You choose your target job role and the rewrite is tailored accordingly.",
      },
    },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "ATS Resume Checker & CV Rewrite",
  provider: {
    "@type": "Organization",
    name: "ScoreMyCV",
    url: SITE_URL,
  },
  description:
    "Free ATS resume score check with instant CV rewrite for ₹19. Upload your resume, get your score, missing keywords, and a fully rewritten ATS-optimised PDF instantly.",
  url: SITE_URL,
  offers: {
    "@type": "Offer",
    price: "19",
    priceCurrency: "INR",
    description: "Full CV rewrite — ATS-optimised PDF download",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
