// components/common/TouristLoader.jsx

import React from "react";
import { assets } from "@/public/assets/assets";
import Image from "next/image";

interface TouristLoaderProps {
  text?: string;
  fullScreen?: boolean;
  size?: number;
  inline?: boolean;
}

const TouristLoader = ({
  text = "Loading...",
  fullScreen = false,
  size = 70,
  inline = false,
}: TouristLoaderProps) => {
  return (
    <div
      className={`
        flex items-center justify-center
        ${inline ? "flex-row gap-2" : "flex-col gap-3"}
        ${fullScreen ? "fixed inset-0 z-[9999] bg-white" : inline ? "w-auto h-auto" : "w-full h-full"}
      `}
    >
      {/* Logo Container */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Rotating Ring */}
        <div className={`absolute inset-0 rounded-full border-[3px] border-gray-200 border-t-black animate-spin`} />

        {/* Logo - Hide if size is too small for inline buttons */}
        {size >= 30 && (
          <Image
            src={assets.logo}
            alt="loader-logo"
            loading="eager"
            className="object-contain rounded-full"
            style={{
              width: size - 18,
              height: size - 18,
            }}
          />
        )}
      </div>

      {/* Text */}
      {text && (
        <p className={`${inline ? "text-xs" : "text-sm"} font-medium ${inline ? "text-inherit" : "text-gray-700"} tracking-wide animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default TouristLoader;
