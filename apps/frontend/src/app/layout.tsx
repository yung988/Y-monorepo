import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

import Footer from "@/components/Footer";
import { Header } from "@/components/Header";
import { ReduxProvider } from "@/components/ReduxProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YEEZUZ2020 - Oficiální E-shop",
  description: "Oficiální e-shop YEEZUZ2020 s exkluzivním oblečením a módou",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            <ReduxProvider>
              <Header />
              <main className="min-h-screen">{children}</main>
              <div className="mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24 max-w-[1400px] py-8">
                <Footer />
              </div>
            </ReduxProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
