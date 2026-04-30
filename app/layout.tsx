import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/language-context";
import InstallBanner from "@/components/app/InstallBanner";

export const metadata: Metadata = {
  title: {
    default: "KametiPro — Smart Kameti Management",
    template: "%s | KametiPro",
  },
  description:
    "Manage your Kameti (rotating savings) groups digitally. Track contributions, payouts, and members with ease.",
  keywords: ["kameti", "committee", "savings", "Pakistan", "chit fund", "rotating savings"],
  authors: [{ name: "KametiPro" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KametiPro",
  },
  openGraph: {
    type: "website",
    siteName: "KametiPro",
    title: "KametiPro — Smart Kameti Management",
    description: "Manage your Kameti groups digitally.",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KametiPro" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <LanguageProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
          <InstallBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}
