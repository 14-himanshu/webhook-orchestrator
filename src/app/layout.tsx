import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Webhook Orchestrator",
  description: "Enterprise webhook delivery infrastructure",
};

import { ThemeProvider } from "./components/ThemeProvider";
import SmoothScroll from "./components/SmoothScroll";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: "#ffffff", // white
          colorBackground: "#0a0a0c", // project background
        },
        elements: {
          card: "bg-[#0A0A0A] border border-zinc-800 shadow-sm",
          headerTitle: "text-zinc-100",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButton: "bg-[#0A0A0A] border-zinc-800 hover:bg-zinc-900 text-zinc-300 transition-colors",
          formButtonPrimary: "bg-white hover:bg-zinc-200 text-black font-medium border border-transparent transition-all",
          footerActionLink: "text-zinc-300 hover:text-white",
          formFieldInput: "bg-zinc-900 text-zinc-200 border-zinc-800 focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 outline-none transition-all duration-200",
          formFieldLabel: "text-zinc-400 font-medium",
          dividerLine: "bg-zinc-800",
          dividerText: "text-zinc-500",
        }
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
        suppressHydrationWarning
      >
        <body className="min-h-screen flex flex-col bg-[#0a0a0c] text-slate-200 selection:bg-indigo-500/30" suppressHydrationWarning>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <SmoothScroll>
              {children}
              <Toaster theme="dark" position="bottom-right" richColors toastOptions={{
                style: { background: '#0A0A0A', border: '1px solid #27272a', color: '#e4e4e7' }
              }} />
            </SmoothScroll>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
