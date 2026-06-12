import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ScoreMyCV — AI Resume ATS Checker | Get More Interview Calls",
  description:
    "Upload your resume and job description. Get ATS score, missing keywords, resume improvements, and interview questions — instantly for ₹99.",
  keywords: "ATS resume checker, resume score, job interview, resume analysis, ATS score India",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
