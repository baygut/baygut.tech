'use client';

import { useState, useCallback, useEffect } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { ToastContainer, useToast } from './toast';
import { saveToolBase, deleteToolAction } from '../actions';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';

export function ToolEditor({
  initialData,
}: {
  initialData?: { title: string; slug: string; description: string; html: string; visibility?: 'public' | 'private' | 'password'; password?: string | null; iconColor?: string | null };
}) {
  const router = useRouter();
  const { toasts, addToast } = useToast();
  
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'password'>(initialData?.visibility || 'public');
  const [password, setPassword] = useState(initialData?.password || '');
  
  const [html, setHtml] = useState(
    initialData?.html || 
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Tool</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; background: #0a0a0a; color: #fff; }
  </style>
</head>
<body>
  <h1>Hello, berkaybaygut.com tools</h1>
</body>
</html>`
  );

  const [saving, setSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showPreview, setShowPreview] = useState(true);

  const [iconMode, setIconMode] = useState<'auto' | 'color' | 'image'>(initialData?.iconColor ? 'color' : 'auto');
  const [iconColor, setIconColor] = useState(initialData?.iconColor || '#3b82f6');
  const [iconImage, setIconImage] = useState<{ data: ArrayBuffer; type: string } | null>(null);

  // Auto-generate slug from title if we are creating new
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!initialData?.slug) {
      setSlug(newTitle.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'));
  };

  const handleSave = useCallback(async () => {
    if (!title || !slug || !html) {
      addToast('Missing required fields', 'error');
      return;
    }
    setSaving(true);
    setSavedStatus('saving');
    try {
      const finalColor = iconMode === 'color' ? iconColor : null;
      const finalImageBuffer = iconMode === 'image' && iconImage ? iconImage.data : null;
      const finalImageType = iconMode === 'image' && iconImage ? iconImage.type : null;

      const savedSlug = await saveToolBase(slug, title, html, description, visibility, password, finalColor, finalImageBuffer, finalImageType);
      setSavedStatus('saved');
      addToast('Tool saved!', 'success');
      setTimeout(() => setSavedStatus('idle'), 2000);
      
      // If new, redirect to editor with true slug
      if (!initialData?.slug && savedSlug) {
        router.push(`/tools/${savedSlug}/edit`);
      }
    } catch (err: any) {
      addToast(err.message || 'Error saving tool', 'error');
      setSavedStatus('idle');
    } finally {
      setSaving(false);
    }
  }, [title, slug, html, description, visibility, password, initialData, router, addToast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShowPreview((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tool?')) return;
    try {
      await deleteToolAction(slug);
      addToast('Tool deleted', 'success');
      router.push('/tools');
    } catch (err: any) {
      addToast(err.message || 'Error deleting tool', 'error');
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden text-tools-fg">
      {/* Top Bar */}
      <div className="flex-none h-16 border-b border-tools-border bg-tools-surface flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-tools-muted font-mono text-xs tracking-wider">
            <a href="/tools" className="hover:text-tools-fg transition-colors">tools</a> / {initialData ? 'edit' : 'new'}
          </div>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Tool Title"
            className="bg-transparent border-none text-xl font-bold focus:outline-none focus:ring-0 placeholder-tools-muted/50 w-full max-w-sm"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4 group relative">
            {/* Live SVG Preview / Thumbnail Thumbnail */}
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-tools-border flex items-center justify-center bg-tools-surface font-bold text-white shadow-sm hover:border-tools-accent transition-colors">
              {iconMode === 'color' ? (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-mono tracking-tighter" style={{backgroundColor: iconColor}}>
                  {title ? title.split(/[-_\s]+/).filter(Boolean).slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('') : 'T'}
                </div>
              ) : iconMode === 'image' ? (
                 <div className="w-full h-full flex items-center justify-center text-[10px] bg-white/20 select-none">...</div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] bg-gradient-to-br from-blue-500 to-indigo-600 font-mono tracking-tighter">
                  {title ? title.split(/[-_\s]+/).filter(Boolean).slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('') : 'T'}
                </div>
              )}
            </div>
            
            <div className="absolute top-full left-0 pt-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none group-hover:pointer-events-auto">
             <div className="p-3 bg-tools-surface border border-tools-border shadow-2xl rounded-xl w-[320px] flex flex-col gap-3">
              <div className="text-xs font-semibold text-tools-muted uppercase tracking-wider mb-1">Store Icon Configuration</div>
              
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white/5 transition-colors border border-transparent">
                <input type="radio" checked={iconMode === 'auto'} onChange={() => setIconMode('auto')} className="accent-tools-accent" />
                <span className="text-sm font-medium">Auto Gradient</span>
              </label>

              <label className="flex flex-col gap-2 cursor-pointer p-2 rounded hover:bg-white/5 transition-colors border border-transparent">
                <div className="flex items-center gap-2">
                  <input type="radio" checked={iconMode === 'color'} onChange={() => setIconMode('color')} className="accent-tools-accent" />
                  <span className="text-sm font-medium">Solid Background</span>
                  {iconMode === 'color' && (
                    <input type="color" value={iconColor} onChange={e => setIconColor(e.target.value)} className="ml-auto w-6 h-6 p-0 border-0 rounded cursor-pointer" />
                  )}
                </div>
              </label>

              <div className="flex flex-col gap-2 p-2 rounded hover:bg-white/5 transition-colors border border-transparent">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={iconMode === 'image'} onChange={() => setIconMode('image')} className="accent-tools-accent" />
                  <span className="text-sm font-medium">Custom Image Blob</span>
                </label>
                {iconMode === 'image' && (
                  <div className="mt-2 pl-6 pointer-events-auto">
                    <ImageUpload 
                      singleImage 
                      label="Upload PNG, JPEG..."
                      onImagesChange={(images) => {
                        if (images.length > 0) setIconImage(images[0]);
                        else setIconImage(null);
                      }} 
                    />
                  </div>
                )}
              </div>
             </div>
            </div>
          </div>
        
          <input
            type="text"
            value={slug}
            onChange={handleSlugChange}
            placeholder="slug"
            className="w-48 bg-tools-bg border border-tools-border rounded px-3 py-1 font-mono text-sm focus:outline-none focus:border-tools-accent focus:ring-1 focus:ring-tools-accent"
          />
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-1.5 text-sm font-medium border border-tools-border rounded hover:bg-tools-border transition-colors text-tools-muted hover:text-tools-fg"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          {initialData && (
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm font-medium border border-red-900/50 text-red-500 rounded hover:bg-red-900/20 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-28 py-1.5 bg-tools-accent text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {savedStatus === 'saving' && 'Saving...'}
            {savedStatus === 'saved' && 'Saved ✓'}
            {savedStatus === 'idle' && 'Save Tool'}
          </button>
        </div>
      </div>
      
      {/* Settings Bar */}
      <div className="bg-tools-surface border-b border-tools-border px-6 py-2 flex items-center justify-between gap-4">
         <input
           type="text"
           value={description}
           onChange={(e) => setDescription(e.target.value)}
           placeholder="Optional description..."
           className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm placeholder-tools-muted"
         />
         <div className="flex items-center gap-4 text-xs font-medium text-tools-muted">
           <label className="flex items-center gap-1.5 cursor-pointer hover:text-tools-fg transition-colors">
             <input type="radio" value="public" checked={visibility === 'public'} onChange={() => setVisibility('public')} className="accent-tools-accent" />
             Public
           </label>
           <label className="flex items-center gap-1.5 cursor-pointer hover:text-tools-fg transition-colors">
             <input type="radio" value="private" checked={visibility === 'private'} onChange={() => setVisibility('private')} className="accent-tools-accent" />
             Only me
           </label>
           <div className="flex items-center gap-1.5">
             <label className="flex items-center gap-1.5 cursor-pointer hover:text-tools-fg transition-colors">
               <input type="radio" value="password" checked={visibility === 'password'} onChange={() => setVisibility('password')} className="accent-tools-accent" />
               Password
             </label>
             {visibility === 'password' && (
               <input 
                 type="text" 
                 placeholder="Enter password..." 
                 value={password}
                 onChange={e => setPassword(e.target.value)}
                 className="bg-tools-bg border border-tools-border rounded px-2 py-0.5 w-32 focus:outline-none focus:border-tools-accent transition-colors"
               />
             )}
           </div>
         </div>
      </div>

      <div className="flex-1 flex min-h-0 relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 min-h-0"
          style={{ width: showPreview ? '60%' : '100%' }}
        >
          <MonacoEditor
            height="100%"
            language="html"
            theme="vs-dark"
            value={html}
            onChange={(value) => setHtml(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'var(--font-geist-mono), monospace',
              padding: { top: 24, bottom: 24 },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />
        </motion.div>

        {showPreview && (
          <div className="flex-1 min-h-0 border-l border-tools-border bg-tools-bg relative" style={{ maxWidth: '40%' }}>
            <iframe
              title="preview"
              srcDoc={html}
              sandbox="allow-scripts allow-same-origin allow-forms"
              className="absolute inset-0 w-full h-full bg-white" 
            />
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
