import { redirect } from 'next/navigation';
import { getValidSession } from '../../../database/sessions.ts';
import { getCookie } from '../../../util/cookies.ts';
import LoginForm from './LoginForm.tsx';

export const metadata = {
  title: 'Login',
  description: 'Login for Animals Anonymous',
};

export default async function LoginPage(props: PageProps<'/login'>) {
  const sessionToken = await getCookie('sessionToken');
  const session = sessionToken
    ? await getValidSession(sessionToken)
    : undefined;

  if (session) {
    redirect('/');
  }

  const searchParams = await props.searchParams;

  return <LoginForm returnTo={searchParams.returnTo} />;
}
