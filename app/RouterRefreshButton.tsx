'use client';

import { useRouter } from 'next/navigation';

export default function RouterRefreshButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        router.refresh();
      }}
    >
      router.refresh()
    </button>
  );
}
