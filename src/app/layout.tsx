import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Providers } from "./providers";
import ChatWidget from "@/components/chat-widget";

export const metadata: Metadata = {
  title: {
    default: "BiteBear \u2014 Fresh meals, delivered",
    template: "%s | BiteBear",
  },
  description:
    "Order fresh, homemade meals from trusted local providers. Browse, order, and track your food with BiteBear.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
