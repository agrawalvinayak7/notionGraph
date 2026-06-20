import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial serif used only for large display headlines (see docs/DESIGN.md).
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NotionGraph — See your Notion as a graph",
  description:
    "An Obsidian-style interactive knowledge graph for your Notion workspace.",
};

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
          colorPrimary: "#6366f1",
          colorBackground: "#13151c",
          borderRadius: "0.6rem",
        },
      }}
    >
      <html
        lang="en"
        className={`dark ${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
      >
        <body className="flex min-h-full flex-col">
          <Providers>
            <TooltipProvider>{children}</TooltipProvider>
          </Providers>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
