"use client";
import useMousePosition from "@/hooks/useMousePosition";
import { motion } from "framer-motion";
import { useRef } from "react";
import SocialLinks, { SocialLink } from "./SocialLinks";

interface ContactItem {
  label?: string;
  value: string;
  href: string;
}

interface ContactSectionProps {
  title: string;
  contactItems: ContactItem[];
  socialLinks: SocialLink[];
  className?: string;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  title,
  contactItems,
  socialLinks,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { x, y } = useMousePosition();

  return (
    <section
      id="contact"
      ref={ref}
      className={`relative h-screen flex items-center justify-start bg-[var(--color-yellow)] p-10 text-white overflow-hidden ${className}`}
    >
      <motion.div
        animate={{
          left: x ? `${x}px` : "50%",
          top: y ? `${y}px` : "50%",
        }}
        transition={{
          type: "spring",
          damping: 10,
          stiffness: 50,
          restDelta: 0.001,
        }}
        className="absolute w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 bg-[var(--color-blue)] rounded-full z-0"
      />

      <div className="relative z-10 max-w-lg text-left">
        <h1 className="text-6xl text-white font-bold">{title}</h1>
        <hr className="my-4 border-t-2 border-white w-full" />

        {contactItems.map((item, index) => (
          <div key={index}>
            {item.label && (
              <p className="text-lg font-semibold">{item.label}:</p>
            )}
            <p>
              <a
                href={item.href}
                className="text-3xl font-bold underline-offset-4 relative group"
              >
                {item.value}
                <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
            </p>
          </div>
        ))}

        <SocialLinks links={socialLinks} className="mt-6" />
      </div>
    </section>
  );
};

export default ContactSection;
