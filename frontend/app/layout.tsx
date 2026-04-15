import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { manrope } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ayodhya Tourism | Book Cabs, Tours & Guides",
  description:
    "Discover Ayodhya with ease. Book cabs, tour packages, passes, and local guides. Experience the sacred city seamlessly.",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
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
