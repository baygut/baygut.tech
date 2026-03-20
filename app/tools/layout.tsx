import { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './tools.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Tools | berkaybaygut.com',
  description: 'Personal html tools and code snippets.',
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} tools-layout min-h-screen bg-tools-bg text-tools-fg font-sans antialiased selection:bg-tools-accent selection:text-white pb-12`}
    >
      {children}
    </div>
  );
}
