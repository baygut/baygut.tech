import { getImage } from '@/lib/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const image = await getImage(id);

  if (!image) {
    return new NextResponse('Image not found', { status: 404 });
  }

  return new NextResponse(image.data, {
    headers: {
      'Content-Type': image.type,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
