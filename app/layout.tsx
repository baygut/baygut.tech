import type { Metadata } from 'next';
import { Manrope, Sunflower } from 'next/font/google';
import Script from 'next/script';
import GlobalTooltip from './components/GlobalTooltip';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';

// Setup fonts
const mainFont = Manrope({
  subsets: ['latin'],
  variable: '--font-main',
  display: 'swap',
});

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  title: 'Berkay Baygut | Personal Website',
  keywords: [
    'Berkay Baygut',
    'Portfolio',
    'Web Developer',
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'React Native',
    'Mobile Developer',
  ],
  description: "Berkay Baygut's personal website showcasing projects and skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mainFont.variable}`}>
      <head>
        <style>
          {`
            ::-webkit-scrollbar {
              display: none;
            }
            
            html {
              -ms-overflow-style: none;
              scrollbar-width: none;
              overflow-x: hidden;
            }
            
            body {
              overflow-x: hidden;
              width: 100vw;
              position: relative;
              background-color: #f5f5f5;
            }
            
            canvas {
              display: block;
            }
          `}
        </style>
        <Script
          async
          strategy="afterInteractive"
          type="module"
          src="https://registry.npmjs.org/@google/model-viewer/-/model-viewer-4.0.0.tgz/model-viewer.min.js"
        />
      </head>
      <body>
        {children}
        <GlobalTooltip />
        <Analytics />
      </body>
    </html>
  );
}
