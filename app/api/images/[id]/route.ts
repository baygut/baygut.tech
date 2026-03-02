import { getImage } from '@/lib/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const image = await getImage(id);

  if (!image?.url) {
    return new NextResponse('Image not found', { status: 404 });
  }

  return NextResponse.redirect(image.url, { status: 301 });
}
