'use client';

import { gql } from '@apollo/client';
import { useMutation, useSuspenseQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { useState } from 'react';
import ErrorMessage from '../../ErrorMessage';
import styles from './AnimalsForm.module.scss';
import type { Animal } from '@/graphql/graphqlGeneratedTypes';

const animals = gql`
  query Animals {
    animals {
      id
      firstName
      type
      accessory
      birthDate
    }
  }
`;

const createAnimalMutation = gql`
  mutation CreateAnimal(
    $firstName: String!
    $type: String!
    $accessory: String
    $birthDate: String!
  ) {
    createAnimal(
      firstName: $firstName
      type: $type
      accessory: $accessory
      birthDate: $birthDate
    ) {
      id
      firstName
      type
      accessory
      birthDate
    }
  }
`;

const updateAnimalMutation = gql`
  mutation UpdateAnimal(
    $id: ID!
    $firstName: String!
    $type: String!
    $accessory: String
    $birthDate: String!
  ) {
    updateAnimal(
      id: $id
      firstName: $firstName
      type: $type
      accessory: $accessory
      birthDate: $birthDate
    ) {
      id
      firstName
      type
      accessory
      birthDate
    }
  }
`;

const deleteAnimalMutation = gql`
  mutation DeleteAnimal($id: ID!) {
    deleteAnimal(id: $id) {
      id
    }
  }
`;

export default function AnimalsForm() {
  const [errorMessage, setErrorMessage] = useState('');
  const [firstName, setFirstName] = useState('');
  const [type, setType] = useState('');
  const [accessory, setAccessory] = useState('');
  const [birthDate, setBirthDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [id, setId] = useState('');

  const { data } = useSuspenseQuery<{ animals: Animal[] }>(animals);

  function resetFormStates() {
    setId('');
    setFirstName('');
    setType('');
    setAccessory('');
    setBirthDate(dayjs().format('YYYY-MM-DD'));
  }

  const [createAnimal] = useMutation(createAnimalMutation, {
    variables: {
      firstName,
      type,
      accessory,
      birthDate,
    },

    onError: (apolloError) => {
      setErrorMessage(apolloError.message);
    },

    onCompleted: () => {
      resetFormStates();
      setErrorMessage('');
    },

    refetchQueries: ['Animals'],
  });

  const [updateAnimal] = useMutation(updateAnimalMutation, {
    variables: {
      id,
      firstName,
      type,
      accessory,
      birthDate,
    },

    onError: (apolloError) => {
      setErrorMessage(apolloError.message);
    },

    onCompleted: () => {
      resetFormStates();
      setErrorMessage('');
    },

    refetchQueries: ['Animals'],
  });

  const [deleteAnimal] = useMutation(deleteAnimalMutation, {
    onError: (apolloError) => {
      setErrorMessage(apolloError.message);
    },

    onCompleted: () => {
      setErrorMessage('');
    },

    refetchQueries: ['Animals'],
  });

  return (
    <>
      <h1>Animal Dashboard</h1>

      <div className={styles.dashboard}>
        <div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Accessory</th>
                <th>Birth Date</th>
              </tr>
            </thead>
            <tbody>
              {data.animals.map((animal) => (
                <tr
                  key={animal.id}
                  className={id === animal.id ? styles.selectedItem : ''}
                >
                  <td>{animal.firstName}</td>
                  <td>{animal.type}</td>
                  <td>{animal.accessory}</td>
                  <td>{dayjs(animal.birthDate).format('YYYY-MM-DD')}</td>
                  <td className={styles.buttonCell}>
                    <button
                      disabled={id === animal.id}
                      onClick={() => {
                        setId(animal.id);
                        setFirstName(animal.firstName);
                        setType(animal.type);
                        setAccessory(animal.accessory || '');
                        setBirthDate(
                          dayjs(animal.birthDate).format('YYYY-MM-DD'),
                        );
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        await deleteAnimal({
                          variables: {
                            id: animal.id,
                          },
                        });
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.animalsForm}>
          <h2>{id ? 'Edit Animal' : 'Add Animal'}</h2>

          <form
            onSubmit={async (event) => {
              event.preventDefault();
              if (id) {
                await updateAnimal();
              } else {
                await createAnimal();
              }
            }}
          >
            <label>
              First Name
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.currentTarget.value)}
              />
            </label>

            <label>
              Type
              <input
                value={type}
                onChange={(event) => setType(event.currentTarget.value)}
              />
            </label>

            <label>
              Accessory
              <input
                value={accessory}
                onChange={(event) => setAccessory(event.currentTarget.value)}
              />
            </label>

            <label>
              Birth Date
              <input
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.currentTarget.value)}
              />
            </label>

            <button>{id ? 'Save Changes' : 'Add Animal'}</button>
          </form>
          <ErrorMessage>{errorMessage}</ErrorMessage>
        </div>
      </div>
    </>
  );
}
