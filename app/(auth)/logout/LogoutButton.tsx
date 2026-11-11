import { logout } from './actions.ts';

export default function LogoutButton() {
  return (
    <form>
      <button formAction={logout}>Log out</button>
    </form>
  );
}
