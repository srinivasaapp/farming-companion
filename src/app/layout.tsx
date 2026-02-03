import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/layout/Shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://keypaper.in'),
  title: "Keypaper",
  description: "From soil to sale – all farming in one app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Keypaper",
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    other: {
      "msvalidate.01": "DC4A1292E06C1C2C47EBEF08AEC6B468",
    },
  },
  icons: {
    icon: '/logo.png', // Default
    apple: '/logo.png', // Apple touch icon
    shortcut: '/logo.png',
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";

import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="te" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={inter.variable} suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            <LanguageProvider>
              <ToastProvider>
                <ThemeProvider defaultTheme="system" storageKey="app-theme">
                  <Shell>{children}</Shell>
                </ThemeProvider>
              </ToastProvider>
            </LanguageProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
