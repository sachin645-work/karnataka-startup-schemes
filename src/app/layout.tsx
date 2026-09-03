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
  title: "Scheme Finder",
  description:
    "Find the government schemes actually meant for Karnataka student entrepreneurs, from a first idea to an incorporated company.",
  openGraph: {
    title: "Scheme Finder",
    description:
      "Find the government schemes actually meant for Karnataka student entrepreneurs, from a first idea to an incorporated company.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b4f8a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
