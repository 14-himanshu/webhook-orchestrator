'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';

export default function AutoRefresh({ interval = 3000 }: { interval?: number }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const minterval = setInterval(() => {
      startTransition(() => {
        router.refresh();
      });
    }, interval);

    return () => clearInterval(minterval);
  }, [router, interval]);

  return null;
}
