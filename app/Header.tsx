import Link from 'next/link';
import { getUser } from '../database/users.ts';
import { getCookie } from '../util/cookies.ts';
import LogoutButton from './(auth)/logout/LogoutButton.tsx';
import styles from './Header.module.scss';
import RouterRefreshButton from './RouterRefreshButton.tsx';

export default async function Header() {
  const sessionToken = await getCookie('sessionToken');
  const user = !!sessionToken && (await getUser(sessionToken));

  return (
    <header className={styles.header}>
      <div>Animals Anonymous</div>
      <div>
        <nav className={styles.nav}>
          <Link href="/">Home</Link>
          <Link href="/animals">Animals</Link>
        </nav>
        <div>
          <Link href="/animals/dashboard">Dashboard</Link>
          <Link href="/notes">Notes</Link>
          {user ? (
            <>
              <span>{user.username}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/register">Register</Link>
              <Link href="/login">Login</Link>
            </>
          )}
          {/* eslint-disable-next-line react-hooks/purity */}
          <div>{Math.floor(Math.random() * 100)}</div>
          <RouterRefreshButton />
        </div>
      </div>
    </header>
  );
}
