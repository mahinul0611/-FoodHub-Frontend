import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "FoodHub \u2014 Fresh meals, delivered",
    template: "%s | FoodHub",
  },
  description:
    "Order fresh, homemade meals from trusted local providers. Browse, order, and track your food with FoodHub.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
