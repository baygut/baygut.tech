"use client";

import React from "react";

interface NavButtonProps {
  href: string;
  children: React.ReactNode;
}

export default function NavButton({ href, children }: NavButtonProps) {
  return (
    <a
      href={href}
      className="text-3xl opacity-40 hover:opacity-100 transition-opacity duration-300 ease-in-out"
      onClick={(e) => {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      {children}
    </a>
  );
}
