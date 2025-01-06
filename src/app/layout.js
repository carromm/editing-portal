import { Geist, Geist_Mono, Poppins } from "next/font/google";
import Navbar from "./navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: "100"
});

export const metadata = {
  title: "Carromm",
  description: "Auto-mobile AI studio professional shoot at clicks",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="font-[family-name:var(--font-poppins)] antialiased"
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
