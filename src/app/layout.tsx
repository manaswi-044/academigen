import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AdaptiveUIWrapper from "@/components/AdaptiveUIWrapper";
import OfflineBanner from "@/components/OfflineBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AcademiGen | AI Academic Record Generator",
  description: "Generate structured academic records, code execution screenshots, and reports from natural language instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground min-h-screen flex flex-col">
        <OfflineBanner />
        <AdaptiveUIWrapper>{children}</AdaptiveUIWrapper>
      </body>
    </html>
  );
}
