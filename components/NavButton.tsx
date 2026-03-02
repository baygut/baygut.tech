'use client';

import React from 'react';

interface NavButtonProps {
  href: string;
  children: React.ReactNode;
}

const SCROLL_OFFSET = 75;

export default function NavButton({ href, children }: NavButtonProps) {
  return (
    <a
      href={href}
      className="text-3xl opacity-40 hover:opacity-100 transition-opacity duration-300 ease-in-out"
      onClick={(e) => {
        e.preventDefault();
        const target = document.querySelector(href);
        if (!target) return;

        const targetY = target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }}
    >
      {children}
    </a>
  );
}
