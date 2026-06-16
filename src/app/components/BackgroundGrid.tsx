'use client';

import { motion } from 'framer-motion';

export default function BackgroundGrid() {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#09090b] pointer-events-none">
      {/* Strict Enterprise Grid */}
      <div 
        className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik00MCAwaE0wIDB2NDAiLz48L2c+PC9zdmc+')] [mask-image:linear-gradient(to_bottom,white,transparent_90%)]"
      />
    </div>
  );
}
