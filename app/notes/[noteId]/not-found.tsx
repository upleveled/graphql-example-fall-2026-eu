import Link from 'next/link';

export default function NoteNotFound() {
  return (
    <div>
      <h1>Note not found</h1>
      <p>The note you requested does not exist.</p>
      <Link href="/notes">Back to notes</Link>
    </div>
  );
}
