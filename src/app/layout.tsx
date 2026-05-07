import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { Geist, Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "iVALT Developer Portal",
  description: "Manage your iVALT API keys and documentation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=IBM+Plex+Serif:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              border: "1px solid #cccfd3",
              color: "#3a3d43",
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              letterSpacing: "-0.025em",
            },
          }}
        />
      </body>
    </html>
  );
}
