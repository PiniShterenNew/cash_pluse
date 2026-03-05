import type { Metadata } from "next";
import { Toaster } from "sonner";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "CashPulse — ניהול תזרים מזומנים",
    template: "%s | CashPulse",
  },
  description: "פתרון לניהול תזרים מזומנים וגביית חובות לעסקים קטנים ובינוניים בישראל",
  keywords: ["תזרים מזומנים", "גביית חובות", "ניהול פיננסי", "עסקים קטנים"],
  authors: [{ name: "CashPulse" }],
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Varela+Round&family=Rubik:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          richColors
          dir="rtl"
          toastOptions={{
            style: {
              fontFamily: "Rubik, sans-serif",
              borderRadius: "9999px",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
