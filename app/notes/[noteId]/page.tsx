import Link from 'next/link';
import { getValidSession } from '../../../database/sessions.ts';
import { notFound, redirect } from 'next/navigation';
import { getNote, selectNoteExists } from '../../../database/notes.ts';
import { getCookie } from '../../../util/cookies.ts';

export default async function NotePage(props: PageProps<'/notes/[noteId]'>) {
  const params = await props.params;
  const noteId = Number(params.noteId);

  if (!Number.isInteger(noteId) || noteId < 1 || noteId > 2147483647) {
    notFound();
  }

  const sessionToken = await getCookie('sessionToken');

  if (!sessionToken || !(await getValidSession(sessionToken))) {
    redirect(`/login?returnTo=/notes/${noteId}`);
  }

  const note = await getNote(sessionToken, noteId);

  if (!note && !(await selectNoteExists(sessionToken, noteId))) {
    notFound();
  }

  // Security: This can be an antipattern for security, because of "information
  // exposure": it tells the user that a note with this id exists. Instead,
  // consider showing only the 404 Not Found page in both cases
  // (replace access denied message with notFound(), remove selectNoteExists()).
  if (!note) {
    return (
      <div>
        <h1>Access denied</h1>
        <p>You do not have permission to access this note.</p>
        <Link href="/notes">Back to notes</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>{note.title}</h1>
      <p>{note.textContent}</p>
      <Link href="/notes">Back to notes</Link>
    </div>
  );
}
