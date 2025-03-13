"use client";

import { useEffect, useState } from "react";

export default function StickyLayout({
  children,
  stickyHeight,
  top,
}: {
  children: React.ReactNode;
  stickyHeight: number;
  top: number;
}) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (Math.round(window.scrollY) > stickyHeight) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full relative">
      <div
        className="w-full"
        style={{
          position: "sticky",
          //   position: isSticky ? "sticky" : "static",
          top: top,
        }}
      >
        {children}
      </div>
    </div>
  );
}
