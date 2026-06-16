'use client';

import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring, motion } from 'framer-motion';

export default function AnimatedCounter({
  value,
  direction = 'up',
}: {
  value: number;
  direction?: 'up' | 'down';
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === 'down' ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 25,
    stiffness: 200,
  });
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat('en-US').format(
          Math.floor(latest)
        );
      }
    });
  }, [springValue]);

  return <span ref={ref} className="tabular-nums" />;
}
