'use client';

import { useEffect, useState } from 'react';

export default function ClientDate({ date }: { date: Date | string }) {
  const [formatted, setFormatted] = useState<string>('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormatted(new Date(date).toLocaleString());
  }, [date]);

  return <span suppressHydrationWarning>{formatted || '...'}</span>;
}
