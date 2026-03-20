'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Search, ArrowUpRight, FolderOpen, Clock } from 'lucide-react';

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';
  return 'Just now';
}

export function ToolsGrid({ tools }: { tools: any[] }) {
  const [search, setSearch] = useState('');

  const filteredTools = tools?.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const isRecentlyUpdated = (date: Date) => {
    return new Date().getTime() - new Date(date).getTime() < 86400 * 1000 * 3; // 3 days
  };

  return (
    <div className="w-full">
      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-tools-border/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-tools-surface flex items-center justify-center border border-tools-border shadow-sm">
            <FolderOpen size={18} className="text-tools-accent" />
          </div>
          <div>
            <div className="text-white font-medium text-lg">{tools?.length || 0} Tools Deployments</div>
            <div className="text-tools-muted text-xs font-mono">Real-time status: ACTIVE</div>
          </div>
        </div>
        
        <div className="relative w-full sm:w-80 group">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tools-muted group-focus-within:text-tools-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Search tools by name, slug or desc..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-tools-surface/50 border border-tools-border/60 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tools-accent/50 focus:border-tools-accent/50 transition-all font-medium placeholder-tools-muted/60"
          />
        </div>
      </div>

      {filteredTools.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center rounded-3xl border border-dashed border-tools-border/50 bg-tools-surface/20"
        >
          <div className="w-16 h-16 rounded-full bg-tools-surface border border-tools-border flex items-center justify-center mb-6 shadow-inner">
            <Search size={24} className="text-tools-muted/50" />
          </div>
          <div className="text-white/60 text-xl font-medium tracking-tight mb-2">
            {tools?.length === 0 ? "You haven't built anything yet" : "No results found"}
          </div>
          <p className="text-tools-muted text-sm max-w-sm">
            {tools?.length === 0 
              ? "Your deployed HTML fragments and dynamic micro-apps will live entirely here."
              : `We couldn't find any tool matching "${search}".`}
          </p>
        </motion.div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredTools.map((tool, index) => {
              const recent = tool.updatedAt && isRecentlyUpdated(tool.updatedAt);
              return (
                <motion.div
                  layout
                  key={tool.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: [0.23, 1, 0.32, 1] }}
                  className="group relative flex flex-col bg-tools-surface rounded-2xl border border-tools-border/60 hover:border-tools-accent/40 shadow-sm hover:shadow-xl hover:shadow-tools-accent/5 transition-all duration-300 overflow-hidden"
                >
                  {/* Subtle top glare */}
                  <div className="absolute inset-x-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Sliding Edge Accent */}
                  <div className="absolute top-0 left-0 w-[2px] h-0 bg-gradient-to-b from-tools-accent to-indigo-500 group-hover:h-full transition-all duration-500 ease-out z-10" />
                  
                  <div className="p-7 flex-1 relative flex flex-col">
                    <div className="absolute top-6 right-6 z-20">
                      <a 
                        href={`/tools/${tool.slug}/edit`} 
                        title="Edit tool"
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-tools-bg border border-tools-border text-tools-muted hover:text-white hover:border-tools-accent/50 hover:bg-tools-surface transition-all transform hover:scale-110 active:scale-95 shadow-sm"
                      >
                        <Pencil size={14} />
                      </a>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-5 opacity-90">
                      <img 
                        src={`/api/tools/${tool.slug}/icon.svg?v=${tool.updatedAt?.getTime?.() || Date.now()}`}
                        alt={tool.title}
                        className="w-10 h-10 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-tools-border/50 object-cover"
                      />
                      <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                          <div className={`relative flex items-center justify-center w-2 h-2`}>
                            {recent && (
                              <div className="absolute inset-0 bg-[#a3e635] rounded-full animate-ping opacity-60" />
                            )}
                            <div className={`w-2 h-2 rounded-full relative z-10 ${recent ? 'bg-[#a3e635] shadow-[0_0_8px_rgba(163,230,53,0.8)]' : 'bg-[#6b7280]'}`} />
                          </div>
                          <span className="font-mono text-xs font-semibold tracking-wider uppercase text-tools-muted/80">
                            {tool.slug}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all pr-12 line-clamp-2">
                      {tool.title}
                    </h3>
                    
                    <p className="text-tools-muted text-[15px] leading-relaxed mb-6 line-clamp-3 font-medium">
                      {tool.description || <span className="italic opacity-50">No description documented.</span>}
                    </p>
                    
                    <div className="mt-auto flex items-center gap-2 text-xs font-mono text-tools-muted/60">
                      <Clock size={12} />
                      Deployed {timeAgo(tool.updatedAt || tool.createdAt)}
                    </div>
                  </div>

                  <div className="p-2 pt-0">
                    <a 
                      href={`/tools/${tool.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#1a1a1f] text-tools-muted rounded-xl font-medium text-sm border border-tools-border/50 group-hover:bg-tools-accent group-hover:border-tools-accent group-hover:text-white group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300"
                    >
                      Launch Platform 
                      <ArrowUpRight size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
