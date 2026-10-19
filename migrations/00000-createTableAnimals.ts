import type { Sql } from 'postgres';
import z from 'zod';

export type Animal = {
  id: number;
  firstName: string;
  type: string;
  accessory: string | null;
  birthDate: Date;
};

export const animalSchema = z.object({
  animal: z.object({
    // Do not include id, because it cannot be chosen by the user
    firstName: z.string().trim().min(1),
    type: z.string().trim().min(1),
    accessory: z.string().trim().min(1).nullable(),
    birthDate: z.coerce.date(),
  }),
});

export async function up(sql: Sql) {
  await sql`
    CREATE TABLE animals (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      first_name varchar(30) NOT NULL,
      type varchar(30) NOT NULL,
      accessory varchar(45),
      birth_date date NOT NULL
    )
  `;
}

export async function down(sql: Sql) {
  await sql`DROP TABLE animals`;
}
