'use server';

import { cookies } from 'next/headers';
import { deleteSession } from '../../../database/sessions.ts';
import { getCookie } from '../../../util/cookies.ts';

export async function logout() {
  const sessionToken = await getCookie('sessionToken');

  if (sessionToken) {
    await deleteSession(sessionToken);
  }

  (await cookies()).delete('sessionToken');
}
