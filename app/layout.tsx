import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Rail from "@/components/Rail";
import Monolith from "@/components/Monolith";

const mont = Montserrat({ subsets: ["latin"], variable: "--font-mont", weight: ["500", "600", "700", "800"] });
const open = Open_Sans({ subsets: ["latin"], variable: "--font-open" });

export const metadata: Metadata = {
  title: "Jat Law Professional Corporation | Barrister & Solicitor, Mississauga",
  description: "Real estate, litigation, corporate, wills & estates and simple divorce services in Mississauga. Book a free consultation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mont.variable} ${open.variable}`}>
      <body>
        <Header />
        <Rail />
        <Monolith />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
