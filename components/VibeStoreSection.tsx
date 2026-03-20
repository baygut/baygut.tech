'use client';

import { motion } from 'framer-motion';

// A simple utility to generate a deterministic vibrant gradient from a string
function stringToGradient(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = Math.abs((hash * 2) % 360);
  return `linear-gradient(135deg, hsl(${hue1}, 80%, 60%), hsl(${hue2}, 80%, 40%))`;
}

export default function VibeStoreSection({ publicTools }: { publicTools: any[] }) {
  if (!publicTools || publicTools.length === 0) return null;

  return (
    <section className="py-24 bg-[#0a0a0a] relative overflow-hidden text-white" id="vibestore">
      {/* Background glow just for the vibestore section */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 left-[-100px] w-[500px] h-[500px] bg-fuchsia-600/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl">
        <div className="flex flex-col items-center mb-16 fade-in text-center">
          <div className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 px-4 py-1.5 rounded-full mb-6 relative overflow-hidden">
             <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>
             <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase">Interactive PWA Archive</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-6 drop-shadow-sm">
            VibeStore
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl font-medium">
            A standalone showcase of my public micro-apps, creative UI fragments, and interactive PWAs. Instantly deployed and ready to run.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
          {publicTools.map((tool, index) => {
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4) }}
                className="flex flex-col items-center group cursor-pointer"
                onClick={() => window.open(`/tools/${tool.slug}`, '_blank')}
              >
                {/* App Icon */}
                <div 
                  className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-[26px] shadow-xl group-hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] flex items-center justify-center relative overflow-hidden transition-all duration-300 transform group-hover:-translate-y-2 group-active:scale-95 group-active:translate-y-0 border border-white/5 mb-4"
                >
                  <img src={`/api/tools/${tool.slug}/icon.svg?v=${tool.updatedAt?.getTime?.() || Date.now()}`} alt={`${tool.title} Icon`} className="w-full h-full object-cover" />
                  
                  {/* Subtle inner shadow block */}
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] rounded-[26px] pointer-events-none"></div>
                </div>

                {/* App Info */}
                <h3 className="text-[15px] font-bold text-gray-100 mb-1 group-hover:text-blue-400 transition-colors text-center leading-tight line-clamp-2 w-full px-2" style={{ letterSpacing: '-0.01em' }}>
                  {tool.title}
                </h3>
                <p className="text-xs font-semibold text-gray-500 mb-4 tracking-wide uppercase text-center line-clamp-1 w-full px-2">
                  Micro-App
                </p>

                {/* Action Button */}
                <button className="px-5 py-1.5 rounded-full bg-white/10 hover:bg-white text-blue-400 hover:text-black text-[13px] font-bold tracking-wide uppercase transition-all duration-300">
                  Open
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
