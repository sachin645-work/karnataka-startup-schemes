import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Karnataka Startup Schemes",
  description:
    "Karnataka Startup Schemes is an independent AI assistant that helps you discover which Karnataka government startup schemes you might qualify for — sourced only from the official Startup Karnataka portal.",
  openGraph: {
    title: "Karnataka Startup Schemes",
    description:
      "An independent AI assistant for discovering Karnataka startup schemes — sourced only from the official Startup Karnataka portal.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#003da5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-govgray-700">{children}</body>
    </html>
  );
}
