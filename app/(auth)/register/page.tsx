import { redirect } from 'next/navigation';
import { getValidSession } from '../../../database/sessions.ts';
import { getCookie } from '../../../util/cookies.ts';
import RegisterForm from './RegisterForm.tsx';

export const metadata = {
  title: 'Register',
  description: 'Register for Animals Anonymous',
};

export default async function RegisterPage(props: PageProps<'/register'>) {
  const sessionToken = await getCookie('sessionToken');
  const session = sessionToken
    ? await getValidSession(sessionToken)
    : undefined;

  if (session) {
    redirect('/');
  }

  const searchParams = await props.searchParams;

  return <RegisterForm returnTo={searchParams.returnTo} />;
}
