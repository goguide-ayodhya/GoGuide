// components/common/TouristLoader.jsx

import React from "react";
import goguideSVG from "@/public/goguideSVG.svg";
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
  const logoSize = Math.max(24, size - 20);

  return (
    <div
      className={`
        flex items-center justify-center
        ${inline ? "flex-row gap-2" : "flex-col gap-3"}
        ${fullScreen ? "fixed inset-0 z-[9999] bg-white/95" : inline ? "w-auto h-auto" : "w-full min-h-screen bg-white/90"}
      `}
    >
      {/* Logo Container */}
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        {/* Rotating Ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-gray-200 border-t-primary animate-[spin_1.2s_linear_infinite]" />
        {/* Logo - Hide if size is too small for inline buttons */}
        {size >= 30 && (
          <div
            className="relative"
            style={{
              width: logoSize,
              height: logoSize,
            }}
          >
            <Image
              src={goguideSVG}
              alt="loader-logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        )}
      </div>

      {/* Text */}
      {text && (
        <p
          className={`${inline ? "text-xs" : "text-sm"} font-medium ${inline ? "text-inherit" : "text-gray-700"} tracking-wide animate-pulse`}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default TouristLoader;
