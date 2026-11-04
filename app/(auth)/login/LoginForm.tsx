'use client';

import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getSafeReturnToPath } from '../../../util/validation.ts';
import ErrorMessage from '../../ErrorMessage.tsx';

const loginMutation = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
      username
    }
  }
`;

type Props = {
  returnTo?: string | string[];
};

export default function LoginForm(props: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const [login, { loading }] = useMutation(loginMutation, {
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
      <h1>Login</h1>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          await login();
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
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.currentTarget.value);
            }}
          />
        </label>
        <button disabled={loading}>Login</button>
      </form>
      <ErrorMessage>{errorMessage}</ErrorMessage>
    </div>
  );
}
