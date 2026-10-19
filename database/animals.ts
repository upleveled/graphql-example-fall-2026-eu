// Simulate a real database, which cannot be imported from Client
// Components
import 'server-only';
import { cache } from 'react';
import type { Animal } from '../migrations/00000-createTableAnimals';
import { sql } from './connect';

// const animals = [ { id: 1, firstName: 'Mochi', type: 'red
//   panda', accessory: 'tiny yellow raincoat', birthDate: new
//     Date('2021-04-17'), }, { id: 2, firstName: 'Biscuit',
//     type: 'capybara', accessory: 'striped bow tie', birthDate:
//     new Date('2020-11-03'), }, { id: 3, firstName: 'Pickle',
//     type: 'otter', accessory: 'round sunglasses', birthDate:
//     new Date('2022-07-28'), }, { id: 4, firstName: 'Noodle',
//   type: 'alpaca', accessory: 'sparkly wizard hat', birthDate:
//   new Date('2019-02-14'), }, { id: 5, firstName: 'Waffles',
//     type: 'hedgehog', accessory: 'miniature backpack',
//     birthDate: new Date('2023-09-09'), }, ];

// export function getAnimals() { return animals; }

// export function getAnimal(id) { const animal =
//   animals.find((currentAnimal) => { return currentAnimal.id
//     === id; }); return animal; }

export const getAnimalsInsecure = cache(async () => {
  const animals = await sql<Animal[]>`
    SELECT
      *
    FROM
      animals
    ORDER BY
      id
  `;
  return animals;
});

export const getAnimalInsecure = cache(async (id: number) => {
  const [animal] = await sql<Animal[]>`
    SELECT
      *
    FROM
      animals
    WHERE
      id = ${id}
  `;
  return animal;
});

export const createAnimalInsecure = cache(
  async (newAnimal: Omit<Animal, 'id'>) => {
    const [animal] = await sql<Animal[]>`
      INSERT INTO
        animals (
          first_name,
          type,
          accessory,
          birth_date
        )
      VALUES
        (
          ${newAnimal.firstName},
          ${newAnimal.type},
          ${newAnimal.accessory},
          ${newAnimal.birthDate}
        )
      RETURNING
        animals.*
    `;
    return animal;
  },
);

export const updateAnimalInsecure = cache(async (updatedAnimal: Animal) => {
  const [animal] = await sql<Animal[]>`
    UPDATE animals
    SET
      first_name = ${updatedAnimal.firstName},
      type = ${updatedAnimal.type},
      accessory = ${updatedAnimal.accessory},
      birth_date = ${updatedAnimal.birthDate}
    WHERE
      id = ${updatedAnimal.id}
    RETURNING
      animals.*
  `;
  return animal;
});

export const deleteAnimalInsecure = cache(
  async (animalToDelete: Pick<Animal, 'id'>) => {
    const [animal] = await sql<Animal[]>`
      DELETE FROM animals
      WHERE
        id = ${animalToDelete.id}
      RETURNING
        animals.*
    `;
    return animal;
  },
);
