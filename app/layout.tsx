import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToasterProvider } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/AuthProvider";


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CarePoint HIS — Hospital Management System",
  description: "Integrated Hospital Management System for clinical, operational, and administrative workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
    >
      <body className="min-h-full flex flex-col font-sans">
        <ToasterProvider />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
