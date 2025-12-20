import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { AlertDialogProvider } from "@/components/ui/alert-dialog";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "API Overrides Tool",
  description: "Configure API overrides to intercept and modify API responses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <ToastProvider>
          <AlertDialogProvider>
            <div className="flex-1">{children}</div>
            <Footer />
          </AlertDialogProvider>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
