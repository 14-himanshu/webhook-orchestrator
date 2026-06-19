'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';
import clsx from 'clsx';

export interface ChartDataPoint {
  time: string;
  success: number;
  failed: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#09090b]/80 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl flex flex-col gap-3 min-w-[160px]">
        <p className="text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div 
                className={clsx(
                  "w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                  entry.name === 'success' ? 'bg-emerald-400' : 'bg-rose-400'
                )}
                style={{ 
                  boxShadow: `0 0 12px ${entry.name === 'success' ? 'rgba(52, 211, 153, 0.6)' : 'rgba(251, 113, 133, 0.6)'}` 
                }}
              ></div>
              <span className="text-[13px] font-medium text-zinc-300 capitalize">
                {entry.name === 'success' ? 'Delivered' : 'Failed'}
              </span>
            </div>
            <span className="text-[14px] font-bold text-white tabular-nums">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function TrafficChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="rounded-2xl bg-[#050505] border border-white/5 shadow-2xl overflow-hidden p-6 relative group transition-all duration-500 hover:border-white/10">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 relative z-10">
        <div>
          <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-widest flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            Global Webhook Traffic
          </h2>
          <p className="text-[11px] text-zinc-500 mt-2 font-medium tracking-wide">Real-time event delivery volume (last 60 minutes)</p>
        </div>
        <div className="flex items-center gap-5 text-xs font-semibold tracking-wider">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
            <span className="text-emerald-300/90">Delivered</span>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.6)]"></div>
            <span className="text-rose-300/90">Failed</span>
          </div>
        </div>
      </div>

      <div className="w-full mt-4 relative z-10">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
              <filter id="shadow" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity="0.5"/>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.4} />
            <XAxis 
              dataKey="time" 
              stroke="#52525b" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              dy={15}
              fontWeight={500}
            />
            <YAxis 
              stroke="#52525b" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              fontWeight={500}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="success" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSuccess)" 
              activeDot={{ r: 5, strokeWidth: 0, fill: '#34d399', style: { filter: 'drop-shadow(0 0 8px rgba(52,211,153,0.8))' } }}
              style={{ filter: 'url(#shadow)' }}
            />
            <Area 
              type="monotone" 
              dataKey="failed" 
              stroke="#f43f5e" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorFailed)" 
              activeDot={{ r: 5, strokeWidth: 0, fill: '#fb7185', style: { filter: 'drop-shadow(0 0 8px rgba(251,113,133,0.8))' } }}
              style={{ filter: 'url(#shadow)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
