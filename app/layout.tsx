import type { Metadata } from "next";
import { Caveat, Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Rail from "@/components/Rail";

const mont = Montserrat({ subsets: ["latin"], variable: "--font-mont", weight: ["500", "600", "700", "800"] });
const open = Open_Sans({ subsets: ["latin"], variable: "--font-open" });
const script = Caveat({ subsets: ["latin"], variable: "--font-script", weight: ["500", "600"] });

export const metadata: Metadata = {
  title: "Jat Law Professional Corporation | Barrister & Solicitor, Mississauga",
  description: "Real estate, litigation, corporate, wills & estates and simple divorce services in Mississauga. Book a free consultation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mont.variable} ${open.variable} ${script.variable}`}>
      <body>
        <Header />
        <Rail />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
