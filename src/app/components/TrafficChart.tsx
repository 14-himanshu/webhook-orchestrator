'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';

export interface ChartDataPoint {
  time: string;
  success: number;
  failed: number;
}

export default function TrafficChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="rounded-xl bg-[#0A0A0A] border border-zinc-800 shadow-sm overflow-hidden p-6 relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-zinc-400" />
            Global Webhook Traffic
          </h2>
          <p className="text-[11px] text-zinc-500 mt-1">Real-time event delivery volume (last 60 minutes)</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
            <span className="text-zinc-400">Delivered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
            <span className="text-zinc-400">Failed</span>
          </div>
        </div>
      </div>

      <div className="w-full mt-4">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
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
            <Tooltip 
              contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#e4e4e7' }}
            />
            <Area 
              type="monotone" 
              dataKey="success" 
              stroke="#6366f1" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorSuccess)" 
            />
            <Area 
              type="monotone" 
              dataKey="failed" 
              stroke="#f43f5e" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorFailed)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
