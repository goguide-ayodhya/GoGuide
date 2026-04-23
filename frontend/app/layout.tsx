import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { manrope, merriweather } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoGuide | Ayodhya",
  description:
    "Discover Ayodhya with ease. Book cabs, tour packages, passes, and local guides. Experience the sacred city seamlessly.",
  icons: {
    icon: [
      {
        url: "/goguide.svg",
        media: "(prefers-color-scheme: light)",
      },
      //   {
      //     url: assets.iconDark,
      //     media: "(prefers-color-scheme: dark)",
      //   },
      //   {
      //     url: assets.iconSVG,
      //     type: "image/svg+xml",
      //   },
    ],
    // apple: assets.appleIcon,
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
