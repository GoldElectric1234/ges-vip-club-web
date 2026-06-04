import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/app/auth/context";
import { PreferencesProvider } from "@/app/preferences/context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GES VIP CLUB - Premium Membership | Gold Electric Services",
  description:
    "Join GES VIP CLUB and get premium electrical services, exclusive benefits, and priority support from Gold Electric Services LLC. Your electrician for life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-white">
        <AuthProvider>
          <PreferencesProvider>{children}</PreferencesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
