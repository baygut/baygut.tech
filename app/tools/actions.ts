'use server';

import { db } from '@/lib/db';
import { tools } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { isAuthenticated } from '@/lib/auth';

export { isAuthenticated as checkAuth };

export async function saveToolBase(
  slug: string, 
  title: string, 
  html: string, 
  description: string, 
  visibility: 'public' | 'private' | 'password', 
  password?: string, 
  iconColor?: string | null,
  iconImageData?: ArrayBuffer | null,
  iconImageType?: string | null
) {
  const isAuthed = await isAuthenticated();
  
  if (!isAuthed) {
    throw new Error('Unauthorized');
  }

  if (!slug || !title || !html) {
    throw new Error('Missing required fields');
  }

  // URL valid slug
  const validSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  if (!validSlug) throw new Error('Invalid slug');

  // Check if exists
  const existingRecords = await db.select().from(tools).where(eq(tools.slug, validSlug)).limit(1);
  const exists = existingRecords.length > 0;

  const resolvedIconImage = iconImageData ? Buffer.from(iconImageData) : null;

  if (exists) {
    // Update
    await db.update(tools).set({
      title,
      html,
      description,
      visibility,
      password,
      iconColor: iconColor || null,
      iconImage: resolvedIconImage as any,
      iconImageType: iconImageType || null,
      updatedAt: new Date(),
    }).where(eq(tools.slug, validSlug));
  } else {
    // Insert
    await db.insert(tools).values({
      title,
      slug: validSlug,
      html,
      description,
      visibility,
      password,
      iconColor: iconColor || null,
      iconImage: resolvedIconImage as any,
      iconImageType: iconImageType || null,
    });
  }

  revalidatePath('/tools');
  revalidatePath(`/tools/${validSlug}`);
  return validSlug;
}

export async function deleteToolAction(slug: string) {
  const isAuthed = await isAuthenticated();
  
  if (!isAuthed) {
    throw new Error('Unauthorized');
  }

  await db.delete(tools).where(eq(tools.slug, slug));
  revalidatePath('/tools');
}

export async function unlockTool(slug: string, passwordAttempt: string) {
  const tool = await getToolBySlug(slug);
  if (!tool) return false;
  
  if (tool.password === passwordAttempt) {
    const cookieStore = await cookies();
    cookieStore.set(`tool_pwd_${slug}`, passwordAttempt, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
    return true;
  }
  return false;
}

export async function getTools() {
  return await db.select().from(tools).orderBy(desc(tools.createdAt));
}

export async function getPublicTools() {
  return await db.select().from(tools).where(eq(tools.visibility, 'public')).orderBy(desc(tools.createdAt));
}

export async function getToolBySlug(slug: string) {
  const items = await db.select().from(tools).where(eq(tools.slug, slug)).limit(1);
  return items[0] || null;
}
