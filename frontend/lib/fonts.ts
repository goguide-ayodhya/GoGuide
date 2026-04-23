import { Poppins, Manrope, Merriweather } from "next/font/google";

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "800"],
});

export const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});
