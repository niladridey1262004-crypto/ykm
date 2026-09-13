import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import CustomCursor from "@/components/CustomCursor";

import Loader from "@/components/Loader";
import GlobalNavbar from "@/components/GlobalNavbar";
import BackToTop from "@/components/BackToTop";
import Toast from "@/components/Toast";
import CartDrawer from "@/components/shop/CartDrawer";
import LoginModal from "@/components/auth/LoginModal";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://youknowme.example.com";
const SITE_TITLE = "YOU KNOW ME — Niladri Day";
const SITE_DESCRIPTION =
  "Niladri Day builds innovative electronics, custom gadgets, and futuristic engineering projects. Shop the YOU KNOW ME innovation store for wireless devices, defense gear, and drone parts.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s — YOU KNOW ME",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Niladri Day",
    "YOU KNOW ME",
    "electronics",
    "gadgets",
    "drone parts",
    "self defense gadgets",
    "tech creator",
  ],
  authors: [{ name: "Niladri Day" }],
  creator: "Niladri Day",
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "YOU KNOW ME",
    locale: "en_US",
    images: [
      {
        url: "/images/arc-reactor.jpeg",
        width: 1200,
        height: 630,
        alt: "YOU KNOW ME — Innovation Shop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/images/arc-reactor.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable}`}>
      <body>
        <Providers>
          <SmoothScrollProvider />
          <CustomCursor />
          <Loader />
          <GlobalNavbar />
          {children}
          <BackToTop />
          <Toast />
          <CartDrawer />
          <LoginModal />
        </Providers>
      </body>
    </html>
  );
}
