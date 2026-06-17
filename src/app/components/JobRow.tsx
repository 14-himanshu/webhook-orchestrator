'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import PayloadModal from './PayloadModal';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function JobRow({ job, index }: { job: any; index: number }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.tr 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ opacity: { duration: 0.15, delay: index * 0.02 } }}
        className="hover:bg-white/[0.02] transition-colors duration-200 ease-in-out group cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <td className="px-6 py-4 font-mono text-[13px] text-zinc-400">
          {job.id}
          <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">
            Attempt {job.attemptsMade}
          </div>
        </td>
        <td className="px-6 py-4 text-zinc-200 font-mono text-[13px] max-w-[16rem] truncate" title={job.data.url}>
          {job.data.url}
        </td>
        <td className="px-6 py-4 text-right">
          <div className="inline-flex items-center justify-end gap-2 text-zinc-300 bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-full text-[10px] font-medium tracking-widest uppercase">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
            Processing
          </div>
        </td>
      </motion.tr>

      <PayloadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={job} 
        type="job" 
      />
    </>
  );
}
