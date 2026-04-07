import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { PriceDataProvider } from "@/lib/priceStore";
import { AuthProvider } from "@/lib/authStore";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "F&F Intelligence Platform",
  description: "Data-driven intelligence platform for Flavour & Fragrance industry",
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
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <PriceDataProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </PriceDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
