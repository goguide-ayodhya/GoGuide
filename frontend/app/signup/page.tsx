"use client";

import { assets } from "@/public/assets/assets";
import SignupTabs from "./SignupTabs";
import Image from "next/image";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md md:max-w-lg w-full space-y-8">
        <div className="text-center">
          <Image
            src={assets.logo}
            alt="GoGuide - Ayodhya"
            className="mx-auto h-24 w-auto"
          />
          <p className="text-muted-foreground pt-2">Book ● Feel ● Remember</p>
        </div>
        <SignupTabs />
      </div>
    </div>
  );
}
