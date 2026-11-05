import { redirect } from 'next/navigation';
import { getValidSession } from '../../../database/sessions.ts';
import { getCookie } from '../../../util/cookies.ts';
import AnimalsForm from './AnimalsForm.tsx';

export default async function AnimalDashboardPage() {
  const sessionToken = await getCookie('sessionToken');
  if (!sessionToken || !(await getValidSession(sessionToken))) {
    redirect('/login?returnTo=/animals/dashboard');
  }

  return <AnimalsForm />;
}
