import type { Metadata } from 'next';
import './globals.css';
import GlobalTooltip from './components/GlobalTooltip';

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
    <html lang="en">
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
      </head>
      <body>
        {children}
        <GlobalTooltip />
      </body>
    </html>
  );
}
