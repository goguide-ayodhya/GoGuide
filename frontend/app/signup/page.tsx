"use client";

import { assets } from "@/public/assets/assets";
import Image from "next/image";

export default function SignupPage() {
  return (
    <div className="">
      <div className="max-w-md md:max-w-lg w-full space-y-8">
        <div className="text-center">
          <Image
            src={assets.logo}
            alt="GoGuide - Ayodhya"
            className="mx-auto h-24 w-auto"
          />
          <p className="text-muted-foreground pt-2">Book ● Feel ● Remember</p>
        </div>
      </div>
    </div>
  );
}
