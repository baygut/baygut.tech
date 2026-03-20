import { getToolBySlug, checkAuth } from '../../actions';
import { ToolEditor } from '../../components/editor';
import { redirect, notFound } from 'next/navigation';

export default async function EditToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await params;

  const isAuthed = await checkAuth();
  if (!isAuthed) {
    redirect('/login');
  }

  const tool = await getToolBySlug(p.slug);

  if (!tool) {
    notFound();
  }

  return (
    <ToolEditor
      initialData={{
        title: tool.title,
        slug: tool.slug,
        description: tool.description || '',
        html: tool.html,
        visibility: tool.visibility as 'public' | 'private' | 'password',
        password: tool.password || '',
        iconColor: tool.iconColor,
        iconImageDataUrl: tool.iconImageDataUrl,
        iconImageType: tool.iconImageType,
      }}
    />
  );
}
