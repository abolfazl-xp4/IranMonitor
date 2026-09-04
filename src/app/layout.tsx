import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ایران مانیتور | IranMonitor",
  description: "داشبورد بلادرنگ پایش ایران — زلزله، آب‌وهوا، کیفیت هوا، نرخ ارز، اخبار و آمار استانی",
  keywords: ["ایران", "مانیتور", "زلزله", "آب و هوا", "نرخ ارز", "اخبار", "Iran", "monitor"],
  authors: [{ name: "IranMonitor" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "ایران مانیتور",
    description: "داشبورد بلادرنگ پایش ایران",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} ${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          {children}
          <SonnerToaster position="top-center" richColors closeButton />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
