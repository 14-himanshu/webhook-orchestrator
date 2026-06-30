"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Activity,
  Box,
  Database,
  Server,
  Zap,
  RefreshCw,
  ArchiveX,
  Shield,
  Timer,
  TestTube,
  Terminal,
  Code,
  SquareMinus,
  CheckCircle2,
  ChevronRight,
  Webhook
} from "lucide-react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#030303] font-sans selection:bg-indigo-500/30 text-zinc-300 overflow-hidden">
      {/* Background Grid & Noise */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* 1. Navigation Bar */}
      <nav className="fixed top-0 inset-x-0 h-16 backdrop-blur-xl bg-[#030303]/60 border-b border-white/[0.05] z-50 flex items-center justify-between px-6 md:px-10">
        <Link href="/" className="font-medium text-sm tracking-tight text-white flex items-center gap-2 group hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Webhook className="w-4 h-4 text-indigo-400" />
          </div>
          Webhook Orchestrator
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Show when="signed-in">
            <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/history" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              History
            </Link>
            <Link href="/settings" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Settings
            </Link>
          </Show>
          <Show when="signed-out">
            <a href="#architecture" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Architecture
            </a>
            <a href="#reliability" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Reliability
            </a>
            <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Features
            </a>
          </Show>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/14-himanshu/webhook-orchestrator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors hidden sm:block"
            aria-label="GitHub"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.15-.38 6.5-1.4 6.5-7.17a5.1 5.1 0 0 0-1.5-3.8 4.7 4.7 0 0 0-.1-3.8s-1.1-.3-3.5 1.3a11.5 11.5 0 0 0-6 0C6.9 2.1 5.8 2.4 5.8 2.4a4.7 4.7 0 0 0-.1 3.8 5.1 5.1 0 0 0-1.5 3.8c0 5.76 3.34 6.78 6.5 7.17a4.8 4.8 0 0 0-1 3.03V22"></path><path d="M9 20c-5 1.5-5-2.5-7-3"></path></svg>
          </a>
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="group relative inline-flex items-center justify-center gap-2 bg-white text-zinc-950 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-all duration-300"
            >
              Sign In
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center justify-center gap-2 bg-white text-zinc-950 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-all duration-300"
            >
              Go to Console
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Show>
        </div>
      </nav>

      <main className="relative z-10">
        {/* 2. Hero Section */}
        <section className="pt-48 pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-medium text-zinc-300 tracking-wide">v0.1.0 is now live</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 max-w-4xl leading-[1.1]"
          >
            Enterprise-Grade Webhook Reliability.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl font-light leading-relaxed"
          >
            Guarantee zero data loss with decoupled ingestion, Redis-backed queues, and exponential backoff. Stop letting serverless timeouts break your integrations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex gap-4 flex-col sm:flex-row z-10"
          >
            <button className="bg-white text-zinc-950 px-6 py-3 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] group">
              Deploy Architecture <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button className="bg-white/[0.03] border border-white/[0.08] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-white/[0.08] transition-colors">
              Read the Documentation
            </button>
          </motion.div>

          {/* Visual: Premium Terminal Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-24 w-full max-w-4xl relative z-10 perspective-1000"
          >
            <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500/20 to-transparent rounded-2xl blur-xl opacity-50 pointer-events-none" />
            <div className="relative rounded-2xl border border-white/[0.1] bg-[#0A0A0A]/80 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col text-left font-mono text-[13px] leading-relaxed w-full">
              {/* Window Header */}
              <div className="flex items-center px-4 py-3 border-b border-white/[0.05] bg-white/[0.01]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80 border border-green-500/50" />
                </div>
                <div className="mx-auto text-xs font-sans text-zinc-500 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5" /> ingest-worker.sh
                </div>
              </div>
              
              {/* Terminal Body */}
              <div className="p-6 text-zinc-300">
                <div className="flex gap-3">
                  <span className="text-zinc-600 select-none">1</span>
                  <div><span className="text-indigo-400">~/infrastructure</span> <span className="text-zinc-500">$</span> <span className="text-emerald-400">curl</span> <span className="text-zinc-400">-X POST https://api.webhookorchestrator.com/v1/ingest</span></div>
                </div>
                <div className="flex gap-3 mt-1">
                  <span className="text-zinc-600 select-none">2</span>
                  <div className="text-zinc-500">{"{"}</div>
                </div>
                <div className="flex gap-3">
                  <span className="text-zinc-600 select-none">3</span>
                  <div className="ml-4"><span className="text-sky-300">"event"</span><span className="text-zinc-500">:</span> <span className="text-amber-300">"user.created"</span>,</div>
                </div>
                <div className="flex gap-3">
                  <span className="text-zinc-600 select-none">4</span>
                  <div className="ml-4"><span className="text-sky-300">"data"</span><span className="text-zinc-500">:</span> {"{"} <span className="text-sky-300">"id"</span>: <span className="text-amber-300">"usr_123"</span> {"}"}</div>
                </div>
                <div className="flex gap-3">
                  <span className="text-zinc-600 select-none">5</span>
                  <div className="text-zinc-500">{"}"}</div>
                </div>
                <div className="flex gap-3 mt-4 opacity-70">
                  <span className="text-zinc-600 select-none">6</span>
                  <div className="text-zinc-400">{"<"} HTTP/1.1 202 Accepted</div>
                </div>
                <div className="flex gap-3 opacity-70">
                  <span className="text-zinc-600 select-none">7</span>
                  <div className="text-zinc-400">{"<"} X-Webhook-Id: evt_894jks</div>
                </div>
                <div className="flex gap-3 mt-4">
                  <span className="text-zinc-600 select-none">8</span>
                  <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-3 rounded-md w-fit">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    <span>Offloading payload to Redis memory queue...</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 3. The Tech Stack Bar */}
        <section className="border-y border-white/[0.05] bg-white/[0.01] py-12 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest shrink-0">
              Powered by open standards
            </p>
            <div className="flex flex-wrap justify-center gap-10 md:gap-16 items-center opacity-60 hover:opacity-100 transition-opacity duration-500">
              <div className="flex items-center gap-2 text-lg font-medium text-zinc-200 tracking-tight">
                <Box className="w-5 h-5 text-zinc-400" strokeWidth={1.5} /> Next.js
              </div>
              <div className="flex items-center gap-2 text-lg font-medium text-zinc-200 tracking-tight">
                <Database className="w-5 h-5 text-zinc-400" strokeWidth={1.5} /> Redis
              </div>
              <div className="flex items-center gap-2 text-lg font-medium text-zinc-200 tracking-tight">
                <Server className="w-5 h-5 text-zinc-400" strokeWidth={1.5} /> Node.js
              </div>
              <div className="flex items-center gap-2 text-lg font-medium text-zinc-200 tracking-tight">
                <Database className="w-5 h-5 text-zinc-400" strokeWidth={1.5} /> PostgreSQL
              </div>
            </div>
          </div>
        </section>

        {/* 4. Zig-Zag Architecture Tour */}
        <section id="architecture" className="py-40 px-6 max-w-7xl mx-auto space-y-40">
          
          {/* Row 1 */}
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="order-2 lg:order-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="h-80 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center font-mono text-zinc-500 relative overflow-hidden backdrop-blur-xl">
                <div className="flex flex-col items-center gap-8 z-10 w-full px-12">
                  <div className="flex items-center gap-6 w-full justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-white/[0.05] border border-white/10 rounded-2xl flex items-center justify-center shadow-lg">
                        <Box className="w-6 h-6 text-zinc-300" strokeWidth={1.5} />
                      </div>
                      <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-sans">Ingestion API</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-24">
                      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent relative">
                        <div className="absolute w-2 h-2 bg-indigo-500 rounded-full top-1/2 -translate-y-1/2 left-0 animate-[slide_1.5s_infinite]" />
                      </div>
                      <span className="text-[10px] text-indigo-400/70 font-sans font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full">O(1) Offload</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.15)] relative">
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                        <Database className="w-6 h-6 text-indigo-300" strokeWidth={1.5} />
                      </div>
                      <span className="text-[11px] uppercase tracking-wider text-indigo-400 font-sans">Redis Queue</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-8">
                <Zap className="w-5 h-5 text-zinc-300" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl lg:text-4xl font-medium text-white mb-6 tracking-tight leading-tight">
                High-Speed Ingestion & Decoupling.
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed font-light">
                Our edge API instantly validates HMAC signatures and offloads heavy payloads directly to Redis. By decoupling ingestion from processing, we guarantee sub-50ms responses, entirely eliminating serverless timeouts.
              </p>
              <ul className="mt-8 space-y-3">
                {['Sub-50ms P99 Latency', 'HMAC SHA-256 Validation', 'Zero-blocking architecture'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-zinc-500" strokeWidth={1.5} /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Row 2 */}
          <div id="reliability" className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-8">
                <RefreshCw className="w-5 h-5 text-zinc-300" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl lg:text-4xl font-medium text-white mb-6 tracking-tight leading-tight">
                Fault Tolerance & Exponential Backoff.
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed font-light">
                Downstream services go offline. It happens. Our robust worker automatically catches failures and retries delivery using exponential backoff, ensuring momentary blips don't cause permanent data loss.
              </p>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-zinc-500/10 to-transparent blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="h-80 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center font-mono text-zinc-500 relative overflow-hidden backdrop-blur-xl">
                <div className="flex flex-col gap-3 w-full max-w-sm z-10 px-6">
                  {[
                    { attempt: 'Attempt 1', delay: 'Instant', status: 'HTTP 500', color: 'border-white/10 text-zinc-400 bg-white/[0.02]' },
                    { attempt: 'Attempt 2', delay: 'Backoff 2s', status: 'HTTP 503', color: 'border-white/10 text-zinc-400 bg-white/[0.02]' },
                    { attempt: 'Attempt 3', delay: 'Backoff 4s', status: 'HTTP 200', color: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]' },
                  ].map((row, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.2 }}
                      className={`px-4 py-3 border rounded-xl text-sm flex justify-between items-center transition-all ${row.color}`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium font-sans">{row.attempt}</span>
                        <span className="text-[10px] opacity-70">{row.delay}</span>
                      </div>
                      <span className="font-mono text-xs">{row.status}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="order-2 lg:order-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 to-transparent blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="h-80 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col font-mono relative overflow-hidden backdrop-blur-xl">
                <div className="border-b border-white/[0.05] bg-white/[0.01] px-6 py-4 text-[10px] text-zinc-500 uppercase tracking-widest flex gap-4 font-sans font-medium">
                  <div className="w-2/5">Event ID</div>
                  <div className="w-2/5">Type</div>
                  <div className="w-1/5 text-right">Attempt</div>
                </div>
                <div className="flex-1 p-6 z-10 flex flex-col gap-1 overflow-hidden font-sans">
                  {[
                    { id: 'evt_89xK2m', type: 'user.deleted', status: 'HTTP 502' },
                    { id: 'evt_91pL4z', type: 'invoice.paid', status: 'HTTP 429' },
                    { id: 'evt_22qR9v', type: 'sub.created', status: 'HTTP 500' },
                  ].map((row, i) => (
                    <div key={i} className={`flex gap-4 text-[13px] py-3 border-b border-white/[0.02] ${i === 2 ? 'opacity-40' : ''}`}>
                      <div className="w-2/5 text-zinc-400 font-mono text-xs truncate">{row.id}</div>
                      <div className="w-2/5 text-zinc-300">{row.type}</div>
                      <div className="w-1/5 text-rose-400/90 font-medium text-right text-xs bg-rose-500/10 px-2 py-0.5 rounded flex items-center justify-center h-fit border border-rose-500/20">{row.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-8">
                <ArchiveX className="w-5 h-5 text-zinc-300" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl lg:text-4xl font-medium text-white mb-6 tracking-tight leading-tight">
                Deep Observability.
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed font-light">
                We log the exact HTTP status codes, error bodies, and latency for every single automated retry attempt. Your customers will never have to guess why their webhooks are failing again.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Bento Box Features Grid */}
        <section id="features" className="py-32 px-6 max-w-7xl mx-auto border-t border-white/[0.05]">
          <div className="mb-20 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-medium text-white mb-4 tracking-tight">
              Built for extreme reliability.
            </h2>
            <p className="text-zinc-400 text-lg font-light">
              Robust security and rate-limiting features out of the box, designed to protect your internal infrastructure.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Item 1 */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 flex flex-col hover:bg-white/[0.04] transition-colors relative overflow-hidden group backdrop-blur-md">
              <div className="w-10 h-10 bg-white/[0.05] border border-white/10 rounded-xl flex items-center justify-center mb-6">
                <Server className="w-5 h-5 text-zinc-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-medium text-white mb-3 tracking-tight">
                Live Processing Queue
              </h3>
              <p className="text-zinc-400 font-light leading-relaxed text-sm">
                Monitor your webhooks in real-time. Our Developer Console streams active, waiting, and delayed jobs directly from BullMQ so you always know what's processing.
              </p>
            </div>

            {/* Item 2 */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 flex flex-col hover:bg-white/[0.04] transition-colors relative overflow-hidden group backdrop-blur-md">
              <div className="w-10 h-10 bg-white/[0.05] border border-white/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-5 h-5 text-zinc-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-medium text-white mb-3 tracking-tight">
                Fair-Share Limits
              </h3>
              <p className="text-zinc-400 font-light leading-relaxed text-sm">
                Built-in Redis Token Bucket rate-limiting isolates traffic per tenant. One noisy neighbor will never slow down the queue for the rest of your customers.
              </p>
            </div>

            {/* Item 3 */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 flex flex-col hover:bg-white/[0.04] transition-colors relative overflow-hidden group backdrop-blur-md">
              <div className="w-10 h-10 bg-white/[0.05] border border-white/10 rounded-xl flex items-center justify-center mb-6">
                <Database className="w-5 h-5 text-zinc-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-medium text-white mb-3 tracking-tight">
                Multi-Tenancy
              </h3>
              <p className="text-zinc-400 font-light leading-relaxed text-sm">
                Natively built for B2B SaaS. Workspaces and team management powered by Clerk Organizations. Share webhook histories securely.
              </p>
            </div>

            {/* Item 4 - Wide Span */}
            <div className="lg:col-span-3 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center hover:border-white/[0.12] transition-colors relative overflow-hidden group backdrop-blur-md">
              <div className="z-10 relative md:w-1/2 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-medium tracking-wide uppercase mb-6 w-fit">
                  <TestTube className="w-3.5 h-3.5" /> Developer Tools
                </div>
                <h3 className="text-3xl font-medium text-white mb-4 tracking-tight">
                  Built-In Simulator
                </h3>
                <p className="text-zinc-400 font-light leading-relaxed mb-8 max-w-md">
                  A beautiful, intuitive Developer Console to fire test payloads, simulate 500 errors, and observe our fault tolerance mechanisms in real-time.
                </p>
                <Link href="/sign-in" className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-zinc-300 transition-colors group/link w-fit">
                  View the console <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="absolute right-0 bottom-0 md:-right-10 md:-bottom-20 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none duration-700">
                <Terminal className="w-96 h-96 text-white" strokeWidth={1} />
              </div>
            </div>
          </div>
        </section>

        {/* 6. Closing CTA */}
        <section className="py-40 px-6 max-w-4xl mx-auto text-center border-t border-white/[0.05]">
          <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight">
            Ready to scale your webhooks?
          </h2>
          <p className="text-zinc-400 text-lg font-light mb-10 max-w-xl mx-auto">
            Stop losing data to timeouts. Deploy enterprise-grade infrastructure in minutes.
          </p>
          <button className="bg-white text-zinc-950 px-8 py-4 rounded-xl text-sm font-medium hover:bg-zinc-200 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 mx-auto group">
            Start Orchestrating
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </section>
      </main>

      {/* 7. Footer */}
      <footer className="py-10 px-6 md:px-10 border-t border-white/[0.05] bg-[#030303] flex flex-col md:flex-row justify-between items-center gap-6 text-[13px] text-zinc-500 font-light relative z-10">
        <div className="flex items-center gap-2 font-medium text-zinc-400">
          <Activity className="w-4 h-4 text-zinc-600" /> Webhook Orchestrator © 2026
        </div>
        <div className="flex items-center gap-8">
          <a
            href="https://github.com/14-himanshu/webhook-orchestrator"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors flex items-center gap-2 group"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:text-zinc-300 text-zinc-500 transition-colors"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.15-.38 6.5-1.4 6.5-7.17a5.1 5.1 0 0 0-1.5-3.8 4.7 4.7 0 0 0-.1-3.8s-1.1-.3-3.5 1.3a11.5 11.5 0 0 0-6 0C6.9 2.1 5.8 2.4 5.8 2.4a4.7 4.7 0 0 0-.1 3.8 5.1 5.1 0 0 0-1.5 3.8c0 5.76 3.34 6.78 6.5 7.17a4.8 4.8 0 0 0-1 3.03V22"></path><path d="M9 20c-5 1.5-5-2.5-7-3"></path></svg> GitHub
          </a>
          <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.05] bg-white/[0.02]">
            <div className="relative flex h-1.5 w-1.5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            </div>
            <span className="text-zinc-300 font-medium">All Systems Operational</span>
          </div>
        </div>
      </footer>
      
      {/* Custom Keyframe animation for the architecture diagram line */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide {
          0% { left: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
