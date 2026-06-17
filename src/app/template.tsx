'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99, filter: 'blur(1px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ ease: 'easeOut', duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
}
