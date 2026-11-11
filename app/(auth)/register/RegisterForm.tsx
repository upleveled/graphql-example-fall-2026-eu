'use client';

import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getSafeReturnToPath } from '../../../util/validation.ts';
import ErrorMessage from '../../ErrorMessage.tsx';

const registerMutation = gql`
  mutation Register($username: String!, $password: String!) {
    register(username: $username, password: $password) {
      id
      username
    }
  }
`;

type Props = {
  returnTo?: string | string[];
};

export default function RegisterForm(props: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const [register, { loading }] = useMutation(registerMutation, {
    errorPolicy: 'all',
    variables: {
      username,
      password,
    },
    onError: (apolloError) => {
      setErrorMessage(apolloError.message);
    },
    onCompleted: () => {
      setErrorMessage('');
      router.push(getSafeReturnToPath(props.returnTo) || '/');
      router.refresh();
    },
  });

  return (
    <div>
      <h1>Register</h1>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          await register();
        }}
      >
        <label>
          Username
          <input
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => {
              setUsername(event.currentTarget.value);
            }}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => {
              setPassword(event.currentTarget.value);
            }}
          />
        </label>
        <button disabled={loading}>Register</button>
      </form>
      <ErrorMessage>{errorMessage}</ErrorMessage>
    </div>
  );
}
