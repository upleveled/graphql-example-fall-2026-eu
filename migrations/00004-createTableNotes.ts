import type { Sql } from 'postgres';
import { z } from 'zod';
import type { User } from './00002-createTableUsers.ts';

export const noteSchema = z.object({
  note: z.object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(100, 'Title must be at most 100 characters'),
    textContent: z
      .string()
      .trim()
      .min(1, 'Text content must be minimum 1 character'),
  }),
});

export type Note = {
  id: number;
  userId: User['id'];
  title: string;
  textContent: string;
};

export async function up(sql: Sql) {
  await sql`
    CREATE TABLE notes (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      title varchar(100) NOT NULL UNIQUE,
      text_content text NOT NULL,
      user_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE
    )
  `;
}

export async function down(sql: Sql) {
  await sql`DROP TABLE notes`;
}
