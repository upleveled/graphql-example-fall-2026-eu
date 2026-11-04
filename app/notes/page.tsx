import { redirect } from 'next/navigation';
import { getNotes } from '../../database/notes.ts';
import { getUser } from '../../database/users.ts';
import { getCookie } from '../../util/cookies.ts';
import NotesForm from './NotesForm.tsx';

export const metadata = {
  title: 'Notes',
  description: 'Private notes for the logged in user',
};

export default async function NotesPage() {
  const sessionToken = await getCookie('sessionToken');
  const user = sessionToken ? await getUser(sessionToken) : undefined;

  if (!user || !sessionToken) {
    redirect('/login?returnTo=/notes');
  }

  const notes = await getNotes(sessionToken);

  return <NotesForm notes={notes} username={user.username} />;
}
