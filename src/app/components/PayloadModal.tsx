'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Code2, Link, Clock, AlertTriangle } from 'lucide-react';
import ClientDate from './ClientDate';
import { useEffect } from 'react';

interface PayloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any | null;
  type: 'job' | 'dlq';
}

export default function PayloadModal({ isOpen, onClose, data, type }: PayloadModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!data) return null;

  const url = type === 'dlq' ? data.targetUrl : data.data?.url;
  const payload = type === 'dlq' ? data.payload : data.data?.body;
  const jobId = type === 'dlq' ? data.jobId : data.id;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[85vh] bg-[#0A0A0A] border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                Payload Inspection: {jobId}
              </h3>
              <button onClick={onClose} className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Meta Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest font-medium text-zinc-500 flex items-center gap-1.5">
                    <Link className="w-3 h-3" /> Target URL
                  </div>
                  <div className="text-xs font-mono text-zinc-300 break-all bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/50">
                    {url}
                  </div>
                </div>
                {type === 'dlq' && (
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-widest font-medium text-zinc-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Failed At
                    </div>
                    <div className="text-xs font-mono text-zinc-300 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/50">
                      <ClientDate date={data.failedAt} />
                    </div>
                  </div>
                )}
              </div>

              {/* Error Reason (if DLQ) */}
              {type === 'dlq' && data.errorReason && (
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest font-medium text-rose-500 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" /> Error Reason
                  </div>
                  <div className="text-xs font-mono text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                    {data.errorReason}
                  </div>
                </div>
              )}

              {/* JSON Payload */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-widest font-medium text-zinc-500 flex items-center gap-1.5">
                  <Code2 className="w-3 h-3" /> Request Payload
                </div>
                <div className="bg-[#09090b] p-4 rounded-lg border border-zinc-800 overflow-x-auto">
                  <pre className="text-xs font-mono text-zinc-300">
                    {JSON.stringify(payload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
