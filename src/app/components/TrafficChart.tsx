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
      <div className="bg-[#0A0A0A] border border-zinc-800 p-3 rounded-md shadow-lg flex flex-col gap-2 min-w-[140px]">
        <p className="text-[11px] font-medium text-zinc-500 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className={clsx(
                  "w-1.5 h-1.5 rounded-full",
                  entry.name === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
                )}
              ></div>
              <span className="text-xs text-zinc-300 capitalize">
                {entry.name === 'success' ? 'Delivered' : 'Failed'}
              </span>
            </div>
            <span className="text-xs font-semibold text-zinc-100">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function TrafficChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="rounded-xl bg-[#0A0A0A] border border-zinc-800 shadow-sm overflow-hidden p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-zinc-400" />
            Global Webhook Traffic
          </h2>
          <p className="text-[11px] text-zinc-500 mt-1">Real-time event delivery volume (last 60 minutes)</p>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-zinc-400">Delivered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
            <span className="text-zinc-400">Failed</span>
          </div>
        </div>
      </div>

      <div className="w-full mt-4">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#52525b" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#52525b" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#27272a', strokeWidth: 1 }} />
            <Area 
              type="monotone" 
              dataKey="success" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorSuccess)" 
              activeDot={{ r: 4, strokeWidth: 0, fill: '#10b981' }}
            />
            <Area 
              type="monotone" 
              dataKey="failed" 
              stroke="#f43f5e" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorFailed)" 
              activeDot={{ r: 4, strokeWidth: 0, fill: '#f43f5e' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
