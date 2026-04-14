import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai, Noto_Sans_Myanmar } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-thai",
  preload: true,
});

// Note: Noto Sans Myanmar UI is not available via next/font/google.
// Using Noto Sans Myanmar which is available and covers Myanmar script rendering.
const notoSansMyanmar = Noto_Sans_Myanmar({
  subsets: ["myanmar"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-myanmar",
  preload: true,
});

export const metadata: Metadata = {
  title: "2C2P Wave",
  description: "Mobile banking and cross-border remittance",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "2C2P Wave",
  },
  other: {
    "format-detection": "telephone=no,date=no,address=no,email=no",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0091EA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSansThai.variable} ${notoSansMyanmar.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-muted">
        <div className="mx-auto w-full max-w-[430px] min-h-dvh flex flex-col bg-background relative overflow-hidden shadow-xl">
          {children}
        </div>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
