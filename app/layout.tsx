import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavbarClean } from "@/components/ui/NavbarClean";
import { I18nProvider } from "@/lib/i18n/context";
import { ToastProvider } from "@/components/Toast";
import { ConfirmDialogProvider } from "@/components/ConfirmDialog";
import { LanguageSelector } from "@/components/LanguageSelector";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Facial Reconstruction Platform | Medical-Grade Local Flap Planning",
  description: "AI-powered facial reconstruction and local flap planning platform for healthcare professionals. Advanced vision analysis, defect detection, and surgical planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="antialiased">
        <I18nProvider>
          <ToastProvider>
            <ConfirmDialogProvider>
              <NavbarClean />
              <main>
                {children}
              </main>
            </ConfirmDialogProvider>
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
