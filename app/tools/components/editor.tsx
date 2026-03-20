'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ToastContainer, useToast } from './toast';
import { saveToolBase, deleteToolAction } from '../actions';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';

// Dynamically import Monaco only on non-mobile
import dynamic from 'next/dynamic';
const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((m) => m.Editor), {
  ssr: false,
});

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export function ToolEditor({
  initialData,
}: {
  initialData?: {
    title: string;
    slug: string;
    description: string;
    html: string;
    visibility?: 'public' | 'private' | 'password';
    password?: string | null;
    iconColor?: string | null;
    iconImageDataUrl?: string | null;
    iconImageType?: string | null;
  };
}) {
  const router = useRouter();
  const { toasts, addToast } = useToast();
  const isMobile = useIsMobile();

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'password'>(
    initialData?.visibility || 'public'
  );
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
  const [showPreview, setShowPreview] = useState(false);
  // Mobile: whether the settings panel is expanded
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  const [iconMode, setIconMode] = useState<'auto' | 'color' | 'image'>(
    initialData?.iconImageDataUrl ? 'image' : initialData?.iconColor ? 'color' : 'auto'
  );
  const [iconColor, setIconColor] = useState(initialData?.iconColor || '#3b82f6');
  const [iconImage, setIconImage] = useState<{ data: ArrayBuffer; type: string } | null>(null);
  const [existingIconDataUrl, setExistingIconDataUrl] = useState<string | null>(
    initialData?.iconImageDataUrl || null
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!initialData?.slug) {
      setSlug(
        newTitle
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
      );
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(
      e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
    );
  };

  const handleSave = useCallback(async () => {
    if (!title || !slug || !html) {
      addToast('Missing required fields', 'error');
      return;
    }
    setSaving(true);
    setSavedStatus('saving');
    try {
      let finalImageBuffer = iconMode === 'image' && iconImage ? iconImage.data : null;
      let finalImageType = iconMode === 'image' && iconImage ? iconImage.type : null;

      if (iconMode === 'image' && !iconImage && existingIconDataUrl) {
        const [meta, b64] = existingIconDataUrl.split(',');
        const mime = meta.replace('data:', '').replace(';base64', '');
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        finalImageBuffer = bytes.buffer;
        finalImageType = mime;
      }

      const savedSlug = await saveToolBase(
        slug,
        title,
        html,
        description,
        visibility,
        password,
        iconMode === 'color' ? iconColor : null,
        finalImageBuffer,
        finalImageType
      );
      setSavedStatus('saved');
      addToast('Tool saved!', 'success');
      setTimeout(() => setSavedStatus('idle'), 2000);

      if (!initialData?.slug && savedSlug) {
        router.push(`/tools/${savedSlug}/edit`);
      }
    } catch (err: any) {
      addToast(err.message || 'Error saving tool', 'error');
      setSavedStatus('idle');
    } finally {
      setSaving(false);
    }
  }, [
    title,
    slug,
    html,
    description,
    visibility,
    password,
    iconMode,
    iconColor,
    iconImage,
    existingIconDataUrl,
    initialData,
    router,
    addToast,
  ]);

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

  const handleClearHtml = () => {
    if (!confirm('Clear all HTML in the editor?')) return;
    setHtml('');
  };

  // ── Icon Thumbnail (shared between desktop & mobile) ──────────────────────
  const IconThumb = () => (
    <div className="w-8 h-8 rounded-lg overflow-hidden border border-tools-border flex items-center justify-center bg-tools-surface font-bold text-white shadow-sm">
      {iconMode === 'color' ? (
        <div
          className="w-full h-full flex items-center justify-center text-[10px] font-mono tracking-tighter"
          style={{ backgroundColor: iconColor }}
        >
          {title
            ? title
                .split(/[-_\s]+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w.charAt(0).toUpperCase())
                .join('')
            : 'T'}
        </div>
      ) : iconMode === 'image' && (iconImage || existingIconDataUrl) ? (
        <img
          src={
            iconImage
              ? URL.createObjectURL(new Blob([iconImage.data], { type: iconImage.type }))
              : existingIconDataUrl!
          }
          alt="icon"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[10px] bg-gradient-to-br from-blue-500 to-indigo-600 font-mono tracking-tighter">
          {title
            ? title
                .split(/[-_\s]+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w.charAt(0).toUpperCase())
                .join('')
            : 'T'}
        </div>
      )}
    </div>
  );

  // ── Icon config panel (shared) ─────────────────────────────────────────────
  const IconConfig = () => (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold text-tools-muted uppercase tracking-wider">
        Store Icon
      </div>
      <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white/5 transition-colors">
        <input
          type="radio"
          checked={iconMode === 'auto'}
          onChange={() => setIconMode('auto')}
          className="accent-tools-accent"
        />
        <span className="text-sm font-medium">Auto Gradient</span>
      </label>
      <label className="flex flex-col gap-2 cursor-pointer p-2 rounded hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-2">
          <input
            type="radio"
            checked={iconMode === 'color'}
            onChange={() => setIconMode('color')}
            className="accent-tools-accent"
          />
          <span className="text-sm font-medium">Solid Background</span>
          {iconMode === 'color' && (
            <input
              type="color"
              value={iconColor}
              onChange={(e) => setIconColor(e.target.value)}
              className="ml-auto w-6 h-6 p-0 border-0 rounded cursor-pointer"
            />
          )}
        </div>
      </label>
      <div className="flex flex-col gap-2 p-2 rounded hover:bg-white/5 transition-colors">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={iconMode === 'image'}
            onChange={() => setIconMode('image')}
            className="accent-tools-accent"
          />
          <span className="text-sm font-medium">Custom Image</span>
        </label>
        {iconMode === 'image' && (
          <div className="mt-1 pl-6">
            {existingIconDataUrl && !iconImage && (
              <div className="mb-2 flex items-center gap-2">
                <img
                  src={existingIconDataUrl}
                  alt="current"
                  className="w-8 h-8 rounded object-cover border border-tools-border"
                />
                <span className="text-xs text-tools-muted">Current — upload to replace</span>
              </div>
            )}
            <ImageUpload
              singleImage
              label="Upload PNG, JPEG..."
              onImagesChange={(images) => {
                setIconImage(images.length > 0 ? images[0] : null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT
  // ════════════════════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col overflow-hidden text-tools-fg bg-[#0d0d0d]">
        {/* ── Mobile Top Nav ─────────────────────────────────────────── */}
        <div className="flex-none h-12 bg-tools-surface border-b border-tools-border flex items-center justify-between px-4 z-20">
          <a
            href="/tools"
            className="flex items-center gap-1.5 text-tools-muted hover:text-tools-fg transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="text-xs font-mono">tools</span>
          </a>
          <span className="text-xs font-mono text-tools-muted">{initialData ? 'edit' : 'new'}</span>
          {/* Settings toggle */}
          <button
            onClick={() => setShowMobileSettings((v) => !v)}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
              showMobileSettings
                ? 'border-tools-accent text-tools-accent bg-tools-accent/10'
                : 'border-tools-border text-tools-muted hover:text-tools-fg'
            }`}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07" />
            </svg>
            {showMobileSettings ? 'Done' : 'Settings'}
          </button>
        </div>

        {/* ── Mobile Settings Drawer (slides in below nav) ────────────── */}
        {showMobileSettings && (
          <div className="flex-none bg-[#111] border-b border-tools-border z-10 overflow-y-auto max-h-[65vh]">
            <div className="p-4 flex flex-col gap-5">
              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-tools-muted uppercase tracking-widest">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="My Awesome Tool"
                  className="w-full bg-tools-bg border border-tools-border rounded-lg px-3 py-2.5 text-base font-bold focus:outline-none focus:border-tools-accent focus:ring-1 focus:ring-tools-accent placeholder-tools-muted/40"
                />
              </div>

              {/* Slug */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-tools-muted uppercase tracking-widest">
                  Slug *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="my-awesome-tool"
                  className="w-full bg-tools-bg border border-tools-border rounded-lg px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-tools-accent focus:ring-1 focus:ring-tools-accent placeholder-tools-muted/40"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-tools-muted uppercase tracking-widest">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this tool do?"
                  className="w-full bg-tools-bg border border-tools-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-tools-accent focus:ring-1 focus:ring-tools-accent placeholder-tools-muted/40"
                />
              </div>

              {/* Visibility */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-tools-muted uppercase tracking-widest">
                  Visibility
                </label>
                <div className="flex gap-2">
                  {(['public', 'private', 'password'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setVisibility(v)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors capitalize ${
                        visibility === v
                          ? 'bg-tools-accent border-tools-accent text-white'
                          : 'border-tools-border text-tools-muted hover:text-tools-fg'
                      }`}
                    >
                      {v === 'private' ? 'Only me' : v}
                    </button>
                  ))}
                </div>
                {visibility === 'password' && (
                  <input
                    type="text"
                    placeholder="Set password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full bg-tools-bg border border-tools-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-tools-accent transition-colors placeholder-tools-muted/40"
                  />
                )}
              </div>

              {/* Icon */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <IconThumb />
                  <span className="text-[11px] font-semibold text-tools-muted uppercase tracking-widest">
                    Icon
                  </span>
                </div>
                <IconConfig />
              </div>
            </div>
          </div>
        )}

        {/* ── Mobile HTML Badge ───────────────────────────────────────── */}
        <div className="flex-none px-4 py-2 bg-tools-surface border-b border-tools-border text-xs text-tools-muted flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 flex-none" />
          <span className="truncate font-mono">
            {title ? `${title} · ` : ''}
            {slug || 'new-tool'}
          </span>
          <span className="ml-auto text-[10px] opacity-50">HTML</span>
        </div>

        {/* ── Mobile Textarea ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="Paste your full HTML here..."
            className="flex-1 w-full resize-none bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 focus:outline-none placeholder-[#555] leading-relaxed"
            style={{ paddingBottom: '80px' }} // make room for dock
          />
          {showPreview && (
            <div className="border-t border-tools-border flex-none" style={{ height: '40vh' }}>
              <iframe
                title="preview"
                srcDoc={html}
                sandbox="allow-scripts allow-same-origin allow-forms"
                className="w-full h-full bg-white"
              />
            </div>
          )}
        </div>

        {/* ── Mobile Bottom Dock ──────────────────────────────────────── */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-tools-surface/95 backdrop-blur-md border-t border-tools-border flex items-center gap-2 px-4 py-3 safe-bottom">
          {/* Preview toggle */}
          <button
            onClick={() => setShowPreview((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
              showPreview
                ? 'border-tools-accent bg-tools-accent/10 text-tools-accent'
                : 'border-tools-border text-tools-muted hover:text-tools-fg'
            }`}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </button>

          {/* Clear HTML */}
          <button
            onClick={handleClearHtml}
            aria-label="Clear HTML content"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border border-orange-900/50 text-orange-400 hover:bg-orange-900/20 transition-colors"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
            </svg>
          </button>

          {/* Delete */}
          {initialData && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border border-red-900/50 text-red-400 hover:bg-red-900/20 transition-colors"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          )}

          {/* Save — takes remaining space */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-tools-accent text-white rounded-xl text-sm font-semibold hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {savedStatus === 'saving' && (
              <>
                <svg
                  className="animate-spin"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Saving…
              </>
            )}
            {savedStatus === 'saved' && '✓ Saved'}
            {savedStatus === 'idle' && 'Save Tool'}
          </button>
        </div>

        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DESKTOP LAYOUT (unchanged)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="h-screen flex flex-col overflow-hidden text-tools-fg">
      {/* Top Bar */}
      <div className="flex-none h-16 border-b border-tools-border bg-tools-surface flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-tools-muted font-mono text-xs tracking-wider">
            <a href="/tools" className="hover:text-tools-fg transition-colors">
              tools
            </a>{' '}
            / {initialData ? 'edit' : 'new'}
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
          {/* Icon picker */}
          <div className="flex items-center gap-2 mr-4 group relative">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-tools-border flex items-center justify-center bg-tools-surface font-bold text-white shadow-sm hover:border-tools-accent transition-colors cursor-pointer">
              <IconThumb />
            </div>
            <div className="absolute top-full left-0 pt-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none group-hover:pointer-events-auto">
              <div className="p-3 bg-tools-surface border border-tools-border shadow-2xl rounded-xl w-[320px]">
                <IconConfig />
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
          <button
            onClick={handleClearHtml}
            aria-label="Clear HTML content"
            className="px-3 py-1.5 text-sm font-medium border border-orange-900/50 text-orange-400 rounded hover:bg-orange-900/20 transition-colors"
          >
            Clear
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
            <input
              type="radio"
              value="public"
              checked={visibility === 'public'}
              onChange={() => setVisibility('public')}
              className="accent-tools-accent"
            />
            Public
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-tools-fg transition-colors">
            <input
              type="radio"
              value="private"
              checked={visibility === 'private'}
              onChange={() => setVisibility('private')}
              className="accent-tools-accent"
            />
            Only me
          </label>
          <div className="flex items-center gap-1.5">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-tools-fg transition-colors">
              <input
                type="radio"
                value="password"
                checked={visibility === 'password'}
                onChange={() => setVisibility('password')}
                className="accent-tools-accent"
              />
              Password
            </label>
            {visibility === 'password' && (
              <input
                type="text"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          <div
            className="flex-1 min-h-0 border-l border-tools-border bg-tools-bg relative"
            style={{ maxWidth: '40%' }}
          >
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
