import Link from 'next/link';
import styles from './Header.module.scss';
import RouterRefreshButton from './RouterRefreshButton';

export default function Header() {
  return (
    <header className={styles.header}>
      <div>Animals Anonymous</div>
      <div>
        <nav className={styles.nav}>
          <Link href="/">Home</Link>
          <Link href="/about-us">About Us</Link>
          <Link href="/animals">Animals</Link>
          <Link href="/fruits">Fruits</Link>
        </nav>
        <div>
          <Link href="/animals/dashboard">Dashboard</Link>
          {/* eslint-disable-next-line react-hooks/purity */}
          <div>{Math.floor(Math.random() * 100)}</div>
          <RouterRefreshButton />
        </div>
      </div>
    </header>
  );
}
