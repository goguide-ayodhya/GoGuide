import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "GoGuide Admin - Ayodhya",
  description: "Admin Dashboard for Tour Guide Booking Platform",
  generator: "v0.app",
  // icons: {
  //   icon: [
  //     // {
  //     //   url: '/icon-light-32x32.png',
  //     //   media: '(prefers-color-scheme: light)',
  //     // },
  //     {
  //       url: "/icon-dark-32x32.png",
  //       media: "(prefers-color-scheme: dark)",
  //     },
  //     {
  //       url: "/icon.svg",
  //       type: "image/svg+xml",
  //     },
  //   ],
  //   apple: "/apple-icon.png",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
