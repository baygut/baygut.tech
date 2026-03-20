import { NextResponse } from 'next/server';
import { getToolBySlugRaw } from '@/app/tools/actions';

function stringToColors(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = Math.abs((hash * 2) % 360);
  return { hue1, hue2 };
}

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const tool = await getToolBySlugRaw(slug);

  if (!tool) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // If a binary image is explicitly set in BYTEA format
  if (tool.iconImage && tool.iconImageType) {
    return new NextResponse(tool.iconImage as any, {
      headers: {
        'Content-Type': tool.iconImageType,
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  }

  const { hue1, hue2 } = stringToColors(tool.slug || tool.title);

  const words = (tool.title || 'T').split(/[-_\s]+/).filter(Boolean);
  const initial = words
    .slice(0, 2)
    .map((w: string) => w.charAt(0).toUpperCase())
    .join('');
  const fontSize = initial.length > 1 ? 380 : 450;

  // If color is specifically selected, override background, else use gradient hashing
  const bgNode = tool.iconColor
    ? `<rect width="1024" height="1024" rx="220" fill="${tool.iconColor}" />`
    : `<rect width="1024" height="1024" rx="220" fill="url(#grad)" />`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(${hue1}, 80%, 60%)" />
      <stop offset="100%" stop-color="hsl(${hue2}, 80%, 40%)" />
    </linearGradient>
    <linearGradient id="glare" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(255, 255, 255, 0.3)" />
      <stop offset="50%" stop-color="rgba(255, 255, 255, 0)" />
    </linearGradient>
  </defs>
  ${bgNode}
  <rect width="1024" height="512" rx="220" fill="url(#glare)" />
  <text x="512" y="512" font-family="'Geist Mono', 'JetBrains Mono', 'SF Mono', ui-monospace, Courier, monospace" font-weight="900" font-size="${fontSize}" fill="#ffffff" text-anchor="middle" dominant-baseline="central" alignment-baseline="central" style="text-shadow: 0px 10px 40px rgba(0,0,0,0.3)">${initial}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
}
