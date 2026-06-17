'use client';

import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function NumberTicker({ value }: { value: number }) {
  const spring = useSpring(value, { mass: 1, stiffness: 250, damping: 20 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}
