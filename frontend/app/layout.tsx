import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { manrope } from "@/lib/fonts";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "GoGuide | Ayodhya",
  description:
    "Discover Ayodhya with ease. Govt. Verified Guides & Drivers, Tour Packages & Uber like ride system. Experience the sacred city seamlessly",
  icons: {
    icon: [
      {
        url: "/goguide.svg",
        media: "(prefers-color-scheme: light)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.className} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
