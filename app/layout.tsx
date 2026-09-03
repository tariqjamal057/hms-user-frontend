import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ToasterProvider } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/AuthProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appName = "LTC HMS";
const appDescription =
  "LTC HMS — an integrated Hospital Management System for OPD, IPD, Emergency and ICU workflows. Manage patients, clinical orders, vitals, investigations, medicines and billing across every care team role.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  applicationName: appName,
  title: {
    default: "LTC HMS — Hospital Management System",
    template: `%s · ${appName}`,
  },
  description: appDescription,
  keywords: [
    "hospital management system",
    "HMS",
    "EMR",
    "patient management",
    "OPD",
    "IPD",
    "ICU",
    "emergency",
    "clinical workflow",
    "LTC HMS",
  ],
  authors: [{ name: "LTC HMS" }],
  creator: "LTC HMS",
  publisher: "LTC",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    siteName: appName,
    title: "LTC HMS — Hospital Management System",
    description: "Integrated clinical and administrative workflows for patient care teams.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="min-h-full flex flex-col antialiased font-sans">
        <ToasterProvider />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
