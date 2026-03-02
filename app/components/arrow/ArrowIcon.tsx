'use client';
import React from 'react';
import { ArrowIconProps } from './types';

const SCROLL_OFFSET = 75;

const ArrowIcon = ({ height = 32, className, href }: ArrowIconProps) => {
  return (
    <svg
      href={href}
      onClick={(e) => {
        e.preventDefault();
        const target = document.querySelector(href);
        if (!target) return;

        const targetY = target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }}
      className={className}
      width={height / 2} // Adjusted proportion for better balance
      height={height}
      viewBox="0 0 20 40" // Adjusted for longer arrow line
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 2V36" />
      <path d="M2 30L10 36L18 30" />
    </svg>
  );
};

export default ArrowIcon;
