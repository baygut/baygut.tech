import { ToolEditor } from '../components/editor';
import { checkAuth } from '../actions';
import { redirect } from 'next/navigation';

export default async function NewToolPage() {
  const isAuthed = await checkAuth();

  if (!isAuthed) {
    redirect('/login');
  }

  return <ToolEditor />;
}
