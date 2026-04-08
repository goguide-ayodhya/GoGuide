"use client";

interface HeadingProps {
  title?: string;
}

export default function HeadingTitle({ title }: HeadingProps) {
  if (!title) return null;

  return (
    <h1
      className="absolute left-1/2 -translate-x-1/2 
      text-sm sm:text-base md:text-xl 
      font-semibold text-foreground 
      truncate max-w-[140px] sm:max-w-[200px] md:max-w-none
    "
    >
      {/* Mobile short title */}
      <span className="sm:hidden">
        {title.length > 12 ? title.slice(0, 12) + "..." : title}
      </span>

      {/* Desktop full title */}
      <span className="hidden sm:inline">{title}</span>
    </h1>
  );
}
