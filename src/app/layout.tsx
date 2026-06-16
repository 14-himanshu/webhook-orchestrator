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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#6366f1", // indigo-500
          colorBackground: "#0a0a0c", // project background
          colorInputBackground: "#18181b", // zinc-900
          colorInputText: "#f4f4f5", // zinc-100
        },
        elements: {
          card: "border border-zinc-800 shadow-2xl",
          headerTitle: "text-zinc-100",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButton: "border-zinc-800 hover:bg-zinc-800/50 text-zinc-300",
          formButtonPrimary: "bg-indigo-500 hover:bg-indigo-600 text-white font-medium",
          footerActionLink: "text-indigo-400 hover:text-indigo-300",
          formFieldInput: "border-zinc-800 focus:border-indigo-500",
          formFieldLabel: "text-zinc-400",
          dividerLine: "bg-zinc-800",
          dividerText: "text-zinc-500",
        }
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col bg-[#0a0a0c] text-slate-200 selection:bg-indigo-500/30">
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
