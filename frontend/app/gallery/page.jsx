import GalleryPageClient from "@/components/gallery/GalleryPage";

export const metadata = {
  title: "Gallery — Travel Memories | Tourist",
  description:
    "Explore a curated gallery of travel memories: guided tours, spiritual visits, cab journeys and premium experiences.",
  openGraph: {
    title: "Gallery — Travel Memories | Tourist",
    description:
      "Explore a curated gallery of travel memories: guided tours, spiritual visits, cab journeys and premium experiences.",
    url: "https://www.goguide.in/gallery",
    siteName: "GoGuide",
    images: [
      {
        url: "/assets/goguide.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gallery — Travel Memories | Tourist",
    description:
      "Explore a curated gallery of travel memories: guided tours, spiritual visits, cab journeys and premium experiences.",
  },
};

export default function GalleryPage() {
  return <GalleryPageClient />;
}
