import Link from 'next/link';
import { getAnimalsInsecure } from '../../database/animals';

export const metadata = {
  title: 'Animals',
  description: 'A list of animals for every occasion',
};

export default async function AnimalsPage() {
  const animals = await getAnimalsInsecure();

  return (
    <div>
      <h1>Animals</h1>
      <ul>
        {animals.map((animal) => {
          return (
            <li key={animal.id}>
              <Link href={`/animals/${animal.id}`}>
                <img
                  src={`/animals/${animal.id}.avif`}
                  alt={`${animal.firstName} the ${animal.type} wearing a ${animal.accessory}`}
                />
                <span>{animal.firstName}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
