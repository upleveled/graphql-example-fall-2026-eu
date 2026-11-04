'use client';

import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Note } from '../../migrations/00004-createTableNotes.ts';
import ErrorMessage from '../ErrorMessage.tsx';
import styles from './NotesForm.module.scss';

const createNoteMutation = gql`
  mutation CreateNote($title: String!, $textContent: String!) {
    createNote(title: $title, textContent: $textContent) {
      id
      title
      textContent
    }
  }
`;

type Props = {
  notes: Note[];
  username: string;
};

export default function NotesForm(props: Props) {
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const [createNote, { loading }] = useMutation(createNoteMutation, {
    errorPolicy: 'all',
    variables: {
      title,
      textContent,
    },
    onError: (apolloError) => {
      setErrorMessage(apolloError.message);
    },
    onCompleted: () => {
      setTitle('');
      setTextContent('');
      setErrorMessage('');
      router.refresh();
    },
  });

  return (
    <>
      <h1>Notes for {props.username}</h1>
      <div className={styles.notes}>
        <div>
          {props.notes.length === 0 ? (
            <p>No notes yet</p>
          ) : (
            <ul>
              {props.notes.map((note) => (
                <li key={`note-${note.id}`}>
                  <Link href={`/notes/${note.id}`}>{note.title}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.noteForm}>
          <h2>Create Note</h2>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              await createNote();
            }}
          >
            <label>
              Title
              <input
                value={title}
                onChange={(event) => {
                  setTitle(event.currentTarget.value);
                }}
              />
            </label>
            <label>
              Note
              <textarea
                value={textContent}
                onChange={(event) => {
                  setTextContent(event.currentTarget.value);
                }}
              />
            </label>
            <button disabled={loading}>Add Note</button>
          </form>
          <ErrorMessage>{errorMessage}</ErrorMessage>
        </div>
      </div>
    </>
  );
}
